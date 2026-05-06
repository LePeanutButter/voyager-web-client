import PropTypes from 'prop-types'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth()

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Loading…</p>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return children || <Outlet />
}

ProtectedRoute.propTypes = {
  children: PropTypes.node,
}

export default ProtectedRoute
