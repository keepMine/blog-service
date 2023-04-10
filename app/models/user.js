const moment = require('moment')
const bcrypt = require('bcryptjs')
const { sequelize } = require('@core/db')
const { Model, DataTypes } = require('sequelize')

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '用户主键ID'
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: false,
    comment: '用户昵称'
  },
  email: {
    type: DataTypes.STRING(50),
    unique: 'admin_email_unique', // 约束此属性唯一 通过value判断是哪个属性
    allowNull: false, // 不允许为空
    comment: '登录邮箱',
  },
  password: {
    type: DataTypes.STRING,
    set(val) {
      // 对传入的值进行加密处理 并付给该值
      // 加密
      const salt = bcrypt.genSaltSync(10)
      // 生成加密密码
      const psw = bcrypt.hashSync(val, salt)
      this.setDataValue('password', psw)
    },
    allowNull: false,
    comment: '登录密码',
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
    comment: '0-禁用 1-正常'
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '创建时间',
    get() {
      // 在 Sequelize 中，我们可以使用 get 和 set 方法对模型的字段值进行读写操作
      return moment(this.getDataValue('created_at')).format(
        'YYYY-MM-DD HH:mm:ss'
      )
    },
  },
},
{sequelize,
modelName: 'user',
tableName: 'user',}
)
module.exports = {
  User,
}