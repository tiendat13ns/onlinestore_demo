import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { DeskScene, colorOf, matSize, type Scene } from '../components/art';
import { priceText } from '../components/ProductCard';
import { CatalogGate } from '../components/StatusMessages';
import { BRAND_NAME } from '../config';
import { useCart } from '../lib/CartContext';
import { displayName, useCatalog } from '../lib/CatalogContext';
import { formatMoney } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES, type Product } from '../types';

const CAPTIONS: Record<Exclude<Scene, 'mat'>, string> = {
  clips: 'Dây gọn trong kẹp, mặt bàn thoáng',
  bundle: 'Bộ Setup Essentials: deskmat và hai kẹp dây',
};

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function Configurator({ product, onChange }: { product: Product; onChange: (sel: Record<string, string>) => void }) {
  const { catalog } = useCatalog();
  const { addItem } = useCart();
  const [sel, setSel] = useState<Record<string, string>>(() => ({ ...product.variants[0].attributes }));
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const variant = product.variants.find((v) => Object.entries(sel).every(([k, val]) => v.attributes[k] === val)) ?? product.variants[0];
  const inStock = variant.inStock !== false;

  useEffect(() => onChange(variant.attributes), [variant, onChange]);

  const pick = (name: string, option: string) => {
    // Tổ hợp không tồn tại (ví dụ L/Xám) thì nhảy sang biến thể có thật gần nhất, không chọn ngầm thứ khác.
    const exact = product.variants.find((v) => v.attributes[name] === option && Object.entries(sel).every(([k, val]) => k === name || v.attributes[k] === val));
    const next = exact ?? product.variants.find((v) => v.attributes[name] === option)!;
    setSel({ ...next.attributes });
    setNotice(exact ? null : `Cỡ ${next.attributes['Cỡ']} hiện chỉ có màu ${next.attributes['Màu']}.`);
    setError(null);
  };

  const add = () => {
    const result = addItem(variant.id, 1);
    if (result.ok) {
      setError(null);
      setNotice(`Đã thêm ${displayName(product, variant)} vào giỏ.`);
    } else setError(result.error);
  };

  return (
    <>
      {product.attributeNames.map((name) => (
        <fieldset key={name} className="options">
          <legend>{name}</legend>
          {unique(product.variants.map((v) => v.attributes[name])).map((option) => (
            <label key={option} className="choice">
              <input type="radio" name={`home-${name}`} checked={sel[name] === option} onChange={() => pick(name, option)} />
              <span>{option}</span>
            </label>
          ))}
        </fieldset>
      ))}
      <p className="spec">
        {variant.specs.map((s) => s.value).filter(Boolean).join(' · ')}
      </p>
      <p className="price big">{formatMoney(variant.price, catalog.currency)}</p>
      <div className="actions">
        <button type="button" className="btn" onClick={add} disabled={!inStock}>
          {inStock ? 'Thêm vào giỏ' : 'Hết hàng'}
        </button>
        <Link className="btn btn-secondary" to={`/products/${product.slug}`}>
          Xem chi tiết
        </Link>
      </div>
      {notice && (
        <p role="status" className="note">
          {notice} {notice.startsWith('Đã thêm') && <Link to="/cart">Xem giỏ</Link>}
        </p>
      )}
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </>
  );
}

