import { MAX_QTY } from '../config';

/** Tiền lưu dạng số nguyên đơn vị nhỏ nhất; chỉ format khi hiển thị. */
export function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null || currency === null) return '—';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency }).format(amount);
}

/** Trả về số nguyên 1–99 hoặc null nếu không hợp lệ. */
export function parseQuantity(raw: string): number | null {
  const text = raw.trim();
  if (!/^\d+$/.test(text)) return null;
  const n = Number(text);
  return n >= 1 && n <= MAX_QTY ? n : null;
}

export function formatDateTime(iso: string): string {
  const text = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'medium',
    timeZone: 'Asia/Ho_Chi_Minh',
  }).format(new Date(iso));
  return text;
}
