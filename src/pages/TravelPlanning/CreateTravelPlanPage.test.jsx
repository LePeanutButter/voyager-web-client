import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CreateTravelPlanPage from './CreateTravelPlanPage'
import { travelService } from '../../services/travelService'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../services/travelService', () => ({
  travelService: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue({ id: 501 }),
    remove: vi.fn(),
    update: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

describe('CreateTravelPlanPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    travelService.create.mockResolvedValue({ id: 501 })
  })

  it('submits required fields and navigates to new plan', async () => {
    render(
      <MemoryRouter>
        <CreateTravelPlanPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: /Crear plan de viaje/i })).toBeInTheDocument()
    await userEvent.type(screen.getByLabelText(/^Titulo \*$/i), 'Paris trip')
    await userEvent.type(screen.getByLabelText(/^Destino \*$/i), 'Paris')
    await userEvent.type(screen.getByLabelText(/^Fecha de inicio \*$/i), '2026-06-01')
    await userEvent.type(screen.getByLabelText(/^Fecha de fin \*$/i), '2026-06-10')
    await userEvent.type(screen.getByLabelText(/^Presupuesto estimado \(COP\) \*$/i), '3000000')
    await userEvent.click(screen.getByRole('button', { name: /Crear plan/i }))
    await waitFor(() => expect(travelService.create).toHaveBeenCalled())
    await waitFor(() => expect(navigate).toHaveBeenCalledWith('/travel-plans/501'))
  })
})
