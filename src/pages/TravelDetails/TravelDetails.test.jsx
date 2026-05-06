import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TravelDetails from './TravelDetails'
import { travelService } from '../../services/travelService'

vi.mock('../../services/travelService', () => ({
  travelService: {
    getById: vi.fn(),
    updateStatus: vi.fn(),
    deleteActivity: vi.fn(),
    addActivity: vi.fn(),
    updateActivity: vi.fn(),
    getCompatibleTravelers: vi.fn().mockResolvedValue([]),
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

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
  activities: [],
}

describe('TravelDetails', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    travelService.getById.mockResolvedValue(mockPlan)
  })

  it('renders plan after load', async () => {
    render(
      <MemoryRouter initialEntries={['/travel-plans/7']}>
        <Routes>
          <Route path="/travel-plans/:id" element={<TravelDetails />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(travelService.getById).toHaveBeenCalledWith('7'))
    await waitFor(() => expect(screen.getByText('Details plan')).toBeInTheDocument())
  })
})
