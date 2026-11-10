/** Tên cửa hàng; đổi một chỗ này là đổi toàn bộ giao diện. */
export const BRAND_NAME = 'Tam Thái Tử Store';
export const COURSE_CREDIT = 'Dự án môn E-Business, Hanoi University';

export const MAX_QTY = 99;
export const QTY_ERROR = `Số lượng phải là số nguyên từ 1 đến ${MAX_QTY}.`;

/** ID sản phẩm hiển thị ở dải "Sản phẩm nổi bật" trên trang chủ. */
export const FEATURED_IDS = ['p-dm-a', 'p-pm-f', 'p-rz-p', 'p-wr-g', 'p-kc-h', 'p-pg-e'];

/** ID sản phẩm ở dải "Mới về" trên trang chủ. */
export const NEW_IDS = ['p-cp-q', 'p-kt-i', 'p-hh-o', 'p-uj-s', 'p-tr-l', 'p-tw-r'];

/**
 * Ba ô ảnh bên phải mega-menu "Sản phẩm" (ô đầu rộng gấp đôi).
 * Các cột chữ của mega-menu lấy tự động từ CATEGORIES và catalog (xem SiteHeader).
 */
export const MEGA_TILES: { label: string; to: string; src: string; alt: string }[] = [
  { label: 'Deskmat Slate', to: '/products/deskmat-slate', src: '/images/combo-slate-clip.jpg', alt: 'Deskmat Slate đen trên bàn gỗ cùng bàn phím, chuột và kẹp dây' },
  { label: 'Pad Logitech', to: '/products/logitech-mouse-pad-studio-series', src: '/images/products/logitech-mouse-pad-studio-series/dark-rose-1.jpg', alt: 'Logitech Mouse Pad Studio Series màu Dark Rose' },
  { label: 'Keycap Veekos', to: '/products/veekos-gradient-pbt', src: '/images/products/veekos-gradient-pbt/rose-latte-1.jpg', alt: 'Keycap Veekos Gradient PBT màu Rose Latte' },
];
