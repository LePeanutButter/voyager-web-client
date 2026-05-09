import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MenuPreferences from './MenuPreferences'

const navigate = vi.fn()

vi.mock('react-router-dom', async (orig) => {
  const mod = await orig()
  return {
    ...mod,
    useNavigate: () => navigate,
  }
})

const menuOrg = vi.hoisted(() => ({
  menuData: null,
  loading: false,
  error: null,
  updatePreferences: vi.fn().mockResolvedValue(undefined),
  resetLayout: vi.fn().mockResolvedValue(undefined),
  analytics: null,
  loadAnalytics: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('../hooks/useMenuOrganization', () => ({
  useMenuOrganization: () => menuOrg,
}))

vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 'u1' } }),
}))

function renderPage() {
  return render(
    <MemoryRouter>
      <MenuPreferences />
    </MemoryRouter>,
  )
}

describe('MenuPreferences', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    menuOrg.loading = false
    menuOrg.error = null
    menuOrg.menuData = {
      layout: [
        {
          item_id: 'nav_dash',
          priority: 'high',
          visible: true,
          category: 'primary',
          label: 'Dashboard',
          icon: 'home',
        },
        {
          item_id: 'nav_hide',
          priority: 'medium',
          visible: false,
          category: 'primary',
          label: 'Oculto',
          icon: 'eye',
        },
      ],
      adaptation_score: 0.15,
      based_on_interactions: 2,
    }
    menuOrg.analytics = {
      total_interactions: 5,
      last_analyzed: new Date().toISOString(),
      most_used_items: [{ item: 'a', count: 2 }],
      least_used_items: [{ item: 'b', count: 1 }],
      usage_patterns: ['pat-a'],
    }
  })

  it('shows loading state', () => {
    menuOrg.loading = true
    renderPage()
    expect(screen.getByText(/Cargando preferencias del menú/i)).toBeInTheDocument()
  })

  it('shows error state and navigates back', async () => {
    menuOrg.error = 'Falló la carga'
    renderPage()
    expect(screen.getByText('Falló la carga')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Volver al Dashboard/i }))
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('saves preferences and shows success', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /Guardar Preferencias/i }))
    await waitFor(() => expect(menuOrg.updatePreferences).toHaveBeenCalled())
    expect(menuOrg.updatePreferences.mock.calls[0][0]).toMatchObject({
      preferred_items: expect.any(Array),
      hidden_items: expect.any(Array),
      priority_changes: expect.any(Object),
    })
    await screen.findByText(/guardadas exitosamente/i)
  })

  it('switches to analytics tab and renders stats', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /Análisis de Uso/i }))
    expect(screen.getByText(/Total de Interacciones/i)).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('pat-a')).toBeInTheDocument()
  })

  it('reset layout when confirmed', async () => {
    const user = userEvent.setup()
    vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    renderPage()
    await user.click(screen.getByRole('button', { name: /Restablecer Menú/i }))
    await waitFor(() => expect(menuOrg.resetLayout).toHaveBeenCalled())
    vi.mocked(globalThis.confirm).mockRestore()
  })
})
