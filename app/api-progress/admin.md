### 梳理admin接口从客户端发起调用到返回数据的链路

####  以 /register 管理员注册为例

1、在` app/api/admin` 中触发 `/register` 接口
2、`new RegisterValidator().validate(ctx)` 校为校验参数方法，返回值为当前实例对象 this 
  `validate` 方法触发的是 `RegisterValidator` 继承自 `LinValidator` 身上的方法`validate` 
  `RegisterValidator` 类的作用为 为 注册接口进行参数校验，具体为 给当前实例挂载 需要校验的属性和方法
4、`@core/lin-validator` 中的 `LinValidator` 作用主要是 `validate` 方法，通过方法获取了当前需要验证的实例身上以及原型链上的所有 属性和方法并且由他们的 `key` 组成 `memberKeys` 数组 ，然后遍历该数组 为每一项执行 `_check 方法` 该方法找到传入的 `key` 对应的属性和方法 并分别进行验证 ，具体为对方法进行了执行 并且通过 `try/catch` 捕获错误。对属性则使用 《〈`validate` 》〉 包的方法进行验证。
5、 最终通过判断  `_check `返回的结果 进行下一步处理。