const { sequelize } = require('@core/db')
const { Model, DataTypes } = require('sequelize')
const moment = require('moment')
class Article extends Model {}

Article.init({
  id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '文章主键ID'
  },
  title: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '文章标题'
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
    comment: '文章描述'
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    comment: '文章封面图'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    comment: '文章内容'
  },
  seo_keyword: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '文章搜索关键字'
  },
  status: {
    type: DataTypes.TINYINT,
    allowNull: true,
    defaultValue: 1,
    comment: '0-禁用 1-正常'
  },
  sort_order: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: true,
    defaultValue: 1,
    comment: '排序编号'
  },
  browse: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: '文章浏览次数'
  },
  favorite_num: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: true,
    defaultValue: 0,
    comment: '文章点赞次数'
  },
  admin_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
    comment: '发布管理员ID'
  },
  category_id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    allowNull: false,
    comment: '关联分类ID'
  },
  created_time: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '发布时间',
    get() {
      return moment(this.getDataValue('created_time')).format('YYYY-MM-DD HH:mm:ss');
    }
  },
  created_at: {
    type: DataTypes.DATE,
    allowNull: false,
    comment: '创建时间',
    get() {
      return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss');
    }
  }
},{
  sequelize,
  modelName: 'article',
  tableName: 'article'
})
module.exports = {
  Article
}