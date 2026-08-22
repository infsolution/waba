export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  env: process.env.NODE_ENV || 'development',
  meta: {
    appId: process.env.META_APP_ID || '',
    appSecret: process.env.META_APP_SECRET || '',
    graphApiVersion: process.env.META_GRAPH_API_VERSION || 'v21.0',
    graphBaseUrl: (wabaId?: string) =>
      `https://graph.facebook.com/${process.env.META_GRAPH_API_VERSION || 'v21.0'}${wabaId ? `/${wabaId}` : ''}`,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me',
    expiresIn: '15m',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'change-me-refresh',
    refreshExpiresIn: '7d',
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60,
    limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 100,
  },
  encryption: {
    key: process.env.ENCRYPTION_KEY || 'change-me-32-char-key-here!!!',
  },
});
