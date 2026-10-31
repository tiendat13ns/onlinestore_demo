import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

// Kiểm thử đường đi THẬT qua driver `pg` (pool, transaction, parse jsonb): dựng Postgres giả giao thức mạng bằng PGlite,
// rồi chạy cùng bộ kiểm thử với DATABASE_URL trỏ vào đó. Chạy: npm run test:pg
const PORT = 54329;
const db = new PGlite();
await db.exec(readFileSync('supabase/schema.sql', 'utf8'));
await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
const server = new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1' });
await server.start();

process.env.DATABASE_URL = `postgresql://postgres:postgres@localhost:${PORT}/postgres`;
process.env.ADMIN_PASSWORD = 'pw-test';
process.env.SESSION_SECRET = 'secret-for-tests-only';

const { handle } = await import('../server/handler');
let failed = 0;
let passed = 0;
const check = (name: string, ok: boolean, detail?: unknown) => {
  if (ok) passed++;
  else {
    failed++;
    console.error('FAIL ', name, detail ?? '');
  }
};
type Json = any; // eslint-disable-line @typescript-eslint/no-explicit-any
const call = (method: string, path: string, body?: unknown, token?: string) =>
  handle({ method, path, headers: token ? { authorization: `Bearer ${token}` } : {}, body: body === undefined ? '' : JSON.stringify(body) }) as Promise<{ status: number; body: Json }>;

try {
  const cat = await call('GET', '/api/catalog');
  check('pg: catalog 200', cat.status === 200, cat.body);
  check('pg: jsonb được parse thành object', Array.isArray(cat.body.products?.[0]?.variants) && typeof cat.body.products[0].variants[0].attributes === 'object');

  const login = await call('POST', '/api/admin/login', { password: 'pw-test' });
  const token: string = login.body.token;
  check('pg: đăng nhập admin', login.status === 200 && !!token);

  const o = await call('POST', '/api/orders', {
    lines: [{ variantId: 'bd-d-std', quantity: 1 }, { variantId: 'dm-a-m-black', quantity: 2 }],
    customer: { name: 'Test', phone: '0900000000', address: 'Dia chi' },
  });
  check('pg: đặt đơn nhiều dòng → 201', o.status === 201, o.body);
  check('pg: subtotal đúng (319000 + 2×249000)', o.body.subtotal === 319000 + 2 * 249000, o.body.subtotal);
  check('pg: createdAt là ISO', !Number.isNaN(Date.parse(o.body.createdAt)) && o.body.createdAt.endsWith('Z'), o.body.createdAt);

  const over = await call('POST', '/api/orders', {
    lines: [{ variantId: 'dm-a-m-grey', quantity: 1 }, { variantId: 'cb-c-3', quantity: 50 }],
    customer: { name: 'Test', phone: '1', address: 'x' },
  });
  check('pg: quá tồn kho → 409', over.status === 409, over.body);
  const prods = await call('GET', '/api/admin/products', undefined, token);
  const grey = prods.body.flatMap((p: Json) => p.variants).find((v: Json) => v.id === 'dm-a-m-grey');
  check('pg: rollback hoàn dòng đầu (còn 20)', grey.stock === 20, grey.stock);

  const orders = await call('GET', '/api/admin/orders', undefined, token);
  check('pg: admin thấy đơn kèm dòng hàng', orders.body.length === 1 && orders.body[0].lines.length === 2, orders.body);

  const cancel = await call('PATCH', `/api/admin/orders/${o.body.code}/status`, { status: 'cancelled' }, token);
  check('pg: hủy đơn', cancel.status === 200 && cancel.body.status === 'cancelled', cancel.body);
  const after = await call('GET', '/api/admin/products', undefined, token);
  const black = after.body.flatMap((p: Json) => p.variants).find((v: Json) => v.id === 'dm-a-m-black');
  check('pg: hủy đơn hoàn kho (20)', black.stock === 20, black.stock);

  // 5 đơn đồng thời trên 1 pool: không treo, tồn kho không âm.
  await call('PATCH', '/api/admin/variants/cb-c-5', { stock: 2 }, token);
  const burst = await Promise.all(
    Array.from({ length: 5 }, () =>
      call('POST', '/api/orders', { lines: [{ variantId: 'cb-c-5', quantity: 1 }], customer: { name: 'T', phone: '1', address: 'x' } }),
    ),
  );
  const ok = burst.filter((x) => x.status === 201).length;
  check('pg: 5 đơn đồng thời giành 2 món → đúng 2 thành công', ok === 2, burst.map((x) => x.status));
} finally {
  await server.stop();
  await db.close();
}

console.log(`${passed} đạt, ${failed} lỗi`);
process.exit(failed ? 1 : 0);
