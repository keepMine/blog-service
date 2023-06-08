const { Rule, LinValidator } = require('@core/lin-validator')
const { Article } = require('@models/article')

class CreateArticleValidator extends LinValidator {
  constructor() {
    super()
    this.title = [new Rule("isLength", "文章标题 title 不能为空", { min: 1 })];
    this.image_url = [new Rule("isLength", "文章封面 image_url 不能为空", { min: 1 })];
    this.content = [new Rule("isLength", "文章内容 content 不能为空", { min: 1 })];
    this.seo_keyword = [new Rule("isLength", "文章关键字 seo_keyword 不能为空", { min: 1 })];
    this.description = [new Rule("isLength", "文章简介 description 不能为空", { min: 1 })];
    this.category_id = [new Rule("isLength", "文章分类 category_id 不能为空", { min: 1 })];
    this.admin_id = [new Rule("isLength", "admin_id 不能为空", { min: 1 })];
    this.created_time = [new Rule("isLength", "文章创建时间 created_time 不能为空", { min: 1 })];
  }
}

module.exports = {CreateArticleValidator}