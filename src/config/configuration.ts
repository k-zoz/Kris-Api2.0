export default () => ({
  port: parseInt(process.env.PORT, 10) || 4041,
  database: {
    url: process.env.DATABASE_URL
  },
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenLifetime:process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenSecret:process.env.REFRESH_TOKEN_SECRET,
  refreshTokenLifetime:process.env.REFRESH_TOKEN_LIFETIME
})
