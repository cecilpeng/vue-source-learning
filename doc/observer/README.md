## 响应式原理

### 背景由来

Web 开发，是一种 GUI 编程，常用的编程范式是事件驱动编程，即围绕事件编写程序逻辑。经过 20 多年的发展，Web 应用越来越复杂，也逐步发展成为数据驱动编程，即围绕数据编写程序逻辑。数据驱动编程，实际上借鉴了面向对象编程的思想，来管理数据与事件之间的关系。类比来看，事件关联方法，数据对应属性。属性独立，结构性变化少，具有稳定性；方法多态，是属性变化的映射，具有灵活性。这种映射关系，是属性变化的组合，是符合自然规律的内在特征外化的表现方式。完整的数据模型，必然导向逻辑简洁而健壮。具体来说，在 Web 开发中，我们围绕 ViewModel 编程，会把数据分为基础数据和状态数据，基础数据用于展示，状态数据用于控制，从而形成了数据到视图的映射。

我们简单回顾一下演变历程。

当时，jQuery 作为一个简洁而快速的 js 基础库，提供了多端统一的 API，简化了事件处理的逻辑。即使到现在，依然有一些老项目在使用。但是，js 控制 dom、css 的代码混杂，不易阅读，弥漫着面向过程编程的味道。

JQuery

```javascript
var count = 0
$('#counterBtn').on('click', function (e) {
  var $counter = $('#counter')
  var $span = $counter.children('span')
  if (!$span.length) {
    $span = $('span')
    $counter.append($span)
  }
  $span.html(++count).css({
    color: count > 10 ? 'red' : 'green',
  })
})
```

为了避免大量繁琐的 js 操作，模板引擎不断涌现，如 [jQuery-tmpl](https://github.com/BorisMoore/jquery-tmpl)、[handlebars](https://github.com/handlebars-lang/handlebars.js)、[artTemplate](https://github.com/aui/art-template)，使用模板字符串+动态数据得到要渲染的 HTML，极大地精简了代码，也在大多数浏览器上有更好的性能（Dom 操作次数更少）。这便是数据驱动编程的初级版本。

jquery-tmpl

```javascript
var count = 0
$('#counterBtn').on('click', function (e) {
  var $counter = $('#counter')
  $counter.html(
    $.tmpl(
      '<span style="color: {{= ++count > 10 ? "red" : "green"}}">{{= count}}</span>',
      {
        count: count,
      }
    )
  )
})
```

AngularJs （scope）引入双向数据绑定，采用脏检查机制（UI 事件、$http、$timeout/\$interval 等内置 API 触发），让越来越多的 web 开发者意识到，数据驱动编程极大地提升了编码效率，并且倒逼了 js 的发展。此时，数据驱动编程已经成为一种主流，美中不足的是性能不佳（数量庞大的 Dom 结构页面容易卡顿），这关系到虚拟 Dom 技术（TODO）。

AngularJS

```html
<div ng-controller="ctrl">
  <span ng-style="{ color: count > 10 ? 'red' : 'green' }">{{counter}}</span>
</div>
```

```javascript
angular.controller('ctrl', function ($scope) {
  $scope.count = 0
  $scope.increment = function () {
    $scope.count++
  }
})
```

```html
<div id="counter">
  <span :style="{ color: count > 10 ? 'red' : 'green' }">{{counter}}</span>
</div>
```

随着 ES5 的普及，js 原生支持了数据劫持，Vue（data）进一步推进了数据驱动编程，分离数据模型和视图，让 web 开发者前期更专注于设计数据模型。接着，ES6 的发展又带来了 Proxy、Reflect，也进一步推动了 Vue2.0 向 Vue3.0 的演变。

Vue

```javascript
var vm = new Vue({
  el: '#counter',
  data() {
    return {
      count: 0,
    }
  },
  methods: {
    increment: function () {
      this.count++
    },
  },
})
```

### 功能描述

我们需要实现这样一个功能：

数据与程序逻辑分离，具体来说，是实现**数据变更时，使用数据的地方可以同步变化**。在 vue 体系下，具体还包含

### 程序设计

1. 数据劫持 - 数据变更消息
2. 订阅观察模式 - 将变更通知给使用数据的地方，同步变化

### 代码分解

### 分析

vue 源码实现响应式的核心逻辑：

数据劫持=>依赖收集=>观察订阅=>响应变化=>异步队列=>更新渲染

其中最主要的部分是 数据劫持、依赖收集、观察订阅，我们重点学习和分析。

UML 类图：

![类图](uml/class.jpg?raw=true)

TODO 分析

UML 时序图：

![时序图](uml/sequence.png?raw=true)

### 动手实践

源码读起来有些晦涩，代码耦合性较高，因此，我决定重写一份 observer，大家可以仔细阅读 core/observer，对比分析一下可读性。

TODO 分析
