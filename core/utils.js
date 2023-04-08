const JWT  = require("jsonwebtoken");

// 颁布令牌
const generateToken = function (uid, scope) {
  const secretKey = global.config.security.secretKey;
  const expiresIn = global.config.security.expiresIn;
  const token = JWT.sign({
    uid,
    scope
  }, secretKey, {
    expiresIn: expiresIn
  })
  return token
}

// 该函数  return  _find(instance)首先调用_find（）方法
const findMembers = function (instance, {
  prefix,
  specifiedType,
  filter
}) {
  // 递归函数 查找当前传入的instance实例对象原型链上所有的属性 返回为一个数组
  function _find(instance) {
    //基线条件（跳出递归）如果传入的实例对象 的原型链 原型对象为 null 终止递归
    if (instance.__proto__ === null)
      return []
    // Reflect.ownKeys 返回一个给定对象的所有属性键组成的数组 Reflect.ownKeys方法可以返回对象中的方法名，但是需要注意对象的原型链上的方法只会返回可枚举的方法
    // 这是因为Reflect.ownKeys方法仅返回自身的属性键，不包括继承的属性键。
    let names = Reflect.ownKeys(instance)
    names = names.filter((name) => {
      // 过滤掉不满足条件的属性或方法名 _shouldKeep使用传入的 filter 属性该属性为一个函数
      return _shouldKeep(name)
    })

    return [...names, ..._find(instance.__proto__)]
  }

  // 判断如果传入了 filter 则为传入的value 执行filter方法
  function _shouldKeep(value) {
    if (filter) {
      if (filter(value)) {
        return true
      }
    }
    // 筛选出 挂载了 统一前缀的 属性
    if (prefix) {
      if (value.startsWith(prefix)) {
        return true
      }
    }
     
      // 筛选当前 instance 身上的 继承自  specifiedType 的
    if (specifiedType) {
      if (instance[value] instanceof specifiedType) {
        return true
      }
    }
      
       
  }

  return _find(instance)
}
module.exports = {
  generateToken,
  findMembers
}