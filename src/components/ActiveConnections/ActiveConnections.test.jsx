import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ActiveConnections from './ActiveConnections'
import * as social from '../../services/socialService'

vi.mock('../../services/socialService', () => ({
  getUserConnections: vi.fn(),
  removeConnection: vi.fn(),
}))

describe('ActiveConnections', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    social.getUserConnections.mockResolvedValue([])
  })

  it('shows sign-in notice when userId is null', () => {
    render(
      <MemoryRouter>
        <ActiveConnections userId={null} />
      </MemoryRouter>,
    )
    expect(screen.getByText(/Inicia sesión/i)).toBeInTheDocument()
  })

  it('loads and lists connections', async () => {
    social.getUserConnections.mockResolvedValue([
      { id: 10, firstName: 'Ada', lastName: 'Lovelace' },
    ])
    render(
      <MemoryRouter>
        <ActiveConnections userId={42} />
      </MemoryRouter>,
    )
    await waitFor(() => expect(social.getUserConnections).toHaveBeenCalledWith(42))
    await waitFor(() => expect(screen.getByText(/Ada/)).toBeInTheDocument())
  })
})
