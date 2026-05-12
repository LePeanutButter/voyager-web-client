import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { AuthContext } from '../../contexts/auth-context.js'
import ProtectedRoute from './ProtectedRoute'

function renderWithAuth(value, ui) {
  return render(
    <MemoryRouter initialEntries={['/secret']}>
      <AuthContext.Provider value={value}>
        {ui}
      </AuthContext.Provider>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('muestra cargando mientras loading', () => {
    renderWithAuth(
      { isAuthenticated: false, loading: true, user: null },
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute>
              <div>privado</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
    )
    expect(screen.getByText(/cargando/i)).toBeInTheDocument()
  })

  it('redirige a login si no autenticado', () => {
    render(
      <MemoryRouter initialEntries={['/secret']}>
        <AuthContext.Provider value={{ isAuthenticated: false, loading: false, user: null }}>
          <Routes>
            <Route
              path="/secret"
              element={
                <ProtectedRoute>
                  <div>privado</div>
                </ProtectedRoute>
              }
            />
            <Route path="/login" element={<div>login-page</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('redirige a dashboard si el rol no está permitido', () => {
    render(
      <MemoryRouter initialEntries={['/admin']}>
        <AuthContext.Provider
          value={{
            isAuthenticated: true,
            loading: false,
            user: { role: 'USER' },
          }}
        >
          <Routes>
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN']}>
                  <div>admin</div>
                </ProtectedRoute>
              }
            />
            <Route path="/dashboard" element={<div>dash</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(screen.getByText('dash')).toBeInTheDocument()
  })

  it('permite acceso con rol permitido', () => {
    renderWithAuth(
      {
        isAuthenticated: true,
        loading: false,
        user: { role: 'ADMIN' },
      },
      <Routes>
        <Route
          path="/secret"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <div>admin-area</div>
            </ProtectedRoute>
          }
        />
      </Routes>,
    )
    expect(screen.getByText('admin-area')).toBeInTheDocument()
  })

  it('renderiza Outlet cuando no hay children', () => {
    render(
      <MemoryRouter initialEntries={['/nested']}>
        <AuthContext.Provider
          value={{ isAuthenticated: true, loading: false, user: { role: 'USER' } }}
        >
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/nested" element={<div>outlet-child</div>} />
            </Route>
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>,
    )
    expect(screen.getByText('outlet-child')).toBeInTheDocument()
  })
})
