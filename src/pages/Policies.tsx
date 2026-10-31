import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CONFIRM } from '../config';
import { useCart } from '../lib/CartContext';
import { useTitle } from '../lib/useTitle';

function PolicyTable({ rows }: { rows: string[] }) {
  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row}>
            <th scope="row">{row}</th>
            <td>{CONFIRM}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PolicyPage({ title, notice, children }: { title: string; notice: string; children: ReactNode }) {
  useTitle(title);
  return (
    <>
      <h1>{title}</h1>
      <p className="callout">{notice}</p>
      {children}
    </>
  );
}

export function ShippingPage() {
  return (
    <PolicyPage
      title="Giao hàng — concept học tập"
      notice="Bản demo không nhận đơn mua thật và không thực hiện giao hàng. Nội dung dưới đây chỉ mô tả kế hoạch của concept, không phải cam kết giao hàng."
    >
      <PolicyTable
        rows={['Phạm vi giao dự kiến', 'Đơn vị giao dự kiến', 'Thời gian xử lý/giao', 'Phí và cách tính', 'Trường hợp ngoại lệ']}
      />
    </PolicyPage>
  );
}

export function ReturnsPage() {
  return (
    <PolicyPage
      title="Đổi trả — concept học tập"
      notice="Không có mua bán thực tế trên bản demo, vì vậy không phát sinh đổi trả hoặc hoàn tiền thật."
    >
      <PolicyTable
        rows={[
          'Trường hợp được/không được đổi trả',
          'Thời hạn',
          'Tình trạng sản phẩm',
          'Bằng chứng yêu cầu',
          'Quy trình',
          'Người chịu phí',
          'Cách xử lý',
        ]}
      />
    </PolicyPage>
  );
}

export function PrivacyPage() {
  const { clearDemoData } = useCart();
  const [done, setDone] = useState(false);

  const onClear = () => {
    clearDemoData();
    setDone(true);
  };

  return (
    <PolicyPage
      title="Quyền riêng tư — concept học tập"
      notice="Khi đặt đơn mô phỏng, website chỉ yêu cầu họ tên, số điện thoại và địa chỉ — hãy nhập dữ liệu giả. Không yêu cầu email hay thông tin thanh toán; không có tài khoản khách hàng hoặc newsletter."
    >
      <ul>
        <li>Giỏ và các mã đơn đã đặt được lưu trong phiên của tab trình duyệt để duy trì trải nghiệm mô phỏng.</li>
        <li>Đơn mô phỏng (gồm họ tên, số điện thoại, địa chỉ bạn nhập) được lưu trong cơ sở dữ liệu của máy chủ demo và admin của dự án có thể xem. Không gửi cho bên thứ ba.</li>
        <li>Nút "Xóa dữ liệu demo" chỉ xóa dữ liệu trong trình duyệt của bạn, không xóa đơn đã lưu trên máy chủ.</li>
        <li>MVP không cài analytics, pixel quảng cáo hay nhúng chat/dịch vụ theo dõi.</li>
        <li>Hosting, log kỹ thuật, thời hạn lưu và bên tiếp cận: {CONFIRM}.</li>
      </ul>
      <button type="button" className="btn btn-secondary" onClick={onClear}>
        Xóa dữ liệu demo
      </button>
      {done && (
        <p role="status">
          Đã xóa giỏ và kết quả mô phỏng. <Link to="/products">Xem sản phẩm</Link>
        </p>
      )}
    </PolicyPage>
  );
}
