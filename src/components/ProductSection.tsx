import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import ProductCard from './ProductCard';

/**
 * Dải sản phẩm trượt ngang: tiêu đề, link "Xem tất cả" và nút Trước/Tiếp.
 * Nút chỉ hiện khi dải thật sự dài hơn khung; cuộn bằng ngón tay, chuột hoặc phím mũi tên đều được.
 */
export default function ProductSection({
  id,
  title,
  products,
  moreTo,
  moreLabel,
}: {
  id: string;
  title: string;
  products: Product[];
  moreTo: string;
  moreLabel: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [state, setState] = useState({ overflow: false, atStart: true, atEnd: false });

  const update = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setState({
      overflow: el.scrollWidth > el.clientWidth + 4,
      atStart: el.scrollLeft <= 4,
      atEnd: el.scrollLeft + el.clientWidth >= el.scrollWidth - 4,
    });
  }, []);

  useEffect(() => {
    update();
    const el = track.current;
    el?.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      el?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [update, products]);

  const go = (dir: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollBy({ left: dir * el.clientWidth * 0.85, behavior: reduce ? 'auto' : 'smooth' });
  };

  if (products.length === 0) return null;

  return (
    <section className="section wrap" aria-labelledby={id}>
      <div className="section-head">
        <h2 id={id} data-reveal>
          {title}
        </h2>
        <div className="section-tools" data-reveal>
          <Link to={moreTo}>{moreLabel}</Link>
          {state.overflow && (
            <div className="rail-nav">
              <button type="button" className="rail-btn" aria-label={`${title}: trước`} disabled={state.atStart} onClick={() => go(-1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m15 6-6 6 6 6" />
                </svg>
              </button>
              <button type="button" className="rail-btn" aria-label={`${title}: tiếp`} disabled={state.atEnd} onClick={() => go(1)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m9 6 6 6-6 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="rail-track" ref={track} role="group" aria-label={title} tabIndex={0}>
        {products.map((p) => (
          <div key={p.id} className="rail-item">
            <ProductCard product={p} />
          </div>
        ))}
      </div>
    </section>
  );
}
