import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import BehaviorAnalysisDashboard from './BehaviorAnalysisDashboard'
import * as behavior from '../../services/behaviorAnalysisService.js'

vi.mock('../../services/behaviorAnalysisService.js', () => ({
  getBehaviorSummary: vi.fn(),
  getDetectedPatterns: vi.fn(),
  analyzeUserBehavior: vi.fn(),
  clearUserBehaviorData: vi.fn(),
}))

describe('BehaviorAnalysisDashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    behavior.getBehaviorSummary.mockResolvedValue({
      total_interactions: 2,
      analysis_period_days: 30,
      recent_patterns: [],
    })
    behavior.getDetectedPatterns.mockResolvedValue({ patterns: [] })
    behavior.analyzeUserBehavior.mockResolvedValue({
      detectedPatterns: [],
      preference_changes: { beach: 0.1 },
      confidence_score: 0.9,
    })
    behavior.clearUserBehaviorData.mockResolvedValue(undefined)
  })

  it('asks for user when userId missing', () => {
    render(<BehaviorAnalysisDashboard userId={null} />)
    expect(screen.getByText(/select a user/i)).toBeInTheDocument()
  })

  it('loads summary and can run analyze', async () => {
    render(<BehaviorAnalysisDashboard userId="user-1" />)
    await waitFor(() => expect(behavior.getBehaviorSummary).toHaveBeenCalled())
    expect(await screen.findByText(/Behavior Analysis/i)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Analyze Behavior/i }))
    await waitFor(() => expect(behavior.analyzeUserBehavior).toHaveBeenCalled())
  })
})
