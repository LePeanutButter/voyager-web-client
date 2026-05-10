import api, { TOKEN_KEY } from './api'
import { decodeJwtPayload, getNumericId, safeJsonParse } from '../utils/jwt'

const getStoredUserId = () => {
  const token = localStorage.getItem(TOKEN_KEY)
  if (token) {
    const payload = decodeJwtPayload(token)
    const fromJwt =
      getNumericId(payload?.userId) ??
      getNumericId(payload?.id) ??
      getNumericId(payload?.sub)
    if (fromJwt != null) return fromJwt
  }

  const storedUser = safeJsonParse(localStorage.getItem('voyager_user') || '')
  return getNumericId(storedUser?.id)
}

/**
 * Auth service — wraps /users/* endpoints in voyager-backend-core.
 *
 * Contracts:
 *   POST /users/register  { username, email, password, firstName, lastName, phoneNumber? }
 *   POST /users/login     { usernameOrEmail, password } → LoginResponseDto
 *   GET  /users/{id}      → UserDto
 *   PUT  /users/{id}      { firstName, lastName, phoneNumber?, bio?, interests? } → UserDto
 *   GET  /users/{id}      → UserDto
 *   GET  /users/check-username?username=…  → Boolean
 *   GET  /users/check-email?email=…        → Boolean
 */
export const authService = {
  /**
   * Register a new user.
   * @param {{ username, email, password, firstName, lastName, phoneNumber? }} payload
   * @returns {Promise<UserDto>}
   */
  register: (payload) => api.post('/users/register', payload),

  /**
   * Authenticate and receive a JWT token.
   * @param {{ usernameOrEmail: string, password: string }} credentials
   * @returns {Promise<LoginResponseDto>} — { token, tokenType, expiresIn, user }
   */
  login: (credentials) => api.post('/users/login', credentials),

  /**
   * Fetch the currently authenticated user's profile.
   * @returns {Promise<UserDto>}
   */
  getCurrentUser: async () => {
    const userId = getStoredUserId()
    if (userId == null) throw new Error('Cannot resolve current user id')
    const pathId = String(userId)
    if (!/^\d+$/.test(pathId)) throw new Error('Invalid user id')
    return api.get(`/users/${pathId}`)
  },

  /**
   * Update a user's profile fields.
   * @param {number|string} userId
   * @param {{ firstName?, lastName?, phoneNumber?, bio?, interests? }} payload
   * @returns {Promise<UserDto>}
   */
  updateProfile: (userId, payload) => api.put(`/users/${userId}`, payload),

  /**
   * Fetch any user by id.
   * @param {number|string} userId
   * @returns {Promise<UserDto>}
   */
  getUserById: (userId) => api.get(`/users/${userId}`),

  /**
   * Check if a username is available.
   * @param {string} username
   * @returns {Promise<boolean>}
   */
  checkUsername: (username) =>
    api.get('/users/check-username', { params: { username } }),

  /**
   * Check if an email is available.
   * @param {string} email
   * @returns {Promise<boolean>}
   */
  checkEmail: (email) =>
    api.get('/users/check-email', { params: { email } }),

  // ─── Admin / gestión adicional ────────────────────────────────────────────
  changePassword: (userId, currentPassword, newPassword) =>
    api.put(`/users/${userId}/password`, null, { params: { currentPassword, newPassword } }),
  listUsers: (params = {}) => api.get('/users', { params }),
  getUsersByRole: (role, params = {}) => api.get(`/users/role/${role}`, { params }),
  getUsersByStatus: (status, params = {}) => api.get(`/users/status/${status}`, { params }),
  searchUsers: (searchTerm, params = {}) => api.get('/users/search', { params: { searchTerm, ...params } }),
  updateUserRole: (userId, role) => api.put(`/users/${userId}/role`, null, { params: { role } }),
  updateUserStatus: (userId, status) => api.put(`/users/${userId}/status`, null, { params: { status } }),
  deleteUser: (userId) => api.delete(`/users/${userId}`),
  getUserStatistics: () => api.get('/users/statistics'),

  getGoogleLoginUrl: () => {
    const base = import.meta.env.VITE_API_BASE_URL || '/api/v1'
    return `${base}/auth/google/login`
  },
}
