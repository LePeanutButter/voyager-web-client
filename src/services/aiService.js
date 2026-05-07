import aiMicroservice from './aiMicroservice'

/**
 * AI service — wraps all voyager-ai-service (FastAPI) endpoints.
 * All inputs and outputs use camelCase. 
 * The aiMicroservice interceptor handles snake_case conversion for backend transport.
 */
export const aiService = {
  // ─── Chat ──────────────────────────────────────────────────────────────────

  chat: (userId, message) =>
    aiMicroservice.post('/chat', { userId, message }),

  getHistory: (userId) => 
    aiMicroservice.get(`/chat/${userId}/history`),

  clearHistory: (userId) => 
    aiMicroservice.delete(`/chat/${userId}/history`),

  // ─── Recommendations ───────────────────────────────────────────────────────

  getPersonalizedRecommendations: ({ userId, ...rest }) =>
    aiMicroservice.post('/recommendations/personalized', { userId, ...rest }),

  getPopularActivities: (location, limit = 10) =>
    aiMicroservice.get(`/recommendations/popular/${encodeURIComponent(location)}`, {
      params: { limit },
    }),

  getTrendingActivities: (category = null, limit = 10) =>
    aiMicroservice.get('/recommendations/trending', {
      params: { ...(category ? { category } : {}), limit },
    }),

  getSimilarActivities: (activityId, limit = 5) =>
    aiMicroservice.get(`/recommendations/similar/${activityId}`, {
      params: { limit },
    }),

  getCategories: () => 
    aiMicroservice.get('/recommendations/categories'),

  submitRecommendationFeedback: (userId, activityId, rating, feedbackText = null) =>
    aiMicroservice.post('/recommendations/feedback', null, {
      params: {
        userId,
        activityId,
        rating,
        ...(feedbackText ? { feedbackText } : {}),
      },
    }),

  // ─── Matching ──────────────────────────────────────────────────────────────

  getBuddyRecommendations: (userId, location = null, limit = 10) =>
    aiMicroservice.get(`/matching/recommendations/${userId}`, {
      params: { limit, ...(location ? { location } : {}) },
    }),

  getCompatibilityScore: (userId, targetUserId) =>
    aiMicroservice.get(`/matching/compatibility/${userId}/${targetUserId}`),

  submitMatchFeedback: (userId, targetUserId, rating, feedbackText = null) =>
    aiMicroservice.post(`/matching/feedback/${userId}/${targetUserId}`, null, {
      params: {
        rating,
        ...(feedbackText ? { feedbackText } : {}),
      },
    }),

  // ─── Preferences (AI) ──────────────────────────────────────────────────────
  // Canonical endpoints in backend: /travel-preferences/questionnaire/*
  getTravelPreferences: (userId) => aiMicroservice.get(`/profile/${userId}`),
  startQuestionnaire: (userId) =>
    aiMicroservice.post('/travel-preferences/questionnaire/step', { 
      userId, 
      answers: [
        {
          questionId: "primary_travel_style",
          selectedOptionIds: []
        }
      ]
    }),
  submitQuestionnaireStep: ({ userId, sessionId, answers }) =>
    aiMicroservice.post('/travel-preferences/questionnaire/step', { userId, sessionId, answers }),
  submitQuestionnaire: (sessionId, formattedAnswers, userId = undefined) =>
    aiMicroservice.post('/travel-preferences/questionnaire/submit', {
      userId,
      sessionId,
      answers: formattedAnswers,
    }),

  // ─── Recommendations: endpoints faltantes ─────────────────────────────────
  getPersonalizedDestinations: (payload) =>
    aiMicroservice.post('/recommendations/destinations/personalized', payload),
  getContextualActivities: (payload) =>
    aiMicroservice.post('/recommendations/activities/contextual', payload),

  // ─── Matching: cobertura total ─────────────────────────────────────────────
  findTravelPartners: (payload) => aiMicroservice.post('/matching/find', payload),
  initiateConnection: (userId, targetUserId, message = null) =>
    aiMicroservice.post(`/matching/connect/${userId}/${targetUserId}`, null, {
      params: message ? { message } : {},
    }),
  getUserConnections: (userId, status = null) =>
    aiMicroservice.get(`/matching/connections/${userId}`, {
      params: status ? { status } : {},
    }),
  respondToConnection: (connectionId, response, message = null) =>
    aiMicroservice.put(`/matching/connections/${connectionId}/respond`, null, {
      params: { response, ...(message ? { message } : {}) },
    }),
  submitConnectionOutcome: (payload) =>
    aiMicroservice.post('/matching/learning/connection-outcome', payload),

  // ─── Trends ────────────────────────────────────────────────────────────────
  getTrendsDashboard: () => aiMicroservice.get('/trends/dashboard'),
  getSegmentInsights: (segmentId) => aiMicroservice.get(`/trends/segments/${segmentId}/insights`),
  getWeeklyTrendsDigest: () => aiMicroservice.get('/trends/weekly-digest'),

  // ─── Seasonality ───────────────────────────────────────────────────────────
  getSeasonalityOverview: (referenceMonth = null) =>
    aiMicroservice.get('/seasonality/overview', {
      params: referenceMonth ? { referenceMonth } : {},
    }),
  getDestinationSeasonality: (destinationId) =>
    aiMicroservice.get(`/seasonality/destinations/${destinationId}`),
  getSeasonalForecast: (payload) => aiMicroservice.post('/seasonality/forecast', payload),
  getVisibilityAdjustments: (payload) =>
    aiMicroservice.post('/seasonality/visibility-adjustments', payload),

  // ─── Adaptive UI ───────────────────────────────────────────────────────────
  getAdaptiveMenu: (userId) => aiMicroservice.get(`/adaptive-ui/menu/${userId}`),
  getAdaptiveHomeFeed: (userId) => aiMicroservice.get(`/adaptive-ui/home-feed/${userId}`),

  // ─── AI Users endpoints ────────────────────────────────────────────────────
  createUserProfile: (payload) => aiMicroservice.post('/users/profile', payload),
  getUserProfile: (userId) => aiMicroservice.get(`/users/profile/${userId}`),
  updateUserProfile: (userId, payload) => aiMicroservice.put(`/users/profile/${userId}`, payload),
  deleteUserProfile: (userId) => aiMicroservice.delete(`/users/profile/${userId}`),
  updateUserPreferences: (userId, payload) => aiMicroservice.post(`/users/preferences/${userId}`, payload),
  recordUserInteraction: (payload) => aiMicroservice.post('/users/interaction', payload),
  getUserHistory: (userId, limit = 50) =>
    aiMicroservice.get(`/users/history/${userId}`, { params: { limit } }),
  getUserInsights: (userId) => aiMicroservice.get(`/users/insights/${userId}`),

  // ─── Service-level health ──────────────────────────────────────────────────
  getServiceRoot: () => aiMicroservice.get('/'),
  getServiceHealth: () => aiMicroservice.get('/health'),
}
