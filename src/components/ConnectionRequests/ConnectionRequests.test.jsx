import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
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

  it('lista vacia muestra estado vacio', async () => {
    render(<ConnectionRequests />)
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /No hay solicitudes pendientes/i })).toBeInTheDocument(),
    )
  })

  it('fallo al cargar muestra error', async () => {
    social.getPendingRequests.mockRejectedValueOnce(new Error('red'))
    render(<ConnectionRequests />)
    await waitFor(() => expect(screen.getByText('red')).toBeInTheDocument())
  })

  it('aceptar elimina la tarjeta', async () => {
    social.getPendingRequests.mockResolvedValue([
      {
        id: 'r9',
        createdAt: '2024-06-01T10:00:00Z',
        requesterName: 'Ann',
        message: 'Hola',
        requesterProfileImage: null,
      },
    ])
    social.acceptConnectionRequest.mockResolvedValue(undefined)
    render(<ConnectionRequests />)
    await waitFor(() => expect(screen.getByText('Ann')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^Aceptar$/ }))
    await waitFor(() => expect(social.acceptConnectionRequest).toHaveBeenCalledWith('r9'))
    await waitFor(() => expect(screen.queryByText('Ann')).not.toBeInTheDocument())
    expect(screen.getByText(/Solicitud de conexion aceptada/)).toBeInTheDocument()
  })

  it('rechazar elimina la tarjeta', async () => {
    social.getPendingRequests.mockResolvedValue([
      { id: 'r2', createdAt: '2024-06-01T10:00:00Z', requesterName: 'Ben', requesterProfileImage: 'https://x/y.png' },
    ])
    social.rejectConnectionRequest.mockResolvedValue(undefined)
    render(<ConnectionRequests />)
    await waitFor(() => expect(screen.getByRole('img', { name: 'Ben' })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /^Rechazar$/ }))
    await waitFor(() => expect(social.rejectConnectionRequest).toHaveBeenCalledWith('r2'))
    await waitFor(() => expect(screen.queryByText('Ben')).not.toBeInTheDocument())
  })

  it('cierra banner de error', async () => {
    social.getPendingRequests.mockRejectedValueOnce(new Error('x'))
    render(<ConnectionRequests />)
    await waitFor(() => expect(screen.getByText('x')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: '×' }))
    expect(screen.queryByText('x')).not.toBeInTheDocument()
  })
})
