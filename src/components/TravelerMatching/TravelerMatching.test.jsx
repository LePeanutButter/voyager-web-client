import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import TravelerMatching from './TravelerMatching'
import * as social from '../../services/socialService'

vi.mock('../../services/socialService', () => ({
  getCompatibleTravelers: vi.fn(),
  sendConnectionRequest: vi.fn(),
}))

describe('TravelerMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    social.getCompatibleTravelers.mockResolvedValue([
      { userId: 1, firstName: 'Sam', lastName: 'Lee', username: 'slee' },
    ])
  })

  it('loads compatible travelers', async () => {
    render(<TravelerMatching travelPlanId="plan-1" />)
    await waitFor(() => expect(social.getCompatibleTravelers).toHaveBeenCalledWith('plan-1'))
    await waitFor(() => expect(screen.getByText(/Sam/)).toBeInTheDocument())
  })
})
