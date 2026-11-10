import { CATEGORIES, type Product } from '../types';

/** Bỏ dấu, đổi đ→d và về chữ thường để "kep day" khớp "Kẹp dây". */
export function fold(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .trim();
}

export interface Match {
  product: Product;
  /** Càng nhỏ càng sát: 0 = tên bắt đầu bằng từ khóa, 1 = tên chứa, 2 = chỉ khớp ở mô tả, nhóm hoặc biến thể. */
  score: number;
  index: number;
}

/**
 * Các sản phẩm khớp mọi từ trong truy vấn (tìm trong tên, mô tả ngắn, nhóm và thuộc tính biến thể).
 * Giữ thứ tự catalog; muốn xếp theo độ sát thì sắp theo `score`.
 */
export function matchProducts(products: Product[], query: string): Match[] {
  const terms = fold(query).split(/\s+/).filter(Boolean);
  if (terms.length === 0) return products.map((product, index) => ({ product, score: 2, index }));

  const out: Match[] = [];
  products.forEach((product, index) => {
    const name = fold(product.name);
    const haystack = fold(
      [
        product.name,
        product.shortDescription,
        CATEGORIES.find((c) => c.id === product.category)?.label ?? '',
        ...product.variants.flatMap((v) => Object.values(v.attributes)),
      ].join(' '),
    );
    if (!terms.every((t) => haystack.includes(t))) return;
    const score = terms.every((t) => name.startsWith(t) || name.includes(` ${t}`)) ? 0 : terms.every((t) => name.includes(t)) ? 1 : 2;
    out.push({ product, score, index });
  });
  return out;
}
