import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import ProductImage from '../components/ProductImage';
import { CatalogGate } from '../components/StatusMessages';
import { FEATURED_IDS } from '../config';
import { useCatalog } from '../lib/CatalogContext';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES } from '../types';

function Featured() {
  const { catalog } = useCatalog();
  // Chỉ hiện số món có thật, tối đa 4; không nhân bản thẻ.
  const items = FEATURED_IDS.map((id) => catalog.products.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .slice(0, 4);
  if (!items.length) return null;
  return (
    <section aria-labelledby="featured-h">
      <h2 id="featured-h">Sản phẩm được nhóm chọn</h2>
      <div className="grid">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
      <p>
        <Link to="/products">Xem tất cả</Link>
      </p>
    </section>
  );
}

export default function Home() {
  useTitle('Trang chủ');
  return (
    <>
      <section className="hero">
        <div>
          <h1>Góc setup gọn gàng cho gaming</h1>
          <p>Concept deskmat và phụ kiện quản lý dây theo phong cách clean. Nội dung hero cần nhóm xác nhận.</p>
          <Link className="btn" to="/products">
            Khám phá sản phẩm
          </Link>
        </div>
        <ProductImage image={{ alt: 'Ảnh setup hero (chưa có ảnh)' }} className="hero-img" />
      </section>

      <section aria-labelledby="cats-h">
        <h2 id="cats-h">Danh mục</h2>
        <div className="grid">
          {CATEGORIES.map((c) => (
            <article className="card" key={c.id}>
              <Link to={`/products?category=${c.id}`} className="card-media" aria-label={c.label}>
                <ProductImage image={{ alt: `Ảnh danh mục ${c.label} (chưa có ảnh)` }} />
              </Link>
              <div className="card-body">
                <h3>
                  <Link to={`/products?category=${c.id}`}>{c.label}</Link>
                </h3>
                <p>{c.description}</p>
                <Link className="btn btn-secondary" to={`/products?category=${c.id}`}>
                  Xem danh mục
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <CatalogGate>
        <Featured />
      </CatalogGate>

      <section aria-labelledby="mix-h">
        <h2 id="mix-h">Cách phối setup</h2>
        <p>Nội dung và ảnh phối setup từ các sản phẩm có thật trong catalog: {`Cần nhóm xác nhận`}.</p>
        <Link className="btn btn-secondary" to="/products?category=bundle">
          Xem bộ sản phẩm
        </Link>
      </section>

      <section aria-labelledby="about-h">
        <h2 id="about-h">Về dự án</h2>
        <p>Đây là dự án học tập môn E-Business, chỉ mô phỏng luồng mua hàng, không có giao dịch thật.</p>
        <Link to="/about">Về dự án</Link>
      </section>
    </>
  );
}
