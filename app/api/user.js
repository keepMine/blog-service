/**
* @description 用户模块接口
 */

const Router = require('koa-router')

const { RegisterValidator, LoginValidator, PositiveIdParamsValidator, UpdateParamsValidator } = require('@validators/user')

const { UserDao } = require('@dao/user')

const { Auth } = require('@middlewares/auth')

const { LoginManager } = require('@service/login')

const { Resolve } = require('@lib/helper')

const res = new Resolve()

const router = new Router({
  prefix: '/api/v1/user'
})

// 注册
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
      ctx
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

// 登陆
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

// 鉴权
router.get('/auth', new Auth().verifyToken, async (ctx) => {
  const id = ctx.auth.uid
  const [err, user] = await UserDao.detail(id, 1)
  if(!err) {
    ctx.response.status = 200
    ctx.body = res.json(user)
  }else {
    ctx.response.status = 401
    ctx.body = res.fail(err, err.msg)
  }
})

// 获取用户list
router.post('/list', new Auth().verifyToken, async (ctx) => {
  const [err, data] = await UserDao.list(ctx.request.body)
  if(!err) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  }else {
    ctx.body = res.fail(err, err.msg)
  }
})

// 获取用户详情
router.get('/detail/:id', new Auth().verifyToken, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const {id} = ctx.params
  // const id = v.get('path.id')
  const [err, user] = await UserDao.detail(id)
  if(!err) {
    ctx.response.status = 200 
    ctx.body = res.json(user)
  }else {
    ctx.body = res.fail(err, err.msg)
  }
})
 
// 删除用户
router.delete('/delete/:id', new Auth().verifyToken, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, user] = await UserDao.destroy(id)
  if(!err) {
    ctx.response.status = 200
    ctx.body = res.success('删除用户成功')
  }else {
    ctx.body = res.fail(err, err.msg)
  }
})
// 更新用户
router.put('/update/:id', new Auth().verifyToken, async (ctx) => {
  const v = await new UpdateParamsValidator().validate(ctx)
  const id = v.get('body.id')
  const [err, user] = await UserDao.update(id, v)
  if(!err) {
    ctx.response.status = 200
    ctx.body = res.json(user)
  }else {
    ctx.body = res.fail(err, err.msg)
  }
})
module.exports = router