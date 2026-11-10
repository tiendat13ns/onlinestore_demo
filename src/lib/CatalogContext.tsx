import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type { Catalog, Product, Variant } from '../types';
import { api } from './api';

type Status = 'loading' | 'error' | 'ready';

export interface VariantEntry {
  product: Product;
  variant: Variant;
}

interface CatalogApi {
  status: Status;
  catalog: Catalog;
  variants: Map<string, VariantEntry>;
  reload: () => void;
}

const emptyCatalog: Catalog = { currency: null, products: [] };
const CatalogContext = createContext<CatalogApi | null>(null);


// Nhớ catalog lần trước (dữ liệu công khai) để F5 hoặc mở lại trang hiện ngay, rồi cập nhật ngầm từ máy chủ.
const CACHE_KEY = 'tt.catalog.v1';
const CACHE_MAX_AGE = 24 * 60 * 60 * 1000;

function readCache(): Catalog | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw) as { at?: number; catalog?: Catalog };
    if (!data.catalog?.products?.length || typeof data.at !== 'number' || Date.now() - data.at > CACHE_MAX_AGE) return null;
    return data.catalog;
  } catch {
    return null;
  }
}

function writeCache(catalog: Catalog): void {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at: Date.now(), catalog }));
  } catch {
    // storage đầy hoặc bị chặn: bỏ qua, trang vẫn chạy bình thường
  }
}

function loadCatalog(): Promise<Catalog> {
  return api.catalog();
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [cached] = useState(readCache);
  const hasData = useRef(cached !== null);
  const [status, setStatus] = useState<Status>(cached ? 'ready' : 'loading');
  const [catalog, setCatalog] = useState<Catalog>(cached ?? emptyCatalog);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    if (!hasData.current) setStatus('loading');
    loadCatalog().then(
      (data) => {
        if (cancelled) return;
        hasData.current = true;
        writeCache(data);
        // Dữ liệu không đổi thì giữ nguyên object để trang không vẽ lại.
        setCatalog((prev) => (JSON.stringify(prev) === JSON.stringify(data) ? prev : data));
        setStatus('ready');
      },
      () => {
        // Đã có bản nhớ thì cứ dùng, chỉ báo lỗi khi chưa có gì để hiển thị.
        if (!cancelled) setStatus(hasData.current ? 'ready' : 'error');
      },
    );
    return () => {
      cancelled = true;
    };
  }, [attempt]);

  const reload = useCallback(() => setAttempt((n) => n + 1), []);

  const variants = useMemo(() => {
    const map = new Map<string, VariantEntry>();
    for (const product of catalog.products) {
      for (const variant of product.variants) map.set(variant.id, { product, variant });
    }
    return map;
  }, [catalog]);

  const value = useMemo(() => ({ status, catalog, variants, reload }), [status, catalog, variants, reload]);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog(): CatalogApi {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}

export function variantLabel(variant: Variant): string {
  return Object.values(variant.attributes).join(' / ');
}

export function displayName(product: Product, variant: Variant): string {
  const label = variantLabel(variant);
  return label ? `${product.name} (${label})` : product.name;
}

/** Giá nhỏ nhất trong các biến thể đã có giá; null nếu chưa biến thể nào có giá. */
export function minPrice(product: Product): number | null {
  const prices = product.variants.map((v) => v.price).filter((p): p is number => p !== null);
  return prices.length ? Math.min(...prices) : null;
}

export function hasPriceRange(product: Product): boolean {
  const prices = new Set(product.variants.map((v) => v.price));
  return prices.size > 1;
}
