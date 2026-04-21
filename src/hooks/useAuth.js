import { useAuth as useAuthContext } from '../contexts/AuthContext'

// Custom hook for authentication with additional utility functions
export const useAuth = () => {
  const authContext = useAuthContext()
  
  // Additional utility functions can be added here
  const isRole = (role) => {
    return authContext.user?.role === role
  }
  
  const isAdmin = () => isRole('admin')
  const isBusiness = () => isRole('business')
  const isUser = () => isRole('user')
  
  const hasPermission = (permission) => {
    // Implement permission checking logic
    const userPermissions = {
      admin: ['read', 'write', 'delete', 'manage_users'],
      business: ['read', 'write', 'manage_bookings', 'manage_services'],
      user: ['read', 'write', 'manage_trips']
    }
    
    return userPermissions[authContext.user?.role]?.includes(permission)
  }
  
  return {
    ...authContext,
    isRole,
    isAdmin,
    isBusiness,
    isUser,
    hasPermission
  }
}
