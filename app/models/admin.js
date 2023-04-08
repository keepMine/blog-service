const moment = require('moment')
const bcrypt = require('bcryptjs')
const { sequelize } = require('@core/db')
const { Model, DataTypes } = require('sequelize')

// 定义管理员模型 继承子 Model
class Admin extends Model {}
// 该方法用来定义数据库中的表数据 是 Sequelize 中用于定义模型的静态方法，用于指定模型的字段、关联和选项等信息。
// 每个模型都需要通过调用 Model.init 方法来进行初始化，以便将模型映射到数据库中的表
Admin.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED, // 有符号的 10 位整数类型 .UNSIGNED 将字段类型从有符号整数改为无符号整数
      primaryKey: true, // 用于指定该模型的主键
      autoIncrement: true, // 是否自增
      comment: '管理员主键ID',
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
    nickname: {
      type: DataTypes.STRING(50),
      // 将 allowNull 设置为 false 将为该列添加 NOT NULL,
      // 这意味着如果该列为 null,则在执行查询时将从数据库引发错误.
      allowNull: false,
      // 备注
      comment: '管理员昵称',
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
  {
    // 定义实例、表名为admin
    sequelize,
    modelName: 'admin',
    tableName: 'admin',
  }
)

module.exports = {
  Admin,
}
