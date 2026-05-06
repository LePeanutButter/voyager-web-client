import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import MyTravels from './MyTravels'
import { travelService } from '../../services/travelService'

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
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
  })

  it('lists travel plans', async () => {
    render(
      <MemoryRouter>
        <MyTravels />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Euro trip')).toBeInTheDocument())
  })
})
