import { isFunction, isObjectOrArray } from '../../utils/index'
import { parsePath } from '../../utils/compile'
import { isEqual, isObject } from '../../utils/index'

let uid = 0

export default class Subscriber {
  constructor(context, expOrFn, cb, { deep = false } = {}) {
    this.id = ++uid
    this.context = context
    this.cb = cb
    this.expression = expOrFn.toString()
    this.getter = isFunction(expOrFn) ? expOrFn : parsePath(expOrFn)
    this.deep = deep
    this.value = this._get()
  }

  _get() {
    const context = this.context

    Subscriber.target = this

    let value
    try {
      // trigger observer to add subscriber
      value = this.getter.call(context, context)
    } catch (e) {
      throw new Error(`error to run getter for subscriber "${this.expression}"`)
    }

    // we need add deep dependencies
    if (this.deep) {
      this._traverse(value)
    }

    Subscriber.target = null

    return value
  }

  _traverse(data) {
    if (!isObjectOrArray(data)) {
      return
    }

    const keys = Object.keys(data)
    for (let key of keys) {
      this._traverse(data[key])
    }
  }

  update() {
    this.run()
  }

  run() {
    const value = this._get()
    if (!isEqual(value, this.value) || isObject(value) || this.deep) {
      const oldVal = this.value
      this.value = value
      try {
        this.cb.call(this.context, value, oldVal)
      } catch (e) {
        throw new Error(
          `error to run callback for subscriber "${this.expression}"`
        )
      }
    }
  }

  static target = null
}
