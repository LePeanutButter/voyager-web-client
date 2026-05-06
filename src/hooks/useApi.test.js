import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const apiFn = vi.hoisted(() => vi.fn())

vi.mock('../services/api', () => ({ default: apiFn }))

import { useApi, useLazyApi } from './useApi'

beforeEach(() => {
  vi.clearAllMocks()
  apiFn.mockResolvedValue({ ok: true })
})

const stableOpts = { method: 'get', immediate: true }
const stableLazy = { method: 'get' }

describe('useApi', () => {
  it('fetches on mount when immediate', async () => {
    const { result } = renderHook(() => useApi('/test', stableOpts))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.data).toEqual({ ok: true })
    expect(apiFn).toHaveBeenCalled()
  })

  it('skips immediate when false', async () => {
    const noImmediate = { method: 'get', immediate: false }
    const { result } = renderHook(() => useApi('/t2', noImmediate))
    expect(apiFn).not.toHaveBeenCalled()
    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.data).toEqual({ ok: true })
  })

  it('refetch', async () => {
    const { result } = renderHook(() => useApi('/t3', stableOpts))
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.refetch()
    })
    expect(apiFn.mock.calls.length).toBeGreaterThan(1)
  })
})

describe('useLazyApi', () => {
  it('only runs on execute', async () => {
    const { result } = renderHook(() => useLazyApi('/lazy', stableLazy))
    expect(apiFn).not.toHaveBeenCalled()
    await act(async () => {
      await result.current.execute()
    })
    expect(result.current.data).toEqual({ ok: true })
  })
})
