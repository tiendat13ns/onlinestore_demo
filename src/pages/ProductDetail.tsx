import { useMemo, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { priceText } from '../components/ProductCard';
import { artFor } from '../components/art';
import ProductImage from '../components/ProductImage';
import { CatalogGate, NotFoundMessage } from '../components/StatusMessages';
import { MAX_QTY, QTY_ERROR } from '../config';
import { useCart } from '../lib/CartContext';
import { displayName, useCatalog } from '../lib/CatalogContext';
import { formatMoney, parseQuantity } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import type { Product } from '../types';

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function ProductView({ product }: { product: Product }) {
  const { catalog, variants: variantIndex } = useCatalog();
  const { addItem } = useCart();
  useTitle(product.name);

  const attributes = useMemo(
    () =>
      product.attributeNames.map((name) => ({
        name,
        options: unique(product.variants.map((v) => v.attributes[name]).filter(Boolean)),
      })),
    [product],
  );

  // Thuộc tính chỉ có một lựa chọn thì tự chọn; còn lại để trống.
  const [selection, setSelection] = useState<Record<string, string>>(() =>
    Object.fromEntries(attributes.filter((a) => a.options.length === 1).map((a) => [a.name, a.options[0]])),
  );
  const [attrErrors, setAttrErrors] = useState<Record<string, string>>({});
  const [conflict, setConflict] = useState<string | null>(null);
  const [qtyRaw, setQtyRaw] = useState('1');
  const [qtyError, setQtyError] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [imageIndex, setImageIndex] = useState(0);
  const qtyInput = useRef<HTMLInputElement>(null);

  const variant = attributes.every((a) => selection[a.name])
    ? product.variants.find((v) => attributes.every((a) => v.attributes[a.name] === selection[a.name]))
    : undefined;

  const priceKnown = catalog.currency !== null;
  const blockedReason = (() => {
    const candidates = variant ? [variant] : product.variants;
    if (!priceKnown || candidates.every((v) => v.price === null)) {
      return 'Sản phẩm sắp ra mắt.';
    }
    if (candidates.every((v) => v.inStock === false)) return 'Hết hàng.';
    if (product.kind === 'bundle' && candidates.every((v) => !v.components?.length)) {
      return 'Bộ sản phẩm này tạm thời chưa mở bán.';
    }
    return null;
  })();

  const pick = (name: string, option: string) => {
    const next: Record<string, string> = { [name]: option };
    const dropped: string[] = [];
    for (const a of attributes) {
      if (a.name === name) continue;
      if (a.options.length === 1) {
        next[a.name] = a.options[0];
        continue;
      }
      const current = selection[a.name];
      if (!current) continue;
      const candidate = { ...next, [a.name]: current };
      const exists = product.variants.some((v) => Object.entries(candidate).every(([k, val]) => v.attributes[k] === val));
      if (exists) next[a.name] = current;
      else dropped.push(a.name);
    }
    setSelection(next);
    setConflict(dropped.length ? `Tổ hợp này không tồn tại; đã bỏ chọn ${dropped.join(', ')}. Vui lòng chọn lại.` : null);
    setAttrErrors({});
    setNotice(null);
    setAddError(null);
  };

  const qty = parseQuantity(qtyRaw);
  const stepQty = (delta: number) => {
    setQtyRaw(String(Math.min(MAX_QTY, Math.max(1, (qty ?? 1) + delta))));
    setQtyError(null);
  };

  const onAdd = () => {
    setNotice(null);
    setAddError(null);

    const errors: Record<string, string> = {};
    for (const a of attributes) if (!selection[a.name]) errors[a.name] = `Vui lòng chọn ${a.name}.`;
    setAttrErrors(errors);
    setQtyError(qty === null ? QTY_ERROR : null);

    const firstMissing = attributes.findIndex((a) => errors[a.name]);
    if (firstMissing >= 0) {
      document.getElementById(`attr-${firstMissing}`)?.focus();
      return;
    }
    if (qty === null) {
      qtyInput.current?.focus();
      return;
    }
    if (!variant || variant.price === null || blockedReason) return;

    const result = addItem(variant.id, qty);
    if (result.ok) setNotice(`Đã thêm ${displayName(product, variant)} × ${qty} vào giỏ.`);
    else setAddError(result.error);
  };

  const price = variant ? formatMoney(variant.price, catalog.currency) : priceText(product, catalog.currency);
  const image = product.images[imageIndex];
  const specs = (variant?.specs ?? product.variants[0]?.specs ?? []).filter((s) => s.value !== null);
  const includesList =
    product.kind === 'bundle'
      ? (variant?.components?.map((c) => {
          const child = variantIndex.get(c.variantId);
          return `${c.quantity} × ${child ? displayName(child.product, child.variant) : c.variantId}`;
        }) ?? null)
      : product.includes;
  const related = product.relatedIds
    .map((id) => catalog.products.find((p) => p.id === id))
    .filter((p) => p !== undefined)
    .slice(0, 3);

  return (
    <>
      <nav aria-label="Breadcrumb" className="breadcrumb">
        <Link to="/">Trang chủ</Link> / <Link to="/products">Sản phẩm</Link> /{' '}
        <span aria-current="page">{product.name}</span>
      </nav>

      <div className="detail">
        <div className="gallery">
          <ProductImage image={image} art={artFor(product, variant, imageIndex)} className="gallery-main" />
          <p className="small muted">
            Ảnh {imageIndex + 1}/{product.images.length}
          </p>
          <div className="thumbs">
            {product.images.map((img, i) => (
              <button
                key={i}
                type="button"
                className="thumb"
                aria-pressed={i === imageIndex}
                aria-label={`Xem ảnh ${i + 1}: ${img.alt}`}
                onClick={() => setImageIndex(i)}
              >
                <ProductImage image={img} art={artFor(product, variant, i)} />
              </button>
            ))}
          </div>
        </div>

        <div className="buybox">
          <h1>{product.name}</h1>
          <p>{product.shortDescription}</p>
          <p className="price big">{price}</p>

          {attributes.map((a, i) => (
            <fieldset key={a.name} id={`attr-${i}`} tabIndex={-1}>
              <legend>{a.name}</legend>
              {a.options.map((option) => (
                <label key={option} className="choice">
                  <input
                    type="radio"
                    name={`attr-${a.name}`}
                    checked={selection[a.name] === option}
                    onChange={() => pick(a.name, option)}
                  />
                  <span>{option}</span>
                </label>
              ))}
              {attrErrors[a.name] && (
                <p role="alert" className="error">
                  {attrErrors[a.name]}
                </p>
              )}
            </fieldset>
          ))}
          {conflict && <p role="status">{conflict}</p>}

          <div className="qty">
            <label htmlFor="qty">Số lượng</label>
            <button type="button" className="btn btn-secondary" aria-label="Giảm số lượng" disabled={qty === 1} onClick={() => stepQty(-1)}>
              −
            </button>
            <input
              id="qty"
              ref={qtyInput}
              type="text"
              inputMode="numeric"
              value={qtyRaw}
              aria-invalid={qtyError !== null}
              aria-describedby={qtyError ? 'qty-error' : undefined}
              onChange={(e) => {
                setQtyRaw(e.target.value);
                setQtyError(null);
              }}
            />
            <button type="button" className="btn btn-secondary" aria-label="Tăng số lượng" disabled={qty === MAX_QTY} onClick={() => stepQty(1)}>
              +
            </button>
          </div>
          {qtyError && (
            <p id="qty-error" role="alert" className="error">
              {qtyError}
            </p>
          )}

          <button type="button" className="btn" disabled={blockedReason !== null} onClick={onAdd}>
            Thêm vào giỏ
          </button>
          {blockedReason && <p className="muted">{blockedReason}</p>}
          {addError && (
            <p role="alert" className="error">
              {addError}
            </p>
          )}
          {notice && (
            <p role="status" className="success">
              {notice} <Link to="/cart">Xem giỏ</Link>
            </p>
          )}

          <p className="small">
            <Link to="/policies/shipping">Giao hàng</Link> · <Link to="/policies/returns">Đổi trả</Link> ·{' '}
            <Link to="/policies/privacy">Quyền riêng tư</Link>
          </p>
        </div>
      </div>

      <div className="detail-info">
      <section aria-labelledby="desc-h" data-reveal>
        <h2 id="desc-h">Mô tả</h2>
        <p>{product.description}</p>
        {product.usage && <p>Cách dùng và bảo quản: {product.usage}</p>}
      </section>

      {specs.length > 0 && (
        <section aria-labelledby="spec-h" data-reveal>
          <h2 id="spec-h">Thông số</h2>
          <table>
            <tbody>
              {specs.map((s) => (
                <tr key={s.name}>
                  <th scope="row">{s.name}</th>
                  <td>{s.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {includesList && includesList.length > 0 && (
        <section aria-labelledby="inc-h" data-reveal>
          <h2 id="inc-h">{product.kind === 'bundle' ? 'Bộ gồm' : 'Trong hộp'}</h2>
          <ul>
            {includesList.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </section>
      )}

      </div>

      {related.length > 0 && (
        <section aria-labelledby="rel-h">
          <h2 id="rel-h">Liên quan</h2>
          <ul>
            {related.map((p) => (
              <li key={p.id}>
                {p.name}: <Link to={`/products/${p.slug}`}>Xem chi tiết</Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  );
}

function Resolver() {
  const { slug } = useParams();
  const { catalog } = useCatalog();
  const product = catalog.products.find((p) => p.slug === slug);
  if (!product) return <NotFoundMessage what="sản phẩm" />;
  // key = id để reset toàn bộ state cấu hình khi đổi sản phẩm.
  return <ProductView key={product.id} product={product} />;
}

export default function ProductDetail() {
  return (
    <CatalogGate>
      <Resolver />
    </CatalogGate>
  );
}
