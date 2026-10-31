import { Link } from 'react-router-dom';
import { CATEGORIES, type Product } from '../types';
import { formatMoney } from '../lib/money';
import { hasPriceRange, minPrice, useCatalog } from '../lib/CatalogContext';
import { CONFIRM } from '../config';
import ProductImage from './ProductImage';

export function priceText(product: Product, currency: string | null): string {
  const price = minPrice(product);
  if (price === null || currency === null) return `Giá: ${CONFIRM}`;
  return `${hasPriceRange(product) ? 'Từ ' : ''}${formatMoney(price, currency)}`;
}

export default function ProductCard({ product }: { product: Product }) {
  const { catalog } = useCatalog();
  const to = `/products/${product.slug}`;
  const category = CATEGORIES.find((c) => c.id === product.category)?.label;

  return (
    <article className="card">
      <Link to={to} className="card-media" aria-label={product.name}>
        <ProductImage image={product.images[0]} />
      </Link>
      <div className="card-body">
        <p className="muted small">{category}</p>
        <h3>
          <Link to={to}>{product.name}</Link>
        </h3>
        <p className="clamp-2">{product.shortDescription}</p>
        <p className="price">{priceText(product, catalog.currency)}</p>
        {product.variants.every((v) => v.inStock === false) && <p className="error small">Hết hàng</p>}
        {catalog.isFixture && <p className="fixture small">Dữ liệu kiểm thử</p>}
        <Link className="btn btn-secondary" to={to}>
          Xem chi tiết
        </Link>
      </div>
    </article>
  );
}
