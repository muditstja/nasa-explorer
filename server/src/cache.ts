import IORedis from 'ioredis';
import LRU from 'lru-cache';
import { config } from './config';

const useRedis = !!process.env.REDIS_URL;

let redis: any | null = null;
if (useRedis) {
  redis = new IORedis(process.env.REDIS_URL as string, process.env.REDIS_TLS ? { tls: {} } : {});
  redis.on('error', (e: any) => console.error('[redis] error', e));
}

const memory = new LRU<string, string>({ max: 1000, ttl: config.cacheTtl * 1000 });

export async function cacheGet(key: string): Promise<string | null> {
  if (redis) {
    try { return (await redis.get(key)) as string | null; } catch { /* fall through */ }
  }
  const v = memory.get(key);
  return v ?? null;
}

export async function cacheSet(key: string, value: string, ttlSeconds = config.cacheTtl): Promise<void> {
  if (redis) {
    try { await redis.set(key, value, 'EX', ttlSeconds); return; } catch { /* fall through */ }
  }
  memory.set(key, value, { ttl: ttlSeconds * 1000 });
}

export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlSeconds = config.cacheTtl
): Promise<T> {
  const hit = await cacheGet(key);
  if (hit) return JSON.parse(hit) as T;
  const val = await fetcher();
  await cacheSet(key, JSON.stringify(val), ttlSeconds);
  return val;
}
