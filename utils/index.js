export function isObject(value) {
  return (
    value !== null &&
    Object.prototype.toString.call(value) === '[object Object]'
  )
}

export function isArray(value) {
  return Array.isArray(value)
}

export function isObjectOrArray(value) {
  return isObject(value) || isArray(value)
}

export function isValidArrayIndex(value) {
  const n = parseFloat(String(value))
  return n >= 0 && Math.floor(n) === n && isFinite(value)
}

export function isDef(value) {
  return value !== undefined
}

export function isFunction(value) {
  return typeof value === 'function'
}

export function isNumber(value) {
  return typeof value === 'number'
}

export function isEqual(a, b) {
  return a === b || (isNumber(a) && isNumber(b) && isNaN(a) && isNaN(b))
}

export const hasProto = '__proto__' in {}
export const noop = () => {}
