import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TravelDetails from './TravelDetails'
import { travelService } from '../../services/travelService'
import { socialService } from '../../services/socialService'

vi.mock('../../components/TravelPlan/QuickEditModal', () => ({
  default: ({ isOpen, onClose, onUpdate }) =>
    isOpen ? (
      <div data-testid="quick-edit-stub">
        <button
          type="button"
          onClick={() => {
            onUpdate({ title: 'Plan actualizado' })
            onClose()
          }}
        >
          Guardar edicion rapida
        </button>
      </div>
    ) : null,
}))

vi.mock('../../components/Catalog/CatalogDestinationsPanel', () => ({
  CatalogDestinationsPanel: ({ onPickCatalogActivity }) => (
    <button type="button" onClick={() => onPickCatalogActivity({ name: 'Tour', description: 'City' })}>
      Elegir del catalogo
    </button>
  ),
}))

vi.mock('../../services/travelService', () => ({
  travelService: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
    deleteActivity: vi.fn(),
    addActivity: vi.fn(),
    updateActivity: vi.fn(),
    getCompatibleTravelers: vi.fn().mockResolvedValue([]),
    getActivitiesByGeo: vi.fn().mockResolvedValue({ data: [] }),
    getHotelsByCity: vi.fn().mockResolvedValue({ data: [] }),
  },
}))

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 1 } }),
}))

vi.mock('../../services/socialService', () => ({
  socialService: {
    getTravelerSummary: vi.fn().mockResolvedValue({}),
    sendConnectionRequest: vi.fn().mockResolvedValue({}),
  },
}))

vi.mock('../../services/aiService', () => ({
  aiService: {
    getBuddyRecommendations: vi.fn().mockResolvedValue({ recommendations: [] }),
  },
}))

const mockPlan = {
  id: 7,
  title: 'Details plan',
  description: 'Test',
  destinationLocation: 'Rome',
  originLocation: 'Madrid',
  startDate: '2026-03-01',
  endDate: '2026-03-15',
  numberOfTravelers: 2,
  estimatedBudget: 1200,
  createdAt: '2026-01-01',
  status: 'PLANNING',
  activities: [
    {
      id: 'a1',
      name: 'Coliseo',
      type: 'sight',
      location: 'Rome',
      description: 'Tour',
      estimatedCost: 50,
      startTime: '2026-03-02T10:00:00.000Z',
      endTime: '2026-03-02T12:00:00.000Z',
    },
  ],
}

function renderAt(path = '/travel-plans/7') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/travel-plans/:id" element={<TravelDetails />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('TravelDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    travelService.getById.mockResolvedValue({ ...mockPlan })
    travelService.updateStatus.mockImplementation(async (_id, st) => ({ ...mockPlan, status: st }))
    travelService.addActivity.mockResolvedValue({
      id: 'new1',
      name: 'Nueva',
      startTime: '2026-03-05T15:00:00.000Z',
      endTime: '2026-03-05T16:00:00.000Z',
    })
    travelService.deleteActivity.mockResolvedValue(undefined)
    travelService.getCompatibleTravelers.mockResolvedValue([
      { userId: 88, firstName: 'Bo', lastName: 'D', username: 'bod', compatibilityScore: 0.6 },
    ])
    socialService.getTravelerSummary.mockResolvedValue({ bio: 'Bio' })
  })

  it('renders plan after load', async () => {
    renderAt()
    await waitFor(() => expect(travelService.getById).toHaveBeenCalledWith('7'))
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
  })

  it('muestra error si falla la carga', async () => {
    travelService.getById.mockRejectedValueOnce(new Error('404'))
    renderAt()
    await waitFor(() => expect(screen.getByText('404')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Volver/i }))
    expect(navigate).toHaveBeenCalledWith(-1)
  })

  it('cambia estado del plan', async () => {
    renderAt()
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Marcar Active/i }))
    await waitFor(() => expect(travelService.updateStatus).toHaveBeenCalledWith('7', 'ACTIVE'))
  })

  it('elimina actividad con confirmacion', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    renderAt()
    await waitFor(() => expect(screen.getByText('Coliseo')).toBeInTheDocument())
    await userEvent.click(screen.getAllByTitle('Eliminar')[0])
    await waitFor(() => expect(travelService.deleteActivity).toHaveBeenCalledWith('7', 'a1'))
    confirmSpy.mockRestore()
  })

  it('agrega actividad desde el modal', async () => {
    travelService.getById.mockResolvedValueOnce({ ...mockPlan, activities: [] })
    renderAt()
    await waitFor(() => expect(screen.getByText(/Aun no hay actividades/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Agregar/i }))
    await userEvent.type(screen.getByLabelText(/Nombre de actividad/i), 'Nueva')
    await userEvent.type(screen.getByLabelText(/Hora inicio/i), '2026-03-05T10:00')
    await userEvent.type(screen.getByLabelText(/Hora fin/i), '2026-03-05T11:00')
    await userEvent.click(screen.getByRole('button', { name: /Agregar actividad/i }))
    await waitFor(() => expect(travelService.addActivity).toHaveBeenCalled())
  })

  it('catalogo rellena prefill y abre modal', async () => {
    travelService.getById.mockResolvedValueOnce({ ...mockPlan, activities: [] })
    renderAt()
    await waitFor(() => expect(screen.getByRole('button', { name: /Elegir del catalogo/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Elegir del catalogo/i }))
    expect(screen.getByLabelText(/Nombre de actividad/i)).toHaveValue('Tour')
  })

  it('busca viajeros compatibles', async () => {
    renderAt()
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^Buscar$/i }))
    await waitFor(() => expect(travelService.getCompatibleTravelers).toHaveBeenCalledWith('7'))
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /Bo D/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
  })

  it('conectar con viajero compatible', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    renderAt()
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^Buscar$/i }))
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /Bo D/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    await userEvent.click(screen.getByRole('button', { name: /Conectar/i }))
    await waitFor(() => expect(socialService.sendConnectionRequest).toHaveBeenCalled())
    expect(alertSpy).toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('abre edicion rapida', async () => {
    renderAt()
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Editar plan/i }))
    expect(screen.getByTestId('quick-edit-stub')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Guardar edicion rapida/i }))
    await waitFor(() => expect(screen.getByText('Plan actualizado')).toBeInTheDocument())
  })

  it('vuelve a mis viajes desde breadcrumb', async () => {
    renderAt()
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Mis viajes/i }))
    expect(navigate).toHaveBeenCalledWith('/my-travels')
  })
})
