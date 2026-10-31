import { useMemo } from 'react';
import type { Product, ProductImage, Variant } from '../types';
import { useCart } from './CartContext';
import { displayName, useCatalog } from './CatalogContext';

export interface CartLineView {
  variantId: string;
  quantity: number;
  product?: Product;
  variant?: Variant;
  name: string;
  image?: ProductImage;
  unitPrice: number | null;
  lineTotal: number | null;
  /** Thành phần bộ, đã resolve tên. */
  components: string[];
  /** Có giá trị khi dòng không hợp lệ (mất variant, thiếu giá…). */
  problem?: string;
}

export function useCartView() {
  const { lines } = useCart();
  const { variants, catalog, status } = useCatalog();

  return useMemo(() => {
    const views: CartLineView[] = lines.map((line) => {
      const entry = variants.get(line.variantId);
      if (!entry) {
        return {
          variantId: line.variantId,
          quantity: line.quantity,
          name: 'Sản phẩm không còn được bán',
          unitPrice: null,
          lineTotal: null,
          components: [],
          problem: 'Sản phẩm này không còn được bán. Vui lòng xóa khỏi giỏ.',
        };
      }
      const { product, variant } = entry;
      const components = (variant.components ?? []).map((c) => {
        const child = variants.get(c.variantId);
        return `${c.quantity} × ${child ? displayName(child.product, child.variant) : c.variantId}`;
      });
      const hasPrice = variant.price !== null && catalog.currency !== null;
      const outOfStock = variant.inStock === false;
      return {
        variantId: line.variantId,
        quantity: line.quantity,
        product,
        variant,
        name: displayName(product, variant),
        image: variant.image ?? product.images[0],
        unitPrice: variant.price,
        lineTotal: hasPrice ? variant.price! * line.quantity : null,
        components,
        problem: !hasPrice
          ? 'Sản phẩm này hiện chưa có giá. Vui lòng xóa khỏi giỏ.'
          : outOfStock
            ? 'Sản phẩm này đã hết hàng. Vui lòng xóa khỏi giỏ.'
            : undefined,
      };
    });

    const valid = views.filter((v) => !v.problem);
    const subtotal = valid.reduce((sum, v) => sum + (v.lineTotal ?? 0), 0);
    return {
      status,
      views,
      subtotal,
      currency: catalog.currency,
      hasInvalid: views.some((v) => v.problem),
    };
  }, [lines, variants, catalog.currency, status]);
}
