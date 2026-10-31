import { CONFIRM, PROJECT_LINE } from '../config';
import { useTitle } from '../lib/useTitle';

export default function About() {
  useTitle('Về dự án');
  return (
    <>
      <h1>Về dự án</h1>
      <p>
        <strong>{PROJECT_LINE}</strong>
      </p>
      <p>
        Đây là website concept Gaming Setup Decor phục vụ học tập: mô phỏng luồng xem sản phẩm, giỏ hàng và checkout mà
        không có giao dịch, giao hàng hay thu thập thông tin cá nhân.
      </p>
      <p>Bố cục và nguyên tắc UX được tham khảo ở mức cấu trúc từ một website thương mại điện tử; không sao chép tài sản thương hiệu.</p>
      <h2>Nhóm thực hiện</h2>
      <p>Tên thương hiệu, thành viên được công bố và vai trò: {CONFIRM}.</p>
    </>
  );
}
