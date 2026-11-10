import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import netlifyApi from '../netlify/functions/api';
import { issueToken, requireAdmin } from '../server/auth';
import { setDb } from '../server/db';
import { handle } from '../server/handler';

// Kiểm thử API trên Postgres thật (PGlite chạy trong bộ nhớ) bằng đúng schema.sql + seed.sql sẽ chạy trên Supabase.
// Chạy: npm run test:api

process.env.ADMIN_PASSWORD = 'pw-test';
process.env.SESSION_SECRET = 'secret-for-tests-only';

const pg = new PGlite();
await pg.exec(readFileSync('supabase/schema.sql', 'utf8'));
await pg.exec(readFileSync('supabase/seed.sql', 'utf8'));
setDb({
  query: async (sql, params = []) => (await pg.query(sql, params as never[])).rows as never,
  transaction: (fn) =>
    pg.transaction((tx) =>
      fn({ query: async (sql, params = []) => (await tx.query(sql, params as never[])).rows as never }),
    ),
});

let failed = 0;
let passed = 0;
function check(name: string, ok: boolean, detail?: unknown) {
  if (ok) passed++;
  else {
    failed++;
    console.error(`FAIL  ${name}`, detail ?? '');
  }
}

type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const call = (method: string, path: string, body?: unknown, token?: string) =>
  handle({
    method,
    path,
    headers: token ? { authorization: `Bearer ${token}` } : {},
    body: body === undefined ? '' : typeof body === 'string' ? body : JSON.stringify(body),
  }) as Promise<{ status: number; body: Json }>;

const customer = { name: 'Test', phone: '0900000000', address: 'So 1 Dai Co Viet, Hai Ba Trung, Ha Noi' };
const order = (lines: { variantId: string; quantity: number }[], c: unknown = customer) => call('POST', '/api/orders', { lines, customer: c });

// ---- Chạy lại seed: cập nhật nội dung (ảnh) nhưng giữ giá/tồn kho đã chỉnh
await pg.query("update variants set price = 12345, stock = 3 where id = 'dm-a-m-grey'");
await pg.query("update products set images = '[]'::jsonb where id = 'p-dm-a'");
await pg.exec(readFileSync('supabase/seed.sql', 'utf8'));
const reseeded = (await pg.query<{ price: number; stock: number }>("select price, stock from variants where id = 'dm-a-m-grey'")).rows[0];
const reseededImages = (await pg.query<{ n: number }>("select jsonb_array_length(images) as n from products where id = 'p-dm-a'")).rows[0];
check('seed chạy lại giữ giá và tồn kho đã chỉnh', reseeded.price === 12345 && reseeded.stock === 3, reseeded);
check('seed chạy lại cập nhật ảnh sản phẩm', reseededImages.n > 0, reseededImages);
await pg.query("update variants set price = 249000, stock = 20 where id = 'dm-a-m-grey'");

// ---- Catalog công khai
let r = await call('GET', '/api/catalog');
check('catalog 200', r.status === 200, r.body);
check('catalog có 15 sản phẩm', r.body.products?.length === 15);
check('catalog có đơn vị tiền', r.body.currency === 'VND');
check('catalog không lộ số tồn kho', r.body.products.every((p: Json) => p.variants.every((v: Json) => !('stock' in v) && v.inStock === true)));
check('đường dẫn Netlify cũng chạy', (await call('GET', '/.netlify/functions/api/catalog')).status === 200);
check('có dấu / cuối vẫn chạy', (await call('GET', '/api/catalog/')).status === 200);

// ---- Admin đăng nhập
check('admin không token → 401', (await call('GET', '/api/admin/orders')).status === 401);
check('sai mật khẩu → 401', (await call('POST', '/api/admin/login', { password: 'x' })).status === 401);
r = await call('POST', '/api/admin/login', { password: 'pw-test' });
check('đúng mật khẩu → token', r.status === 200 && typeof r.body.token === 'string', r.body);
const token: string = r.body.token;
check('token giả → 401', (await call('GET', '/api/admin/orders', undefined, token.slice(0, -3) + 'abc')).status === 401);
check('token tự chế → 401', (await call('GET', '/api/admin/orders', undefined, 'eyJleHAiOjk5OTk5OTk5OTk5OTl9.xxxx')).status === 401);
let expired = false;
try {
  requireAdmin(`Bearer ${issueToken(Date.now() - 9 * 3600_000)}`);
} catch {
  expired = true;
}
check('token hết hạn → từ chối', expired);

const stockOf = async (id: string): Promise<number> => {
  const p = await call('GET', '/api/admin/products', undefined, token);
  return p.body.flatMap((x: Json) => x.variants).find((v: Json) => v.id === id).stock;
};

