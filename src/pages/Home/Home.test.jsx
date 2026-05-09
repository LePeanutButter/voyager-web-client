import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

const authState = vi.hoisted(() => ({ user: null }))

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: authState.user }),
}))

const aiHome = vi.hoisted(() => ({
  getTrendsDashboard: vi.fn(),
  getWeeklyTrendsDigest: vi.fn(),
  getBuddyRecommendations: vi.fn(),
}))

vi.mock('../../services/aiService', () => ({
  aiService: aiHome,
}))

describe('Home', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    authState.user = null
    aiHome.getTrendsDashboard.mockResolvedValue({ emergingDestinations: [] })
    aiHome.getWeeklyTrendsDigest.mockResolvedValue({ microTrends: [] })
    aiHome.getBuddyRecommendations.mockResolvedValue({ recommendations: [] })
  })

  it('hero sin usuario', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Tendencias en vivo/i)).toBeInTheDocument())
    expect(screen.getAllByRole('link', { name: /Inicia sesion/i }).length).toBeGreaterThan(0)
  })

  it('usuario logueado carga tarjetas de tendencias y enlaces explorar', async () => {
    authState.user = { id: 99 }
    aiHome.getTrendsDashboard.mockResolvedValue({
      emergingDestinations: [
        {
          destinationId: 'tok',
          name: 'Tokio',
          country: 'JP',
          tags: ['food'],
          dashboardLabel: 'Alta demanda',
        },
      ],
    })
    aiHome.getWeeklyTrendsDigest.mockResolvedValue({
      microTrends: [
        {
          trendId: 'mt1',
          title: 'Micro 1',
          suggestedAction: 'Reserva temprano',
          affectedSegments: ['familias'],
          geo: { name: 'Oporto', country: 'PT', destinationId: 'op' },
        },
      ],
    })
    aiHome.getBuddyRecommendations.mockResolvedValue({
      recommendations: [{ userId: 'u1', name: 'Alex', compatibilityScore: 0.82 }],
    })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Tokio')).toBeInTheDocument())
    expect(screen.getByText('Micro 1')).toBeInTheDocument()
    expect(screen.getByText('Alex')).toBeInTheDocument()
    expect(screen.getByText(/compatibilidad/)).toBeInTheDocument()
    const exploreLinks = screen.getAllByRole('link', { name: /Ver catálogo y planes/i })
    expect(exploreLinks.length).toBeGreaterThan(0)
  })

  it('error en tendencias muestra mensaje', async () => {
    authState.user = { id: 1 }
    aiHome.getTrendsDashboard.mockRejectedValueOnce(new Error('fallo IA'))
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/fallo IA/)).toBeInTheDocument())
  })

  it('sin datos ni error muestra mensaje de ingest', async () => {
    authState.user = { id: 1 }
    aiHome.getTrendsDashboard.mockResolvedValue({ emergingDestinations: [] })
    aiHome.getWeeklyTrendsDigest.mockResolvedValue({ microTrends: [] })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText(/Aun no hay senales emergentes/i)).toBeInTheDocument(),
    )
  })

  it('buddy recommendations falla deja lista vacia', async () => {
    authState.user = { id: 1 }
    aiHome.getBuddyRecommendations.mockRejectedValueOnce(new Error('no'))
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText(/Aun no hay recomendaciones de compañeros/i)).toBeInTheDocument(),
    )
  })

  it('microtendencia sin geo no rompe y puede tener exploreHref null', async () => {
    authState.user = { id: 2 }
    aiHome.getTrendsDashboard.mockResolvedValue({ emergingDestinations: [] })
    aiHome.getWeeklyTrendsDigest.mockResolvedValue({
      microTrends: [{ trendId: 'n', title: 'Sin lugar', geo: null }],
    })
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Sin lugar')).toBeInTheDocument())
  })
})
