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
  },

  getById: async (planId) => api.get(`/travel-plans/${planId}`),
  getByUser: async (userId, params = {}) => api.get(`/travel-plans/user/${userId}`, { params }),
  updateStatus: async (planId, status) =>
    api.put(`/travel-plans/${planId}/status`, null, { params: { status } }),

  addActivity: async (planId, payload) => api.post(`/travel-plans/${planId}/activities`, payload),
  getActivities: async (planId) => api.get(`/travel-plans/${planId}/activities`),
  updateActivity: async (planId, activityId, payload) =>
    api.put(`/travel-plans/${planId}/activities/${activityId}`, payload),
  removeActivity: async (planId, activityId) => api.delete(`/travel-plans/${planId}/activities/${activityId}`),

  getConnections: async (planId, status = 'ACCEPTED') =>
    api.get(`/travel-plans/${planId}/connections`, { params: { status } }),

  addReservation: async (planId, payload) => api.post(`/travel-plans/${planId}/reservations`, payload),
  getReservations: async (planId) => api.get(`/travel-plans/${planId}/reservations`),

  sharePlan: async (planId) => api.post(`/travel-plans/${planId}/share`),
  getSharedPlan: async (shareToken) => api.get(`/travel-plans/shared/${shareToken}`),

  getByStatus: async (status, params = {}) => api.get(`/travel-plans/status/${status}`, { params }),
  getByType: async (type, params = {}) => api.get(`/travel-plans/type/${type}`, { params }),
  getCompatibleTravelers: async (planId) => api.get(`/travel-plans/${planId}/compatible-travelers`),
}

