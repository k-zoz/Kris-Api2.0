import process from "process";

export default () =>({
  port: parseInt(process.env.PORT) || 4041,
  database: {
    url: process.env.DATABASE_URL
  }
})
