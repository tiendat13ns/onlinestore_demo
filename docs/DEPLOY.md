# Deploy: Netlify + Supabase

Giao diện và API chạy trên **Netlify** (API là Netlify Function), dữ liệu nằm trong **Postgres của Supabase**.
Nhánh `main` là nhánh viết code, nhánh `master` là nhánh Netlify build và phát hành.

Bạn cần tự điền **3 giá trị bí mật**: `DATABASE_URL`, `ADMIN_PASSWORD`, `SESSION_SECRET`. Không dán chúng vào code, chat hay commit.

## 1. Supabase

1. Vào [supabase.com](https://supabase.com), tạo project mới. Chọn vùng gần bạn (ví dụ Singapore). **Ghi lại mật khẩu database** bạn đặt lúc tạo.
2. Mở **SQL Editor**, tạo query mới:
   1. Dán toàn bộ [supabase/schema.sql](../supabase/schema.sql), bấm **Run**.
   2. Dán toàn bộ [supabase/seed.sql](../supabase/seed.sql) (4 sản phẩm mẫu, mỗi mẫu tồn kho 20), bấm **Run**.
3. Lấy chuỗi kết nối: bấm **Connect** (đầu trang project), chọn **Transaction pooler**, sao chép chuỗi `URI`.
   Dạng: `postgresql://postgres.<mã-project>:[YOUR-PASSWORD]@aws-0-<vùng>.pooler.supabase.com:6543/postgres`
   - Thay `[YOUR-PASSWORD]` bằng mật khẩu database. Nếu mật khẩu có ký tự đặc biệt (`@ : / ? #`) phải mã hóa URL (ví dụ `@` thành `%40`).
   - Phải là **Transaction pooler, cổng 6543**. Dùng kết nối trực tiếp (cổng 5432) trên serverless sẽ nhanh chóng hết số kết nối.

Bảng đã bật Row Level Security và không có policy nào, nên khóa `anon` của Supabase không đọc được dữ liệu khách hàng. Project này **không dùng** khóa anon/service_role.

## 2. Netlify

1. **Add new site, Import an existing project**, chọn GitHub và repo này.
2. Build settings (khớp với màn hình bạn đã mở):

   | Mục | Giá trị |
   | --- | --- |
   | Branch to deploy | `master` |
   | Base directory | (để trống) |
   | Build command | `npm run build` |
   | Publish directory | `dist` |
   | Functions directory | `netlify/functions` |

   Các giá trị này cũng đã có sẵn trong [netlify.toml](../netlify.toml), cùng với `NODE_VERSION=22` và các luật chuyển `/api/*` và SPA.

3. **Site configuration, Environment variables**, thêm 3 biến (scope: *All scopes*, hoặc ít nhất *Builds* và *Functions*):

   | Biến | Giá trị |
   | --- | --- |
   | `DATABASE_URL` | Chuỗi Transaction pooler ở bước 1.3 |
   | `ADMIN_PASSWORD` | Mật khẩu đăng nhập `/admin`, đặt dài và khó đoán |
   | `SESSION_SECRET` | Chuỗi ngẫu nhiên, tạo bằng `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` |

4. **Deploy site**. Sau khi xong, kiểm tra:
   - `https://<tên-site>.netlify.app/api/catalog` trả về JSON có 4 sản phẩm.
   - Trang chủ hiện sản phẩm; mở thẳng `/products/deskmat-slate` không bị 404.
   - `/admin` đăng nhập được bằng `ADMIN_PASSWORD`; đặt thử một đơn rồi xem trong tab Đơn hàng.

Nếu quên điền biến môi trường trước khi deploy, thêm xong rồi vào **Deploys, Trigger deploy, Clear cache and deploy site**.

## 3. Quy trình hằng ngày

```
# viết code trên main
git add -A && git commit -m "..." && git push origin main

# khi muốn phát hành: đưa main sang master, Netlify tự build
git checkout master && git merge main && git push origin master && git checkout main
```

## 4. Chạy ở máy

```
copy .env.example .env      # rồi điền DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET
npm install
npm run dev                 # web http://localhost:5173, API http://localhost:3001
```

Nên dùng một project Supabase riêng (hoặc bảng riêng) cho môi trường thử để không lẫn đơn thử với đơn thật.

Kiểm thử không cần kết nối mạng (chạy Postgres trong bộ nhớ):

```
npm run test:api    # logic API trên schema.sql + seed.sql
npm run test:pg     # cùng bộ kiểm thử qua driver pg thật
```

Sau khi sửa [src/data/catalog.ts](../src/data/catalog.ts), chạy `npm run db:seed-sql` để sinh lại `supabase/seed.sql`.
File seed không ghi đè giá và tồn kho đã chỉnh trong `/admin` (`on conflict do nothing`); muốn nạp lại sản phẩm thì xóa dòng đó trong bảng tương ứng trước.

## 5. Xử lý sự cố

| Triệu chứng | Nguyên nhân thường gặp |
| --- | --- |
| Trang báo "Không tải được danh sách sản phẩm" | `DATABASE_URL` sai/thiếu, hoặc chưa chạy `schema.sql`/`seed.sql`. Xem **Functions, api, Logs** trên Netlify |
| `Tenant or user not found` trong log | Tên người dùng pooler phải là `postgres.<mã-project>`, không phải `postgres` |
| `password authentication failed` | Sai mật khẩu, hoặc mật khẩu có ký tự đặc biệt chưa mã hóa URL |
| `/admin` báo "Khu quản trị chưa được cấu hình" | Chưa đặt `ADMIN_PASSWORD` (và `SESSION_SECRET`) trên Netlify, hoặc chưa deploy lại sau khi đặt |
| `/api/...` ra HTML trang chủ | Luật `/api/*` bị đặt sau luật SPA; giữ nguyên thứ tự trong `netlify.toml` |
| Lần mở trang đầu rất chậm | Gói miễn phí của Supabase tạm dừng project khi lâu không dùng; vào dashboard bấm **Restore**. Hãy mở trang trước giờ trình bày |
| Quên mật khẩu admin | Đổi `ADMIN_PASSWORD` trên Netlify rồi deploy lại; mọi phiên đăng nhập cũ hết hiệu lực nếu đổi cả `SESSION_SECRET` |

## 6. Lưu ý bảo mật

- Đơn hàng chứa họ tên, SĐT, địa chỉ do khách nhập. Chỉ admin xem được; tra cứu công khai theo mã đơn không trả SĐT và địa chỉ.
- Phiên admin hết hạn sau 8 giờ. Token là chuỗi tự ký (HMAC), không lưu phía server, nên cần `SESSION_SECRET` đủ dài và bí mật.
- Đăng nhập sai bị làm chậm 0,5 giây mỗi lần. Đây chưa phải chống dò mật khẩu đầy đủ, nên hãy dùng mật khẩu dài.
- Trang quyền riêng tư đang mô tả đúng việc lưu dữ liệu này; nếu bạn thêm dịch vụ bên thứ ba (phân tích, email…) phải cập nhật lại.
