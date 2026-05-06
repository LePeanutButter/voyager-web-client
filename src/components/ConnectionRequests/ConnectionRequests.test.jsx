import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import ConnectionRequests from './ConnectionRequests'
import * as social from '../../services/socialService'

vi.mock('../../services/socialService', () => ({
  getPendingRequests: vi.fn(),
  acceptConnectionRequest: vi.fn(),
  rejectConnectionRequest: vi.fn(),
}))

describe('ConnectionRequests', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    social.getPendingRequests.mockResolvedValue([])
  })

  it('loads pending requests', async () => {
    social.getPendingRequests.mockResolvedValue([
      { id: 'r1', createdAt: '2024-01-01T12:00:00Z', requesterName: 'Bob' },
    ])
    render(<ConnectionRequests />)
    await waitFor(() => expect(social.getPendingRequests).toHaveBeenCalled())
    await waitFor(() => expect(screen.getByText('Bob')).toBeInTheDocument())
  })
})
