import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor, act } from '@testing-library/react'
import { AuthProvider } from './auth-provider.jsx'
import { useAuth } from './use-auth.js'

const authSvc = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  login: vi.fn(),
  register: vi.fn(),
}))

const provisionAi = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

vi.mock('../services/authService', () => ({ authService: authSvc }))
vi.mock('../services/api', () => ({ TOKEN_KEY: 'voyager_token' }))
vi.mock('../services/voyagerCrossService', () => ({
  provisionUserAcrossAiServices: provisionAi,
}))

  function LoginProbe() {
    const { login, loading, isAuthenticated, user } = useAuth()
    return (
      <div>
        <span data-testid="auth">{isAuthenticated ? user?.email : 'guest'}</span>
        <span data-testid="load">{loading ? 'y' : 'n'}</span>
        <button
          type="button"
          onClick={async () => {
            try {
              await login({ usernameOrEmail: 'a', password: 'b' })
            } catch {
              /* error reflected in context */
            }
          }}
        >
          go
        </button>
      </div>
    )
  }

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('restore failure clears token', async () => {
    localStorage.setItem('voyager_token', 'bad')
    authSvc.getCurrentUser.mockRejectedValue(new Error('401'))
    render(
      <AuthProvider>
        <LoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('load').textContent).toBe('n'))
    expect(localStorage.getItem('voyager_token')).toBeNull()
  })

  it('login with credentials', async () => {
    authSvc.login.mockResolvedValue({
      token: 'tok',
      user: { id: 1, email: 'e@e.com', username: 'u', firstName: 'a', lastName: 'b', role: 'USER' },
    })
    render(
      <AuthProvider>
        <LoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('load').textContent).toBe('n'))
    await act(async () => {
      screen.getByRole('button', { name: 'go' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('e@e.com'))
    expect(provisionAi).toHaveBeenCalled()
  })

  it('restore session succeeds with token', async () => {
    localStorage.setItem('voyager_token', 'good')
    authSvc.getCurrentUser.mockResolvedValue({
      id: 9,
      email: 'ok@ok.com',
      name: 'Ok User',
      username: 'ok',
      firstName: 'O',
      lastName: 'K',
      role: 'USER',
    })
    render(
      <AuthProvider>
        <LoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('ok@ok.com'))
    expect(localStorage.getItem('voyager_user')).toContain('ok@ok.com')
    expect(provisionAi).toHaveBeenCalled()
  })

  it('login with prebuilt user and token', async () => {
    function DirectLoginProbe() {
      const { login, isAuthenticated, user } = useAuth()
      return (
        <div>
          <span data-testid="d-auth">{isAuthenticated ? user?.email : 'guest'}</span>
          <button
            type="button"
            onClick={() => login(
              { id: '3', email: 'd@d.com', name: 'D', firstName: 'D', lastName: 'D', username: 'd', role: 'USER' },
              'direct-tok',
            )}
          >
            direct
          </button>
        </div>
      )
    }
    render(
      <AuthProvider>
        <DirectLoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('d-auth').textContent).toBe('guest'))
    await act(async () => {
      screen.getByRole('button', { name: 'direct' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('d-auth').textContent).toBe('d@d.com'))
    expect(localStorage.getItem('voyager_token')).toBe('direct-tok')
    expect(provisionAi).toHaveBeenCalled()
  })

  it('login with token only fetches user then provisions IA', async () => {
    authSvc.getCurrentUser.mockResolvedValue({
      id: 99,
      email: 'tok@tok.com',
      username: 'tok',
      firstName: 'T',
      lastName: 'K',
      role: 'USER',
    })
    function TokenLoginProbe() {
      const { login, user } = useAuth()
      return (
        <div>
          <span data-testid="tok-em">{user?.email ?? 'none'}</span>
          <button type="button" onClick={() => login(null, 'oauth-jwt')}>
            oauth
          </button>
        </div>
      )
    }
    render(
      <AuthProvider>
        <TokenLoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('tok-em').textContent).toBe('none'))
    await act(async () => {
      screen.getByRole('button', { name: 'oauth' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('tok-em').textContent).toBe('tok@tok.com'))
    expect(authSvc.getCurrentUser).toHaveBeenCalled()
    expect(provisionAi).toHaveBeenCalled()
  })

  it('logout and updateUser clearError', async () => {
    function FullProbe() {
      const {
        login, logout, updateUser, clearError, error, user,
      } = useAuth()
      return (
        <div>
          <span data-testid="em">{user?.email ?? 'x'}</span>
          <span data-testid="er">{error ?? ''}</span>
          <button
        type="button"
        onClick={async () => {
          try {
            await login({ usernameOrEmail: 'a', password: 'b' })
          } catch {
            /* surfaced via error state */
          }
        }}
      >
        in
      </button>
          <button type="button" onClick={() => logout()}>out</button>
          <button type="button" onClick={() => updateUser({ name: 'New' })}>upd</button>
          <button type="button" onClick={() => clearError()}>clr</button>
        </div>
      )
    }
    authSvc.login.mockResolvedValue({
      token: 't',
      user: { id: 1, email: 'e@e.com', username: 'u', name: 'Old', role: 'USER' },
    })
    render(
      <AuthProvider>
        <FullProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'in' })).toBeInTheDocument())
    await act(async () => {
      screen.getByRole('button', { name: 'in' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('em').textContent).toBe('e@e.com'))
    await act(async () => {
      screen.getByRole('button', { name: 'upd' }).click()
    })
    expect(JSON.parse(localStorage.getItem('voyager_user')).name).toBe('New')
    authSvc.login.mockRejectedValueOnce(new Error('bad-login'))
    await act(async () => {
      screen.getByRole('button', { name: 'in' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('er').textContent).toBe('bad-login'))
    await act(async () => {
      screen.getByRole('button', { name: 'clr' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('er').textContent).toBe(''))
    await act(async () => {
      screen.getByRole('button', { name: 'out' }).click()
    })
    expect(localStorage.getItem('voyager_token')).toBeNull()
  })

  it('login fails when server returns no token', async () => {
    authSvc.login.mockResolvedValue({ user: {}, token: null })
    render(
      <AuthProvider>
        <LoginProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('load').textContent).toBe('n'))
    await act(async () => {
      screen.getByRole('button', { name: 'go' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('auth').textContent).toBe('guest'))
  })

  it('register failure dispatches error', async () => {
    authSvc.register.mockRejectedValue(new Error('reg-bad'))
    function RegFail() {
      const { register, error } = useAuth()
      return (
        <div>
          <span data-testid="reg-err">{error ?? ''}</span>
          <button
            type="button"
            onClick={async () => {
              try {
                await register({ username: 'u', email: 'e@e.com', password: 'p' })
              } catch {
                /* surfaced via error state */
              }
            }}
          >
            rf
          </button>
        </div>
      )
    }
    render(
      <AuthProvider>
        <RegFail />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByRole('button', { name: 'rf' })).toBeInTheDocument())
    await act(async () => {
      screen.getByRole('button', { name: 'rf' }).click()
    })
    await waitFor(() => expect(screen.getByTestId('reg-err').textContent).toBe('reg-bad'))
  })

  it('register delegates to login', async () => {
    authSvc.register.mockResolvedValue(undefined)
    authSvc.login.mockResolvedValue({
      token: 't2',
      user: { id: 2, email: 'r@r.com', username: 'r', firstName: 'R', lastName: 'R', role: 'USER' },
    })
    function RegProbe() {
      const { register, loading } = useAuth()
      return (
        <div>
          <span data-testid="ld">{loading ? 'y' : 'n'}</span>
          <button
            type="button"
            onClick={() => register({
              username: 'r',
              email: 'r@r.com',
              password: 'pw',
              name: 'R R',
            })}
          >
            reg
          </button>
        </div>
      )
    }
    render(
      <AuthProvider>
        <RegProbe />
      </AuthProvider>,
    )
    await waitFor(() => expect(screen.getByTestId('ld').textContent).toBe('n'))
    await act(async () => {
      screen.getByRole('button', { name: 'reg' }).click()
    })
    await waitFor(() => expect(authSvc.register).toHaveBeenCalled())
  })
})
