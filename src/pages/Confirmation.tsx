import { Link } from 'react-router-dom';
import Totals from '../components/Totals';
import { useCart } from '../lib/CartContext';
import { formatDateTime, formatMoney } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS } from '../types';

export default function Confirmation() {
  const { order } = useCart();
  useTitle('Đặt hàng thành công');

  if (!order) {
    return (
      <>
        <h1>Đơn hàng</h1>
        <p>Chưa có đơn hàng nào trong phiên này.</p>
        <Link className="btn" to="/products">
          Xem sản phẩm
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Đặt hàng thành công</h1>
      <p className="lead">
        Cảm ơn {order.customerName ? `${order.customerName}, ` : 'bạn '}đã đặt hàng. Hãy giữ lại mã đơn để tra cứu sau này.
      </p>
      <p>
        Mã đơn: <strong>{order.code}</strong>
        <br />
        Trạng thái: {STATUS_LABELS[order.status]}
        <br />
        Thời gian đặt: {formatDateTime(order.createdAt)}
      </p>

      <table>
        <thead>
          <tr>
            <th scope="col">Sản phẩm</th>
            <th scope="col">Số lượng</th>
            <th scope="col">Đơn giá</th>
            <th scope="col">Thành tiền</th>
          </tr>
        </thead>
        <tbody>
          {order.lines.map((l) => (
            <tr key={l.variantId}>
              <td>
                {l.name}
                {l.components.length > 0 && (
                  <ul className="small">
                    {l.components.map((c) => (
                      <li key={c}>{c}</li>
                    ))}
                  </ul>
                )}
              </td>
              <td>{l.quantity}</td>
              <td>{formatMoney(l.unitPrice, order.currency)}</td>
              <td>{formatMoney(l.lineTotal, order.currency)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <Totals subtotal={order.subtotal} currency={order.currency} />

      <p>
        <Link className="btn" to="/products">
          Tiếp tục mua sắm
        </Link>{' '}
        <Link className="btn btn-secondary" to="/orders">
          Đơn hàng của tôi
        </Link>
      </p>
    </>
  );
}
