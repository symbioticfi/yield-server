const express = require('express');
const helmet = require('helmet');
const { Redis } = require('ioredis');

const redis = process.env.REDIS_URL
  ? new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
    })
  : null;

if (redis) {
  redis.on('error', (error) => {
    console.error('Redis cache connection error', { error });
  });
}

const yieldRoutes = require('./routes/yield');
const config = require('./routes/config');
const median = require('./routes/median');
const perp = require('./routes/perp');
const enriched = require('./routes/enriched');
const lsd = require('./routes/lsd');
const pools = require('./routes/pools');
const { getCacheDates } = require('../utils/headers');
const tokenAddress = require('./routes/tokenAddress');

const app = express();
app.use(require('morgan')('dev'));
app.use(helmet());
app.use(express.json());

const readCache = async (key) => {
  if (!redis) {
    return null;
  }

  try {
    return await redis.get(key);
  } catch (error) {
    console.error('Redis cache read failed', { key, error });
    return null;
  }
};

const writeCache = (entries) => {
  if (!redis) {
    return;
  }

  Promise.all(entries.map(([key, value]) => redis.set(key, value))).catch((error) => {
    console.error('Redis cache write failed', { error });
  });
};

const redisCache = async (req, res, next) => {
  const cacheKey = req.originalUrl;
  const lastCacheUpdate = await readCache(`lastUpdate#${cacheKey}`);
  const { headers, nextCacheDate } = getCacheDates();
  const cacheTimestamp = Number(lastCacheUpdate);
  const isFresh =
    Number.isFinite(cacheTimestamp) && cacheTimestamp > nextCacheDate.getTime() - 3600e3;
  const cacheObject = isFresh ? await readCache(`data#${cacheKey}`) : null;

  if (cacheObject !== null) {
    return res.set(headers).status(200).send(cacheObject);
  }

  const originalEnd = res.end;
  res.end = function cacheResponse(...args) {
    if (res.statusCode === 200) {
      const [content] = args;
      const serializedContent = content == null ? '' : content.toString();
      writeCache([
        [`data#${cacheKey}`, serializedContent],
        [`lastUpdate#${cacheKey}`, Date.now().toString()],
      ]);
      res.set(headers);
    }

    return originalEnd.apply(this, args);
  };

  return next();
};

app.use('/', [tokenAddress]);
app.use(redisCache);
app.use('/', [yieldRoutes, config, median, perp, enriched, lsd, pools]);

function errorHandler(err, req, res, next) {
  console.error('API request failed', {
    method: req.method,
    url: req.originalUrl,
    error: err,
  });

  if (res.headersSent) {
    return next(err);
  }

  const statusCode =
    Number.isInteger(err?.statusCode) && err.statusCode >= 400 && err.statusCode < 600
      ? err.statusCode
      : 500;
  const isClientError = statusCode < 500;

  return res.status(statusCode).json({
    status: isClientError ? 'fail' : 'error',
    message: isClientError && err?.message ? err.message : 'Internal server error',
  });
}

app.use(errorHandler);

process.on('uncaughtException', (error) => {
  console.error('Uncaught exception', { error });
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled rejection', { error });
  process.exit(1);
});

module.exports = app;
