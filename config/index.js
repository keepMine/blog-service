module.exports = {
  environment: 'dev',
  database: {
    dbName: 'myblog',
    host: 'localhost',
    port: 3308,
    user: 'root',
    password: '',
  },
  security: {
    secretKey: 'secretKey',
    // 过期时间 1小时
    expiresIn: 60 * 60,
  },
}
