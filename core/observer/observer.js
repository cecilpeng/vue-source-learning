import {
  isDef,
  isArray,
  isObjectOrArray,
  hasProto,
  isValidArrayIndex,
} from '../../utils/index'
import Property from './property'
import Subscriber from './subscriber'

const arrayProto = Object.create(Array.prototype)
const arrayMethodsToPatch = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'sort',
  'reverse',
]
arrayMethodsToPatch.forEach(method => {
  Object.defineProperty(arrayProto, method, {
    value: function mutator(...args) {
      const observer = Observer.getObserver(this)
      if (observer) {
        observer._update(this)
      }

      return Array.prototype[method].apply(this, args)
    },
    enumerable: false,
    writable: true,
    configurable: true,
  })
})

let uid = 0

export default class Observer {
  constructor(data) {
    Observer._assertObservable(data)

    if (data[Observer.OB_KEY]) {
      return data[Observer.OB_KEY]
    }

    this.id = ++uid
    this.data = data
    this.properties = []
    // add root property to keep reactive with adding reactive properties
    this.rootProperty = this._addProperty(
      this,
      Observer.PROP_ROOT_KEY,
      this.data
    )

    this._walk(data)
  }

  _walk(data, deps = []) {
    if (!isObjectOrArray(data)) {
      return
    }

    // avoid endless loop
    if (deps.indexOf(data) > -1) {
      return
    }

    this._injectInstance(data)

    // support reactivity with array method, not index
    if (isArray(data)) {
      this._augmentArray(data)
      for (let i = 0, len = data.length; i < len; i++) {
        const value = data[i]
        this._walk(value, deps.concat([data]))
      }
    } else {
      const keys = Object.keys(data)
      for (let key of keys) {
        const value = data[key]
        this._addProperty(data, key, value)
        this._walk(value, deps.concat([data]))
      }
    }
  }

  _injectInstance(data) {
    Object.defineProperty(data, Observer.OB_KEY, {
      value: this,
      enumerable: false, // avoid Object.keys to get OB_KEY
      writable: true,
      configurable: true,
    })
  }

  _augmentArray(value) {
    if (hasProto) {
      value.__proto__ = arrayProto
    } else {
      /* istanbul ignore next */
      arrayMethodsToPatch.forEach(method => {
        Object.defineProperty(value, method, arrayProto[method])
      })
    }
  }

  _addProperty(data, key, value) {
    if (!Property.reactive(data, key)) {
      return
    }

    let property = this.properties.find(property => property.is(data, key))
    if (!property) {
      property = new Property(
        data,
        key,
        value,
        this._handlePropertyGetter.bind(this),
        this._handlePropertySetter.bind(this)
      )
      this.properties.push(property)
    }

    return property
  }

  _handlePropertyGetter(property) {
    if (Subscriber.target) {
      // subscriber should listen to the root data in order to be reactive with adding reactive properties
      this.rootProperty.addSubscriber(Subscriber.target)
      property.addSubscriber(Subscriber.target)
    }
  }

  _handlePropertySetter(property, newVal, oldVal) {
    this._removeProperty(oldVal)
    this._walk(newVal)
  }

  _removeProperty(data, key) {
    const isKeyDefined = isDef(key)
    // recursive remove
    this.properties = this.properties.filter(property =>
      isKeyDefined ? !property.is(data, key) : !property.inherit(data)
    )
  }

  _update(data, key, value) {
    const isKVDefined = isDef(key) && isDef(value)
    if (isKVDefined) {
      // trigger array method
      if (isArray(data) && isValidArrayIndex(key)) {
        data.length = Math.max(data.length, key)
        data.splice(key, 1, value)
        return value
      }

      // trigger property to change on existed key
      let property = this.properties.find(property => property.is(data, key))
      if (property) {
        property.set(value)
        return
      }
    }

    const property = this.properties.find(property => property.equal(data))
    /* istanbul ignore next */
    if (!property) {
      console.warn(`wtf, argument error: ${data}`)
      return
    }

    if (isKVDefined) {
      this._addProperty(data, key, value)
      this._walk(value)
    } else {
      // don't know the detail of changed properties, re-walk anyway
      this._removeProperty(data)
      this._walk(data)
    }
    property.notify()
  }

  _remove(data, key) {
    const property = this.properties.find(property => property.is(data, key))
    this._removeProperty(data, key)
    if (property) {
      property.remove()
    }
  }

  static OB_KEY = '__ob__'
  static PROP_ROOT_KEY = '$data'

  static observable(data) {
    return isObjectOrArray(data) && Object.isExtensible(data)
  }

  static getObserver(data) {
    return data[Observer.OB_KEY]
  }

  static set(data, key, value) {
    Observer._assertObservable(data)

    const observer = Observer.getObserver(data)
    if (observer) {
      observer._update(data, key, value)
    } else {
      data[key] = value
    }
  }

  static delete(data, key) {
    Observer._assertObservable(data)

    const observer = Observer.getObserver(data)
    if (observer) {
      observer._remove(data, key)
    } else {
      delete data[key]
    }
  }

  static _assertObservable(data) {
    if (!Observer.observable(data)) {
      throw new Error('only object or array can be observed')
    }
  }
}
