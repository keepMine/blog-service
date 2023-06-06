const validator = require('validator')
const { ParameterException } = require('./http-exception')
const { get, last, cloneDeep, set } = require('lodash')
const { findMembers } = require('@core/utils')

/**
 * 该类主要作用为为当前this身上挂在组装的数据，以及验证当前this身上的属性和方法
 */
class LinValidator {
  constructor() {
    this.data = {}
    this.parsed = {}
  }

  // 组装参数
  _assembleAllParams(ctx) {
    return {
      body: ctx.request.body,
      query: ctx.request.query,
      header: ctx.request.header,
      path: ctx.params, // 由koa-router提供的将路径中的键值对存储到ctx.params上
    }
  }

  // 从对象中解析指定路径的value,嵌套结构
  get(path, parsed = true) {
    if (parsed) {
      // lodash的 get方法获取this.parsed中path路径的value值 null为默认值
      const value = get(this.parsed, path, null)
      if (value === null) {
        const keys = path.split('.')
        // 获取数组最后一个
        const key = last(keys)
        // 该属性不存在于解析后的配置对象中，需要从默认配置对象 this.parsed.default 中获取该属性的值
        return get(this.parsed.default, key)
      }
      return value
    } else {
      return get(this.data, path)
    }
  }
  // 过滤对象的属性
  _findMembersFilter(key) {
    // 验证key 为 validate支持的校验键
    if (/validate([A-Z])\w+/g.test(key)) {
      return true
    }
    // 如果this上的key为一个数组 需要验证 他全部继承自 Rule 类
    if (this[key] instanceof Array) {
      this[key].forEach((item) => {
        const isRuleType = item instanceof Rule
        if (!isRuleType) {
          throw new Error('验证数组必须全部为Rule类型')
        }
      })
      return true
    }
    return false
  }
  async validate(ctx, alias = {}) {
    this.alias = alias
    // 通过_assembleAllParams组装ctx中的参数
    let params = this._assembleAllParams(ctx)
    // 通过cloneDeep方法深拷贝 params
    this.data = cloneDeep(params)
    this.parsed = cloneDeep(params)
    // 这里调用了 findMembers 方法 该递归方法的作用为返回一个子项为this实例的原型链上符合_findMembersFilter条件的属性的数组
    const memberKeys = findMembers(this, {
      filter: this._findMembersFilter.bind(this),
    })

    const errorMsgs = []
    // for...of语句用于遍历可迭代对象 key 为该对象的值
    for (let key of memberKeys) {
      //
      const result = await this._check(key, alias)
      if (!result.success) {
        errorMsgs.push(result.msg)
      }
    }
    // 这里上面通过对 memberKeys 身上的属性和方法都经过验证 如果有验证未通过的都将 错误信息push进 errorMsgs 通过验证最终的errorMsgs的length
    // 如果有则 throw 一个 参数错误的信息中断接口进行
    if (errorMsgs.length != 0) {
      throw new ParameterException(errorMsgs)
    }
    // 否则则将当前实例的this返回进行下一步创建数据库这条数据
    ctx.v = this
    return this
  }
  // 该方法为验证当前this自身以及原型链上所有的属性和方法 属性通过 validate 包提供的方法验证， 方法直接传入数据调用
  async _check(key, alias = {}) {
    // 判断 memberKeys子项是否为 函数 这个方法的作用为执行 RegisterValidator 类上定义的校验函数
    const isCustomFunc = typeof this[key] == 'function' ? true : false
    let result
    // 如果为校验函数 通过 try/catch 捕获函数是否抛出错误，没有则验证通过 result为 {pass: true, msg: ''}
    if (isCustomFunc) {
      try {
        // 执行 memberKeys中的 校验函数 如果未抛出错误 result 结果为 pass 为true 通过
        await this[key](this.data)
        result = new RuleResult(true)
      } catch (error) {
        // 如果校验函数抛出了错误   result 结果为 pass 为false 不通过
        result = new RuleResult(false, error.msg || error.message || '参数错误')
      }
    } else {
      // 这里验证this身上的属性，并且通过_findMembersFilter过滤的只为Rule类的实例的属性
      // 属性验证, 数组，内有一组Rule
      const rules = this[key]
      //  ruleField 为RuleField类的实例传入设置的验证数组
      const ruleField = new RuleField(rules)
      // 别名替换
      key = alias[key] ? alias[key] : key
      // 查找当前key在组装的接口调用的参数中的value值，也就是用户输入的信息 返回是一个对象包含了 value值和path路径
      const param = this._findParam(key)
      // 为该值执行RuleField类上的 validate方法返回值为 RuleFieldResult类的实例 包含了 {pass, msg, value}
      result = ruleField.validate(param.value)
      if (result.pass) {
        // 如果参数路径不存在，往往是因为用户传了空值，而又设置了默认值 默认值由 _hasDefault 方法拿到  前提为 _allowEmpty 为 true
        if (param.path.length == 0) {
          set(this.parsed, ['default', key], result.legalValue)
        } else {
          set(this.parsed, param.path, result.legalValue)
        }
      }
    }
    // 如果结果的 pass为false 接口调用不通过
    if (!result.pass) {
      const msg = `${isCustomFunc ? '' : key}${result.msg}`
      return {
        msg: msg,
        success: false,
      }
    }
    return {
      msg: 'ok',
      success: true,
    }
  }
  // 作用为 在 this.data中查找key所在的value值并返回
  _findParam(key) {
    let value
    value = get(this.data, ['query', key])
    if (value) {
      return {
        value,
        path: ['query', key],
      }
    }
    value = get(this.data, ['body', key])
    if (value) {
      return {
        value,
        path: ['body', key],
      }
    }
    value = get(this.data, ['path', key])
    if (value) {
      return {
        value,
        path: ['path', key],
      }
    }
    value = get(this.data, ['header', key])
    if (value) {
      return {
        value,
        path: ['header', key],
      }
    }
    return {
      value: null,
      path: [],
    }
  }
}

