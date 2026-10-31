import { handle } from '../../server/handler';

// Mọi lời gọi /api/* được netlify.toml chuyển vào function này.
export default async (req: Request): Promise<Response> => {
  const body = req.method === 'GET' || req.method === 'HEAD' ? '' : await req.text();
  const result = await handle({
    method: req.method,
    path: new URL(req.url).pathname,
    headers: Object.fromEntries(req.headers),
    body,
  });
  return new Response(JSON.stringify(result.body), {
    status: result.status,
    headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' },
  });
};
