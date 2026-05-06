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

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => axiosInstance),
  },
}))

import './api.js'

describe('api module interceptors', () => {
  let locationHolder

  beforeEach(() => {
    localStorage.clear()
    locationHolder = { pathname: '/app', href: '' }
    vi.stubGlobal('location', locationHolder)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('adds bearer token and unwraps ApiResponse', () => {
    localStorage.setItem('voyager_token', 'abc')
    const cfg = axiosInstance.req({ headers: {} })
    expect(cfg.headers.Authorization).toBe('Bearer abc')
    expect(axiosInstance.resOk({ data: { data: { nested: 1 } } })).toEqual({ nested: 1 })
    expect(axiosInstance.resOk({ data: { plain: 2 } })).toEqual({ plain: 2 })
    expect(axiosInstance.resOk(null)).toBeNull()
  })

  it('request error interceptor rethrows', () => {
    expect(() => axiosInstance.reqErr(new Error('req-fail'))).toThrow('req-fail')
  })

  it('retries on ECONNABORTED and returns retry result', async () => {
    axiosInstance.mockResolvedValueOnce({ data: { recovered: true } })
    const err = { code: 'ECONNABORTED', config: { url: '/x', method: 'get' } }
    await expect(axiosInstance.resErr(err)).resolves.toEqual({ data: { recovered: true } })
  })

  it('retries on 5xx', async () => {
    axiosInstance.mockResolvedValueOnce({ data: { ok: 1 } })
    const err = {
      code: 'ERR_BAD_RESPONSE',
      response: { status: 503 },
      config: { url: '/x' },
    }
    await expect(axiosInstance.resErr(err)).resolves.toEqual({ data: { ok: 1 } })
  })

  it('stops retry after max attempts and throws enhanced error', async () => {
    const err = {
      code: 'ECONNABORTED',
      config: { url: '/x', _retryCount: 2 },
      message: 'timeout',
    }
    await expect(axiosInstance.resErr(err)).rejects.toThrow()
  })

  it('401 clears token and redirects when not on login', async () => {
    localStorage.setItem('voyager_token', 't')
    const err = {
      response: { status: 401, data: {} },
      config: { url: '/x', method: 'get' },
      message: 'Unauthorized',
    }
    await expect(axiosInstance.resErr(err)).rejects.toThrow()
    expect(localStorage.getItem('voyager_token')).toBeNull()
    expect(locationHolder.href).toBe('/login')
  })

  it('401 on login path does not set location href', async () => {
    locationHolder.pathname = '/login'
    localStorage.setItem('voyager_token', 't')
    const err = {
      response: { status: 401 },
      config: {},
      message: 'nope',
    }
    await expect(axiosInstance.resErr(err)).rejects.toThrow()
    expect(locationHolder.href).toBe('')
  })
})
