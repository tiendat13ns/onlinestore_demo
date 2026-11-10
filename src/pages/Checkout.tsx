import { useRef, useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { artFor } from '../components/art';
import ProductImage from '../components/ProductImage';
import { CatalogGate } from '../components/StatusMessages';
import Totals from '../components/Totals';
import { ApiError, api, type Customer } from '../lib/api';
import { useCart } from '../lib/CartContext';
import { useCatalog } from '../lib/CatalogContext';
import { formatMoney } from '../lib/money';
import { normalizePhone } from '../lib/normalize';
import { useCartView } from '../lib/useCartView';
import { useTitle } from '../lib/useTitle';

type Field = keyof Customer;

interface FieldSpec {
  name: Field;
  label: string;
  max: number;
  autoComplete: string;
  hint: string;
  multiline?: boolean;
  validate: (value: string) => string | null;
}

const FIELDS: FieldSpec[] = [
  {
    name: 'name',
    label: 'Họ tên',
    max: 100,
    autoComplete: 'name',
    hint: 'Tên người nhận hàng.',
    validate: (v) => (v.trim().length < 2 ? 'Vui lòng nhập họ tên.' : null),
  },
  {
    name: 'phone',
    label: 'Số điện thoại',
    max: 30,
    autoComplete: 'tel',
    hint: 'Ví dụ: 0901234567. Dùng để xác nhận đơn và để bạn tra cứu đơn sau này.',
    validate: (v) => (!v.trim() ? 'Vui lòng nhập số điện thoại.' : normalizePhone(v) ? null : 'Số điện thoại chưa đúng. Ví dụ: 0901234567.'),
  },
  {
    name: 'address',
    label: 'Địa chỉ nhận hàng',
    max: 300,
    autoComplete: 'street-address',
    hint: 'Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành.',
    multiline: true,
    validate: (v) =>
      !v.trim() ? 'Vui lòng nhập địa chỉ nhận hàng.' : v.trim().length < 10 ? 'Vui lòng nhập địa chỉ đầy đủ (số nhà, đường, phường/xã, tỉnh/thành).' : null,
  },
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

  const check = (f: FieldSpec, value = customer[f.name]) => setFieldErrors((errs) => ({ ...errs, [f.name]: f.validate(value) ?? undefined }));

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (submitting.current || hasInvalid) return;

    const errors: Partial<Record<Field, string>> = {};
    for (const f of FIELDS) {
      const message = f.validate(customer[f.name]);
      if (message) errors[f.name] = message;
    }
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
        { name: customer.name.trim(), phone: customer.phone.trim(), address: customer.address.trim() },
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
    <form onSubmit={onSubmit} noValidate className="checkout-layout">
      <div>
        <section className="panel" aria-labelledby="ship-h">
          <h2 id="ship-h">Thông tin nhận hàng</h2>
          {FIELDS.map((f) => {
            const id = `customer-${f.name}`;
            const err = fieldErrors[f.name];
            const common = {
              id,
              autoComplete: f.autoComplete,
              maxLength: f.max,
              value: customer[f.name],
              'aria-invalid': err !== undefined,
              'aria-describedby': `${id}-hint${err ? ` ${id}-error` : ''}`,
              onChange: (e: { target: { value: string } }) => {
                setCustomer((c) => ({ ...c, [f.name]: e.target.value }));
                if (err) check(f, e.target.value);
              },
              onBlur: () => customer[f.name] && check(f),
            };
            return (
              <div key={f.name} className="field">
                <label htmlFor={id}>{f.label}</label>
                {f.multiline ? <textarea rows={3} {...common} /> : <input type={f.name === 'phone' ? 'tel' : 'text'} inputMode={f.name === 'phone' ? 'tel' : undefined} {...common} />}
                <p id={`${id}-hint`} className="hint">
                  {f.hint}
                </p>
                {err && (
                  <p id={`${id}-error`} role="alert" className="error">
                    {err}
                  </p>
                )}
              </div>
            );
          })}
        </section>

        <section className="panel" aria-labelledby="pay-h">
          <h2 id="pay-h">Thanh toán</h2>
          <div className="pay-card">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="6" width="18" height="12" rx="2" />
              <circle cx="12" cy="12" r="2.5" />
              <path d="M6.5 9.5v5M17.5 9.5v5" />
            </svg>
            <div>
              <strong>Thanh toán khi nhận hàng (COD)</strong>
              <p className="small muted">Kiểm tra sản phẩm rồi mới trả tiền cho người giao hàng.</p>
            </div>
          </div>
        </section>
      </div>

      <aside className="panel checkout-aside" aria-labelledby="sum-h">
        <h2 id="sum-h">Đơn hàng của bạn</h2>
        <ul className="sum-list">
          {views.map((v) => (
            <li key={v.variantId} className="sum-item">
              <ProductImage image={v.image} art={v.product ? artFor(v.product, v.variant) : undefined} className="sum-thumb" />
              <div>
                <p className="sum-name">{v.name}</p>
                <p className="small muted">Số lượng: {v.quantity}</p>
                {v.components.length > 0 && (
                  <ul className="small muted">
                    {v.components.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
                {v.problem && (
                  <p role="alert" className="error small">
                    Cần kiểm tra: {v.problem}
                  </p>
                )}
              </div>
              <p className="sum-price">{formatMoney(v.lineTotal, currency)}</p>
            </li>
          ))}
        </ul>
        <Link to="/cart">Sửa giỏ hàng</Link>

        <Totals subtotal={subtotal} currency={currency} />

        <p className="small muted">
          Bằng việc đặt hàng, bạn đồng ý với <Link to="/policies/shipping">chính sách giao hàng</Link>, <Link to="/policies/returns">đổi trả</Link> và{' '}
          <Link to="/policies/privacy">quyền riêng tư</Link>.
        </p>

        {error && (
          <p role="alert" className="error">
            {error}
          </p>
        )}
        {hasInvalid && <p className="error small">Hãy sửa hoặc xóa dòng lỗi trong giỏ trước khi đặt hàng.</p>}

        <button type="submit" className="btn" disabled={busy || hasInvalid}>
          {busy ? 'Đang xử lý…' : 'Đặt hàng'}
        </button>
        <Link className="btn btn-secondary" to="/cart">
          Quay lại giỏ hàng
        </Link>
      </aside>
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
