const Router = require('koa-router');

const { Auth } = require('@middlewares/auth');
const { CategoryDao } = require('@dao/category')
const { Resolve } = require('@lib/helper');
const { CreateCategoryValidator, PositiveIdParamsValidator } = require('@validators/category')
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
// 创建
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
// 
router.put('/update/:id', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  const v = await new PositiveIdParamsValidator().validate(ctx);
  const id = v.get('path.id');
  [error, data] = await CategoryDao.update(id,v)
  if(!error) { 
    ctx.response.status = 200
    ctx.body = res.success('更新分类成功');
  }else {
    ctx.body = res.fail(error, error.msg)
  }
})
router.delete('/delete/:id', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {

  // 通过验证器校验参数是否通过
  const v = await new PositiveIdParamsValidator().validate(ctx);

  // 获取分类ID参数
  const id = v.get('path.id');
  // 删除分类
  const [err, data] = await CategoryDao.destroy(id);
  if (!err) {
    ctx.response.status = 200;
    ctx.body = res.success('删除分类成功');
  } else {
    ctx.body = res.fail(err);
  }
})
module.exports = router