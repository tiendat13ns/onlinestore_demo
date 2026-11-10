import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';
import { PGLiteSocketServer } from '@electric-sql/pglite-socket';

// API chạy thử ở máy với database TRONG BỘ NHỚ (PGlite) nạp từ schema.sql + seed.sql.
// Dùng để xem catalog mới (ảnh, biến thể) mà không cần Supabase và không ghi vào database thật.
// Dữ liệu mất khi tắt. Chạy: npm run dev:local  (admin: mật khẩu "local").
const PORT = 54331;
process.env.PORT ??= '3002';
const db = new PGlite();
await db.exec(readFileSync('supabase/schema.sql', 'utf8'));
await db.exec(readFileSync('supabase/seed.sql', 'utf8'));
await new PGLiteSocketServer({ db, port: PORT, host: '127.0.0.1' }).start();

process.env.DATABASE_URL = `postgresql://postgres:postgres@localhost:${PORT}/postgres`;
process.env.ADMIN_PASSWORD = 'local';
process.env.SESSION_SECRET = 'local-dev-secret';
console.log('[local] database trong bộ nhớ đã nạp seed.sql');
await import("../server/dev");
