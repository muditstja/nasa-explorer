module.exports = {
    apps: [
      {
        name: 'nasa-explorer-api',
        script: 'dist/index.js',
        instances: 'max',
        exec_mode: 'cluster',
        env: {
          NODE_ENV: 'production',
          PORT: process.env.PORT || 8787,
          NASA_API_KEY: process.env.NASA_API_KEY,
          ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || '',
          CACHE_TTL_SECONDS: process.env.CACHE_TTL_SECONDS || 900,
          REDIS_URL: process.env.REDIS_URL,
          LOG_LEVEL: process.env.LOG_LEVEL || 'info'
        }
      }
    ]
  };
  