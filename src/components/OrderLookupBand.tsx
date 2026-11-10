import { useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { normalizeOrderCode, normalizePhone } from '../lib/normalize';

/**
 * Khối tra cứu nhanh trên trang chủ: nhập mã đơn + số điện thoại rồi chuyển sang trang kết quả.
 * Dữ liệu đi qua state của router (không đưa số điện thoại lên thanh địa chỉ).
 */
export default function OrderLookupBand() {
  const navigate = useNavigate();
  const [code, setCode] = useState('');
  const [phone, setPhone] = useState('');
  const [errors, setErrors] = useState<{ code?: string; phone?: string }>({});
  const codeInput = useRef<HTMLInputElement>(null);
  const phoneInput = useRef<HTMLInputElement>(null);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!code.trim()) next.code = 'Vui lòng nhập mã đơn hàng.';
    if (!phone.trim()) next.phone = 'Vui lòng nhập số điện thoại đặt hàng.';
    else if (!normalizePhone(phone)) next.phone = 'Số điện thoại chưa đúng. Ví dụ: 0901234567.';
    setErrors(next);
    if (next.code || next.phone) {
      (next.code ? codeInput : phoneInput).current?.focus();
      return;
    }
    navigate('/orders', { state: { code: normalizeOrderCode(code), phone } });
  };

  return (
    <section className="section-tight wrap" aria-labelledby="track-h">
      <div className="lookup-band" data-reveal>
        <div>
          <h2 id="track-h">Tra cứu đơn hàng</h2>
          <p>Đã đặt hàng? Nhập mã đơn (dạng OD-XXXXXXXX) và số điện thoại bạn đã dùng để xem đơn đang ở bước nào.</p>
        </div>
        <form onSubmit={onSubmit} noValidate className="lookup-band-form">
          <div className="field">
            <label htmlFor="band-code">Mã đơn hàng</label>
            <input
              id="band-code"
              ref={codeInput}
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="OD-1A2B3C4D"
              value={code}
              aria-invalid={errors.code !== undefined}
              aria-describedby={errors.code ? 'band-code-error' : undefined}
              onChange={(e) => {
                setCode(e.target.value);
                setErrors((x) => ({ ...x, code: undefined }));
              }}
            />
            {errors.code && (
              <p id="band-code-error" role="alert" className="error">
                {errors.code}
              </p>
            )}
          </div>
          <div className="field">
            <label htmlFor="band-phone">Số điện thoại</label>
            <input
              id="band-phone"
              ref={phoneInput}
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="0901234567"
              value={phone}
              aria-invalid={errors.phone !== undefined}
              aria-describedby={errors.phone ? 'band-phone-error' : undefined}
              onChange={(e) => {
                setPhone(e.target.value);
                setErrors((x) => ({ ...x, phone: undefined }));
              }}
            />
            {errors.phone && (
              <p id="band-phone-error" role="alert" className="error">
                {errors.phone}
              </p>
            )}
          </div>
          <button type="submit" className="btn">
            Tra cứu
          </button>
        </form>
      </div>
    </section>
  );
}
