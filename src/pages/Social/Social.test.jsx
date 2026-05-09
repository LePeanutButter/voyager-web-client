import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Social from './Social'

const navigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => navigate }
})

vi.mock('../../contexts/use-auth.js', () => ({
  useAuth: () => ({ user: { id: 42 } }),
}))

const discoverLimiter = vi.hoisted(() => ({
  checkDiscoverRefreshAllowed: vi.fn(() => ({ ok: true, code: 'ok', retryAfterMs: 0 })),
  recordDiscoverManualRefresh: vi.fn(),
  DISCOVER_REFRESH_COOLDOWN_MS: 60_000,
}))

vi.mock('../../utils/discoverRefreshLimiter', () => discoverLimiter)

const socialSvc = vi.hoisted(() => ({
  getUserConnections: vi.fn().mockResolvedValue([]),
  getPendingRequests: vi.fn().mockResolvedValue([]),
  getCompatibleTravelers: vi.fn().mockResolvedValue([]),
  getTravelerSummary: vi.fn().mockResolvedValue({}),
  sendConnectionRequest: vi.fn(),
  acceptConnectionRequest: vi.fn(),
  rejectConnectionRequest: vi.fn(),
  removeConnection: vi.fn().mockResolvedValue(undefined),
}))

const travelSvc = vi.hoisted(() => ({
  list: vi.fn().mockResolvedValue([]),
}))

const aiSvc = vi.hoisted(() => ({
  getBuddyRecommendations: vi.fn().mockResolvedValue({ recommendations: [] }),
}))

vi.mock('../../services/socialService', () => ({ socialService: socialSvc }))
vi.mock('../../services/travelService', () => ({ travelService: travelSvc }))
vi.mock('../../services/aiService', () => ({ aiService: aiSvc }))

beforeAll(() => {
  if (typeof HTMLDialogElement !== 'undefined') {
    if (!HTMLDialogElement.prototype.showModal) {
      HTMLDialogElement.prototype.showModal = function showModal() {
        this.setAttribute('open', '')
      }
    }
    if (!HTMLDialogElement.prototype.close) {
      HTMLDialogElement.prototype.close = function close() {
        this.removeAttribute('open')
      }
    }
  }
})