/**
 * @des 作用为 创建一个 拥有 pass 和 msg的结果类
 */
class RuleResult {
  constructor(pass, msg = '') {
    Object.assign(this, {
      pass,
      msg,
    })
  }
}
/**
 * @des 作用为创建携带 value值的结果类
 */
class RuleFieldResult extends RuleResult {
  constructor(pass, msg = '', legalValue = null) {
    super(pass, msg)
    this.legalValue = legalValue
  }
}
/**
 * @des 作用为创建提交参数的验证数组
 */
class Rule {
  constructor(name, msg, ...params) {
    Object.assign(this, {
      name,
      msg,
      params,
    })
  }
  validate(field) {
    if (this.name == 'isOptional') return new RuleResult(true)
    // 使用 validator包校验 如果返回为 false 则 不通过
    if (!validator[this.name](field + '', ...this.params)) {
      return new RuleResult(false, this.msg || this.message || '参数错误')
    }
    return new RuleResult(true, '')
  }
}

/**
 * @des 作用为 对需要验证的属性的验证数组进行验证并返回 RuleFieldResult类的实例
 */
class RuleField {
  constructor(rules) {
    this.rules = rules
  }

  validate(field) {
    // 如果值为null
    if (field == null) {
      // 如果字段为空
      const allowEmpty = this._allowEmpty()
      const defaultValue = this._hasDefault()
      // 如果rules的name为isOptional 则允许为空
      if (allowEmpty) {
        return new RuleFieldResult(true, '', defaultValue)
      } else {
        return new RuleFieldResult(false, '字段是必填参数')
      }
    }
    // 如果不为空
    const filedResult = new RuleFieldResult(false)
    for (let rule of this.rules) {
      // 执行 Rule类上的validate方法
      let result = rule.validate(field)
      // 如果不通过 设置 filedResult
      if (!result.pass) {
        filedResult.msg = result.msg
        filedResult.legalValue = null
        // 一旦一条校验规则不通过，则立即终止这个字段的验证
        return filedResult
      }
    }
    // 如果都通过 则
    return new RuleFieldResult(true, '', this._convert(field))
  }

  //  对用户提交的数据的value进行处理 根据验证需要的name的值， 进行转换，便于存入数据库符合的数据类型
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
  // 判断是否允许为 空 当验证的name 为isOptional
  _allowEmpty() {
    for (let rule of this.rules) {
      if (rule.name == 'isOptional') {
        return true
      }
    }
    return false
  }
  // 这里查询Rule实例的第三个 params参数的第0项 如果 name 为 isOptional 则返回默认值 defaultValue
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
  LinValidator,
}
