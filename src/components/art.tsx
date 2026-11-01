import type { ReactElement } from 'react';
import type { Product, Variant } from '../types';

/**
 * Hình vẽ sản phẩm bằng SVG phẳng (không có ảnh chụp thật của sản phẩm).
 * Khi có ảnh thật, điền `src` trong catalog và hình vẽ này tự nhường chỗ.
 */
export type ArtKind = 'mat' | 'clip' | 'bundle' | 'soon';

export interface ArtSpec {
  kind: ArtKind;
  color: string;
  /** 0 = vật thể, 1 = trên bàn, 2 = cận cảnh. */
  view: number;
  label: string;
  /** Kích thước tấm lót (mm). */
  size: [number, number];
}

export const MAT_COLORS: Record<string, string> = { Xám: '#6b6b68', Đen: '#222222' };
const SOON = '#efede9';
const DESK = '#e6e4df';
const INK = '#161616';

/** Đọc "800 × 300 mm" từ thông số; mặc định cỡ M. */
export function matSize(variant?: Variant): [number, number] {
  const spec = variant?.specs.find((s) => s.name === 'Kích thước')?.value;
  const m = spec?.match(/(\d+)\s*×\s*(\d+)/);
  return m ? [Number(m[1]), Number(m[2])] : [800, 300];
}

export function colorOf(variant?: Variant): string {
  return MAT_COLORS[variant?.attributes['Màu'] ?? ''] ?? MAT_COLORS['Xám'];
}

export function artFor(product: Product, variant?: Variant, view = 0): ArtSpec {
  const v = variant ?? product.variants[0];
  const priced = product.variants.some((x) => x.price !== null);
  const kind: ArtKind = product.kind === 'bundle' ? 'bundle' : product.category === 'cable' ? 'clip' : priced ? 'mat' : 'soon';
  return { kind, color: kind === 'soon' ? SOON : colorOf(v), view, label: product.name, size: matSize(v) };
}

function KeyPattern({ id }: { id: string }) {
  return (
    <pattern id={id} width="26" height="26" patternUnits="userSpaceOnUse">
      <rect x="3" y="3" width="21" height="21" rx="3" fill="#dcdad5" />
    </pattern>
  );
}

function Keyboard({ x, y, w = 400, h = 130 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill="#fbfbf9" />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="url(#keys)" />
    </g>
  );
}

function Mouse({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="62" height="108" rx="30" fill="#fbfbf9" />
      <rect x={x + 29} y={y + 14} width="4" height="26" rx="2" fill="#bdbab4" />
    </g>
  );
}

function Clip({ x, y, slots = 3 }: { x: number; y: number; slots?: number }) {
  const w = 24 + slots * 26;
  return (
    <g>
      <rect x={x} y={y} width={w} height="62" rx="10" fill="#fbfbf9" />
      {Array.from({ length: slots }, (_, i) => (
        <rect key={i} x={x + 16 + i * 26} y={y + 14} width="12" height="34" rx="6" fill="#8a8782" />
      ))}
    </g>
  );
}

/** Một card nhỏ: vật thể trên nền bàn. viewBox 1200×900 (tỉ lệ 4:3). */
export function ProductArt({ art }: { art: ArtSpec }) {
  const { kind, color, view, label, size } = art;
  const s = 0.9;
  const [mw, mh] = [size[0] * s, size[1] * s];
  const mx = 600 - mw / 2;
  const my = 450 - mh / 2;
  const mat = (
    <g>
      <rect x={mx} y={my + 8} width={mw} height={mh} rx="12" fill={INK} />
      <rect x={mx} y={my} width={mw} height={mh} rx="12" fill={color} />
    </g>
  );
  const clips = (
    <g>
      <Clip x={420} y={250} />
      <Clip x={560} y={250} />
      <Clip x={700} y={250} />
      <path d="M452 312 C452 420 520 460 520 560" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      <path d="M592 312 C592 400 640 470 640 560" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
    </g>
  );

  let body: ReactElement;
  if (view === 2) {
    // Cận cảnh góc tấm lót: mặt vải, viền, đế cao su.
    body = (
      <g>
        <rect x="-40" y="-40" width="1280" height="980" fill={DESK} />
        <rect x="300" y="240" width="1000" height="760" rx="70" fill={INK} />
        <rect x="300" y="210" width="1000" height="760" rx="70" fill={kind === 'soon' ? SOON : color} />
        <rect x="360" y="270" width="900" height="640" rx="44" fill="none" stroke="#ffffff" strokeOpacity="0.16" strokeWidth="10" />
      </g>
    );
  } else if (view === 1 || kind === 'bundle') {
    body = (
      <g>
        <rect width="1200" height="900" fill={DESK} />
        <rect x="430" y="70" width="340" height="120" rx="8" fill="#2b2b2b" />
        {kind !== 'clip' && mat}
        <Keyboard x={mx + 80} y={450 - 65} />
        <Mouse x={mx + 530} y={450 - 54} />
        {(kind === 'clip' || kind === 'bundle') && clips}
      </g>
    );
  } else if (kind === 'clip') {
    body = (
      <g>
        <rect width="1200" height="900" fill={DESK} />
        <Clip x={300} y={420} slots={3} />
        <Clip x={560} y={420} slots={5} />
        <path d="M340 420 C340 300 420 260 420 120" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
        <path d="M610 420 C610 300 700 250 700 100" stroke={INK} strokeWidth="9" fill="none" strokeLinecap="round" />
      </g>
    );
  } else {
    body = (
      <g>
        <rect width="1200" height="900" fill={DESK} />
        {mat}
      </g>
    );
  }
  return (
    <svg viewBox="0 0 1200 900" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" className="art">
      <defs>
        <KeyPattern id="keys" />
      </defs>
      {body}
    </svg>
  );
}
