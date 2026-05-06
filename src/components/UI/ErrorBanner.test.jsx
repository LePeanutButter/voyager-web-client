import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ErrorBanner from './ErrorBanner'

describe('ErrorBanner', () => {
  it('null without message', () => {
    const { container } = render(<ErrorBanner message={null} />)
    expect(container.firstChild).toBeNull()
  })

  it('renders and dismisses', async () => {
    const onDismiss = vi.fn()
    render(<ErrorBanner message="oops" onDismiss={onDismiss} variant="warning" />)
    expect(screen.getByRole('alert')).toHaveTextContent('oops')
    await userEvent.click(screen.getByRole('button', { name: /dismiss/i }))
    expect(onDismiss).toHaveBeenCalled()
  })
})
