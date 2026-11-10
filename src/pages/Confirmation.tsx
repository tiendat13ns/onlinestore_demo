import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import OrderDetails from '../components/OrderDetails';
import { useCart } from '../lib/CartContext';
import { useTitle } from '../lib/useTitle';
import { STATUS_LABELS, type OrderStatus } from '../types';

const icon = { width: 22, height: 22, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true } as const;

const STEP_ICONS: Record<'pending' | 'confirmed' | 'shipping' | 'completed', ReactNode> = {
  pending: (
    <svg {...icon}>
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  ),
  confirmed: (
    <svg {...icon}>
      <path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" />
    </svg>
  ),
  shipping: (
    <svg {...icon}>
      <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </svg>
  ),
  completed: (
    <svg {...icon}>
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5M12 12v9" />
    </svg>
  ),
};

const STEPS: { status: Extract<OrderStatus, 'pending' | 'confirmed' | 'shipping' | 'completed'>; text: (code: string) => string }[] = [
  { status: 'pending', text: (code) => `Đơn của bạn đã được ghi nhận với mã ${code}.` },
  { status: 'confirmed', text: () => 'Trong 1–2 ngày làm việc, shop gọi vào số bạn đã nhập và báo phí vận chuyển.' },
  { status: 'shipping', text: () => 'Bạn nhận hàng trong 2–5 ngày làm việc tùy khu vực.' },
  { status: 'completed', text: () => 'Kiểm tra sản phẩm rồi mới thanh toán cho người giao hàng (COD).' },
];

export default function Confirmation() {
  const { order } = useCart();
  const [copied, setCopied] = useState<'ok' | 'fail' | null>(null);
  useTitle('Đặt hàng thành công');

  if (!order) {
    return (
      <div className="confirm">
        <section className="success-card empty" aria-labelledby="none-h">
          <div>
            <h1 id="none-h">Chưa có đơn hàng nào trong phiên này</h1>
            <p className="lead">Nếu bạn đã đặt hàng trước đó, hãy tra cứu bằng mã đơn và số điện thoại đã dùng.</p>
            <p className="confirm-actions">
              <Link className="btn" to="/orders">
                Tra cứu đơn hàng
              </Link>
              <Link className="btn btn-secondary" to="/products">
                Xem sản phẩm
              </Link>
            </p>
          </div>
          <img className="success-mascot" src="/favicon.png" alt="" width="160" height="160" />
        </section>
      </div>
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
        <div className="success-main">
          <svg className="success-mark" width="56" height="56" viewBox="0 0 56 56" aria-hidden="true">
            <circle cx="28" cy="28" r="28" fill="currentColor" />
            <path d="m17 29 8 8 15-17" fill="none" stroke="#fff" strokeWidth="4.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <h1 id="done-h">Đặt hàng thành công</h1>
          <p className="lead">
            Cảm ơn {order.customerName ? `${order.customerName} ` : 'bạn '}đã đặt hàng. Shop sẽ liên hệ qua số {order.customerPhone ?? 'điện thoại bạn đã nhập'} để xác nhận đơn.
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
        </div>
        <img className="success-mascot" src="/favicon.png" alt="" width="200" height="200" />
      </section>

      <section aria-labelledby="next-h">
        <h2 id="next-h">Hành trình đơn hàng</h2>
        <ol className="steps">
          {STEPS.map((step, i) => (
            <li key={step.status} className={i === 0 ? 'step done' : 'step'}>
              <span className="step-icon">{STEP_ICONS[step.status]}</span>
              <strong>{STATUS_LABELS[step.status]}</strong>
              <span className="small">{step.text(order.code)}</span>
            </li>
          ))}
        </ol>
      </section>

      <section aria-labelledby="detail-h">
        <h2 id="detail-h">Chi tiết đơn hàng</h2>
        <OrderDetails order={order} />
      </section>

      <p className="confirm-actions">
        <Link className="btn" to={`/orders?code=${encodeURIComponent(order.code)}`}>
          Theo dõi đơn hàng
        </Link>
        <Link className="btn btn-secondary" to="/products">
          Tiếp tục mua sắm
        </Link>
      </p>
    </div>
  );
}
