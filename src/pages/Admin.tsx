import { useCallback, useEffect, useMemo, useState, type FormEvent, type KeyboardEvent } from 'react';
import { ApiError, adminSession, api, type AdminProduct } from '../lib/api';
import { useCatalog } from '../lib/CatalogContext';
import { formatDateTime, formatMoney } from '../lib/money';
import { fold } from '../lib/search';
import { imageForVariant } from '../lib/variantImage';
import { useTitle } from '../lib/useTitle';
import { CATEGORIES, STATUS_ADMIN_LABELS, STATUS_LABELS, type AdminOrder, type CategoryId, type OrderStatus } from '../types';

const STATUS_ORDER: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'completed', 'cancelled'];

/** Việc tiếp theo shop làm với một đơn, theo đúng thứ tự công việc. */
const ACTION: Partial<Record<OrderStatus, { to: OrderStatus; label: string }>> = {
  pending: { to: 'confirmed', label: 'Xác nhận đơn' },
  confirmed: { to: 'shipping', label: 'Giao cho vận chuyển' },
  shipping: { to: 'completed', label: 'Đánh dấu đã hoàn thành' },
};
const CANCELLABLE: OrderStatus[] = ['pending', 'confirmed', 'shipping'];

const LOW_STOCK = 5;
const PAGE = 20;

function errMsg(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Có lỗi xảy ra. Vui lòng thử lại.';
}

function Login({ onDone }: { onDone: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      adminSession.set((await api.admin.login(password)).token);
      onDone();
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="panel admin-login">
      <h2>Đăng nhập quản trị</h2>
      <p className="muted">Quản lý đơn hàng, giá và tồn kho của cửa hàng.</p>
      <div className="field">
        <label htmlFor="admin-pw">Mật khẩu admin</label>
        <input id="admin-pw" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
      </div>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <button type="submit" className="btn" disabled={busy || password === ''}>
        {busy ? 'Đang đăng nhập…' : 'Đăng nhập'}
      </button>
    </form>
  );
}

function StatusPill({ status }: { status: OrderStatus }) {
  return <span className={`status-pill status-${status}`}>{STATUS_ADMIN_LABELS[status]}</span>;
}

/* ───────────────────────────── Đơn hàng ───────────────────────────── */

