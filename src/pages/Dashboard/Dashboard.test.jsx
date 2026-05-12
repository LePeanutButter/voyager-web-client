import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

const travelPlansState = vi.hoisted(() => ({
  plans: [
    {
      id: 1,
      status: 'PLANNING',
      destinationLocation: 'Paris',
      title: 'P',
      startDate: '2025-01-01',
      endDate: '2025-01-10',
    },
    {
      id: 2,
      status: 'COMPLETED',
      destinationLocation: 'Paris',
      title: 'C',
      startDate: null,
      endDate: null,
    },
  ],
  loading: false,
  error: null,
}))

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: '1', firstName: 'Test', username: 't' } }),
}))

const adaptiveState = vi.hoisted(() => ({
  feedLayout: { sections: [], primaryTheme: null, recommendationThemeWeights: {} },
  loadError: null,
  clearLoadError: vi.fn(),
}))

vi.mock('../../contexts/adaptive-ui-provider.jsx', () => ({
  useAdaptiveUI: () => adaptiveState,
}))

vi.mock('../../hooks/useTravelPlans', () => ({
  useTravelPlans: () => ({
    plans: travelPlansState.plans,
    loading: travelPlansState.loading,
    error: travelPlansState.error,
  }),
}))

const aiMock = vi.hoisted(() => ({
  getTrendsDashboard: vi.fn(),
  getWeeklyTrendsDigest: vi.fn(),
  getSeasonalityOverview: vi.fn(),
}))

vi.mock('../../services/aiService', () => ({
  aiService: aiMock,
}))

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    travelPlansState.plans = [
      {
        id: 1,
        status: 'PLANNING',
        destinationLocation: 'Paris',
        title: 'P',
        startDate: '2025-01-01',
        endDate: '2025-01-10',
      },
      {
        id: 2,
        status: 'COMPLETED',
        destinationLocation: 'Paris',
        title: 'C',
        startDate: null,
        endDate: null,
      },
    ]
    travelPlansState.loading = false
    travelPlansState.error = null
    adaptiveState.feedLayout = { sections: [], primaryTheme: null, recommendationThemeWeights: {} }
    adaptiveState.loadError = null
    aiMock.getTrendsDashboard.mockResolvedValue({
      emergingDestinations: [
        { destinationId: 'd1', name: 'A', country: 'X', tags: ['t1', 't2'], surgeRatio: 0.5 },
      ],
    })
    aiMock.getWeeklyTrendsDigest.mockResolvedValue({
      microTrends: [
        {
          trendId: 'm1',
          title: 'Digest item',
          geo: { name: 'Lisboa', country: 'PT', destinationId: 'lis' },
          summary: 'S',
        },
      ],
    })
    aiMock.getSeasonalityOverview.mockResolvedValue({
      destinations: [{ destination: 'Rome', destinationId: 'r1', note: 'Invierno suave' }],
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders stats and plans', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/Buenas|Buenos/i)).toBeInTheDocument())
    expect(screen.getByText(/planes totales/i)).toBeInTheDocument()
  })

  it('planes vacios muestra CTA y navega a crear', async () => {
    travelPlansState.plans = []
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/Aun no tienes planes/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Crear primer plan/i }))
    expect(navigate).toHaveBeenCalledWith('/travel-plans/create')
  })

  it('carga skeleton de stats cuando plansLoading', () => {
    travelPlansState.loading = true
    const { container } = render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    expect(container.querySelectorAll('.stat-card').length).toBe(0)
    expect(container.querySelector('.skeleton-stat-card')).toBeTruthy()
  })

  it('error de tendencias muestra banner y permite dismiss', async () => {
    aiMock.getTrendsDashboard.mockRejectedValueOnce(new Error('IA down'))
    adaptiveState.loadError = 'Adapt error'
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/IA down/)).toBeInTheDocument())
    const dismiss = screen.getByRole('button', { name: /Dismiss/i })
    await userEvent.click(dismiss)
    expect(adaptiveState.clearLoadError).toHaveBeenCalled()
  })

  it('digest sin geo navega a asistente al hacer clic', async () => {
    aiMock.getWeeklyTrendsDigest.mockResolvedValueOnce({
      microTrends: [{ trendId: 'x', title: 'Sin geo', geo: null }],
    })
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Sin geo')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Sin geo/i }))
    expect(navigate).toHaveBeenCalledWith('/ai-assistant')
  })

  it('digest y estacionalidad navegan al explorar', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Digest item')).toBeInTheDocument())
    const digestBtn = screen.getByRole('button', { name: /Digest item/i })
    await userEvent.click(digestBtn)
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/explore/destination'))

    const seasonBtn = screen.getByRole('button', { name: /Rome/i })
    await userEvent.click(seasonBtn)
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/explore/destination'))
  })

  it('trending vacio tras carga exitosa sin datos', async () => {
    aiMock.getTrendsDashboard.mockResolvedValueOnce({ emergingDestinations: [] })
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByText(/No hay datos de tendencias disponibles/i)).toBeInTheDocument(),
    )
  })

  it('click en trending navega a explorar destino', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /#1[\s\S]*\bA\b/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /#1[\s\S]*\bA\b/i }))
    expect(navigate).toHaveBeenCalledWith(expect.stringContaining('/explore/destination'))
  })

  it('feed adaptativo con modulos y tema primario', async () => {
    adaptiveState.feedLayout = {
      primaryTheme: 'adventure',
      feedRefreshNote: 'Nota refresh',
      recommendationThemeWeights: { balanced: 0.4 },
      sections: [
        {
          title: 'Modulo X',
          destination: 'Barcelona',
          sectionId: 's1',
          priorityWeight: 0.25,
          themeTags: ['food'],
          contentTypes: ['guide'],
        },
        { title: 'Externo', href: 'https://example.com/foo' },
        { title: 'Solo IA', themeTags: ['nature'] },
        { title: 'Mis viajes' },
      ],
    }
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/UI adaptativa/i)).toBeInTheDocument())
    expect(screen.getByText(/Nota refresh/)).toBeInTheDocument()
    const modButtons = screen.getAllByRole('button', { name: /Modulo X|Externo|Solo IA|Mis viajes/i })
    expect(modButtons.length).toBeGreaterThan(0)
    const openSpy = vi.spyOn(globalThis, 'open').mockImplementation(() => {})
    await userEvent.click(screen.getByRole('button', { name: /Externo/i }))
    expect(openSpy).toHaveBeenCalled()
    openSpy.mockRestore()
    await userEvent.click(screen.getByRole('button', { name: /Solo IA/i }))
    expect(navigate).toHaveBeenCalledWith('/ai-assistant')
    await userEvent.click(screen.getByRole('button', { name: /Mis viajes/i }))
    expect(navigate).toHaveBeenCalledWith('/my-travels')
  })

  it('acciones rapidas y nuevo plan', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Nuevo plan/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Nuevo plan/i }))
    expect(navigate).toHaveBeenCalledWith('/travel-plans/create')
    await userEvent.click(screen.getByRole('button', { name: /Asistente IA/i }))
    expect(navigate).toHaveBeenCalledWith('/ai-assistant')
  })
})
