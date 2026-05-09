import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from './App'

describe('App', () => {
  it('renders marketing home', async () => {
    render(<App />)
    expect(
      await screen.findByText(/Recomendaciones inteligentes\./i),
    ).toBeInTheDocument()
  })
})
