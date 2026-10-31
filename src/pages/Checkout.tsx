import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CatalogGate } from '../components/StatusMessages';
import Totals from '../components/Totals';
import { ApiError, api, type Customer } from '../lib/api';
import { useCart } from '../lib/CartContext';
import { useCatalog } from '../lib/CatalogContext';
import { formatMoney } from '../lib/money';
import { useCartView } from '../lib/useCartView';
import { useTitle } from '../lib/useTitle';

type Field = keyof Customer;

const FIELDS: { name: Field; label: string; max: number; missing: string; autoComplete: string }[] = [
  { name: 'name', label: 'Họ tên', max: 100, missing: 'Vui lòng nhập họ tên.', autoComplete: 'name' },
  { name: 'phone', label: 'Số điện thoại', max: 30, missing: 'Vui lòng nhập số điện thoại.', autoComplete: 'tel' },
  { name: 'address', label: 'Địa chỉ nhận hàng', max: 300, missing: 'Vui lòng nhập địa chỉ nhận hàng.', autoComplete: 'street-address' },
];

function CheckoutContent() {
  const { saveOrder, clearLines } = useCart();
  const { reload } = useCatalog();
  const { views, subtotal, currency, hasInvalid } = useCartView();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', address: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const submitting = useRef(false);

  if (views.length === 0) {
    return (
      <>
        <p>Giỏ hàng của bạn đang trống.</p>
        <Link className="btn" to="/products">
          Khám phá sản phẩm
        </Link>
      </>
    );
  }

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current || hasInvalid) return;

    const errors: Partial<Record<Field, string>> = {};
    for (const f of FIELDS) if (!customer[f.name].trim()) errors[f.name] = f.missing;
    setFieldErrors(errors);
    const firstBad = FIELDS.find((f) => errors[f.name]);
    if (firstBad) {
      document.getElementById(`customer-${firstBad.name}`)?.focus();
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError(null);
    try {
      // Server tính lại giá từ DB và trừ tồn kho; client chỉ gửi ID + số lượng.
      const order = await api.createOrder(
        views.map((v) => ({ variantId: v.variantId, quantity: v.quantity })),
        customer,
      );
      saveOrder(order);
      clearLines();
      navigate('/order/confirmation');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Chưa thể đặt hàng. Vui lòng thử lại.');
      // Tồn kho/giá có thể đã đổi; tải lại catalog để giỏ phản ánh đúng. Giỏ không bị xóa.
      if (err instanceof ApiError && err.status === 409) reload();
      setBusy(false);
      submitting.current = false;
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate className="checkout">
      <section aria-labelledby="sum-h">
        <h2 id="sum-h">Đơn hàng của bạn</h2>
        <ul>
          {views.map((v) => (
            <li key={v.variantId}>
              {v.name} × {v.quantity}, {formatMoney(v.lineTotal, currency)}
              {v.components.length > 0 && (
                <ul className="small">
                  {v.components.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              )}
              {v.problem && (
                <span role="alert" className="error">
                  {' '}
                  Cần kiểm tra: {v.problem}
                </span>
              )}
            </li>
          ))}
        </ul>
        <Link to="/cart">Sửa giỏ hàng</Link>
      </section>

      <section aria-labelledby="ship-h">
        <h2 id="ship-h">Thông tin nhận hàng</h2>
        {FIELDS.map((f) => (
          <div key={f.name} className="field">
            <label htmlFor={`customer-${f.name}`}>{f.label}</label>
            <input
              id={`customer-${f.name}`}
              type="text"
              autoComplete={f.autoComplete}
              maxLength={f.max}
              value={customer[f.name]}
              aria-invalid={fieldErrors[f.name] !== undefined}
              aria-describedby={fieldErrors[f.name] ? `customer-${f.name}-error` : undefined}
              onChange={(e) => {
                setCustomer((c) => ({ ...c, [f.name]: e.target.value }));
                setFieldErrors((errs) => ({ ...errs, [f.name]: undefined }));
              }}
            />
            {fieldErrors[f.name] && (
              <p id={`customer-${f.name}-error`} role="alert" className="error">
                {fieldErrors[f.name]}
              </p>
            )}
          </div>
        ))}
      </section>

      <section aria-labelledby="pay-h">
        <h2 id="pay-h">Thanh toán</h2>
        <p>Thanh toán khi nhận hàng (COD).</p>
      </section>

      <Totals subtotal={subtotal} currency={currency} />

      <p className="small">
        Bằng việc đặt hàng, bạn đồng ý với <Link to="/policies/shipping">chính sách giao hàng</Link>,{' '}
        <Link to="/policies/returns">đổi trả</Link> và <Link to="/policies/privacy">quyền riêng tư</Link>.
      </p>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      <button type="submit" className="btn" disabled={busy || hasInvalid}>
        {busy ? 'Đang xử lý…' : 'Đặt hàng'}
      </button>{' '}
      <Link className="btn btn-secondary" to="/cart">
        Quay lại giỏ hàng
      </Link>
    </form>
  );
}

export default function Checkout() {
  useTitle('Đặt hàng');
  return (
    <>
      <h1>Đặt hàng</h1>
      <CatalogGate>
        <CheckoutContent />
      </CatalogGate>
    </>
  );
}
