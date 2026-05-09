import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: '1', firstName: 'Test', username: 't' } }),
}))

vi.mock('../../contexts/adaptive-ui-provider.jsx', () => ({
  useAdaptiveUI: () => ({
    feedLayout: { sections: [], primaryTheme: null, recommendationThemeWeights: {} },
    loadError: null,
    clearLoadError: vi.fn(),
  }),
}))

vi.mock('../../hooks/useTravelPlans', () => ({
  useTravelPlans: () => ({
    plans: [
      { id: 1, status: 'PLANNING', destinationLocation: 'Paris', title: 'P', startDate: '2025-01-01', endDate: '2025-01-10' },
      { id: 2, status: 'COMPLETED', destinationLocation: 'Paris', title: 'C', startDate: null, endDate: null },
    ],
    loading: false,
    error: null,
  }),
}))

vi.mock('../../services/aiService', () => ({
  aiService: {
    getTrendsDashboard: vi.fn().mockResolvedValue({
      emergingDestinations: [{ destinationId: 'd1', name: 'A', country: 'X', tags: [], surgeRatio: 0.5 }],
    }),
    getWeeklyTrendsDigest: vi.fn().mockResolvedValue({ microTrends: [] }),
    getSeasonalityOverview: vi.fn().mockResolvedValue({ destinations: [] }),
  },
}))

describe('Dashboard', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders stats and plans', async () => {
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/Buenas|Buenos/i)).toBeInTheDocument())
    expect(screen.getByText(/planes totales/i)).toBeInTheDocument()
  })
})
