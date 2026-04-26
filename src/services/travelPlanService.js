import api from './api'

export const travelPlanService = {
  create: async (payload) => {
    // POST /travel-plans
    return api.post('/travel-plans', payload)
  },

  list: async () => {
    try {
      return await api.get('/travel-plans')
    } catch (error) {
      // Some backends only implement create/update for /travel-plans
      // and return 405 for GET. In that case, keep the UI functional
      // with local history of created plans.
      const msg = error?.message || ''
      if (msg.includes("Request method 'GET' is not supported") || msg.includes('405')) {
        return []
      }
      throw error
    }
  },

  update: async (planId, payload) => {
    return api.put(`/travel-plans/${planId}`, payload)
  }
}

