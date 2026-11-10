/** Nhóm sản phẩm. Các nhóm có ảnh trong folder "Week 2" mang đúng tên folder đó. */
export type CategoryId =
  | 'deskmat'
  | 'pad-nho'
  | 'ke-tay'
  | 'keycap'
  | 'khay-keycap'
  | 'kep-day'
  | 'day-buoc'
  | 'ong-boc'
  | 'khay-duoi-ban'
  | 'moc-tai-nghe'
  | 'do-de-ban';

export interface CategoryInfo {
  id: CategoryId;
  label: string;
  description: string;
}

export const CATEGORIES: CategoryInfo[] = [
  { id: 'deskmat', label: 'Deskmat', description: 'Tấm lót bàn và pad cỡ lớn cho góc làm việc và chơi game.' },
  { id: 'pad-nho', label: 'Pad chuột size nhỏ', description: 'Pad chuột nhỏ gọn cho bàn hẹp hoặc chỉ lót khu vực chuột.' },
  { id: 'ke-tay', label: 'Kê tay', description: 'Đệm tựa cổ tay trước bàn phím.' },
  { id: 'keycap', label: 'Keycap', description: 'Bộ keycap và keycap điểm nhấn để phối màu.' },
  { id: 'khay-keycap', label: 'Khay keycap', description: 'Khay cất keycap dư và dụng cụ tháo phím.' },
  { id: 'kep-day', label: 'Kẹp dây', description: 'Kẹp giữ đầu dây đúng chỗ trên mặt bàn.' },
  { id: 'day-buoc', label: 'Dây buộc cáp', description: 'Dây velcro gom dây thừa, dùng lại nhiều lần.' },
  { id: 'ong-boc', label: 'Ống bọc dây', description: 'Gom nhiều dây chạy chung một đường.' },
  { id: 'khay-duoi-ban', label: 'Khay dưới bàn', description: 'Khay kẹp dưới mặt bàn để ổ cắm, củ sạc và dây thừa.' },
  { id: 'moc-tai-nghe', label: 'Móc tai nghe', description: 'Móc treo tai nghe dưới mặt bàn.' },
  { id: 'do-de-ban', label: 'Đồ để bàn', description: 'Giá đỡ điện thoại và khay đồ nhỏ.' },
];

export function isCategory(value: string | null): value is CategoryId {
  return CATEGORIES.some((c) => c.id === value);
}

export interface ProductImage {
  src?: string;
  alt: string;
  /** Ảnh dành cho biến thể này (ví dụ { Màu: 'Đen' }, hoặc nhiều giá trị { Loại: ['Be 10 cm', 'Be 20 cm'] }); chọn đúng thuộc tính thì gallery tự chuyển sang ảnh. */
  match?: Record<string, string | string[]>;
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

/** Tên trạng thái hiển thị cho khách: đi theo đúng hành trình của một đơn hàng. */
export const STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Đặt hàng thành công',
  confirmed: 'Shop liên hệ xác nhận đơn hàng',
  shipping: 'Đơn hàng đang trên đường vận chuyển',
  completed: 'Đơn hàng đã hoàn thành',
  cancelled: 'Đơn hàng đã bị hủy',
};

/** Một câu giải thích cho khách biết đơn đang ở đâu và bước tiếp theo là gì. */
export const STATUS_NOTES: Record<OrderStatus, string> = {
  pending: 'Cảm ơn bạn đã đặt hàng. Shop sẽ sớm liên hệ qua số điện thoại của bạn để xác nhận đơn.',
  confirmed: 'Shop đã liên hệ và xác nhận đơn. Đơn đang được chuẩn bị để giao cho bạn.',
  shipping: 'Đơn đang trên đường đến bạn. Vui lòng giữ máy và chuẩn bị tiền thanh toán khi nhận hàng.',
  completed: 'Đơn đã được giao thành công. Cảm ơn bạn đã mua hàng!',
  cancelled: 'Đơn hàng đã bị hủy. Nếu cần hỗ trợ, hãy liên hệ shop kèm mã đơn.',
};

/** Nhãn ngắn cho trang quản trị (nút chuyển trạng thái). */
export const STATUS_ADMIN_LABELS: Record<OrderStatus, string> = {
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
  /** Chỉ có khi đã xác thực bằng số điện thoại (người đặt đơn hoặc admin). */
  customerPhone?: string;
  customerAddress?: string;
}

/** Đơn đầy đủ cho admin. */
export interface AdminOrder extends Order {
  customerPhone: string;
  customerAddress: string;
}
