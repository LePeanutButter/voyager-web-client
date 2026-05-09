import { describe, it, expect, vi, beforeEach } from 'vitest'

const inst = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
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
  InteractionType,
  trackUserBehavior,
  analyzeUserBehavior,
  getBehaviorSummary,
  batchTrackBehavior,
  getDetectedPatterns,
  clearUserBehaviorData,
  BehaviorTracker,
} from './behaviorAnalysisService'

// `axios.create` returns the same `inst` for every consumer (api.js + behaviorAnalysisService.js),
// so the interceptor registrations stack up. The behaviorAnalysisService handler is the
// most recent registration when this module finishes loading.
const responseUseCalls = inst.interceptors.response.use.mock.calls
const [, behaviorResponseError] = responseUseCalls[responseUseCalls.length - 1]

beforeEach(() => {
  vi.clearAllMocks()
  inst.post.mockResolvedValue({ saved: true })
  inst.get.mockResolvedValue({ summary: 1 })
  inst.delete.mockResolvedValue({ cleared: true })
})

describe('behaviorAnalysisService', () => {
  it('response error interceptor handles 401, 422, detail, and friendly messages', () => {
    const loc = { pathname: '/app', href: '' }
    vi.stubGlobal('location', loc)
    expect(() =>
      behaviorResponseError({ response: { status: 401 }, message: 'x' }),
    ).toThrow('x')
    expect(loc.href).toBe('/login')

    expect(() =>
      behaviorResponseError({
        response: { status: 422, data: { detail: 'x' } },
        message: 'm',
      }),
    ).toThrow(/más interacciones/i)

    expect(() =>
      behaviorResponseError({
        response: { status: 400, data: { detail: 'No behavior data found for user' } },
        message: 'm',
      }),
    ).toThrow(/No hay datos de comportamiento/i)

    expect(() =>
      behaviorResponseError({
        response: { status: 400, data: { message: 'Server msg' } },
        message: 'fallback',
      }),
    ).toThrow('Server msg')

    vi.unstubAllGlobals()
  })

  it('InteractionType constants', () => {
    expect(InteractionType.VIEW).toBe('view')
  })

  it('track and analyze', async () => {
    await expect(trackUserBehavior({ userId: '1', interactionType: 'view' })).resolves.toEqual({ saved: true })
    await expect(analyzeUserBehavior({ userId: '1' })).resolves.toEqual({ saved: true })
  })

  it('getBehaviorSummary getDetectedPatterns clear', async () => {
    await getBehaviorSummary('1', 14)
    await getDetectedPatterns('1', 7)
    await clearUserBehaviorData('1')
    expect(inst.get).toHaveBeenCalled()
    expect(inst.delete).toHaveBeenCalled()
  })

  it('batchTrackBehavior', async () => {
    await batchTrackBehavior([])
  })

  it('BehaviorTracker tracks and flushes', async () => {
    const bt = new BehaviorTracker('u1')
    await bt.trackView({ activityId: 'a' })
    await bt.trackClick()
    inst.post.mockRejectedValueOnce(new Error('fail'))
    await bt.track(InteractionType.BOOK, {})
    expect(bt.pendingInteractions.length).toBeGreaterThan(0)
    inst.post.mockResolvedValue({ ok: 1 })
    await bt.flushPendingInteractions()
    expect(bt.pendingInteractions).toHaveLength(0)
    expect(bt.getSessionDuration()).toBeGreaterThanOrEqual(0)
  })

  it('BehaviorTracker exposes all interaction helpers', async () => {
    const bt = new BehaviorTracker('u2')
    await bt.trackBookmark()
    await bt.trackShare()
    await bt.trackReject()
    await bt.trackBook()
    await bt.trackRate({ rating: 5 })
    await bt.trackSearch({ q: 'paris' })
    await bt.trackFilter({ filters: ['beach'] })
    expect(inst.post).toHaveBeenCalledTimes(7)
  })

  it('BehaviorTracker.flushPendingInteractions is a no-op when empty and swallows batch errors', async () => {
    const bt = new BehaviorTracker('u3')
    await bt.flushPendingInteractions()
    expect(inst.post).not.toHaveBeenCalled()

    inst.post.mockRejectedValueOnce(new Error('fail'))
    await bt.track(InteractionType.VIEW, {})
    expect(bt.pendingInteractions.length).toBe(1)
    inst.post.mockRejectedValueOnce(new Error('batch fail'))
    await bt.flushPendingInteractions()
    expect(bt.pendingInteractions.length).toBe(1)
  })

  it('top-level helpers reject when the underlying request fails', async () => {
    inst.post.mockRejectedValueOnce(new Error('track-fail'))
    await expect(trackUserBehavior({ userId: '1', interactionType: 'view' })).rejects.toThrow(
      'track-fail',
    )
    inst.post.mockRejectedValueOnce(new Error('analyze-fail'))
    await expect(analyzeUserBehavior({ userId: '1' })).rejects.toThrow('analyze-fail')
    inst.get.mockRejectedValueOnce(new Error('summary-fail'))
    await expect(getBehaviorSummary('1')).rejects.toThrow('summary-fail')
    inst.post.mockRejectedValueOnce(new Error('batch-fail'))
    await expect(batchTrackBehavior([])).rejects.toThrow('batch-fail')
    inst.get.mockRejectedValueOnce(new Error('patterns-fail'))
    await expect(getDetectedPatterns('1')).rejects.toThrow('patterns-fail')
    inst.delete.mockRejectedValueOnce(new Error('clear-fail'))
    await expect(clearUserBehaviorData('1')).rejects.toThrow('clear-fail')
  })
})
