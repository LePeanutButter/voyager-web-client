import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CatalogDestinationsPanel } from './CatalogDestinationsPanel'

const catalogLimiter = vi.hoisted(() => ({
  checkCatalogRefreshAllowed: vi.fn(() => ({ ok: true, code: 'ok', retryAfterMs: 0 })),
  recordCatalogManualRefresh: vi.fn(),
  CATALOG_REFRESH_COOLDOWN_MS: 60_000,
}))

vi.mock('../../utils/catalogRefreshLimiter', () => catalogLimiter)

vi.mock('../../services/travelService', () => ({
  travelService: {
    getActivitiesByGeo: vi.fn(),
    getHotelsByCity: vi.fn(),
  },
}))

import { travelService } from '../../services/travelService'

describe('CatalogDestinationsPanel', () => {
  const onPick = vi.fn()
  const plan = { destinationLocation: 'París', id: 1 }

  beforeEach(() => {
    vi.clearAllMocks()
    catalogLimiter.checkCatalogRefreshAllowed.mockReturnValue({
      ok: true,
      code: 'ok',
      retryAfterMs: 0,
    })
    travelService.getActivitiesByGeo.mockResolvedValue({
      data: [{ id: 'a1', name: 'Tour guiado', rating: 4.2, shortDescription: 'City' }],
    })
    travelService.getHotelsByCity.mockResolvedValue({
      data: [{ hotelId: 'h1', name: 'Hotel Demo' }],
    })
  })

  it('carga actividades y hoteles', async () => {
    render(<CatalogDestinationsPanel plan={plan} onPickCatalogActivity={onPick} />)
    await waitFor(() => expect(screen.getByText('Tour guiado')).toBeInTheDocument())
    expect(screen.getByText('Hotel Demo')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /Añadir al plan/i }))
    expect(onPick).toHaveBeenCalled()
  })

  it('refresh bloqueado muestra aviso', async () => {
    catalogLimiter.checkCatalogRefreshAllowed.mockReturnValueOnce({
      ok: false,
      code: 'rate',
      retryAfterMs: 5000,
    })
    render(<CatalogDestinationsPanel plan={plan} onPickCatalogActivity={onPick} />)
    await waitFor(() => expect(screen.getByText('Tour guiado')).toBeInTheDocument())
    await userEvent.click(screen.getByRole('button', { name: /Actualizar catálogo/i }))
    await waitFor(() => expect(screen.getByText(/Límite de actualizaciones/i)).toBeInTheDocument())
  })

  it('error de red muestra mensaje', async () => {
    travelService.getActivitiesByGeo.mockRejectedValueOnce(new Error('timeout'))
    render(<CatalogDestinationsPanel plan={plan} onPickCatalogActivity={onPick} />)
    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/timeout/i))
  })
})
