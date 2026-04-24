import api from './api'

export const travelPlanService = {
  create: async (payload) => {
    // POST /travel-plans
    return api.post('/travel-plans', payload)
  }
}

