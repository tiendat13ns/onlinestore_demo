# Đặc tả yêu cầu website Gaming Setup Decor

- Tên file: `OnlineStore_Requirements.md`
- Phiên bản: 1.0 — ngày 31/10/2026 (giờ Việt Nam).
- Mục đích: bàn giao yêu cầu cho lập trình viên; chưa triển khai code.
- Phạm vi: website sinh viên E-Business, concept Gaming Setup Decor phong cách clean; deskmat, phụ kiện quản lý dây và bộ sản phẩm.
- Thương hiệu của nhóm: **Cần nhóm xác nhận**. Không tự dùng tên từ dự án khác.

## 1. Quy ước nguồn và mức độ bắt buộc

Tài liệu sử dụng ba nhãn:

- **[QS] Quan sát**: nội dung hoặc kết quả tương tác thực sự thấy trên Orbitkey trong phiên khảo sát. Đây là dữ liệu tham khảo, không mặc nhiên là yêu cầu phải làm.
- **[ĐX] Đề xuất triển khai**: thiết kế giữ lại, đơn giản hóa hoặc thay đổi cho website nhóm. Các quy tắc hành vi trong phần 4–13 là phạm vi triển khai đề xuất để developer có căn cứ rõ ràng; nhóm cần duyệt trước khi chốt baseline.
- **[BT] Yêu cầu riêng của bài tập theo người dùng**: ràng buộc bắt buộc trong yêu cầu hiện tại. Chưa đối chiếu rubric hoặc đề bài gốc; không tuyên bố đây là toàn bộ yêu cầu chính thức của môn học.

**Cần nhóm xác nhận** chỉ dữ kiện kinh doanh/nội dung chưa được cung cấp. Developer không được tự điền bằng thông tin Orbitkey, dữ liệu tưởng tượng hoặc thông lệ thị trường. Quy tắc UI cụ thể do tài liệu đề xuất không phải tuyên bố về hoạt động kinh doanh thật.

## 2. Nhật ký khảo sát Orbitkey và giới hạn bằng chứng

Khảo sát website US/USD tại `www.orbitkey.com`; trang có thông báo người dùng ở Việt Nam và đề nghị chuyển cửa hàng. Không chuyển sang Orbitkey Asia. Vì vậy không áp dụng giá/chính sách US vào dự án tại Việt Nam.

