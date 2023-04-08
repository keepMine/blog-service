/**
 * 入口文件
 */

const Koa = require('koa')
// package设置路径别名的库，需要在代码前面require module-alias
require('module-alias/register')
// body解析器
const bodyParser = require('koa-bodyparser')
// 跨域
const cors = require('@koa/cors')
// 静态资源
const static = require('koa-static')
// 接口调用限制
const ratelimit = require('koa-ratelimit')

const InitManager = require('./core/init')
// 捕获处理错误
const catchError = require('@middlewares/exception')

const app = new Koa()

app.use(catchError)
app.use(cors())
app.use(bodyParser())
app.use(static(__dirname + '/public'))

const db = new Map()
app.use(
  ratelimit({
    driver: 'memory',
    db: db,
    duration: 60000,
    errorMessage: '接口调用频繁，请稍后再试',
    id: (ctx) => ctx.ip,
    headers: {
      remaining: 'Rate-Limit-Remaining',
      reset: 'Rate-Limit-Reset',
      total: 'Rate-Limit-Total',
    },
    max: 100, // 限制同一个ip的并发数
    disableHeader: false,
    whitelist: (ctx) => {
      // some logic that returns a boolean
    },
    blacklist: (ctx) => {
      // some logic that returns a boolean
    },
  })
)
// 初始化方法
InitManager.initCore(app)
app.listen(3000, () => {
  console.log('blog-service is listening in http://localhost:3000')
})

module.exports = app