// ---- Đặt đơn
r = await order([{ variantId: 'bd-d-std', quantity: 2 }]);
check('đặt bộ → 201', r.status === 201, r.body);
check('server tính giá: 2 × 319000', r.body.subtotal === 638000, r.body.subtotal);
check('mã đơn OD-', /^OD-[0-9A-F]{8}$/.test(r.body.code), r.body.code);
check('đơn vừa đặt kèm SĐT/địa chỉ cho chính người đặt', r.body.customerPhone === customer.phone && r.body.customerAddress === customer.address, r.body);
check('thành phần bộ có tên', r.body.lines[0].components.length === 2, r.body.lines[0].components);
check('trừ kho bộ: 20 → 18', (await stockOf('bd-d-std')) === 18);
const code: string = r.body.code;

check('thiếu tên → 400', (await order([{ variantId: 'dm-a-m-grey', quantity: 1 }], { ...customer, name: ' ' })).status === 400);
check('số lượng 0 → 400', (await order([{ variantId: 'dm-a-m-grey', quantity: 0 }])).status === 400);
check('số lượng 100 → 400', (await order([{ variantId: 'dm-a-m-grey', quantity: 100 }])).status === 400);
check('số lượng 1.5 → 400', (await order([{ variantId: 'dm-a-m-grey', quantity: 1.5 }])).status === 400);
check('giỏ rỗng → 400', (await order([])).status === 400);
check('variant không tồn tại → 400', (await order([{ variantId: 'khong-co', quantity: 1 }])).status === 400);
check('sản phẩm chưa có giá → 400', (await order([{ variantId: 'dm-b-std', quantity: 1 }])).status === 400);
check('JSON hỏng → 400', (await call('POST', '/api/orders', '{bad')).status === 400);

// Quá tồn kho: đơn nhiều dòng thất bại giữa chừng thì dòng đầu phải được hoàn (rollback).
const before = await stockOf('dm-a-m-grey');
r = await order([{ variantId: 'dm-a-m-grey', quantity: 1 }, { variantId: 'cb-c-3', quantity: 50 }]);
check('quá tồn kho → 409', r.status === 409, r.body);
check('rollback: dòng đầu không bị trừ', (await stockOf('dm-a-m-grey')) === before, await stockOf('dm-a-m-grey'));

// Hai đơn đồng thời cùng tranh 5 món còn lại → chỉ một đơn thành công.
await call('PATCH', '/api/admin/variants/cb-c-5', { stock: 5 }, token);
const [a, b] = await Promise.all([order([{ variantId: 'cb-c-5', quantity: 3 }]), order([{ variantId: 'cb-c-5', quantity: 3 }])]);
check('đồng thời: đúng một đơn thành công', [a.status, b.status].sort().join() === '201,409', [a.status, b.status]);
check('đồng thời: tồn kho còn 2 (không âm)', (await stockOf('cb-c-5')) === 2);

// ---- Tra cứu & admin
const lookup = (c: string, phone: unknown) => call('POST', '/api/orders/lookup', { code: c, phone });
r = await lookup(code.toLowerCase(), customer.phone);
check('tra cứu bằng mã + SĐT (không phân biệt hoa thường)', r.status === 200 && r.body.code === code, r.body);
check('tra cứu đúng SĐT thấy cả địa chỉ nhận hàng', r.body.customerAddress === customer.address && r.body.customerPhone === customer.phone);
check('tra cứu: SĐT viết +84 và có dấu cách vẫn khớp', (await lookup(code, '+84 900 000 000')).status === 200);
check('tra cứu: mã nhập thiếu OD- vẫn tìm được', (await lookup(code.slice(3), customer.phone)).status === 200);
check('tra cứu sai SĐT → 404', (await lookup(code, '0911111111')).status === 404);
check('tra cứu thiếu SĐT → 404', (await lookup(code, undefined)).status === 404);
check('tra cứu SĐT sai và mã sai cùng một thông báo', (await lookup(code, '0911111111')).body.error === (await lookup('OD-NOPE', customer.phone)).body.error);
check('mã không có → 404', (await lookup('OD-NOPE', customer.phone)).status === 404);
check('GET /api/orders/:mã không còn công khai → 404', (await call('GET', `/api/orders/${code}`)).status === 404);
r = await call('GET', '/api/admin/orders', undefined, token);
const mine = r.body.find((o: Json) => o.code === code);
check('admin thấy SĐT và địa chỉ', mine?.customerPhone === customer.phone && mine?.customerAddress === customer.address, mine);

// ---- Trạng thái
check('pending → completed bị chặn', (await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'completed' }, token)).status === 409);
check('trạng thái lạ → 400', (await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'abc' }, token)).status === 400);
check('pending → confirmed', (await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'confirmed' }, token)).body.status === 'confirmed');
check('hủy đơn', (await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'cancelled' }, token)).body.status === 'cancelled');
check('hủy đơn hoàn kho: 18 → 20', (await stockOf('bd-d-std')) === 20);
check('đơn đã hủy không đổi nữa', (await call('PATCH', `/api/admin/orders/${code}/status`, { status: 'confirmed' }, token)).status === 409);
check('đơn không tồn tại → 404', (await call('PATCH', '/api/admin/orders/OD-NOPE/status', { status: 'confirmed' }, token)).status === 404);

