import aiMicroservice from './aiMicroservice'

/**
 * AI service — wraps all voyager-ai-service (FastAPI) endpoints.
 *
 * Key contracts:
 *   POST   /chat                               { userId, message } → ChatResponse
 *   GET    /chat/{userId}/history              → ConversationHistoryResponse
 *   DELETE /chat/{userId}/history              → ClearHistoryResponse
 *   POST   /recommendations/personalized       { user_id, ... } → RecommendationResponse
 *   GET    /recommendations/popular/{location} → { activities, total_results }
 *   GET    /recommendations/trending           → { activities, total_results }
 *   POST   /recommendations/feedback           → confirmation
 *   GET    /recommendations/categories         → { categories }
 *   GET    /matching/recommendations/{userId}  → { recommendations }
 *   POST   /matching/compatibility/{uid}/{tid} → compatibility score
 *   POST   /preferences/questionnaire/step     → QuestionnaireStepResponse
 *   POST   /preferences/questionnaire/submit   → QuestionnaireSubmitResponse
 */
export const aiService = {
  // ── Chat ─────────────────────────────────────────────────────────────────

  /**
   * Send a message to the AI travel chatbot.
   * @param {string} userId
   * @param {string} message
   * @returns {Promise<ChatResponse>} — { reply, suggestions, ... }
   */
  chat: (userId, message) =>
    aiMicroservice.post('/chat', { userId, message }),

  /**
   * Retrieve conversation history for a user.
   * @param {string} userId
   * @returns {Promise<ConversationHistoryResponse>}
   */
  getHistory: (userId) => aiMicroservice.get(`/chat/${userId}/history`),

  /**
   * Clear a user's conversation history.
   * @param {string} userId
   * @returns {Promise<ClearHistoryResponse>}
   */
  clearHistory: (userId) => aiMicroservice.delete(`/chat/${userId}/history`),

  // ── Recommendations ───────────────────────────────────────────────────────

  /**
   * Get personalized recommendations for a user.
   * @param {{ user_id: string, [key: string]: any }} request
   * @returns {Promise<RecommendationResponse>}
   */
  getPersonalizedRecommendations: (request) =>
    aiMicroservice.post('/recommendations/personalized', request),

  /**
   * Get popular activities for a location.
   * @param {string} location
   * @param {number} limit
   * @returns {Promise<{ location, activities, total_results }>}
   */
  getPopularActivities: (location, limit = 10) =>
    aiMicroservice.get(`/recommendations/popular/${encodeURIComponent(location)}`, {
      params: { limit },
    }),

  /**
   * Get trending activities, optionally filtered by category.
   * @param {string|null} category
   * @param {number} limit
   * @returns {Promise<{ category, activities, total_results }>}
   */
  getTrendingActivities: (category = null, limit = 10) =>
    aiMicroservice.get('/recommendations/trending', {
      params: { ...(category ? { category } : {}), limit },
    }),

  /**
   * Get similar activities to a reference activity.
   * @param {string} activityId
   * @param {number} limit
   * @returns {Promise<{ similar_activities, total_results }>}
   */
  getSimilarActivities: (activityId, limit = 5) =>
    aiMicroservice.get(`/recommendations/similar/${activityId}`, {
      params: { limit },
    }),

  /**
   * Get all activity categories.
   * @returns {Promise<{ categories, total_count }>}
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

  // ── Matching ─────────────────────────────────────────────────────────────

  /**
   * Get travel buddy recommendations for a user.
   * @param {string} userId
   * @param {string|null} location
   * @param {number} limit
   * @returns {Promise<{ recommendations, total_count }>}
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

  // ── Preferences ───────────────────────────────────────────────────────────

  /**
   * Process one step of the adaptive preference questionnaire.
   * @param {{ user_id: string, session_id?: string, answers?: object }} body
   * @returns {Promise<QuestionnaireStepResponse>}
   */
  questionnaireStep: (body) =>
    aiMicroservice.post('/preferences/questionnaire/step', body),

  /**
   * Submit the completed questionnaire.
   * @param {{ user_id: string, session_id: string, answers: object }} body
   * @returns {Promise<QuestionnaireSubmitResponse>}
   */
  questionnaireSubmit: (body) =>
    aiMicroservice.post('/preferences/questionnaire/submit', body),
}
