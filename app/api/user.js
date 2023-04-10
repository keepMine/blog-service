/**
* @description 用户模块接口
 */

const Router = require('koa-router')

const { RegisterValidator, LoginValidator } = require('@validators/user')

const { UserDao } = require('@dao/user')

const { Auth } = require('@middlewares/auth')

const { LoginManager } = require('@service/login')

const { Resolve } = require('@lib/helper')

const res = new Resolve()

const router = new Router({
  prefix: '/api/v1/user'
})

router.post('/register', async (ctx) => {
  const v = await new RegisterValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password2')
  const [err, data] = await UserDao.create({
    email, 
    password,
    username: v.get('body.username'),
  })
  if(!err) {
    // 注册完自动登录
    const [errLogin, token, id] = await LoginManager.userLogin({
      email, 
      password,
    })
    if(!errLogin) {
      data.token = token
      data.id = id
    }
    ctx.response.status = 200
    ctx.body = res.json(data)
  }else{
    ctx.body = res.fail(data)
  }
})

router.post('/login', new Auth().loginVerifyToken, async (ctx) => {
  const v = await new LoginValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password')
  const [errLogin, token, id] = await LoginManager.userLogin({
    email, 
    password,
    ctx
  })
  if(!errLogin) {
    const [err, user] = await UserDao.detail(id)
    if(!err) {
      user.setDataValue('token', token)
      ctx.response.status = 200
      ctx.body = res.json(user)
    }
  }else {
    ctx.body = res.fail(errLogin)
  }

})

module.exports = router