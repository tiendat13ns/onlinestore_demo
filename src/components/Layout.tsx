import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BRAND_NAME, DISCLAIMER, PROJECT_LINE } from '../config';
import { useCart } from '../lib/CartContext';

export default function Layout() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const close = () => {
      setMenuOpen(false);
      menuButton.current?.focus();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    const onPointer = (e: MouseEvent) => {
      if (header.current && !header.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('mousedown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('mousedown', onPointer);
    };
  }, [menuOpen]);

  return (
    <>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>

      <div className="project-notice">
        <strong>{PROJECT_LINE}</strong>
        <p>{DISCLAIMER}</p>
      </div>

      <header className="site-header" ref={header}>
        <div className="container header-row">
          <Link to="/" className="brand">
            {BRAND_NAME}
          </Link>
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
          <nav id="primary-nav" aria-label="Điều hướng chính" className={menuOpen ? 'open' : ''}>
            <NavLink to="/" end>
              Trang chủ
            </NavLink>
            <NavLink to="/products">Sản phẩm</NavLink>
            <NavLink to="/about">Về dự án</NavLink>
          </nav>
          <NavLink to="/cart" className="cart-link">
            Giỏ hàng ({count})
          </NavLink>
        </div>
      </header>

      <main id="main" tabIndex={-1} className="container">
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container">
          <p>
            <strong>{BRAND_NAME}</strong> — {PROJECT_LINE}
          </p>
          <nav aria-label="Liên kết chân trang" className="footer-links">
            <Link to="/about">Về dự án</Link>
            <Link to="/orders">Lịch sử đơn</Link>
            <Link to="/policies/shipping">Giao hàng</Link>
            <Link to="/policies/returns">Đổi trả</Link>
            <Link to="/policies/privacy">Quyền riêng tư</Link>
            <Link to="/admin">Admin</Link>
          </nav>
        </div>
      </footer>
    </>
  );
}
