import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import { ThemeProvider } from './theme-provider.jsx'
import { ThemeContext } from './theme-context.js'
import { useContext } from 'react'

function ThemeProbe() {
  const v = useContext(ThemeContext)
  return (
    <div>
      <span data-testid="th">{v.theme}</span>
      <span data-testid="sb">{v.sidebarOpen ? 'open' : 'closed'}</span>
      <span data-testid="lang">{v.language}</span>
      <button type="button" onClick={() => v.toggleTheme()}>tt</button>
      <button type="button" onClick={() => v.setTheme('dark')}>sd</button>
      <button type="button" onClick={() => v.toggleSidebar()}>ts</button>
      <button type="button" onClick={() => v.setSidebar(true)}>sst</button>
      <button type="button" onClick={() => v.setLanguage('es')}>sl</button>
    </div>
  )
}

describe('ThemeProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
  })

  it('loads saved theme and language and toggles', async () => {
    localStorage.setItem('theme', 'dark')
    localStorage.setItem('language', 'es')
    render(
      <ThemeProvider>
        <ThemeProbe />
      </ThemeProvider>,
    )
    await act(async () => {})
    expect(screen.getByTestId('th').textContent).toBe('dark')
    expect(screen.getByTestId('lang').textContent).toBe('es')
    await act(async () => {
      screen.getByRole('button', { name: 'tt' }).click()
    })
    expect(screen.getByTestId('th').textContent).toBe('light')
    await act(async () => {
      screen.getByRole('button', { name: 'ts' }).click()
    })
    expect(screen.getByTestId('sb').textContent).toBe('open')
    await act(async () => {
      screen.getByRole('button', { name: 'sst' }).click()
    })
    expect(screen.getByTestId('sb').textContent).toBe('open')
    expect(document.documentElement.getAttribute('data-theme')).toBeTruthy()
  })
})
