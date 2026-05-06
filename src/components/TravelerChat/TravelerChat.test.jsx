import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import TravelerChat from './TravelerChat'
import * as social from '../../services/socialService'

vi.mock('../../services/socialService', () => ({
  getAllConversationMessages: vi.fn(),
  sendTravelerMessage: vi.fn(),
}))

vi.mock('../../hooks/useTravelerChatSocket', () => ({
  useTravelerChatSocket: () => ({
    connected: false,
    publishSend: vi.fn(() => false),
    hasBroker: false,
  }),
}))

describe('TravelerChat', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    social.getAllConversationMessages.mockResolvedValue([])
  })

  it('shows login notice without userId', () => {
    render(
      <MemoryRouter>
        <TravelerChat connectionId={1} userId={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/iniciar sesión/i)).toBeInTheDocument()
  })

  it('loads history when ids present', async () => {
    render(
      <MemoryRouter>
        <TravelerChat connectionId={5} userId={9} peerName="Alex" />
      </MemoryRouter>,
    )
    await waitFor(() => expect(social.getAllConversationMessages).toHaveBeenCalled())
  })
})
