const qiniu = require('qiniu')
const ACCESS_KEY = 'kTW0neELchXfjbW1LxLBaHai8rIrI_4mrqgrxk2N';
const SECRET_KEY = 'uPKSl3TU9wotG6t3IVag8wRXZ0RvVS6r-QfpZBDk';
const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);


const { Auth } = require('@middlewares/auth');
const AUTH_ADMIN = 16;

const { Resolve } = require('@lib/helper');
const res = new Resolve();

const Router = require('koa-router')

const router = new Router({
    prefix: '/api/v1'
})

// 创建上传token
router.post('/upload/token', new Auth(AUTH_ADMIN).verifyToken, async (ctx) => {
  const options = {
      scope: 'wlj-pic-v1',
      expires: 7200
  };
  const putPolicy = new qiniu.rs.PutPolicy(options);
  ctx.response.status = 200;
  const data = {
      token: putPolicy.uploadToken(mac)
  }
  ctx.body = res.json(data)
})

module.exports = router