import { Link } from 'react-router-dom';
import Totals from '../components/Totals';
import { useCart } from '../lib/CartContext';
import { formatDemoTime, formatMoney } from '../lib/money';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS } from '../types';

export default function Confirmation() {
  const { order } = useCart();
  useTitle('Kết quả mô phỏng');

  if (!order) {
    return (
      <>
        <h1>Kết quả mô phỏng</h1>
        <p>Chưa có kết quả mô phỏng trong phiên này.</p>
        <Link className="btn" to="/products">
          Xem sản phẩm
        </Link>
      </>
    );
  }

  return (
    <>
      <h1>Đã hoàn tất mô phỏng</h1>
      <p className="callout">Đây không phải đơn mua hàng. Không có khoản tiền nào được thu và không có hàng hóa được giao.</p>
      <p>
        Mã: <strong>{order.code}</strong>
        <br />
        Trạng thái: {STATUS_LABELS[order.status]}
        <br />
        {order.customerName && (
          <>
            Người đặt (dữ liệu giả): {order.customerName}
            <br />
          </>
        )}
        Thời điểm: {formatDemoTime(order.createdAt)}
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
          Tiếp tục khám phá
        </Link>{' '}
        <Link className="btn btn-secondary" to="/orders">
          Lịch sử đơn
        </Link>{' '}
        <Link className="btn btn-secondary" to="/">
          Về trang chủ
        </Link>
      </p>
    </>
  );
}
