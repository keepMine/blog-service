const { sequelize } = require('@core/db')
const { Model, DataTypes } = require('sequelize')
class Category extends Model {}


Category.init({
  id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true,
    comment: '分类主键ID'
  },
  name: {
    type: DataTypes.STRING(128),
    allowNull: false,
    comment: '分类名称'
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
    comment: '排序'
  }
}, { 
  sequelize,
  modelName: 'category',
  tableName: 'category'
})
module.exports = {
  Category
}