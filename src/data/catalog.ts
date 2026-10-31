import type { Catalog } from '../types';

/**
 * Dữ liệu nạp vào DB ở lần chạy đầu (xem server/db.ts). Sau đó giá và tồn kho chỉnh trong /admin.
 * Tên, mô tả và thông số là nội dung mẫu, thay bằng sản phẩm thật của thương hiệu.
 * Ảnh: bỏ file vào public/images rồi điền `src` (ví dụ '/images/slate-1.jpg').
 */
export const catalog: Catalog = {
  currency: 'VND',
  products: [
    {
      id: 'p-dm-a',
      slug: 'deskmat-slate',
      name: 'Deskmat Slate',
      category: 'deskmat',
      kind: 'single',
      shortDescription: 'Tấm lót bàn bề mặt mịn, tối giản cho góc làm việc và chơi game.',
      description:
        'Bề mặt phẳng mịn cho chuột di chuyển êm, đế chống trượt giữ tấm lót đứng yên trên bàn. Hai cỡ và hai màu trung tính, dễ phối với mọi góc setup.',
      usage: 'Lau bằng khăn ẩm, để khô tự nhiên. Không giặt máy.',
      includes: ['Deskmat'],
      images: [
        { alt: 'Deskmat Slate, ảnh toàn sản phẩm' },
        { alt: 'Deskmat Slate đặt trong góc setup' },
        { alt: 'Chi tiết bề mặt và viền deskmat' },
      ],
      attributeNames: ['Cỡ', 'Màu'],
      variants: [
        { id: 'dm-a-m-grey', productId: 'p-dm-a', attributes: { Cỡ: 'M', Màu: 'Xám' }, price: 249000, specs: [{ name: 'Kích thước', value: '800 × 300 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
        { id: 'dm-a-m-black', productId: 'p-dm-a', attributes: { Cỡ: 'M', Màu: 'Đen' }, price: 249000, specs: [{ name: 'Kích thước', value: '800 × 300 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
        { id: 'dm-a-l-black', productId: 'p-dm-a', attributes: { Cỡ: 'L', Màu: 'Đen' }, price: 329000, specs: [{ name: 'Kích thước', value: '900 × 400 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
      ],
      relatedIds: ['p-cb-c', 'p-bd-d'],
    },
    {
      id: 'p-dm-b',
      slug: 'deskmat-cloud',
      name: 'Deskmat Cloud',
      category: 'deskmat',
      kind: 'single',
      shortDescription: 'Phiên bản mới của dòng deskmat, sắp ra mắt.',
      description: 'Thiết kế mới với bề mặt dày hơn. Thông tin chi tiết sẽ được cập nhật khi sản phẩm mở bán.',
      usage: null,
      includes: null,
      images: [{ alt: 'Deskmat Cloud' }],
      attributeNames: [],
      variants: [{ id: 'dm-b-std', productId: 'p-dm-b', attributes: {}, price: null, specs: [] }],
      relatedIds: ['p-dm-a'],
    },
    {
      id: 'p-cb-c',
      slug: 'kep-day-clip',
      name: 'Kẹp dây Clip',
      category: 'cable',
      kind: 'single',
      shortDescription: 'Kẹp silicone giữ dây sạc và dây tai nghe luôn đúng chỗ trên mặt bàn.',
      description: 'Gắn mép bàn hoặc mặt dưới bàn, giữ dây không rơi xuống sàn. Có hai loại theo số rãnh.',
      usage: null,
      includes: ['Kẹp dây'],
      images: [{ alt: 'Kẹp dây Clip' }],
      attributeNames: ['Loại'],
      variants: [
        { id: 'cb-c-3', productId: 'p-cb-c', attributes: { Loại: '3 rãnh' }, price: 39000, specs: [{ name: 'Chất liệu', value: 'Silicone' }, { name: 'Cách gắn', value: 'Miếng dán mặt sau' }] },
        { id: 'cb-c-5', productId: 'p-cb-c', attributes: { Loại: '5 rãnh' }, price: 59000, specs: [{ name: 'Chất liệu', value: 'Silicone' }, { name: 'Cách gắn', value: 'Miếng dán mặt sau' }] },
      ],
      relatedIds: ['p-dm-a'],
    },
    {
      id: 'p-bd-d',
      slug: 'bo-setup-essentials',
      name: 'Bộ Setup Essentials',
      category: 'bundle',
      kind: 'bundle',
      shortDescription: 'Deskmat Slate cỡ M màu đen cùng hai kẹp dây, đủ để gọn gàng góc bàn.',
      description: 'Bộ cơ bản để bắt đầu một góc bàn gọn: một deskmat và hai kẹp dây loại 3 rãnh.',
      usage: null,
      includes: null,
      images: [{ alt: 'Bộ Setup Essentials' }],
      attributeNames: [],
      variants: [
        {
          id: 'bd-d-std',
          productId: 'p-bd-d',
          attributes: {},
          price: 319000,
          specs: [],
          components: [
            { variantId: 'dm-a-m-black', quantity: 1 },
            { variantId: 'cb-c-3', quantity: 2 },
          ],
        },
      ],
      relatedIds: ['p-dm-a', 'p-cb-c'],
    },
  ],
};
