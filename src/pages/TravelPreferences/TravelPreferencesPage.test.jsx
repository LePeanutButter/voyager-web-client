import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import TravelPreferencesPage from './TravelPreferencesPage'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 99 } }),
}))

const ai = vi.hoisted(() => ({
  getTravelPreferences: vi.fn(),
  startQuestionnaire: vi.fn(),
  submitQuestionnaireStep: vi.fn(),
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
          options: [{ id: 'o1', label: 'Opt A', text: 'Opt A' }],
        },
      ],
    })
    ai.submitQuestionnaireStep.mockResolvedValue({ isComplete: false, sessionId: 's1', questions: [] })
    ai.submitQuestionnaire.mockResolvedValue({ travelerCategory: 'Explorador' })
  })

  it('shows questionnaire step', async () => {
    render(
      <MemoryRouter>
        <TravelPreferencesPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Question one?')).toBeInTheDocument())
  })

  it('completa cuestionario y muestra pantalla de exito', async () => {
    ai.submitQuestionnaireStep.mockResolvedValueOnce({ isComplete: true })
    ai.submitQuestionnaire.mockResolvedValueOnce({ travelerCategory: 'Nomada digital' })
    render(
      <MemoryRouter>
        <TravelPreferencesPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Question one?')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Opt A' }))
    await userEvent.click(screen.getByRole('button', { name: /Finalizar/i }))
    await waitFor(() => expect(screen.getByText(/Preferencias guardadas/i)).toBeInTheDocument())
    expect(screen.getByText(/Nomada digital/i)).toBeInTheDocument()
  })

  it('seleccion multiple y siguiente paso', async () => {
    ai.startQuestionnaire.mockResolvedValueOnce({
      sessionId: 's1',
      questions: [
        {
          id: 'q1',
          prompt: 'Elige varios',
          allowMultiple: true,
          options: [
            { id: 'o1', label: 'Uno', text: 'Uno' },
            { id: 'o2', label: 'Dos', text: 'Dos' },
          ],
        },
      ],
    })
    ai.submitQuestionnaireStep.mockResolvedValueOnce({
      isComplete: false,
      sessionId: 's2',
      questions: [
        {
          id: 'q2',
          prompt: 'Segunda pregunta',
          allowMultiple: false,
          options: [{ id: 'z', label: 'Zeta', text: 'Zeta' }],
        },
      ],
    })
    render(
      <MemoryRouter>
        <TravelPreferencesPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('Elige varios')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: 'Uno' }))
    await userEvent.click(screen.getByRole('button', { name: 'Dos' }))
    await userEvent.click(screen.getByRole('button', { name: /Finalizar/i }))
    await waitFor(() => expect(screen.getByText('Segunda pregunta')).toBeInTheDocument())
  })

  it('error al iniciar muestra banner', async () => {
    ai.startQuestionnaire.mockRejectedValueOnce(new Error('servicio caido'))
    render(
      <MemoryRouter>
        <TravelPreferencesPage />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('servicio caido')).toBeInTheDocument())
  })
})
