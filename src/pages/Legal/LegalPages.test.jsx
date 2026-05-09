import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import PrivacyPolicyPage from './PrivacyPolicyPage'
import TermsPage from './TermsPage'
import CookiesPage from './CookiesPage'

describe('Legal pages', () => {
  it('PrivacyPolicyPage renderiza titulo', () => {
    render(<PrivacyPolicyPage />)
    expect(screen.getByRole('heading', { name: /Politica de Privacidad/i })).toBeInTheDocument()
    expect(screen.getByText(/Informacion que recopilamos/i)).toBeInTheDocument()
  })

  it('TermsPage renderiza titulo', () => {
    render(<TermsPage />)
    expect(screen.getByRole('heading', { name: /Terminos de Servicio/i })).toBeInTheDocument()
  })

  it('CookiesPage renderiza titulo', () => {
    render(<CookiesPage />)
    expect(screen.getByRole('heading', { name: /Politica de Cookies/i })).toBeInTheDocument()
  })
})
