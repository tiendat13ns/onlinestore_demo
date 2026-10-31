import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
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

const emptyCatalog: Catalog = { currency: null, isFixture: false, products: [] };
const CatalogContext = createContext<CatalogApi | null>(null);

function loadCatalog(): Promise<Catalog> {
  return api.catalog();
}

export function CatalogProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>('loading');
  const [catalog, setCatalog] = useState<Catalog>(emptyCatalog);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    loadCatalog().then(
      (data) => {
        if (cancelled) return;
        setCatalog(data);
        setStatus('ready');
      },
      () => {
        if (!cancelled) setStatus('error');
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
