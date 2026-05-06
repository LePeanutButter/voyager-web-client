import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProtectedRoute from './ProtectedRoute'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: vi.fn(),
}))

import { useAuth } from '../../contexts/use-auth.js'

describe('ProtectedRoute', () => {
  it('loading', () => {
    useAuth.mockReturnValue({ loading: true, isAuthenticated: false })
    render(
      <MemoryRouter>
        <ProtectedRoute />
      </MemoryRouter>,
    )
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('redirect when unauthenticated', () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: false })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<div>secret</div>} />
          </Route>
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('outlet when authenticated', () => {
    useAuth.mockReturnValue({ loading: false, isAuthenticated: true })
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route path="/" element={<ProtectedRoute />}>
            <Route path="dashboard" element={<div>secret</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})
