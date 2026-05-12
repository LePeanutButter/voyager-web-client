import api, { TOKEN_KEY } from './api'
import { decodeJwtPayload, getNumericId, safeJsonParse } from '../utils/jwt'

const resolveCurrentUserId = () => {
  const cached = safeJsonParse(localStorage.getItem('voyager_user') || '')
  const cachedId = getNumericId(cached?.id)
  if (cachedId != null) return cachedId
  const token = localStorage.getItem(TOKEN_KEY)
  const payload = token ? decodeJwtPayload(token) : null
  return getNumericId(payload?.userId) ?? getNumericId(payload?.id) ?? getNumericId(payload?.sub)
}

export const usersService = {
  register: async (payload) => {
    // POST /users/register
    return api.post('/users/register', payload)
  },

  login: async (payload) => {
    // POST /users/login
    return api.post('/users/login', payload)
  },

  getCurrentUser: async () => {
    const userId = resolveCurrentUserId()
    if (userId == null) throw new Error('Cannot resolve current user id')
    return api.get(`/users/${userId}`)
  },

  getUserById: async (userId) => {
    return api.get(`/users/${userId}`)
  },

  updateUserById: async (userId, payload) => {
    return api.put(`/users/${userId}`, payload)
  },

  getUserByUsername: async (username) => {
    const key = encodeURIComponent(username)
    try {
      return await api.get(`/users/username/${key}`)
    } catch {
      try {
        return await api.get(`/users/by-username/${key}`)
      } catch {
        return api.get('/users', { params: { username } })
      }
    }
  },

  getUserByEmail: async (email) => {
    const key = encodeURIComponent(email)
    try {
      return await api.get(`/users/email/${key}`)
    } catch {
      try {
        return await api.get(`/users/by-email/${key}`)
      } catch {
        return api.get('/users', { params: { email } })
      }
    }
  },

  // Completa cobertura de endpoints de usuarios
  listUsers: async (params = {}) => api.get('/users', { params }),
  getUsersByRole: async (role, params = {}) => api.get(`/users/role/${role}`, { params }),
  getUsersByStatus: async (status, params = {}) => api.get(`/users/status/${status}`, { params }),
  searchUsers: async (searchTerm, params = {}) => api.get('/users/search', { params: { searchTerm, ...params } }),
  updateUserRole: async (userId, role) => api.put(`/users/${userId}/role`, null, { params: { role } }),
  updateUserStatus: async (userId, status) => api.put(`/users/${userId}/status`, null, { params: { status } }),
  changePassword: async (userId, currentPassword, newPassword) =>
    api.put(`/users/${userId}/password`, null, { params: { currentPassword, newPassword } }),
  deleteUser: async (userId) => api.delete(`/users/${userId}`),
  getStatistics: async () => api.get('/users/statistics'),
}

