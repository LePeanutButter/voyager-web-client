import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import Sidebar from './Sidebar'

const authMock = vi.hoisted(() => ({
  user: { id: '1', role: 'USER' },
}))
const adaptiveMock = vi.hoisted(() => ({
  menuData: null,
}))

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: authMock.user }),
}))

vi.mock('../../contexts/adaptive-ui-provider.jsx', () => ({
  useAdaptiveUI: () => ({ menuData: adaptiveMock.menuData }),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    authMock.user = { id: '1', role: 'USER' }
    adaptiveMock.menuData = null
  })

  function renderAt(path) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="*" element={<Sidebar />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('menu estatico con enlaces principales', () => {
    renderAt('/dashboard')
    expect(screen.getByRole('link', { name: /Panel/i })).toHaveClass('active')
    expect(screen.getByRole('link', { name: /Mis Viajes/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Planear nuevo viaje/i })).toBeInTheDocument()
  })

  it('rol negocio muestra enlace Negocios', () => {
    authMock.user = { id: '1', role: 'PROVIDER' }
    renderAt('/business-dashboard')
    expect(screen.getByRole('link', { name: /Negocios/i })).toBeInTheDocument()
  })

  it('menu adaptativo con secundarios y cola fija', () => {
    adaptiveMock.menuData = {
      primaryItems: [
        { navItemId: 'home', tier: 'primary', adaptationReason: 'Usas mucho el panel' },
        { navItemId: 'chat', tier: 'primary' },
      ],
      secondaryItems: [{ navItemId: 'discover', tier: 'secondary' }],
    }
    renderAt('/dashboard')
    expect(screen.getByTitle(/Usas mucho el panel/i)).toBeInTheDocument()
    expect(screen.getByText('Mas')).toBeInTheDocument()
    expect(screen.getByText('Tu cuenta')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Calendario/i })).toBeInTheDocument()
  })
})
