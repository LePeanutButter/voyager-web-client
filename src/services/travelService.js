import api from './api'

/**
 * Travel service — wraps /travel-plans/* and /matching/* endpoints.
 */
export const travelService = {
  // ─── Travel Plans ──────────────────────────────────────────────────────────

  /**
   * List authenticated user's travel plans.
   * @param {{ page?, size? }} params
   * @returns {Promise<TravelPlanDto[]>}
   */
  list: async (params = {}) => {
    const response = await api.get('/travel-plans', { params })
    // Normalize paginated structure
    if (response && Array.isArray(response.content)) {
      return response.content
    }
    if (response && Array.isArray(response.records)) {
      return response.records
    }
    if (Array.isArray(response)) {
      return response
    }
    return []
  },

  /**
   * Get a single travel plan by id.
   * @param {number|string} id
   * @returns {Promise<TravelPlanDto>}
   */
  getById: (id) => api.get(`/travel-plans/${id}`),

  /**
   * Create a new travel plan.
   * @param {{ title, destinationLocation, originLocation?, startDate, endDate, estimatedBudget?, numberOfTravelers, description? }} payload
   * @returns {Promise<TravelPlanDto>}
   */
  create: (payload) => api.post('/travel-plans', payload),

  /**
   * Update an existing travel plan.
   * @param {number|string} id
   * @param {Partial<TravelPlanDto>} payload
   * @returns {Promise<TravelPlanDto>}
   */
  update: (id, payload) => api.put(`/travel-plans/${id}`, payload),

  /**
   * Delete a travel plan.
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  remove: (id) => api.delete(`/travel-plans/${id}`),

  /**
   * Update the status of a travel plan.
   * @param {number|string} id
   * @param {'PLANNING'|'ACTIVE'|'COMPLETED'|'CANCELLED'} status
   * @returns {Promise<TravelPlanDto>}
   */
  updateStatus: (id, status) =>
    api.put(`/travel-plans/${id}/status`, null, { params: { status } }),

  // ─── Activities ────────────────────────────────────────────────────────────

  /**
   * Add an activity to a travel plan.
   * @param {number|string} planId
   * @param {{ name, description?, type?, startTime?, endTime?, location?, estimatedCost?, notes? }} payload
   * @returns {Promise<TravelPlanActivityDto>}
   */
  addActivity: (planId, payload) =>
    api.post(`/travel-plans/${planId}/activities`, payload),

  /**
   * Update an existing activity.
   * @param {number|string} planId
   * @param {number|string} activityId
   * @param {Partial<TravelPlanActivityDto>} payload
   * @returns {Promise<TravelPlanActivityDto>}
   */
  updateActivity: (planId, activityId, payload) =>
    api.put(`/travel-plans/${planId}/activities/${activityId}`, payload),

  /**
   * Delete an activity from a travel plan.
   * @param {number|string} planId
   * @param {number|string} activityId
   * @returns {Promise<void>}
   */
  deleteActivity: (planId, activityId) =>
    api.delete(`/travel-plans/${planId}/activities/${activityId}`),

  // ─── Matching ──────────────────────────────────────────────────────────────

  /**
   * Find compatible travelers for a specific plan.
   * @param {number|string} planId
   * @returns {Promise<TravelerMatchDto[]>}
   */
  getCompatibleTravelers: (planId) =>
    api.get(`/travel-plans/${planId}/compatible-travelers`),

  /**
   * Find travelers matching destination + date range.
   * @param {{ destination: string, startDate: string, endDate: string, interests?: string[], limit?: number }} params
   * @returns {Promise<MatchResponseDto[]>}
   */
  findMatches: ({ destination, startDate, endDate, interests = [], limit = 20 }) =>
    api.get('/matching/matches', {
      params: { destination, startDate, endDate, interests, limit },
    }),

  /**
   * Compute AI-scored compatibility matches.
   * @param {{ destination: string, startDate: string, endDate: string, interests?: string[] }} body
   * @returns {Promise<CompatibilityMatchResponse[]>}
   */
  getCompatibilityMatches: (body) => api.post('/compatibility/matches', body),
}