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
    await waitFor(() =>
      expect(screen.getByText(/No se recibio token de autenticacion/i)).toBeInTheDocument(),
    )
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

  it('muestra error cuando OAuth devuelve error en query', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?error=access_denied&message=Cancelado']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Cancelado')).toBeInTheDocument())
    expect(login).not.toHaveBeenCalled()
  })

  it('usa mensaje por defecto si error sin message', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?error=denied']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(
        screen.getByText(/La autenticacion con Google fallo/i),
      ).toBeInTheDocument(),
    )
  })

  it('muestra error cuando login rechaza', async () => {
    login.mockRejectedValueOnce(new Error('token invalido'))
    render(
      <MemoryRouter initialEntries={['/auth/google/callback?token=bad']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('token invalido')).toBeInTheDocument())
  })

  it('navega a login desde el boton de error', async () => {
    render(
      <MemoryRouter initialEntries={['/auth/google/callback']}>
        <Routes>
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText(/No se recibio token de autenticacion/i)).toBeInTheDocument(),
    )
    screen.getByRole('button', { name: /volver a iniciar sesion/i }).click()
    expect(navigate).toHaveBeenCalledWith('/login')
  })
})
