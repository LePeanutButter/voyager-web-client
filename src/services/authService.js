import api from './api'

export const authService = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials)
    return response
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData)
    return response
  },

  // Logout user
  logout: async () => {
    const response = await api.post('/auth/logout')
    return response
  },

  // Get current user profile
  getCurrentUser: async () => {
    const response = await api.get('/auth/me')
    return response
  },

  // Update user profile
  updateProfile: async (userData) => {
    const response = await api.put('/auth/profile', userData)
    return response
  },

  // Change password
  changePassword: async (passwordData) => {
    const response = await api.put('/auth/password', passwordData)
    return response
  },

  // Request password reset
  requestPasswordReset: async (email) => {
    const response = await api.post('/auth/forgot-password', { email })
    return response
  },

  // Reset password
  resetPassword: async (token, newPassword) => {
    const response = await api.post('/auth/reset-password', { token, newPassword })
    return response
  },

  // Refresh token
  refreshToken: async () => {
    const response = await api.post('/auth/refresh')
    return response
  }
}
