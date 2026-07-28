export default () => ({
  port: parseInt(process.env.PORT ?? '4001', 10),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  mongo: {
    uri: process.env.MONGO_URI ?? 'mongodb://localhost:27017',
    dbName: process.env.MONGO_DB_NAME ?? 'mail_logs',
  },
  redis: {
    url: process.env.REDIS_URL ?? 'redis://localhost:6379',
  },
  mail: {
    provider: process.env.MAIL_PROVIDER ?? 'gmail',
    bulk: {
      delayMs: parseInt(process.env.BULK_SEND_DELAY_MS ?? '750', 10),
    },
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT ?? '465', 10),
      secure: (process.env.SMTP_SECURE ?? 'true').toLowerCase() === 'true',
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
      from: process.env.SMTP_FROM,
    },
    credentialsEncryptionKey: process.env.MAIL_CREDENTIALS_ENCRYPTION_KEY,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'changeme',
  },

  cors: {
    origins: process.env.CORS_ORIGINS?.split(',').map((o) => o.trim()) ?? [],
  },
  cookie: {
    secret: process.env.COOKIE_SECRET ?? 'changeme',
    sameSite: (process.env.COOKIE_SAMESITE ?? 'lax') as
      'lax' | 'strict' | 'none',
    expiration: parseInt(process.env.COOKIE_EXPIRATION ?? '86400000', 10),
  },

  apiKeys: process.env.API_KEYS?.split(',').map((k) => k.trim()) ?? [],
});
