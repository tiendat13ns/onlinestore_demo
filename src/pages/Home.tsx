import { Link } from 'react-router-dom';
import { artFor } from '../components/art';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { CatalogGate } from '../components/StatusMessages';
import { FEATURED_IDS } from '../config';
import { useCatalog } from '../lib/CatalogContext';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES } from '../types';

const CATEGORY_IMAGES: Record<string, { src: string; alt: string; position: string; zoom?: string }> = {
  deskmat: { src: '/images/leather-mat.jpg', alt: 'Tấm lót bàn và chuột trên mặt bàn trắng', position: '80% 85%' },
  cable: { src: '/images/desk-cables.jpg', alt: 'Dây cáp uốn trên mặt bàn gỗ', position: '100% 20%', zoom: '1.6' },
  bundle: { src: '/images/flatlay-keyboard.jpg', alt: 'Bàn phím và đồ dùng bày trên mặt bàn trắng', position: '20% 20%' },
};

const PERKS: [string, string][] = [
  ['Thanh toán khi nhận hàng', 'Nhận hàng, kiểm tra rồi mới trả tiền.'],
  ['Giao trong 2–5 ngày làm việc', 'Đơn được xử lý trong 1–2 ngày làm việc.'],
  ['Đổi trả trong 7 ngày', 'Với sản phẩm lỗi hoặc giao sai mẫu, màu, cỡ.'],
];

function HomeContent() {
  const { catalog } = useCatalog();
  const clip = catalog.products.find((p) => p.category === 'cable');
  const featured = FEATURED_IDS.map((id) => catalog.products.find((p) => p.id === id)).filter((p) => p !== undefined);

  return (
    <>
      <section className="hero" aria-labelledby="hero-h">
        <img className="hero-img" src="/images/leather-mat.jpg" alt="" width="1920" height="1280" fetchPriority="high" />
        <div className="hero-copy">
          <h1 id="hero-h">Góc bàn gọn gàng, mỗi ngày.</h1>
          <p>Deskmat và phụ kiện quản lý dây tối giản, thiết kế cho một góc làm việc dễ chịu.</p>
          <Link className="btn btn-paper" to="/products">
            Mua ngay
          </Link>
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
                  <img src={img.src} alt={img.alt} loading="lazy" style={{ objectPosition: img.position, scale: img.zoom, transformOrigin: '100% 0' }} />
                  <span className="cat-name">{c.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="section wrap" aria-labelledby="best-h">
        <div className="section-head">
          <h2 id="best-h" data-reveal>Sản phẩm nổi bật</h2>
          <Link to="/products" data-reveal>Xem tất cả</Link>
        </div>
        <div className="grid grid-4">
          {featured.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      <section className="perks" aria-label="Chính sách mua hàng">
        <ul className="wrap">
          {PERKS.map(([title, text]) => (
            <li key={title} data-reveal>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="banner" aria-labelledby="banner-h">
        {clip && (
          <div className="banner-art">
            <ProductImage image={clip.images[0]} art={artFor(clip, undefined, 0)} />
          </div>
        )}
        <div className="banner-copy">
          <h2 id="banner-h" data-reveal>Dây gọn, bàn thoáng.</h2>
          <p data-reveal>Kẹp silicone nhỏ giữ dây sạc, dây tai nghe và dây chuột đúng chỗ.</p>
          <Link className="btn btn-paper" to="/products?category=cable" data-reveal>
            Xem kẹp dây
          </Link>
        </div>
      </section>

      <section className="section wrap about" aria-labelledby="about-h">
        <h2 id="about-h" data-reveal>Chỉ những thứ bạn thật sự dùng.</h2>
        <div>
          <p data-reveal>
            Deskmat cho chuột một mặt phẳng êm và giữ bàn phím đứng yên. Kẹp dây giữ mỗi sợi đúng chỗ. Mỗi sản phẩm được vẽ theo kích thước thật, nên cỡ bạn chọn
            trên trang chính là cỡ bạn nhận.
          </p>
          <p data-reveal>
            <Link to="/about">Về chúng tôi</Link>
          </p>
        </div>
      </section>
    </>
  );
}

export default function Home() {
  useTitle('Deskmat và phụ kiện cho góc bàn gọn gàng');
  return (
    <CatalogGate>
      <HomeContent />
    </CatalogGate>
  );
}
