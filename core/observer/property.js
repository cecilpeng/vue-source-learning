import { isEqual, isObjectOrArray } from '../../utils/index'
import { isFunction, noop } from '../../utils/index'

export default class Property {
  constructor(data, key, value, injectGetter, injectSetter) {
    Property._assertReactive(data, key)

    this.data = data
    this.key = key
    this.value = value || data[key]
    this.injectGetter = isFunction(injectGetter) ? injectGetter : noop
    this.injectSetter = isFunction(injectSetter) ? injectSetter : noop
    this.subscribers = []
    this._defineReactive()
  }

  _defineReactive() {
    const property = Object.getOwnPropertyDescriptor(this.data, this.key)
    const getter = property && property.get ? property.get : () => this.value
    const setter =
      property && property.set ? property.set : val => (this.value = val)

    Object.defineProperty(this.data, this.key, {
      enumerable: true,
      configurable: true,
      get: () => {
        const value = getter.call(this.data)
        this.injectGetter(this)
        return value
      },
      set: value => {
        const oldVal = this.value
        if (isEqual(value, this.value)) {
          return
        }

        setter.call(this.data, value)
        this.injectSetter(this, value, oldVal)
        this._notify()
      },
    })
  }

  _notify() {
    this.subscribers
      .sort((a, b) => a.id - b.id)
      .forEach(subscriber => {
        subscriber.update()
      })
  }

  is(data, key) {
    return isEqual(data, this.data) && isEqual(key, this.key)
  }

  equal(value) {
    return isEqual(this.get(), value)
  }

  inherit(data) {
    if (!isObjectOrArray(data)) {
      return false
    }

    if (this.data === data) {
      return true
    }

    const keys = Object.keys(data)
    for (let key of keys) {
      const value = data[key]
      if (
        isEqual(value, this.data) ||
        (isObjectOrArray(value) && this.inherit(value))
      ) {
        return true
      }
    }

    return false
  }

  get() {
    return this.value
  }

  set(value) {
    // trigger setter
    this.data[this.key] = value
  }

  remove() {
    delete this.data[this.key]
    this._notify()
  }

  notify() {
    this._notify()
  }

  addSubscriber(subscriber) {
    const index = this.subscribers.indexOf(subscriber)
    if (index === -1) {
      this.subscribers.push(subscriber)
    }
  }

  removeSubscriber(subscriber) {
    const index = this.subscribers.indexOf(subscriber)
    if (index > -1) {
      this.subscribers.splice(index, 1)
    }
  }

  static reactive(data, key) {
    const property = Object.getOwnPropertyDescriptor(data, key)
    return !property || property.configurable
  }

  static _assertReactive(data, key) {
    if (!Property.reactive(data, key)) {
      throw new Error('only configurable property is accepted')
    }
  }
}
