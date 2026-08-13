import path from 'path';
import { defineConfig, loadEnv } from 'vite';

// 환경 분기 (P34 패턴):
//   Vercel 빌드: basePath '' (root context) — API routes/XHR 활성이 필요하면 Vercel 권장
//   Pages 빌드: basePath '/youtube-board/' (subpath)
const isVercel = !!process.env.VERCEL;

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    return {
      base: isVercel ? '' : '/youtube-board/',
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.YOUTUBE_API_KEY': JSON.stringify(env.YOUTUBE_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        target: 'es2020',
        chunkSizeWarningLimit: 2000,
      }
    };
});
