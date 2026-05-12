import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Login from './Login'

const loginFn = vi.fn()

vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    login: loginFn,
    loading: false,
    error: null,
  }),
}))

const navigateMock = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => navigateMock,
  }
})

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    loginFn.mockResolvedValue(undefined)
  })

  it('validation errors', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    expect(screen.getByText(/email is required/i)).toBeInTheDocument()
  })

  it('submits', async () => {
    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    )
    await userEvent.type(screen.getByLabelText(/email/i), 'a@b.c')
    await userEvent.type(screen.getByLabelText(/password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await act(async () => {})
    expect(loginFn).toHaveBeenCalled()
  })
})
