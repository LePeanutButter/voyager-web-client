import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AdaptiveUIProvider, useAdaptiveUI } from './adaptive-ui-provider.jsx'

const aiSvc = vi.hoisted(() => ({
  getAdaptiveMenu: vi.fn(),
  getAdaptiveHomeFeed: vi.fn(),
}))

vi.mock('../services/aiService', () => ({ aiService: aiSvc }))

const mockUser = vi.fn(() => ({ id: '42' }))

vi.mock('./use-auth.js', () => ({
  useAuth: () => ({ user: mockUser() }),
}))

function Probe() {
  const { menuData, feedLayout, loading, loadError, refetch, clearLoadError } = useAdaptiveUI()
  return (
    <div>
      <span data-testid="loading">{loading ? 'y' : 'n'}</span>
      <span data-testid="err">{loadError ?? ''}</span>
      <span data-testid="menu">{menuData ? 'has' : 'none'}</span>
      <span data-testid="feed">{feedLayout ? 'has' : 'none'}</span>
      <button type="button" onClick={() => refetch()}>
        refetch
      </button>
      <button type="button" onClick={() => clearLoadError()}>
        clear
      </button>
    </div>
  )
}

describe('AdaptiveUIProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUser.mockReturnValue({ id: '42' })
    aiSvc.getAdaptiveMenu.mockResolvedValue({ items: [] })
    aiSvc.getAdaptiveHomeFeed.mockResolvedValue({ blocks: [] })
  })

  it('carga menu y feed cuando hay usuario', async () => {
    render(
      <AdaptiveUIProvider>
        <Probe />
      </AdaptiveUIProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('menu').textContent).toBe('has'))
    expect(screen.getByTestId('feed').textContent).toBe('has')
    expect(aiSvc.getAdaptiveMenu).toHaveBeenCalledWith('42')
    expect(aiSvc.getAdaptiveHomeFeed).toHaveBeenCalledWith('42')
  })

  it('sin usuario id no llama al servicio', async () => {
    mockUser.mockReturnValue({ id: '' })
    render(
      <AdaptiveUIProvider>
        <Probe />
      </AdaptiveUIProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('loading').textContent).toBe('n'))
    expect(aiSvc.getAdaptiveMenu).not.toHaveBeenCalled()
    expect(screen.getByTestId('menu').textContent).toBe('none')
  })

  it('respuestas no objeto se normalizan a null', async () => {
    aiSvc.getAdaptiveMenu.mockResolvedValue('bad')
    aiSvc.getAdaptiveHomeFeed.mockResolvedValue(123)
    render(
      <AdaptiveUIProvider>
        <Probe />
      </AdaptiveUIProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('menu').textContent).toBe('none'))
    expect(screen.getByTestId('feed').textContent).toBe('none')
  })

  it('error de red expone mensaje y clearLoadError lo limpia', async () => {
    aiSvc.getAdaptiveMenu.mockRejectedValue(new Error('timeout'))
    render(
      <AdaptiveUIProvider>
        <Probe />
      </AdaptiveUIProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('err').textContent).toBe('timeout'))
    await act(async () => {
      screen.getByRole('button', { name: 'clear' }).click()
    })
    expect(screen.getByTestId('err').textContent).toBe('')
  })

  it('error sin message usa texto por defecto', async () => {
    aiSvc.getAdaptiveMenu.mockRejectedValue({})
    render(
      <AdaptiveUIProvider>
        <Probe />
      </AdaptiveUIProvider>,
    )
    await waitFor(() =>
      expect(screen.getByTestId('err').textContent).toBe('No se pudo cargar la UI adaptativa.'),
    )
  })

  it('useAdaptiveUI fuera del provider lanza', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {})
    try {
      expect(() => render(<Probe />)).toThrow(/useAdaptiveUI debe usarse dentro de AdaptiveUIProvider/)
    } finally {
      spy.mockRestore()
    }
  })
})
