import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import QuickEditModal from './QuickEditModal'
import { travelService } from '../../services/travelService'

vi.mock('../../services/travelService', () => ({
  travelService: { update: vi.fn() },
}))

const currentData = {
  title: 'Mi plan',
  destinationLocation: 'Lisboa',
  originLocation: 'Madrid',
  startDate: '2026-05-01',
  endDate: '2026-05-07',
  estimatedBudget: 500,
  numberOfTravelers: 1,
}

describe('QuickEditModal', () => {
  const onClose = vi.fn()
  const onUpdate = vi.fn()

  beforeEach(() => {
    vi.clearAllMocks()
    travelService.update.mockResolvedValue({})
  })

  it('no renderiza si isOpen es false', () => {
    const { container } = render(
      <QuickEditModal isOpen={false} onClose={onClose} planId="1" onUpdate={onUpdate} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('guarda cambios y cierra', async () => {
    render(
      <QuickEditModal
        isOpen
        onClose={onClose}
        planId="7"
        currentData={currentData}
        onUpdate={onUpdate}
      />,
    )
    expect(screen.getByText('Editar Detalles Rápidos')).toBeInTheDocument()
    const dest = screen.getByPlaceholderText('Ciudad de destino')
    await userEvent.clear(dest)
    await userEvent.type(dest, 'Oporto')
    await userEvent.click(screen.getByRole('button', { name: /^Guardar$/i }))
    await waitFor(() => expect(travelService.update).toHaveBeenCalled())
    expect(onUpdate).toHaveBeenCalled()
    expect(onClose).toHaveBeenCalled()
  })

  it('destino vacio muestra alert', async () => {
    const alertSpy = vi.spyOn(globalThis, 'alert').mockImplementation(() => {})
    const { container } = render(
      <QuickEditModal
        isOpen
        onClose={onClose}
        planId="7"
        currentData={{ ...currentData, destinationLocation: 'X' }}
        onUpdate={onUpdate}
      />,
    )
    const dest = screen.getByPlaceholderText('Ciudad de destino')
    await userEvent.clear(dest)
    const form = container.querySelector('form')
    expect(form).toBeTruthy()
    fireEvent.submit(form)
    expect(alertSpy).toHaveBeenCalledWith('El destino es requerido')
    alertSpy.mockRestore()
  })

  it('cierra con backdrop', async () => {
    render(
      <QuickEditModal isOpen onClose={onClose} planId="1" currentData={currentData} onUpdate={onUpdate} />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Cerrar modal/i }))
    expect(onClose).toHaveBeenCalled()
  })
})
