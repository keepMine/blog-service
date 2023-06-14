const { Rule, LinValidator } = require('@core/lin-validator')
const { Category } = require('@models/category')

class CreateCategoryValidator extends LinValidator {
  constructor() {
    super()
    this.name = [new Rule("isLength", "分类 name 不能为空", { min: 1 })];
  }
}

module.exports = {CreateCategoryValidator}