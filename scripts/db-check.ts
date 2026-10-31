import { getDb } from '../server/db';

// Kiểm tra kết nối tới DATABASE_URL (chỉ đọc, không ghi gì, không in chuỗi kết nối). Chạy: npm run db:check
const TABLES = ['settings', 'products', 'variants', 'orders', 'order_lines'];

const missing = ['DATABASE_URL', 'ADMIN_PASSWORD', 'SESSION_SECRET'].filter((k) => !process.env[k]?.trim());
if (missing.includes('DATABASE_URL')) {
  console.error('Thiếu DATABASE_URL trong .env.');
  process.exit(1);
}

try {
  const db = getDb();
  const [info] = await db.query<{ db: string; version: string }>('select current_database() as db, version() as version');
  console.log(`Kết nối thành công tới database "${info.db}".`);

  const found = await db.query<{ table_name: string }>(
    "select table_name from information_schema.tables where table_schema = 'public' and table_name = any($1)",
    [TABLES],
  );
  const have = new Set(found.map((r) => r.table_name));
  const absent = TABLES.filter((t) => !have.has(t));
  if (absent.length) {
    console.log(`Chưa có bảng: ${absent.join(', ')}. Hãy chạy supabase/schema.sql rồi supabase/seed.sql trong Supabase SQL Editor.`);
  } else {
    for (const t of TABLES) {
      const [row] = await db.query<{ n: number }>(`select count(*)::int as n from ${t}`);
      console.log(`  ${t}: ${row.n} dòng`);
    }
    const [products] = await db.query<{ n: number }>('select count(*)::int as n from products');
    if (products.n === 0) console.log('Bảng đã có nhưng chưa có sản phẩm. Hãy chạy supabase/seed.sql.');
  }
} catch (err) {
  const e = err as { code?: string; message?: string };
  console.error(`Không kết nối được: ${e.message ?? err}${e.code ? ` (mã ${e.code})` : ''}`);
  console.error('Gợi ý: xem mục "Xử lý sự cố" trong docs/DEPLOY.md.');
  process.exitCode = 1;
}

if (missing.length) console.log(`Lưu ý: .env còn thiếu ${missing.join(', ')}.`);
process.exit(process.exitCode ?? 0);
