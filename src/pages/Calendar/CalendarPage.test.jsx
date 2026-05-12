import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CalendarPage from './CalendarPage'

const travel = vi.hoisted(() => ({
  plans: [],
  loading: false,
  error: null,
  clearError: vi.fn(),
}))

vi.mock('../../hooks/useTravelPlans', () => ({
  useTravelPlans: () => travel,
}))

describe('CalendarPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    travel.loading = false
    travel.error = null
    travel.plans = [
      {
        id: 1,
        title: 'Trip A',
        status: 'ACTIVE',
        startDate: '2026-05-10',
        endDate: '2026-05-12',
        destinationLocation: 'Bogota',
      },
      {
        id: 2,
        title: 'Past',
        status: 'COMPLETED',
        startDate: '2020-01-01',
        endDate: '2020-01-02',
        destinationLocation: 'X',
      },
    ]
  })

  it('renderiza calendario y proximos planes', async () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { name: 'Calendario' })).toBeInTheDocument()
    expect(screen.getAllByText('Trip A').length).toBeGreaterThan(0)
  })

  it('estado de carga', () => {
    travel.loading = true
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Cargando planes/i)).toBeInTheDocument()
  })

  it('error y dismiss', async () => {
    travel.error = 'Sin red'
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    expect(screen.getByText('Sin red')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Dismiss/i }))
    expect(travel.clearError).toHaveBeenCalled()
  })

  it('navega mes anterior y siguiente', async () => {
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    const mesTitulo = screen.getByRole('heading', { level: 2 })
    const before = mesTitulo.textContent
    await userEvent.click(screen.getByRole('button', { name: /Mes anterior/i }))
    await waitFor(() => expect(mesTitulo.textContent).not.toBe(before))
    await userEvent.click(screen.getByRole('button', { name: /Mes siguiente/i }))
  })

  it('lista vacia de planes muestra CTA', () => {
    travel.plans = []
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Tu calendario esta vacio/i)).toBeInTheDocument()
  })

  it('sin planes futuros muestra mensaje', () => {
    travel.plans = [
      { id: 9, title: 'Old', startDate: '2019-01-01', endDate: '2019-01-02', destinationLocation: 'Y' },
    ]
    render(
      <MemoryRouter>
        <CalendarPage />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Aun no tienes planes futuros/i)).toBeInTheDocument()
  })
})
