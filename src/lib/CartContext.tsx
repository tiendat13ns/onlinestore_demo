import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { MAX_QTY } from '../config';
import type { CartLine, Order } from '../types';
import { isPersistent, readItem, removeItem, writeItem } from './storage';

const LINES_KEY = 'gsd.cart.v1';
const ORDER_KEY = 'gsd.order.v1';
const CODES_KEY = 'gsd.order-codes.v1';

type AddResult = { ok: true } | { ok: false; error: string };

interface CartApi {
  lines: CartLine[];
  /** Tổng số đơn vị dòng hàng (một bộ × 2 tính là 2). */
  count: number;
  persistent: boolean;
  order: Order | null;
  /** Mã các đơn đã đặt trong phiên (không có tài khoản nên trình duyệt tự nhớ). */
  orderCodes: string[];
  addItem: (variantId: string, quantity: number) => AddResult;
  setQuantity: (variantId: string, quantity: number) => void;
  removeLine: (variantId: string) => void;
  clearLines: () => void;
  saveOrder: (order: Order) => boolean;
  clearLocalData: () => void;
}

const CartContext = createContext<CartApi | null>(null);

function parseLines(raw: string | null): CartLine[] {
  if (!raw) return [];
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];
    return data.filter(
      (l): l is CartLine =>
        typeof l?.variantId === 'string' &&
        Number.isInteger(l?.quantity) &&
        l.quantity >= 1 &&
        l.quantity <= MAX_QTY,
    );
  } catch {
    return [];
  }
}

function parseCodes(raw: string | null): string[] {
  try {
    const data: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data.filter((c): c is string => typeof c === 'string') : [];
  } catch {
    return [];
  }
}

function parseOrder(raw: string | null): Order | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Order;
    return typeof data?.code === 'string' && Array.isArray(data.lines) ? data : null;
  } catch {
    return null;
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  // Chỉ lưu ID + số lượng; giá và tên luôn đối chiếu lại catalog.
  const [lines, setLines] = useState<CartLine[]>(() => parseLines(readItem(LINES_KEY)));
  const [order, setOrder] = useState<Order | null>(() => parseOrder(readItem(ORDER_KEY)));
  const [orderCodes, setOrderCodes] = useState<string[]>(() => parseCodes(readItem(CODES_KEY)));
  const [persistent, setPersistent] = useState(isPersistent);

  useEffect(() => {
    writeItem(LINES_KEY, JSON.stringify(lines));
    setPersistent(isPersistent());
  }, [lines]);

  useEffect(() => {
    writeItem(CODES_KEY, JSON.stringify(orderCodes));
  }, [orderCodes]);

  const addItem = useCallback(
    (variantId: string, quantity: number): AddResult => {
      const existing = lines.find((l) => l.variantId === variantId);
      const total = (existing?.quantity ?? 0) + quantity;
      if (total > MAX_QTY) {
        return { ok: false, error: `Tổng số lượng vượt tối đa ${MAX_QTY} sản phẩm cho mỗi mẫu. Giỏ hàng không thay đổi.` };
      }
      setLines(
        existing
          ? lines.map((l) => (l.variantId === variantId ? { ...l, quantity: total } : l))
          : [...lines, { variantId, quantity }],
      );
      return { ok: true };
    },
    [lines],
  );

  const setQuantity = useCallback((variantId: string, quantity: number) => {
    setLines((prev) => prev.map((l) => (l.variantId === variantId ? { ...l, quantity } : l)));
  }, []);

  const removeLine = useCallback((variantId: string) => {
    setLines((prev) => prev.filter((l) => l.variantId !== variantId));
  }, []);

  const clearLines = useCallback(() => setLines([]), []);

  const saveOrder = useCallback((next: Order): boolean => {
    try {
      writeItem(ORDER_KEY, JSON.stringify(next));
      setOrder(next);
      setOrderCodes((prev) => [next.code, ...prev.filter((c) => c !== next.code)]);
      setPersistent(isPersistent());
      return true;
    } catch {
      return false;
    }
  }, []);

  const clearLocalData = useCallback(() => {
    removeItem(LINES_KEY);
    removeItem(ORDER_KEY);
    removeItem(CODES_KEY);
    setLines([]);
    setOrder(null);
    setOrderCodes([]);
  }, []);

  const count = useMemo(() => lines.reduce((sum, l) => sum + l.quantity, 0), [lines]);

  const value = useMemo(
    () => ({ lines, count, persistent, order, orderCodes, addItem, setQuantity, removeLine, clearLines, saveOrder, clearLocalData }),
    [lines, count, persistent, order, orderCodes, addItem, setQuantity, removeLine, clearLines, saveOrder, clearLocalData],
  );
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartApi {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
