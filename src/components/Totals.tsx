import { formatMoney } from '../lib/money';

export default function Totals({ subtotal, currency }: { subtotal: number; currency: string | null }) {
  return (
    <table className="totals">
      <caption className="sr-only">Tóm tắt đơn hàng</caption>
      <tbody>
        <tr>
          <th scope="row">Tạm tính</th>
          <td>{formatMoney(subtotal, currency)}</td>
        </tr>
        <tr>
          <th scope="row">Phí vận chuyển</th>
          <td>Tính khi xác nhận đơn</td>
        </tr>
        <tr>
          <th scope="row">Tổng cộng</th>
          <td>
            {formatMoney(subtotal, currency)}
            <br />
            <span className="small muted">Chưa gồm phí vận chuyển</span>
          </td>
        </tr>
      </tbody>
    </table>
  );
}
