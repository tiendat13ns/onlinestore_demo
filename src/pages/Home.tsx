import { Link } from 'react-router-dom';
import ProductSection from '../components/ProductSection';
import { CatalogGate, ProductSkeleton } from '../components/StatusMessages';
import { BRAND_NAME, FEATURED_IDS, NEW_IDS } from '../config';
import { useCatalog } from '../lib/CatalogContext';
import { useTitle } from '../lib/useTitle';

const REASONS: [string, string][] = [
  ['Chọn lọc, không chạy theo số lượng', 'Mỗi món trong cửa hàng có một công dụng rõ ràng cho góc bàn.'],
  ['Thông tin rõ trước khi mua', 'Cỡ, màu, thông số và giá hiển thị đầy đủ ngay trên trang sản phẩm.'],
  ['Thanh toán khi nhận hàng', 'Nhận hàng, kiểm tra rồi mới trả tiền. Giao trong 2–5 ngày làm việc.'],
  ['Đổi trả trong 7 ngày', 'Với sản phẩm lỗi hoặc giao sai mẫu, màu, cỡ.'],
];

function HomeProducts() {
  const { catalog } = useCatalog();
  const pick = (ids: string[]) => ids.map((id) => catalog.products.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <>
      <ProductSection id="best-h" title="Sản phẩm nổi bật" products={pick(FEATURED_IDS)} moreTo="/products" moreLabel="Xem tất cả" />

      <ProductSection id="new-h" title="Mới về" products={pick(NEW_IDS)} moreTo="/products" moreLabel="Xem tất cả sản phẩm" />

      <section className="perks" aria-labelledby="why-h">
        <div className="wrap">
          <h2 id="why-h" data-reveal>Vì sao chọn {BRAND_NAME}</h2>
          <ul>
            {REASONS.map(([title, text]) => (
              <li key={title} data-reveal>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="section-tight wrap" aria-labelledby="about-h">
        <div className="intro-card" data-reveal>
          <img src="/images/logo.jpg" alt="" width="160" height="160" loading="lazy" />
          <div>
            <h2 id="about-h">Chỉ những thứ bạn thật sự dùng.</h2>
            <p>
              Deskmat cho chuột một mặt phẳng êm, kẹp dây giữ mỗi sợi đúng chỗ, khay và móc cho mọi thứ còn lại. Cỡ, màu và thông số ghi rõ trên từng trang sản phẩm.
            </p>
            <Link to="/about">Về {BRAND_NAME} ›</Link>
          </div>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  useTitle('Deskmat và phụ kiện cho góc bàn gọn gàng');
  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <img
          className="hero-img"
          src="/images/banner.jpg"
          alt="Tam Thái Tử Store: chú sóc bay màu trắng xanh bên góc bàn setup với deskmat, bàn phím và tai nghe"
          width="2048"
          height="768"
          fetchPriority="high"
        />
        <div className="hero-copy wrap">
          <h1 id="hero-h">Góc bàn gọn gàng, mỗi ngày.</h1>
          <div>
            <p>Deskmat, phụ kiện bàn phím và đồ quản lý dây, chọn để góc làm việc dễ chịu hơn.</p>
            <Link className="btn" to="/products">
              Mua ngay
            </Link>
          </div>
        </div>
      </section>

      <CatalogGate fallback={<ProductSkeleton rows={2} />}>
        <HomeProducts />
      </CatalogGate>
    </>
  );
}
