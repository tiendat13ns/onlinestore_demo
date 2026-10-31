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

const customer = { name: 'Test', phone: '0900000000', address: 'Dia chi' };
const order = (lines: { variantId: string; quantity: number }[], c: unknown = customer) => call('POST', '/api/orders', { lines, customer: c });

// ---- Catalog công khai
let r = await call('GET', '/api/catalog');
check('catalog 200', r.status === 200, r.body);
check('catalog có 4 sản phẩm', r.body.products?.length === 4);
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
check('đơn không lộ SĐT/địa chỉ', !('customerPhone' in r.body) && !('customerAddress' in r.body));
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
r = await call('GET', `/api/orders/${code.toLowerCase()}`);
check('tra cứu theo mã (không phân biệt hoa thường)', r.status === 200 && r.body.code === code, r.body);
check('tra cứu công khai không lộ liên hệ', !('customerPhone' in r.body));
check('mã không có → 404', (await call('GET', '/api/orders/OD-NOPE')).status === 404);
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

// ---- Sửa giá / tồn kho
r = await call('PATCH', '/api/admin/variants/dm-a-m-grey', { price: 260000, stock: 7 }, token);
check('sửa giá và tồn kho', r.status === 200 && r.body.price === 260000 && r.body.stock === 7, r.body);
check('tồn kho âm bị chặn', (await call('PATCH', '/api/admin/variants/dm-a-m-grey', { stock: -1 }, token)).status === 400);
check('giá chữ bị chặn', (await call('PATCH', '/api/admin/variants/dm-a-m-grey', { price: 'abc' }, token)).status === 400);
check('đơn cũ giữ giá lúc đặt', (await call('GET', `/api/orders/${code}`)).body.subtotal === 638000);
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
