import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { ApiError, adminSession, api, type AdminProduct } from '../lib/api';
import { formatDateTime, formatMoney } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS, type AdminOrder, type OrderStatus } from '../types';

const NEXT: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['shipping', 'cancelled'],
  shipping: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

function errMsg(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      adminSession.set((await api.admin.login(password)).token);
      onDone();
    } catch (err) {
      setError(errMsg(err));
    }
  };

  return (
    <form onSubmit={submit} className="lookup">
      <p className="lead">Đăng nhập để quản lý đơn hàng, giá và tồn kho.</p>
      <label htmlFor="admin-pw">Mật khẩu admin</label>
      <input id="admin-pw" type="password" autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button type="submit" className="btn">
        Đăng nhập
      </button>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
    </form>
  );
}

function OrdersTab({ onAuthLost }: { onAuthLost: () => void }) {
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setOrders(await api.admin.orders());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setError(errMsg(err));
    }
  }, [onAuthLost]);

  useEffect(() => {
    void load();
  }, [load]);

  const change = async (code: string, status: OrderStatus) => {
    setError(null);
    try {
      const updated = await api.admin.setStatus(code, status);
      setOrders((list) => list?.map((o) => (o.code === code ? updated : o)) ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setError(errMsg(err));
    }
  };

  if (!orders) return error ? <p role="alert" className="error">{error}</p> : <p role="status">Đang tải…</p>;
  if (orders.length === 0) return <p>Chưa có đơn nào.</p>;

  return (
    <>
      {error && <p role="alert" className="error">{error}</p>}
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th scope="col">Mã</th>
              <th scope="col">Khách hàng</th>
              <th scope="col">Sản phẩm</th>
              <th scope="col">Tạm tính</th>
              <th scope="col">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.code}>
                <td>
                  {o.code}
                  <br />
                  <span className="small muted">{formatDateTime(o.createdAt)}</span>
                </td>
                <td>
                  {o.customerName}
                  <br />
                  <span className="small">{o.customerPhone}</span>
                  <br />
                  <span className="small">{o.customerAddress}</span>
                </td>
                <td>
                  <ul className="small">
                    {o.lines.map((l) => (
                      <li key={l.variantId}>
                        {l.name} × {l.quantity}
                      </li>
                    ))}
                  </ul>
                </td>
                <td>{formatMoney(o.subtotal, o.currency)}</td>
                <td>
                  <strong>{STATUS_LABELS[o.status]}</strong>
                  <div className="status-actions">
                    {NEXT[o.status].map((next) => (
                      <button key={next} type="button" className="btn btn-secondary" onClick={() => change(o.code, next)}>
                        → {STATUS_LABELS[next]}
                      </button>
                    ))}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function VariantRow({ variant, label, currency, onAuthLost }: {
  variant: AdminProduct['variants'][number];
  label: string;
  currency: string | null;
  onAuthLost: () => void;
}) {
  const [price, setPrice] = useState(variant.price === null ? '' : String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    // Number('abc') = NaN sẽ bị JSON hóa thành null và âm thầm xóa giá, nên kiểm tra trước.
    const priceText = price.trim();
    if ((priceText !== '' && !/^\d+$/.test(priceText)) || !/^\d+$/.test(stock.trim())) {
      setMessage({ ok: false, text: 'Giá và tồn kho phải là số nguyên không âm.' });
      return;
    }
    const patch: { price: number | null; stock: number } = {
      price: priceText === '' ? null : Number(priceText),
      stock: Number(stock),
    };
    try {
      const saved = await api.admin.patchVariant(variant.id, patch);
      setPrice(saved.price === null ? '' : String(saved.price));
      setStock(String(saved.stock));
      setMessage({ ok: true, text: 'Đã lưu.' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setMessage({ ok: false, text: errMsg(err) });
    }
  };

  return (
    <tr>
      <th scope="row">{label}</th>
      <td>
        <label className="sr-only" htmlFor={`price-${variant.id}`}>Giá {label}</label>
        <input id={`price-${variant.id}`} type="text" inputMode="numeric" value={price} placeholder="Chưa có giá" onChange={(e) => setPrice(e.target.value)} />
        <span className="small muted"> {currency}</span>
      </td>
      <td>
        <label className="sr-only" htmlFor={`stock-${variant.id}`}>Tồn kho {label}</label>
        <input id={`stock-${variant.id}`} type="text" inputMode="numeric" value={stock} onChange={(e) => setStock(e.target.value)} />
      </td>
      <td>
        <button type="button" className="btn btn-secondary" onClick={save}>
          Lưu
        </button>
        {message && (
          <span role={message.ok ? 'status' : 'alert'} className={message.ok ? 'success small' : 'error small'}>
            {' '}
            {message.text}
          </span>
        )}
      </td>
    </tr>
  );
}

function ProductsTab({ onAuthLost }: { onAuthLost: () => void }) {
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [currency, setCurrency] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.admin.products().then(setProducts, (err) => {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setError(errMsg(err));
    });
    api.catalog().then((c) => setCurrency(c.currency), () => undefined);
  }, [onAuthLost]);

  if (!products) return error ? <p role="alert" className="error">{error}</p> : <p role="status">Đang tải…</p>;

  return (
    <>
      <p className="small muted">Sửa giá và tồn kho theo từng biến thể. Đơn đã đặt giữ nguyên giá tại thời điểm đặt. Giá để trống = chưa có giá (chặn thêm giỏ).</p>
      {products.map((p) => (
        <section key={p.id} aria-labelledby={`ap-${p.id}`}>
          <h3 id={`ap-${p.id}`}>{p.name}</h3>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th scope="col">Biến thể</th>
                  <th scope="col">Giá</th>
                  <th scope="col">Tồn kho</th>
                  <th scope="col"><span className="sr-only">Lưu</span></th>
                </tr>
              </thead>
              <tbody>
                {p.variants.map((v) => (
                  <VariantRow
                    key={v.id}
                    variant={v}
                    label={Object.values(v.attributes).join(' / ') || 'Mặc định'}
                    currency={currency}
                    onAuthLost={onAuthLost}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </>
  );
}

export default function Admin() {
  useTitle('Admin');
  const [authed, setAuthed] = useState(() => adminSession.get() !== null);
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const lost = useCallback(() => {
    adminSession.clear();
    setAuthed(false);
  }, []);

  return (
    <>
      <h1>Quản trị</h1>
      {!authed ? (
        <Login onDone={() => setAuthed(true)} />
      ) : (
        <>
          <div className="tabs" role="group" aria-label="Khu quản trị">
            <button type="button" className="btn btn-secondary" aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>
              Đơn hàng
            </button>
            <button type="button" className="btn btn-secondary" aria-pressed={tab === 'products'} onClick={() => setTab('products')}>
              Giá và tồn kho
            </button>
            <button type="button" className="btn btn-secondary" onClick={lost}>
              Đăng xuất
            </button>
          </div>
          {tab === 'orders' ? <OrdersTab onAuthLost={lost} /> : <ProductsTab onAuthLost={lost} />}
        </>
      )}
    </>
  );
}
