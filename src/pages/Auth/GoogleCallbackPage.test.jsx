import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import GoogleCallbackPage from './GoogleCallbackPage'

const login = vi.fn()
const navigate = vi.fn()

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ login }),
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

describe('GoogleCallbackPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    login.mockResolvedValue(undefined)
  })

  it('shows error when token missing', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/No authentication token/i)).toBeInTheDocument())
  })

  it('calls login and navigates on token', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?token=jwt-here']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(login).toHaveBeenCalledWith(null, 'jwt-here'))
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })
})
