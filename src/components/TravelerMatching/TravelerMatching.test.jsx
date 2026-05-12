import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import TravelerMatching from './TravelerMatching'
import * as social from '../../services/socialService'

vi.mock('../../services/socialService', () => ({
  getCompatibleTravelers: vi.fn(),
  sendConnectionRequest: vi.fn(),
}))

const fullTraveler = {
  userId: 42,
  firstName: 'Sam',
  lastName: 'Lee',
  username: 'slee',
  bio: 'Hola mundo',
  compatibilityScore: 88,
  travelPlanTitle: 'Euro',
  destinationLocation: 'Paris',
  travelStartDate: '2026-06-01',
  travelEndDate: '2026-06-10',
  daysOverlap: 3,
  numberOfTravelers: 1,
  profileImageUrl: 'https://example.com/a.png',
}

describe('TravelerMatching', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    social.getCompatibleTravelers.mockResolvedValue([
      { userId: 1, firstName: 'Sam', lastName: 'Lee', username: 'slee' },
    ])
  })

  it('loads compatible travelers', async () => {
    render(<TravelerMatching travelPlanId="plan-1" />)
    await waitFor(() => expect(social.getCompatibleTravelers).toHaveBeenCalledWith('plan-1'))
    await waitFor(() => expect(screen.getByText(/Sam/)).toBeInTheDocument())
  })

  it('sin travelPlanId muestra vacio sin llamar al servicio', async () => {
    render(<TravelerMatching travelPlanId={null} />)
    await waitFor(() =>
      expect(
        screen.getByText('No se encontraron viajeros compatibles para este plan.'),
      ).toBeInTheDocument(),
    )
    expect(social.getCompatibleTravelers).not.toHaveBeenCalled()
  })

  it('lista vacia del backend muestra error y Reintentar', async () => {
    social.getCompatibleTravelers.mockResolvedValueOnce([])
    render(<TravelerMatching travelPlanId="p" />)
    await waitFor(() =>
      expect(
        screen.getByText('No se encontraron viajeros compatibles para este plan'),
      ).toBeInTheDocument(),
    )
    social.getCompatibleTravelers.mockResolvedValueOnce([
      { userId: 9, firstName: 'Zoe', lastName: 'Z', username: 'zz' },
    ])
    await userEvent.click(screen.getByRole('button', { name: /Reintentar/i }))
    await waitFor(() => expect(screen.getByText(/Zoe/)).toBeInTheDocument())
  })

  it('fallo de red muestra mensaje', async () => {
    social.getCompatibleTravelers.mockRejectedValueOnce(new Error('timeout'))
    render(<TravelerMatching travelPlanId="p" />)
    await waitFor(() => expect(screen.getByText('timeout')).toBeInTheDocument())
  })

  it('enviar solicitud exitosa muestra mensaje y quita tarjeta', async () => {
    social.getCompatibleTravelers.mockResolvedValueOnce([{ ...fullTraveler }])
    social.sendConnectionRequest.mockResolvedValueOnce(undefined)
    render(<TravelerMatching travelPlanId="p" />)
    await waitFor(() => expect(screen.getByText('Paris')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Enviar solicitud de conexion/i }))
    await waitFor(() =>
      expect(screen.getByText(/Solicitud de conexion enviada a Sam/)).toBeInTheDocument(),
    )
    expect(screen.queryByText(/Paris/)).not.toBeInTheDocument()
  })

  it('error al enviar solicitud mantiene la tarjeta si la lista sigue cargada', async () => {
    social.getCompatibleTravelers.mockResolvedValueOnce([
      { ...fullTraveler, profileImageUrl: null, numberOfTravelers: 2 },
    ])
    social.sendConnectionRequest.mockRejectedValueOnce(new Error('servicio no disponible'))
    render(<TravelerMatching travelPlanId="p" />)
    await waitFor(() => expect(screen.getByText('Paris')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Enviar solicitud de conexion/i }))
    await waitFor(() => expect(social.sendConnectionRequest).toHaveBeenCalled())
    expect(screen.getByText('Paris')).toBeInTheDocument()
  })
})
