import api from './api'

/**
 * Auth service — wraps /users/* endpoints in voyager-backend-core.
 *
 * Contracts:
 *   POST /users/register  { username, email, password, firstName, lastName, phoneNumber? }
 *   POST /users/login     { usernameOrEmail, password } → LoginResponseDto
 *   GET  /users/me        → UserDto
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
  getCurrentUser: () => api.get('/users/me'),

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
}
