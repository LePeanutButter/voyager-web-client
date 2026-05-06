import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import TravelerChatPage from './TravelerChatPage'

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 1 } }),
}))

vi.mock('../../services/socialService', () => ({
  socialService: {
    getAllConversationMessages: vi.fn().mockResolvedValue([
      { id: 1, senderId: 2, content: 'hi', timestamp: new Date().toISOString() },
    ]),
    sendTravelerMessage: vi.fn().mockResolvedValue({}),
  },
}))

describe('TravelerChatPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('renders messages', async () => {
    render(
      <MemoryRouter initialEntries={['/social/chat/5']}>
        <Routes>
          <Route path="/social/chat/:connectionId" element={<TravelerChatPage />} />
        </Routes>
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText('hi')).toBeInTheDocument())
  })
})
