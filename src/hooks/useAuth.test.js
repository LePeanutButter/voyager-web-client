import { describe, it, expect, vi } from 'vitest'
import { renderHook } from '@testing-library/react'

vi.mock('../contexts/use-auth.js', () => ({
  useAuth: () => ({
    user: { id: '1', role: 'admin' },
    isAuthenticated: true,
    login: vi.fn(),
  }),
}))

import { useAuth } from './useAuth'

describe('useAuth wrapper', () => {
  it('exposes role helpers', () => {
    const { result } = renderHook(() => useAuth())
    expect(result.current.isRole('admin')).toBe(true)
    expect(result.current.isAdmin()).toBe(true)
    expect(result.current.hasPermission('read')).toBe(true)
    expect(result.current.isUser()).toBe(false)
  })
})
