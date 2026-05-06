import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const a = await vi.importActual('react-router-dom')
  return { ...a, useNavigate: () => navigate }
})

import TravelPlanning from './TravelPlanning'

describe('TravelPlanning', () => {
  it('redirects to my-travels', () => {
    render(
      <MemoryRouter>
        <TravelPlanning />
      </MemoryRouter>,
    )
    expect(screen.getByText(/redirecting to my travels/i)).toBeInTheDocument()
    expect(navigate).toHaveBeenCalledWith('/my-travels', { replace: true })
  })
})
