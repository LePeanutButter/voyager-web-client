import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Register from './Register'

const registerFn = vi.fn()
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({
    register: registerFn,
    loading: false,
    error: null,
  }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

describe('Register', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    registerFn.mockResolvedValue(undefined)
  })

  it('shows validation for empty form', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    expect(screen.getByText(/name is required/i)).toBeInTheDocument()
  })

  it('submits valid form', async () => {
    render(
      <MemoryRouter>
        <Register />
      </MemoryRouter>,
    )
    await userEvent.type(screen.getByPlaceholderText(/full name/i), 'N N')
    await userEvent.type(screen.getByPlaceholderText(/email/i), 'a@b.c')
    await userEvent.type(screen.getByPlaceholderText(/^create a password/i), 'secret')
    await userEvent.type(screen.getByPlaceholderText(/confirm your password/i), 'secret')
    await userEvent.click(screen.getByRole('button', { name: /create account/i }))
    await act(async () => {})
    expect(registerFn).toHaveBeenCalled()
  })
})