function PriceSheet() {
  const { catalog } = useCatalog();
  return (
    <div className="sheet">
      {CATEGORIES.map((c) => {
        const items = catalog.products.filter((p) => p.category === c.id);
        if (!items.length) return null;
        return (
          <section key={c.id} aria-label={c.label}>
            <h3>{c.label}</h3>
            <ul>
              {items.map((p) => (
                <li key={p.id}>
                  <Link to={`/products/${p.slug}`}>
                    <span>{p.name}</span>
                    <span className="amount">{priceText(p, catalog.currency)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

function HomeContent() {
  const { catalog } = useCatalog();
  const [scene, setScene] = useState<Scene>('mat');
  const [attrs, setAttrs] = useState<Record<string, string>>({});

  const product = catalog.products.find((p) => p.attributeNames.includes('Cỡ'));
  const variant = product?.variants.find((v) => Object.entries(attrs).every(([k, val]) => v.attributes[k] === val)) ?? product?.variants[0];
  const [w, h] = useMemo(() => matSize(variant), [variant]);
  const caption =
    scene === 'mat' && variant && product
      ? `${product.name} · ${Object.values(variant.attributes).join(' · ')} · ${w} × ${h} mm`
      : CAPTIONS[scene === 'mat' ? 'clips' : scene];

  // Phần nào đang ở giữa màn hình thì sân khấu chuyển theo.
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>('[data-scene]');
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) if (e.isIntersecting) setScene((e.target as HTMLElement).dataset.scene as Scene);
      },
      { rootMargin: '-40% 0px -40% 0px' },
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, [product]);

  return (
    <>
      <div className="split">
        <div className="stage-col">
          <div className="stage">
            <DeskScene scene={scene} width={w} height={h} color={colorOf(variant)} label={caption} />
            <p className="stage-caption" aria-live="polite">
              {caption}
            </p>
          </div>
        </div>

        <div className="content-col">
          <section className="hero-text" data-scene="mat">
            <h1 className="wordmark">nook studio</h1>
            <p className="statement" data-reveal>
              Deskmat và phụ kiện quản lý dây tối giản, cho một góc bàn gọn gàng.
            </p>
            <a className="btn hero-action" href="#chon-deskmat" data-reveal style={{ '--d': '80ms' } as React.CSSProperties}>
              Chọn tấm lót
            </a>
          </section>

          {product && (
            <section id="chon-deskmat" className="block" data-scene="mat" aria-labelledby="mat-h">
              <h2 id="mat-h" data-reveal>
                {product.name}
              </h2>
              <p data-reveal>{product.shortDescription}</p>
              <Configurator product={product} onChange={setAttrs} />
            </section>
          )}

          <section className="block" data-scene="clips" aria-labelledby="cable-h">
            <h2 id="cable-h" data-reveal>
              Dây gọn, bàn thoáng
            </h2>
            <p data-reveal>
              Một vài kẹp nhỏ giữ dây sạc, dây tai nghe và dây chuột đúng chỗ. Nhìn sang bên cạnh: cùng một chiếc bàn, trước và sau khi có kẹp.
            </p>
            <figure className="photo" data-reveal>
              <img src="/images/desk-cables.jpg" alt="Dây cáp đen uốn trên mặt bàn gỗ" width="1920" height="1282" loading="lazy" />
            </figure>
            <p data-reveal>
              <Link to="/products?category=cable">Xem kẹp dây</Link>
            </p>
          </section>

          <section className="block" data-scene="bundle" aria-labelledby="price-h">
            <h2 id="price-h" data-reveal>
              Bảng giá
            </h2>
            <div data-reveal>
              <PriceSheet />
            </div>
          </section>

          <section className="block letter" data-scene="bundle" aria-labelledby="about-h">
            <h2 id="about-h" data-reveal>
              Về {BRAND_NAME}
            </h2>
            <figure className="photo" data-reveal>
              <img src="/images/mousepad.jpg" alt="Tấm lót chuột và chuột đặt trên mặt bàn" width="1280" height="887" loading="lazy" />
            </figure>
            <p data-reveal>Một góc bàn gọn không cần nhiều thứ. Chúng tôi làm vài món nhỏ để góc bàn của bạn gọn lại và dễ chịu hơn mỗi ngày.</p>
            <p data-reveal>
              Deskmat cho chuột một mặt phẳng êm và giữ bàn phím đứng yên. Kẹp dây giữ mỗi sợi đúng chỗ. Không thêm gì ngoài những thứ bạn thật sự dùng.
            </p>
            <p data-reveal>Mỗi sản phẩm được vẽ theo kích thước thật, nên cỡ bạn chọn trên trang chính là cỡ bạn nhận.</p>
            <p className="signoff" data-reveal>
              {BRAND_NAME}
            </p>
          </section>
        </div>
      </div>

      <section className="cta" aria-labelledby="cta-h">
        <img className="cta-img" src="/images/leather-mat.jpg" alt="Tấm lót da và chuột trên mặt bàn trắng" width="1920" height="1280" loading="lazy" />
        <div className="cta-text">
          <h2 id="cta-h" data-reveal>
            Bắt đầu từ một tấm lót.
          </h2>
          <p data-reveal>Chọn cỡ, chọn màu, đặt hàng và thanh toán khi nhận hàng.</p>
          <Link className="btn btn-paper" to="/products" data-reveal>
            Xem tất cả sản phẩm
          </Link>
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
