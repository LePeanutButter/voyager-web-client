import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  user: null,
  token: null,
  isAuthenticated: false,
  loading: true,
  error: null
}

// Action types
const AUTH_ACTIONS = {
  LOGIN_START: 'LOGIN_START',
  LOGIN_SUCCESS: 'LOGIN_SUCCESS',
  LOGIN_FAILURE: 'LOGIN_FAILURE',
  LOGOUT: 'LOGOUT',
  REGISTER_START: 'REGISTER_START',
  REGISTER_SUCCESS: 'REGISTER_SUCCESS',
  REGISTER_FAILURE: 'REGISTER_FAILURE',
  LOAD_USER_START: 'LOAD_USER_START',
  LOAD_USER_SUCCESS: 'LOAD_USER_SUCCESS',
  LOAD_USER_FAILURE: 'LOAD_USER_FAILURE',
  CLEAR_ERROR: 'CLEAR_ERROR'
}

// Reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
    case AUTH_ACTIONS.REGISTER_START:
    case AUTH_ACTIONS.LOAD_USER_START:
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_SUCCESS:
    case AUTH_ACTIONS.REGISTER_SUCCESS:
    case AUTH_ACTIONS.LOAD_USER_SUCCESS:
      return {
        ...state,
        user: action.payload,
        token: action.token || state.token,
        isAuthenticated: true,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.LOGIN_FAILURE:
    case AUTH_ACTIONS.REGISTER_FAILURE:
    case AUTH_ACTIONS.LOAD_USER_FAILURE:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      }
    
    case AUTH_ACTIONS.LOGOUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
        error: null
      }
    
    case AUTH_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

// Create context
const AuthContext = createContext()

// Provider component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Load user from localStorage on mount
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('smartrip_token') || localStorage.getItem('token')
      const userData = localStorage.getItem('userData')
      
      if (token && userData) {
        try {
          const user = JSON.parse(userData)
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: user, token })
        } catch (error) {
          localStorage.removeItem('smartrip_token')
          localStorage.removeItem('token')
          localStorage.removeItem('userData')
          dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: 'Failed to load user data' })
        }
      } else if (token) {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_SUCCESS, payload: null, token })
      } else {
        dispatch({ type: AUTH_ACTIONS.LOAD_USER_FAILURE, payload: null })
      }
    }

    loadUser()
  }, [])

  // Login action (supports both: login(credentials) and login(userData, token))
  const login = async (arg1, arg2) => {
    // If token is provided, treat as "set session"
    if (typeof arg2 === 'string' && arg2.length > 0) {
      const userData = arg1 || null
      const token = arg2
      localStorage.setItem('smartrip_token', token)
      localStorage.setItem('token', token)
      localStorage.setItem('userData', JSON.stringify(userData || {}))
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: userData, token })
      return { token, user: userData }
    }

    const credentials = arg1
    dispatch({ type: AUTH_ACTIONS.LOGIN_START })
    
    try {
      // Simulate API call
      const response = await mockLogin(credentials)
      
      localStorage.setItem('smartrip_token', response.token)
      localStorage.setItem('token', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      
      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: response.user, token: response.token })
      return response
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message })
      throw error
    }
  }

  // Register action
  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.REGISTER_START })
    
    try {
      // Simulate API call
      const response = await mockRegister(userData)
      
      localStorage.setItem('smartrip_token', response.token)
      localStorage.setItem('token', response.token)
      localStorage.setItem('userData', JSON.stringify(response.user))
      
      dispatch({ type: AUTH_ACTIONS.REGISTER_SUCCESS, payload: response.user, token: response.token })
      return response
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.REGISTER_FAILURE, payload: error.message })
      throw error
    }
  }

  // Logout action
  const logout = () => {
    localStorage.removeItem('smartrip_token')
    localStorage.removeItem('token')
    localStorage.removeItem('userData')
    dispatch({ type: AUTH_ACTIONS.LOGOUT })
  }

  // Clear error
  const clearError = () => {
    dispatch({ type: AUTH_ACTIONS.CLEAR_ERROR })
  }

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

// Mock API functions (replace with real API calls)
const mockLogin = async (credentials) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (credentials.email === 'demo@tourismai.com' && credentials.password === 'password') {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 1,
            name: 'Demo User',
            email: 'demo@tourismai.com',
            role: 'user'
          }
        })
      } else {
        reject(new Error('Invalid credentials'))
      }
    }, 1000)
  })
}

const mockRegister = async (userData) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (userData.email && userData.password) {
        resolve({
          token: 'mock-jwt-token',
          user: {
            id: 2,
            name: userData.name || userData.email.split('@')[0],
            email: userData.email,
            role: 'user'
          }
        })
      } else {
        reject(new Error('Invalid registration data'))
      }
    }, 1000)
  })
}
