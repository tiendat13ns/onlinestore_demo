import type { AdminOrder, Catalog, DemoOrder, OrderStatus, Product, Variant } from '../types';
import { readItem, removeItem, writeItem } from './storage';

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

const ADMIN_TOKEN_KEY = 'gsd.admin.v1';

export const adminSession = {
  get: () => readItem(ADMIN_TOKEN_KEY),
  set: (token: string) => writeItem(ADMIN_TOKEN_KEY, token),
  clear: () => removeItem(ADMIN_TOKEN_KEY),
};

async function request<T>(path: string, init: RequestInit = {}, admin = false): Promise<T> {
  const headers = new Headers(init.headers);
  if (init.body) headers.set('content-type', 'application/json');
  if (admin) headers.set('authorization', `Bearer ${adminSession.get() ?? ''}`);

  let res: Response;
  try {
    res = await fetch(path, { ...init, headers });
  } catch {
    throw new ApiError(0, 'Không kết nối được máy chủ. Vui lòng thử lại.');
  }
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    if (admin && res.status === 401) adminSession.clear();
    const message = (data as { error?: string } | null)?.error;
    throw new ApiError(res.status, message ?? 'Có lỗi xảy ra. Vui lòng thử lại.');
  }
  return data as T;
}

export interface Customer {
  name: string;
  phone: string;
  address: string;
}

export type AdminVariant = Variant & { stock: number };
export type AdminProduct = Omit<Product, 'variants'> & { variants: AdminVariant[] };

const json = (body: unknown) => JSON.stringify(body);

export const api = {
  catalog: () => request<Catalog>('/api/catalog'),
  createOrder: (lines: { variantId: string; quantity: number }[], customer: Customer) =>
    request<DemoOrder>('/api/orders', { method: 'POST', body: json({ lines, customer }) }),
  getOrder: (code: string) => request<DemoOrder>(`/api/orders/${encodeURIComponent(code)}`),

  admin: {
    login: (password: string) => request<{ token: string }>('/api/admin/login', { method: 'POST', body: json({ password }) }),
    orders: () => request<AdminOrder[]>('/api/admin/orders', {}, true),
    setStatus: (code: string, status: OrderStatus) =>
      request<AdminOrder>(`/api/admin/orders/${encodeURIComponent(code)}/status`, { method: 'PATCH', body: json({ status }) }, true),
    products: () => request<AdminProduct[]>('/api/admin/products', {}, true),
    patchVariant: (id: string, patch: { price?: number | null; stock?: number }) =>
      request<AdminVariant>(`/api/admin/variants/${encodeURIComponent(id)}`, { method: 'PATCH', body: json(patch) }, true),
  },
};
