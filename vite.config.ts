import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// `npm run dev:local` dùng API trong bộ nhớ ở cổng 3002 để chạy song song được với `npm run dev` (cổng 3001).
const apiPort = process.env.npm_lifecycle_event === 'dev:local' ? 3002 : 3001;

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: { '/api': `http://localhost:${apiPort}` },
  },
});
