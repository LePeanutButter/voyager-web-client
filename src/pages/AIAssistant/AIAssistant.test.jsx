import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import AIAssistant from './AIAssistant'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 'user-1' } }),
}))

vi.mock('../../hooks/useAIChat', () => ({
  useAIChat: () => ({
    messages: [],
    loading: false,
    loadingHistory: false,
    error: null,
    messagesEndRef: { current: null },
    sendMessage: vi.fn(),
    clearHistory: vi.fn(),
    submitFeedback: vi.fn(),
    clearError: vi.fn(),
  }),
}))

describe('AIAssistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders assistant header', () => {
    render(<AIAssistant />)
    expect(screen.getByRole('heading', { name: /AI Travel Assistant/i })).toBeInTheDocument()
  })
})
