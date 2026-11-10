/**
 * Chuẩn hóa số điện thoại Việt Nam về dạng 0xxxxxxxxx (10–11 chữ số).
 * Chấp nhận khoảng trắng, dấu chấm, gạch ngang, ngoặc và tiền tố +84 / 84.
 * Trả về null nếu không giống số điện thoại.
 */
export function normalizePhone(raw: string): string | null {
  let digits = raw.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+84')) digits = `0${digits.slice(3)}`;
  else if (digits.startsWith('84') && digits.length >= 11) digits = `0${digits.slice(2)}`;
  return /^0\d{9,10}$/.test(digits) ? digits : null;
}

/** Chuẩn hóa mã đơn: bỏ khoảng trắng, viết hoa, tự thêm tiền tố OD- khi chỉ nhập 8 ký tự. */
export function normalizeOrderCode(raw: string): string {
  const code = raw.replace(/\s+/g, '').toUpperCase();
  return /^[0-9A-F]{8}$/.test(code) ? `OD-${code}` : code;
}
