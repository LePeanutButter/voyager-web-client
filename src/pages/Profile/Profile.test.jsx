import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import Profile from './Profile'

describe('Profile', () => {
  it('renders', () => {
    render(<Profile />)
    expect(screen.getByRole('heading', { level: 1, name: 'Profile' })).toBeInTheDocument()
  })
})
