import type { CSSProperties, ReactElement } from 'react';
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

export const MAT_COLORS: Record<string, string> = { Xám: '#5d7385', Đen: '#0f1c26' };
const SOON = '#e9f3fa';
const DESK = '#d6e9f5';
const INK = '#0b2233';

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
      <rect x="3" y="3" width="21" height="21" rx="3" fill="#c9dcea" />
    </pattern>
  );
}

function Keyboard({ x, y, w = 400, h = 130 }: { x: number; y: number; w?: number; h?: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="8" fill="#f8fcff" />
      <rect x={x + 8} y={y + 8} width={w - 16} height={h - 16} fill="url(#keys)" />
    </g>
  );
}

function Mouse({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width="62" height="108" rx="30" fill="#f8fcff" />
      <rect x={x + 29} y={y + 14} width="4" height="26" rx="2" fill="#a9c3d6" />
    </g>
  );
}

function Clip({ x, y, slots = 3 }: { x: number; y: number; slots?: number }) {
  const w = 24 + slots * 26;
  return (
    <g>
      <rect x={x} y={y} width={w} height="62" rx="10" fill="#f8fcff" />
      {Array.from({ length: slots }, (_, i) => (
        <rect key={i} x={x + 16 + i * 26} y={y + 14} width="12" height="34" rx="6" fill="#6f8aa0" />
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
        <rect x="430" y="70" width="340" height="120" rx="8" fill="#17364d" />
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

export type Scene = 'mat' | 'clips' | 'bundle';

/** Hình học SVG qua CSS để CSS transition làm tấm lót đổi cỡ mượt. */
const geo = (x: number, y: number, w: number, h: number) =>
  ({ x: `${x}px`, y: `${y}px`, width: `${w}px`, height: `${h}px` }) as unknown as CSSProperties;

/**
 * Sân khấu trang chủ: bàn nhìn từ trên xuống, 1 đơn vị = 0,9 mm.
 * Tấm lót vẽ đúng tỉ lệ kích thước đã chọn; đổi cỡ/màu thì tấm lót đổi theo.
 */
export function DeskScene({ scene, width, height, color, label }: { scene: Scene; width: number; height: number; color: string; label: string }) {
  const s = 0.9;
  const w = width * s;
  const h = height * s;
  const cx = 500;
  const cy = 720;
  const tidy = scene !== 'mat';
  return (
    <svg viewBox="0 0 1000 1100" preserveAspectRatio="xMidYMid slice" className="scene" role="img" aria-label={`Bàn làm việc nhìn từ trên xuống: ${label}`}>
      <defs>
        <KeyPattern id="keys-scene" />
      </defs>
      <rect width="1000" height="1100" fill={DESK} />
      <rect x="300" y="110" width="400" height="150" rx="8" fill="#17364d" />
      {/* Dây lộn xộn khi chưa có kẹp */}
      <g className="fade" style={{ opacity: tidy ? 0 : 1 }} fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round">
        <path d="M420 260 C330 360 600 380 470 470 S640 540 560 640" />
        <path d="M520 260 C640 330 380 400 560 450 S420 560 700 560" />
        <path d="M600 260 C520 300 700 350 620 420" />
      </g>
      {/* Dây gọn trong kẹp */}
      <g className="fade" style={{ opacity: tidy ? 1 : 0 }}>
        <g fill="none" stroke={INK} strokeWidth="9" strokeLinecap="round">
          <path d="M440 260 L440 40" />
          <path d="M500 260 L500 40" />
          <path d="M560 260 L560 40" />
        </g>
        <Clip x={405} y={150} />
        <Clip x={490} y={150} slots={2} />
      </g>
      <g className="mat">
        <rect style={geo(cx - w / 2, cy - h / 2 + 8, w, h)} rx="12" fill={INK} />
        <rect style={{ ...geo(cx - w / 2, cy - h / 2, w, h), fill: color }} rx="12" />
      </g>
      <g>
        <rect x={cx - 240} y={cy - 65} width="400" height="130" rx="8" fill="#f8fcff" />
        <rect x={cx - 232} y={cy - 57} width="384" height="114" fill="url(#keys-scene)" />
        <Mouse x={cx + 190} y={cy - 54} />
      </g>
    </svg>
  );
}
