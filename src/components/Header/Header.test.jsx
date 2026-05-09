import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../contexts/theme-provider.jsx'
import Header from './Header'

const authMock = vi.hoisted(() => vi.fn())
const adaptiveState = vi.hoisted(() => ({ menuData: null }))

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => authMock(),
}))

vi.mock('../../contexts/adaptive-ui-provider.jsx', () => ({
  useAdaptiveUI: () => ({ menuData: adaptiveState.menuData }),
}))

describe('Header', () => {
  beforeEach(() => {
    adaptiveState.menuData = null
    authMock.mockReturnValue({
      user: { firstName: 'Ada', username: 'ada' },
      logout: vi.fn(),
    })
  })

  it('shows user menu when authenticated', async () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    await userEvent.click(
      screen.getByRole('button', { name: /cerrar sesion/i }),
    )
  })

  it('shows auth links when guest', () => {
    authMock.mockReturnValue({ user: null, logout: vi.fn() })
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(
      screen.getByRole('link', { name: /iniciar sesión/i }),
    ).toBeInTheDocument()
  })

  it('usa enlaces adaptativos cuando menuData tiene primarios validos', () => {
    adaptiveState.menuData = {
      primaryItems: [{ navItemId: 'home' }, { navItemId: 'chat' }],
    }
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: 'Inicio' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByRole('link', { name: 'IA' })).toHaveAttribute('href', '/ai-assistant')
  })

  it('muestra username si no hay firstName', () => {
    authMock.mockReturnValue({
      user: { firstName: '', username: 'zorro', lastName: 'x' },
      logout: vi.fn(),
    })
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    )
    expect(screen.getByText('zorro')).toBeInTheDocument()
  })

  it('anade clase scrolled cuando scrollY es alto', () => {
    render(
      <MemoryRouter>
        <ThemeProvider>
          <Header />
        </ThemeProvider>
      </MemoryRouter>,
    )
    const scrollSpy = vi.spyOn(globalThis, 'scrollY', 'get').mockReturnValue(20)
    try {
      fireEvent.scroll(globalThis.window)
      expect(document.querySelector('header.header')?.className).toContain('scrolled')
    } finally {
      scrollSpy.mockRestore()
    }
  })
})