function OrdersTab({
  orders,
  error,
  onReload,
  onStatus,
}: {
  orders: AdminOrder[] | null;
  error: string | null;
  onReload: () => void;
  onStatus: (code: string, status: OrderStatus) => Promise<void>;
}) {
  const { variants } = useCatalog();
  const [filter, setFilter] = useState<OrderStatus | 'all'>('all');
  const [query, setQuery] = useState('');
  const [limit, setLimit] = useState(PAGE);
  const [busy, setBusy] = useState<string | null>(null);
  const [cancelling, setCancelling] = useState<string | null>(null);

  const counts = useMemo(() => {
    const c: Record<OrderStatus, number> = { pending: 0, confirmed: 0, shipping: 0, completed: 0, cancelled: 0 };
    for (const o of orders ?? []) c[o.status]++;
    return c;
  }, [orders]);

  const visible = useMemo(() => {
    const q = fold(query);
    const digits = query.replace(/\D/g, '');
    return (orders ?? []).filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false;
      if (!q) return true;
      if (digits.length >= 3 && o.customerPhone.replace(/\D/g, '').includes(digits)) return true;
      return fold(`${o.code} ${o.customerName} ${o.customerAddress}`).includes(q);
    });
  }, [orders, filter, query]);

  const run = async (code: string, status: OrderStatus) => {
    setBusy(code);
    try {
      await onStatus(code, status);
    } finally {
      setBusy(null);
      setCancelling(null);
    }
  };

  if (!orders) return error ? <p role="alert" className="error">{error}</p> : <p role="status">Đang tải đơn hàng…</p>;

  return (
    <>
      <div className="admin-tiles" role="group" aria-label="Lọc đơn theo trạng thái">
        <button type="button" className="admin-tile" aria-pressed={filter === 'all'} onClick={() => { setFilter('all'); setLimit(PAGE); }}>
          <span className="num">{orders.length}</span>
          <span>Tất cả đơn</span>
        </button>
        {STATUS_ORDER.map((s) => (
          <button
            key={s}
            type="button"
            className={`admin-tile${s === 'pending' && counts.pending > 0 ? ' attention' : ''}`}
            aria-pressed={filter === s}
            onClick={() => { setFilter(s); setLimit(PAGE); }}
          >
            <span className="num">{counts[s]}</span>
            <span>{STATUS_ADMIN_LABELS[s]}</span>
          </button>
        ))}
      </div>

      <div className="admin-toolbar">
        <div className="search admin-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={query} placeholder="Tìm theo mã đơn, tên, số điện thoại, địa chỉ…" aria-label="Tìm đơn hàng" onChange={(e) => { setQuery(e.target.value); setLimit(PAGE); }} />
        </div>
        <button type="button" className="btn btn-secondary" onClick={onReload}>
          Tải lại
        </button>
      </div>

      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}
      <p className="small muted" role="status">
        {visible.length === orders.length ? `${orders.length} đơn` : `${visible.length} trên ${orders.length} đơn`}
      </p>

      {orders.length === 0 ? (
        <div className="panel">
          <p>Chưa có đơn hàng nào. Khi khách đặt hàng, đơn sẽ hiện ở đây.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="panel">
          <p>Không có đơn nào khớp bộ lọc hiện tại.</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setFilter('all'); setQuery(''); }}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="admin-orders">
          {visible.slice(0, limit).map((o) => {
            const action = ACTION[o.status];
            const working = busy === o.code;
            return (
              <article key={o.code} className={`admin-order status-card-${o.status}`} aria-label={`Đơn ${o.code}`}>
                <header className="admin-order-head">
                  <div>
                    <p className="order-code">{o.code}</p>
                    <p className="small muted">{formatDateTime(o.createdAt)}</p>
                  </div>
                  <div className="admin-order-meta">
                    <StatusPill status={o.status} />
                    <strong className="admin-total">{formatMoney(o.subtotal, o.currency)}</strong>
                  </div>
                </header>

                <div className="admin-order-body">
                  <div className="admin-customer">
                    <p className="admin-label">Khách hàng</p>
                    <p>
                      <strong>{o.customerName}</strong>
                    </p>
                    <p>
                      <a href={`tel:${o.customerPhone}`}>{o.customerPhone}</a>
                    </p>
                    <p className="small">{o.customerAddress}</p>
                  </div>
                  <div>
                    <p className="admin-label">Sản phẩm</p>
                    <ul className="admin-lines">
                      {o.lines.map((l) => {
                        const entry = variants.get(l.variantId);
                        const img = entry ? imageForVariant(entry.product, entry.variant) : undefined;
                        return (
                          <li key={l.variantId}>
                            {img?.src ? <img src={img.src} alt="" width="40" height="40" /> : <span className="admin-thumb-empty" aria-hidden="true" />}
                            <span className="admin-line-name">
                              {l.name}
                              <span className="small muted"> × {l.quantity}</span>
                              {l.components.length > 0 && <span className="small muted block">{l.components.join(', ')}</span>}
                            </span>
                            <span className="small">{formatMoney(l.lineTotal, o.currency)}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                </div>

                <footer className="admin-order-actions">
                  <p className="small muted">Khách đang thấy: “{STATUS_LABELS[o.status]}”</p>
                  {(action || CANCELLABLE.includes(o.status)) && (
                    <div className="admin-buttons">
                      {action && (
                        <button type="button" className="btn" disabled={working} onClick={() => run(o.code, action.to)}>
                          {working ? 'Đang cập nhật…' : action.label}
                        </button>
                      )}
                      {CANCELLABLE.includes(o.status) &&
                        (cancelling === o.code ? (
                          <span className="admin-confirm" role="group" aria-label={`Xác nhận hủy đơn ${o.code}`}>
                            <span className="small">Hủy đơn và trả hàng về kho?</span>
                            <button type="button" className="btn btn-danger" disabled={working} onClick={() => run(o.code, 'cancelled')}>
                              Hủy đơn
                            </button>
                            <button type="button" className="btn btn-secondary" disabled={working} onClick={() => setCancelling(null)}>
                              Không
                            </button>
                          </span>
                        ) : (
                          <button type="button" className="btn btn-secondary" disabled={working} onClick={() => setCancelling(o.code)}>
                            Hủy đơn
                          </button>
                        ))}
                    </div>
                  )}
                </footer>
              </article>
            );
          })}
          {visible.length > limit && (
            <button type="button" className="btn btn-secondary admin-more" onClick={() => setLimit((n) => n + PAGE)}>
              Xem thêm {Math.min(PAGE, visible.length - limit)} đơn
            </button>
          )}
        </div>
      )}
    </>
  );
}

