import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { BRAND_NAME, MEGA_MENU, MEGA_TILES } from '../config';
import { useCart } from '../lib/CartContext';
import { useCatalog } from '../lib/CatalogContext';
import SearchBox from './SearchBox';

const icon = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const BagIcon = () => (
  <svg {...icon}>
    <path d="M6 8h12l-1 12H7L6 8Z" />
    <path d="M9 8a3 3 0 0 1 6 0" />
  </svg>
);
const BoxIcon = () => (
  <svg {...icon}>
    <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
    <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
  </svg>
);
const Chevron = () => (
  <svg className="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

export default function SiteHeader() {
  const { count } = useCart();
  const { catalog } = useCatalog();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [mega, setMega] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const closeTimer = useRef<number | undefined>(undefined);
  const prevCount = useRef(count);
  const [bump, setBump] = useState(0);

  useEffect(() => {
    if (count > prevCount.current) setBump((b) => b + 1);
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    setMenuOpen(false);
    setMega(false);
  }, [pathname]);

  const openMega = () => {
    window.clearTimeout(closeTimer.current);
    setMega(true);
  };
  const closeMega = (delay = 160) => {
    window.clearTimeout(closeTimer.current);
    closeTimer.current = window.setTimeout(() => setMega(false), delay);
  };

  useEffect(() => {
    if (!menuOpen && !mega) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (menuOpen) menuButton.current?.focus();
      setMenuOpen(false);
      setMega(false);
    };
    const onPointer = (e: MouseEvent) => {
      if (header.current && !header.current.contains(e.target as Node)) {
        setMenuOpen(false);
        setMega(false);
      }
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [menuOpen, mega]);

  const productFor = (id: string) => catalog.products.find((p) => p.id === id);

  return (
    <>
      <div className={mega ? 'mega-backdrop show' : 'mega-backdrop'} aria-hidden="true" />
      <header className="site-header" ref={header}>
        <div className="header-row">
          <Link to="/" className="brand">
            <img src="/favicon.png" alt="" width="40" height="40" />
            <span>{BRAND_NAME}</span>
          </Link>

          <nav id="primary-nav" aria-label="Điều hướng chính" className={menuOpen ? 'open' : ''}>
            <SearchBox className="search-mobile" />
            <NavLink to="/" end className="nav-link nav-home">
              Trang chủ
            </NavLink>
            <div
              className="nav-item"
              onMouseEnter={openMega}
              onMouseLeave={() => closeMega()}
              onFocus={openMega}
              onBlur={(e) => {
                if (!e.currentTarget.contains(e.relatedTarget as Node | null)) closeMega(0);
              }}
            >
              <NavLink to="/products" className={mega ? 'nav-link is-open' : 'nav-link'} aria-expanded={mega} aria-controls="mega-panel">
                Sản phẩm
                <Chevron />
              </NavLink>

              <div id="mega-panel" className={mega ? 'mega open' : 'mega'}>
                <div className="mega-inner">
                  <div>
                    <div className="mega-head">
                      <span className="mega-title">Sản phẩm</span>
                      <Link to="/products">Xem tất cả sản phẩm ›</Link>
                    </div>
                    <div className="mega-cols">
                      {MEGA_MENU.map((g) => (
                        <div key={g.heading} className="mega-col">
                          <Link to={g.to} className="mega-heading">
                            {g.heading}
                          </Link>
                          <ul>
                            {g.ids.map(productFor).filter((p) => p !== undefined).map((p) => (
                              <li key={p.id}>
                                <Link to={`/products/${p.slug}`}>{p.name}</Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mega-tiles">
                    {MEGA_TILES.map((t) => (
                      <Link key={t.to} to={t.to} className="mega-tile">
                        <img src={t.src} alt={t.alt} width="640" height="360" decoding="async" />
                        <span>{t.label}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <NavLink to="/about" className="nav-link">
              Về chúng tôi
            </NavLink>
            <NavLink to="/orders" className="nav-link nav-orders-text">
              Đơn hàng của tôi
            </NavLink>
          </nav>

          <div className="header-tools">
            <SearchBox className="search-desktop" />
            <NavLink to="/orders" className="icon-btn icon-orders" aria-label="Đơn hàng của tôi">
              <BoxIcon />
            </NavLink>
            <NavLink to="/cart" className="icon-btn" aria-label={`Giỏ hàng, ${count} sản phẩm`}>
              <BagIcon />
              <span key={bump} className={bump ? 'cart-badge bump' : 'cart-badge'} data-empty={count === 0}>
                {count}
              </span>
            </NavLink>
            <button
              ref={menuButton}
              type="button"
              className="btn btn-secondary menu-toggle"
              aria-expanded={menuOpen}
              aria-controls="primary-nav"
              onClick={() => setMenuOpen((o) => !o)}
            >
              {menuOpen ? 'Đóng' : 'Menu'}
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
