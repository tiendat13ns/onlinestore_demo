import type { ReactNode } from 'react';
import { useCatalog } from '../lib/CatalogContext';
import { formatDateTime, formatMoney } from '../lib/money';
import { imageForVariant } from '../lib/variantImage';
import { STATUS_LABELS, STATUS_NOTES, type Order, type OrderStatus } from '../types';
import { artFor } from './art';
import ProductImage from './ProductImage';
import Totals from './Totals';

const STEPS: OrderStatus[] = ['pending', 'confirmed', 'shipping', 'completed'];

/** Tiến trình đơn: các bước đã qua được tô đậm, bước hiện tại đánh dấu bằng chấm và chữ đậm (không chỉ dựa vào màu). */
export function OrderProgress({ status }: { status: OrderStatus }) {
  if (status === 'cancelled') return <p className="order-cancelled">{STATUS_NOTES.cancelled}</p>;
  const current = STEPS.indexOf(status);
  return (
    <ol className="progress" aria-label="Tiến trình đơn hàng">
      {STEPS.map((step, i) => (
        <li key={step} className={i < current ? 'done' : i === current ? 'current' : ''} aria-current={i === current ? 'step' : undefined}>
          <span className="dot" aria-hidden="true" />
          {STATUS_LABELS[step]}
        </li>
      ))}
    </ol>
  );
}

/** Thẻ chi tiết một đơn hàng: mã, thời gian, tiến trình, sản phẩm, tiền, thông tin nhận hàng. */
export default function OrderDetails({ order, children }: { order: Order; children?: ReactNode }) {
  const { variants } = useCatalog();
  return (
    <article className="order-card" aria-label={`Đơn hàng ${order.code}`}>
      <header className="order-head">
        <div>
          <p className="order-code">{order.code}</p>
          <p className="small muted">Đặt lúc {formatDateTime(order.createdAt)}</p>
        </div>
        <span className={`status-pill status-${order.status}`}>{STATUS_LABELS[order.status]}</span>
      </header>

      <OrderProgress status={order.status} />
      {order.status !== 'cancelled' && <p className="order-note">{STATUS_NOTES[order.status]}</p>}

      <table className="order-lines">
        <thead>
          <tr>
            <th scope="col">Sản phẩm</th>
            <th scope="col">SL</th>
            <th scope="col">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => {
            const entry = variants.get(l.variantId);
            return (
              <tr key={l.variantId}>
                <td>
                  <div className="line-cell">
                    {entry && <ProductImage image={imageForVariant(entry.product, entry.variant)} art={artFor(entry.product, entry.variant)} className="line-thumb" />}
                    <div>
                      {l.name}
                      <span className="small muted"> · {formatMoney(l.unitPrice, order.currency)}</span>
                      {l.components.length > 0 && (
                        <ul className="small">
                          {l.components.map((c) => (
                            <li key={c}>{c}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </td>
                <td>{l.quantity}</td>
                <td>{formatMoney(l.lineTotal, order.currency)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Totals subtotal={order.subtotal} currency={order.currency} />

      {order.customerAddress && (
        <dl className="order-ship">
          <dt>Người nhận</dt>
          <dd>
            {order.customerName} · {order.customerPhone}
          </dd>
          <dt>Địa chỉ</dt>
          <dd>{order.customerAddress}</dd>
          <dt>Thanh toán</dt>
          <dd>Thanh toán khi nhận hàng (COD)</dd>
        </dl>
      )}

      {children}
    </article>
  );
}
