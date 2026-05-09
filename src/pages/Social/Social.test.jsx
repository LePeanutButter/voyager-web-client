import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Social from './Social'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 42 } }),
}))

const socialSvc = vi.hoisted(() => ({
  getUserConnections: vi.fn().mockResolvedValue([]),
  getPendingRequests: vi.fn().mockResolvedValue([]),
  getCompatibleTravelers: vi.fn().mockResolvedValue([]),
  sendConnectionRequest: vi.fn(),
  acceptConnectionRequest: vi.fn(),
  rejectConnectionRequest: vi.fn(),
}))

const travelSvc = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue([]),
}))

const aiSvc = vi.hoisted(() => ({
  getBuddyRecommendations: vi.fn().mockResolvedValue({ recommendations: [] }),
}))

vi.mock('../../services/socialService', () => ({ socialService: socialSvc }))
vi.mock('../../services/travelService', () => ({ travelService: travelSvc }))
vi.mock('../../services/aiService', () => ({ aiService: aiSvc }))

describe('Social', () => {
  beforeEach(() => vi.clearAllMocks())

  it('loads tabs', async () => {
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/Red de viajeros/i)).toBeInTheDocument())
  })
})
