import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useLocalStorage } from './useLocalStorage'

describe('useLocalStorage', () => {
  it('reads initial and persists', () => {
    const { result } = renderHook(() => useLocalStorage('k', { a: 1 }))
    expect(result.current[0]).toEqual({ a: 1 })
    act(() => {
      result.current[1]({ b: 2 })
    })
    expect(JSON.parse(localStorage.getItem('k'))).toEqual({ b: 2 })
  })

  it('supports functional updates', () => {
    const { result } = renderHook(() => useLocalStorage('k2', 0))
    act(() => {
      result.current[1]((v) => v + 1)
    })
    expect(result.current[0]).toBe(1)
  })

  it('removeValue resets', () => {
    const { result } = renderHook(() => useLocalStorage('k3', 'x'))
    act(() => {
      result.current[1]('y')
      result.current[2]()
    })
    expect(result.current[0]).toBe('x')
    expect(localStorage.getItem('k3')).toBeNull()
  })

  it('handles corrupt JSON', () => {
    localStorage.setItem('k4', '{')
    const { result } = renderHook(() => useLocalStorage('k4', 'fallback'))
    expect(result.current[0]).toBe('fallback')
  })
})
