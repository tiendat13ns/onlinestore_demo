import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { BRAND_NAME, COURSE_CREDIT } from '../config';
import { useCart } from '../lib/CartContext';

const FOOTER_LINKS: [string, string][] = [
  ['/', 'Trang chủ'],
  ['/products', 'Sản phẩm'],
  ['/about', 'Về chúng tôi'],
  ['/orders', 'Đơn hàng của tôi'],
  ['/policies/shipping', 'Giao hàng'],
  ['/policies/returns', 'Đổi trả'],
  ['/policies/privacy', 'Quyền riêng tư'],
];

export default function Layout() {
  const { count } = useCart();
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const header = useRef<HTMLElement>(null);
  const prevCount = useRef(count);
  const [bump, setBump] = useState(0);
  const isHome = pathname === '/';

  useEffect(() => {
    if (count > prevCount.current) setBump((b) => b + 1);
    prevCount.current = count;
  }, [count]);

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  // Hiệu ứng xuất hiện: mỗi phần tử [data-reveal] hiện một lần khi vào màn hình.
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    const scan = () => document.querySelectorAll('[data-reveal]:not(.in)').forEach((el) => io.observe(el));
    scan();
    const main = document.getElementById('main');
    const mo = new MutationObserver(scan);
    if (main) mo.observe(main, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, []);

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

      <header className={isHome ? 'site-header overlay' : 'site-header'} ref={header}>
        <div className={isHome ? 'header-row wide' : 'header-row'}>
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
            <NavLink to="/about">Về chúng tôi</NavLink>
          </nav>
          <NavLink to="/cart" className="cart-link">
            <span>
              Giỏ hàng (<span key={bump} className={bump ? 'cart-count bump' : 'cart-count'}>{count}</span>)
            </span>
          </NavLink>
        </div>
      </header>

      <main id="main" tabIndex={-1} className={isHome ? 'main-full' : 'container'}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <figure className="footer-photo">
          <img src="/images/flatlay-keyboard.jpg" alt="Bàn phím và dây cáp trên mặt bàn trắng" width="1920" height="1280" loading="lazy" />
        </figure>
        <div className="footer-menu">
          <p className="footer-brand">{BRAND_NAME}</p>
          <nav aria-label="Liên kết chân trang">
            <ul>
              {FOOTER_LINKS.map(([to, label]) => (
                <li key={to}>
                  <Link to={to}>{label}</Link>
                </li>
              ))}
            </ul>
          </nav>
          <p className="small legal">
            © 2026 {BRAND_NAME} · {COURSE_CREDIT}
          </p>
          <p className="small credits">
            Ảnh qua Wikimedia Commons:{' '}
            <a href="https://commons.wikimedia.org/wiki/File:Apple_mouse_and_keyboard_(Unsplash).jpg">Grovemade</a> (CC0),{' '}
            <a href="https://commons.wikimedia.org/wiki/File:HP_mouse_and_mousepad_20060803.jpg">Lovecz</a> (public domain),{' '}
            <a href="https://commons.wikimedia.org/wiki/File:A_computer_keyboard_and_mouse_are_positioned_on_a_wooden_des.jpg">Shixart1985</a>{' '}
            (<a href="https://creativecommons.org/licenses/by/2.0">CC BY 2.0</a>),{' '}
            <a href="https://commons.wikimedia.org/wiki/File:Top_Workspace_Office.jpg">Kristin Hardwick</a> (CC0).
          </p>
        </div>
      </footer>
    </>
  );
}
