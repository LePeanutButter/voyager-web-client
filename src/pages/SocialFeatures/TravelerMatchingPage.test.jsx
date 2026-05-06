import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import TravelerMatchingPage from './TravelerMatchingPage'

vi.mock('../../components/TravelerMatching/TravelerMatching', () => ({
  default: () => <div data-testid="tm-mock">TravelerMatching mock</div>,
}))

describe('TravelerMatchingPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders page header', () => {
    render(<TravelerMatchingPage />)
    expect(screen.getByRole('heading', { name: /Find Compatible Travelers/i })).toBeInTheDocument()
    expect(screen.getByTestId('tm-mock')).toBeInTheDocument()
  })
})
