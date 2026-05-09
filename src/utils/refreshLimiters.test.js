import { describe, it, expect } from 'vitest'
import {
  checkDiscoverRefreshAllowed,
  recordDiscoverManualRefresh,
  DISCOVER_REFRESH_COOLDOWN_MS,
  DISCOVER_REFRESH_WINDOW_MS,
  DISCOVER_REFRESH_MAX_PER_WINDOW,
} from './discoverRefreshLimiter'
import {
  checkCatalogRefreshAllowed,
  recordCatalogManualRefresh,
  CATALOG_REFRESH_COOLDOWN_MS,
  CATALOG_REFRESH_WINDOW_MS,
  CATALOG_REFRESH_MAX_PER_WINDOW,
} from './catalogRefreshLimiter'

const NOW = 10_000_000

describe('discoverRefreshLimiter', () => {
  it('allows when no attempts recorded', () => {
    const ref = { current: [] }
    expect(checkDiscoverRefreshAllowed(ref, NOW)).toEqual({ ok: true })
  })

  it('records attempts and enforces cooldown', () => {
    const ref = { current: [] }
    recordDiscoverManualRefresh(ref, NOW)
    const result = checkDiscoverRefreshAllowed(ref, NOW + 5_000)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('cooldown')
    expect(result.retryAfterMs).toBeGreaterThan(0)
  })

  it('reports rate limit when too many attempts in window', () => {
    const ref = { current: [] }
    for (let i = 0; i < DISCOVER_REFRESH_MAX_PER_WINDOW; i++) {
      ref.current.push(NOW - i)
    }
    const result = checkDiscoverRefreshAllowed(ref, NOW)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('rate')
    expect(result.retryAfterMs).toBeGreaterThanOrEqual(0)
  })

  it('drops attempts older than the window', () => {
    const ref = { current: [NOW - DISCOVER_REFRESH_WINDOW_MS - 1, NOW - 200_000] }
    const result = checkDiscoverRefreshAllowed(ref, NOW + DISCOVER_REFRESH_COOLDOWN_MS)
    expect(result).toEqual({ ok: true })
    expect(ref.current).toEqual([])
  })
})

describe('catalogRefreshLimiter', () => {
  it('allows when no attempts recorded', () => {
    const ref = { current: [] }
    expect(checkCatalogRefreshAllowed(ref, NOW)).toEqual({ ok: true })
  })

  it('records attempts and enforces cooldown', () => {
    const ref = { current: [] }
    recordCatalogManualRefresh(ref, NOW)
    const result = checkCatalogRefreshAllowed(ref, NOW + 1_000)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('cooldown')
  })

  it('reports rate limit when too many attempts in window', () => {
    const ref = { current: [] }
    for (let i = 0; i < CATALOG_REFRESH_MAX_PER_WINDOW; i++) {
      ref.current.push(NOW - i)
    }
    const result = checkCatalogRefreshAllowed(ref, NOW)
    expect(result.ok).toBe(false)
    expect(result.code).toBe('rate')
  })

  it('drops attempts older than the window', () => {
    const ref = { current: [NOW - CATALOG_REFRESH_WINDOW_MS - 1] }
    const result = checkCatalogRefreshAllowed(ref, NOW + CATALOG_REFRESH_COOLDOWN_MS)
    expect(result.ok).toBe(true)
    expect(ref.current).toEqual([])
  })
})
