import assert from 'assert'
import sinon from 'sinon'
import Observer from '../../core/observer/observer'
import Subscriber from '../../core/observer/subscriber'

describe('Observer', function () {
  it('create on non-observables', function () {
    // skip primitive value
    assert.throws(() => new Observer(1))
    // avoid frozen objects
    assert.throws(() => new Observer(Object.freeze({})))
    // avoid HTML5 objects
    assert.throws(() => new Observer(document.body.dataset))
  })

  it('create on object', () => {
    // on object
    const obj = {
      a: {},
      b: {},
    }
    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(Observer.getObserver(obj.a), ob1)
    assert.equal(Observer.getObserver(obj.b), ob1)
    assert.equal(ob1.properties.length, 3)
  })

  it('create on null', () => {
    // on null
    const obj = Object.create(null)
    obj.a = {}
    obj.b = {}

    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(Observer.getObserver(obj.a), ob1)
    assert.equal(Observer.getObserver(obj.b), ob1)
    assert.equal(ob1.properties.length, 3)
  })

  it('create on already observed object', () => {
    // on object
    const obj = {}
    let val = 0
    let getCount = 0
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get() {
        getCount++
        return val
      },
      set(v) {
        val = v
      },
    })

    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(ob1.properties.length, 2)

    getCount = 0
    // Each read of 'a' assert result in only one get underlying get call
    obj.a
    assert.equal(getCount, 1)
    obj.a
    assert.equal(getCount, 2)

    // assert return existing ob on already observed objects
    const ob2 = new Observer(obj)
    assert.equal(ob1, ob2)

    // assert call underlying setter
    obj.a = 10
    assert.equal(val, 10)
  })

  it('create on property with only getter', () => {
    // on object
    const obj = {}
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get() {
        return 123
      },
    })

    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(ob1.properties.length, 2)

    // assert be able to read
    assert.equal(obj.a, 123)

    // assert return existing ob on already observed objects
    const ob2 = new Observer(obj)
    assert.equal(ob1, ob2)

    // since there is no setter, you assertn't be able to write to it
    // PhantomJS throws when a property with no setter is set
    // but other real browsers don't
    try {
      obj.a = 101
    } catch (e) {}
    assert.equal(obj.a, 123)
  })

  it('create on property with only setter', () => {
    // on object
    const obj = {}
    let val = 10
    Object.defineProperty(obj, 'a', {
      // eslint-disable-line accessor-pairs
      configurable: true,
      enumerable: true,
      set(v) {
        val = v
      },
    })

    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(ob1.properties.length, 2)

    // reads assert return undefined
    assert.equal(obj.a, undefined)

    // assert return existing ob on already observed objects
    const ob2 = new Observer(obj)
    assert.equal(ob1, ob2)

    // writes assert call the set function
    obj.a = 100
    assert.equal(val, 100)
  })

  it('create on property which is marked not configurable', () => {
    // on object
    const obj = {}
    Object.defineProperty(obj, 'a', {
      configurable: false,
      enumerable: true,
      value: 10,
    })

    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(ob1.properties.length, 1)
  })

  it('create on array', () => {
    // on object
    const arr = [{}, {}]
    const ob1 = new Observer(arr)
    assert.equal(Observer.getObserver(arr), ob1)
    // assert've walked children
    assert.equal(Observer.getObserver(arr[0]), ob1)
    assert.equal(Observer.getObserver(arr[1]), ob1)
  })

  it('create on loop object', () => {
    // on object
    const obj = {
      a: {},
    }
    obj.loop = obj
    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(Observer.getObserver(obj.a), ob1)
    assert.equal(Observer.getObserver(obj.loop), ob1)
    assert.equal(ob1.properties.length, 3)
  })

  it('observing object prop change', () => {
    function D() {}
    D.prototype.value = 1

    const obj = { a: { b: { c: 2 } }, d: NaN, e: new D() }
    const ob1 = new Observer(obj)
    assert.equal(Observer.getObserver(obj), ob1)
    assert.equal(Observer.getObserver(obj.a), ob1)
    assert.equal(Observer.getObserver(obj.a.b), ob1)
    assert.equal(Observer.getObserver(obj.a.b.c), undefined)
    assert.equal(Observer.getObserver(obj.d), undefined)
    assert.equal(Observer.getObserver(obj.e), ob1)
    assert.equal(ob1.properties.length, 6)

    // mock a subscriber
    let val
    const subscriber = new Subscriber(obj, 'a.b.c', (newVal, oldVal) => {
      val = newVal
    })
    assert.equal(subscriber.value, 2)

    obj.a.b.c = 3
    assert.equal(ob1.properties.length, 6)
    assert.equal(subscriber.value, 3)
    assert.equal(val, 3)

    obj.a = { b: { c: 4 } }
    assert.equal(ob1.properties.length, 6)
    assert.equal(subscriber.value, 4)
  })

  it('observing object prop change on defined property', () => {
    const obj = { val: 2 }
    Object.defineProperty(obj, 'a', {
      configurable: true,
      enumerable: true,
      get() {
        return this.val
      },
      set(v) {
        this.val = v
        return this.val
      },
    })

    new Observer(obj)
    assert.equal(obj.a, 2)
    obj.a = 3
    assert.equal(obj.val, 3)
    obj.val = 5
    assert.equal(obj.a, 5)
  })

  it('observing set/delete', () => {
    const obj1 = { a: 1 }
    const ob1 = new Observer(obj1)
    const spy1 = sinon.spy(ob1.properties[0], '_notify')
    const spy2 = sinon.spy(ob1.properties[1], '_notify')

    // set non-existing key, should trigger the root property to notify
    Observer.set(obj1, 'b', 2)
    assert.equal(obj1.b, 2)
    assert.equal(ob1.properties.length, 3)
    assert.equal(spy1.callCount, 1)
    assert.equal(spy2.callCount, 0)

    // set existing key with the same value, should not trigger the property to notify
    Observer.set(obj1, 'b', 2)
    assert.equal(obj1.b, 2)
    assert.equal(ob1.properties.length, 3)
    assert.equal(spy1.callCount, 1)
    assert.equal(spy2.callCount, 0)

    // delete existing key, should trigger the property to notify, but not trigger the root property to notify
    Observer.delete(obj1, 'a')
    assert.equal(ob1.properties.length, 2)
    assert.equal(spy1.callCount, 1)
    assert.equal(spy2.callCount, 1)
    assert.equal(Object.prototype.hasOwnProperty.call(obj1, 'a'), false)

    // set existing key, should trigger the property to notify, but not trigger the root property to notify
    const spy3 = sinon.spy(ob1.properties[1], '_notify')
    Observer.set(obj1, 'b', 3)
    assert.equal(obj1.b, 3)
    assert.equal(ob1.properties.length, 2)
    assert.equal(spy1.callCount, 1)
    assert.equal(spy2.callCount, 1)
    assert.equal(spy3.callCount, 1)

    // set non-existing key, should trigger the root property to notify
    Observer.set(obj1, 'c', 1)
    assert.equal(obj1.c, 1)
    assert.equal(ob1.properties.length, 3)
    assert.equal(spy1.callCount, 2)
    assert.equal(spy2.callCount, 1)
    assert.equal(spy3.callCount, 1)

    // assert ignore deleting non-existing key
    Observer.delete(obj1, 'a')
    assert.equal(ob1.properties.length, 3)
    assert.equal(spy1.callCount, 2)
    assert.equal(spy2.callCount, 1)
    assert.equal(spy3.callCount, 1)

    // assert work on non-observed objects
    const obj2 = { a: 1 }
    Observer.set(obj2, 'b', 2)
    assert.equal(obj2.b, 2)
    Observer.delete(obj2, 'a')
    assert.equal(Object.prototype.hasOwnProperty.call(obj1, 'a'), false)

    // assert work on Object.create(null)
    const obj4 = Object.create(null)
    obj4.a = 1
    const ob4 = new Observer(obj4)
    const spy4 = sinon.spy(ob4.properties[0], '_notify')
    const spy5 = sinon.spy(ob4.properties[1], '_notify')

    Observer.set(obj4, 'b', 2)
    assert.equal(obj4.b, 2)
    assert.equal(spy4.callCount, 1)

    Observer.delete(obj4, 'a')
    assert.equal(spy4.callCount, 1)
    assert.equal(spy5.callCount, 1)
    assert.equal(Object.prototype.hasOwnProperty.call(obj4, 'a'), false)

    // set and delete non-numeric key on array
    const arr6 = ['a']
    const ob6 = new Observer(arr6)
    const spy6 = sinon.spy(ob6.properties[0], '_notify')
    Observer.set(arr6, 'b', 2)
    assert.equal(arr6.b, 2)
    assert.equal(spy6.callCount, 1)
    Observer.delete(arr6, 'b')
    assert.equal(Object.prototype.hasOwnProperty.call(arr6, 'b'), false)
    assert.equal(spy6.callCount, 1)
  })

  it('observing array mutation', () => {
    const arr = []
    const ob = new Observer(arr)
    const spy = sinon.spy(ob.properties[0], '_notify')
    const objs = [{}, {}, {}]
    arr[0] = objs[0]
    arr.push(objs[0])
    arr.pop()
    arr.unshift(objs[1])
    arr.shift()
    arr.splice(0, 0, objs[2])
    arr.sort()
    arr.reverse()
    Observer.set(arr, 0, objs[0])
    assert.equal(spy.callCount, 8)

    // inserted elements should be observed
    objs.forEach(obj => {
      assert.equal(Observer.getObserver(obj), ob)
    })
  })
})
