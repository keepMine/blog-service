const { AdminDao } = require('@dao/admin')
const { generateToken } = require('@core/utils')
const { Auth } = require('@middlewares/auth')

class LoginManager {
  static async adminLogin(params) {
    const { email, password } = params
     // 验证账号密码是否正确
     const [err, admin] = await AdminDao.verify(email, password);
     if (!err) {
      return [null, generateToken(admin.id, Auth.ADMIN)]
    } else {
      return [err, null]
    }
  }
}

module.exports = {
  LoginManager
}
