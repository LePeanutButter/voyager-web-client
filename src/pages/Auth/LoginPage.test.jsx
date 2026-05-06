import { describe, it, vi, beforeEach } from 'vitest'
import { render, screen, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import LoginPage from './LoginPage'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({
    login: vi.fn().mockResolvedValue(undefined),
  }),
}))

vi.mock('react-router-dom', async () => {
  const a = await vi.importActual('react-router-dom')
  return { ...a, useNavigate: () => vi.fn() }
})

describe('LoginPage', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_API_BASE_URL', 'http://localhost/api/v1')
  })

  it('submits credentials', async () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>,
    )
    await userEvent.type(screen.getByLabelText(/username or email/i), 'user')
    await userEvent.type(screen.getByLabelText(/^password$/i), 'pass')
    await userEvent.click(screen.getByRole('button', { name: /sign in/i }))
    await act(async () => {})
  })
})
