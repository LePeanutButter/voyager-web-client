import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import PrivateRoute from './PrivateRoute'
import { TOKEN_KEY } from '../services/api'

describe('PrivateRoute', () => {
  beforeEach(() => localStorage.clear())

  it('redirects without token', () => {
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="profile" element={<div>prof</div>} />
          </Route>
          <Route path="/login" element={<div>login page</div>} />
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('login page')).toBeInTheDocument()
  })

  it('allows with token', () => {
    localStorage.setItem(TOKEN_KEY, 'tok')
    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="profile" element={<div>prof</div>} />
          </Route>
        </Routes>
      </MemoryRouter>,
    )
    expect(screen.getByText('prof')).toBeInTheDocument()
  })
})