| Mã | Nguồn đã truy cập | Quan sát thực tế | Giới hạn |
| --- | --- | --- | --- |
| QS-01 | [Trang chủ](https://www.orbitkey.com/) | Thanh thông báo ưu đãi; header logo, danh mục, tìm kiếm, đăng nhập, giỏ; hero “Your Everyday, Organized” và CTA Shop All; nút Best Seller/New Arrival; thẻ sản phẩm có ảnh, tên, giá, đánh giá và lựa chọn màu; khối danh mục, chiến dịch, giá trị thương hiệu, About Us, Sustainability, giải thưởng, review; footer Community/Support/Socials và newsletter | Quan sát cấu trúc/nội dung; chưa thử mọi tab, menu, CTA và carousel. Không coi những nhãn hiện trên trang là bằng chứng hành vi đã kiểm thử |
| QS-02 | [Danh sách Desk Mats](https://www.orbitkey.com/collections/desk-mats/konmari-orbitkey) | Breadcrumb Home > Desk Mats; tiêu đề/mô tả; liên kết các phần Desk Mat, Pro, Pro Slim, Accessories; bộ lọc Color/Material; Sort by gồm Featured, Best selling, hai chiều giá, Most recent; thẻ có biến thể, ảnh, tên, giá, sao và nhãn New; khối Complete your Setup | Đã mở trang; chưa kiểm thử kết quả lọc/sắp xếp. Một số thẻ tách riêng từng biến thể |
| QS-03 | [Chi tiết Desk Mat](https://www.orbitkey.com/collections/desk-mats/products/deskmat?variant=67619697590368) | Desktop có gallery ảnh bên trái, khối mua bên phải; breadcrumb; tên, giá USD, đánh giá, lợi ích, mô tả; cỡ Standard/Large và lựa chọn màu; Add to cart; thanh mua bổ sung; các mục Design Details, Warranty, Shipping & Return, Specification; phía dưới có so sánh cỡ, ảnh/tính năng, FAQ, so sánh dòng sản phẩm, review và gợi ý | Đã chọn Large: giá từ $39.90 thành $49.90, ảnh chuyển sang Large/Black. Chưa thử đổi màu, mở ảnh lớn, toàn bộ FAQ hoặc thanh mua bổ sung. Không thấy bộ chọn số lượng trên vùng mua đã kiểm tra |
| QS-04 | Mục Specification trên QS-03 | Đã bấm mở: hiện kích thước/khối lượng theo cỡ, vật liệu PU/rubber và thành phần hộp gồm mat/cable clip | Đây là thông tin sản phẩm Orbitkey, tuyệt đối không chuyển thành thông số sản phẩm nhóm |
| QS-05 | Giỏ mở sau khi Add to cart trên QS-03; nằm trên URL sản phẩm | Thêm Large/Black thành công; giỏ hiển thị Desk Mat, Size Large, Color Black, ô số lượng 1, $49.90, Remove, Subtotal $49.90, Secure Checkout; có gợi ý phụ kiện và tiến độ quà/miễn phí vận chuyển | Giỏ là drawer bên phải có lớp phủ nền và nút đóng. Không mở trang giỏ độc lập; không bấm Secure Checkout |
| QS-06 | Cùng drawer giỏ | Nhập số lượng 2 rồi rời ô: ô hiện 2 nhưng subtotal vẫn $49.90 ở các snapshot tiếp theo. Bấm Remove: giỏ về 0, hiện thông báo giỏ trống, liên kết danh mục và Shop All Products | **Chưa xác minh cập nhật số lượng/tính lại tiền thành công**; không suy ra nguyên nhân kỹ thuật. Xóa món đã xác minh thành công |
| QS-07 | Footer và thông điệp trên trang sản phẩm | Có link Shipping, Returns, Privacy Policy; trên sản phẩm hiện nhãn giao hàng, bảo hành, hoàn tiền | Chưa mở nội dung đầy đủ các chính sách. Không suy luận điều kiện/ngoại lệ từ nhãn quảng bá |

Không có phần nào trong bốn bề mặt yêu cầu bị chặn truy cập; giỏ được khảo sát ở dạng drawer. Các phần **chưa khảo sát**: checkout thật và xác nhận đơn Orbitkey, trang cart độc lập, mobile thực tế, chi tiết chính sách, tình huống lỗi, cơ chế lưu giỏ, backend/tồn kho. Không khẳng định hành vi các phần này. Đặc tả tương ứng bên dưới là [ĐX]/[BT], không phải [QS]. Không thu thập mã nguồn hoặc tải tài sản thương hiệu để tái sử dụng.

## 3. Quyết định tham khảo: giữ, đơn giản hóa, bỏ

| Thành phần tham khảo | Quyết định [ĐX] | Căn cứ và cách áp dụng |
| --- | --- | --- |
| Hero + CTA, danh mục, ảnh sản phẩm lớn | Giữ nguyên tắc bố cục | Dùng ảnh, câu chữ và thương hiệu riêng; không dựng bản sao pixel của Orbitkey |
| Header danh mục nhiều tầng | Đơn giản hóa | Chỉ Trang chủ, Sản phẩm, Về dự án, Giỏ hàng; ba nhóm sản phẩm trong trang danh sách |
| Filter/Sort | Đơn giản hóa | Chỉ lọc nhóm và sắp xếp giá; bỏ vật liệu/màu nếu dữ liệu chưa đủ |
| Thẻ tách từng biến thể | Đơn giản hóa | Một thẻ mỗi sản phẩm cha; chọn biến thể tại chi tiết |
| Gallery và khối cấu hình/mua | Giữ | Cỡ/màu chỉ xuất hiện khi sản phẩm nhóm thực sự có dữ liệu đã duyệt |
| Mô tả dài, so sánh dòng sản phẩm, nhiều carousel | Rút gọn | Mô tả, thông số, thành phần bộ, hướng dẫn sử dụng; không bắt buộc carousel/FAQ |
| Giỏ drawer | Đổi thành trang giỏ riêng | Dễ làm, dễ kiểm thử, hiển thị đầy đủ trên điện thoại |
| Gợi ý mua thêm | Rút gọn | Chỉ liên kết xem bộ/phụ kiện ở chi tiết, không tự thêm giỏ |
| Giá ưu đãi, quà tặng, countdown, ngưỡng miễn ship | Bỏ | Không có chương trình được nhóm cung cấp; không tạo cảm giác khuyến mại giả |
| Review, sao, số bán, tồn kho | Bỏ | Không có bằng chứng của nhóm; không sao chép độ tin cậy Orbitkey |
| Tài khoản, wishlist, chat, newsletter, admin | Bỏ | Ngoài phạm vi; newsletter còn thu email thật |
| Checkout thanh toán thật | Thay bằng mô phỏng [BT] | Không tạo giao dịch hoặc thu thông tin nhận hàng |

## 4. Ràng buộc bài tập và phạm vi chức năng

### 4.1. Thông báo bắt buộc [BT]

Trên **mọi trang**, đầu trang hiển thị nguyên văn:

> Student project – E-Business, Hanoi University

Ngay dưới hoặc cùng khối hiển thị:

> Website concept phục vụ học tập, không bán hàng thật. Không thanh toán, không giao hàng và không nhập thông tin cá nhân thật.

Không được ẩn hai nội dung này chỉ trong footer, tooltip, popup hoặc trang giới thiệu. Trên mobile cho phép xuống dòng; không cắt chữ. Footer lặp lại dòng nhận diện dự án. Không trình bày như website được trường bảo trợ/chứng nhận thương mại.

### 4.2. Giới hạn bắt buộc [BT]

- Không cổng thanh toán, QR chuyển khoản, COD thật, nhập thẻ, liên kết ví hoặc nút dẫn sang dịch vụ thanh toán.
- Không ô nhập tên, email, số điện thoại, địa chỉ; kể cả ô tùy chọn hoặc ghi chú tự do có thể chứa thông tin thật.
- Không tài khoản/đăng nhập, wishlist, chat, admin, newsletter, theo dõi vận chuyển hoặc gửi email xác nhận.
- Không review, sao, “đã bán”, “còn X món”, “sắp hết hàng”, giá gạch ngang, % giảm hoặc chứng nhận chưa có căn cứ.
- Không sao chép logo, ảnh, video, nội dung marketing hay mã nguồn Orbitkey. Được tham khảo cấu trúc và nguyên tắc UX.
- Giá, vật liệu, kích thước, màu, thành phần bộ và chính sách chưa có phải hiện “Cần nhóm xác nhận”; không ngầm mặc định là 0 đồng hoặc miễn phí.

### 4.3. Phạm vi MVP [ĐX]

Đọc danh mục → xem chi tiết → chọn cấu hình → thêm giỏ → sửa/xóa → checkout mô phỏng → xác nhận mô phỏng. Có trang Về dự án và ba trang chính sách. Dữ liệu catalog do nhóm bàn giao dạng tĩnh; việc cập nhật file dữ liệu thuộc quy trình phát triển, không cần giao diện quản trị. Không bắt buộc tìm kiếm, phân trang, đánh giá, blog, đa ngôn ngữ hoặc đổi tiền tệ.

## 5. Sơ đồ trang và luồng

### 5.1. Danh sách route [ĐX]

| Route | Tiêu đề/trách nhiệm | Điểm vào |
| --- | --- | --- |
| `/` | Trang chủ | Logo; liên kết Trang chủ |
| `/products` | Toàn bộ catalog; lọc/sắp xếp | CTA hero, menu Sản phẩm |
| `/products?category=deskmat` | Catalog lọc deskmat | Thẻ danh mục |
| `/products?category=cable` | Catalog lọc quản lý dây | Thẻ danh mục |
| `/products?category=bundle` | Catalog lọc bộ sản phẩm | Thẻ danh mục; CTA xem bộ |
| `/products/{slug}` | Chi tiết sản phẩm riêng hoặc bộ | Ảnh/tên/nút Xem chi tiết trên thẻ |
| `/cart` | Giỏ hàng | Icon giỏ; thông báo thêm giỏ |
| `/checkout-demo` | Kiểm tra đơn mô phỏng | CTA trong giỏ |
| `/order-demo/confirmation` | Kết quả mô phỏng gần nhất của phiên | Hoàn tất mô phỏng |
| `/about` | Về dự án | Header/footer |
| `/policies/shipping` | Giao hàng của concept | Footer; chi tiết; checkout |
| `/policies/returns` | Đổi trả của concept | Footer; chi tiết; checkout |
| `/policies/privacy` | Quyền riêng tư và dữ liệu demo | Footer; checkout |
| Route không tồn tại | Trang 404 | URL sai |

`slug`, tên sản phẩm và danh mục catalog thực tế: **Cần nhóm xác nhận**. Route kỹ thuật ở trên là đề xuất, không phải tên sản phẩm.

### 5.2. Luồng chính [ĐX]

1. Trang chủ → Xem sản phẩm → lọc nhóm → Xem chi tiết.
2. Chi tiết → chọn đủ biến thể → nhập số lượng hợp lệ → Thêm vào giỏ → thông báo thành công tại trang hiện tại.
3. Xem giỏ → chỉnh số lượng/xóa hoặc Tiếp tục xem sản phẩm → Bắt đầu checkout mô phỏng.
4. Checkout → đọc tóm tắt → tích xác nhận hiểu đây là mô phỏng → Hoàn tất đơn mô phỏng.
5. Xác nhận → xem mã DEMO và tóm tắt → Tiếp tục khám phá hoặc Về trang chủ.

Luồng mua bộ dùng cùng một mẫu chi tiết và checkout; không có trình tự cấu hình bộ tùy ý. Trở lại giỏ từ checkout giữ nguyên giỏ. Mở checkout khi giỏ trống phải hiện giỏ trống và CTA xem sản phẩm, không cho hoàn tất. Không có đường đi từ website tới giao dịch thật.

## 6. Khung giao diện chung [ĐX]

Phong cách clean: nền sáng, chữ dễ đọc, khoảng trắng rõ, ảnh setup làm trọng tâm; một màu nhấn cho CTA chính. Logo, bảng màu, font và hình ảnh: **Cần nhóm xác nhận**. Không lấy phong cách clean làm căn cứ để bịa tính năng/vật liệu.

| Vị trí | Nội dung | Tương tác |
| --- | --- | --- |
| Đầu trang | Hai thông báo bắt buộc phần 4.1 | Chỉ văn bản; không đóng/ẩn trong phiên |
| Header dưới thông báo | Logo/tên nhóm trái; Trang chủ, Sản phẩm, Về dự án ở giữa; Giỏ hàng và tổng số lượng bên phải | Logo về `/`; menu đổi trang; mục đang xem có dấu hiệu active ngoài màu sắc |
| Main | Một tiêu đề H1 và nội dung riêng từng trang | Có liên kết bỏ qua điều hướng tới main khi dùng bàn phím |
| Footer | Tên thương hiệu; dòng dự án; Về dự án; Giao hàng; Đổi trả; Quyền riêng tư | Link nội bộ hoạt động; không link xã hội trống, contact giả hay logo đối tác |

Header không cần sticky trong MVP; giảm nguy cơ che nội dung trên mobile. Badge giỏ là tổng số đơn vị dòng hàng: một bộ số lượng 2 tính là 2, không cộng các thành phần bên trong. Nhãn dễ đọc như “Giỏ hàng (2)”, kể cả khi icon không tải.

## 7. Trang chủ [ĐX]

Thứ tự từ trên xuống, giữa header và footer:

| Khu vực | Nội dung phải có | Nút và hành vi |
| --- | --- | --- |
| Hero | Một ảnh setup riêng; tiêu đề giới thiệu concept; một câu mô tả, không claim hiệu năng chưa kiểm chứng | “Khám phá sản phẩm” → `/products`; ảnh không cần tự chuyển/video autoplay |
| Ba danh mục | Deskmat; Phụ kiện quản lý dây; Bộ sản phẩm; mỗi thẻ có ảnh và mô tả một câu | Bấm thẻ hoặc “Xem danh mục” → route category tương ứng |
| Sản phẩm được nhóm chọn | Tối đa 4 thẻ, không gắn “bán chạy”; danh sách ID do nhóm xác nhận | “Xem chi tiết” → chi tiết; “Xem tất cả” → catalog |
| Giới thiệu cách phối setup | Một ảnh setup và nội dung mô tả cách phối các sản phẩm thật có trong catalog | “Xem bộ sản phẩm” → category bundle; không tự hứa mua bộ sẽ tiết kiệm |
| Về dự án | Nêu đây là dự án học tập, concept, phạm vi demo | “Về dự án” → `/about` |

Nội dung hero, ảnh, mô tả và ID sản phẩm chọn: **Cần nhóm xác nhận**. Nếu chưa đủ 4 món chỉ hiện số món có thật; không nhân bản thẻ để lấp khoảng trống. Không hiển thị giải thưởng, chứng nhận môi trường hay lời chứng thực giả.

## 8. Trang danh sách sản phẩm [ĐX]

### 8.1. Bố cục

1. Breadcrumb “Trang chủ / Sản phẩm”. Trang chủ là link.
2. H1 “Sản phẩm”; mô tả concept ngắn và nhãn “Giá trong bản demo; không bán thật”.
3. Thanh lọc nhóm: Tất cả, Deskmat, Quản lý dây, Bộ sản phẩm. Chỉ chọn một nhóm tại một thời điểm.
4. Thanh kết quả: số sản phẩm khớp, combobox “Sắp xếp”.
5. Lưới sản phẩm.
6. Trạng thái không có kết quả hoặc tải lỗi thay cho lưới, khi cần.

### 8.2. Hành vi

- Đổi nhóm cập nhật kết quả ngay, giữ lựa chọn sắp xếp. Ghi category vào URL để tải lại/back vẫn khôi phục được.
- “Sắp xếp” gồm: Mặc định (thứ tự catalog), Giá tăng dần, Giá giảm dần. Giá thẻ là giá nhỏ nhất trong các biến thể đã xác nhận, dùng chữ “Từ” nếu khác nhau. Sản phẩm chưa có giá xếp cuối ở cả hai chiều; bằng giá giữ thứ tự catalog.
- Giá demo chỉ hiển thị khi nhóm đã cung cấp và được ghi rõ là giá minh họa. Đơn vị tiền tệ **Cần nhóm xác nhận**; chỉ hỗ trợ một đơn vị cho toàn catalog, không quy đổi tự động.
- Thẻ: ảnh đại diện, tên, nhóm, mô tả ngắn tối đa hai dòng, giá hoặc “Giá: Cần nhóm xác nhận”, nút “Xem chi tiết”. Ảnh và tên cùng dẫn tới một chi tiết. Không có quick add để tránh bỏ qua cấu hình.
- Ảnh cùng tỷ lệ trong lưới, không bóp méo; thông tin chữ không được cắt mất tên/giá.
- Không có kết quả: “Chưa có sản phẩm trong nhóm này.” và “Xem tất cả” để reset category; không tự bịa món.
- Lỗi tải dữ liệu: “Không tải được danh sách sản phẩm. Vui lòng thử lại.” Nút “Thử lại” chỉ tải lại catalog; không xóa giỏ.
- URL category không hợp lệ: về Tất cả và thay URL hợp lệ. Chưa cần phân trang; hiển thị toàn bộ catalog đã duyệt.

## 9. Trang chi tiết deskmat, phụ kiện và bộ [ĐX]

### 9.1. Bố cục desktop

Breadcrumb nằm trên khối chính: Trang chủ / Sản phẩm / Tên sản phẩm. Bên trái khoảng 55–60% là gallery; bên phải là nội dung và cấu hình. Phía dưới toàn chiều rộng là mô tả, thông số, thành phần, chính sách và liên kết liên quan.

| Khu vực | Nội dung/điều khiển | Hành vi cụ thể |
| --- | --- | --- |
| Gallery trái | Ảnh chính; thumbnail bên dưới; bộ đếm ảnh | Bấm thumbnail đổi ảnh chính, đánh dấu thumbnail được chọn; không chuyển tự động. Không bắt buộc phóng to/modal |
| Thông tin phải | H1 tên; mô tả ngắn; giá demo; dòng “Concept học tập — không bán thật” | Giá theo cấu hình hiện tại; chưa chọn đủ thì chỉ hiện khoảng/từ giá có căn cứ, chưa được tính thành đơn giá giỏ |
| Chọn biến thể | Nhóm cỡ/màu/loại theo dữ liệu; có nhãn chữ, không chỉ ô màu | Ban đầu chưa chọn đối với thuộc tính nhiều lựa chọn; thuộc tính duy nhất được tự chọn. Mỗi nhóm là radio/select có trạng thái chọn rõ |
| Số lượng | Nhãn; nút trừ; ô số nguyên; nút cộng | Mặc định 1; phạm vi 1–99 là giới hạn thao tác demo, **không phải tồn kho**. Nút trừ disabled ở 1, cộng disabled ở 99 |
| CTA | “Thêm vào giỏ” | Kiểm tra cấu hình/số lượng/giá trước khi thêm; không mở checkout ngay |
| Sau CTA | Link “Giao hàng”, “Đổi trả”, “Quyền riêng tư” | Mở trang chính sách nội bộ; không tự chép nhãn bảo hành Orbitkey |
| Mô tả dưới | Công dụng, cách dùng/bảo quản đã duyệt; ảnh ngữ cảnh | Không claim “chống nước”, “bền”, “tốt cho gaming” nếu nhóm chưa xác nhận bằng dữ liệu |
| Thông số | Bảng thuộc tính–giá trị; đơn vị rõ | Theo biến thể; ô thiếu hiện “Cần nhóm xác nhận” |
| Thành phần | Mua riêng gồm những gì; bộ gồm sản phẩm/biến thể/số lượng nào | Phân biệt phụ kiện trong hộp và đạo cụ chỉ có trong ảnh |
| Liên quan | Tối đa 3 sản phẩm/phụ kiện/bộ do nhóm liên kết | Chỉ nút Xem chi tiết; không thêm tự động |

Ảnh deskmat tối thiểu dự kiến: ảnh toàn sản phẩm, ảnh đặt trong setup, ảnh chi tiết bề mặt/cạnh, sơ đồ kích thước. Chỉ dùng khi nhóm cung cấp được; không tạo sơ đồ với số đo tự suy ra từ ảnh. Ảnh từng biến thể phải khớp nhãn; nếu dùng ảnh minh họa chung phải ghi rõ.

### 9.2. Quy tắc cấu hình và thêm giỏ

- Tập biến thể phải là danh sách tổ hợp hợp lệ có ID riêng. Không tạo tích Descartes rồi coi mọi màu/cỡ đều tồn tại.
- Khi đổi cỡ/màu, cập nhật nhãn cấu hình, giá, ảnh và thông số khớp variant. Nếu lựa chọn cũ không kết hợp được, bỏ chọn thuộc tính xung đột và yêu cầu chọn lại; không âm thầm đổi sang biến thể khác.
- Cỡ, màu, đơn vị giá thực tế: **Cần nhóm xác nhận**. Không mặc định sản phẩm nhóm giống Standard/Large/Black của Orbitkey.
- Thiếu lựa chọn: bấm CTA hiện “Vui lòng chọn [tên thuộc tính].” ngay dưới nhóm tương ứng và đưa focus tới lỗi đầu tiên; không thêm giỏ.
- Số lượng trống, 0, âm, số thập phân, chữ hoặc >99: hiện “Số lượng phải là số nguyên từ 1 đến 99.”; giữ giá trị để người dùng sửa; không tự hiểu 0 là xóa.
- Thiếu giá hoặc đơn vị tiền: CTA disabled; dưới nút hiện “Chưa thể thêm vào giỏ: giá/đơn vị tiền cần nhóm xác nhận.” Không dùng null thành 0.
- Thiếu thông số mô tả không chặn duyệt trang nhưng hiện nhãn thiếu; trước nghiệm thu catalog cuối phải được nhóm duyệt.
- Thêm thành công giữ người dùng tại chi tiết, thông báo “Đã thêm [tên + cấu hình] × [số lượng] vào giỏ.” có link “Xem giỏ”. Badge cập nhật cùng thao tác; thông báo trạng thái đọc được bởi trình đọc màn hình.
- Cùng variant thêm lần nữa cộng số lượng vào một dòng; variant khác thành dòng riêng. Nếu tổng vượt 99, không thay đổi giỏ và hiện thông báo giới hạn demo.
- Trong khi thao tác thêm đang xử lý, vô hiệu hóa CTA để một lần nhấn không sinh dòng lặp; lỗi thì giữ lựa chọn và cho thử lại.

### 9.3. Mua bộ

- Bộ là một sản phẩm catalog với biến thể/bộ thành phần cố định do nhóm xác nhận. Không có trình cấu hình kéo thả hoặc tự phối bộ trong MVP.
- Mỗi biến thể bộ liệt kê rõ ID sản phẩm con, biến thể con và số lượng. Nhóm phải xác nhận thành phần, khả năng tương thích và giá bộ.
- Giá bộ là giá nhóm cung cấp, không tự cộng rồi áp % giảm. Không ghi “tiết kiệm” hoặc giá so sánh khi chưa có căn cứ.
- Một bộ trong giỏ là một dòng, số lượng là số bộ. Không cho xóa riêng thành phần trong bộ; mua riêng một thành phần là dòng độc lập.
- Khi chưa rõ thành phần hoặc giá bộ: ghi “Cần nhóm xác nhận” và chặn thêm bộ. Nếu không có sản phẩm bộ được duyệt, danh mục Bộ sản phẩm hiển thị trạng thái chưa có dữ liệu, không tạo bộ giả.

## 10. Giỏ hàng [ĐX]

### 10.1. Giỏ có sản phẩm

H1 “Giỏ hàng”; dưới là nhắc “Đây là giỏ mô phỏng, không phát sinh giao dịch”. Desktop chia danh sách trái và tóm tắt phải; mobile xếp tóm tắt dưới danh sách.

Mỗi dòng có ảnh đúng variant, tên link về chi tiết, cỡ/màu/loại, thành phần bộ nếu là bộ, đơn giá demo, bộ sửa số lượng, thành tiền và nút “Xóa”. Link về chi tiết mở đúng cấu hình đã lưu. Không sửa biến thể trực tiếp trong giỏ: người dùng xóa dòng cũ và chọn lại tại chi tiết; giải thích ngắn cạnh nhãn cấu hình.

- Sửa số lượng áp dụng cùng quy tắc 1–99 phần 9; commit khi rời ô hoặc nhấn Enter, nút +/- commit ngay. Sau commit hợp lệ, dòng tiền/tạm tính/badge cập nhật nhất quán, không cần tải lại trang.
- Nếu đang nhập không hợp lệ: hiện lỗi tại dòng, giữ số lượng hợp lệ trước đó dùng trong phép tính; khóa CTA checkout tới khi sửa hoặc xóa dòng lỗi. Không hiển thị tổng theo dữ liệu sai.
- Xóa dòng ngay khi bấm Xóa; cập nhật tổng/badge; thông báo “Đã xóa [tên] khỏi giỏ.” Không cần hộp thoại xác nhận cho giỏ demo.
- Xóa dòng cuối chuyển sang giỏ trống, không để summary cũ hoặc nút checkout khả dụng.
- Không gợi ý bán thêm trong giỏ, không mã giảm giá, quà tặng, ngưỡng miễn ship hoặc thanh tạo khẩn cấp.

### 10.2. Công thức và giá chưa đủ dữ liệu

- Thành tiền dòng = đơn giá variant × số lượng sản phẩm/bộ.
- Tạm tính = tổng thành tiền các dòng; tính bằng số nguyên đơn vị tiền nhỏ nhất, chỉ format khi hiển thị, không tính từ chuỗi có dấu phân cách.
- Khu tóm tắt luôn ghi “Giá trị sản phẩm mô phỏng”. Không gọi tạm tính là số tiền đã thanh toán.
- Phí giao hàng, cách tính thuế/phụ phí của concept: **Cần nhóm xác nhận**. Khi chưa có, hiển thị chính nhãn đó; “Tổng mô phỏng: Chưa xác định”, đồng thời vẫn cho chạy trải nghiệm tạo đơn DEMO với tạm tính rõ ràng và các khoản chưa xác nhận được giữ nguyên ở xác nhận.
- Chỉ khi nhóm bàn giao công thức, mức phí và quy tắc thuế đã duyệt mới tính tổng cuối theo các khoản đó; không âm thầm đặt phí bằng 0 hoặc cộng thuế lần hai. Quy tắc làm tròn phải theo đơn vị tiền đã xác nhận.
- Nếu variant bị mất/giá bị thay đổi trong catalog khi khôi phục giỏ: đánh dấu dòng cần kiểm tra, không dùng giá cũ như giá hợp lệ; yêu cầu xóa/thêm lại từ chi tiết. Chặn checkout đối với dòng không hợp lệ.

CTA chính “Bắt đầu checkout mô phỏng” → `/checkout-demo`; phụ “Tiếp tục xem sản phẩm” → `/products`. Giỏ không tự chuyển trang khi đổi số lượng.

### 10.3. Giỏ trống và lưu giỏ

Giỏ trống có H1, thông báo “Giỏ hàng mô phỏng đang trống.” và nút “Khám phá sản phẩm”. Không hiển thị tổng tiền cũ hoặc CTA hoàn tất.

MVP lưu giỏ và xác nhận gần nhất bằng `sessionStorage` của tab: sống qua tải lại/chuyển trang, kết thúc khi phiên tab kết thúc; không yêu cầu đồng bộ giữa thiết bị/tab. Chỉ lưu ID và số lượng; dữ liệu trình bày/giá được đối chiếu catalog. Không lưu dữ liệu cá nhân. Nếu storage không dùng được, dùng bộ nhớ trong phiên trang và báo “Giỏ chỉ được giữ khi bạn còn mở trang này.” Không tuyên bố luôn mất dữ liệu tuyệt đối sau đóng tab vì trình duyệt có thể khôi phục phiên; cung cấp nút “Xóa dữ liệu demo” ở trang quyền riêng tư.

## 11. Checkout mô phỏng và xác nhận [BT + ĐX]

### 11.1. Checkout

Trên `/checkout-demo`, đầu main có H1 “Checkout mô phỏng”, mô tả “Không thanh toán, không giao hàng thật, không nhập thông tin cá nhân.”

| Thứ tự | Khối | Hành vi |
| --- | --- | --- |
| 1 | Tóm tắt giỏ: tên, cấu hình, số lượng, thành tiền, thành phần bộ | Dữ liệu từ giỏ hiện tại; link “Sửa giỏ hàng” về `/cart` |
| 2 | Nhận hàng mô phỏng | Chỉ văn bản “Không có giao nhận thực tế”; không chọn địa chỉ, tỉnh/thành hay ô liên hệ |
| 3 | Thanh toán mô phỏng | Chỉ văn bản “Không thu tiền”; không nút thanh toán ngoài hoặc lựa chọn ví/COD |
| 4 | Tạm tính, phí/thuế theo phần 10 | Mọi khoản chưa xác nhận hiện rõ; không thay bằng số tiền giả |
| 5 | Link ba chính sách | Cho đọc rồi trở lại; giỏ không mất |
| 6 | Checkbox bắt buộc, ban đầu bỏ chọn | “Tôi hiểu đây là mô phỏng học tập, không đặt mua hoặc thanh toán thật.” |
| 7 | CTA “Hoàn tất đơn mô phỏng” và link quay lại giỏ | Chỉ hoàn tất khi giỏ hợp lệ và đã tích checkbox |

Không thêm form thông tin khách hàng kể cả để “giống ecommerce”. Không có ô ghi chú tự do. Checkbox không phải chấp thuận hợp đồng mua bán hoặc đồng ý marketing.

Nếu chưa tích checkbox rồi bấm CTA: “Vui lòng xác nhận bạn hiểu đây là mô phỏng.” và focus vào checkbox. Nếu giỏ trống/không hợp lệ: báo nguyên nhân và link sửa; không tạo đơn.

### 11.2. Hoàn tất và xác nhận

- Một lần bấm hợp lệ tạo bản ghi **cục bộ** gồm mã bắt đầu `DEMO-`, thời điểm mô phỏng, snapshot dòng hàng/giá/chi phí đã biết và các khoản chưa xác nhận; không gọi API đặt đơn, gửi email hoặc trừ kho.
- Khóa nút khi đang xử lý để nhấn nhanh không tạo trùng. Lưu snapshot thành công rồi mới xóa giỏ, chuyển sang `/order-demo/confirmation`. Lỗi thì giữ giỏ và hiện “Chưa hoàn tất mô phỏng. Vui lòng thử lại.”
- Trang xác nhận H1 “Đã hoàn tất mô phỏng”; bên dưới ghi “Đây không phải đơn mua hàng. Không có khoản tiền nào được thu và không có hàng hóa được giao.”
- Hiện mã DEMO, thời điểm, bảng sản phẩm/cấu hình/số lượng/giá trị, tạm tính, trạng thái phí/thuế/tổng giống checkout. Không có tên, email, số điện thoại, địa chỉ, tracking hoặc ngày giao dự kiến.
- CTA “Tiếp tục khám phá” về catalog; “Về trang chủ” về `/`. Badge giỏ bằng 0 sau thành công.
- Refresh trang xác nhận trong cùng phiên vẫn đọc snapshot cũ, không tạo đơn mới. Mở trực tiếp khi không có snapshot: “Chưa có kết quả mô phỏng trong phiên này.” và nút về catalog.
- Nút Back sau thành công không được tái tạo đơn từ giỏ đã xóa. Không có lịch sử tài khoản, xem đơn người khác hoặc nút tải hóa đơn có giá trị pháp lý.

## 12. Chính sách và trang Về dự án

### 12.1. Giao hàng [BT + ĐX]

Trang có H1 “Giao hàng — concept học tập”, rồi thông báo:

> Bản demo không nhận đơn mua thật và không thực hiện giao hàng. Nội dung dưới đây chỉ mô tả kế hoạch của concept, không phải cam kết giao hàng.

Bảng gồm phạm vi giao dự kiến, đơn vị giao dự kiến, thời gian xử lý/giao, phí và cách tính, trường hợp ngoại lệ. Mỗi trường hiện **Cần nhóm xác nhận** cho tới khi nhóm cung cấp. Không lấy ngưỡng US$50 hoặc mức phí từ Orbitkey. Sau khi có dữ liệu, vẫn phải giữ cảnh báo không giao thật.

### 12.2. Đổi trả [BT + ĐX]

H1 “Đổi trả — concept học tập”, mở đầu:

> Không có mua bán thực tế trên bản demo, vì vậy không phát sinh đổi trả hoặc hoàn tiền thật.

Các mục kế hoạch: trường hợp được/không được đổi trả, thời hạn, tình trạng sản phẩm, bằng chứng yêu cầu, quy trình, người chịu phí, cách xử lý. Tất cả **Cần nhóm xác nhận**; không tự đặt 7/30 ngày, bảo hành hai năm hoặc cam kết hoàn tiền. Không có form/upload ảnh/email yêu cầu đổi trả trong MVP.

### 12.3. Quyền riêng tư [BT + ĐX]

Trang phải mô tả đúng triển khai đã duyệt:

- Website không yêu cầu nhập tên, email, điện thoại, địa chỉ, thông tin thanh toán; không có tài khoản/newsletter.
- Giỏ và kết quả DEMO lưu trong phiên tab theo phần 10–11. Giải thích mục đích là duy trì trải nghiệm mô phỏng.
- Nút “Xóa dữ liệu demo” xóa giỏ và snapshot của website trong tab, cập nhật badge, thông báo thành công. Nếu đang ở checkout, quay về giỏ trống. Không xóa dữ liệu website khác.
- MVP không cài analytics, pixel quảng cáo hoặc nhúng chat, video/ảnh từ dịch vụ theo dõi. Dùng tài sản riêng được lưu cùng website.
- Nhà cung cấp hosting, log kỹ thuật, loại dữ liệu log, thời hạn lưu và bên tiếp cận: **Cần nhóm xác nhận** theo cấu hình hosting thật trước khi công bố. Không tuyên bố “không thu thập bất kỳ dữ liệu nào” khi chưa biết log hạ tầng.
- Nếu sau này cần thu dữ liệu nghiên cứu, phải có đặc tả/đồng ý riêng; không lén thêm vào checkout này.

### 12.4. Về dự án [BT + ĐX]

Hiển thị dòng nhận diện bắt buộc, concept, mục tiêu học tập, giới hạn mô phỏng và cách tham khảo Orbitkey ở mức bố cục/UX. Tên thương hiệu, logo, tên các thành viên được phép công bố, vai trò và nội dung giới thiệu: **Cần nhóm xác nhận**. Không đưa mã sinh viên/contact thật từ lịch sử trò chuyện vào website. Không dùng logo trường khi chưa có tài sản và quyền sử dụng phù hợp do nhóm cung cấp.

## 13. Mobile, khả năng truy cập và lỗi [ĐX]

### 13.1. Responsive

Các breakpoint sau là quy tắc đề xuất của dự án, chưa phải hành vi mobile Orbitkey đã quan sát:

| Chiều rộng CSS | Header và lưới | Chi tiết/giỏ |
| --- | --- | --- |
| Từ 1024px | Menu ngang; catalog 3 cột | Gallery trái/mua phải; danh sách giỏ trái/summary phải |
| 768–1023px | Menu thu gọn; catalog 2 cột | Chi tiết và giỏ chuyển một cột |
| Dưới 768px | Logo, Menu và Giỏ; catalog 2 cột từ 360px, 1 cột dưới 360px | Ảnh → tên/giá → biến thể → số lượng → CTA → mô tả; giỏ theo từng card, summary cuối |

- Kiểm thử tối thiểu 320, 390, 768 và 1280px; không có cuộn ngang toàn trang hoặc text/CTA tràn khung.
- Nút Menu mở panel với Trang chủ/Sản phẩm/Về dự án, nút đóng; bấm link thì chuyển trang và đóng. Escape/đóng ngoài panel đóng menu; trả focus về nút mở. Khi panel dạng modal mở, focus không trôi ra nền.
- Mobile không cần hover để truy cập chức năng. Gallery dùng thumbnail/nút, swipe không bắt buộc. Filter/sort xuống dòng, có label; không làm drawer lọc riêng.
- Không thêm thanh CTA sticky trong MVP; nút mua nằm trong luồng đọc, không che thông báo dự án.

### 13.2. Khả năng truy cập

- Control có tên dễ hiểu; ô màu có tên màu bằng chữ; thông số có đơn vị; ảnh nội dung có alt mô tả, ảnh trang trí alt rỗng.
- Điều hướng/tab/radio/checkbox/số lượng/CTA hoạt động bằng bàn phím, focus nhìn thấy rõ. Diện tích chạm mục tiêu ít nhất 44×44px.
- Mục tiêu tương phản WCAG AA: chữ thường ≥4.5:1, chữ lớn ≥3:1; lỗi/selected không thể hiện chỉ bằng màu.
- Heading theo thứ bậc, một H1 mỗi trang, link và button đúng vai trò. Thay đổi giỏ/thông báo lỗi có status/alert phù hợp, không chỉ animation.
- Không tự chuyển ảnh, âm thanh hoặc animation gây cản đọc; tôn trọng giảm chuyển động nếu có hiệu ứng.

### 13.3. Trạng thái lỗi và nội dung chưa có

| Tình huống | Phản hồi bắt buộc | Điều phải giữ |
| --- | --- | --- |
| Slug/URL không tồn tại | 404 “Không tìm thấy trang/sản phẩm”; link về catalog | Không làm mất giỏ |
| Ảnh hỏng | Khung dự phòng “Chưa có ảnh”; giữ alt/tên | Không dùng ảnh sản phẩm khác làm thay thế |
| Catalog đang tải | Hiện “Đang tải sản phẩm…”; không báo nhầm là rỗng | Không thêm dữ liệu chưa tải |
| Lỗi catalog | Thông báo + Thử lại | Giữ category/sort và giỏ |
| Thiếu giá/biến thể/thành phần bộ | “Cần nhóm xác nhận”; chặn thao tác cần dữ liệu đó | Cho xem mô tả hợp lệ |
| Số lượng sai/thiếu cấu hình | Lỗi ngay tại control, focus lỗi đầu tiên | Giữ lựa chọn còn hợp lệ |
| Lưu giỏ thất bại | Thông báo fallback phiên theo phần 10 | Không báo lưu bền thành công |
| Lỗi hoàn tất demo | Thông báo thử lại, không xóa giỏ | Không sinh kết quả thành công giả |

Không hiển thị stack trace, dữ liệu nội bộ hoặc lỗi kỹ thuật khó hiểu cho người xem. Không dùng hộp thoại lỗi để yêu cầu gửi thông tin cá nhân.

## 14. Hợp đồng dữ liệu và nội dung nhóm phải bàn giao [ĐX]

### 14.1. Danh mục dữ liệu tối thiểu

| Thực thể | Trường bắt buộc | Kiểm tra |
| --- | --- | --- |
| Brand | Tên, logo riêng, bảng màu, font, mô tả concept | Tài sản có quyền sử dụng; không để Orbitkey trong header |
| Product | ID ổn định, slug duy nhất, tên, category, loại single/bundle, mô tả ngắn/dài, gallery, thứ tự | Category thuộc deskmat/cable/bundle; không dùng slug trùng |
| Variant | ID, product ID, nhãn thuộc tính, giá demo, đơn vị tiền, ảnh liên quan, thông số | Chỉ tổ hợp nhóm đã duyệt; giá không âm, không coi thiếu giá là 0 |
| Specification | Tên thuộc tính, giá trị, đơn vị, phạm vi variant | Deskmat cần kích thước/vật liệu nếu được xác nhận; phụ kiện cần kích thước/quy cách/cách gắn/khả năng tương thích được xác nhận |
| Bundle | ID variant bộ, các ID variant con, số lượng con, giá bộ đã duyệt | Thành phần tồn tại, số lượng nguyên dương, không vòng lặp bộ lồng bộ |
| Media | File, alt, variant liên quan, nguồn/quyền sử dụng, ảnh minh họa hay ảnh sản phẩm | Không hotlink Orbitkey; không lộ contact/dữ liệu cá nhân trong ảnh |
| CartLine | Variant ID, quantity | Duy nhất theo variant ID; 1–99; đối chiếu catalog khi đọc |
| DemoConfirmation | Mã DEMO, thời điểm, snapshot dòng hàng/giá/chi phí/trạng thái chưa xác nhận | Chỉ cục bộ, không có trường PII, không gửi tới merchant |
| Policy | Nội dung giao/đổi trả, quy tắc phí/thuế, privacy hạ tầng, phiên bản nội dung | Trường chưa có hiện nhãn xác nhận; không suy ra từ Orbitkey |

Đơn vị tiền, format số, phí/thuế và giá thật của catalog demo: **Cần nhóm xác nhận**. Thời điểm DEMO hiển thị rõ múi giờ Việt Nam. Không yêu cầu backend/database/framework cụ thể trong tài liệu này; lựa chọn kỹ thuật phải đáp ứng hành vi và ràng buộc dữ liệu trên.

### 14.2. Checklist bàn giao nội dung

| Mã | Nhóm cần cung cấp | Trạng thái |
| --- | --- | --- |
| DATA-01 | Tên thương hiệu, logo, màu/font và quyền dùng tài sản | Cần nhóm xác nhận |
| DATA-02 | Danh sách sản phẩm riêng, category, tên/slug/ID | Cần nhóm xác nhận |
| DATA-03 | Các biến thể hợp lệ, giá demo, đơn vị tiền | Cần nhóm xác nhận |
| DATA-04 | Vật liệu, số đo, trọng lượng nếu dùng, quy cách, công dụng và căn cứ mô tả | Cần nhóm xác nhận |
| DATA-05 | Thành phần từng bộ, variant con, số lượng, giá bộ; tương thích phụ kiện | Cần nhóm xác nhận |
| DATA-06 | Ảnh hero, danh mục, gallery, setup, kích thước và alt; nguồn/quyền sử dụng | Cần nhóm xác nhận |
| DATA-07 | Nội dung giao hàng/đổi trả dự kiến, phí/thuế và cách làm tròn | Cần nhóm xác nhận |
| DATA-08 | Nội dung giới thiệu, thành viên được phép công bố, vai trò | Cần nhóm xác nhận |
| DATA-09 | Hosting/log, thời hạn lưu, bên tiếp cận và privacy đúng triển khai | Cần nhóm xác nhận |
| DATA-10 | Danh sách sản phẩm được chọn trên home và liên kết liên quan | Cần nhóm xác nhận |

Developer phải bàn giao danh sách trường còn thiếu trước khi nghiệm thu, không coi placeholder là nội dung kinh doanh đã hoàn thành. Có thể nghiệm thu hành vi bằng fixture kiểm thử tách riêng; fixture phải ghi rõ “Dữ liệu kiểm thử”, không đưa ra giao diện như giá/vật liệu đã được nhóm duyệt.

## 15. Checklist nghiệm thu có thể kiểm tra

Mỗi ca ghi Pass/Fail, trình duyệt, viewport và bằng chứng. Dùng catalog đã được nhóm duyệt; các ký hiệu giá P1/P2 và lượng Q dưới đây là biến kiểm thử, không phải giá kinh doanh được đề xuất.

| ID | Thao tác/điều kiện | Kết quả đạt |
| --- | --- | --- |
| AC-01 | Mở mọi route và 404 ở desktop/mobile | Hiện nguyên văn dòng “Student project – E-Business, Hanoi University” và cảnh báo không bán thật, không bị cắt |
| AC-02 | Kiểm tra toàn bộ điều hướng/UI và mã tích hợp được bàn giao | Không có tài khoản, wishlist, chat, admin, newsletter, cổng thanh toán hoặc chức năng ngoài MVP |
| AC-03 | Kiểm tra nội dung catalog/home | Không review/sao/lượt bán/tồn kho/khuyến mại giả; không asset/logo/nội dung marketing Orbitkey |
| AC-04 | Bấm logo, menu, CTA hero, ba danh mục | Đúng route và category; menu active chính xác |
| AC-05 | Chọn từng category, reload rồi Back/Forward | Kết quả và bộ lọc khớp URL; sort được giữ đúng |
| AC-06 | Sort giá tăng/giảm trên dữ liệu có giá bằng nhau và giá thiếu | Thứ tự đúng quy tắc phần 8; giá thiếu cuối, không thành 0 |
| AC-07 | Danh mục không có món, catalog lỗi, ảnh hỏng | Đúng trạng thái rỗng/lỗi/dự phòng và CTA tương ứng, không tạo nội dung giả |
| AC-08 | Bấm ảnh/tên/Xem chi tiết một thẻ | Cùng chi tiết đúng sản phẩm; breadcrumb hoạt động |
| AC-09 | Bấm thumbnail; chọn hai variant có ảnh/giá/thông số khác | Ảnh/nhãn/giá/thông số đồng bộ đúng variant, không cần reload |
| AC-10 | Bỏ chọn thuộc tính rồi Add; thử tổ hợp không tồn tại | Không thêm giỏ; lỗi rõ và focus đúng, không tự chọn variant khác |
| AC-11 | Nhập trống, 0, -1, 1.5, chữ, 100; thử 1 và 99 | Giá trị sai bị chặn, giá trị biên hợp lệ; nút +/- đúng trạng thái |
| AC-12 | Sản phẩm thiếu giá/tiền hoặc bộ thiếu thành phần | Nhãn Cần nhóm xác nhận; nút thêm disabled có lý do |
| AC-13 | Add một variant 2 lần, rồi variant khác | Cùng variant cộng một dòng; variant khác thành dòng khác; badge là tổng lượng |
| AC-14 | Add làm lượng tổng variant >99; nhấn nhanh CTA | Không vượt giới hạn, không nhân dòng do một thao tác đang xử lý |
| AC-15 | Thêm bộ số lượng 2 và một món lẻ trùng thành phần | Bộ là một dòng lượng 2, món lẻ độc lập; không chỉnh/xóa thành phần bộ riêng |
| AC-16 | Đổi lượng giỏ từ Q1 sang Q2 bằng Enter, blur và +/- | Thành tiền P×Q2, tạm tính và badge cập nhật cùng trạng thái; checkout đọc giá trị mới |
| AC-17 | Nhập lượng lỗi trong giỏ | Hiện lỗi; giữ tổng theo lượng hợp lệ trước; checkout bị khóa đến khi sửa/xóa |
| AC-18 | Xóa một dòng rồi dòng cuối | Tổng/badge đúng; dòng cuối chuyển giỏ trống, không còn CTA checkout |
| AC-19 | Reload giỏ trong cùng tab; mô phỏng storage không khả dụng | Bình thường giữ giỏ; fallback có thông báo, không tuyên bố đã lưu phiên khi thất bại |
| AC-20 | Catalog mất variant/đổi giá khi đọc lại giỏ | Dòng cần kiểm tra và chặn checkout, không âm thầm dùng giá cũ |
| AC-21 | Phí/thuế chưa được cung cấp | Hiện Cần nhóm xác nhận và Tổng mô phỏng chưa xác định; không hiển thị miễn phí hay tổng cuối sai |
| AC-22 | Cung cấp bộ quy tắc phí/thuế đã duyệt, kiểm tra tổng | Tổng bằng tạm tính + các khoản theo đúng quy tắc đã duyệt, làm tròn đúng, không tính thuế trùng |
| AC-23 | Mở checkout trực tiếp với giỏ rỗng | Không tạo đơn; hiện giỏ trống/link catalog |
| AC-24 | Đi hết checkout và kiểm tra form/network | Không ô PII, ghi chú tự do, upload hoặc gửi dữ liệu tới thanh toán/đơn hàng/email thật |
| AC-25 | Hoàn tất khi chưa tích checkbox | Báo lỗi và focus checkbox; chưa tạo snapshot |
| AC-26 | Hoàn tất hợp lệ, nhấn nhanh nhiều lần | Chỉ một kết quả DEMO; snapshot khớp giỏ; xóa giỏ sau thành công; không giao dịch thật |
| AC-27 | Refresh xác nhận; Back checkout; mở xác nhận ở phiên không có dữ liệu | Không tạo trùng; giỏ đã xóa không đặt lại; phiên rỗng có thông báo phù hợp |
| AC-28 | Làm lỗi lưu snapshot khi hoàn tất | Giỏ không bị xóa; không hiện thành công giả; có thể thử lại |
| AC-29 | Đọc ba chính sách và Về dự án | Có cảnh báo concept; trường chưa biết được đánh dấu; không chính sách Orbitkey sao chép/claim chưa duyệt |
| AC-30 | Bấm Xóa dữ liệu demo trên privacy | Xóa giỏ/snapshot website; badge 0; xác nhận cũ không còn hiển thị |
| AC-31 | Kiểm tra 320/390/768/1280px | Không tràn ngang, thứ tự nội dung đúng; nút/giá/thông báo đọc được |
| AC-32 | Dùng bàn phím mở/đóng menu, lọc, biến thể, giỏ, checkout | Focus rõ, tên control có nghĩa; đóng menu trả focus; không cần hover |
| AC-33 | Kiểm tra alt, contrast, nhãn màu và status/alert | Đạt các tiêu chí phần 13.2, lỗi không chỉ dựa vào màu |
| AC-34 | Đối chiếu DATA-01 đến DATA-10 | Nội dung đã duyệt hoặc liệt kê rõ blocker còn Cần nhóm xác nhận; developer không tự bịa để đóng checklist |

## 16. Điều kiện chốt bàn giao

Tài liệu này đủ để dựng luồng và UI MVP; các dữ kiện thương hiệu/catalog/chính sách vẫn phải do nhóm xác nhận. Chỉ chốt nghiệm thu nội dung cuối khi nhóm duyệt dữ liệu, quyền sử dụng ảnh và privacy đúng hạ tầng. Không mở rộng sang ecommerce thật trong phạm vi này. Mọi thay đổi thu dữ liệu cá nhân, thanh toán, tài khoản hoặc vận hành đơn thật cần yêu cầu mới và đánh giá riêng.

Nguồn tham khảo quan sát: các URL ở phần 2, truy cập ngày 31/10/2026. Các quyết định và tiêu chí từ phần 3 trở đi là đặc tả cho dự án nhóm, không phải khẳng định về cách Orbitkey vận hành.

## 17. Bản mở rộng v1.1 — backend demo [ĐX theo yêu cầu người dùng]

Người dùng yêu cầu (31/10/2026) demo thêm: form thông tin nhận hàng, lưu đơn và xem lịch sử, trang admin quản lý đơn/sản phẩm, tồn kho và trạng thái đơn. Mục này **thay thế** các điều khoản xung đột bên dưới; phần còn lại của tài liệu giữ nguyên.

| Điều khoản cũ | Thay đổi trong v1.1 |
| --- | --- |
| 4.2: không ô nhập tên/SĐT/địa chỉ | Checkout có 3 ô: tên, số điện thoại, địa chỉ. Bắt buộc nhắc "chỉ nhập dữ liệu giả"; không ô ghi chú tự do, không upload |
| 4.1, AC-01: thông báo "Student project – E-Business, Hanoi University" đầu mọi trang | Theo yêu cầu người dùng (31/10/2026), đã gỡ dải thông báo đầu trang. Dòng nhận diện dự án vẫn còn ở footer và trang Về dự án. Cần nhóm tự đối chiếu đề bài xem có bắt buộc hiển thị không |
| Toàn bộ nhãn "demo / học tập / Dữ liệu kiểm thử / Cần nhóm xác nhận" trên giao diện | Theo yêu cầu người dùng (31/10/2026), giao diện trình bày như một cửa hàng thương hiệu cá nhân. Thông số, giá và chính sách trong `src/data/catalog.ts` và `src/pages/Policies.tsx` là nội dung mẫu do người phát triển soạn, cần thay bằng nội dung thật. Route checkout đổi thành `/checkout`, `/order/confirmation`; mã đơn có tiền tố `OD-` |
| 4.2, 3: không admin | Có trang `/admin` dùng mật khẩu demo cấu hình bằng biến môi trường `ADMIN_PASSWORD`. Không có tài khoản khách hàng |
| 4.2, 3: không "còn X món" | Storefront chỉ hiện "Hết hàng" và chặn thêm giỏ khi tồn kho 0; không hiện số tồn kho. Admin thấy số tồn kho |
| 10.3, 11.2: lưu cục bộ, không gọi API | Giỏ vẫn ở `sessionStorage`. Đơn được gửi tới API `POST /api/orders` và lưu SQLite; server tính lại giá từ DB, không tin giá từ client |
| 11.2: đơn không trừ kho | Đặt đơn trừ tồn kho trong một transaction; hủy đơn hoàn kho |
| 12.3: không dữ liệu phía server | Trang quyền riêng tư phải nêu: tên/SĐT/địa chỉ (dữ liệu giả) lưu trong DB của server demo; không gửi cho bên thứ ba |

Không thay đổi: không thanh toán thật, không giao hàng thật, không email, thông báo đầu trang vẫn hiển thị trên mọi trang, đơn có mã `DEMO-`.

**Trạng thái đơn:** `pending` → `confirmed` → `shipping` → `completed`; có thể chuyển `cancelled` khi chưa `completed` (hoàn kho). Không đi ngược trạng thái.

**Lịch sử đơn (không tài khoản):** trình duyệt nhớ mã đơn đã đặt trong tab; trang `/orders` liệt kê các mã đó và lấy trạng thái từ API. Tra cứu bằng mã đơn.

**API:** `GET /api/catalog`; `POST /api/orders`; `GET /api/orders/:code`; `POST /api/admin/login`; `GET /api/admin/orders`; `PATCH /api/admin/orders/:code/status`; `GET /api/admin/products`; `PATCH /api/admin/variants/:id` (giá, tồn kho).

**Ngoài phạm vi v1.1:** tạo/xóa sản phẩm trong admin (chỉnh giá và tồn kho thì có), phân quyền nhiều admin, thanh toán, email.

**Rủi ro cần nhóm tự cân nhắc:** bài tập gốc có thể yêu cầu không thu thông tin cá nhân; mục này đi ngược ràng buộc đó theo yêu cầu người dùng. Chưa đối chiếu rubric.
