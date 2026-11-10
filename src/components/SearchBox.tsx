import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type KeyboardEvent } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useCatalog } from '../lib/CatalogContext';
import { matchProducts } from '../lib/search';
import { CATEGORIES, type Product } from '../types';
import { artFor } from './art';
import { priceText } from './ProductCard';
import ProductImage from './ProductImage';

const KEYWORDS = ['Deskmat', 'Pad chuột', 'Kê tay', 'Keycap', 'Kẹp dây', 'Móc tai nghe'];
const MAX_SUGGESTIONS = 6;

type Row = { kind: 'product'; product: Product } | { kind: 'all' } | { kind: 'keyword'; label: string };

const SearchIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

/**
 * Ô tìm kiếm có gợi ý: gõ là hiện ngay các sản phẩm khớp (có ảnh, nhóm, giá), chưa gõ thì hiện từ khóa phổ biến.
 * Dùng được bằng bàn phím (mũi tên, Enter, Esc) và đọc được bằng trình đọc màn hình (mẫu combobox/listbox).
 */
export default function SearchBox({ className }: { className: string }) {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const { pathname } = useLocation();
  const { catalog } = useCatalog();
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const form = useRef<HTMLFormElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();

  // Ô tìm kiếm phản ánh từ khóa đang lọc ở trang Sản phẩm.
  useEffect(() => {
    setQ(pathname === '/products' ? (params.get('q') ?? '') : '');
  }, [pathname, params]);

  // Chuyển trang thì đóng gợi ý.
  useEffect(() => {
    setOpen(false);
    setActive(-1);
  }, [pathname]);

  const term = q.trim();
  const products = useMemo(
    () =>
      term
        ? matchProducts(catalog.products, term)
            .sort((a, b) => a.score - b.score || a.index - b.index)
            .slice(0, MAX_SUGGESTIONS)
            .map((m) => m.product)
        : [],
    [catalog.products, term],
  );
  const rows: Row[] = term
    ? [...products.map((product): Row => ({ product, kind: 'product' })), { kind: 'all' }]
    : KEYWORDS.map((label): Row => ({ kind: 'keyword', label }));

  const goSearch = (text: string) => {
    const t = text.trim();
    navigate(t ? `/products?q=${encodeURIComponent(t)}` : '/products');
  };

  const choose = (row: Row) => {
    setOpen(false);
    setActive(-1);
    input.current?.blur();
    if (row.kind === 'product') navigate(`/products/${row.product.slug}`);
    else if (row.kind === 'keyword') goSearch(row.label);
    else goSearch(term);
  };

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOpen(false);
    goSearch(q);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      setOpen(true);
      const dir = e.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (a + dir + rows.length) % rows.length);
    } else if (e.key === 'Enter' && open && active >= 0) {
      e.preventDefault();
      choose(rows[active]);
    } else if (e.key === 'Escape' && open) {
      // Chặn việc ô type=search tự xóa chữ khi bấm Esc (sẽ làm gợi ý mở lại).
      e.preventDefault();
      e.stopPropagation();
      setOpen(false);
      setActive(-1);
    }
  };

  const categoryLabel = (p: Product) => CATEGORIES.find((c) => c.id === p.category)?.label;

  return (
    <form
      ref={form}
      className={`search ${className}`}
      role="search"
      onSubmit={onSubmit}
      onBlur={(e) => {
        if (!form.current?.contains(e.relatedTarget as Node | null)) {
          setOpen(false);
          setActive(-1);
        }
      }}
    >
      <SearchIcon />
      <input
        ref={input}
        type="search"
        role="combobox"
        value={q}
        placeholder="Tìm sản phẩm…"
        aria-label="Tìm sản phẩm"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
      />

      {open && (
        <div className="suggest">
          {term && products.length === 0 && (
            <p className="suggest-empty">
              Không có sản phẩm nào khớp “{term}”. Thử từ khóa khác như deskmat, kê tay hoặc keycap.
            </p>
          )}
          <ul id={listId} role="listbox" aria-label={term ? 'Gợi ý sản phẩm' : 'Gợi ý tìm kiếm'}>
            {!term && (
              <li className="suggest-title" role="presentation">
                Gợi ý tìm kiếm
              </li>
            )}
            {rows.map((row, i) => (
              <li
                key={row.kind === 'product' ? row.product.id : row.kind === 'keyword' ? row.label : 'all'}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className={`suggest-row suggest-${row.kind}${i === active ? ' is-active' : ''}`}
                onMouseDown={(e) => e.preventDefault()}
                onMouseEnter={() => setActive(i)}
                onClick={() => choose(row)}
              >
                {row.kind === 'product' && (
                  <>
                    <ProductImage image={row.product.images[0]} art={artFor(row.product)} className="suggest-thumb" />
                    <span className="suggest-text">
                      <span className="suggest-name">{row.product.name}</span>
                      <span className="suggest-meta">{categoryLabel(row.product)}</span>
                    </span>
                    <span className="suggest-price">{priceText(row.product, catalog.currency)}</span>
                  </>
                )}
                {row.kind === 'keyword' && (
                  <>
                    <SearchIcon size={18} />
                    <span className="suggest-name">{row.label}</span>
                  </>
                )}
                {row.kind === 'all' && <span className="suggest-all">Xem tất cả kết quả cho “{term}” ›</span>}
              </li>
            ))}
          </ul>
        </div>
      )}
      <span className="sr-only" role="status">
        {open && term ? `${products.length} gợi ý sản phẩm` : ''}
      </span>
    </form>
  );
}
