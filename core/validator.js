const validator  = require("validator");
const {ParameterException}  = require("./http-exception");
const {get,last} = require("lodash")
class LinValidator {
  constructor() {
    this.data = {}
    this.parsed = {}
  }

    // 组装参数
  _assembleAllParams() {
    return {
      body: ctx.request.body,
      query:ctx.request.query,
      header: ctx.request.header,
      path: ctx.params // 由koa-router提供的将路径中的键值对存储到ctx.params上
    }
  }

  // 从对象中解析指定路径的value,嵌套结构
  get(path, parsed = true) {
    if(parsed) {
      // lodash的 get方法获取this.parsed中path路径的value值 null为默认值
      const value = get(this.parsed, path, null)
      if(value === null) {
        const keys = path.split(".")
        // 获取数组最后一个
        const key = last(keys)
        // 该属性不存在于解析后的配置对象中，需要从默认配置对象 this.parsed.default 中获取该属性的值
        return get(this.parsed.default, key)
      }
      return value
    }else {
      return get(this.data, path)
    }
  }
  // 过滤对象的属性
  _findMembersFilter(key) {
    if(/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    if(key instanceof Array) {
      key.forEach(item => {
        const isRuleType = item instanceof Rule
        if(!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })
    }
    return false
  }
  async validate(ctx, alias = {}) {
    this.alias = alias
    let params = this._assembleAllParams(ctx)
    this.data = cloneDeep(params)
    this.parsed = cloneDeep(params)

    const memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this)
    })

    const errorMsgs = []
    // const map = new Map(memberKeys)
    for (let key of memberKeys) {
      const result = await this._check(key, alias)
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }
    if (errorMsgs.length != 0) {
      throw new ParameterException(errorMsgs)
    }
    ctx.v = this
    return this
  }
  async _check(key, alias = {}) {
    const isCustomFunc = typeof (this[key]) == 'function' ? true : false
    let result;
    if (isCustomFunc) {
      try {
        await this[key](this.data)
        result = new RuleResult(true)
      } catch (error) {
        result = new RuleResult(false, error.msg || error.message || '参数错误')
      }
      // 函数验证
    } else {
      // 属性验证, 数组，内有一组Rule
      const rules = this[key]
      const ruleField = new RuleField(rules)
      // 别名替换
      key = alias[key] ? alias[key] : key
      const param = this._findParam(key)

      result = ruleField.validate(param.value)

      if (result.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值
        if (param.path.length == 0) {
          set(this.parsed, ['default', key], result.legalValue)
        } else {
          set(this.parsed, param.path, result.legalValue)
        }
      }
    }
    if (!result.pass) {
      const msg = `${isCustomFunc ? '' : key}${result.msg}`
      return {
        msg: msg,
        success: false
      }
    }
    return {
      msg: 'ok',
      success: true
    }
  }
  _findParam(key) {
    let value
    value = get(this.data, ['query', key])
    if (value) {
      return {
        value,
        path: ['query', key]
      }
    }
    value = get(this.data, ['body', key])
    if (value) {
      return {
        value,
        path: ['body', key]
      }
    }
    value = get(this.data, ['path', key])
    if (value) {
      return {
        value,
        path: ['path', key]
      }
    }
    value = get(this.data, ['header', key])
    if (value) {
      return {
        value,
        path: ['header', key]
      }
    }
    return {
      value: null,
      path: []
    }
  }

}

// 定义类
class RuleResult {
  constructor(pass, msg='') {
    Object.assign(this, {
      pass,
      msg
    })
  }
}

class RuleFieldResult extends RuleResult {
  constructor(pass, msg = '', legalValue = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}

class Rule {
  constructor(name, msg, ...params) {
    Object.assign(this, {
      name, msg, params
    })
  }
  validate() {
    if (this.name == 'isOptional') return new RuleResult(true)
    if (!validator[this.name](field + '', ...this.params)) {
      return new RuleResult(false, this.msg || this.message || '参数错误')
    }
    return new RuleResult(true, '')
  }
}

class RuleField {
  constructor(rules) {
    this.rules = rules
  }

  validate(field) {
    if (field == null) {
      // 如果字段为空
      const allowEmpty = this._allowEmpty()
      const defaultValue = this._hasDefault()
      if (allowEmpty) {
        return new RuleFieldResult(true, '', defaultValue)
      } else {
        return new RuleFieldResult(false, '字段是必填参数')
      }
    }

    const filedResult = new RuleFieldResult(false)
    for (let rule of this.rules) {
      let result = rule.validate(field)
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }
    return new RuleFieldResult(true, '', this._convert(field))
  }

  _convert(value) {
    for (let rule of this.rules) {
      if (rule.name == 'isInt') {
        return parseInt(value)
      }
      if (rule.name == 'isFloat') {
        return parseFloat(value)
      }
      if (rule.name == 'isBoolean') {
        return value ? true : false
      }
    }
    return value
  }

  _allowEmpty() {
    for (let rule of this.rules) {
      if (rule.name == 'isOptional') {
        return true
      }
    }
    return false
  }

  _hasDefault() {
    for (let rule of this.rules) {
      const defaultValue = rule.params[0]
      if (rule.name == 'isOptional') {
        return defaultValue
      }
    }
  }
}

module.exports = {
  Rule,
  LinValidator
}