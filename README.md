# Nook Studio

Cửa hàng deskmat, phụ kiện quản lý dây và bộ sản phẩm cho góc làm việc. Tên thương hiệu đổi ở [src/config.ts](src/config.ts). Đặc tả: [OnlineStore_Requirements.md](OnlineStore_Requirements.md).

## Công nghệ

- Frontend: React + TypeScript + Vite + React Router
- Backend: Express + SQLite (`node:sqlite`, cần Node 22.13+)

## Chạy

```bash
npm install
npm run dev        # web http://localhost:5173, API http://localhost:3001
```

Production:

```bash
npm run build
npm start          # server phục vụ dist/ và API tại http://localhost:3001
```

## Cấu hình (biến môi trường)

| Biến | Mặc định | Ý nghĩa |
| --- | --- | --- |
| `PORT` | `3001` | Cổng server |
| `DB_PATH` | `data/store.db` | File SQLite |
| `ADMIN_PASSWORD` | `admin-demo` | Mật khẩu `/admin` (đổi khi triển khai) |

## Tính năng

- Danh mục có lọc nhóm và sắp xếp giá, chi tiết sản phẩm với biến thể, giỏ hàng, đặt hàng (COD)
- Đơn lưu vào DB, trừ tồn kho, xem lại ở `/orders`
- `/admin` (không có link công khai): xem đơn và đổi trạng thái, sửa giá và tồn kho

## Lưu ý

- Sản phẩm mẫu nằm ở [src/data/catalog.ts](src/data/catalog.ts), được nạp vào DB lần chạy đầu. Muốn nạp lại thì xóa `data/store.db`.
- Ảnh: bỏ file vào `public/images` rồi điền `src` cho từng ảnh trong catalog.
- Nội dung chính sách nằm ở [src/pages/Policies.tsx](src/pages/Policies.tsx).
