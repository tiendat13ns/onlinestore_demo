import { useState } from 'react';
import type { ProductImage as Img } from '../types';

/** Ảnh có khung dự phòng "Chưa có ảnh" (thiếu src hoặc ảnh hỏng). */
export default function ProductImage({ image, className = '' }: { image?: Img; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (!image?.src || failed) {
    return (
      <div className={`img-fallback ${className}`} role="img" aria-label={image?.alt ?? 'Chưa có ảnh'}>
        Chưa có ảnh
      </div>
    );
  }
  return <img className={className} src={image.src} alt={image.alt} onError={() => setFailed(true)} />;
}
