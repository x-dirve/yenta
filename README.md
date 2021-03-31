Taro componentDidCatch 问题暴力修复模块
=================

@tarojs/runtime 在实现 `page` 的包裹函数时使用了 `componentDidCatch` ，但没有将捕获的错误信息传递给开发者。这导致在业务页面中使用 `componentDidCatch` 将捕获不到错误信息，导致类似 `sentry` 的异常捕获功能异常。由于官方不打算修复这个问题，因此提的 pr 没有被合并，暂时只能使用一些非常规的手段处理。

后续如果官方修复则可在编译配置文件中将该模块去除。