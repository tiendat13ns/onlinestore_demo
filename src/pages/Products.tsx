import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CatalogGate } from '../components/StatusMessages';
import { minPrice, useCatalog } from '../lib/CatalogContext';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES, isCategory, type CategoryId, type Product } from '../types';

type Sort = 'default' | 'price-asc' | 'price-desc';

const SORTS: { id: Sort; label: string }[] = [
  { id: 'default', label: 'Mặc định' },
  { id: 'price-asc', label: 'Giá tăng dần' },
  { id: 'price-desc', label: 'Giá giảm dần' },
];

/** Sản phẩm chưa có giá xếp cuối ở cả hai chiều; bằng giá giữ thứ tự catalog. */
function sortProducts(products: Product[], sort: Sort): Product[] {
  const dir = sort === 'price-asc' ? 1 : sort === 'price-desc' ? -1 : 0;
  return products
    .map((product, index) => ({ product, index, price: minPrice(product) }))
    .sort((a, b) => {
      if (dir === 0) return a.index - b.index;
      if (a.price === null && b.price === null) return a.index - b.index;
      if (a.price === null) return 1;
      if (b.price === null) return -1;
      return (a.price - b.price) * dir || a.index - b.index;
    })
    .map((x) => x.product);
}

function ProductList() {
  const { catalog } = useCatalog();
  const [params, setParams] = useSearchParams();

  const rawCategory = params.get('category');
  const category: CategoryId | null = isCategory(rawCategory) ? rawCategory : null;
  const rawSort = params.get('sort');
  const sort: Sort = SORTS.some((s) => s.id === rawSort) ? (rawSort as Sort) : 'default';

  // URL category không hợp lệ → về "Tất cả".
  useEffect(() => {
    if (rawCategory !== null && category === null) {
      const next = new URLSearchParams(params);
      next.delete('category');
      setParams(next, { replace: true });
    }
  }, [rawCategory, category, params, setParams]);

  const visible = useMemo(() => {
    const filtered = category ? catalog.products.filter((p) => p.category === category) : catalog.products;
    return sortProducts(filtered, sort);
  }, [catalog.products, category, sort]);

  const linkFor = (id: CategoryId | null) => {
    const next = new URLSearchParams();
    if (id) next.set('category', id);
    if (sort !== 'default') next.set('sort', sort);
    const qs = next.toString();
    return qs ? `/products?${qs}` : '/products';
  };

  const onSort = (value: string) => {
    const next = new URLSearchParams(params);
    if (value === 'default') next.delete('sort');
    else next.set('sort', value);
    setParams(next);
  };

  return (
    <>
      <nav aria-label="Lọc theo nhóm" className="filters">
        <Link to={linkFor(null)} aria-current={category === null ? 'true' : undefined}>
          Tất cả
        </Link>
        {CATEGORIES.map((c) => (
          <Link key={c.id} to={linkFor(c.id)} aria-current={category === c.id ? 'true' : undefined}>
            {c.label}
          </Link>
        ))}
      </nav>

      <div className="results-bar">
        <p role="status">{visible.length} sản phẩm</p>
        <label>
          Sắp xếp{' '}
          <select value={sort} onChange={(e) => onSort(e.target.value)}>
            {SORTS.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {visible.length === 0 ? (
        <div>
          <p>Chưa có sản phẩm trong nhóm này.</p>
          <Link className="btn" to="/products">
            Xem tất cả
          </Link>
        </div>
      ) : (
        <div className="grid">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </>
  );
}

export default function Products() {
  useTitle('Sản phẩm');
  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <span aria-current="page">Sản phẩm</span>
      </nav>
      <h1 data-reveal>Sản phẩm</h1>
      <p>Deskmat, phụ kiện quản lý dây và bộ sản phẩm cho góc làm việc của bạn.</p>
      <CatalogGate>
        <ProductList />
      </CatalogGate>
    </>
  );
}
