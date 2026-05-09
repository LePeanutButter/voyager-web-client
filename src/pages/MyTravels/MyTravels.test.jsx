import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import MyTravels from './MyTravels'
import { travelService } from '../../services/travelService'

const navigate = vi.hoisted(() => vi.fn())

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../services/travelService', () => ({
  travelService: {
    list: vi.fn().mockResolvedValue([]),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
    updateStatus: vi.fn(),
  },
}))

describe('MyTravels', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    travelService.list.mockResolvedValue([
      {
        id: 1,
        title: 'Euro trip',
        status: 'PLANNING',
        startDate: '2026-01-01',
        endDate: '2026-01-10',
        destinationLocation: 'Paris',
      },
    ])
    travelService.remove.mockResolvedValue(undefined)
  })

  it('lists travel plans', async () => {
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Euro trip')).toBeInTheDocument())
  })

  it('sin planes muestra CTA de crear', async () => {
    travelService.list.mockResolvedValueOnce([])
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Aun no tienes planes de viaje/i })).toBeInTheDocument(),
    )
  })

  it('Nuevo plan navega a creacion', async () => {
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Euro trip')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Nuevo plan/i }))
    expect(navigate).toHaveBeenCalledWith('/travel-plans/create')
  })

  it('filtro sin resultados permite volver a todos', async () => {
    travelService.list.mockResolvedValueOnce([
      { id: 1, title: 'Only planning', status: 'PLANNING', startDate: '2026-01-01', endDate: '2026-01-02' },
    ])
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Only planning')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^Activo$/ }))
    await waitFor(() => expect(screen.getByText(/Ver todos los planes/i)).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Ver todos los planes/i }))
    await waitFor(() => expect(screen.getByText('Only planning')).toBeInTheDocument())
  })

  it('confirmar eliminar llama a travelService.remove', async () => {
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Euro trip')).toBeInTheDocument())
    await userEvent.click(screen.getAllByRole('button', { name: 'Eliminar plan' })[0])
    const dlg = await screen.findByRole('dialog')
    await userEvent.click(within(dlg).getByRole('button', { name: 'Eliminar plan' }))
    await waitFor(() => expect(travelService.remove).toHaveBeenCalledWith(1))
  })
})
