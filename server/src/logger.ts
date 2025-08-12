import pino from 'pino';

const pretty = process.env.PRETTY_LOGS === '1' || process.env.NODE_ENV !== 'production';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: pretty
    ? { target: 'pino-pretty', options: { colorize: true, singleLine: true, translateTime: 'SYS:standard' } }
    : undefined,
  base: { app: 'nasa-explorer-api' }
});
