import { createHmac, timingSafeEqual } from 'node:crypto';
import { HttpError } from './errors';

const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;

// Serverless không có bộ nhớ dùng chung giữa các lần chạy, nên token admin là chuỗi tự ký (HMAC), không lưu phía server.
function secret(): string {
  const value = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!value) throw new HttpError(503, 'Khu quản trị chưa được cấu hình.');
  return value;
}

const hmac = (key: string, data: string) => createHmac('sha256', key).update(data).digest();
const b64 = (buf: Buffer | string) => Buffer.from(buf).toString('base64url');

/** So sánh không lộ độ dài hay thời gian: so hai bản băm có cùng độ dài. */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(hmac('cmp', a), hmac('cmp', b));
}

export function checkPassword(input: unknown): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) throw new HttpError(503, 'Khu quản trị chưa được cấu hình.');
  return typeof input === 'string' && safeEqual(input, expected);
}

export function issueToken(now = Date.now()): string {
  const payload = b64(JSON.stringify({ exp: now + TOKEN_TTL_MS }));
  return `${payload}.${b64(hmac(secret(), payload))}`;
}

export function requireAdmin(authorization: string | undefined, now = Date.now()): void {
  const token = authorization?.replace(/^Bearer /i, '') ?? '';
  const [payload, signature] = token.split('.');
  if (!payload || !signature) throw new HttpError(401, 'Cần đăng nhập admin.');

  const expected = b64(hmac(secret(), payload));
  if (!safeEqual(signature, expected)) throw new HttpError(401, 'Cần đăng nhập admin.');
  try {
    const { exp } = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number };
    if (typeof exp !== 'number' || exp < now) throw new Error('expired');
  } catch {
    throw new HttpError(401, 'Phiên đăng nhập đã hết hạn.');
  }
}
