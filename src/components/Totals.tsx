import { CONFIRM } from '../config';
import { formatMoney } from '../lib/money';

/** Phí/thuế chưa có công thức được duyệt nên không bao giờ thay bằng 0. */
export default function Totals({ subtotal, currency }: { subtotal: number; currency: string | null }) {
  return (
    <table className="totals">
      <caption>Giá trị sản phẩm mô phỏng</caption>
      <tbody>
        <tr>
          <th scope="row">Tạm tính</th>
          <td>{formatMoney(subtotal, currency)}</td>
        </tr>
        <tr>
          <th scope="row">Phí giao hàng</th>
          <td>{CONFIRM}</td>
        </tr>
        <tr>
          <th scope="row">Thuế/phụ phí</th>
          <td>{CONFIRM}</td>
        </tr>
        <tr>
          <th scope="row">Tổng mô phỏng</th>
          <td>Chưa xác định</td>
        </tr>
      </tbody>
    </table>
  );
}
