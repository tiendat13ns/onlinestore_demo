import type { CategoryId } from './types';

/** Tên cửa hàng; đổi một chỗ này là đổi toàn bộ giao diện. */
export const BRAND_NAME = 'Tam Thái Tử Store';
export const COURSE_CREDIT = 'Dự án môn E-Business, Hanoi University';

export const MAX_QTY = 99;
export const QTY_ERROR = `Số lượng phải là số nguyên từ 1 đến ${MAX_QTY}.`;

/** ID sản phẩm hiển thị ở trang chủ. */
export const FEATURED_IDS = ['p-dm-a', 'p-pg-e', 'p-pm-f', 'p-wr-g', 'p-ph-m'];

/** ID sản phẩm ở dải "Mới về" trên trang chủ: các phụ kiện vừa thêm vào cửa hàng. */
export const NEW_IDS = ['p-hh-o', 'p-kc-h', 'p-kt-i', 'p-tw-n'];

/** ID sản phẩm ở dải "Quản lý dây gọn gàng" trên trang chủ. */
export const CABLE_IDS = ['p-cb-c', 'p-vl-j', 'p-sl-k', 'p-tr-l'];

/** Sản phẩm được giới thiệu ở banner giữa trang chủ. */
export const PROMO_ID = 'p-bd-d';

/** Nhóm con hiển thị khi đã chọn một nhóm lớn ở trang Sản phẩm (lọc bằng ?group=). */
export const SUBGROUPS: Partial<Record<CategoryId, { id: string; label: string; productIds: string[] }[]>> = {
  deskmat: [
    { id: 'deskmat', label: 'Deskmat', productIds: ['p-dm-a', 'p-dm-b'] },
    { id: 'pad', label: 'Pad chuột', productIds: ['p-pg-e', 'p-pm-f'] },
  ],
  accessory: [
    { id: 'ban-phim', label: 'Bàn phím', productIds: ['p-wr-g', 'p-kc-h', 'p-kt-i'] },
    { id: 'do-ban', label: 'Đồ để bàn', productIds: ['p-ph-m', 'p-tw-n', 'p-hh-o'] },
  ],
};

/** Mega-menu "Sản phẩm" ở header: mỗi cột là một nhóm, liệt kê các sản phẩm theo ID. */
export const MEGA_MENU: { heading: string; to: string; ids: string[] }[] = [
  { heading: 'Deskmat', to: '/products?category=deskmat&group=deskmat', ids: ['p-dm-a', 'p-dm-b'] },
  { heading: 'Pad chuột', to: '/products?category=deskmat&group=pad', ids: ['p-pg-e', 'p-pm-f'] },
  { heading: 'Phụ kiện bàn phím', to: '/products?category=accessory&group=ban-phim', ids: ['p-wr-g', 'p-kc-h', 'p-kt-i'] },
  { heading: 'Đồ để bàn', to: '/products?category=accessory&group=do-ban', ids: ['p-ph-m', 'p-tw-n', 'p-hh-o'] },
  { heading: 'Quản lý dây', to: '/products?category=cable', ids: ['p-cb-c', 'p-vl-j', 'p-sl-k', 'p-tr-l'] },
  { heading: 'Bộ sản phẩm', to: '/products?category=bundle', ids: ['p-bd-d'] },
];

/** Ba ô ảnh bên phải mega-menu (ô đầu rộng gấp đôi). */
export const MEGA_TILES: { label: string; to: string; src: string; alt: string }[] = [
  { label: 'Bộ Setup Essentials', to: '/products/bo-setup-essentials', src: '/images/combo-slate-clip.jpg', alt: 'Deskmat Slate, bàn phím, chuột và kẹp dây trên bàn gỗ' },
  { label: 'Deskmat Slate', to: '/products/deskmat-slate', src: '/images/deskmat-slate-xam.jpg', alt: 'Deskmat Slate màu xám' },
  { label: 'Keycap điểm nhấn', to: '/products/keycap-diem-nhan', src: '/images/keycap-veekos-roselatte-1.jpg', alt: 'Bộ keycap chuyển màu Rose Latte' },
];
