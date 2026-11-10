import type { Catalog, ProductImage } from '../types';

/**
 * Dữ liệu nạp vào DB (xem scripts/gen-seed.ts). Sau đó giá và tồn kho chỉnh trong /admin.
 *
 * Các sản phẩm có ảnh trong folder "Week 2" đi theo đúng cấu trúc folder:
 *   <Nhóm>/<Tên sản phẩm>/<Biến thể>/ảnh  →  category / name / attributes / images (match theo biến thể).
 * Ảnh đã chuyển sang public/images/products/<slug-sản-phẩm>/<slug-biến-thể>-<n>.jpg.
 */

/** Ảnh 1..count của một sản phẩm; có `variant` thì ảnh chỉ hiện khi khách chọn đúng biến thể đó. */
function gallery(slug: string, count: number, alt: string, variant?: { file: string; attr: string; value: string }): ProductImage[] {
  return Array.from({ length: count }, (_, i) => ({
    src: `/images/products/${slug}/${variant ? `${variant.file}-` : ''}${i + 1}.jpg`,
    alt: i === 0 ? alt : `${alt}, ảnh ${i + 1}`,
    ...(variant ? { match: { [variant.attr]: variant.value } } : {}),
  }));
}

/** Pad Gaming Arena: 5 cỡ × 5 màu, giá theo cỡ. Cỡ M và L cùng kích thước với Deskmat Slate. */
const PAD_SIZES = [
  { size: 'S', dims: '350 × 300 mm', price: 99000 },
  { size: 'M', dims: '800 × 300 mm', price: 179000 },
  { size: 'L', dims: '900 × 400 mm', price: 229000 },
  { size: 'XL', dims: '1000 × 500 mm', price: 299000 },
  { size: 'XXL', dims: '1200 × 600 mm', price: 399000 },
];
const PAD_COLORS = [
  { color: 'Đen', key: 'den' },
  { color: 'Xám', key: 'xam' },
  { color: 'Đỏ', key: 'do' },
  { color: 'Xanh dương', key: 'xanh' },
  { color: 'Trắng', key: 'trang' },
];

