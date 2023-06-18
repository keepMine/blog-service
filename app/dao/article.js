const { Article } = require('@models/article')
const { Category } = require('@models/category')
const { Op } = require('sequelize')
const { isArray, unique } = require('@lib/utils')

class ArticleDao {
  // 处理分类
  static async _handleCategory(data, ids) {
    const finner = {
      where: {
        id: {}
      },
      attributes: ['id', 'name']
    }
    if (isArray(ids)) {
      finner.where.id = {
        [Op.in]: ids
      }
    } else {
      finner.where.id = ids
    }
    try {
      if (isArray(ids)) {
        const res = await Category.findAll(finner)
        let category = {}
        res.forEach(item => {
          category[item.id] = item
        })

        data.forEach(item => {
          item.setDataValue('category_info', category[item.category_id] || null)
        })
      } else {
        const res = await Category.findOne(finner)
        data.setDataValue('category_info', res)
      }
     return [null,data]
    } catch (err) {
      return [err, null]
    }
  }
  static async list(query = {}) {
    const { id, title, category_id, status, page = 1, pageSize = 10 } = query
    const scope = 'bh'
    const filter = {
      deleted_at: null
    }
    if (id) filter.id = id
    if (category_id) filter.category_id = category_id
    if (status || status === 0) filter.status = status
    if (title) filter.title = {
      [Op.like]: `%${title}%` // Op 是 Sequelize 提供的运算符常量对象，用于生成各种运算符，如 Op.like 表示生成 SQL 中的 LIKE 运算符。
      // 表示模糊匹配的字符串模板，其中 % 表示匹配任意字符， 两个 % 之间的字符串是需要匹配的字符串的一部分。
    }
    try {
      //TODO: 查询这段代码缘由
      const article = await Article.scope(scope).findAndCountAll({
        where: filter,
        limit: 10,
        offset: (page - 1) * pageSize,
        order: [
          ['created_time', 'DESC'] // 该属性用于指定查询结果集的排序规则，按 sort_order 字段降序排列。
        ]
      })
      //  这里对列表的关联表数据进行处理
      let rows = article.rows
      const ids = unique(rows.map(el => el.category_id))
      const [categoryErr, dataAndCategory] = await ArticleDao._handleCategory(rows, ids)
      if (!categoryErr) {
        rows = dataAndCategory
      }
      const data = {
        data: rows,
        meta: {
          current_page: parseInt(page),
          per_page: pageSize,
          count: article.count,
          total: article.count,
          total_pages: Math.ceil(article.count / pageSize),
        }
      }
      return [null, data]
    } catch (error) {
      return [error, null]
    }
  }
  static async create(v) {
    // 检测是否存在文章
    const title = v.get('body.title')
    const hasArticle = await Article.findOne({
      where: {
        title,
        deleted_at: null,
      }
    })

    if (hasArticle) {
      throw new global.errs.Existing('文章已存在');
    }
    // 创建文章
    const article = new Article();

    article.title = title;
    article.description = v.get('body.description');
    article.image_url = v.get('body.image_url');
    article.content = v.get('body.content');
    article.seo_keyword = v.get('body.seo_keyword');
    article.status = v.get('body.status') || 1;
    article.sort_order = v.get('body.sort_order');
    article.admin_id = v.get('body.admin_id');
    article.category_id = v.get('body.category_id');
    article.created_time = v.get('body.created_time');

    try {
      const res = await article.save();
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
   // 删除文章
   static async destroy(id) {
    // 检测是否存在文章
    const article = await Article.findOne({
      where: {
        id,
        deleted_at: null
      }
    });
    // 不存在抛出错误
    if (!article) {
      throw new global.errs.NotFound('没有找到相关文章');

    }

    try {
      // 软删除文章
      const res = await article.destroy()
      return [null, res]

    } catch (err) {
      return [err, null]
    }
  }
  static async detail(id) {
    try {
      const article = await Article.findOne({
        where: {
          id,
          deleted_at: null
        }
      })
      if(!article) {
        throw global.errs.NotFound('没有找到相关文章')
      }
      const [categoryError, dataAndCategory] = await ArticleDao._handleCategory(article, article.category_id) 
      return [null, article]
    } catch (error) {
      return [error, null]
    }
    
  }
  static async update(id, v) {
   
      // 检查是否存在
      const article = await Article.findByPk(id)
      if(!article) {
        throw new global.errs.NotFound('没有找到相关文章')
      }
      try {
           // 更新文章
    article.title = v.get('body.title');
    article.description = v.get('body.description');
    article.image_url = v.get('body.image_url');
    article.content = v.get('body.content');
    article.seo_keyword = v.get('body.seo_keyword');
    article.status = v.get('body.status');
    article.sort_order = v.get('body.sort_order');
    article.admin_id = v.get('body.admin_id');
    article.category_id = v.get('body.category_id');
    article.created_time = v.get('body.created_time');

        const res = await article.save()
        return [null, res]
      } catch (error) {
        return [error, null]
      }
    
  }
    // 更新文章浏览次数
    static async updateBrowse(id, browse) {
      // 查询文章
      const article = await Article.findByPk(id);
      if (!article) {
        throw new global.errs.NotFound('没有找到相关文章');
      }
      // 更新文章浏览
      article.browse = browse;
  
      try {
        const res = await article.save();
        return [null, res]
      } catch (err) {
        return [err, null]
      }
    }
}

module.exports = { ArticleDao }