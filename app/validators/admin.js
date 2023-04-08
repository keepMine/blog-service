const { Rule, LinValidator } = require('@core/lin-validator')

const { Admin } = require('@models/admin')

// 注册验证类上的属性和方法都会在继承的 LinValidator 上的 validate方法中被验证具体在check中对方法和属性分开验证
class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.email = [new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')]
    this.password1 = [
      // 用户密码指定范围
      new Rule('isLength', '密码至少6个字符，最多22个字符', {
        min: 6,
        max: 22,
      }),
      new Rule(
        'matches',
        '密码长度必须在6~22位之间，包含字符、数字和 _ ',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
      ),
    ]
    this.password2 = this.password1
    this.nickname = [
      new Rule('isLength', '昵称长度必须在2~16之间', {
        min: 2,
        max: 16,
      }),
    ]
  }
  // 入参 vals 为this.data
  validatePassword(vals) {
    const psw1 = vals.body.password1
    const psw2 = vals.body.password2
    if (psw1 !== psw2) {
      throw new Error('两次输入的密码不一致，请重新输入')
    }
  }

  async validateEmail(vals) {
    const email = vals.body.email
    // 通过findOne方法查询数据
    const admin = await Admin.findOne({
      where: {
        email: email,
      },
    })
    if (admin) {
      throw new Error('邮箱已被注册，请重新输入邮箱')
    }
  }
}

class AdminLoginValidator extends LinValidator {
  constructor() {
    super()
    this.email = [new Rule('isEmail', '电子邮箱不符合规范，请输入正确的邮箱')]
    this.password = [
      // 用户密码指定范围
      new Rule('isLength', '密码至少6个字符，最多22个字符', {
        min: 6,
        max: 22,
      }),
      new Rule(
        'matches',
        '密码长度必须在6~22位之间，包含字符、数字和 _ ',
        '^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]'
      ),
    ]
  }
}

class TokenNotEmptyValidator extends LinValidator {
  constructor() {
    super()
    this.token = [new Rule('isLength', '不允许为空', { min: 1 })]
  }
}

module.exports = {
  RegisterValidator,
  AdminLoginValidator,
  TokenNotEmptyValidator,
}
