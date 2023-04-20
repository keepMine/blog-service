const { User } = require('@models/user')
const bcrypt = require('bcryptjs')
const { Op } = require('sequelize')

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
  static async detail(id, status) {
    try {
      const scope = 'bh'
      const filter = {
        id
      }
      if(status) filter.status = status
      const user = await User.scope(scope).findOne({
        where: filter
      })
      if(!user) {
        throw new global.errs.AuthFailed('账号不存在或者被封禁')
      }
      return [null, user]
    } catch (error) {
      return [error, null]
    }
  }

  static async list(query = {}) {
    const {id, email, username, status, page=1, pageSize=10} = query
    const scope = 'bh'
    const filter = {}
    if(id) filter.id = id
    if(email) filter.email = email
    if(status || status == 0) filter.status = status
    if(username) filter.username = {
      [Op.like]: `%${username}%`
    }
    try {
      //TODO: 查询这段代码缘由
      const user = await User.scope(scope).findAndCountAll({
        where: filter,
        limit: 10,
        offset: (page-1) * pageSize,
        order: [
          ['created_at', 'DESC']
        ]
      })
      const data = {
        data: user.rows,
        meta: {
          current_page: parseInt(page),
          per_page: pageSize,
          count: user.count,
          total: user.count,
          total_pages: Math.ceil(user.count / pageSize),
        }
      }
      return [null, data]
    } catch (error) {
      return [error, null]
    }
  }
  static async destroy(id) {
    // 检查是否存在
    const user = await User.findByPk(id)
    if(!user) {
      throw new global.errs.NotFound('没有找到相关用户')
    }
    try {
      const res = await user.destroy()
      return [null, res]
    } catch (error) {
      return [error, null]
    }
  }

  static async update(id, v) {
    // 检查是否存在
    const user = await User.findByPk(id)
    if(!user) {
      throw new global.errs.NotFound('没有找到相关用户')
    }
    try {
      user.email = v.get('body.email')
      user.username = v.get('body.username')
      user.status = v.get('body.status')
      const res = await user.save()
      return [null, res]
    } catch (error) {
      return [error, null]
    }
  }
}
module.exports = {
  UserDao
}