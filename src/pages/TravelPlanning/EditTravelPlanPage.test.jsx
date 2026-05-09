import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import EditTravelPlanPage from './EditTravelPlanPage'
import { travelPlanService } from '../../services/travelPlanService'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../hooks/useTravelPlans', () => ({
  useTravelPlans: () => ({ error: null, clearError: vi.fn() }),
}))

vi.mock('../../services/travelPlanService', () => ({
  travelPlanService: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}))

const basePlan = {
  title: 'Plan base',
  description: 'Desc',
  destinationLocation: 'Madrid',
  originLocation: 'Barcelona',
  startDate: '2026-04-01T00:00:00.000Z',
  endDate: '2026-04-10T00:00:00.000Z',
  numberOfTravelers: 2,
  estimatedBudget: 900,
}

function renderEdit(path = '/travel-plans/99/edit') {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/travel-plans/:id/edit" element={<EditTravelPlanPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

function getForm(container) {
  const form = container.querySelector('form')
  if (!form) throw new Error('form not found')
  return form
}

describe('EditTravelPlanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    travelPlanService.getById.mockResolvedValue({ data: basePlan })
    travelPlanService.update.mockResolvedValue({})
  })

  it('carga el plan y permite guardar cambios', async () => {
    renderEdit()
    await waitFor(() => expect(screen.getByText('Editar Plan de Viaje')).toBeInTheDocument())
    expect(travelPlanService.getById).toHaveBeenCalledWith('99')
    const titleInput = screen.getByPlaceholderText(/Aventura en Europa/i)
    await userEvent.clear(titleInput)
    await userEvent.type(titleInput, 'Plan editado')
    await userEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }))
    await waitFor(() => expect(travelPlanService.update).toHaveBeenCalled())
    expect(navigate).toHaveBeenCalledWith('/travel-details/99')
  })

  it('sin planId redirige a mis viajes', async () => {
    render(
      <MemoryRouter initialEntries={['/solo-edit']}>
        <Routes>
          <Route path="/solo-edit" element={<EditTravelPlanPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/my-travels'))
  })

  it('error al cargar redirige', async () => {
    travelPlanService.getById.mockRejectedValueOnce(new Error('fail'))
    renderEdit()
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/my-travels'))
  })

  it('validacion titulo vacio muestra alert', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    const { container } = renderEdit()
    await waitFor(() => expect(screen.getByText('Editar Plan de Viaje')).toBeInTheDocument())
    const titleInput = screen.getByPlaceholderText(/Aventura en Europa/i)
    await userEvent.clear(titleInput)
    fireEvent.submit(getForm(container))
    expect(alertSpy).toHaveBeenCalledWith('El título es requerido')
    alertSpy.mockRestore()
  })

  it('cancelar con cambios pide confirmacion', async () => {
    const confirmSpy = vi.spyOn(globalThis, 'confirm').mockReturnValue(true)
    const { container } = renderEdit()
    await waitFor(() => expect(screen.getByText('Editar Plan de Viaje')).toBeInTheDocument())
    const titleInput = screen.getByPlaceholderText(/Aventura en Europa/i)
    await userEvent.type(titleInput, ' x')
    await userEvent.click(within(getForm(container)).getByRole('button', { name: /^Cancelar$/i }))
    expect(confirmSpy).toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith('/travel-details/99')
    confirmSpy.mockRestore()
  })
})
