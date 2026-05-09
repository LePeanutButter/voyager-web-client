import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import SettingsPage from './SettingsPage'
import { ThemeProvider } from '../../contexts/theme-provider.jsx'

describe('SettingsPage', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.clearAllMocks()
  })

  function renderPage() {
    return render(
      <MemoryRouter>
        <ThemeProvider>
          <SettingsPage />
        </ThemeProvider>
      </MemoryRouter>,
    )
  }

  it('renderiza secciones y enlaces', () => {
    renderPage()
    expect(screen.getByRole('heading', { name: /Configuracion/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Configurar perfil de viaje/i })).toHaveAttribute(
      'href',
      '/travel-preferences',
    )
    expect(screen.getByRole('link', { name: /Ver análisis de comportamiento/i })).toHaveAttribute(
      'href',
      '/behavior-analysis',
    )
  })

  it('alterna modo oscuro y sugerencias', async () => {
    renderPage()
    const checkboxes = screen.getAllByRole('checkbox')
    expect(checkboxes.length).toBeGreaterThanOrEqual(2)
    await userEvent.click(checkboxes[0])
    await userEvent.click(checkboxes[1])
    expect(localStorage.getItem('smartrip_settings')).toBeTruthy()
  })

  it('cambia visibilidad del perfil', async () => {
    renderPage()
    const select = screen.getByRole('combobox')
    await userEvent.selectOptions(select, 'private')
    const raw = JSON.parse(localStorage.getItem('smartrip_settings') || '{}')
    expect(raw.profileVisibility).toBe('private')
  })

  it('parse corrupto en localStorage usa valores por defecto', () => {
    localStorage.setItem('smartrip_settings', 'not-json')
    renderPage()
    expect(screen.getByRole('heading', { name: /Configuracion/i })).toBeInTheDocument()
  })
})
