export default () => ({
  port: parseInt(process.env.PORT, 10) || 4041,
  database: {
    url: process.env.DATABASE_URL
  },
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenLifetime: process.env.REFRESH_TOKEN_LIFETIME,
  privateKey: process.env.PRIVATE_KEY,
  rateLimitThrottleTtl: parseInt(process.env.RATE_LIMIT_THROTTLE_TTL, 10),
  rateLimitThrottleLimit: parseInt(process.env.RATE_LIMIT_THROTTLE_LIMIT, 10)
})
