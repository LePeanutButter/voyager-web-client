import aiMicroservice from './aiMicroservice'

/**
 * AI service — wraps all voyager-ai-service (FastAPI) endpoints.
 * Ensures consistent camelCase for the frontend while sending snake_case to backend.
 */
export const aiService = {
  // ─── Chat ──────────────────────────────────────────────────────────────────

  /**
   * Send a message to the AI travel chatbot.
   * @param {string} userId
   * @param {string} message
   * @returns {Promise<any>}
   */
  chat: (userId, message) =>
    aiMicroservice.post('/chat', { user_id: userId, message }),

  /**
   * Retrieve conversation history for a user.
   * @param {string} userId
   * @returns {Promise<any>}
   */
  getHistory: (userId) => aiMicroservice.get(`/chat/${userId}/history`),

  /**
   * Clear a user's conversation history.
   * @param {string} userId
   * @returns {Promise<any>}
   */
  clearHistory: (userId) => aiMicroservice.delete(`/chat/${userId}/history`),

  // ─── Recommendations ───────────────────────────────────────────────────────

  /**
   * Get personalized recommendations for a user.
   * @param {{ userId: string, [key: string]: any }} request
   * @returns {Promise<any>}
   */
  getPersonalizedRecommendations: ({ userId, ...rest }) =>
    aiMicroservice.post('/recommendations/personalized', { user_id: userId, ...rest }),

  /**
   * Get popular activities for a location.
   * @param {string} location
   * @param {number} limit
   * @returns {Promise<any>}
   */
  getPopularActivities: (location, limit = 10) =>
    aiMicroservice.get(`/recommendations/popular/${encodeURIComponent(location)}`, {
      params: { limit },
    }),

  /**
   * Get trending activities, optionally filtered by category.
   * @param {string|null} category
   * @param {number} limit
   * @returns {Promise<any>}
   */
  getTrendingActivities: (category = null, limit = 10) =>
    aiMicroservice.get('/recommendations/trending', {
      params: { ...(category ? { category } : {}), limit },
    }),

  /**
   * Get similar activities to a reference activity.
   * @param {string} activityId
   * @param {number} limit
   * @returns {Promise<any>}
   */
  getSimilarActivities: (activityId, limit = 5) =>
    aiMicroservice.get(`/recommendations/similar/${activityId}`, {
      params: { limit },
    }),

  /**
   * Get all activity categories.
   * @returns {Promise<any>}
   */
  getCategories: () => aiMicroservice.get('/recommendations/categories'),

  /**
   * Submit feedback for a recommendation.
   * @param {string} userId
   * @param {string} activityId
   * @param {number} rating  (1-5)
   * @param {string|null} feedbackText
   * @returns {Promise<any>}
   */
  submitRecommendationFeedback: (userId, activityId, rating, feedbackText = null) =>
    aiMicroservice.post('/recommendations/feedback', null, {
      params: {
        user_id: userId,
        activity_id: activityId,
        rating,
        ...(feedbackText ? { feedback_text: feedbackText } : {}),
      },
    }),

  // ─── Matching ──────────────────────────────────────────────────────────────

  /**
   * Get travel buddy recommendations for a user.
   * @param {string} userId
   * @param {string|null} location
   * @param {number} limit
   * @returns {Promise<any>}
   */
  getBuddyRecommendations: (userId, location = null, limit = 10) =>
    aiMicroservice.get(`/matching/recommendations/${userId}`, {
      params: { limit, ...(location ? { location } : {}) },
    }),

  /**
   * Get AI compatibility score between two users.
   * @param {string} userId
   * @param {string} targetUserId
   * @returns {Promise<any>}
   */
  getCompatibilityScore: (userId, targetUserId) =>
    aiMicroservice.post(`/matching/compatibility/${userId}/${targetUserId}`),

  /**
   * Submit feedback for a match.
   * @param {string} userId
   * @param {string} targetUserId
   * @param {number} rating  (1-5)
   * @param {string|null} feedbackText
   * @returns {Promise<any>}
   */
  submitMatchFeedback: (userId, targetUserId, rating, feedbackText = null) =>
    aiMicroservice.post(`/matching/feedback/${userId}/${targetUserId}`, null, {
      params: {
        rating,
        ...(feedbackText ? { feedback_text: feedbackText } : {}),
      },
    }),

  // ─── Preferences ───────────────────────────────────────────────────────────

  /**
   * Get travel preferences for a user.
   * @param {string} userId
   * @returns {Promise<any>}
   */
  getTravelPreferences: (userId) => 
    aiMicroservice.get(`/preferences/${userId}`),

  /**
   * Start a new questionnaire session for a user.
   * @param {string} userId 
   * @returns {Promise<any>}
   */
  startQuestionnaire: (userId) => 
    aiMicroservice.post('/preferences/questionnaire/start', { user_id: userId }),

  /**
   * Process one step of the adaptive preference questionnaire.
   * @param {{ userId: string, sessionId?: string, answers?: object }} payload
   * @returns {Promise<any>}
   */
  submitQuestionnaireStep: ({ userId, sessionId, answers }) =>
    aiMicroservice.post('/preferences/questionnaire/step', { 
      user_id: userId, 
      session_id: sessionId, 
      answers 
    }),

  /**
   * Submit all answers for a questionnaire.
   * @param {string} sessionId 
   * @param {Array} formattedAnswers 
   * @returns {Promise<any>}
   */
  submitQuestionnaire: (sessionId, formattedAnswers) => 
    aiMicroservice.post('/preferences/questionnaire/submit', { 
      session_id: sessionId, 
      answers: formattedAnswers 
    })
}
