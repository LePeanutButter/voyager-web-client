import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import ConnectionRequestsPage from './ConnectionRequestsPage'

vi.mock('../../components/ConnectionRequests/ConnectionRequests', () => ({
  default: () => <div data-testid="cr-mock">ConnectionRequests mock</div>,
}))

describe('ConnectionRequestsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header and embedded component', () => {
    render(<ConnectionRequestsPage />)
    expect(screen.getByRole('heading', { name: /Connection Requests/i })).toBeInTheDocument()
    expect(screen.getByTestId('cr-mock')).toBeInTheDocument()
  })
})
