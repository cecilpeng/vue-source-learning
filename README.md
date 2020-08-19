# vue-source-learning

学习，分析和总结 vue 源代码的思想，然后深入进行程序设计，测试驱动开发和动手实践

## 学习路径

1. 数据响应式
2. 组件体系
3. 模板编译
4. 其他

### 数据响应式

#### 分析

vue 源码实现响应式的核心逻辑：

数据劫持=>依赖收集=>观察订阅=>响应变化=>异步队列=>更新渲染

其中最主要的部分是 数据劫持、依赖收集、观察订阅，我们重点学习和分析。

UML 类图：

![类图](doc/uml/observer/source-class.jpg?raw=true)

TODO 分析

UML 时序图：

![时序图](doc/uml/observer/source-sequence.png?raw=true)

#### 动手实践

源码读起来有些晦涩，代码耦合性较高，因此，我决定重写一份 observer，大家可以仔细阅读 core/observer，对比分析一下可读性。

TODO 分析
