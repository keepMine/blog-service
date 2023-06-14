const Router = require('koa-router');

const { Auth } = require('@middlewares/auth');
const { CategoryDao } = require('@dao/category')
const { Resolve } = require('@lib/helper');
const { CreateCategoryValidator } = require('@validators/category')
const res = new Resolve();

const AUTH_ADMIN = 16;

const router = new Router({
  prefix: '/api/v1/category'
})
// 获取list
router.post('/list', new Auth().verifyToken, async (ctx) => {
  [error, data] = await CategoryDao.list(ctx.request.body)
  if(!error) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  }else {
    ctx.body = res.fail(error, error.msg)
  }
})
// 创建文章
router.post('/create', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  const v = await new CreateCategoryValidator().validate(ctx);
  [error, data] = await CategoryDao.create(v)
  if(!error) { 
    ctx.response.status = 200
    ctx.body = res.success('创建分类成功');
  }else {
    ctx.body = res.fail(error, error.msg)
  }
})
// 获取详情
router.get('/detail/:id', new Auth().verifyToken, async (ctx) => {
  const {id} = ctx.params
  const [err, category] = await CategoryDao.detail(id)
  if(!err) {
    ctx.response.status = 200 
    ctx.body = res.json(category)
  }else {
    ctx.body = res.fail(err, err.msg)
  }
})
module.exports = router