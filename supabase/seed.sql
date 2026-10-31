-- Dữ liệu mẫu cho Nook Studio. SINH TỰ ĐỘNG từ src/data/catalog.ts bằng `npm run db:seed-sql`; đừng sửa tay.
-- Chạy SAU schema.sql. Chạy lại không ghi đè giá/tồn kho bạn đã chỉnh trong /admin (on conflict do nothing).

insert into settings (key, value) values ('currency', 'VND') on conflict (key) do nothing;

insert into products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)
values ('p-dm-a', 'deskmat-slate', 'Deskmat Slate', 'deskmat', 'single', 'Tấm lót bàn bề mặt mịn, tối giản cho góc làm việc và chơi game.', 'Bề mặt phẳng mịn cho chuột di chuyển êm, đế chống trượt giữ tấm lót đứng yên trên bàn. Hai cỡ và hai màu trung tính, dễ phối với mọi góc setup.', 'Lau bằng khăn ẩm, để khô tự nhiên. Không giặt máy.', '["Deskmat"]'::jsonb, '[{"alt":"Deskmat Slate, ảnh toàn sản phẩm"},{"alt":"Deskmat Slate đặt trong góc setup"},{"alt":"Chi tiết bề mặt và viền deskmat"}]'::jsonb, '["Cỡ","Màu"]'::jsonb, '["p-cb-c","p-bd-d"]'::jsonb, 0)
on conflict (id) do nothing;
insert into products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)
values ('p-dm-b', 'deskmat-cloud', 'Deskmat Cloud', 'deskmat', 'single', 'Phiên bản mới của dòng deskmat, sắp ra mắt.', 'Thiết kế mới với bề mặt dày hơn. Thông tin chi tiết sẽ được cập nhật khi sản phẩm mở bán.', null, null, '[{"alt":"Deskmat Cloud"}]'::jsonb, '[]'::jsonb, '["p-dm-a"]'::jsonb, 1)
on conflict (id) do nothing;
insert into products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)
values ('p-cb-c', 'kep-day-clip', 'Kẹp dây Clip', 'cable', 'single', 'Kẹp silicone giữ dây sạc và dây tai nghe luôn đúng chỗ trên mặt bàn.', 'Gắn mép bàn hoặc mặt dưới bàn, giữ dây không rơi xuống sàn. Có hai loại theo số rãnh.', null, '["Kẹp dây"]'::jsonb, '[{"alt":"Kẹp dây Clip"}]'::jsonb, '["Loại"]'::jsonb, '["p-dm-a"]'::jsonb, 2)
on conflict (id) do nothing;
insert into products (id, slug, name, category, kind, short_description, description, usage, includes, images, attribute_names, related_ids, sort_order)
values ('p-bd-d', 'bo-setup-essentials', 'Bộ Setup Essentials', 'bundle', 'bundle', 'Deskmat Slate cỡ M màu đen cùng hai kẹp dây, đủ để gọn gàng góc bàn.', 'Bộ cơ bản để bắt đầu một góc bàn gọn: một deskmat và hai kẹp dây loại 3 rãnh.', null, null, '[{"alt":"Bộ Setup Essentials"}]'::jsonb, '[]'::jsonb, '["p-dm-a","p-cb-c"]'::jsonb, 3)
on conflict (id) do nothing;

insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('dm-a-m-grey', 'p-dm-a', '{"Cỡ":"M","Màu":"Xám"}'::jsonb, 249000, 20, '[{"name":"Kích thước","value":"800 × 300 mm"},{"name":"Độ dày","value":"3 mm"},{"name":"Chất liệu","value":"Vải microfiber, đế cao su"}]'::jsonb, null, 0)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('dm-a-m-black', 'p-dm-a', '{"Cỡ":"M","Màu":"Đen"}'::jsonb, 249000, 20, '[{"name":"Kích thước","value":"800 × 300 mm"},{"name":"Độ dày","value":"3 mm"},{"name":"Chất liệu","value":"Vải microfiber, đế cao su"}]'::jsonb, null, 1)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('dm-a-l-black', 'p-dm-a', '{"Cỡ":"L","Màu":"Đen"}'::jsonb, 329000, 20, '[{"name":"Kích thước","value":"900 × 400 mm"},{"name":"Độ dày","value":"3 mm"},{"name":"Chất liệu","value":"Vải microfiber, đế cao su"}]'::jsonb, null, 2)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('dm-b-std', 'p-dm-b', '{}'::jsonb, null, 20, '[]'::jsonb, null, 0)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('cb-c-3', 'p-cb-c', '{"Loại":"3 rãnh"}'::jsonb, 39000, 20, '[{"name":"Chất liệu","value":"Silicone"},{"name":"Cách gắn","value":"Miếng dán mặt sau"}]'::jsonb, null, 0)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('cb-c-5', 'p-cb-c', '{"Loại":"5 rãnh"}'::jsonb, 59000, 20, '[{"name":"Chất liệu","value":"Silicone"},{"name":"Cách gắn","value":"Miếng dán mặt sau"}]'::jsonb, null, 1)
on conflict (id) do nothing;
insert into variants (id, product_id, attributes, price, stock, specs, components, sort_order)
values ('bd-d-std', 'p-bd-d', '{}'::jsonb, 319000, 20, '[]'::jsonb, '[{"variantId":"dm-a-m-black","quantity":1},{"variantId":"cb-c-3","quantity":2}]'::jsonb, 0)
on conflict (id) do nothing;