export const catalog: Catalog = {
  currency: 'VND',
  products: [
    // ---- Deskmat ----
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
        { src: '/images/deskmat-slate-xam.jpg', alt: 'Deskmat Slate màu xám, mặt đế đen cuộn ở mép trái', match: { Màu: 'Xám' } },
        { src: '/images/deskmat-slate-den.jpg', alt: 'Deskmat Slate màu đen, bề mặt vải mịn', match: { Màu: 'Đen' } },
        { src: '/images/combo-slate-clip.jpg', alt: 'Deskmat Slate đen trên bàn gỗ cùng bàn phím, chuột và hai kẹp dây' },
      ],
      attributeNames: ['Cỡ', 'Màu'],
      variants: [
        { id: 'dm-a-m-grey', productId: 'p-dm-a', attributes: { Cỡ: 'M', Màu: 'Xám' }, price: 249000, specs: [{ name: 'Kích thước', value: '800 × 300 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
        { id: 'dm-a-m-black', productId: 'p-dm-a', attributes: { Cỡ: 'M', Màu: 'Đen' }, price: 249000, specs: [{ name: 'Kích thước', value: '800 × 300 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
        { id: 'dm-a-l-black', productId: 'p-dm-a', attributes: { Cỡ: 'L', Màu: 'Đen' }, price: 329000, specs: [{ name: 'Kích thước', value: '900 × 400 mm' }, { name: 'Độ dày', value: '3 mm' }, { name: 'Chất liệu', value: 'Vải microfiber, đế cao su' }] },
      ],
      relatedIds: ['p-cb-c', 'p-wr-g'],
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
      id: 'p-pg-e',
      slug: 'pad-gaming-arena',
      name: 'Pad Gaming Arena',
      category: 'deskmat',
      kind: 'single',
      shortDescription: 'Pad chuột gaming bề mặt mịn, viền khâu chắc, năm cỡ và năm màu.',
      description:
        'Bề mặt vải mịn cho chuột lướt nhanh và dừng chính xác, viền khâu chống tróc, đế cao su chống trượt giữ pad đứng yên khi di chuột mạnh. Từ cỡ S cho bàn nhỏ đến XXL phủ trọn bàn phím và chuột.',
      usage: 'Lau bằng khăn ẩm, để khô tự nhiên. Không giặt máy, không phơi trực tiếp dưới nắng gắt.',
      includes: ['Pad gaming'],
      images: [
        { alt: 'Pad Gaming Arena theo cỡ và màu đã chọn (hình minh họa)' },
        { alt: 'Pad Gaming Arena đặt cùng bàn phím và chuột (hình minh họa)' },
        { alt: 'Cận cảnh bề mặt vải và viền khâu (hình minh họa)' },
      ],
      attributeNames: ['Cỡ', 'Màu'],
      variants: PAD_SIZES.flatMap(({ size, dims, price }) =>
        PAD_COLORS.map(({ color, key }) => ({
          id: `pg-${size.toLowerCase()}-${key}`,
          productId: 'p-pg-e',
          attributes: { Cỡ: size, Màu: color },
          price,
          specs: [
            { name: 'Kích thước', value: dims },
            { name: 'Độ dày', value: '4 mm' },
            { name: 'Chất liệu', value: 'Vải bề mặt mịn, viền khâu, đế cao su' },
          ],
        })),
      ),
      relatedIds: ['p-dm-a', 'p-pm-f'],
    },

    // ---- Pad chuột size nhỏ ----
    {
      id: 'p-pm-f',
      slug: 'logitech-mouse-pad-studio-series',
      name: 'Logitech Mouse Pad Studio Series',
      category: 'pad-nho',
      kind: 'single',
      shortDescription: 'Pad chuột nhỏ gọn bề mặt vải mịn, hai màu Graphite và Dark Rose.',
      description:
        'Kích thước nhỏ, đủ chỗ cho chuột di chuyển mà không chiếm diện tích bàn. Bề mặt vải mịn, đế cao su chống trượt. Phù hợp khi bàn hẹp hoặc chỉ muốn thay pad cũ.',
      usage: 'Lau bằng khăn ẩm, để khô tự nhiên.',
      includes: ['Pad chuột'],
      images: [
        ...gallery('logitech-mouse-pad-studio-series', 4, 'Logitech Mouse Pad Studio Series màu Graphite', { file: 'graphite', attr: 'Màu', value: 'Graphite' }),
        ...gallery('logitech-mouse-pad-studio-series', 4, 'Logitech Mouse Pad Studio Series màu Dark Rose', { file: 'dark-rose', attr: 'Màu', value: 'Dark Rose' }),
      ],
      attributeNames: ['Màu'],
      variants: [
        { id: 'pm-f-graphite', productId: 'p-pm-f', attributes: { Màu: 'Graphite' }, price: 250000, specs: [{ name: 'Chất liệu', value: 'Vải mịn, đế cao su' }] },
        { id: 'pm-f-rose', productId: 'p-pm-f', attributes: { Màu: 'Dark Rose' }, price: 250000, specs: [{ name: 'Chất liệu', value: 'Vải mịn, đế cao su' }] },
      ],
      relatedIds: ['p-rz-p', 'p-wr-g'],
    },
    {
      id: 'p-rz-p',
      slug: 'razer-gigantus-v2-medium',
      name: 'Razer Gigantus V2 Medium',
      category: 'pad-nho',
      kind: 'single',
      shortDescription: 'Pad chuột gaming cỡ Medium, bề mặt vải dệt cho chuột lướt đều.',
      description:
        'Bề mặt vải dệt dày cho chuột lướt đều và dừng chính xác, đế cao su chống trượt bám chắc mặt bàn. Cỡ Medium vừa khu vực chuột trên bàn làm việc thông thường.',
      usage: 'Lau bằng khăn ẩm, để khô tự nhiên.',
      includes: ['Pad chuột'],
      images: gallery('razer-gigantus-v2-medium', 3, 'Razer Gigantus V2 Medium màu đen', { file: 'den', attr: 'Màu', value: 'Đen' }),
      attributeNames: ['Màu'],
      variants: [
        { id: 'pm-f-black-m', productId: 'p-rz-p', attributes: { Màu: 'Đen' }, price: 490000, specs: [{ name: 'Kích thước', value: '360 × 275 mm' }, { name: 'Chất liệu', value: 'Vải dệt, đế cao su' }] },
      ],
      relatedIds: ['p-pm-f', 'p-wr-g'],
    },

    // ---- Kê tay ----
    {
      id: 'p-wr-g',
      slug: 'monsgeek-black-wrist-rest',
      name: 'MonsGeek Black Wrist Rest',
      category: 'ke-tay',
      kind: 'single',
      shortDescription: 'Kê tay màu đen cho bàn phím, chọn theo chiều dài bàn phím 87 hoặc 98 phím.',
      description: 'Đệm tựa cổ tay trước bàn phím, giúp tay thoải mái khi gõ lâu. Chọn bản 87 phím hoặc 98 phím theo chiều dài bàn phím của bạn.',
      usage: 'Lau bằng khăn ẩm.',
      includes: ['Kê tay'],
      images: gallery('monsgeek-black-wrist-rest', 4, 'MonsGeek Black Wrist Rest màu đen'),
      attributeNames: ['Loại'],
      variants: [
        { id: 'wr-g-87', productId: 'p-wr-g', attributes: { Loại: 'Black 87' }, price: 250000, specs: [{ name: 'Dùng cho', value: 'Bàn phím 87 phím' }, { name: 'Màu', value: 'Đen' }] },
        { id: 'wr-g-98', productId: 'p-wr-g', attributes: { Loại: 'Black 98' }, price: 250000, specs: [{ name: 'Dùng cho', value: 'Bàn phím 98 phím' }, { name: 'Màu', value: 'Đen' }] },
      ],
      relatedIds: ['p-kc-h', 'p-pm-f'],
    },

    // ---- Keycap ----
    {
      id: 'p-kc-h',
      slug: 'veekos-gradient-pbt',
      name: 'Veekos Gradient PBT',
      category: 'keycap',
      kind: 'single',
      shortDescription: 'Bộ 135 keycap PBT chuyển màu, ba tông Black & Pink, Blaze và Rose Latte.',
      description:
        'Bộ 135 nút PBT double-shot profile Cherry với ba tông chuyển màu, đủ phím cho hầu hết layout phổ biến. Kiểm tra layout bàn phím của bạn trước khi mua.',
      usage: null,
      includes: ['Bộ 135 keycap'],
      images: [
        ...gallery('veekos-gradient-pbt', 4, 'Keycap Veekos Gradient PBT màu Black & Pink', { file: 'black-pink', attr: 'Màu', value: 'Black & Pink' }),
        ...gallery('veekos-gradient-pbt', 4, 'Keycap Veekos Gradient PBT màu Blaze', { file: 'blaze', attr: 'Màu', value: 'Blaze' }),
        ...gallery('veekos-gradient-pbt', 4, 'Keycap Veekos Gradient PBT màu Rose Latte', { file: 'rose-latte', attr: 'Màu', value: 'Rose Latte' }),
      ],
      attributeNames: ['Màu'],
      variants: [
        { id: 'kc-h-grad-bp', productId: 'p-kc-h', attributes: { Màu: 'Black & Pink' }, price: 245000, specs: [{ name: 'Số nút', value: '135' }, { name: 'Chất liệu', value: 'PBT double-shot' }, { name: 'Profile', value: 'Cherry' }] },
        { id: 'kc-h-grad-bl', productId: 'p-kc-h', attributes: { Màu: 'Blaze' }, price: 245000, specs: [{ name: 'Số nút', value: '135' }, { name: 'Chất liệu', value: 'PBT double-shot' }, { name: 'Profile', value: 'Cherry' }] },
        { id: 'kc-h-grad-rl', productId: 'p-kc-h', attributes: { Màu: 'Rose Latte' }, price: 245000, specs: [{ name: 'Số nút', value: '135' }, { name: 'Chất liệu', value: 'PBT double-shot' }, { name: 'Profile', value: 'Cherry' }] },
      ],
      relatedIds: ['p-cp-q', 'p-kt-i'],
    },
    {
      id: 'p-cp-q',
      slug: 'akko-monsgeek-cat-paws',
      name: 'AKKO x MonsGeek Cat Paws',
      category: 'keycap',
      kind: 'single',
      shortDescription: 'Bộ 4 keycap artisan hình chân mèo tông trắng hồng, thay Esc hoặc WASD.',
      description: 'Bốn keycap điểm nhấn hình chân mèo để thay Esc và các phím WASD, phối màu với deskmat mà chỉ cần đổi một nhóm phím nhỏ.',
      usage: null,
      includes: ['Bộ 4 keycap'],
      images: gallery('akko-monsgeek-cat-paws', 4, 'Bộ 4 keycap AKKO x MonsGeek Cat Paws trắng hồng'),
      attributeNames: [],
      variants: [
        { id: 'kc-h-paws', productId: 'p-cp-q', attributes: {}, price: 119000, specs: [{ name: 'Loại', value: 'Keycap artisan điểm nhấn' }, { name: 'Số nút', value: '4' }] },
      ],
      relatedIds: ['p-kc-h', 'p-kt-i'],
    },

    // ---- Khay keycap ----
    {
      id: 'p-kt-i',
      slug: 'pbtfans-keycap-trays',
      name: 'PBTfans Keycap Trays',
      category: 'khay-keycap',
      kind: 'single',
      shortDescription: 'Cặp khay chia ô cất keycap dư, hai màu Trắng và Đen.',
      description: 'Khay chia ô giữ keycap thay ra khỏi bụi và thất lạc, có nắp đậy. Dành cho người hay thay keycap.',
      usage: null,
      includes: ['Một cặp khay'],
      images: [
        ...gallery('pbtfans-keycap-trays', 4, 'Khay keycap PBTfans màu trắng', { file: 'trang', attr: 'Màu', value: 'Trắng' }),
        ...gallery('pbtfans-keycap-trays', 4, 'Khay keycap PBTfans màu đen', { file: 'den', attr: 'Màu', value: 'Đen' }),
      ],
      attributeNames: ['Màu'],
      variants: [
        { id: 'kt-i-clear', productId: 'p-kt-i', attributes: { Màu: 'Trắng' }, price: 330000, specs: [{ name: 'Quy cách', value: '1 cặp khay' }] },
        { id: 'kt-i-smoke', productId: 'p-kt-i', attributes: { Màu: 'Đen' }, price: 330000, specs: [{ name: 'Quy cách', value: '1 cặp khay' }] },
      ],
      relatedIds: ['p-kc-h', 'p-cp-q'],
    },

    // ---- Kẹp dây ----
    {
      id: 'p-cb-c',
      slug: 'kep-day-clip',
      name: 'Kẹp dây Clip',
      category: 'kep-day',
      kind: 'single',
      shortDescription: 'Kẹp silicone giữ dây sạc và dây tai nghe luôn đúng chỗ trên mặt bàn.',
      description: 'Gắn mép bàn hoặc mặt dưới bàn, giữ dây không rơi xuống sàn. Có hai loại theo số rãnh.',
      usage: null,
      includes: ['Kẹp dây'],
      images: [
        { src: '/images/kep-day-3-ranh.jpg', alt: 'Kẹp dây Clip loại 3 rãnh màu đen', match: { Loại: '3 rãnh' } },
        { src: '/images/kep-day-5-ranh.jpg', alt: 'Kẹp dây Clip loại 5 rãnh màu đen', match: { Loại: '5 rãnh' } },
      ],
      attributeNames: ['Loại'],
      variants: [
        { id: 'cb-c-3', productId: 'p-cb-c', attributes: { Loại: '3 rãnh' }, price: 39000, specs: [{ name: 'Chất liệu', value: 'Silicone' }, { name: 'Cách gắn', value: 'Miếng dán mặt sau' }] },
        { id: 'cb-c-5', productId: 'p-cb-c', attributes: { Loại: '5 rãnh' }, price: 59000, specs: [{ name: 'Chất liệu', value: 'Silicone' }, { name: 'Cách gắn', value: 'Miếng dán mặt sau' }] },
      ],
      relatedIds: ['p-vl-j', 'p-dm-a'],
    },

    // ---- Dây buộc cáp ----
    {
      id: 'p-vl-j',
      slug: 'baseus-rainbow-circle-velcro',
      name: 'Baseus Rainbow Circle Velcro',
      category: 'day-buoc',
      kind: 'single',
      shortDescription: 'Cuộn dây velcro dùng lại nhiều lần để gom dây thừa và cố định bó dây.',
      description: 'Cắt theo độ dài cần dùng để gom phần dây thừa hoặc cố định một bó dây sau bàn. Mở ra buộc lại được nhiều lần, không để lại keo.',
      usage: null,
      includes: ['Cuộn dây buộc'],
      images: gallery('baseus-rainbow-circle-velcro', 2, 'Cuộn dây buộc cáp Baseus Rainbow Circle Velcro'),
      attributeNames: ['Dài'],
      variants: [
        { id: 'vl-j-mc-1', productId: 'p-vl-j', attributes: { Dài: '1 m' }, price: 59000, specs: [{ name: 'Chất liệu', value: 'Velcro' }] },
        { id: 'vl-j-mc-3', productId: 'p-vl-j', attributes: { Dài: '3 m' }, price: 89000, specs: [{ name: 'Chất liệu', value: 'Velcro' }] },
      ],
      relatedIds: ['p-sl-k', 'p-cb-c'],
    },

    // ---- Ống bọc dây ----
    {
      id: 'p-sl-k',
      slug: 'startech-wkstncm',
      name: 'StarTech WKSTNCM',
      category: 'ong-boc',
      kind: 'single',
      shortDescription: 'Ống bọc dây vải đen dài 2 m, gom nhiều dây chạy chung một đường.',
      description: 'Che cả đoạn dây dài, gom các dây chạy cùng hướng thành một bó gọn. Vỏ vải dệt mềm, cắt được theo độ dài cần dùng.',
      usage: null,
      includes: ['Ống bọc dây 2 m'],
      images: gallery('startech-wkstncm', 4, 'Ống bọc dây StarTech WKSTNCM vải đen'),
      attributeNames: [],
      variants: [
        { id: 'sl-k-2-black', productId: 'p-sl-k', attributes: {}, price: 550000, specs: [{ name: 'Chiều dài', value: '2 m' }, { name: 'Chất liệu', value: 'Vải dệt, màu đen' }] },
      ],
      relatedIds: ['p-vl-j', 'p-tr-l'],
    },

    // ---- Khay dưới bàn ----
    {
      id: 'p-tr-l',
      slug: 'hyperwork-hpw-cm01-blk',
      name: 'HyperWork HPW-CM01-BLK',
      category: 'khay-duoi-ban',
      kind: 'single',
      shortDescription: 'Khay giấu dây màu đen kẹp dưới mặt bàn, để ổ cắm, củ sạc và dây thừa.',
      description: 'Gắn bằng kẹp vào mép bàn, không cần khoan. Đặt ổ cắm và củ sạc khuất tầm mắt, hợp khi vấn đề là thiếu chỗ chứa cả cụm thiết bị.',
      usage: null,
      includes: ['Khay', 'Bộ kẹp'],
      images: gallery('hyperwork-hpw-cm01-blk', 4, 'Khay giấu dây HyperWork HPW-CM01 màu đen'),
      attributeNames: [],
      variants: [
        { id: 'tr-l-black', productId: 'p-tr-l', attributes: {}, price: 329000, specs: [{ name: 'Màu', value: 'Đen' }, { name: 'Cách gắn', value: 'Kẹp mép bàn' }] },
      ],
      relatedIds: ['p-tw-r', 'p-sl-k'],
    },
    {
      id: 'p-tw-r',
      slug: 'hyperwork-hpw-cm01-wht',
      name: 'HyperWork HPW-CM01-WHT',
      category: 'khay-duoi-ban',
      kind: 'single',
      shortDescription: 'Khay giấu dây màu trắng kẹp dưới mặt bàn, để ổ cắm, củ sạc và dây thừa.',
      description: 'Gắn bằng kẹp vào mép bàn, không cần khoan. Bản màu trắng hợp với bàn sáng màu, giữ ổ cắm và củ sạc khuất tầm mắt.',
      usage: null,
      includes: ['Khay', 'Bộ kẹp'],
      images: gallery('hyperwork-hpw-cm01-wht', 4, 'Khay giấu dây HyperWork HPW-CM01 màu trắng'),
      attributeNames: [],
      variants: [
        { id: 'tr-l-white', productId: 'p-tw-r', attributes: {}, price: 329000, specs: [{ name: 'Màu', value: 'Trắng' }, { name: 'Cách gắn', value: 'Kẹp mép bàn' }] },
      ],
      relatedIds: ['p-tr-l', 'p-sl-k'],
    },

    // ---- Móc tai nghe ----
    {
      id: 'p-hh-o',
      slug: 'brainwavz-bigt',
      name: 'Brainwavz BigT',
      category: 'moc-tai-nghe',
      kind: 'single',
      shortDescription: 'Móc treo đôi dưới mặt bàn, treo được hai tai nghe cùng lúc.',
      description: 'Dán dưới mặt bàn bằng băng keo 3M VHB, treo hai tai nghe mà không chiếm chỗ trên mặt bàn.',
      usage: null,
      includes: ['Móc treo', 'Băng keo 3M VHB'],
      images: gallery('brainwavz-bigt', 8, 'Móc treo tai nghe đôi Brainwavz BigT màu đen'),
      attributeNames: [],
      variants: [
        { id: 'hh-o-dual', productId: 'p-hh-o', attributes: {}, price: 319000, specs: [{ name: 'Loại', value: 'Treo đôi' }, { name: 'Màu', value: 'Đen' }] },
      ],
      relatedIds: ['p-uj-s', 'p-tr-l'],
    },
    {
      id: 'p-uj-s',
      slug: 'brainwavz-ultra-j',
      name: 'Brainwavz Ultra-J',
      category: 'moc-tai-nghe',
      kind: 'single',
      shortDescription: 'Móc treo tai nghe dưới bàn có móc giữ dây tích hợp.',
      description: 'Một móc treo tai nghe kèm móc giữ dây, dán dưới mặt bàn bằng băng keo 3M VHB. Giữ cả tai nghe lẫn dây gọn một chỗ.',
      usage: null,
      includes: ['Móc treo', 'Băng keo 3M VHB'],
      images: gallery('brainwavz-ultra-j', 6, 'Móc treo tai nghe Brainwavz Ultra-J màu đen'),
      attributeNames: [],
      variants: [
        { id: 'hh-o-single', productId: 'p-uj-s', attributes: {}, price: 361000, specs: [{ name: 'Loại', value: 'Một móc, có móc giữ dây' }, { name: 'Màu', value: 'Đen' }] },
      ],
      relatedIds: ['p-hh-o', 'p-tr-l'],
    },

    // ---- Đồ để bàn ----
    {
      id: 'p-ph-m',
      slug: 'gia-do-dien-thoai',
      name: 'Giá đỡ điện thoại có khe đi dây',
      category: 'do-de-ban',
      kind: 'single',
      shortDescription: 'Giá đặt điện thoại cố định, có khe đi dây để vừa dùng vừa sạc.',
      description: 'Một vị trí cố định cho điện thoại trên bàn. Khe dây giúp bạn dùng máy khi đang cắm sạc. Có bản lớn và bản nhỏ.',
      usage: null,
      includes: ['Giá đỡ'],
      images: [
        { src: '/images/gia-do-dien-thoai-trang.jpg', alt: 'Giá đỡ điện thoại có khe đi dây (ảnh mẫu màu trắng, bản màu đen cùng kiểu dáng)' },
      ],
      attributeNames: ['Cỡ', 'Màu'],
      variants: [
        { id: 'ph-m-l-black', productId: 'p-ph-m', attributes: { Cỡ: 'Lớn', Màu: 'Đen' }, price: 104000, specs: [{ name: 'Kích thước', value: '96 × 85 × 21 mm' }] },
        { id: 'ph-m-l-white', productId: 'p-ph-m', attributes: { Cỡ: 'Lớn', Màu: 'Trắng' }, price: 98000, specs: [{ name: 'Kích thước', value: '96 × 85 × 21 mm' }] },
        { id: 'ph-m-s-black', productId: 'p-ph-m', attributes: { Cỡ: 'Nhỏ', Màu: 'Đen' }, price: 80000, specs: [{ name: 'Kích thước', value: '95 × 75 × 18 mm' }] },
        { id: 'ph-m-s-white', productId: 'p-ph-m', attributes: { Cỡ: 'Nhỏ', Màu: 'Trắng' }, price: 70000, specs: [{ name: 'Kích thước', value: '95 × 75 × 18 mm' }] },
      ],
      relatedIds: ['p-tw-n', 'p-tr-l'],
    },
    {
      id: 'p-tw-n',
      slug: 'khay-de-do-nho',
      name: 'Khay để đồ nhỏ',
      category: 'do-de-ban',
      kind: 'single',
      shortDescription: 'Khay gom USB, đầu chuyển và đồ dùng nhỏ vào một chỗ.',
      description: 'Dọn mặt bàn bằng cách gom đồ nhỏ vào khay. Bốn cỡ khay màu be xếp ghép được, hoặc khay xám nhạt gắn bàn và tường.',
      usage: null,
      includes: ['Khay'],
      images: [
        { src: '/images/khay-nho-nojig.jpg', alt: 'Bộ khay đồ nhỏ màu be', match: { Loại: ['Be 10 × 10 cm', 'Be 10 × 20 cm', 'Be 15 × 20 cm', 'Be 20 × 25 cm'] } },
        { src: '/images/khay-nho-fodertrag.jpg', alt: 'Khay đồ nhỏ xám nhạt gắn bàn', match: { Loại: 'Xám nhạt gắn bàn' } },
      ],
      attributeNames: ['Loại'],
      variants: [
        { id: 'tw-n-1', productId: 'p-tw-n', attributes: { Loại: 'Be 10 × 10 cm' }, price: 7000, specs: [{ name: 'Kích thước', value: '4 × 4 × 2 in' }] },
        { id: 'tw-n-2', productId: 'p-tw-n', attributes: { Loại: 'Be 10 × 20 cm' }, price: 10000, specs: [{ name: 'Kích thước', value: '4 × 7¾ × 2 in' }] },
        { id: 'tw-n-3', productId: 'p-tw-n', attributes: { Loại: 'Be 15 × 20 cm' }, price: 12000, specs: [{ name: 'Kích thước', value: '6 × 7¾ × 2 in' }] },
        { id: 'tw-n-4', productId: 'p-tw-n', attributes: { Loại: 'Be 20 × 25 cm' }, price: 25000, specs: [{ name: 'Kích thước', value: '7¾ × 9¾ × 4 in' }] },
        { id: 'tw-n-5', productId: 'p-tw-n', attributes: { Loại: 'Xám nhạt gắn bàn' }, price: 137000, specs: [] },
      ],
      relatedIds: ['p-ph-m', 'p-hh-o'],
    },
  ],
};
