const Router = require('koa-router');

const { Auth } = require('@middlewares/auth');
const { ArticleDao } = require('@dao/article')
const { CreateArticleValidator, PositiveIdParamsValidator } = require('@validators/article')
const { Resolve } = require('@lib/helper');

const res = new Resolve();

const {Md} = require('@lib/md')

const AUTH_ADMIN = 16;

const router = new Router({
  prefix: '/api/v1/article'
})
// 获取文章list
router.post('/list', new Auth().verifyToken, async (ctx) => {
  [error, data] = await ArticleDao.list(ctx.request.body)
  if(!error) {
    ctx.response.status = 200
    ctx.body = res.json(data)
  }else {
    ctx.body = res.fail(error, error.msg)
  }
})

// 创建文章
router.post('/create', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  const v = await new CreateArticleValidator().validate(ctx);
  [error, data] = await ArticleDao.create(v)
  if(!error) { 
    ctx.response.status = 200
    ctx.body = res.success('创建文章成功');
  }else {
    ctx.body = res.fail(error, error.msg)
  }
})
/**
 * 删除文章
 */
router.delete('/delete/:id', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {

  // 通过验证器校验参数是否通过
  const v = await new PositiveIdParamsValidator().validate(ctx);

  // 获取文章ID参数
  const id = v.get('path.id');
  // 删除文章
  const [err, data] = await ArticleDao.destroy(id);
  if (!err) {
    ctx.response.status = 200;
    ctx.body = res.success('删除文章成功');
  } else {
    ctx.body = res.fail(err);
  }
})
router.get('/detail/:id', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {

  // 通过验证器校验参数是否通过
  const v = await new PositiveIdParamsValidator().validate(ctx);

  // 获取文章ID参数
  const id = v.get('path.id');
  const [err, data] = await ArticleDao.detail(id);
 
  if (!err) {
    if (ctx.query.is_markdown) {
      data.content = Md.render(data.content)
    }
      // 更新文章浏览
      await ArticleDao.updateBrowse(id, ++data.browse);
    ctx.response.status = 200;
    ctx.body = res.json(data)
  } else {
    ctx.body = res.fail(err);
  }
})
/**
 * 更新文章
 */
router.put('/update/:id', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  // 通过验证器校验参数是否通过
  const v = await new PositiveIdParamsValidator().validate(ctx);

  // 获取文章ID参数
  const id = v.get('path.id');
  // 更新文章
  const [err, data] = await ArticleDao.update(id, v);
  if (!err) {
    ctx.response.status = 200;
    ctx.body = res.success('更新文章成功');
  } else {
    ctx.body = res.fail(err);
  }
})
module.exports = router