import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useMenuOrganization } from './useMenuOrganization'

const authState = vi.hoisted(() => ({
  user: null,
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => authState,
}))

const menuSvc = vi.hoisted(() => ({
  getPersonalizedMenuLayout: vi.fn(),
  getDefaultMenuLayout: vi.fn(),
  updateMenuPreferences: vi.fn(),
  getMenuAnalytics: vi.fn(),
  resetMenuLayout: vi.fn(),
  MenuTracker: vi.fn(),
  MenuInteractionType: { CLICK: 'click', VIEW: 'view', DISMISS: 'dismiss' },
}))

vi.mock('../services/menuOrganizationService', () => menuSvc)

describe('useMenuOrganization', () => {
  let tracker

  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = { id: '42' }
    menuSvc.getPersonalizedMenuLayout.mockResolvedValue({
      layout: [],
      adaptation_score: 0.2,
      based_on_interactions: 3,
    })
    menuSvc.getDefaultMenuLayout.mockResolvedValue({ layout: [], adaptation_score: 0 })
    menuSvc.getMenuAnalytics.mockResolvedValue({ total: 1 })
    menuSvc.updateMenuPreferences.mockResolvedValue({})
    menuSvc.resetMenuLayout.mockResolvedValue({})
    tracker = {
      track: vi.fn().mockResolvedValue(undefined),
      flushPendingInteractions: vi.fn().mockResolvedValue(undefined),
    }
    menuSvc.MenuTracker.mockImplementation(() => tracker)
  })

  it('loads personalized menu and exposes scores', async () => {
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.menuData).toMatchObject({ adaptation_score: 0.2 })
    expect(result.current.isPersonalized).toBe(true)
    expect(result.current.adaptationScore).toBe(0.2)
    expect(result.current.basedOnInteractions).toBe(3)
  })

  it('falls back to default layout when personalized fails', async () => {
    menuSvc.getPersonalizedMenuLayout.mockRejectedValueOnce(new Error('no'))
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(menuSvc.getDefaultMenuLayout).toHaveBeenCalled()
    expect(result.current.menuData).toMatchObject({ adaptation_score: 0 })
  })

  it('sets error when default layout also fails', async () => {
    menuSvc.getPersonalizedMenuLayout.mockRejectedValueOnce(new Error('no'))
    menuSvc.getDefaultMenuLayout.mockRejectedValueOnce(new Error('bad'))
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.error).toBe('bad')
  })

  it('loadMenu and loadAnalytics no-op without user', async () => {
    authState.user = null
    const { result } = renderHook(() => useMenuOrganization())
    await act(async () => {
      await result.current.loadMenu()
      await result.current.loadAnalytics(7)
    })
    expect(menuSvc.getPersonalizedMenuLayout).not.toHaveBeenCalled()
    expect(menuSvc.getMenuAnalytics).not.toHaveBeenCalled()
  })

  it('loadAnalytics sets data', async () => {
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.loadAnalytics(14)
    })
    await waitFor(() => expect(result.current.analyticsLoading).toBe(false))
    expect(result.current.analytics).toEqual({ total: 1 })
  })

  it('loadAnalytics clears analytics on error', async () => {
    menuSvc.getMenuAnalytics.mockRejectedValueOnce(new Error('x'))
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.loadAnalytics()
    })
    await waitFor(() => expect(result.current.analyticsLoading).toBe(false))
    expect(result.current.analytics).toBeNull()
  })

  it('updatePreferences and resetLayout reload menu', async () => {
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.loading).toBe(false))
    await act(async () => {
      await result.current.updatePreferences({ a: 1 })
    })
    expect(menuSvc.updateMenuPreferences).toHaveBeenCalledWith('42', { a: 1 })
    await act(async () => {
      await result.current.resetLayout()
    })
    expect(menuSvc.resetMenuLayout).toHaveBeenCalledWith('42')
  })

  it('updatePreferences and resetLayout throw without user', async () => {
    authState.user = null
    const { result } = renderHook(() => useMenuOrganization())
    await expect(result.current.updatePreferences({})).rejects.toThrow(/not authenticated/i)
    await expect(result.current.resetLayout()).rejects.toThrow(/not authenticated/i)
  })

  it('trackInteraction and flush use MenuTracker', async () => {
    const { result } = renderHook(() => useMenuOrganization())
    await waitFor(() => expect(result.current.menuTracker).toBeTruthy())
    await act(async () => {
      await result.current.trackClick('item')
      await result.current.trackView('v')
      await result.current.trackDismiss('d')
      await result.current.flushPendingInteractions()
    })
    expect(tracker.track).toHaveBeenCalled()
    expect(tracker.flushPendingInteractions).toHaveBeenCalled()
  })

  it('trackInteraction no-op when tracker missing', async () => {
    authState.user = null
    const { result } = renderHook(() => useMenuOrganization())
    await act(async () => {
      await result.current.trackClick('x')
    })
    expect(tracker.track).not.toHaveBeenCalled()
  })
})
