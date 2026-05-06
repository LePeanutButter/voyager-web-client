import { useReducer, useEffect } from 'react'
import PropTypes from 'prop-types'
import { ThemeContext } from './theme-context.js'

const initialState = {
  theme: 'light',
  sidebarOpen: false,
  language: 'en',
}

const THEME_ACTIONS = {
  TOGGLE_THEME: 'TOGGLE_THEME',
  SET_THEME: 'SET_THEME',
  TOGGLE_SIDEBAR: 'TOGGLE_SIDEBAR',
  SET_SIDEBAR: 'SET_SIDEBAR',
  SET_LANGUAGE: 'SET_LANGUAGE',
}

const themeReducer = (state, action) => {
  switch (action.type) {
    case THEME_ACTIONS.TOGGLE_THEME: {
      const newTheme = state.theme === 'light' ? 'dark' : 'light'
      return {
        ...state,
        theme: newTheme,
      }
    }

    case THEME_ACTIONS.SET_THEME:
      return {
        ...state,
        theme: action.payload,
      }

    case THEME_ACTIONS.TOGGLE_SIDEBAR:
      return {
        ...state,
        sidebarOpen: !state.sidebarOpen,
      }

    case THEME_ACTIONS.SET_SIDEBAR:
      return {
        ...state,
        sidebarOpen: action.payload,
      }

    case THEME_ACTIONS.SET_LANGUAGE:
      return {
        ...state,
        language: action.payload,
      }

    default:
      return state
  }
}

export const ThemeProvider = ({ children }) => {
  const [state, dispatch] = useReducer(themeReducer, initialState)

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

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme)
    localStorage.setItem('theme', state.theme)
  }, [state.theme])

  useEffect(() => {
    localStorage.setItem('language', state.language)
  }, [state.language])

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
    setLanguage,
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

ThemeProvider.propTypes = {
  children: PropTypes.node,
}
