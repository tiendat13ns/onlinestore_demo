import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../lib/CartContext';
import { useTitle } from '../lib/useTitle';

function PolicyTable({ rows }: { rows: [string, string][] }) {
  return (
    <table>
      <tbody>
        {rows.map(([label, value]) => (
          <tr key={label}>
            <th scope="row">{label}</th>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function PolicyPage({ title, intro, children }: { title: string; intro: string; children: ReactNode }) {
  useTitle(title);
  return (
    <>
      <h1>{title}</h1>
      <p className="lead">{intro}</p>
      {children}
    </>
  );
}

export function ShippingPage() {
  return (
    <PolicyPage title="Chính sách giao hàng" intro="Thông tin về phạm vi, thời gian và phí giao hàng.">
      <PolicyTable
        rows={[
          ['Phạm vi giao hàng', 'Toàn quốc'],
          ['Thời gian xử lý đơn', '1–2 ngày làm việc sau khi đơn được xác nhận'],
          ['Thời gian giao hàng', '2–5 ngày làm việc tùy khu vực'],
          ['Phí vận chuyển', 'Tính theo khu vực nhận hàng và thông báo khi xác nhận đơn'],
          ['Thanh toán', 'Thanh toán khi nhận hàng (COD)'],
        ]}
      />
    </PolicyPage>
  );
}

export function ReturnsPage() {
  return (
    <PolicyPage title="Chính sách đổi trả" intro="Điều kiện và cách thức đổi trả sản phẩm.">
      <PolicyTable
        rows={[
          ['Thời hạn', 'Trong 7 ngày kể từ khi nhận hàng'],
          ['Trường hợp được đổi trả', 'Sản phẩm lỗi do nhà sản xuất hoặc giao sai mẫu, sai màu, sai cỡ'],
          ['Tình trạng sản phẩm', 'Còn nguyên bao bì, chưa qua sử dụng nhiều'],
          ['Chi phí', 'Chúng tôi chịu phí vận chuyển nếu lỗi thuộc về cửa hàng'],
          ['Cách thực hiện', 'Liên hệ cửa hàng kèm mã đơn hàng để được hướng dẫn'],
        ]}
      />
    </PolicyPage>
  );
}

export function PrivacyPage() {
  const { clearLocalData } = useCart();
  const [done, setDone] = useState(false);

  const onClear = () => {
    clearLocalData();
    setDone(true);
  };

  return (
    <PolicyPage title="Chính sách quyền riêng tư" intro="Chúng tôi thu thập và sử dụng thông tin của bạn như thế nào.">
      <h2>Thông tin chúng tôi thu thập</h2>
      <ul>
        <li>Họ tên, số điện thoại và địa chỉ nhận hàng khi bạn đặt đơn, chỉ để xử lý và liên hệ về đơn hàng đó.</li>
        <li>Giỏ hàng và mã các đơn đã đặt được lưu tạm trong trình duyệt của bạn.</li>
      </ul>
      <h2>Cách chúng tôi sử dụng</h2>
      <ul>
        <li>Thông tin đơn hàng được lưu trên hệ thống của cửa hàng và không chia sẻ cho bên thứ ba.</li>
        <li>Chúng tôi không dùng công cụ phân tích hay quảng cáo theo dõi người dùng.</li>
      </ul>
      <h2>Dữ liệu trên trình duyệt</h2>
      <p>Bạn có thể xóa giỏ hàng và lịch sử đơn đã lưu trên trình duyệt này bất cứ lúc nào.</p>
      <button type="button" className="btn btn-secondary" onClick={onClear}>
        Xóa giỏ hàng và lịch sử đơn
      </button>
      {done && (
        <p role="status">
          Đã xóa. <Link to="/products">Xem sản phẩm</Link>
        </p>
      )}
    </PolicyPage>
  );
}
