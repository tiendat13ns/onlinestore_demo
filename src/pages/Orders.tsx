import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import { ApiError, api } from '../lib/api';
import { useCart } from '../lib/CartContext';
import { normalizeOrderCode, normalizePhone } from '../lib/normalize';
import { useTitle } from '../lib/useTitle';
import type { Order } from '../types';

const message = (err: unknown) => (err instanceof ApiError ? err.message : 'Chưa thể kết nối. Vui lòng thử lại.');

export default function Orders() {
  useTitle('Tra cứu đơn hàng');
  const { orderRefs, rememberOrder, forgetOrders } = useCart();
  const [params] = useSearchParams();
  const location = useLocation();
  const navigate = useNavigate();
  // Dữ liệu từ khối tra cứu nhanh ở trang chủ (đi qua state của router, không nằm trên URL).
  const handoff = useRef(location.state as { code?: string; phone?: string } | null);

  const [orders, setOrders] = useState<Record<string, Order>>({});
  const [loadErrors, setLoadErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(orderRefs.length > 0);

  const [code, setCode] = useState(params.get('code') ?? '');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ code?: string; phone?: string; form?: string }>({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  // Đơn vừa tra cứu thành công: hiện riêng ở trên, tách khỏi danh sách đơn đã nhớ trên trình duyệt.
  const [foundCode, setFoundCode] = useState<string | null>(null);

  const [confirming, setConfirming] = useState<string | null>(null);
  const [cancelBusy, setCancelBusy] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const codeInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);

  // Tải trạng thái mới nhất của các đơn đã đặt trên trình duyệt này (chỉ những đơn chưa tải).
  useEffect(() => {
    const missing = orderRefs.filter((r) => !orders[r.code] && !loadErrors[r.code]);
    if (missing.length === 0) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    Promise.all(
      missing.map(async (r): Promise<{ code: string; order: Order } | { code: string; error: string }> => {
        try {
          return { code: r.code, order: await api.lookupOrder(r.code, r.phone) };
        } catch (err) {
          return { code: r.code, error: message(err) };
        }
      }),
    ).then((results) => {
      if (cancelled) return;
      const loaded: Record<string, Order> = {};
      const failed: Record<string, string> = {};
      for (const r of results) {
        if ('order' in r) loaded[r.code] = r.order;
        else failed[r.code] = r.error;
      }
      setOrders((prev) => ({ ...prev, ...loaded }));
      setLoadErrors((prev) => ({ ...prev, ...failed }));
      setLoading(false);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderRefs]);

  const runLookup = async (rawCode: string, rawPhone: string) => {
    setBusy(true);
    try {
      const order = await api.lookupOrder(normalizeOrderCode(rawCode), rawPhone);
      setOrders((prev) => ({ ...prev, [order.code]: order }));
      setLoadErrors(({ [order.code]: _, ...rest }) => rest);
      rememberOrder({ code: order.code, phone: order.customerPhone ?? normalizePhone(rawPhone) ?? rawPhone });
      setNotice(`Đã tìm thấy đơn ${order.code}.`);
      setFoundCode(order.code);
      setCode('');
      setPhone('');
    } catch (err) {
      setCode(rawCode);
      setPhone(rawPhone);
      setErrors({ form: message(err) });
    } finally {
      setBusy(false);
    }
  };

  const onLookup = async (e: FormEvent) => {
    e.preventDefault();
    setNotice(null);
    const next: typeof errors = {};
    if (!code.trim()) next.code = 'Vui lòng nhập mã đơn hàng.';
    if (!phone.trim()) next.phone = 'Vui lòng nhập số điện thoại đã dùng khi đặt hàng.';
    else if (!normalizePhone(phone)) next.phone = 'Số điện thoại chưa đúng. Ví dụ: 0901234567.';
    setErrors(next);
    if (next.code || next.phone) {
      (next.code ? codeInput : phoneInput).current?.focus();
      return;
    }
    await runLookup(code, phone);
  };

  // Tự tra cứu khi đến từ khối tra cứu nhanh; xóa state để tải lại trang không tra cứu lần nữa.
  useEffect(() => {
    const h = handoff.current;
    handoff.current = null;
    if (h?.code && h?.phone) {
      navigate(location.pathname, { replace: true, state: null });
      void runLookup(h.code, h.phone);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = async (order: Order) => {
    if (!order.customerPhone) return;
    setCancelBusy(true);
    setCancelError(null);
    try {
      const updated = await api.cancelOrder(order.code, order.customerPhone);
      setOrders((prev) => ({ ...prev, [updated.code]: updated }));
      setConfirming(null);
      setNotice(`Đã hủy đơn ${updated.code}. Hàng đã được trả lại kho.`);
    } catch (err) {
      setCancelError(message(err));
    } finally {
      setCancelBusy(false);
    }
  };

  const renderOrder = (order: Order) => (
    <OrderDetails key={order.code} order={order}>
              {order.status === 'pending' && (
                <div className="order-actions">
                  {confirming === order.code ? (
                    <div role="group" aria-label="Xác nhận hủy đơn" className="confirm-cancel">
                      <p>Bạn chắc chắn muốn hủy đơn {order.code}? Hàng sẽ được trả lại kho và không thể hoàn tác.</p>
                      <button type="button" className="btn btn-danger" disabled={cancelBusy} onClick={() => cancel(order)}>
                        {cancelBusy ? 'Đang hủy…' : 'Xác nhận hủy đơn'}
                      </button>{' '}
                      <button type="button" className="btn btn-secondary" disabled={cancelBusy} onClick={() => setConfirming(null)}>
                        Giữ đơn
                      </button>
                      {cancelError && (
                        <p role="alert" className="error">
                          {cancelError}
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={() => {
                        setConfirming(order.code);
                        setCancelError(null);
                      }}
                    >
                      Hủy đơn
                    </button>
                  )}
                  <p className="small muted">Bạn tự hủy được khi shop chưa liên hệ xác nhận đơn.</p>
                </div>
              )}
              {order.status !== 'pending' && order.status !== 'cancelled' && order.status !== 'completed' && (
                <p className="small muted">Cần thay đổi đơn đã xác nhận? Liên hệ cửa hàng kèm mã đơn {order.code}.</p>
              )}
    </OrderDetails>
  );

  const foundOrder = foundCode ? orders[foundCode] : undefined;
  const savedRefs = orderRefs.filter((r) => r.code !== foundCode);

  const forget = () => {
    forgetOrders();
    setConfirming(null);
    setNotice('Đã xóa danh sách đơn trên trình duyệt này. Bạn vẫn tra cứu lại được bằng mã đơn và số điện thoại.');
  };

  return (
    <>
      <h1>Tra cứu đơn hàng</h1>
      <p className="lead">Nhập mã đơn và số điện thoại bạn đã dùng khi đặt hàng để xem trạng thái.</p>

      <div className="orders-layout">
        <form onSubmit={onLookup} noValidate className="panel lookup-card" aria-labelledby="lookup-h">
          <h2 id="lookup-h">Tìm đơn của bạn</h2>
          <div className="field">
            <label htmlFor="lookup-code">Mã đơn hàng</label>
            <input
              id="lookup-code"
              ref={codeInput}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="OD-1A2B3C4D"
              value={code}
              aria-invalid={errors.code !== undefined}
              aria-describedby={errors.code ? 'lookup-code-error' : undefined}
              onChange={(e) => {
                setCode(e.target.value);
                setErrors((x) => ({ ...x, code: undefined, form: undefined }));
              }}
            />
            {errors.code && (
              <p id="lookup-code-error" role="alert" className="error">
                {errors.code}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="lookup-phone">Số điện thoại đặt hàng</label>
            <input
              id="lookup-phone"
              ref={phoneInput}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0901234567"
              value={phone}
              aria-invalid={errors.phone !== undefined}
              aria-describedby={errors.phone ? 'lookup-phone-error' : undefined}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((x) => ({ ...x, phone: undefined, form: undefined }));
              }}
            />
            {errors.phone && (
              <p id="lookup-phone-error" role="alert" className="error">
                {errors.phone}
              </p>
            )}
          </div>
          {errors.form && (
            <p role="alert" className="error">
              {errors.form}
            </p>
          )}
          <button type="submit" className="btn" disabled={busy}>
            {busy ? 'Đang tìm…' : 'Tra cứu'}
          </button>
          <p className="small muted">Mã đơn có dạng OD-XXXXXXXX và được hiển thị khi đặt hàng thành công.</p>
        </form>

        <section aria-labelledby="results-h">
          <h2 id="results-h" className="sr-only">
            Kết quả và đơn đã đặt
          </h2>
          <p role="status" className="success">
            {notice}
          </p>

          {foundOrder && (
            <div className="order-group">
              <h2 className="group-title">Kết quả tra cứu</h2>
              {renderOrder(foundOrder)}
            </div>
          )}

          {savedRefs.length > 0 ? (
            <div className="order-group">
              <div className="group-head">
                <div>
                  <h2 className="group-title">Đơn đã đặt trên trình duyệt này</h2>
                  <p className="small muted">Chỉ hiện trên thiết bị này để bạn tiện theo dõi. Người khác muốn xem đơn của bạn vẫn cần mã đơn và số điện thoại.</p>
                </div>
                <button type="button" className="btn btn-secondary" onClick={forget}>
                  Xóa danh sách này
                </button>
              </div>
              {loading && savedRefs.some((r) => !orders[r.code] && !loadErrors[r.code]) && <p role="status">Đang tải đơn hàng…</p>}
              <div className="order-stack">
                {savedRefs.map((r) =>
                  orders[r.code] ? (
                    renderOrder(orders[r.code])
                  ) : loadErrors[r.code] ? (
                    <div key={r.code} className="panel" role="alert">
                      <p className="order-code">{r.code}</p>
                      <p className="error">{loadErrors[r.code]}</p>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          ) : (
            !foundOrder && (
              <div className="panel empty-orders">
                <p>Bạn chưa có đơn nào trên trình duyệt này. Nhập mã đơn và số điện thoại ở bên cạnh để xem đơn, hoặc đặt hàng mới.</p>
                <Link className="btn btn-secondary" to="/products">
                  Xem sản phẩm
                </Link>
              </div>
            )
          )}
        </section>
      </div>
    </>
  );
}
