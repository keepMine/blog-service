const Router = require('koa-router');

const { Auth } = require('@middlewares/auth');
const { ArticleDao } = require('@dao/article')
const { CreateArticleValidator } = require('@validators/article')
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
module.exports = router