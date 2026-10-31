import { checkPassword, issueToken, requireAdmin } from './auth';
import { HttpError } from './errors';
import { adminProducts, changeStatus, createOrder, findOrder, listOrders, publicCatalog, updateVariant } from './store';

export interface ApiRequest {
  method: string;
  /** Đường dẫn gốc của request, ví dụ /api/orders hoặc /.netlify/functions/api/orders. */
  path: string;
  headers: Record<string, string | undefined>;
  body: string;
}

export interface ApiResponse {
  status: number;
  body: unknown;
}

const PREFIX = /^\/(?:\.netlify\/functions\/)?api(?=\/|$)/;
const MAX_BODY = 50_000;

function parseBody(raw: string): Record<string, unknown> {
  if (!raw) return {};
  if (raw.length > MAX_BODY) throw new HttpError(413, 'Dữ liệu gửi lên quá lớn.');
  try {
    const data: unknown = JSON.parse(raw);
    return data && typeof data === 'object' ? (data as Record<string, unknown>) : {};
  } catch {
    throw new HttpError(400, 'Dữ liệu gửi lên không hợp lệ.');
  }
}

async function route(req: ApiRequest): Promise<ApiResponse> {
  const path = (req.path.replace(PREFIX, '') || '/').replace(/\/+$/, '') || '/';
  const method = req.method.toUpperCase();
  const auth = req.headers['authorization'] ?? req.headers['Authorization'];
  let m: RegExpMatchArray | null;

  if (method === 'GET' && path === '/catalog') return { status: 200, body: await publicCatalog() };

  if (method === 'POST' && path === '/orders') return { status: 201, body: await createOrder(parseBody(req.body)) };

  if (method === 'GET' && (m = path.match(/^\/orders\/([^/]+)$/))) {
    const order = await findOrder(decodeURIComponent(m[1]).toUpperCase());
    if (!order) throw new HttpError(404, 'Không tìm thấy đơn.');
    return { status: 200, body: order };
  }

  if (method === 'POST' && path === '/admin/login') {
    if (!checkPassword(parseBody(req.body).password)) {
      await new Promise((r) => setTimeout(r, 500));
      throw new HttpError(401, 'Sai mật khẩu.');
    }
    return { status: 200, body: { token: issueToken() } };
  }

  if (path.startsWith('/admin/')) {
    requireAdmin(auth);
    if (method === 'GET' && path === '/admin/orders') return { status: 200, body: await listOrders() };
    if (method === 'GET' && path === '/admin/products') return { status: 200, body: await adminProducts() };
    if (method === 'PATCH' && (m = path.match(/^\/admin\/orders\/([^/]+)\/status$/))) {
      return { status: 200, body: await changeStatus(decodeURIComponent(m[1]), parseBody(req.body).status) };
    }
    if (method === 'PATCH' && (m = path.match(/^\/admin\/variants\/([^/]+)$/))) {
      return { status: 200, body: await updateVariant(decodeURIComponent(m[1]), parseBody(req.body)) };
    }
  }

  throw new HttpError(404, 'Không tìm thấy API.');
}

/** Điểm vào chung: Netlify Function và server chạy thử ở máy đều gọi hàm này. */
export async function handle(req: ApiRequest): Promise<ApiResponse> {
  try {
    return await route(req);
  } catch (err) {
    if (err instanceof HttpError) return { status: err.status, body: { error: err.message } };
    console.error(err);
    return { status: 500, body: { error: 'Lỗi máy chủ. Vui lòng thử lại.' } };
  }
}
