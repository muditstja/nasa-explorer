import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { logger } from './logger';
import { config } from './config';
import apod from './routes/apod';
import neo from './routes/neo';
import mars from './routes/mars';
import epic from './routes/epic';
import library from './routes/library';
import { errorHandler, notFound } from './middleware/errors';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.json';

const app = express();

app.use(pinoHttp({ logger: logger as any, genReqId: req => (req.headers['x-request-id'] as string) || crypto.randomUUID() }));
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use(
  cors({
    origin(origin, cb) {
      if (!origin) return cb(null, true);
      if (config.allowedOrigins.length === 0 || config.allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error('Origin not allowed by CORS'));
    }
  })
);

app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true, name: 'nasa-explorer-api', status: 'healthy' }));

// API
app.use('/api/apod', apod);
app.use('/api/neo', neo);
app.use('/api/mars', mars);
app.use('/api/epic', epic);
app.use('/api/library', library);

app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => logger.info({ port: config.port }, 'API listening'));
