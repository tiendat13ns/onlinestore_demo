import type { Product, ProductImage, Variant } from '../types';

/** Ảnh hợp với biến thể đã chọn (theo `match` trong catalog); không có thì lấy ảnh đầu của sản phẩm. */
export function imageForVariant(product: Product, variant?: Variant): ProductImage | undefined {
  if (variant) {
    const hit = product.images.find(
      (img) => img.match && Object.entries(img.match).every(([key, value]) => (Array.isArray(value) ? value : [value]).includes(variant.attributes[key])),
    );
    if (hit) return hit;
  }
  return product.images[0];
}
