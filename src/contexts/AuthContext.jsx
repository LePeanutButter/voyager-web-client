import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react'
import { authService } from '../services/authService'
import { TOKEN_KEY } from '../services/api'

// ─── State & Actions ─────────────────────────────────────────────────────────

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,    // true on mount until session is restored
  error: null,
}

const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  AUTH_SUCCESS: 'AUTH_SUCCESS',
  AUTH_FAILURE: 'AUTH_FAILURE',
  LOGOUT: 'LOGOUT',
  UPDATE_USER: 'UPDATE_USER',
  CLEAR_ERROR: 'CLEAR_ERROR',
}

function authReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, loading: action.payload, error: null }

    case ACTIONS.AUTH_SUCCESS:
      return {
        ...state,
        user: action.user,
        token: action.token,
        isAuthenticated: true,
        loading: false,
        error: null,
      }

    case ACTIONS.AUTH_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload,
      }

    case ACTIONS.LOGOUT:
      return { ...initialState, loading: false }

    case ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } }

    case ACTIONS.CLEAR_ERROR:
      return { ...state, error: null }

    default:
      return state
  }
}

// ─── Context ─────────────────────────────────────────────────────────────────

const AuthContext = createContext(null)

// ─── Provider ────────────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Restore session from localStorage on mount
  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY)
      const cached = localStorage.getItem('voyager_user')

      if (!token) {
        dispatch({ type: ACTIONS.AUTH_FAILURE, payload: null })
        return
      }

      // Use cached user data immediately, then refresh from server
      if (cached) {
        try {
          const user = JSON.parse(cached)
          dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
        } catch {
          // cached data corrupt — clear it
          localStorage.removeItem('voyager_user')
        }
      }

      // Always validate the token against /users/me
      try {
        const user = await authService.getCurrentUser()
        localStorage.setItem('voyager_user', JSON.stringify(user))
        dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      } catch {
        // Token invalid or expired
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('voyager_user')
        dispatch({ type: ACTIONS.AUTH_FAILURE, payload: null })
      }
    }

    restoreSession()
  }, [])

  // ── Actions ───────────────────────────────────────────────────────────────

  /**
   * Login with credentials (usernameOrEmail + password).
   * Also supports direct session injection: login(userData, token).
   */
  const login = useCallback(async (arg1, arg2) => {
    // Direct injection path (e.g. Google OAuth callback)
    if (typeof arg2 === 'string' && arg2.length > 0) {
      const token = arg2
      const user = arg1 || null
      localStorage.setItem(TOKEN_KEY, token)
      if (user) localStorage.setItem('voyager_user', JSON.stringify(user))
      dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      return { user, token }
    }

    // Standard credential login
    const credentials = arg1
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    try {
      // loginResponseDto: { token, tokenType, expiresIn, user }
      const loginResponse = await authService.login(credentials)
      const token = loginResponse?.token
      const user = loginResponse?.user || loginResponse

      if (!token) throw new Error('No token received from server')

      localStorage.setItem(TOKEN_KEY, token)
      localStorage.setItem('voyager_user', JSON.stringify(user))
      dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      return { user, token }
    } catch (error) {
      dispatch({ type: ACTIONS.AUTH_FAILURE, payload: error.message })
      throw error
    }
  }, [])

  /**
   * Register a new user and auto-login on success.
   */
  const register = useCallback(async (userData) => {
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    try {
      const registered = await authService.register(userData)
      // Auto-login after successful registration
      const token = registered?.token
      const user = registered?.user || registered

      if (token) {
        localStorage.setItem(TOKEN_KEY, token)
        localStorage.setItem('voyager_user', JSON.stringify(user))
        dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
        return { user, token }
      }

      // No token returned — backend requires separate login step
      dispatch({ type: ACTIONS.AUTH_FAILURE, payload: null })
      return registered
    } catch (error) {
      dispatch({ type: ACTIONS.AUTH_FAILURE, payload: error.message })
      throw error
    }
  }, [])

  /**
   * Update the current user's data in context (after profile update).
   */
  const updateUser = useCallback((partial) => {
    dispatch({ type: ACTIONS.UPDATE_USER, payload: partial })
    const updated = { ...state.user, ...partial }
    localStorage.setItem('voyager_user', JSON.stringify(updated))
  }, [state.user])

  /**
   * Clear authentication state and stored tokens.
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('voyager_user')
    // Legacy keys cleanup
    localStorage.removeItem('smartrip_token')
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    dispatch({ type: ACTIONS.LOGOUT })
  }, [])

  const clearError = useCallback(() => {
    dispatch({ type: ACTIONS.CLEAR_ERROR })
  }, [])

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    clearError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export default AuthContext
