import { useReducer, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { authService } from '../services/authService'
import { TOKEN_KEY } from '../services/api'
import { AuthContext } from './auth-context.js'

const sanitizeUser = (user) => {
  if (!user || typeof user !== 'object') return null

  return {
    id: String(user.id ?? ''),
    name: String(user.name ?? ''),
    email: String(user.email ?? ''),
    firstName: String(user.firstName ?? ''),
    lastName: String(user.lastName ?? ''),
    username: String(user.username ?? ''),
    role: String(user.role ?? 'USER'),
  }
}

const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
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

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  useEffect(() => {
    const restoreSession = async () => {
      const token = localStorage.getItem(TOKEN_KEY)

      if (!token) {
        dispatch({ type: ACTIONS.AUTH_FAILURE, payload: null })
        return
      }

      try {
        const rawUser = await authService.getCurrentUser()
        const user = sanitizeUser(rawUser)
        localStorage.setItem('voyager_user', JSON.stringify(user))
        dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      } catch {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem('voyager_user')
        dispatch({ type: ACTIONS.AUTH_FAILURE, payload: null })
      }
    }

    restoreSession()
  }, [])

  const login = useCallback(async (arg1, arg2) => {
    if (typeof arg2 === 'string' && arg2.length > 0) {
      const token = arg2
      const user = sanitizeUser(arg1)
      localStorage.setItem(TOKEN_KEY, token)
      if (user) localStorage.setItem('voyager_user', JSON.stringify(user))
      dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      return { user, token }
    }

    const credentials = arg1
    dispatch({ type: ACTIONS.SET_LOADING, payload: true })
    try {
      const loginResponse = await authService.login(credentials)
      const token = loginResponse?.token
      const rawUser = loginResponse?.user

      if (!token) throw new Error('No token received from server')

      const user = sanitizeUser(rawUser)
      localStorage.setItem(TOKEN_KEY, token)
      if (user) localStorage.setItem('voyager_user', JSON.stringify(user))
      dispatch({ type: ACTIONS.AUTH_SUCCESS, user, token })
      return { user, token }
    } catch (error) {
      dispatch({ type: ACTIONS.AUTH_FAILURE, payload: error.message })
      throw error
    }
  }, [])

  const register = useCallback(
    async (userData) => {
      dispatch({ type: ACTIONS.SET_LOADING, payload: true })
      try {
        await authService.register(userData)
        return await login({
          usernameOrEmail: userData.username || userData.email,
          password: userData.password,
        })
      } catch (error) {
        dispatch({ type: ACTIONS.AUTH_FAILURE, payload: error.message })
        throw error
      }
    },
    [login],
  )

  const updateUser = useCallback((partial) => {
    dispatch({ type: ACTIONS.UPDATE_USER, payload: partial })
    const updated = { ...state.user, ...partial }
    localStorage.setItem('voyager_user', JSON.stringify(updated))
  }, [state.user])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem('voyager_user')
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

AuthProvider.propTypes = {
  children: PropTypes.node,
}
