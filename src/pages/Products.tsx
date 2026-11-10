import { useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import { CatalogGate } from '../components/StatusMessages';
import { SUBGROUPS } from '../config';
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
/** Bỏ dấu và chữ hoa để "keo day" khớp "Kẹp dây". */
function fold(text: string): string {
  return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'd').toLowerCase().trim();
}

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
  const groups = (category && SUBGROUPS[category]) || [];
  const group = groups.find((g) => g.id === params.get('group')) ?? null;
  const q = (params.get('q') ?? '').trim();
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
    const byCategory = category ? catalog.products.filter((p) => p.category === category) : catalog.products;
    const filtered = group ? byCategory.filter((p) => group.productIds.includes(p.id)) : byCategory;
    const terms = fold(q).split(' ').filter(Boolean);
    const searched = terms.length
      ? filtered.filter((p) => {
          const haystack = fold(
            [p.name, p.shortDescription, CATEGORIES.find((c) => c.id === p.category)?.label ?? '', ...p.variants.flatMap((v) => Object.values(v.attributes))].join(' '),
          );
          return terms.every((t) => haystack.includes(t));
        })
      : filtered;
    return sortProducts(searched, sort);
  }, [catalog.products, category, group, q, sort]);

  const linkFor = (id: CategoryId | null, groupId: string | null = null, keepQ = true) => {
    const next = new URLSearchParams();
    if (id) next.set('category', id);
    if (id && groupId) next.set('group', groupId);
    if (keepQ && q) next.set('q', q);
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

      {category && groups.length > 0 && (
        <nav aria-label="Lọc theo loại" className="filters filters-sub">
          <Link to={linkFor(category)} aria-current={group === null ? 'true' : undefined}>
            Tất cả loại
          </Link>
          {groups.map((g) => (
            <Link key={g.id} to={linkFor(category, g.id)} aria-current={group?.id === g.id ? 'true' : undefined}>
              {g.label}
            </Link>
          ))}
        </nav>
      )}

      <div className="results-bar">
        <p role="status">
          {visible.length} sản phẩm{q ? ` cho “${q}”` : ''}{' '}
          {q && <Link to={linkFor(category, group?.id ?? null, false)}>Xóa tìm kiếm</Link>}
        </p>
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
