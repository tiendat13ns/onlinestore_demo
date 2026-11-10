import { BRAND_NAME, COURSE_CREDIT } from '../config';
import { useTitle } from '../lib/useTitle';

export default function About() {
  useTitle('Về chúng tôi');
  return (
    <div className="about-page">
      <div className="about-text" data-reveal>
        <h1>Về {BRAND_NAME}</h1>
        <p className="lead">
          Một góc bàn gọn gàng giúp bạn tập trung hơn. Chúng tôi chọn deskmat, phụ kiện bàn phím và đồ quản lý dây theo hướng tối giản: ít chi tiết,
          dễ phối, dùng được lâu.
        </p>
        <h2>Chúng tôi chú trọng</h2>
        <ul>
          <li>Thiết kế tối giản, tông xanh trắng dễ phối với nhiều kiểu setup.</li>
          <li>Chọn sản phẩm có công dụng rõ ràng thay vì chạy theo số lượng.</li>
          <li>Thông tin sản phẩm, giá và chính sách minh bạch ngay trên trang.</li>
        </ul>
        <p className="muted">{COURSE_CREDIT}.</p>
      </div>
      <img className="about-logo" data-reveal src="/images/logo.jpg" alt={`Logo ${BRAND_NAME}: chú sóc bay trắng xanh`} width="700" height="700" />
    </div>
  );
}
