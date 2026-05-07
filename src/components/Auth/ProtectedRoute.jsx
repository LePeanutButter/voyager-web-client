import PropTypes from 'prop-types'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth()

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Cargando…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles.length > 0) {
    const role = String(user?.role || '').toUpperCase()
    const allowed = allowedRoles.map((r) => String(r).toUpperCase())
    if (!allowed.includes(role)) {
      return <Navigate to="/dashboard" replace />
    }
  }

  return children || <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
  allowedRoles: PropTypes.arrayOf(PropTypes.string),
}

export default ProtectedRoute
