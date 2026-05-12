import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import BusinessDashboard from './BusinessDashboard'
import { businessService } from '../../services/businessService'

vi.mock('../../services/businessService', () => ({
  businessService: {
    getDashboardStats: vi.fn(),
    getBookings: vi.fn(),
    getServices: vi.fn(),
    getAnalytics: vi.fn(),
  },
}))

describe('BusinessDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    businessService.getDashboardStats.mockResolvedValue({
      totalRevenue: 1200,
      activeBookings: 3,
      rating: 4.5,
      totalCustomers: 10,
      revenueTrend: '+2%',
      bookingsTrend: '—',
      ratingTrend: '+0.1',
      customersTrend: '+1',
    })
    businessService.getBookings.mockResolvedValue([
      {
        id: 'b1',
        customerName: 'Ana',
        serviceName: 'Tour',
        date: '2026-05-01',
        amount: 99,
        status: 'paid',
      },
    ])
    businessService.getServices.mockResolvedValue([
      { name: 'City tour', bookings: 2, revenue: 200, rating: 5 },
    ])
    businessService.getAnalytics.mockResolvedValue({
      performance: [{ month: 'May', revenue: 10000, bookings: 5 }],
    })
  })

  it('carga datos y muestra KPIs y tablas', async () => {
    render(<BusinessDashboard />)
    await waitFor(() => expect(screen.getByText('Panel de negocios')).toBeInTheDocument())
    expect(screen.getByText('$1200')).toBeInTheDocument()
    expect(screen.getByText('Ana')).toBeInTheDocument()
    expect(screen.getByText('City tour')).toBeInTheDocument()
    expect(screen.getByText('May')).toBeInTheDocument()
  })

  it('Promise.allSettled rechazado usa valores por defecto', async () => {
    businessService.getDashboardStats.mockRejectedValueOnce(new Error('x'))
    businessService.getBookings.mockRejectedValueOnce(new Error('x'))
    businessService.getServices.mockRejectedValueOnce(new Error('x'))
    businessService.getAnalytics.mockRejectedValueOnce(new Error('x'))
    render(<BusinessDashboard />)
    await waitFor(() => expect(screen.getByText('Panel de negocios')).toBeInTheDocument())
    expect(screen.getByText('No hay reservas recientes')).toBeInTheDocument()
    expect(screen.getByText('No hay datos de rendimiento.')).toBeInTheDocument()
    expect(screen.getByText('No hay servicios cargados.')).toBeInTheDocument()
  })

  it('dashboard parcial sin objeto aun renderiza vacio de stats', async () => {
    businessService.getDashboardStats.mockResolvedValueOnce(null)
    render(<BusinessDashboard />)
    await waitFor(() => expect(screen.queryByText('$1200')).not.toBeInTheDocument())
  })

  it('muestra spinner mientras carga', () => {
    businessService.getDashboardStats.mockImplementation(() => new Promise(() => {}))
    businessService.getBookings.mockImplementation(() => new Promise(() => {}))
    businessService.getServices.mockImplementation(() => new Promise(() => {}))
    businessService.getAnalytics.mockImplementation(() => new Promise(() => {}))
    render(<BusinessDashboard />)
    expect(screen.getByText(/Cargando panel de negocios/i)).toBeInTheDocument()
  })

  it('mapea reservas con campos alternativos', async () => {
    businessService.getBookings.mockResolvedValue([
      { id: 'x', customer: 'Bob', service: 'Spa', createdAt: '2026-01-02', amount: null, status: '' },
    ])
    render(<BusinessDashboard />)
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
    expect(screen.getByText('Spa')).toBeInTheDocument()
    expect(screen.getAllByText('—').length).toBeGreaterThan(0)
  })
})