describe('Social', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    navigate.mockClear()
    socialSvc.getUserConnections.mockResolvedValue([
      { connectionId: 'c99', firstName: 'Pat', lastName: 'Lee', username: 'pat' },
    ])
    socialSvc.getPendingRequests.mockResolvedValue([
      { id: 'r1', requesterName: 'Sam', requesterUsername: 'sam' },
    ])
    travelSvc.list.mockResolvedValue([{ id: 'p1', title: 'Euro', destinationLocation: 'Paris' }])
    socialSvc.getCompatibleTravelers.mockResolvedValue([])
    aiSvc.getBuddyRecommendations.mockResolvedValue({})
    discoverLimiter.checkDiscoverRefreshAllowed.mockReturnValue({
      ok: true,
      code: 'ok',
      retryAfterMs: 0,
    })
  })

  it('loads tabs', async () => {
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/Red de viajeros/i)).toBeInTheDocument())
  })

  it('muestra conexiones y abre chat', async () => {
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: /Pat Lee/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Chat/i }))
    expect(navigate).toHaveBeenCalledWith('/social/chat/c99')
  })

  it('pestana solicitudes muestra pendientes', async () => {
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Solicitudes/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Solicitudes/i }))
    await waitFor(() => expect(screen.getByText('Sam')).toBeInTheDocument())
  })

  it('pestana Descubrir carga planes', async () => {
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(() => expect(travelSvc.list).toHaveBeenCalled())
  })

  it('acepta solicitud pendiente', async () => {
    socialSvc.acceptConnectionRequest.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Solicitudes/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Solicitudes/i }))
    await waitFor(() => expect(screen.getByText('Sam')).toBeInTheDocument())
    const row = screen.getByText('Sam').closest('div[style*="space-between"]')
    const acceptBtn = row?.querySelectorAll('button')[0]
    expect(acceptBtn).toBeTruthy()
    await userEvent.click(acceptBtn)
    await waitFor(() => expect(socialSvc.acceptConnectionRequest).toHaveBeenCalledWith('r1'))
  })

  it('rechaza solicitud pendiente', async () => {
    socialSvc.rejectConnectionRequest.mockResolvedValue(undefined)
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Solicitudes/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Solicitudes/i }))
    await waitFor(() => expect(screen.getByText('Sam')).toBeInTheDocument())
    const row = screen.getByText('Sam').closest('div[style*="space-between"]')
    const rejectBtn = row?.querySelectorAll('button')[1]
    expect(rejectBtn).toBeTruthy()
    await userEvent.click(rejectBtn)
    await waitFor(() => expect(socialSvc.rejectConnectionRequest).toHaveBeenCalledWith('r1'))
  })

  it('Descubrir muestra coincidencias y envia solicitud', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    socialSvc.getCompatibleTravelers.mockResolvedValue([
      {
        userId: 10,
        firstName: 'Kim',
        lastName: 'K',
        username: 'kimk',
        compatibilityScore: 0.71,
        destinationLocation: 'Paris',
      },
    ])
    aiSvc.getBuddyRecommendations.mockResolvedValue({ recommendations: [] })
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(
      () => expect(screen.getByRole('heading', { name: /Kim K/i })).toBeInTheDocument(),
      { timeout: 5000 },
    )
    const connectBtns = screen.getAllByRole('button', { name: /Conectar/i })
    await userEvent.click(connectBtns[connectBtns.length - 1])
    await waitFor(() => expect(socialSvc.sendConnectionRequest).toHaveBeenCalled())
    expect(alertSpy).toHaveBeenCalled()
    alertSpy.mockRestore()
  })

  it('actualizar descubrir bloqueado muestra aviso', async () => {
    discoverLimiter.checkDiscoverRefreshAllowed.mockReturnValueOnce({
      ok: false,
      code: 'rate',
      retryAfterMs: 8000,
    })
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Actualizar sugerencias/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Actualizar sugerencias/i }))
    await waitFor(() =>
      expect(screen.getByText(/Has alcanzado el límite de actualizaciones/i)).toBeInTheDocument(),
    )
  })

  it('error al cargar datos muestra banner', async () => {
    socialSvc.getUserConnections.mockRejectedValueOnce(new Error('servicio caido'))
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByText(/servicio caido/i)).toBeInTheDocument())
  })

  it('aceptar solicitud fallida muestra alert', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    socialSvc.acceptConnectionRequest.mockRejectedValueOnce(new Error('fallo'))
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Solicitudes/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Solicitudes/i }))
    await waitFor(() => expect(screen.getByText('Sam')).toBeInTheDocument())
    const row = screen.getByText('Sam').closest('div[style*="space-between"]')
    await userEvent.click(row?.querySelectorAll('button')[0])
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('fallo'))
    alertSpy.mockRestore()
  })

  it('rechazar solicitud fallida muestra alert', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    socialSvc.rejectConnectionRequest.mockRejectedValueOnce(new Error('rechazo bad'))
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Solicitudes/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Solicitudes/i }))
    await waitFor(() => expect(screen.getByText('Sam')).toBeInTheDocument())
    const row = screen.getByText('Sam').closest('div[style*="space-between"]')
    await userEvent.click(row?.querySelectorAll('button')[1])
    await waitFor(() => expect(alertSpy).toHaveBeenCalledWith('rechazo bad'))
    alertSpy.mockRestore()
  })

  it('refresh descubrir con codigo no rate muestra otro mensaje', async () => {
    discoverLimiter.checkDiscoverRefreshAllowed.mockReturnValueOnce({
      ok: false,
      code: 'other',
      retryAfterMs: 3000,
    })
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /Actualizar sugerencias/i })).toBeInTheDocument(),
    )
    await userEvent.click(screen.getByRole('button', { name: /Actualizar sugerencias/i }))
    await waitFor(() =>
      expect(screen.getByText(/Por seguridad, espera/i)).toBeInTheDocument(),
    )
  })

  it('cierra perfil viajero con Escape y boton Cerrar', async () => {
    socialSvc.getTravelerSummary.mockResolvedValue({ bio: 'BioPerfilCerrar' })
    socialSvc.getCompatibleTravelers.mockResolvedValue([])
    aiSvc.getBuddyRecommendations.mockResolvedValue({
      recommendations: [
        {
          userId: 77,
          name: 'IA Buddy',
          username: 'iab',
          compatibilityScore: 0.9,
          sharedDestinations: ['Lima'],
        },
      ],
    })
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(() => expect(screen.getByText(/Recomendados por IA/i)).toBeInTheDocument())
    await userEvent.click(screen.getAllByRole('button', { name: /IA Buddy/i })[0])
    await waitFor(() => expect(screen.getByText('BioPerfilCerrar')).toBeInTheDocument())
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByText('BioPerfilCerrar')).not.toBeInTheDocument())
    await userEvent.click(screen.getAllByRole('button', { name: /IA Buddy/i })[0])
    await waitFor(() => expect(screen.getByText('BioPerfilCerrar')).toBeInTheDocument())
    const profileDialog = await waitFor(() => {
      const el = document.querySelector('dialog.social-profile-modal')
      if (!el) throw new Error('dialog perfil no montado')
      return el
    })
    // <dialog> sin `open` puede excluir hijos del árbol a11y; hidden: true permite consultar el botón
    const cerrarBtn = within(profileDialog).getByRole('button', { name: /Cerrar/i, hidden: true })
    await userEvent.click(cerrarBtn)
    await waitFor(() => expect(screen.queryByText('BioPerfilCerrar')).not.toBeInTheDocument())
  })

  it('abre dialogo de perfil al pulsar tarjeta IA', async () => {
    socialSvc.getTravelerSummary.mockResolvedValue({ bio: 'Hola', interests: ['arte'] })
    socialSvc.getCompatibleTravelers.mockResolvedValue([])
    aiSvc.getBuddyRecommendations.mockResolvedValue({
      recommendations: [
        { userId: 77, name: 'IA Buddy', username: 'iab', compatibilityScore: 0.9, sharedDestinations: ['X'] },
      ],
    })
    render(
      <MemoryRouter>
        <Social />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: /Descubrir/i })).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Descubrir/i }))
    await waitFor(() => expect(screen.getByText(/Recomendados por IA/i)).toBeInTheDocument())
    const aiBuddyBtns = screen.getAllByRole('button', { name: /IA Buddy/i })
    await userEvent.click(aiBuddyBtns[0])
    await waitFor(() => expect(screen.getByText('Hola')).toBeInTheDocument(), { timeout: 5000 })
    expect(screen.getByText(/Intereses: arte/)).toBeInTheDocument()
    expect(document.querySelector('dialog.social-profile-modal')).toBeTruthy()
  })
})
