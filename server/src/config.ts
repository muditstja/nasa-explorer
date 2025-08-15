import 'dotenv/config';

export const config = {
  port: Number(process.env.PORT ?? 8787),
  nasaKey: process.env.NASA_API_KEY ?? 'DEMO_KEY',
  cacheTtl: Number(process.env.CACHE_TTL_SECONDS ?? 21600), // 60*60*6 = 6hrs
  allowedOrigins: (process.env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean),
  env: (process.env.NODE_ENV ?? 'development') as 'development' | 'production' | 'test'
};
