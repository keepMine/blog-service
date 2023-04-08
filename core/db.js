const Sequelize = require('sequelize')

const { dbName, host, port, user, password } = require('@config/index').database

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql', // 指定了数据库类型，这里为 MySQL。
  host,
  port,
  logging: false, // 设置为 false，表示禁用 Sequelize 的日志输出
  timezone: '+08:00', //  设置为 +08:00，表示将数据库时区设置为东八区。
  define: {
    // 用于配置 Sequelize 中模型的默认选项。
    timestamps: true, // 设置为 true，表示自动添加 created_at 和 updated_at 字段，并将其映射到模型中的 createdAt 和 updatedAt 属性。
    paranoid: true, // 设置为 true，表示启用软删除功能，并在模型中自动添加 deleted_at 字段，并将其映射到模型中的 deletedAt 属性
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at', // 分别指定了对应的字段名，以便与数据库中的字段名一致。
    underscored: true, // 表示将模型中的驼峰命名转换为下划线命名，以便与数据库中的命名风格保持一致。
    scopes: {
      // 属性用于定义模型的作用域，以便在查询时快速筛选出指定的数据字段
      bh: {
        attributes: {
          exclude: ['password', 'updated_at', 'deleted_at', 'created_at'],
        },
      },
      iv: {
        attributes: {
          exclude: ['content', 'password', 'updated_at', 'deleted_at'],
        },
      },
    },
  },
})
// 创建模型 同步数据库中的表结构和 Sequelize 中定义的模型之间的差异 如果为true 强制重新创建数据库表结构
sequelize.sync({ force: false })

// 用于测试数据库连接是否正常
sequelize
  .authenticate()
  .then((res) => {
    console.log('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = {
  sequelize,
}
