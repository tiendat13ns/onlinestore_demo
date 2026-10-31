import { useEffect, useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, api } from '../lib/api';
import { useCart } from '../lib/CartContext';
import { formatDemoTime, formatMoney } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS, type DemoOrder } from '../types';

type Result = { order: DemoOrder } | { code: string; error: string };

async function fetchOne(code: string): Promise<Result> {
  try {
    return { order: await api.getOrder(code) };
  } catch (err) {
    return { code, error: err instanceof ApiError ? err.message : 'Không tải được đơn.' };
  }
}

export default function Orders() {
  useTitle('Lịch sử đơn');
  const { orderCodes } = useCart();
  const [results, setResults] = useState<Result[] | null>(null);
  const [lookup, setLookup] = useState('');
  const [found, setFound] = useState<Result | null>(null);

  // Tải lại trạng thái mới nhất từ server cho các đơn trình duyệt đã nhớ.
  useEffect(() => {
    let cancelled = false;
    Promise.all(orderCodes.map(fetchOne)).then((r) => !cancelled && setResults(r));
    return () => {
      cancelled = true;
    };
  }, [orderCodes]);

  const onLookup = async (e: FormEvent) => {
    e.preventDefault();
    const code = lookup.trim();
    if (code) setFound(await fetchOne(code));
  };

  const render = (r: Result) =>
    'order' in r ? (
      <li key={r.order.code} className="order-row">
        <strong>{r.order.code}</strong> — {STATUS_LABELS[r.order.status]}
        <br />
        <span className="small muted">
          {formatDemoTime(r.order.createdAt)} · {formatMoney(r.order.subtotal, r.order.currency)}
        </span>
        <ul className="small">
          {r.order.lines.map((l) => (
            <li key={l.variantId}>
              {l.name} × {l.quantity}
            </li>
          ))}
        </ul>
      </li>
    ) : (
      <li key={r.code} role="alert" className="error">
        {r.code}: {r.error}
      </li>
    );

  return (
    <>
      <h1>Lịch sử đơn mô phỏng</h1>
      <p className="callout">Đơn demo, không có hàng hóa được giao. Danh sách bên dưới chỉ gồm các đơn đặt trong phiên này.</p>

      {orderCodes.length === 0 ? (
        <p>
          Chưa có đơn nào trong phiên này. <Link to="/products">Xem sản phẩm</Link>
        </p>
      ) : results === null ? (
        <p role="status">Đang tải…</p>
      ) : (
        <ul className="order-list">{results.map(render)}</ul>
      )}

      <h2>Tra cứu theo mã đơn</h2>
      <form onSubmit={onLookup} className="lookup">
        <label htmlFor="lookup-code">Mã đơn (bắt đầu bằng DEMO-)</label>
        <input id="lookup-code" type="text" value={lookup} onChange={(e) => setLookup(e.target.value)} />
        <button type="submit" className="btn">
          Tra cứu
        </button>
      </form>
      {found && <ul className="order-list">{render(found)}</ul>}
    </>
  );
}
