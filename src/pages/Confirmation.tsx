import { useState } from 'react';
import { Link } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import { useCart } from '../lib/CartContext';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS } from '../types';

export default function Confirmation() {
  const { order } = useCart();
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  useTitle('Đặt hàng thành công');

  if (!order) {
    return (
      <>
        <h1>Đơn hàng</h1>
        <p>Chưa có đơn hàng nào trong phiên này. Nếu bạn đã đặt hàng, hãy tra cứu bằng mã đơn và số điện thoại.</p>
        <p>
          <Link className="btn" to="/orders">
            Tra cứu đơn hàng
          </Link>{' '}
          <Link className="btn btn-secondary" to="/products">
            Xem sản phẩm
          </Link>
        </p>
      </>
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(order.code);
      setCopied('ok');
      return;
    } catch {
      // Trình duyệt chặn clipboard (trang không bảo mật, chưa cấp quyền): thử cách cũ.
    }
    try {
      const box = document.createElement('textarea');
      box.value = order.code;
      box.setAttribute('readonly', '');
      box.style.position = 'fixed';
      box.style.opacity = '0';
      document.body.appendChild(box);
      box.select();
      const ok = document.execCommand('copy');
      document.body.removeChild(box);
      setCopied(ok ? 'ok' : 'fail');
    } catch {
      setCopied('fail');
    }
  };

  return (
    <div className="confirm">
      <section className="success-card" aria-labelledby="done-h">
        <svg className="success-mark" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
          <circle cx="28" cy="28" r="28" fill="currentColor" />
          <path d="m17 29 8 8 15-17" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <h1 id="done-h">Đặt hàng thành công</h1>
        <p className="lead">
          Cảm ơn {order.customerName ? `${order.customerName} ` : 'bạn '}đã đặt hàng. Chúng tôi sẽ liên hệ qua số {order.customerPhone ?? 'điện thoại bạn đã nhập'} để xác nhận đơn.
        </p>

        <div className="code-box">
          <span className="small muted">Mã đơn hàng của bạn</span>
          <strong className="code">{order.code}</strong>
          <button type="button" className="btn btn-secondary" onClick={copy}>
            Sao chép mã
          </button>
          <p role="status" className="small">
            {copied === 'ok' && 'Đã sao chép mã đơn.'}
            {copied === 'fail' && 'Không sao chép được. Hãy chọn và chép mã thủ công.'}
          </p>
        </div>
        <p className="small muted">Hãy lưu mã đơn. Để tra cứu sau này, bạn cần mã đơn và số điện thoại đã dùng khi đặt hàng.</p>
      </section>

      <section aria-labelledby="next-h">
        <h2 id="next-h">Tiếp theo</h2>
        <ol className="next-steps">
          <li>
            <strong>{STATUS_LABELS.pending}.</strong> Đơn của bạn đã được ghi nhận với mã {order.code}.
          </li>
          <li>
            <strong>{STATUS_LABELS.confirmed}.</strong> Trong 1–2 ngày làm việc, shop gọi vào số bạn đã nhập và báo phí vận chuyển.
          </li>
          <li>
            <strong>{STATUS_LABELS.shipping}.</strong> Bạn nhận hàng trong 2–5 ngày làm việc tùy khu vực.
          </li>
          <li>
            <strong>{STATUS_LABELS.completed}.</strong> Kiểm tra sản phẩm rồi mới thanh toán cho người giao hàng (COD).
          </li>
        </ol>
      </section>

      <section aria-labelledby="detail-h">
        <h2 id="detail-h">Chi tiết đơn hàng</h2>
        <OrderDetails order={order} />
      </section>

      <p className="confirm-actions">
        <Link className="btn" to={`/orders?code=${encodeURIComponent(order.code)}`}>
          Theo dõi đơn hàng
        </Link>{' '}
        <Link className="btn btn-secondary" to="/products">
          Tiếp tục mua sắm
        </Link>
      </p>
    </div>
  );
}
