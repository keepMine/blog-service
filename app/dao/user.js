const { User } = require('@models/user')
const bcrypt = require('bcryptjs')

class UserDao {
  static async create(params) {
    const {email, password, username} = params
    const hasUser = await User.findOne({
      where: {
        email,
        deleted_at: null,
      }
    })
    if(hasUser) {
      throw new global.errs.Existing('用户已存在')
    }
    const user = new User()
    user.username = username
    user.password = password
    user.email = email

    try {
      const res = await user.save()
      const data = {
        email: res.email,
        username: res.username
      }
      return [null, data]
    } catch (error) {
      return [error, null]
    }
  }
  static async verify(email, password) {
    try {
      const user = await User.findOne({
        where: {
          email,
          status: 1
        },
      })

      if(!user) {
        throw new global.errs.AuthFailed('用户不存在')
      }
      const passwordPass = bcrypt.compareSync(password, user.password)
      if(!passwordPass) {
        throw new global.errs.AuthFailed('密码不正确')
      }
      return [null, user]
    } catch (error) {
      return [error, null]
    }
  }
}
module.exports = {
  UserDao
}