import { randomBytes } from 'node:crypto';
import type { BundleComponent, Catalog, Product, ProductImage, Spec, Variant } from '../src/types';
import { getDb, type Queryable } from './db';
import { HttpError } from './errors';

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: Product['category'];
  kind: Product['kind'];
  short_description: string;
  description: string;
  usage: string | null;
  includes: string[] | null;
  images: ProductImage[];
  attribute_names: string[];
  related_ids: string[];
}

interface VariantRow {
  id: string;
  product_id: string;
  attributes: Record<string, string>;
  price: number | null;
  stock: number;
  specs: Spec[];
  components: BundleComponent[] | null;
}

type AdminVariant = Variant & { stock: number };
type AdminProduct = Omit<Product, 'variants'> & { variants: AdminVariant[] };

function toVariant(row: VariantRow): AdminVariant {
  return {
    id: row.id,
    productId: row.product_id,
    attributes: row.attributes ?? {},
    price: row.price,
    specs: row.specs ?? [],
    ...(row.components ? { components: row.components } : {}),
    stock: row.stock,
  };
}

export async function getCurrency(q: Queryable = getDb()): Promise<string | null> {
  const rows = await q.query<{ value: string }>('select value from settings where key = $1', ['currency']);
  return rows[0]?.value ?? null;
}

async function loadProducts(): Promise<AdminProduct[]> {
  const db = getDb();
  const [products, variants] = await Promise.all([
    db.query<ProductRow>('select * from products order by sort_order'),
    db.query<VariantRow>('select * from variants order by sort_order'),
  ]);
  return products.map((p) => ({
    id: p.id,
    slug: p.slug,
    name: p.name,
    category: p.category,
    kind: p.kind,
    shortDescription: p.short_description,
    description: p.description,
    usage: p.usage,
    includes: p.includes,
    images: p.images ?? [],
    attributeNames: p.attribute_names ?? [],
    relatedIds: p.related_ids ?? [],
    variants: variants.filter((v) => v.product_id === p.id).map(toVariant),
  }));
}

/** Catalog công khai: chỉ lộ `inStock`, không lộ số tồn kho. */
export async function publicCatalog(): Promise<Catalog> {
  const [products, currency] = await Promise.all([loadProducts(), getCurrency()]);
  return {
    currency,
    products: products.map((p) => ({
      ...p,
      variants: p.variants.map(({ stock, ...v }) => ({ ...v, inStock: stock > 0 })),
    })),
  };
}

export function adminProducts(): Promise<AdminProduct[]> {
  return loadProducts();
}

export async function updateVariant(id: string, patch: { price?: unknown; stock?: unknown }) {
  const db = getDb();
  const rows = await db.query<VariantRow>('select * from variants where id = $1', [id]);
  const existing = rows[0];
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
  await db.query('update variants set price = $1, stock = $2 where id = $3', [price, stock, id]);
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
  created_at: Date | string;
  status: OrderStatus;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  currency: string;
  subtotal: number;
}

interface LineRow {
  order_code: string;
  variant_id: string;
  name: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  components: string[];
}

