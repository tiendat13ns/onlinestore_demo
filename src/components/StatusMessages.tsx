import { Link } from 'react-router-dom';
import { useCatalog } from '../lib/CatalogContext';

export function NotFoundMessage({ what = 'trang' }: { what?: string }) {
  return (
    <section>
      <h1>Không tìm thấy {what}</h1>
      <p>Địa chỉ bạn mở không tồn tại. Giỏ hàng của bạn vẫn được giữ nguyên.</p>
      <Link className="btn" to="/products">
        Xem sản phẩm
      </Link>
    </section>
  );
}

/** Khung xương hiện trong lúc chờ catalog lần đầu: cùng hình dáng với dải sản phẩm để trang không giật. */
export function ProductSkeleton({ rows = 1 }: { rows?: number }) {
  return (
    <div className="skeleton" role="status" aria-busy="true">
      <span className="sr-only">Đang tải sản phẩm…</span>
      {Array.from({ length: rows }, (_, r) => (
        <div key={r} className="skeleton-row" aria-hidden="true">
          <div className="sk sk-title" />
          <div className="skeleton-grid">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton-card">
                <div className="sk sk-img" />
                <div className="sk sk-line sk-short" />
                <div className="sk sk-line" />
                <div className="sk sk-line sk-mid" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Bọc nội dung phụ thuộc catalog: khung xương khi đang tải, thông báo khi lỗi. */
export function CatalogGate({ children, fallback }: { children: React.ReactNode; fallback?: React.ReactNode }) {
  const { status, reload } = useCatalog();
  if (status === 'loading') return <>{fallback ?? <ProductSkeleton />}</>;
  if (status === 'error') {
    return (
      <div role="alert">
        <p>Không tải được danh sách sản phẩm. Vui lòng thử lại.</p>
        <button type="button" className="btn" onClick={reload}>
          Thử lại
        </button>
      </div>
    );
  }
  return <>{children}</>;
}
