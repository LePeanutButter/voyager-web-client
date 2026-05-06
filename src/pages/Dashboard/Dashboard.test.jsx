import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import Dashboard from './Dashboard'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { firstName: 'Test', username: 't' } }),
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
    getTrendingActivities: vi.fn().mockResolvedValue({ activities: [{ id: 1, name: 'A' }] }),
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
    await waitFor(() => expect(screen.getByText(/good/i)).toBeInTheDocument())
    expect(screen.getByText(/total plans/i)).toBeInTheDocument()
  })
})
