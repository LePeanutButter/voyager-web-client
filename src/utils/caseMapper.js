/**
 * Utility functions for case conversion (snake_case <-> camelCase).
 */

const toCamelCase = (str) => {
  return str.replaceAll(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replaceAll('-', '').replaceAll('_', '')
  )
}

const toSnakeCase = (str) => {
  return str.replaceAll(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`)
}

const isObject = (obj) => {
  return obj !== null && typeof obj === 'object' && !Array.isArray(obj) && !(obj instanceof Date)
}

/**
 * Recursively converts object keys from snake_case to camelCase.
 */
export const keysToCamelCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToCamelCase(v))
  } else if (isObject(obj)) {
    return Object.keys(obj).reduce((acc, key) => {
      const camelKey = toCamelCase(key)
      acc[camelKey] = keysToCamelCase(obj[key])
      return acc
    }, {})
  }
  return obj
}

/**
 * Recursively converts object keys from camelCase to snake_case.
 */
export const keysToSnakeCase = (obj) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => keysToSnakeCase(v))
  } else if (isObject(obj)) {
    return Object.keys(obj).reduce((acc, key) => {
      const snakeKey = toSnakeCase(key)
      acc[snakeKey] = keysToSnakeCase(obj[key])
      return acc
    }, {})
  }
  return obj
}
