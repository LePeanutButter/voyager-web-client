import api from './api'

export const travelPlanService = {
  create: async (payload) => {
    // POST /travel-plans
    return api.post('/travel-plans', payload)
  },

  list: async () => {
    return api.get('/travel-plans')
  },

  update: async (planId, payload) => {
    return api.put(`/travel-plans/${planId}`, payload)
  },

  remove: async (planId) => {
    return api.delete(`/travel-plans/${planId}`)
  }
}

