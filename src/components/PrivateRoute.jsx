import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { TOKEN_KEY } from '../services/api'

/**
 * PrivateRoute — redirects to /login if no token is present in localStorage.
 * Consolidated to use the single TOKEN_KEY ('voyager_token').
 */
const PrivateRoute = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (!token) return <Navigate to="/login" replace />
  return <Outlet />
}

export default PrivateRoute