/* ───────────────────────── Giá và tồn kho ───────────────────────── */

type AdminVariant = AdminProduct['variants'][number];

function stockBadge(stock: number, price: number | null) {
  const badges: { text: string; kind: 'out' | 'low' | 'none' }[] = [];
  if (stock === 0) badges.push({ text: 'Hết hàng', kind: 'out' });
  else if (stock <= LOW_STOCK) badges.push({ text: `Sắp hết (${stock})`, kind: 'low' });
  if (price === null) badges.push({ text: 'Chưa có giá', kind: 'none' });
  return badges;
}

function VariantRow({
  variant,
  label,
  currency,
  onSaved,
  onAuthLost,
}: {
  variant: AdminVariant;
  label: string;
  currency: string | null;
  onSaved: (saved: AdminVariant) => void;
  onAuthLost: () => void;
}) {
  const [price, setPrice] = useState(variant.price === null ? '' : String(variant.price));
  const [stock, setStock] = useState(String(variant.stock));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const savedPrice = variant.price === null ? '' : String(variant.price);
  const savedStock = String(variant.stock);
  const dirty = price.trim() !== savedPrice || stock.trim() !== savedStock;
  const priceNumber = /^\d+$/.test(price.trim()) ? Number(price.trim()) : null;

  const bump = (delta: number) => {
    const n = /^\d+$/.test(stock.trim()) ? Number(stock.trim()) : variant.stock;
    setStock(String(Math.max(0, n + delta)));
    setMessage(null);
  };

  const save = async () => {
    // Number('abc') = NaN sẽ bị JSON hóa thành null và âm thầm xóa giá, nên kiểm tra trước.
    const priceText = price.trim();
    if ((priceText !== '' && !/^\d+$/.test(priceText)) || !/^\d+$/.test(stock.trim())) {
      setMessage({ ok: false, text: 'Giá và tồn kho phải là số nguyên không âm.' });
      return;
    }
    setBusy(true);
    try {
      const saved = await api.admin.patchVariant(variant.id, {
        price: priceText === '' ? null : Number(priceText),
        stock: Number(stock),
      });
      setPrice(saved.price === null ? '' : String(saved.price));
      setStock(String(saved.stock));
      onSaved({ ...variant, price: saved.price, stock: saved.stock });
      setMessage({ ok: true, text: 'Đã lưu.' });
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setMessage({ ok: false, text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  };

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && dirty && !busy) {
      e.preventDefault();
      void save();
    }
  };

  const badges = stockBadge(variant.stock, variant.price);

  return (
    <li className={`vrow${dirty ? ' dirty' : ''}`}>
      <div className="vrow-label">
        <span className="vrow-name">{label}</span>
        {badges.map((b) => (
          <span key={b.text} className={`vbadge vbadge-${b.kind}`}>
            {b.text}
          </span>
        ))}
      </div>

      <div className="vfield">
        <label htmlFor={`price-${variant.id}`}>Giá ({currency ?? 'VND'})</label>
        <input id={`price-${variant.id}`} type="text" inputMode="numeric" value={price} placeholder="Chưa có giá" onChange={(e) => { setPrice(e.target.value); setMessage(null); }} onKeyDown={onKey} />
        <span className="small muted">{priceNumber !== null ? formatMoney(priceNumber, currency) : price.trim() === '' ? 'Để trống = chưa mở bán' : 'Chỉ nhập số'}</span>
      </div>

      <div className="vfield">
        <label htmlFor={`stock-${variant.id}`}>Tồn kho</label>
        <div className="stepper">
          <button type="button" className="btn btn-secondary" aria-label={`Giảm tồn kho ${label}`} onClick={() => bump(-1)}>
            −
          </button>
          <input id={`stock-${variant.id}`} type="text" inputMode="numeric" value={stock} onChange={(e) => { setStock(e.target.value); setMessage(null); }} onKeyDown={onKey} />
          <button type="button" className="btn btn-secondary" aria-label={`Tăng tồn kho ${label}`} onClick={() => bump(1)}>
            +
          </button>
        </div>
      </div>

      <div className="vsave">
        <button type="button" className="btn" disabled={!dirty || busy} onClick={save}>
          {busy ? 'Đang lưu…' : 'Lưu'}
        </button>
        <span className="small" role={message ? (message.ok ? 'status' : 'alert') : undefined}>
          {message ? <span className={message.ok ? 'success' : 'error'}>{message.text}</span> : dirty ? <span className="muted">Chưa lưu</span> : null}
        </span>
      </div>
    </li>
  );
}

function ProductsTab({ onAuthLost }: { onAuthLost: () => void }) {
  const { catalog } = useCatalog();
  const [products, setProducts] = useState<AdminProduct[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<CategoryId | 'all'>('all');
  // Bộ lọc kho: một loại cần chú ý, hoặc gộp tất cả (ô tích bên dưới).
  const [focus, setFocus] = useState<'all' | 'attention' | 'out' | 'low' | 'noPrice'>('all');

  useEffect(() => {
    api.admin.products().then(setProducts, (err) => {
      if (err instanceof ApiError && err.status === 401) onAuthLost();
      else setError(errMsg(err));
    });
  }, [onAuthLost]);

  const onSaved = useCallback((saved: AdminVariant) => {
    setProducts((list) => list?.map((p) => ({ ...p, variants: p.variants.map((v) => (v.id === saved.id ? saved : v)) })) ?? null);
  }, []);

  const stats = useMemo(() => {
    const all = (products ?? []).flatMap((p) => p.variants);
    return {
      total: all.length,
      out: all.filter((v) => v.stock === 0).length,
      low: all.filter((v) => v.stock > 0 && v.stock <= LOW_STOCK).length,
      noPrice: all.filter((v) => v.price === null).length,
    };
  }, [products]);

  const matchesFocus = (v: AdminVariant) =>
    focus === 'all' ||
    (focus === 'out' && v.stock === 0) ||
    (focus === 'low' && v.stock > 0 && v.stock <= LOW_STOCK) ||
    (focus === 'noPrice' && v.price === null) ||
    (focus === 'attention' && (v.stock <= LOW_STOCK || v.price === null));
  const toggleFocus = (f: typeof focus) => setFocus((cur) => (cur === f ? 'all' : f));
  const label = (v: AdminVariant) => Object.values(v.attributes).join(' / ') || 'Mặc định';

  const shown = useMemo(() => {
    const q = fold(query);
    return (products ?? [])
      .filter((p) => category === 'all' || p.category === category)
      .map((p) => {
        const nameHit = q === '' || fold(p.name).includes(q);
        const variantsShown = p.variants.filter((v) => (nameHit || fold(label(v)).includes(q)) && matchesFocus(v));
        return { product: p, variants: variantsShown };
      })
      .filter((x) => x.variants.length > 0);
  }, [products, query, category, focus]);

  if (!products) return error ? <p role="alert" className="error">{error}</p> : <p role="status">Đang tải sản phẩm…</p>;

  return (
    <>
      <div className="admin-tiles" aria-label="Tình trạng kho">
        <div className="admin-tile static">
          <span className="num">{stats.total}</span>
          <span>Biến thể</span>
        </div>
        <button type="button" className={`admin-tile${stats.out > 0 ? ' attention' : ''}`} aria-pressed={focus === 'out'} onClick={() => toggleFocus('out')}>
          <span className="num">{stats.out}</span>
          <span>Hết hàng</span>
        </button>
        <button type="button" className="admin-tile" aria-pressed={focus === 'low'} onClick={() => toggleFocus('low')}>
          <span className="num">{stats.low}</span>
          <span>Sắp hết (≤ {LOW_STOCK})</span>
        </button>
        <button type="button" className="admin-tile" aria-pressed={focus === 'noPrice'} onClick={() => toggleFocus('noPrice')}>
          <span className="num">{stats.noPrice}</span>
          <span>Chưa có giá</span>
        </button>
      </div>

      <div className="admin-toolbar">
        <div className="search admin-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-3.5-3.5" />
          </svg>
          <input type="search" value={query} placeholder="Tìm sản phẩm hoặc biến thể…" aria-label="Tìm sản phẩm" onChange={(e) => setQuery(e.target.value)} />
        </div>
        <label className="admin-check">
          <input type="checkbox" checked={focus === 'attention'} onChange={(e) => setFocus(e.target.checked ? 'attention' : 'all')} />
          Chỉ hiện mục cần chú ý
        </label>
      </div>

      <div className="filters" role="group" aria-label="Lọc theo nhóm">
        <button type="button" className="filter-chip" aria-pressed={category === 'all'} onClick={() => setCategory('all')}>
          Tất cả
        </button>
        {CATEGORIES.map((c) => (
          <button key={c.id} type="button" className="filter-chip" aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
            {c.label}
          </button>
        ))}
      </div>

      <p className="small muted">Sửa giá và tồn kho theo từng biến thể rồi bấm Lưu (hoặc Enter). Đơn đã đặt giữ nguyên giá lúc đặt. Giá để trống nghĩa là chưa mở bán, khách không thêm được vào giỏ.</p>
      {error && (
        <p role="alert" className="error">
          {error}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="panel">
          <p>Không có sản phẩm nào khớp bộ lọc.</p>
          <button type="button" className="btn btn-secondary" onClick={() => { setQuery(''); setCategory('all'); setFocus('all'); }}>
            Xóa bộ lọc
          </button>
        </div>
      ) : (
        <div className="admin-products">
          {shown.map(({ product: p, variants: vs }) => {
            const image = p.images.find((i) => i.src);
            const totalStock = p.variants.reduce((n, v) => n + v.stock, 0);
            return (
              <section key={p.id} className="panel admin-product" aria-labelledby={`ap-${p.id}`}>
                <header className="admin-product-head">
                  {image?.src ? <img src={image.src} alt="" width="56" height="56" /> : <span className="admin-thumb-empty big" aria-hidden="true" />}
                  <div>
                    <h3 id={`ap-${p.id}`}>{p.name}</h3>
                    <p className="small muted">
                      {CATEGORIES.find((c) => c.id === p.category)?.label} · {p.variants.length} biến thể · tồn kho {totalStock}
                    </p>
                  </div>
                </header>
                <ul className="vlist">
                  {vs.map((v) => (
                    <VariantRow key={v.id} variant={v} label={label(v)} currency={catalog.currency} onSaved={onSaved} onAuthLost={onAuthLost} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}
    </>
  );
}

/* ───────────────────────────── Trang ───────────────────────────── */

export default function Admin() {
  useTitle('Quản trị');
  const [authed, setAuthed] = useState(() => adminSession.get() !== null);
  const [tab, setTab] = useState<'orders' | 'products'>('orders');
  const [orders, setOrders] = useState<AdminOrder[] | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const lost = useCallback(() => {
    adminSession.clear();
    setAuthed(false);
    setOrders(null);
  }, []);

  const loadOrders = useCallback(async () => {
    setOrderError(null);
    try {
      setOrders(await api.admin.orders());
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) lost();
      else setOrderError(errMsg(err));
    }
  }, [lost]);

  // Tải đơn ngay khi đăng nhập để thẻ "Đơn hàng" luôn báo được số đơn chờ xác nhận.
  useEffect(() => {
    if (authed) void loadOrders();
  }, [authed, loadOrders]);

  const changeStatus = async (code: string, status: OrderStatus) => {
    setOrderError(null);
    try {
      const updated = await api.admin.setStatus(code, status);
      setOrders((list) => list?.map((o) => (o.code === code ? updated : o)) ?? null);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) lost();
      else setOrderError(errMsg(err));
    }
  };

  const pending = orders?.filter((o) => o.status === 'pending').length ?? 0;

  return (
    <>
      <h1>Quản trị</h1>
      {!authed ? (
        <Login onDone={() => setAuthed(true)} />
      ) : (
        <>
          <div className="admin-tabs">
            <div className="tabs" role="group" aria-label="Khu quản trị">
              <button type="button" className="btn btn-secondary" aria-pressed={tab === 'orders'} onClick={() => setTab('orders')}>
                Đơn hàng
                {pending > 0 && (
                  <span className="count-badge" aria-label={`${pending} đơn chờ xác nhận`}>
                    {pending}
                  </span>
                )}
              </button>
              <button type="button" className="btn btn-secondary" aria-pressed={tab === 'products'} onClick={() => setTab('products')}>
                Giá và tồn kho
              </button>
            </div>
            <button type="button" className="btn btn-secondary" onClick={lost}>
              Đăng xuất
            </button>
          </div>
          {tab === 'orders' ? <OrdersTab orders={orders} error={orderError} onReload={loadOrders} onStatus={changeStatus} /> : <ProductsTab onAuthLost={lost} />}
        </>
      )}
    </>
  );
}