function toOrder(row: OrderRow, lines: LineRow[], includeContact: boolean) {
  return {
    code: row.code,
    createdAt: new Date(row.created_at).toISOString(),
    status: row.status,
    currency: row.currency,
    subtotal: row.subtotal,
    lines: lines.map((l) => ({
      variantId: l.variant_id,
      name: l.name,
      quantity: l.quantity,
      unitPrice: l.unit_price,
      lineTotal: l.line_total,
      components: l.components ?? [],
    })),
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

const newCode = () => `OD-${randomBytes(4).toString('hex').toUpperCase()}`;

function label(attributes: Record<string, string>): string {
  return Object.values(attributes ?? {}).join(' / ');
}

export async function createOrder(body: unknown) {
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

  const db = getDb();
  const currency = await getCurrency();
  if (!currency) throw new HttpError(400, 'Cửa hàng chưa cấu hình đơn vị tiền.');

  // Khóa các dòng theo thứ tự cố định để hai đơn đồng thời không bị deadlock.
  const ids = [...wanted.keys()].sort();

  return db.transaction(async (tx) => {
    const code = newCode();
    let subtotal = 0;
    const lines: { variantId: string; name: string; quantity: number; price: number; components: string[] }[] = [];

    for (const variantId of ids) {
      const quantity = wanted.get(variantId)!;
      if (quantity > 99) throw new HttpError(400, 'Tổng số lượng vượt tối đa 99 sản phẩm cho mỗi mẫu.');

      const rows = await tx.query<VariantRow & { product_name: string }>(
        'select v.*, p.name as product_name from variants v join products p on p.id = v.product_id where v.id = $1 for update of v',
        [variantId],
      );
      const row = rows[0];
      if (!row) throw new HttpError(400, 'Có sản phẩm không còn trong catalog.');
      const tag = label(row.attributes);
      const display = tag ? `${row.product_name} (${tag})` : row.product_name;
      if (row.price === null) throw new HttpError(400, `${display}: sản phẩm chưa mở bán.`);
      if (row.stock < quantity) throw new HttpError(409, `${display}: không đủ hàng.`);

      await tx.query('update variants set stock = stock - $1 where id = $2', [quantity, variantId]);

      const components: string[] = [];
      for (const c of row.components ?? []) {
        const child = await tx.query<{ product_name: string; attributes: Record<string, string> }>(
          'select p.name as product_name, v.attributes from variants v join products p on p.id = v.product_id where v.id = $1',
          [c.variantId],
        );
        const childTag = child[0] ? label(child[0].attributes) : '';
        const childName = child[0] ? (childTag ? `${child[0].product_name} (${childTag})` : child[0].product_name) : c.variantId;
        components.push(`${c.quantity} × ${childName}`);
      }
      lines.push({ variantId, name: display, quantity, price: row.price, components });
      subtotal += row.price * quantity;
    }

    const created = await tx.query<OrderRow>(
      `insert into orders (code, status, customer_name, customer_phone, customer_address, currency, subtotal)
       values ($1, 'pending', $2, $3, $4, $5, $6) returning *`,
      [code, name, phone, address, currency, subtotal],
    );
    const lineRows: LineRow[] = [];
    for (const l of lines) {
      const inserted = await tx.query<LineRow>(
        `insert into order_lines (order_code, variant_id, name, quantity, unit_price, line_total, components)
         values ($1, $2, $3, $4, $5, $6, $7::jsonb) returning *`,
        [code, l.variantId, l.name, l.quantity, l.price, l.price * l.quantity, JSON.stringify(l.components)],
      );
      lineRows.push(inserted[0]);
    }
    return toOrder(created[0], lineRows, false);
  });
}

export async function findOrder(code: string, includeContact = false) {
  const db = getDb();
  const rows = await db.query<OrderRow>('select * from orders where code = $1', [code]);
  if (!rows[0]) return null;
  const lines = await db.query<LineRow>('select * from order_lines where order_code = $1 order by id', [code]);
  return toOrder(rows[0], lines, includeContact);
}

export async function listOrders() {
  const db = getDb();
  const [orders, lines] = await Promise.all([
    db.query<OrderRow>('select * from orders order by created_at desc limit 500'),
    db.query<LineRow>('select * from order_lines order by id'),
  ]);
  const byOrder = new Map<string, LineRow[]>();
  for (const l of lines) byOrder.set(l.order_code, [...(byOrder.get(l.order_code) ?? []), l]);
  return orders.map((o) => toOrder(o, byOrder.get(o.code) ?? [], true));
}

export async function changeStatus(code: string, next: unknown) {
  if (!STATUSES.includes(next as OrderStatus)) throw new HttpError(400, 'Trạng thái không hợp lệ.');
  return getDb().transaction(async (tx) => {
    const rows = await tx.query<OrderRow>('select * from orders where code = $1 for update', [code]);
    const row = rows[0];
    if (!row) throw new HttpError(404, 'Không tìm thấy đơn.');
    if (!NEXT[row.status].includes(next as OrderStatus)) {
      throw new HttpError(409, `Không thể chuyển từ ${row.status} sang ${String(next)}.`);
    }
    const lines = await tx.query<LineRow>('select * from order_lines where order_code = $1 order by id', [code]);
    if (next === 'cancelled') {
      // Hoàn kho theo thứ tự cố định để tránh deadlock với đơn khác.
      for (const l of [...lines].sort((a, b) => a.variant_id.localeCompare(b.variant_id))) {
        await tx.query('update variants set stock = stock + $1 where id = $2', [l.quantity, l.variant_id]);
      }
    }
    await tx.query('update orders set status = $1 where code = $2', [next, code]);
    return toOrder({ ...row, status: next as OrderStatus }, lines, true);
  });
}
