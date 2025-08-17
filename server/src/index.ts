import express from 'express';
import { randomUUID } from 'crypto';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import pinoHttp from 'pino-http';
import { logger } from './logger';
import { config } from './config';
import apod from './routes/apod.route';
import neo from './routes/neo.route';
import mars from './routes/mars.route';
import eonet from './routes/eonet.route';
import donki from './routes/donki.route';
import techTransfer from './routes/techTransfer.route';
import { errorHandler, notFound } from './middleware/errors';
import swaggerUi from 'swagger-ui-express';
import openapi from './openapi.json';
import path from 'path'
// import { fileURLToPath } from 'url'

const app = express();

app.use(pinoHttp({
  logger: logger as any,
  genReqId: req => (req.headers['x-request-id'] as string) || randomUUID()
}));

// app.use(helmet());
app.use(compression());
app.use(express.json({ limit: '1mb' }));

app.use(cors());

app.set('trust proxy', 1);
app.use(rateLimit({ windowMs: 60_000, max: 120, standardHeaders: true, legacyHeaders: false }));

// Docs
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapi, { explorer: true }));

// Health
app.get('/healthz', (_req, res) => res.json({ ok: true, name: 'nasa-explorer-api', status: 'healthy' }));

// APIs
app.use('/api/apod', apod);
app.use('/api/neo', neo);
app.use('/api/mars', mars);
app.use('/api/events', eonet);
app.use('/api/donki', donki);
app.use('/api/tech', techTransfer);

const clientBuildPath = path.resolve(__dirname, '../build'); 

// Serve static assets
app.use(express.static(clientBuildPath, { index: false }));

// SPA fallback: only for non-API routes
app.get(/^\/(?!api\/).*/, (_req, res, next) => {
  console.log('******************** build path = ', clientBuildPath)
  const indexFile = path.join(clientBuildPath, 'index.html');
  console.log('---------------------------- indexFile = ', indexFile);
  res.sendFile(indexFile, (err) => {
    if (err) next(err);   // lets error middleware log the actual ENOENT if path is wrong
  });
});


app.use(notFound);
app.use(errorHandler);

app.listen(config.port, () => logger.info({ port: config.port }, 'API listening'));
