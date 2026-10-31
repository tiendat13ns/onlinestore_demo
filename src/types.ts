export type CategoryId = 'deskmat' | 'cable' | 'bundle';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'deskmat', label: 'Deskmat', description: 'Tấm lót bàn cho góc làm việc và chơi game.' },
  { id: 'cable', label: 'Quản lý dây', description: 'Phụ kiện giữ dây gọn gàng trên bàn.' },
  { id: 'bundle', label: 'Bộ sản phẩm', description: 'Các bộ phối sẵn để bắt đầu nhanh.' },
];

export function isCategory(value: string | null): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

export interface ProductImage {
  src?: string;
  alt: string;
}

export interface Spec {
  name: string;
  /** null = không có giá trị → ẩn dòng này khi hiển thị */
  value: string | null;
}

export interface BundleComponent {
  variantId: string;
  quantity: number;
}

export interface Variant {
  id: string;
  productId: string;
  /** Ví dụ { Cỡ: 'M', Màu: 'Đen' }. Chỉ các tổ hợp hợp lệ mới có variant. */
  attributes: Record<string, string>;
  /** Số nguyên đơn vị tiền nhỏ nhất; null = chưa có giá (không được coi là 0). */
  price: number | null;
  specs: Spec[];
  image?: ProductImage;
  /** Chỉ có với biến thể của bộ sản phẩm. */
  components?: BundleComponent[];
  /** Từ server; false → hết hàng. Không lộ số tồn kho ra storefront. */
  inStock?: boolean;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: CategoryId;
  kind: 'single' | 'bundle';
  shortDescription: string;
  description: string;
  usage: string | null;
  /** Mua riêng gồm những gì; null = chưa có dữ liệu. */
  includes: string[] | null;
  images: ProductImage[];
  attributeNames: string[];
  variants: Variant[];
  relatedIds: string[];
}

export interface Catalog {
  /** Mã ISO 4217; null = chưa xác nhận. */
  currency: string | null;
  products: Product[];
}

export interface CartLine {
  variantId: string;
  quantity: number;
}

export interface OrderLine {
  variantId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  components: string[];
}

export type OrderStatus = 'pending' | 'confirmed' | 'shipping' | 'completed' | 'cancelled';

export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  shipping: 'Đang giao',
  completed: 'Hoàn tất',
  cancelled: 'Đã hủy',
};

export interface Order {
  code: string;
  createdAt: string;
  status: OrderStatus;
  currency: string | null;
  lines: OrderLine[];
  subtotal: number;
  customerName?: string;
}

/** Đơn đầy đủ cho admin. */
export interface AdminOrder extends Order {
  customerPhone: string;
  customerAddress: string;
}
