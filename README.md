# Nook Studio

Cửa hàng deskmat, phụ kiện quản lý dây và bộ sản phẩm cho góc làm việc. Tên thương hiệu đổi ở [src/config.ts](src/config.ts). Đặc tả: [OnlineStore_Requirements.md](OnlineStore_Requirements.md).

## Công nghệ

- Frontend: React + TypeScript + Vite + React Router (font tự host qua Fontsource)
- API: Netlify Functions (TypeScript) dùng chung một handler với server chạy thử ở máy
- Dữ liệu: Postgres trên Supabase (`pg`)
- Phát hành: Netlify, nhánh `master`. Viết code trên nhánh `main`

## Chạy ở máy

```bash
npm install
copy .env.example .env     # điền DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET
npm run dev                # web http://localhost:5173, API http://localhost:3001
```

Chạy kiểm thử (không cần mạng): `npm test`.

Hướng dẫn tạo Supabase, cấu hình Netlify và biến môi trường: [docs/DEPLOY.md](docs/DEPLOY.md).

## Cấu trúc

| Thư mục | Nội dung |
| --- | --- |
| `src/` | Giao diện |
| `server/` | Logic API (`handler.ts` là điểm vào chung), truy cập DB, xác thực admin |
| `netlify/functions/api.ts` | Netlify Function bọc `server/handler.ts` |
| `supabase/` | `schema.sql` và `seed.sql` để chạy trong Supabase SQL Editor |
| `scripts/` | Sinh seed từ catalog, kiểm thử API |

## Tính năng

- Danh mục có lọc nhóm và sắp xếp giá, chi tiết sản phẩm với biến thể, giỏ hàng, đặt hàng (COD)
- Đơn lưu vào DB, trừ tồn kho trong transaction (không bán quá tồn), xem lại ở `/orders`
- `/admin` (không có link công khai): xem đơn và đổi trạng thái, sửa giá và tồn kho

## Lưu ý

- Sản phẩm mẫu nằm ở [src/data/catalog.ts](src/data/catalog.ts); sửa xong chạy `npm run db:seed-sql` để sinh lại `supabase/seed.sql`.
- Ảnh: bỏ file vào `public/images` rồi điền `src` cho từng ảnh trong catalog.
- Nội dung chính sách nằm ở [src/pages/Policies.tsx](src/pages/Policies.tsx).
