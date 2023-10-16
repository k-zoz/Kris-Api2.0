export default () => ({
  port: parseInt(process.env.PORT, 10) || 4041,
  database: {
    url: process.env.DATABASE_URL
  },
  mail: {
    host: process.env.EMAIL_HOST,
    user: process.env.EMAIL_USER,
    password: process.env.EMAIL_PASSWORD,
  },
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  accessTokenLifetime: process.env.ACCESS_TOKEN_LIFETIME,
  refreshTokenSecret: process.env.REFRESH_TOKEN_SECRET,
  refreshTokenLifetime: process.env.REFRESH_TOKEN_LIFETIME,
  privateKey: process.env.PRIVATE_KEY,
  rateLimitThrottleTtl: parseInt(process.env.RATE_LIMIT_THROTTLE_TTL, 10),
  rateLimitThrottleLimit: parseInt(process.env.RATE_LIMIT_THROTTLE_LIMIT, 10),
  resendApiKey:process.env.RESEND_API_KEY,
  mailSender:process.env.MAIL_SENDER,
  cloudinaryCloudName:process.env.CLOUDINARY_CLOUD_NAME,
  cloudinaryApiKey:process.env.CLOUDINARY_API_KEY,
  cloudinaryApiSecret:process.env.CLOUDINARY_API_SECRET,
  wikiAccessToken:process.env.WIKI_ACCESS_TOKEN
})