// ---- Kiểm tra thông tin khách
const one = [{ variantId: 'tr-l-black', quantity: 1 }];
check('SĐT sai định dạng → 400', (await order(one, { ...customer, phone: '12345' })).status === 400);
check('SĐT chữ → 400', (await order(one, { ...customer, phone: 'abc' })).status === 400);
check('địa chỉ quá ngắn → 400', (await order(one, { ...customer, address: 'Ha Noi' })).status === 400);
check('họ tên 1 ký tự → 400', (await order(one, { ...customer, name: 'A' })).status === 400);
r = await order(one, { ...customer, phone: '+84 901 234 567' });
check('SĐT +84 được lưu ở dạng 0901234567', r.status === 201 && r.body.customerPhone === '0901234567', r.body);
const mineCode: string = r.body.code;

// ---- Khách tự hủy đơn
const cancel = (c: string, phone: unknown) => call('POST', '/api/orders/cancel', { code: c, phone });
const stockBefore = await stockOf('tr-l-black');
check('đặt đơn trừ kho: 20 → 19', stockBefore === 19, stockBefore);
check('hủy sai SĐT → 404 và không đổi gì', (await cancel(mineCode, '0911111111')).status === 404 && (await stockOf('tr-l-black')) === stockBefore);
r = await cancel(mineCode, '0901 234 567');
check('khách hủy đơn đang chờ xác nhận', r.status === 200 && r.body.status === 'cancelled', r.body);
check('hủy đơn hoàn kho', (await stockOf('tr-l-black')) === stockBefore + 1);
check('hủy lần hai → 409', (await cancel(mineCode, '0901234567')).status === 409);
r = await order(one, customer);
const confirmedCode: string = r.body.code;
await call('PATCH', `/api/admin/orders/${confirmedCode}/status`, { status: 'confirmed' }, token);
check('đơn đã xác nhận không tự hủy được → 409', (await cancel(confirmedCode, customer.phone)).status === 409);
check('đơn đã xác nhận vẫn tra cứu được', (await lookup(confirmedCode, customer.phone)).body.status === 'confirmed');

// ---- Sửa giá / tồn kho
r = await call('PATCH', '/api/admin/variants/dm-a-m-grey', { price: 260000, stock: 7 }, token);
check('sửa giá và tồn kho', r.status === 200 && r.body.price === 260000 && r.body.stock === 7, r.body);
check('tồn kho âm bị chặn', (await call('PATCH', '/api/admin/variants/dm-a-m-grey', { stock: -1 }, token)).status === 400);
check('giá chữ bị chặn', (await call('PATCH', '/api/admin/variants/dm-a-m-grey', { price: 'abc' }, token)).status === 400);
check('đơn cũ giữ giá lúc đặt', (await lookup(code, customer.phone)).body.subtotal === 638000);
await call('PATCH', '/api/admin/variants/dm-a-m-grey', { stock: 0 }, token);
check('hết hàng → inStock=false', (await call('GET', '/api/catalog')).body.products[0].variants.find((v: Json) => v.id === 'dm-a-m-grey').inStock === false);
check('hết hàng → không đặt được', (await order([{ variantId: 'dm-a-m-grey', quantity: 1 }])).status === 409);

// ---- Netlify Function (Request/Response thật)
const fnCatalog = await netlifyApi(new Request('https://site.netlify.app/api/catalog'));
check('function: GET /api/catalog → 200 JSON', fnCatalog.status === 200 && fnCatalog.headers.get('content-type')?.includes('application/json') === true);
check('function: không cache', fnCatalog.headers.get('cache-control') === 'no-store');
const fnOrder = await netlifyApi(
  new Request('https://site.netlify.app/api/orders', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ lines: [{ variantId: 'cb-c-3', quantity: 1 }], customer }),
  }),
);
check('function: POST /api/orders → 201', fnOrder.status === 201, await fnOrder.clone().text());
const fnLogin = await netlifyApi(
  new Request('https://site.netlify.app/.netlify/functions/api/admin/login', { method: 'POST', body: JSON.stringify({ password: 'pw-test' }) }),
);
check('function: đăng nhập admin qua đường dẫn function', fnLogin.status === 200 && typeof (await fnLogin.json()).token === 'string');

// ---- Khác
check('API lạ → 404', (await call('GET', '/api/khong-co')).status === 404);
check('admin API lạ → 404', (await call('GET', '/api/admin/khong-co', undefined, token)).status === 404);
delete process.env.ADMIN_PASSWORD;
check('chưa đặt ADMIN_PASSWORD → 503', (await call('POST', '/api/admin/login', { password: 'x' })).status === 503);

console.log(`${passed} đạt, ${failed} lỗi`);
process.exit(failed ? 1 : 0);
