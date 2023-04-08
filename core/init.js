const Router = require('koa-router')
// 递归遍历目录，require导入每个文件
const requireDirectory = require('require-directory')

class InitManager {
  static initCore(app) {
    InitManager.app = app
    InitManager.initLoadRouters()
    InitManager.loadHttpException()
    InitManager.loadConfig()
  }
  // 自动加载注册路由模块
  static initLoadRouters() {
    // 获取绝对路径 process.cwd（)获取当前node执行工作目录
    const apiDirectory = `${process.cwd()}/app/api`

    // 该函数实现的是为require的每个模块调用
    const whenLoadModule = (obj) => {
      // 当导入模块继承自Router 则注册路由
      if (obj instanceof Router) {
        InitManager.app.use(obj.routes())
      }
    }
    // 路由自动加载
    requireDirectory(module, apiDirectory, { visit: whenLoadModule })
  }
  // 将httpError配置文件挂载到global上
  static loadHttpException() {
    const errors = require('./http-exception')
    global.errs = errors
  }
  // 将config配置文件挂载到global上
  static loadConfig(path = '') {
    const configPath = path || `${process.cwd()}/config/index.js`
    const config = require(configPath)
    // 将config绑定到全局对象global上，供其他模块使用
    global.config = config
  }
}
module.exports = InitManager
