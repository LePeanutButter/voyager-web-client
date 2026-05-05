/**
 * Unified error extraction utility.
 * Handles Spring Boot ApiResponse (errors[], message) and FastAPI (detail).
 */

/**
 * Extracts a user-friendly error message from an Axios error.
 * @param {Error|unknown} error
 * @returns {string}
 */
export function extractErrorMessage(error) {
  if (!error) return 'An unexpected error occurred.'

  // If it's already a plain Error with message from our interceptors
  if (error instanceof Error && error.message) {
    return error.message
  }

  const data = error?.response?.data

  if (!data) {
    return error?.message || 'An unexpected error occurred.'
  }

  // FastAPI validation detail (array of error objects)
  if (Array.isArray(data.detail)) {
    return data.detail
      .map((d) => (typeof d === 'string' ? d : d.msg || d.message || JSON.stringify(d)))
      .join('. ')
  }

  // FastAPI plain detail string
  if (typeof data.detail === 'string') {
    return data.detail
  }

  // Spring Boot validation errors array
  if (Array.isArray(data.errors) && data.errors.length > 0) {
    return data.errors
      .map((e) => (typeof e === 'string' ? e : e.defaultMessage || e.message || JSON.stringify(e)))
      .join('. ')
  }

  // Spring Boot ApiResponse.message
  if (typeof data.message === 'string') {
    return data.message
  }

  return error?.message || 'An unexpected error occurred.'
}

/**
 * Extracts field-level validation errors from a Spring Boot validation response.
 * Returns an object: { fieldName: 'error message', ... }
 * @param {Error|unknown} error
 * @returns {Record<string, string>}
 */
export function extractFieldErrors(error) {
  const data = error?.response?.data

  if (!data || !Array.isArray(data.errors)) return {}

  return data.errors.reduce((acc, e) => {
    if (e && e.field) {
      acc[e.field] = e.defaultMessage || e.message || 'Invalid value'
    }
    return acc
  }, {})
}

/**
 * Checks if the error is an authentication error (401).
 * @param {Error|unknown} error
 * @returns {boolean}
 */
export function isAuthError(error) {
  return error?.response?.status === 401
}

/**
 * Checks if the error is a forbidden error (403).
 * @param {Error|unknown} error
 * @returns {boolean}
 */
export function isForbiddenError(error) {
  return error?.response?.status === 403
}
