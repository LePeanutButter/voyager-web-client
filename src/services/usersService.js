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

  getUserById: async (userId) => {
    return api.get(`/users/${userId}`)
  },

  updateUserById: async (userId, payload) => {
    return api.put(`/users/${userId}`, payload)
  }
}

