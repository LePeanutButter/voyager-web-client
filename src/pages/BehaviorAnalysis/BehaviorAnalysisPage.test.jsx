import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import BehaviorAnalysisPage from './BehaviorAnalysisPage'

const authState = { user: null }

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => authState,
}))

vi.mock('../../services/behaviorAnalysisService.js', () => ({
  getBehaviorSummary: vi.fn().mockResolvedValue({
    total_interactions: 0,
    analysis_period_days: 7,
    recent_patterns: [],
  }),
  getDetectedPatterns: vi.fn().mockResolvedValue({ patterns: [] }),
  analyzeUserBehavior: vi.fn().mockResolvedValue({ detectedPatterns: [] }),
  clearUserBehaviorData: vi.fn().mockResolvedValue(undefined),
}))

describe('BehaviorAnalysisPage', () => {
  beforeEach(() => {
    authState.user = null
  })

  it('requires authentication', () => {
    render(<BehaviorAnalysisPage />)
    expect(screen.getByText(/Authentication Required/i)).toBeInTheDocument()
  })

  it('renders dashboard when authenticated', () => {
    authState.user = { id: 'u99' }
    render(<BehaviorAnalysisPage />)
    expect(screen.getByRole('heading', { level: 1, name: /Behavior Analysis/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /Analyze Behavior|Analyzing/i })).toBeInTheDocument()
  })
})
