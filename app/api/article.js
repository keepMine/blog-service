const Router = require('koa-router');

const { Auth } = require('@middlewares/auth');

const { Resolve } = require('@lib/helper');
const res = new Resolve();

const {Md} = require('@lib/md')

const AUTH_ADMIN = 16;

const router = new Router({
  prefix: '/api/v1'
})