import { randomBytes } from 'node:crypto';
import type { BundleComponent, Catalog, Product, ProductImage, Spec, Variant } from '../src/types';
import { all, get, getCurrency, run, transaction } from './db';

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: Product['category'];
  kind: Product['kind'];
  short_description: string;
  description: string;
  usage: string | null;
  includes: string | null;
  images: string;
  attribute_names: string;
  related_ids: string;
}

interface VariantRow {
  id: string;
  product_id: string;
  attributes: string;
  price: number | null;
  stock: number;
  specs: string;
  components: string | null;
}

const parse = <T>(text: string | null): T | null => (text === null ? null : (JSON.parse(text) as T));

type AdminVariant = Variant & { stock: number };
type AdminProduct = Omit<Product, 'variants'> & { variants: AdminVariant[] };

function toVariant(row: VariantRow): AdminVariant {
  const components = parse<BundleComponent[]>(row.components);
  return {
    id: row.id,
    productId: row.product_id,
    attributes: parse<Record<string, string>>(row.attributes) ?? {},
    price: row.price,
    specs: parse<Spec[]>(row.specs) ?? [],
    ...(components ? { components } : {}),
    stock: row.stock,
  };
}

function loadProducts(): AdminProduct[] {
  const variants = all<VariantRow>('SELECT * FROM variants ORDER BY sort_order');
  return all<ProductRow>('SELECT * FROM products ORDER BY sort_order').map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    kind: p.kind,
    shortDescription: p.short_description,
    description: p.description,
    usage: p.usage,
    includes: parse<string[]>(p.includes),
    images: parse<ProductImage[]>(p.images) ?? [],
    attributeNames: parse<string[]>(p.attribute_names) ?? [],
    relatedIds: parse<string[]>(p.related_ids) ?? [],
    variants: variants.filter((v) => v.product_id === p.id).map(toVariant),
  }));
}

/** Catalog công khai: chỉ lộ `inStock`, không lộ số tồn kho. */
export function publicCatalog(): Catalog {
  const products = loadProducts().map((p) => ({
    ...p,
    variants: p.variants.map(({ stock, ...v }) => ({ ...v, inStock: stock > 0 })),
  }));
  return { currency: getCurrency(), isFixture: true, products };
}

export function adminProducts() {
  return loadProducts();
}

export function updateVariant(id: string, patch: { price?: unknown; stock?: unknown }) {
  const existing = get<VariantRow>('SELECT * FROM variants WHERE id = ?', id);
  if (!existing) throw new HttpError(404, 'Không tìm thấy biến thể.');

  let price = existing.price;
  let stock = existing.stock;
  if ('price' in patch) {
    if (patch.price !== null && !(Number.isInteger(patch.price) && (patch.price as number) >= 0)) {
      throw new HttpError(400, 'Giá phải là số nguyên không âm hoặc null.');
    }
    price = patch.price as number | null;
  }
  if ('stock' in patch) {
    if (!(Number.isInteger(patch.stock) && (patch.stock as number) >= 0)) {
      throw new HttpError(400, 'Tồn kho phải là số nguyên không âm.');
    }
    stock = patch.stock as number;
  }
  run('UPDATE variants SET price = ?, stock = ? WHERE id = ?', price, stock, id);
  return toVariant({ ...existing, price, stock });
}

// ---- Đơn hàng ----

export const STATUSES = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'] as const;
export type OrderStatus = (typeof STATUSES)[number];

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

interface OrderRow {
  code: string;
  created_at: string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  currency: string;
  subtotal: number;
}

interface LineRow {
  variant_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  components: string;
}

function toOrder(row: OrderRow, includeContact: boolean) {
  const lines = all<LineRow>('SELECT * FROM order_lines WHERE order_code = ? ORDER BY id', row.code).map((l) => ({
    variantId: l.variant_id,
    name: l.name,
    quantity: l.quantity,
    unitPrice: l.unit_price,
    lineTotal: l.line_total,
    components: parse<string[]>(l.components) ?? [],
  }));
  return {
    code: row.code,
    createdAt: row.created_at,
    status: row.status,
    currency: row.currency,
    subtotal: row.subtotal,
    lines,
    customerName: row.customer_name,
    // SĐT và địa chỉ chỉ trả cho admin; tra cứu công khai theo mã không lộ.
    ...(includeContact ? { customerPhone: row.customer_phone, customerAddress: row.customer_address } : {}),
  };
}

function text(value: unknown, label: string, max: number): string {
  if (typeof value !== 'string' || !value.trim()) throw new HttpError(400, `Vui lòng nhập ${label}.`);
  const trimmed = value.trim();
  if (trimmed.length > max) throw new HttpError(400, `${label} quá dài (tối đa ${max} ký tự).`);
  return trimmed;
}

function newCode(): string {
  for (;;) {
    const code = `DEMO-${randomBytes(4).toString('hex').toUpperCase()}`;
    if (!get('SELECT 1 FROM orders WHERE code = ?', code)) return code;
  }
}

