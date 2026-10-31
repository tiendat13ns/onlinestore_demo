import { readFileSync } from 'node:fs';
import { getDb } from '../server/db';

// Tạo bảng và nạp sản phẩm mẫu vào DATABASE_URL: chạy supabase/schema.sql rồi supabase/seed.sql trong MỘT transaction.
// Chạy lại an toàn: schema dùng "if not exists", seed dùng "on conflict do nothing" (không ghi đè giá/tồn kho đã chỉnh).
// Chạy: npm run db:setup

if (!process.env.DATABASE_URL?.trim()) {
  console.error('Thiếu DATABASE_URL trong .env.');
  process.exit(1);
}

try {
  const db = getDb();
  await db.transaction(async (tx) => {
    await tx.query(readFileSync('supabase/schema.sql', 'utf8'));
    await tx.query(readFileSync('supabase/seed.sql', 'utf8'));
  });
  console.log('Đã tạo bảng và nạp dữ liệu mẫu. Chạy `npm run db:check` để xác nhận.');
  process.exit(0);
} catch (err) {
  const e = err as { code?: string; message?: string };
  console.error(`Thất bại, không có thay đổi nào được lưu: ${e.message ?? err}${e.code ? ` (mã ${e.code})` : ''}`);
  process.exit(1);
}
