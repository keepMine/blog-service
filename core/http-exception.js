class HttpException extends Error {
  constructor(msg = '服务器异常', code = 400, errorCode = 10000) {
    super()
    this.msg = msg
    this.code = code
    this.errorCode = errorCode
  }
}
class ParameterException extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '参数错误'
    this.code = 400
    this.errorCode = errorCode || 10000
  }
}

class AuthFailed extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '授权失败'
    this.code = 401
    this.errorCode = errorCode || 10004
  }
}

class NotFound extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '404找不到'
    this.code = 404
    this.errorCode = errorCode || 10005
  }
}

class Forbidden extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '禁止访问'
    this.code = 403
    this.errorCode = errorCode || 10006
  }
}

class Existing extends HttpException {
  constructor(msg, errorCode) {
    super()
    this.msg = msg || '已存在'
    this.code = 412
    this.errorCode = errorCode || 10006
  }
}
module.exports = {
  HttpException,
  ParameterException,
  AuthFailed,
  NotFound,
  Forbidden,
  Existing
}