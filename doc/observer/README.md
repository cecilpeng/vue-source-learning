## 响应式原理

### 背景由来

Web 开发，是一种 GUI 编程，常用的编程范式是事件驱动编程，即围绕事件编写程序逻辑。

当时，jQuery 作为一个简洁而快速的 js 基础库，提供了多端统一的 API，简化了事件处理的逻辑。即使到现在，依然有一些老项目在使用。其中，js 控制 dom、css 的代码混杂，不易阅读，弥漫着面向过程编程的味道。

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
  $span.html(++count)
})
```

为了避免大量繁琐的 js 操作，模板引擎不断涌现，如 [jQuery-tmpl](https://github.com/BorisMoore/jquery-tmpl)、[handlebars](https://github.com/handlebars-lang/handlebars.js)、[artTemplate](https://github.com/aui/art-template)，使用模板字符串+动态数据得到要渲染的 HTML，极大地精简了代码，也在大多数浏览器上有更好的性能（Dom 操作次数更少）。这便是数据驱动编程的初级版本。

jquery-tmpl

```javascript
var count = 0
$('#counterBtn').on('click', function (e) {
  var $counter = $('#counter')
  $counter.html(
    $.tmpl('<span>{{= count}}</span>', {
      count: count,
    })
  )
})
```

而后，AngularJs （scope）引入双向数据绑定，采用脏检查机制（UI 事件、$http、$timeout/\$interval 等内置 API 触发），让越来越多的 web 开发者意识到，数据驱动编程极大地提升了编码效率，并且倒逼了 js 的发展。 随着 ES5 的普及，js 原生支持了数据劫持，React（state）/ Vue（data）进一步推进了数据驱动编程，分离数据模型和视图，让 web 开发者前期更专注于设计数据模型。

AngularJS

```html
<div ng-controller="ctrl">
  <span>{{counter}}</span>
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
  <span>{{counter}}</span>
</div>
```

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

数据驱动编程，对于控制复杂度发挥了极大作用，其核心原因是——数据模型抽象，元数据之间互相独立，具有灵活组合的能力，结构性变化少；程序逻辑具象，个体差异化较多，基于数据的规则呈指数级，适应性变化多。

### MVP 功能描述

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
