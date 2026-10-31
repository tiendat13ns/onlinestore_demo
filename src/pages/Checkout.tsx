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

const FIELDS: { name: Field; label: string; max: number; missing: string }[] = [
  { name: 'name', label: 'Họ tên (dữ liệu giả)', max: 100, missing: 'Vui lòng nhập họ tên.' },
  { name: 'phone', label: 'Số điện thoại (dữ liệu giả)', max: 30, missing: 'Vui lòng nhập số điện thoại.' },
  { name: 'address', label: 'Địa chỉ (dữ liệu giả)', max: 300, missing: 'Vui lòng nhập địa chỉ.' },
];

const SAMPLE: Customer = { name: 'Nguyễn Văn Demo', phone: '0900000000', address: '1 Đường Demo, Quận Demo, Hà Nội' };

function CheckoutContent() {
  const { saveOrder, clearLines } = useCart();
  const { reload } = useCatalog();
  const { views, subtotal, currency, hasInvalid } = useCartView();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer>({ name: '', phone: '', address: '' });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<Field, string>>>({});
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const checkbox = useRef<HTMLInputElement>(null);
  const submitting = useRef(false);

  if (views.length === 0) {
    return (
      <>
        <p>Giỏ hàng mô phỏng đang trống.</p>
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
    if (!agreed) {
      setError('Vui lòng xác nhận bạn hiểu đây là mô phỏng.');
      checkbox.current?.focus();
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
      navigate('/order-demo/confirmation');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Chưa hoàn tất mô phỏng. Vui lòng thử lại.');
      // Tồn kho/giá có thể đã đổi; tải lại catalog để giỏ phản ánh đúng. Giỏ không bị xóa.
      if (err instanceof ApiError && err.status === 409) reload();
      setBusy(false);
      submitting.current = false;
    }
  };

  return (
    <form onSubmit={onSubmit} noValidate>
      <section aria-labelledby="sum-h">
        <h2 id="sum-h">Tóm tắt giỏ</h2>
        <ul>
          {views.map((v) => (
            <li key={v.variantId}>
              {v.name} × {v.quantity} — {formatMoney(v.lineTotal, currency)}
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
        <h2 id="ship-h">Thông tin nhận hàng (dữ liệu giả)</h2>
        <p className="callout">
          Chỉ nhập dữ liệu giả. Đừng nhập thông tin cá nhân thật. Không có giao hàng thực tế.
        </p>
        <button type="button" className="btn btn-secondary" onClick={() => { setCustomer(SAMPLE); setFieldErrors({}); }}>
          Điền dữ liệu mẫu
        </button>
        {FIELDS.map((f) => (
          <div key={f.name} className="field">
            <label htmlFor={`customer-${f.name}`}>{f.label}</label>
            <input
              id={`customer-${f.name}`}
              type="text"
              autoComplete="off"
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
        <h2 id="pay-h">Thanh toán mô phỏng</h2>
        <p>Không thu tiền.</p>
      </section>

      <Totals subtotal={subtotal} currency={currency} />

      <p className="small">
        Đọc thêm: <Link to="/policies/shipping">Giao hàng</Link> · <Link to="/policies/returns">Đổi trả</Link> ·{' '}
        <Link to="/policies/privacy">Quyền riêng tư</Link>
      </p>

      <label className="choice">
        <input
          ref={checkbox}
          type="checkbox"
          checked={agreed}
          aria-describedby={error ? 'checkout-error' : undefined}
          onChange={(e) => {
            setAgreed(e.target.checked);
            setError(null);
          }}
        />
        <span>Tôi hiểu đây là mô phỏng học tập, thông tin nhập là dữ liệu giả, không đặt mua hoặc thanh toán thật.</span>
      </label>
      {error && (
        <p id="checkout-error" role="alert" className="error">
          {error}
        </p>
      )}

      <button type="submit" className="btn" disabled={busy || hasInvalid}>
        {busy ? 'Đang xử lý…' : 'Hoàn tất đơn mô phỏng'}
      </button>{' '}
      <Link className="btn btn-secondary" to="/cart">
        Quay lại giỏ hàng
      </Link>
    </form>
  );
}

export default function Checkout() {
  useTitle('Checkout mô phỏng');
  return (
    <>
      <h1>Checkout mô phỏng</h1>
      <p>Không thanh toán, không giao hàng thật. Chỉ nhập dữ liệu giả.</p>
      <CatalogGate>
        <CheckoutContent />
      </CatalogGate>
    </>
  );
}
