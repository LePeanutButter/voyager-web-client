import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Header from './Header'

const authMock = vi.hoisted(() => vi.fn())

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => authMock(),
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
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByText('Ada')).toBeInTheDocument()
    await userEvent.click(screen.getByTitle(/cerrar sesión/i))
  })

  it('shows auth links when guest', () => {
    authMock.mockReturnValue({ user: null, logout: vi.fn() })
    render(
      <MemoryRouter>
        <Header />
      </MemoryRouter>,
    )
    expect(screen.getByRole('link', { name: /login/i })).toBeInTheDocument()
  })
})
