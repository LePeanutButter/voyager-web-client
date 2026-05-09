import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import DestinationExplorePage from './DestinationExplorePage'
import { aiService } from '../../services/aiService'

const navigate = vi.fn()
const authMock = vi.hoisted(() => ({ user: { id: 7 } }))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: authMock.user }),
}))

vi.mock('../../hooks/useTravelPlans', () => ({
  useTravelPlans: () => ({
    plans: [
      { id: 1, title: 'Paris plan', destinationLocation: 'Paris, FR' },
      { id: 2, title: 'Other', destinationLocation: 'Tokyo' },
    ],
    loading: false,
  }),
}))

vi.mock('../../components/Catalog/CatalogDestinationsPanel', () => {
  /* eslint-disable react/prop-types -- stub de prueba */
  return {
    CatalogDestinationsPanel: ({ onPickCatalogActivity, onCatalogDataLoaded }) => (
      <div>
        <button
          type="button"
          onClick={() =>
            onCatalogDataLoaded({
              activities: [
                { id: 'a1', name: 'Tour guiado', description: 'City walk' },
              ],
            })}
        >
          mock-catalog
        </button>
        <button type="button" onClick={() => onPickCatalogActivity({ name: 'Kayak', description: 'Agua' })}>
          mock-pick
        </button>
      </div>
    ),
  }
})

vi.mock('../../services/aiService', () => ({
  aiService: {
    rankWithLocalRecommendations: vi.fn(),
  },
}))

describe('DestinationExplorePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    authMock.user = { id: 7 }
    aiService.rankWithLocalRecommendations.mockResolvedValue({
      items: [{ id: '1', name: 'Tour guiado', score: 0.9, reason: 'Popular' }],
    })
  })

  function renderWithQuery(query = '?loc=paris&country=FR&destId=d1') {
    return render(
      <MemoryRouter initialEntries={[`/explore/destination${query}`]}>
        <Routes>
          <Route path="/explore/destination" element={<DestinationExplorePage />} />
        </Routes>
      </MemoryRouter>,
    )
  }

  it('sin query muestra error y vuelve al dashboard', async () => {
    renderWithQuery('')
    expect(
      screen.getByText(/No se indicó un destino/i),
    ).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Volver al dashboard/i }))
    expect(navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('con query muestra destino y rankea con IA', async () => {
    renderWithQuery()
    await waitFor(() =>
      expect(screen.getByRole('heading', { level: 1 }).textContent).toMatch(/paris/i),
    )
    expect(screen.getByText(/Referencia tendencias/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'mock-catalog' }))
    await userEvent.click(screen.getByRole('button', { name: /Ordenar catálogo con IA/i }))
    await waitFor(() => expect(aiService.rankWithLocalRecommendations).toHaveBeenCalled())
    expect(screen.getByText('Tour guiado')).toBeInTheDocument()
    expect(screen.getByText('0.90')).toBeInTheDocument()
  })

  it('sin usuario muestra error al rankear', async () => {
    authMock.user = null
    renderWithQuery()
    await userEvent.click(screen.getByRole('button', { name: 'mock-catalog' }))
    await userEvent.click(screen.getByRole('button', { name: /Ordenar catálogo con IA/i }))
    expect(screen.getByText(/Inicia sesión/i)).toBeInTheDocument()
  })

  it('pick actividad navega a crear plan', async () => {
    renderWithQuery()
    await userEvent.click(screen.getByRole('button', { name: 'mock-pick' }))
    expect(navigate).toHaveBeenCalledWith(
      '/travel-plans/create',
      expect.objectContaining({
        state: expect.objectContaining({
          exploreSeed: expect.objectContaining({ activityName: 'Kayak' }),
        }),
      }),
    )
  })
})
