import api from './api'

export const usersService = {
  register: async (payload) => {
    // POST /users/register
    return api.post('/users/register', payload)
  },

  login: async (payload) => {
    // POST /users/login
    return api.post('/users/login', payload)
  },

  getCurrentUser: async () => api.get('/users/me'),

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
  }
}

