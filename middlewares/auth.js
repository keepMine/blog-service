const JWT  = require("jsonwebtoken");
const basicAuth  = require("basic-auth");

class Auth {
  constructor(level) {
    this.level  = level || 1
    Auth.USER = 8
    Auth.ADMIN = 16
    Auth.SUPER_ADMIN = 32
  }
  // 验证登陆后token权限
  get verifyToken() {
    return async (ctx, next) => {
       // 初始化   ctx.tokenValid 
       ctx.tokenValid = {name: '', valid: false}
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
  // 用来验证登陆的token
  get loginVerifyToken() {
    return async (ctx, next) => {
      // 初始化   ctx.tokenValid 
      ctx.tokenValid = {name: '', valid: false}
      const tokenObj = basicAuth(ctx.req)
      // 如果返回 undifined 则表示未携带token或者token无效, 直接next()颁发新的token
      if(!tokenObj) {
       await next()
      }else {
        // 返回为对象{name: token , pass: ''}则携带了token，判断是否过期
        try {
          var decode = JWT.verify(tokenObj.name, global.config.security.secretKey);
        } catch (error) {
        }
          // 这里添加token如果在有效期内则不生出新的token 
          if(decode && decode.exp > Date.now() / 1000 ) {
            // token 未过期 提示用户您已登陆无须重复登录 并返回其携带的token
            // 在ctx上挂载 tokenValid 为true
            ctx.tokenValid = {name: tokenObj.name, valid: true}
          }
          await next() 
      }
    }
  }
}
module.exports = {
  Auth
}