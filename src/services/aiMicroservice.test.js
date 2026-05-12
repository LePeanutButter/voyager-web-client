import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

const axiosInstance = vi.hoisted(() => {
  const inst = vi.fn()
  inst.interceptors = {
    request: {
      use: vi.fn((fn, onErr) => {
        inst.req = fn
        inst.reqErr = onErr
      }),
    },
    response: {
      use: vi.fn((ok, err) => {
        inst.resOk = ok
        inst.resErr = err
      }),
    },
  }
  return inst
})

vi.mock('./api', () => ({ TOKEN_KEY: 'voyager_token' }))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => axiosInstance),
  },
}))

import './aiMicroservice.js'

describe('aiMicroservice interceptors', () => {
  let locationHolder

  beforeEach(() => {
    localStorage.clear()
    locationHolder = { pathname: '/app', href: '' }
    vi.stubGlobal('location', locationHolder)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it('snake_cases request body, params, and camelCases response', () => {
    localStorage.setItem('voyager_token', 'tok')
    const cfg = axiosInstance.req({
      headers: {},
      data: { userId: 1, sessionId: 's' },
      params: { pageSize: 10, userId: 2 },
    })
    expect(cfg.data).toEqual({ user_id: 1, session_id: 's' })
    expect(cfg.params).toEqual({ page_size: 10, user_id: 2 })
    expect(cfg.headers.Authorization).toBe('Bearer tok')
    expect(axiosInstance.resOk({ data: { data: { user_name: 'a' } } })).toEqual({ userName: 'a' })
  })

  it('leaves FormData body unchanged', () => {
    const fd = new FormData()
    const cfg = axiosInstance.req({ headers: {}, data: fd })
    expect(cfg.data).toBe(fd)
  })

  it('response success returns null for null response', () => {
    expect(axiosInstance.resOk(null)).toBeNull()
  })

  it('response without nested data key passes through camelCase', () => {
    expect(axiosInstance.resOk({ data: { plain_field: 1 } })).toEqual({ plainField: 1 })
  })

  it('request error rethrows', () => {
    expect(() => axiosInstance.reqErr(new Error('bad'))).toThrow('bad')
  })

  it('retries transient errors', async () => {
    axiosInstance.mockResolvedValueOnce({ data: { data: { ok: true } } })
    const err = { code: 'ECONNABORTED', config: { url: '/ai' } }
    // Retry invokes the axios instance directly; mock does not re-run response success interceptor.
    await expect(axiosInstance.resErr(err)).resolves.toEqual({ data: { data: { ok: true } } })
  })

  it('401 clears session and redirects', async () => {
    localStorage.setItem('voyager_token', 'x')
    const err = {
      response: { status: 401, data: { detail: 'expired' } },
      config: { url: '/ai', method: 'post' },
      message: '401',
    }
    await expect(axiosInstance.resErr(err)).rejects.toThrow()
    expect(localStorage.getItem('voyager_token')).toBeNull()
    expect(locationHolder.href).toBe('/login')
  })

  it('401 on login path skips redirect href', async () => {
    locationHolder.pathname = '/login'
    const err = {
      response: { status: 401 },
      config: {},
      message: 'x',
    }
    await expect(axiosInstance.resErr(err)).rejects.toThrow()
    expect(locationHolder.href).toBe('')
  })
})
