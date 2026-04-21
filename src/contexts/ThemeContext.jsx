import React, { createContext, useContext, useReducer, useEffect } from 'react'

// Initial state
const initialState = {
  theme: 'light',
  sidebarOpen: false,
  language: 'en'
}

// Action types
const THEME_ACTIONS = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_LANGUAGE: 'SET_LANGUAGE'
}

// Reducer
const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.TOGGLE_THEME:
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      return {
        ...state,
        theme: newTheme
      }
    
    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload
      }
    
    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen
      }
    
    case THEME_ACTIONS.SET_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload
      }
    
    case THEME_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload
      }
    
    default:
      return state
  }
}

// Create context
const ThemeContext = createContext()

// Provider component
export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState)

  // Load theme from localStorage on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme')
    const savedLanguage = localStorage.getItem('language')
    
    if (savedTheme) {
      dispatch({ type: THEME_ACTIONS.SET_THEME, payload: savedTheme })
    }
    
    if (savedLanguage) {
      dispatch({ type: THEME_ACTIONS.SET_LANGUAGE, payload: savedLanguage })
    }
  }, [])

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme)
    localStorage.setItem('theme', state.theme)
  }, [state.theme])

  // Save language preference
  useEffect(() => {
    localStorage.setItem('language', state.language)
  }, [state.language])

  // Actions
  const toggleTheme = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_THEME })
  }

  const setTheme = (theme) => {
    dispatch({ type: THEME_ACTIONS.SET_THEME, payload: theme })
  }

  const toggleSidebar = () => {
    dispatch({ type: THEME_ACTIONS.TOGGLE_SIDEBAR })
  }

  const setSidebar = (open) => {
    dispatch({ type: THEME_ACTIONS.SET_SIDEBAR, payload: open })
  }

  const setLanguage = (language) => {
    dispatch({ type: THEME_ACTIONS.SET_LANGUAGE, payload: language })
  }

  const value = {
    ...state,
    toggleTheme,
    setTheme,
    toggleSidebar,
    setSidebar,
    setLanguage
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

// Custom hook
export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
