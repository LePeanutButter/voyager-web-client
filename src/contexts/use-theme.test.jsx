import { describe, it, expect } from 'vitest'
import { renderHook } from '@testing-library/react'
import { ThemeProvider } from './theme-provider.jsx'
import { useTheme } from './use-theme.js'

describe('useTheme context hook', () => {
  it('throws outside ThemeProvider', () => {
    expect(() => renderHook(() => useTheme())).toThrow('useTheme must be used within a ThemeProvider')
  })

  it('returns context inside ThemeProvider', () => {
    const wrapper = ({ children }) => <ThemeProvider>{children}</ThemeProvider>
    const { result } = renderHook(() => useTheme(), { wrapper })
    expect(result.current.theme).toBe('light')
  })
})
