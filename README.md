# Gaming Setup Decor — demo

> Student project – E-Business, Hanoi University
> Website concept phục vụ học tập, không bán hàng thật. Không thanh toán, không giao hàng, chỉ nhập dữ liệu giả.

Storefront demo cho deskmat, phụ kiện quản lý dây và bộ sản phẩm. Đặc tả đầy đủ: [OnlineStore_Requirements.md](OnlineStore_Requirements.md).

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

- Danh mục có lọc nhóm và sắp xếp giá, chi tiết sản phẩm với biến thể, giỏ hàng, checkout mô phỏng
- Đơn lưu vào DB, trừ tồn kho, xem lại ở `/orders`
- `/admin`: xem đơn và đổi trạng thái, sửa giá và tồn kho

## Lưu ý

- Dữ liệu catalog là fixture kiểm thử ([src/data/catalog.ts](src/data/catalog.ts)), nạp vào DB lần chạy đầu. Muốn nạp lại thì xóa `data/store.db`.
- Thương hiệu, giá thật, thông số và chính sách vẫn là "Cần nhóm xác nhận".
