import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import {
  useBehaviorAnalysis,
  useBehaviorTracking,
  useSearchBehavior,
  useRecommendationBehavior,
} from './useBehaviorAnalysis'
import * as behaviorSvc from '../services/behaviorAnalysisService.js'

vi.mock('../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../services/behaviorAnalysisService.js', () => {
  const BehaviorTracker = vi.fn().mockImplementation(() => ({
    track: vi.fn().mockResolvedValue(undefined),
    flushPendingInteractions: vi.fn().mockResolvedValue(undefined),
  }))
  return {
    InteractionType: { VIEW: 'view' },
    BehaviorTracker,
    trackUserBehavior: vi.fn(),
    analyzeUserBehavior: vi.fn().mockResolvedValue({ detectedPatterns: [{ id: 1 }] }),
    getBehaviorSummary: vi.fn().mockResolvedValue({ ok: 1 }),
    getDetectedPatterns: vi.fn().mockResolvedValue({ patterns: [{ id: 2 }] }),
    batchTrackBehavior: vi.fn(),
    clearUserBehaviorData: vi.fn(),
    default: {},
  }
})

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

describe('useBehaviorAnalysis', () => {
  it('loads summary analyze patterns and tracks', async () => {
    const { result } = renderHook(() =>
      useBehaviorAnalysis({ autoTrack: false, batchInterval: 1000 }),
    )
    await act(async () => {
      await result.current.loadSummary(7)
      await result.current.analyzeBehavior(3)
      await result.current.loadPatterns(5)
      await result.current.trackView({})
      await result.current.trackClick({})
      await result.current.trackBookmark({})
      await result.current.trackShare({})
      await result.current.trackReject({})
      await result.current.trackBook({})
      await result.current.trackRate({})
      await result.current.trackSearch({})
      await result.current.trackFilter({})
      result.current.clearError()
    })
    expect(behaviorSvc.getBehaviorSummary).toHaveBeenCalled()
    expect(behaviorSvc.analyzeUserBehavior).toHaveBeenCalled()
    expect(behaviorSvc.getDetectedPatterns).toHaveBeenCalled()
  })

  it('useBehaviorTracking useSearchBehavior useRecommendationBehavior', async () => {
    const { unmount } = renderHook(() => useBehaviorTracking('Comp', { context: { a: 1 } }))
    await act(async () => {
      await vi.runOnlyPendingTimersAsync()
    })
    unmount()
    const { result: s } = renderHook(() => useSearchBehavior())
    await act(async () => {
      s.current.trackSearchQuery('q', [1, 2])
      s.current.trackFilterChange({ x: 1 })
    })
    const { result: r } = renderHook(() => useRecommendationBehavior())
    await act(async () => {
      r.current.trackRecommendationClick('1', 'c')
      r.current.trackRecommendationBookmark('1', 'c')
      r.current.trackRecommendationReject('1', 'c')
      r.current.trackRecommendationShare('1', 'c')
    })
  })
})
