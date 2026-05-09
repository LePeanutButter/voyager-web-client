import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TravelPreferencesPage from './TravelPreferencesPage'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 99 } }),
}))

const ai = vi.hoisted(() => ({
  getTravelPreferences: vi.fn(),
  startQuestionnaire: vi.fn(),
  submitQuestionnaire: vi.fn(),
}))

vi.mock('../../services/aiService', () => ({ aiService: ai }))

describe('TravelPreferencesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    ai.getTravelPreferences.mockRejectedValue({ response: { status: 404 } })
    ai.startQuestionnaire.mockResolvedValue({
      sessionId: 's1',
      questions: [
        {
          id: 'q1',
          prompt: 'Question one?',
          allowMultiple: false,
          options: [{ id: 'o1', label: 'Opt A' }],
        },
      ],
    })
    ai.submitQuestionnaire.mockResolvedValue(undefined)
  })

  it('shows questionnaire step', async () => {
    render(
      <MemoryRouter>
        <TravelPreferencesPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Question one?')).toBeInTheDocument())
  })
})
