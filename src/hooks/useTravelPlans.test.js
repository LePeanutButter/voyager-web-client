import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const travelMock = vi.hoisted(() => ({
  list: vi.fn(),
  create: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  updateStatus: vi.fn(),
}))

vi.mock('../services/travelService', () => ({ travelService: travelMock }))

import { useTravelPlans } from './useTravelPlans'

beforeEach(() => {
  vi.clearAllMocks()
  travelMock.list.mockResolvedValue([{ id: '1', title: 'a' }])
  travelMock.create.mockResolvedValue({ id: '2', title: 'n' })
  travelMock.update.mockResolvedValue({ id: '1', title: 'u' })
  travelMock.remove.mockResolvedValue(undefined)
  travelMock.updateStatus.mockResolvedValue({ id: '1', status: 'ACTIVE' })
})

describe('useTravelPlans', () => {
  it('autoLoad refresh', async () => {
    const { result } = renderHook(() => useTravelPlans(true))
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.plans).toHaveLength(1)
  })

  it('create update remove updateStatus clearError', async () => {
    const { result } = renderHook(() => useTravelPlans(false))
    await act(async () => {
      await result.current.refresh()
    })
    await act(async () => {
      await result.current.create({ title: 'x' })
    })
    expect(result.current.plans.some((p) => p.id === '2')).toBe(true)
    await act(async () => {
      await result.current.update('1', { title: 'u' })
    })
    await act(async () => {
      await result.current.remove('2')
    })
    await act(async () => {
      await result.current.updateStatus('1', 'ACTIVE')
    })
    act(() => result.current.clearError())
  })

  it('list error path', async () => {
    travelMock.list.mockRejectedValueOnce(new Error('fail'))
    const { result } = renderHook(() => useTravelPlans(true))
    await waitFor(() => expect(result.current.error).toBeTruthy())
  })
})
