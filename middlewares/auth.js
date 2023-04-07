const JWT  = require("jsonwebtoken");
const basicAuth  = require("basic-auth");

class Auth {
  constructor(level) {
    this.level  = level || 1
    Auth.USER = 8
    Auth.ADMIN = 16
    Auth.SUPER_ADMIN = 32
  }
  // 验证token权限
  get verifyToken() {
    return async (ctx, next) => {
      const tokenObj = basicAuth(ctx.req);
      let errMsg = "无效的token";
      // 未携带token
      if(!tokenObj || !tokenObj.name) {
        errMsg = "需要携带token值"
        throw new global.errs.Forbidden(errMsg)
      }
      try {
        var decode = JWT.verify(tokenObj.name, global.config.security.secretKey);
      } catch (error) {
         // token 不合法 过期
         if (error.name === 'TokenExpiredError') {
          errMsg = "token已过期"
        }
        throw new global.errs.Forbidden(errMsg);
      }
      if (decode.scope < this.level) {
        errMsg = "权限不足"
        throw new global.errs.Forbidden(errMsg);
      }
      ctx.auth = {
        uid: decode.uid,
        scope: decode.scope
      }
      await next()
    }
  }
}
module.exports = {
  Auth
}