export function createOrder(body: unknown) {
  const input = body as { lines?: unknown; customer?: Record<string, unknown> };
  const name = text(input?.customer?.name, 'họ tên', 100);
  const phone = text(input?.customer?.phone, 'số điện thoại', 30);
  const address = text(input?.customer?.address, 'địa chỉ', 300);

  if (!Array.isArray(input.lines) || input.lines.length === 0 || input.lines.length > 50) {
    throw new HttpError(400, 'Giỏ hàng trống hoặc không hợp lệ.');
  }
  // Gộp dòng trùng variant; kiểm tra số lượng 1–99 cho từng dòng gửi lên.
  const wanted = new Map<string, number>();
  for (const l of input.lines as { variantId?: unknown; quantity?: unknown }[]) {
    if (typeof l?.variantId !== 'string' || !Number.isInteger(l.quantity) || (l.quantity as number) < 1 || (l.quantity as number) > 99) {
      throw new HttpError(400, 'Số lượng phải là số nguyên từ 1 đến 99.');
    }
    wanted.set(l.variantId, (wanted.get(l.variantId) ?? 0) + (l.quantity as number));
  }

  const currency = getCurrency();
  if (!currency) throw new HttpError(400, 'Đơn vị tiền chưa được nhóm xác nhận.');

  return transaction(() => {
    const code = newCode();
    const createdAt = new Date().toISOString();
    let subtotal = 0;
    const lines: { variantId: string; name: string; quantity: number; price: number; components: string[] }[] = [];

    for (const [variantId, quantity] of wanted) {
      if (quantity > 99) throw new HttpError(400, 'Tổng số lượng vượt giới hạn demo 99.');
      const row = get<VariantRow & { product_name: string }>(
        'SELECT v.*, p.name AS product_name FROM variants v JOIN products p ON p.id = v.product_id WHERE v.id = ?',
        variantId,
      );
      if (!row) throw new HttpError(400, 'Có sản phẩm không còn trong catalog.');
      const variant = toVariant(row);
      const label = Object.values(variant.attributes).join(' / ');
      const display = label ? `${row.product_name} (${label})` : row.product_name;
      if (variant.price === null) throw new HttpError(400, `${display}: giá chưa được xác nhận.`);
      if (variant.stock < quantity) throw new HttpError(409, `${display}: không đủ hàng.`);

      run('UPDATE variants SET stock = stock - ? WHERE id = ?', quantity, variantId);
      const components = (variant.components ?? []).map((c) => {
        const child = get<{ product_name: string; attributes: string }>(
          'SELECT p.name AS product_name, v.attributes FROM variants v JOIN products p ON p.id = v.product_id WHERE v.id = ?',
          c.variantId,
        );
        const childLabel = child ? Object.values(JSON.parse(child.attributes) as Record<string, string>).join(' / ') : '';
        return `${c.quantity} × ${child ? (childLabel ? `${child.product_name} (${childLabel})` : child.product_name) : c.variantId}`;
      });
      lines.push({ variantId, name: display, quantity, price: variant.price, components });
      subtotal += variant.price * quantity;
    }

    run(
      'INSERT INTO orders (code, created_at, status, customer_name, customer_phone, customer_address, currency, subtotal) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      code, createdAt, 'pending', name, phone, address, currency, subtotal,
    );
    for (const l of lines) {
      run(
        'INSERT INTO order_lines (order_code, variant_id, name, quantity, unit_price, line_total, components) VALUES (?, ?, ?, ?, ?, ?, ?)',
        code, l.variantId, l.name, l.quantity, l.price, l.price * l.quantity, JSON.stringify(l.components),
      );
    }
    return toOrder(get<OrderRow>('SELECT * FROM orders WHERE code = ?', code)!, false);
  });
}

export function findOrder(code: string, includeContact = false) {
  const row = get<OrderRow>('SELECT * FROM orders WHERE code = ?', code);
  return row ? toOrder(row, includeContact) : null;
}

export function listOrders() {
  return all<OrderRow>('SELECT * FROM orders ORDER BY created_at DESC').map((r) => toOrder(r, true));
}

export function changeStatus(code: string, next: unknown) {
  if (!STATUSES.includes(next as OrderStatus)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  return transaction(() => {
    const row = get<OrderRow>('SELECT * FROM orders WHERE code = ?', code);
    if (!row) throw new HttpError(404, 'Không tìm thấy đơn.');
    if (!NEXT[row.status].includes(next as OrderStatus)) {
      throw new HttpError(409, `Không thể chuyển từ ${row.status} sang ${String(next)}.`);
    }
    if (next === 'cancelled') {
      for (const l of all<LineRow>('SELECT * FROM order_lines WHERE order_code = ?', code)) {
        run('UPDATE variants SET stock = stock + ? WHERE id = ?', l.quantity, l.variant_id);
      }
    }
    run('UPDATE orders SET status = ? WHERE code = ?', next as string, code);
    return toOrder({ ...row, status: next as OrderStatus }, true);
  });
}
