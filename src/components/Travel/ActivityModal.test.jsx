import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ActivityModal from './ActivityModal'

describe('ActivityModal', () => {
  it('returns null when closed', () => {
    const { container } = render(
      <ActivityModal isOpen={false} onClose={vi.fn()} onSubmit={vi.fn()} />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('validates required title', async () => {
    const onSubmit = vi.fn()
    render(
      <ActivityModal
        isOpen
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    )
    await userEvent.click(screen.getByRole('button', { name: /Crear actividad/i }))
    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText('El titulo es obligatorio')).toBeInTheDocument()
  })
})
