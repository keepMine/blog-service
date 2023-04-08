const { AdminDao } = require('@dao/admin')
const { generateToken } = require('@core/utils')
const { Auth } = require('@middlewares/auth')

class LoginManager {
  static async adminLogin(params) {
    const { email, password, ctx } = params
    // 验证账号密码是否正确
    const [err, admin] = await AdminDao.verify(email, password)
    if (!err) {
      // 判断ctx中ctx.tokenValid token是否过期 未过期直接返回之前的token
      if (ctx.tokenValid && ctx.tokenValid.valid)
        return [null, ctx.tokenValid.name]
      return [null, generateToken(admin.id, Auth.ADMIN)]
    } else {
      return [err, null]
    }
  }
}

module.exports = {
  LoginManager,
}
