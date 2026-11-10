import { Link } from 'react-router-dom';
import { priceText } from '../components/ProductCard';
import ProductSection from '../components/ProductSection';
import { CatalogGate, ProductSkeleton } from '../components/StatusMessages';
import { BRAND_NAME, CABLE_IDS, FEATURED_IDS, NEW_IDS, PROMO_ID } from '../config';
import { useCatalog } from '../lib/CatalogContext';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES } from '../types';

const CATEGORY_IMAGES: Record<string, { src: string; alt: string; position: string }> = {
  deskmat: { src: '/images/deskmat-slate-xam.jpg', alt: 'Deskmat Slate màu xám', position: '50% 50%' },
  cable: { src: '/images/kep-day-3-ranh.jpg', alt: 'Kẹp dây Clip 3 rãnh', position: '50% 50%' },
  accessory: { src: '/images/keycap-veekos-roselatte-1.jpg', alt: 'Bộ keycap chuyển màu Rose Latte', position: '50% 50%' },
  bundle: { src: '/images/combo-slate-clip.jpg', alt: 'Deskmat Slate, bàn phím, chuột và kẹp dây trên bàn gỗ', position: '28% 50%' },
};

const REASONS: [string, string][] = [
  ['Chọn lọc, không chạy theo số lượng', 'Mỗi món trong cửa hàng có một công dụng rõ ràng cho góc bàn.'],
  ['Thông tin rõ trước khi mua', 'Cỡ, màu, thông số và giá hiển thị đầy đủ ngay trên trang sản phẩm.'],
  ['Thanh toán khi nhận hàng', 'Nhận hàng, kiểm tra rồi mới trả tiền. Giao trong 2–5 ngày làm việc.'],
  ['Đổi trả trong 7 ngày', 'Với sản phẩm lỗi hoặc giao sai mẫu, màu, cỡ.'],
];

function HomeProducts() {
  const { catalog } = useCatalog();
  const pick = (ids: string[]) => ids.map((id) => catalog.products.find((p) => p.id === id)).filter((p) => p !== undefined);
  const featured = pick(FEATURED_IDS);
  const newest = pick(NEW_IDS);
  const cables = pick(CABLE_IDS);
  const promo = catalog.products.find((p) => p.id === PROMO_ID);

  return (
    <>
      <ProductSection id="best-h" title="Sản phẩm nổi bật" products={featured} moreTo="/products" moreLabel="Xem tất cả" />

      <ProductSection id="new-h" title="Mới về" products={newest} moreTo="/products?category=accessory" moreLabel="Xem tất cả phụ kiện" />

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

      {promo && (
        <section className="section-tight wrap" aria-labelledby="promo-h">
          <div className="promo" data-reveal>
            <div className="promo-copy">
              <h2 id="promo-h">{promo.name}</h2>
              <p>{promo.shortDescription}</p>
              <p className="promo-price">{priceText(promo, catalog.currency)}</p>
              <Link className="btn btn-paper" to={`/products/${promo.slug}`}>
                Xem bộ sản phẩm
              </Link>
            </div>
            <div className="promo-img">
              <img src={promo.images[0]?.src} alt={promo.images[0]?.alt ?? promo.name} loading="lazy" width="1400" height="933" />
            </div>
          </div>
        </section>
      )}

      <ProductSection id="cable-h" title="Quản lý dây gọn gàng" products={cables} moreTo="/products?category=cable" moreLabel="Xem tất cả quản lý dây" />

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

function HomeContent() {

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

      <section className="section wrap" aria-labelledby="cat-h">
        <h2 id="cat-h" data-reveal>Mua theo nhóm</h2>
        <ul className="cat-grid">
          {CATEGORIES.map((c, i) => {
            const img = CATEGORY_IMAGES[c.id];
            return (
              <li key={c.id} data-reveal style={{ '--d': `${i * 70}ms` } as React.CSSProperties}>
                <Link to={`/products?category=${c.id}`} className="cat-tile">
                  <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.position }} />
                  <span className="cat-name">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <CatalogGate fallback={<ProductSkeleton rows={3} />}>
        <HomeProducts />
      </CatalogGate>
    </>
  );
}

export default function Home() {
  useTitle('Deskmat và phụ kiện cho góc bàn gọn gàng');
  return <HomeContent />;
}
