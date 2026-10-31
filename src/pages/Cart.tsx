import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import ProductImage from '../components/ProductImage';
import { CatalogGate } from '../components/StatusMessages';
import Totals from '../components/Totals';
import { MAX_QTY, QTY_ERROR } from '../config';
import { useCart } from '../lib/CartContext';
import { formatMoney, parseQuantity } from '../lib/money';
import { useCartView, type CartLineView } from '../lib/useCartView';
import { useTitle } from '../lib/useTitle';

function CartContent() {
  const { persistent, setQuantity, removeLine } = useCart();
  const { views, subtotal, currency, hasInvalid } = useCartView();
  const navigate = useNavigate();
  // Bản nháp ô số lượng; số lượng đã commit mới được dùng để tính tiền.
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [removed, setRemoved] = useState<string | null>(null);

  const clearDraft = (id: string) => {
    setDrafts(({ [id]: _, ...rest }) => rest);
    setErrors(({ [id]: _, ...rest }) => rest);
  };

  const commit = (line: CartLineView) => {
    const raw = drafts[line.variantId];
    if (raw === undefined) return;
    const n = parseQuantity(raw);
    if (n === null) {
      setErrors((e) => ({ ...e, [line.variantId]: QTY_ERROR }));
      return;
    }
    setQuantity(line.variantId, n);
    clearDraft(line.variantId);
  };

  const step = (line: CartLineView, delta: number) => {
    setQuantity(line.variantId, Math.min(MAX_QTY, Math.max(1, line.quantity + delta)));
    clearDraft(line.variantId);
  };

  const remove = (line: CartLineView) => {
    removeLine(line.variantId);
    clearDraft(line.variantId);
    setRemoved(`Đã xóa ${line.name} khỏi giỏ.`);
  };

  if (views.length === 0) {
    return (
      <>
        <p>Giỏ hàng mô phỏng đang trống.</p>
        {removed && <p role="status">{removed}</p>}
        <Link className="btn" to="/products">
          Khám phá sản phẩm
        </Link>
      </>
    );
  }

  const blocked = hasInvalid || Object.keys(errors).length > 0;

  return (
    <>
      <p className="callout">Đây là giỏ mô phỏng, không phát sinh giao dịch</p>
      {!persistent && <p role="status">Giỏ chỉ được giữ khi bạn còn mở trang này.</p>}
      {removed && <p role="status">{removed}</p>}

      <div className="cart-layout">
        <ul className="cart-lines">
          {views.map((line) => {
            const error = errors[line.variantId];
            const inputId = `qty-${line.variantId}`;
            return (
              <li key={line.variantId} className="cart-line">
                <ProductImage image={line.image} className="cart-thumb" />
                <div>
                  <h2 className="line-name">
                    {line.product ? <Link to={`/products/${line.product.slug}`}>{line.name}</Link> : line.name}
                  </h2>
                  {line.components.length > 0 && (
                    <ul className="small">
                      {line.components.map((c) => (
                        <li key={c}>{c}</li>
                      ))}
                    </ul>
                  )}
                  <p className="small muted">Muốn đổi cấu hình: xóa dòng này và chọn lại tại trang chi tiết.</p>
                  {line.problem && (
                    <p role="alert" className="error">
                      Cần kiểm tra: {line.problem}
                    </p>
                  )}
                  <p>Đơn giá: {formatMoney(line.unitPrice, currency)}</p>
                  <div className="qty">
                    <label htmlFor={inputId}>Số lượng</label>
                    <button type="button" className="btn btn-secondary" aria-label={`Giảm số lượng ${line.name}`} disabled={line.quantity === 1} onClick={() => step(line, -1)}>
                      −
                    </button>
                    <input
                      id={inputId}
                      type="text"
                      inputMode="numeric"
                      value={drafts[line.variantId] ?? String(line.quantity)}
                      aria-invalid={error !== undefined}
                      aria-describedby={error ? `${inputId}-error` : undefined}
                      onChange={(e) => {
                        setDrafts((d) => ({ ...d, [line.variantId]: e.target.value }));
                        setErrors(({ [line.variantId]: _, ...rest }) => rest);
                      }}
                      onBlur={() => commit(line)}
                      onKeyDown={(e) => e.key === 'Enter' && commit(line)}
                    />
                    <button type="button" className="btn btn-secondary" aria-label={`Tăng số lượng ${line.name}`} disabled={line.quantity === MAX_QTY} onClick={() => step(line, 1)}>
                      +
                    </button>
                  </div>
                  {error && (
                    <p id={`${inputId}-error`} role="alert" className="error">
                      {error}
                    </p>
                  )}
                  <p>
                    Thành tiền: <strong>{formatMoney(line.lineTotal, currency)}</strong>
                  </p>
                  <button type="button" className="btn btn-secondary" onClick={() => remove(line)}>
                    Xóa
                  </button>
                </div>
              </li>
            );
          })}
        </ul>

        <aside className="cart-summary" aria-label="Tóm tắt giỏ hàng">
          <Totals subtotal={subtotal} currency={currency} />
          <button type="button" className="btn" disabled={blocked} onClick={() => navigate('/checkout-demo')}>
            Bắt đầu checkout mô phỏng
          </button>
          {blocked && <p className="error small">Hãy sửa hoặc xóa dòng lỗi trước khi checkout.</p>}
          <Link className="btn btn-secondary" to="/products">
            Tiếp tục xem sản phẩm
          </Link>
        </aside>
      </div>
    </>
  );
}

export default function Cart() {
  useTitle('Giỏ hàng');
  return (
    <>
      <h1>Giỏ hàng</h1>
      <CatalogGate>
        <CartContent />
      </CatalogGate>
    </>
  );
}
