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
    aiMicroservice.post(`/matching/compatibility/${userId}/${targetUserId}`),

  submitMatchFeedback: (userId, targetUserId, rating, feedbackText = null) =>
    aiMicroservice.post(`/matching/feedback/${userId}/${targetUserId}`, null, {
      params: {
        rating,
        ...(feedbackText ? { feedbackText } : {}),
      },
    }),

  // ─── Preferences ───────────────────────────────────────────────────────────

  getTravelPreferences: (userId) => 
    aiMicroservice.get(`/preferences/${userId}`),

  startQuestionnaire: (userId) => 
    aiMicroservice.post('/preferences/questionnaire/start', { userId }),

  submitQuestionnaireStep: ({ userId, sessionId, answers }) =>
    aiMicroservice.post('/preferences/questionnaire/step', { 
      userId, 
      sessionId, 
      answers 
    }),

  submitQuestionnaire: (sessionId, formattedAnswers) => 
    aiMicroservice.post('/preferences/questionnaire/submit', { 
      sessionId, 
      answers: formattedAnswers 
    })
}
