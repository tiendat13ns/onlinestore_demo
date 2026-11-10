import { useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { BRAND_NAME, COURSE_CREDIT } from '../config';
import SiteHeader from './SiteHeader';

export default function Layout() {
  const { pathname } = useLocation();
  const isHome = pathname === '/';

  useEffect(() => {
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

  return (
    <>
      <a className="skip-link" href="#main">
        Bỏ qua điều hướng
      </a>

      <p className="announce">Thanh toán khi nhận hàng · Giao toàn quốc trong 2–5 ngày làm việc</p>

      <SiteHeader />

      <main id="main" tabIndex={-1} className={isHome ? 'main-full' : 'container'}>
        <div key={pathname} className="page">
          <Outlet />
        </div>
      </main>

      <footer className="site-footer">
        <div className="footer-grid wrap">
          <div className="footer-about">
            <p className="footer-brand">{BRAND_NAME}</p>
            <p>Deskmat và phụ kiện quản lý dây tối giản cho góc bàn gọn gàng.</p>
          </div>
          <nav aria-label="Cửa hàng">
            <h2>Cửa hàng</h2>
            <ul>
              <li><Link to="/products">Tất cả sản phẩm</Link></li>
              <li><Link to="/products?category=deskmat">Deskmat</Link></li>
              <li><Link to="/products?category=cable">Quản lý dây</Link></li>
              <li><Link to="/products?category=accessory">Phụ kiện bàn</Link></li>
              <li><Link to="/products?category=bundle">Bộ sản phẩm</Link></li>
            </ul>
          </nav>
          <nav aria-label="Hỗ trợ">
            <h2>Hỗ trợ</h2>
            <ul>
              <li><Link to="/orders">Tra cứu đơn hàng</Link></li>
              <li><Link to="/policies/shipping">Giao hàng</Link></li>
              <li><Link to="/policies/returns">Đổi trả</Link></li>
              <li><Link to="/policies/privacy">Quyền riêng tư</Link></li>
              <li><Link to="/about">Về chúng tôi</Link></li>
            </ul>
          </nav>
        </div>
        <div className="footer-legal wrap">
          <p className="small">
            © 2026 {BRAND_NAME} · {COURSE_CREDIT}
          </p>
          <p className="small credits">
            Trang demo cho môn học, không bán hàng thật. Một số ảnh sản phẩm tham khảo từ trang của hãng và nhà bán (Logitech, Razer, AKKO,
            MonsGeek, Veekos, PBTfans, HyperWork, Brainwavz, StarTech, Baseus, UGREEN, IKEA), thuộc về chủ sở hữu tương ứng.
          </p>
        </div>
      </footer>
    </>
  );
}
