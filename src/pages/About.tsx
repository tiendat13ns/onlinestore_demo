import { BRAND_NAME } from '../config';
import { useTitle } from '../lib/useTitle';

export default function About() {
  useTitle('Về chúng tôi');
  return (
    <>
      <h1>Về {BRAND_NAME}</h1>
      <p className="lead">
        Một góc bàn gọn gàng giúp bạn tập trung hơn. Chúng tôi làm deskmat và phụ kiện quản lý dây theo hướng tối giản: ít chi tiết,
        dễ phối, dùng được lâu.
      </p>
      <h2>Chúng tôi chú trọng</h2>
      <ul>
        <li>Thiết kế tối giản, màu trung tính, hợp với nhiều kiểu setup.</li>
        <li>Chọn sản phẩm có công dụng rõ ràng thay vì chạy theo số lượng.</li>
        <li>Thông tin sản phẩm, giá và chính sách minh bạch ngay trên trang.</li>
      </ul>
    </>
  );
}
