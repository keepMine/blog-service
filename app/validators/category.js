const { Rule, LinValidator } = require('@core/lin-validator')
const { Category } = require('@models/category')

class CreateCategoryValidator extends LinValidator {
  constructor() {
    super()
    this.name = [new Rule("isLength", "分类 name 不能为空", { min: 1 })];
  }
}
class PositiveIdParamsValidator extends LinValidator {
  constructor() {
    super()
    this.id = [
      new Rule('isInt', '分类ID需要正整数', { min: 1 })
    ]
  }
}

module.exports = {CreateCategoryValidator, PositiveIdParamsValidator}