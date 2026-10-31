import { createServer } from 'node:http';
import { handle } from './handler';

// Server chạy thử ở máy: dùng đúng handler như Netlify Function, Vite proxy /api sang cổng này.
const PORT = Number(process.env.PORT ?? 3001);

if (!process.env.DATABASE_URL) {
  console.error('[api] Thiếu DATABASE_URL. Sao chép .env.example thành .env rồi điền giá trị (xem docs/DEPLOY.md).');
  process.exit(1);
}

createServer((req, res) => {
  const chunks: Buffer[] = [];
  req.on('data', (c: Buffer) => chunks.push(c));
  req.on('end', async () => {
    const headers: Record<string, string | undefined> = {};
    for (const [k, v] of Object.entries(req.headers)) headers[k] = Array.isArray(v) ? v.join(',') : v;
    const result = await handle({
      method: req.method ?? 'GET',
      path: new URL(req.url ?? '/', 'http://localhost').pathname,
      headers,
      body: Buffer.concat(chunks).toString('utf8'),
    });
    res.writeHead(result.status, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
    res.end(JSON.stringify(result.body));
  });
}).listen(PORT, () => console.log(`[api] http://localhost:${PORT}`));
