import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { ThemeProvider } from '../../contexts/theme-provider.jsx'
import Header from './Header'

const authMock = vi.hoisted(() => vi.fn())

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => authMock(),
}))

vi.mock('../../contexts/adaptive-ui-provider.jsx', () => ({
  useAdaptiveUI: () => ({ menuData: null }),
}))

describe('Header', () => {
  beforeEach(() => {
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
})
