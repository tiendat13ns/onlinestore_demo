import { randomBytes, timingSafeEqual } from 'node:crypto';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import express, { type NextFunction, type Request, type Response } from 'express';
import { HttpError, adminProducts, changeStatus, createOrder, findOrder, listOrders, publicCatalog, updateVariant } from './store';

const PORT = Number(process.env.PORT ?? 3001);
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'admin-demo';
if (!process.env.ADMIN_PASSWORD) {
  console.warn('[server] ADMIN_PASSWORD chưa đặt — đang dùng mật khẩu demo mặc định "admin-demo".');
}

const app = express();
app.use(express.json({ limit: '50kb' }));

// ---- Admin auth (mật khẩu demo, token trong bộ nhớ) ----
const TOKEN_TTL_MS = 8 * 60 * 60 * 1000;
const tokens = new Map<string, number>();

function safeEqual(a: string, b: string): boolean {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  const token = req.header('authorization')?.replace(/^Bearer /, '');
  const expires = token ? tokens.get(token) : undefined;
  if (!token || !expires || expires < Date.now()) {
    tokens.delete(token ?? '');
    throw new HttpError(401, 'Cần đăng nhập admin.');
  }
  next();
}

// ---- Public ----
app.get('/api/catalog', (_req, res) => {
  res.json(publicCatalog());
});

app.post('/api/orders', (req, res) => {
  res.status(201).json(createOrder(req.body));
});

app.get('/api/orders/:code', (req, res) => {
  const order = findOrder(String(req.params.code).toUpperCase());
  if (!order) throw new HttpError(404, 'Không tìm thấy đơn.');
  res.json(order);
});

// ---- Admin ----
app.post('/api/admin/login', async (req, res) => {
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!safeEqual(password, ADMIN_PASSWORD)) {
    await new Promise((r) => setTimeout(r, 500));
    throw new HttpError(401, 'Sai mật khẩu.');
  }
  const token = randomBytes(24).toString('hex');
  tokens.set(token, Date.now() + TOKEN_TTL_MS);
  res.json({ token });
});

app.get('/api/admin/orders', requireAdmin, (_req, res) => {
  res.json(listOrders());
});

app.patch('/api/admin/orders/:code/status', requireAdmin, (req, res) => {
  res.json(changeStatus(String(req.params.code), req.body?.status));
});

app.get('/api/admin/products', requireAdmin, (_req, res) => {
  res.json(adminProducts());
});

app.patch('/api/admin/variants/:id', requireAdmin, (req, res) => {
  res.json(updateVariant(String(req.params.id), req.body ?? {}));
});

// ---- Static (production) ----
const dist = resolve('dist');
if (existsSync(dist)) {
  app.use(express.static(dist));
  app.get(/^\/(?!api\/).*/, (_req, res) => res.sendFile(resolve(dist, 'index.html')));
}

app.use('/api', (_req, _res, next) => next(new HttpError(404, 'Không tìm thấy API.')));

app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message });
    return;
  }
  if (err instanceof SyntaxError) {
    res.status(400).json({ error: 'Dữ liệu gửi lên không hợp lệ.' });
    return;
  }
  console.error(err);
  res.status(500).json({ error: 'Lỗi máy chủ. Vui lòng thử lại.' });
});

app.listen(PORT, () => console.log(`[server] http://localhost:${PORT}`));
