import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Home from './Home'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: null }),
}))

vi.mock('../../services/aiService', () => ({
  aiService: {
    getTrendsDashboard: vi.fn().mockResolvedValue({ emergingDestinations: [] }),
    getWeeklyTrendsDigest: vi.fn().mockResolvedValue({ microTrends: [] }),
  },
}))

describe('Home', () => {
  beforeEach(() => vi.clearAllMocks())

  it('hero', async () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>,
    )
    expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText(/Tendencias en vivo/i)).toBeInTheDocument())
  })
})
