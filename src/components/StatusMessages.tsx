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

/** Bọc nội dung phụ thuộc catalog: hiển thị trạng thái tải/lỗi trước khi render children. */
export function CatalogGate({ children }: { children: React.ReactNode }) {
  const { status, reload } = useCatalog();
  if (status === 'loading') return <p role="status">Đang tải sản phẩm…</p>;
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
