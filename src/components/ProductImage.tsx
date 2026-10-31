import { useState } from 'react';
import type { ProductImage as Img } from '../types';
import { ProductArt, type ArtSpec } from './art';

/**
 * Ảnh thật nếu có `src`; chưa có hoặc lỗi thì dùng hình vẽ của sản phẩm (art), không bao giờ để khung trống.
 */
export default function ProductImage({ image, art, className = '' }: { image?: Img; art?: ArtSpec; className?: string }) {
  const [failed, setFailed] = useState(false);
  if (image?.src && !failed) {
    return <img className={className} src={image.src} alt={image.alt} onError={() => setFailed(true)} />;
  }
  if (art) {
    return (
      <div className={`art-frame ${className}`}>
        <ProductArt art={art} />
      </div>
    );
  }
  return <div className={`img-fallback ${className}`} role="img" aria-label={image?.alt ?? ''} />;
}
