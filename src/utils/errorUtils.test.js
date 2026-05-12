import { describe, it, expect } from 'vitest'
import {
  extractErrorMessage,
  extractFieldErrors,
  isAuthError,
  isForbiddenError,
} from './errorUtils'

describe('errorUtils', () => {
  it('extractErrorMessage returns default when falsy', () => {
    expect(extractErrorMessage(null)).toMatch(/unexpected/i)
    expect(extractErrorMessage(undefined)).toMatch(/unexpected/i)
  })

  it('extractErrorMessage uses Error.message', () => {
    expect(extractErrorMessage(new Error('oops'))).toBe('oops')
  })

  it('extractErrorMessage parses FastAPI detail array', () => {
    const err = { response: { data: { detail: [{ msg: 'a' }, { msg: 'b' }] } } }
    expect(extractErrorMessage(err)).toBe('a. b')
  })

  it('extractErrorMessage parses string detail', () => {
    const err = { response: { data: { detail: 'bad' } } }
    expect(extractErrorMessage(err)).toBe('bad')
  })

  it('extractErrorMessage parses Spring errors', () => {
    const err = {
      response: {
        data: {
          errors: [{ field: 'email', defaultMessage: 'invalid' }],
        },
      },
    }
    expect(extractErrorMessage(err)).toBe('invalid')
  })

  it('extractErrorMessage uses top-level message', () => {
    const err = { response: { data: { message: 'hello' } } }
    expect(extractErrorMessage(err)).toBe('hello')
  })

  it('extractFieldErrors maps fields', () => {
    const err = {
      response: {
        data: {
          errors: [
            { field: 'a', defaultMessage: 'x' },
            { field: 'b', message: 'y' },
            { nofield: true },
          ],
        },
      },
    }
    expect(extractFieldErrors(err)).toEqual({ a: 'x', b: 'y' })
  })

  it('extractFieldErrors empty when no errors array', () => {
    expect(extractFieldErrors({})).toEqual({})
  })

  it('isAuthError / isForbiddenError', () => {
    expect(isAuthError({ response: { status: 401 } })).toBe(true)
    expect(isAuthError({ response: { status: 403 } })).toBe(false)
    expect(isForbiddenError({ response: { status: 403 } })).toBe(true)
  })
})
