/**
 * Unified error extraction utility.
 * Handles Spring Boot ApiResponse (errors[], message) and FastAPI (detail).
 */

const DEFAULT_ERROR_MESSAGE = 'An unexpected error occurred.'

function messageFromDetailEntry(d) {
  if (typeof d === 'string') return d
  return d.msg || d.message || JSON.stringify(d)
}

function messageFromErrorsEntry(e) {
  if (typeof e === 'string') return e
  return e.defaultMessage || e.message || JSON.stringify(e)
}

function tryFormatDetailArray(detail) {
  if (!Array.isArray(detail)) return null
  return detail.map(messageFromDetailEntry).join('. ')
}

function tryFormatErrorsArray(errors) {
  if (!Array.isArray(errors) || errors.length === 0) return null
  return errors.map(messageFromErrorsEntry).join('. ')
}

function messageFromResponseData(data) {
  if (!data) return null
  const fromDetailList = tryFormatDetailArray(data.detail)
  if (fromDetailList) return fromDetailList
  if (typeof data.detail === 'string') return data.detail
  const fromErrors = tryFormatErrorsArray(data.errors)
  if (fromErrors) return fromErrors
  if (typeof data.message === 'string') return data.message
  return null
}

/**
 * Extracts a user-friendly error message from an Axios error.
 * @param {Error|unknown} error
 * @returns {string}
 */
export function extractErrorMessage(error) {
  if (!error) return DEFAULT_ERROR_MESSAGE

  if (error instanceof Error && error.message) {
    return error.message
  }

  const data = error?.response?.data
  const fromBody = messageFromResponseData(data)
  if (fromBody) return fromBody

  return error?.message || DEFAULT_ERROR_MESSAGE
}

/**
 * Extracts field-level validation errors from a Spring Boot validation response.
 * Returns an object: { fieldName: 'error message', ... }
 * @param {Error|unknown} error
 * @returns {Record<string, string>}
 */
export function extractFieldErrors(error) {
  const data = error?.response?.data

  if (!Array.isArray(data?.errors)) return {}

  return data.errors.reduce((acc, e) => {
    if (e?.field) {
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
