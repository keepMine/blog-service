# blog-service
一个node+koa搭建的博客服务端

### 2.2.项目架构


```iterm2
.
├── app *重点, 项目工程入口
    ├── api 接口
    ├── api-progress 接口链路梳理
    ├── dao 数据存取对象（Data Access Objects）
    ├── lib 工具库
    ├── models 建模，把业务逻辑映射成数据模型
    ├── service 数据处理
    └── validators 数据验证
├── app.js 入口文件
├── config 配置文件
├── core 核心公共工具库
    ├── db 创建数据库表以及根据app/models 中的数据模型创建数据表
    ├── http-exception 定义各种错误的公共类
    ├── init 项目的初始化文件，主要是将 config配置、 http-exception中error错误类挂载到global上，以及 路由的自动注册
    ├── lin-validator 定义数据验证的公共基础类
    ├── utils 提供了两个方法 颁发令牌 以及递归查询当前实例原型链上的属性和方法
├── doc 接口文档
├── middlewares 中间件
    ├── auth 权限token校验
    ├── exception 捕获任何抛出的错误
├── package-lock.json
├── package.json
├── .prettierrc 代码格式化
└── yarn.lock
```