const { HttpException } = require('@core/http-exception')

const catchError = async (ctx, next) => {
  try {
    await next()
  } catch (error) {
    // 开发环境
    const isHttpException = error instanceof HttpException
    const isDev = global.config.environment === 'dev'
    // 如果开发环境，并且错误不是定义的直接抛出错误，方便排查
    if (isDev && !isHttpException) {
      throw error
    }

    if (isHttpException) {
      ctx.body = {
        msg: error.msg,
        errorCode: error.errorCode,
        request: `${ctx.method} ${ctx.path}`,
      }
      ctx.response.status = error.code
    } else {
      ctx.body = {
        msg: '未知错误',
        errorCode: 8888,
        request: `${ctx.method} ${ctx.path}`,
      }
      ctx.response.status = 500
    }
  }
}
module.exports = catchError
