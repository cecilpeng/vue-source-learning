# vue-source-learning

学习和分析 vue 源码，总结 vue 的核心内容和思想。然后，通过测试驱动开发的实践方式，呈现给大家更简单和完整的 vue。

## 用户定位

所写笔记有一定难度，适合熟悉 vue 开发及具备一定程序设计能力的开发者。如果你是一个新手，建议先仔细阅读 [vue 官方文档](https://cn.vuejs.org/v2/guide/)，了解基础知识。

我喜欢代码简洁易懂，喜欢研究编程范式和设计模式，所以会给大家梳理源码遵从的设想思想，并试着改造源码的部分实现。在 doc 目录你可以找到我的分析， core 目录中你可以找到改造的代码。如果有什么疑问，可以向我提 issue，一起交流。

## 学习路径

第一阶段，主要学习 vue 的核心内容，对应 vue 源码 src/core 目录，包含：

1. [响应式原理](doc/observer/README.md) —— observer
2. 组件体系 —— instance
3. 虚拟 Dom —— vdom

第二阶段，主要学习 vue 的重要扩展内容，对应 vue 源码 src/{compiler|server}，包含：

1. 模板引擎 —— compiler
2. 服务端渲染 —— server
3. 单一文件组件 —— sfc

第三阶段，主要学习 vue 的生态支持内容，TODO
