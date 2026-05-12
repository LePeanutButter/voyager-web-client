import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { useUserProfile } from './useUserProfile'

const authState = vi.hoisted(() => ({
  user: null,
  updateUser: vi.fn(),
}))

vi.mock('../contexts/use-auth.js', () => ({
  useAuth: () => authState,
}))

const authSvc = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  updateProfile: vi.fn(),
}))

vi.mock('../services/authService', () => ({ authService: authSvc }))

vi.mock('../services/voyagerCrossService', () => ({
  provisionUserAcrossAiServices: vi.fn().mockResolvedValue(undefined),
}))

describe('useUserProfile', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = null
    authState.updateUser.mockClear()
    authSvc.getCurrentUser.mockResolvedValue({
      id: 1,
      firstName: 'A',
      lastName: 'B',
      email: 'e@e.com',
      username: 'u',
      role: 'USER',
    })
  })

  it('loads when no context user', async () => {
    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile?.email).toBe('e@e.com')
  })

  it('uses context user without fetch', async () => {
    authState.user = {
      id: '2',
      name: '',
      email: 'x@x.com',
      firstName: 'X',
      lastName: '',
      username: 'x',
      role: 'USER',
    }
    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.loading).toBe(false))
    expect(result.current.profile?.email).toBe('x@x.com')
  })

  it('save updates profile', async () => {
    authState.user = {
      id: '3',
      name: '',
      email: 'a@a.com',
      firstName: 'A',
      lastName: 'B',
      username: 'ab',
      role: 'USER',
    }
    authSvc.updateProfile.mockResolvedValue({ id: 3, firstName: 'N' })
    const { result } = renderHook(() => useUserProfile())
    await waitFor(() => expect(result.current.profile?.id).toBeTruthy())
    await act(async () => {
      await result.current.save({ firstName: 'N' })
    })
    expect(result.current.success).toBeTruthy()
    act(() => result.current.clearMessages())
  })
})
