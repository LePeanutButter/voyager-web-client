import { describe, it, expect, vi, beforeEach } from 'vitest'

const inst = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  interceptors: {
    request: { use: vi.fn() },
    response: { use: vi.fn() },
  },
}))

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => inst),
  },
}))

import {
  MenuInteractionType,
  MenuPriority,
  MenuCategory,
  trackMenuInteraction,
  getPersonalizedMenuLayout,
  updateMenuPreferences,
  getMenuAnalytics,
  resetMenuLayout,
  getDefaultMenuLayout,
  batchTrackMenuInteractions,
  MenuTracker,
} from './menuOrganizationService'

const menuRequestHandlers = inst.interceptors.request.use.mock.calls.at(-1)
const menuReqOk = menuRequestHandlers[0]
const menuReqErr = menuRequestHandlers[1]

const menuResponseHandlers = inst.interceptors.response.use.mock.calls.at(-1)
const menuResOk = menuResponseHandlers[0]
const menuResErr = menuResponseHandlers[1]

beforeEach(() => {
  vi.clearAllMocks()
  inst.post.mockResolvedValue({ data: { ok: true } })
  inst.get.mockResolvedValue({ data: { layout: [] } })
  localStorage.clear()
})

describe('menuOrganizationService', () => {
  it('request interceptor adds Bearer token when present', () => {
    localStorage.setItem('token', 'abc')
    const cfg = menuReqOk({ headers: {} })
    expect(cfg.headers.Authorization).toBe('Bearer abc')
  })

  it('request interceptor uses smartrip_token when token absent', () => {
    localStorage.setItem('smartrip_token', 'xyz')
    const cfg = menuReqOk({ headers: {} })
    expect(cfg.headers.Authorization).toBe('Bearer xyz')
  })

  it('request error interceptor rejects', async () => {
    await expect(menuReqErr(new Error('x'))).rejects.toThrow('x')
  })

  it('response success interceptor returns data', () => {
    expect(menuResOk({ data: { a: 1 } })).toEqual({ a: 1 })
  })

  it('response error interceptor maps 401, 404, 422, detail and interaction copy', async () => {
    const loc = { href: '' }
    vi.stubGlobal('location', loc)

    await expect(menuResErr({ response: { status: 401 }, message: 'x' })).rejects.toThrow('x')
    expect(loc.href).toBe('/login')

    await expect(
      menuResErr({
        response: { status: 404 },
        message: 'm',
      }),
    ).rejects.toThrow(/No se encontraron datos de personalización/i)

    await expect(
      menuResErr({
        response: { status: 422 },
        message: 'm',
      }),
    ).rejects.toThrow(/más interacciones/i)

    await expect(
      menuResErr({
        response: { status: 400, data: { detail: 'No interaction data found for user' } },
        message: 'm',
      }),
    ).rejects.toThrow(/No hay datos de interacción/i)

    await expect(
      menuResErr({
        response: { status: 400, data: { message: 'Server' } },
        message: 'fallback',
      }),
    ).rejects.toThrow('Server')

    vi.unstubAllGlobals()
  })

  it('exports enums', () => {
    expect(MenuInteractionType.CLICK).toBe('click')
    expect(MenuPriority.HIGH).toBe('high')
    expect(MenuCategory.PRIMARY).toBe('primary')
  })

  it('API helpers call axios instance', async () => {
    await trackMenuInteraction({ userId: '1', menuItem: 'm', action: 'click' })
    await getPersonalizedMenuLayout('1')
    await updateMenuPreferences('1', { preferred_items: [] })
    await getMenuAnalytics('1', 14)
    await resetMenuLayout('1')
    await getDefaultMenuLayout()
    await batchTrackMenuInteractions([])
    expect(inst.post).toHaveBeenCalled()
    expect(inst.get).toHaveBeenCalled()
  })

  it('trackMenuInteraction adds timestamp when missing', async () => {
    await trackMenuInteraction({ userId: '1', menuItem: 'x', action: 'view' })
    const body = inst.post.mock.calls[0][1]
    expect(body.timestamp).toBeDefined()
  })

  it('helpers propagate request errors', async () => {
    inst.post.mockRejectedValueOnce(new Error('p'))
    await expect(trackMenuInteraction({ userId: '1', menuItem: 'm', action: 'click' })).rejects.toThrow('p')
  })

  it('MenuTracker tracks, dedupes views, queues on failure and flushes', async () => {
    const mt = new MenuTracker('u1')
    await mt.trackClick('item1')
    await mt.trackView('v1')
    await mt.trackView('v1')
    inst.post.mockRejectedValueOnce(new Error('fail'))
    await mt.trackHover('h1')
    expect(mt.pendingInteractions.length).toBe(1)
    inst.post.mockResolvedValue({ data: { ok: 1 } })
    await mt.flushPendingInteractions()
    expect(mt.pendingInteractions).toHaveLength(0)

    await mt.trackDismiss('d1')
    await mt.trackSearch('s1')
    mt.clearViewedItems()
    await mt.trackView('v1')
    inst.post.mockRejectedValueOnce(new Error('b'))
    await mt.flushPendingInteractions()
  })
})
