const { Category } = require('@models/category')
const { Op } = require('sequelize')

class CategoryDao {
  static async list(query = {}) {
    const { id, name, status, page = 1, pageSize = 10 } = query
    const scope = 'bh'
    const filter = {}
    if (id) filter.id = id
    if (status || status === 0) filter.status = status
    if (name) filter.name = {
      [Op.like]: `%${name}%` // Op 是 Sequelize 提供的运算符常量对象，用于生成各种运算符，如 Op.like 表示生成 SQL 中的 LIKE 运算符。
      // 表示模糊匹配的字符串模板，其中 % 表示匹配任意字符， 两个 % 之间的字符串是需要匹配的字符串的一部分。
    }
    try {
      const category = await Category.scope(scope).findAndCountAll({
        where: filter,
        limit: 10,
        offset: (page - 1) * pageSize,
        order: [
          ['created_at', 'DESC'] // 该属性用于指定查询结果集的排序规则，按 created_at 字段降序排列。
        ]
      })
      const data = {
        data: category.rows,
        meta: {
          current_page: parseInt(page),
          per_page: pageSize,
          count: category.count,
          total: category.count,
          total_pages: Math.ceil(category.count / pageSize),
        }
      }
      return [null, data]
    } catch (error) {
      return [error, null]
    }
  }
  static async create(v) {

    const name = v.get('body.name')
    const hasCategory = await Category.findOne({
      where: {
        name,
        deleted_at: null,
      }
    })

    if (hasCategory) {
      throw new global.errs.Existing('分类已存在');
    }

    // 创建
    const category = new Category();
    category.name = name;
    category.status = v.get('body.status') || 1;
    category.sort_order = v.get('body.sort_order');
    console.log(category, v)
    try {
      const res = await category.save();
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
  static async detail(id) {
    try {
      const scope = 'bh'
      const filter = {
        id
      }
      const category = await Category.scope(scope).findOne({
        where: filter
      })
      if (!category) {
        throw new global.errs.AuthFailed('没有找到相关分类')
      }
      return [null, category]
    } catch (error) {
      return [error, null]
    }
  }
  // 更新分类
  static async update(id, v) {
    const category = await Category.findByPk(id);
    if (!category) {
      throw new global.errs.NotFound('没有找到相关分类');
    }
    category.name = v.get('body.name');
    category.status = v.get('body.status');
    category.sort_order = v.get('body.sort_order');
    category.parent_id = v.get('body.parent_id') || 0;

    try {
      const res = await category.save();
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
   // 删除分类
   static async destroy(id) {
    // 查询分类
    const category = await Category.findOne({
      where: {
        id,
        deleted_at: null
      }
    });
    if (!category) {
      throw new global.errs.NotFound('没有找到相关分类');

    }
    try {
      const res = await category.destroy()
      return [null, res]

    } catch (err) {
      return [err, null]
    }
  }
}
module.exports = {
  CategoryDao
}