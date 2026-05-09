import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Routes, Route, useNavigate } from 'react-router-dom'
import Layout from './Layout'

function GoSettings() {
  const nav = useNavigate()
  return (
    <button type="button" onClick={() => nav('/settings')}>
      ir-settings
    </button>
  )
}

vi.mock('../Header/Header', () => ({
  default: () => <div data-testid="hdr">Header</div>,
}))

vi.mock('../Sidebar/Sidebar', () => ({
  default: () => <div data-testid="sbar">Sidebar</div>,
}))

vi.mock('../Footer/Footer', () => ({
  default: () => <div data-testid="ftr">Footer</div>,
}))

describe('Layout', () => {
  let scrollToSpy

  beforeEach(() => {
    vi.clearAllMocks()
    scrollToSpy = vi.spyOn(globalThis, 'scrollTo').mockImplementation(() => {})
  })

  afterEach(() => {
    scrollToSpy.mockRestore()
  })

  function renderAt(path) {
    return render(
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route element={<Layout />}>
            <Route path="*" element={<div data-testid="out">Page</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
  }

  it('oculta Sidebar en rutas de marketing', () => {
    renderAt('/login')
    expect(screen.getByTestId('hdr')).toBeInTheDocument()
    expect(screen.queryByTestId('sbar')).not.toBeInTheDocument()
    expect(screen.getByTestId('out')).toBeInTheDocument()
  })

  it('muestra Sidebar fuera de marketing', () => {
    renderAt('/dashboard')
    expect(screen.getByTestId('sbar')).toBeInTheDocument()
  })

  it('reinicia scroll del main y de window al cambiar pathname', async () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route element={<Layout />}>
            <Route
              path="/dashboard"
              element={(
                <div>
                  <GoSettings />
                  <div data-testid="out">A</div>
                </div>
              )}
            />
            <Route path="/settings" element={<div data-testid="out">B</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    const main = document.querySelector('main.main-content')
    main.scrollTop = 99
    scrollToSpy.mockClear()
    await userEvent.click(screen.getByRole('button', { name: /ir-settings/i }))
    expect(main.scrollTop).toBe(0)
    expect(scrollToSpy).toHaveBeenCalledWith(0, 0)
  })
})
