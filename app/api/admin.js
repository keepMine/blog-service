/**
* @description 管理人员路由接口 
 */

const Router  = require("koa-router");

const {RegisterValidator, AdminLoginValidator}  = require("@validators/admin");

const {AdminDao}  = require("@dao/admin");

const {Auth}  = require("@middlewares/auth");

const {LoginManager}  = require("@service/login");

const {Resolve}  = require("@lib/helper");

const res = new Resolve();


const AUTH_ADMIN = 16;

// 设置请求url base路径
const router = new Router({
  prefix: '/api/v1/admin'
})

/**
* 管理员注册
 */
router.post('/register', async (ctx) => {
  // 通过验证器校验参数是否通过  v 为 new RegisterValidator() 的实例对象 this
  const v = await new RegisterValidator().validate(ctx)
  // 上面的验证如果没有抛出错误则进行数据创建，否则终止
  // 创建管理员
  const [err,data] = await AdminDao.create({
    email: v.get('body.email'),
     password: v.get('body.password2'),
      nickname: v.get('body.nickname'),
   })
   // 成功则返回结果
   if(!err) {
    ctx.response.status = 200
      ctx.body = res.json(data)
   }else {
    ctx.body = res.fail(err)
   }
})

/**
* 管理员登陆
 */
router.post('/login', new Auth().loginVerifyToken, async (ctx) => {
  const v = await new AdminLoginValidator().validate(ctx)
  const [err, token] = await LoginManager.adminLogin({
    email: v.get('body.email'),
     password: v.get('body.password'),
     ctx
  })
  if(!err) {
    ctx.response.status = 200
      ctx.body = res.json({token})
   }else {
    ctx.body = res.fail(err)
   }
})

/**
*  鉴权 查询用户信息
 */
router.get('/auth', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  // 获取用户id
  const id = ctx.auth.uid

  // 查询用户信息
  const [err, data] = await AdminDao.detail(id)
  if(!err) {
    ctx.response.status = 200
      ctx.body = res.json(data)
   }else {
    ctx.body = res.fail(err)
   }
})

module.exports = router