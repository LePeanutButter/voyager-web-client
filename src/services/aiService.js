import aiMicroservice from './aiMicroservice'

/**
 * Cliente del voyager-ai-service (FastAPI), prefijo `/api/v1`.
 * Contrato hacia el front: camelCase; el interceptor de `aiMicroservice` pasa bodies/params a snake_case.
 *
 * Chat y ranking “IA local” viven en `/local` (Ollama + SQLite de memoria + recomendaciones con candidatos del cliente).
 * El router histórico `/recommendations/*` ya no existe en el servicio refactorizado.
 *
 * Contratos alineados con `postman/Voyager-AI-Service.postman_collection.json` (salud en `{{rootUrl}}`, resto en `{{baseUrl}}`).
 */
export const aiService = {
  // ─── Ingesta base (Postman 01 — obligatorio para demos / operadores) ───────

  ingestTrendSignals: (payload) => aiMicroservice.post('/trends/ingest/signals', payload),
  ingestTrendSegments: (payload) => aiMicroservice.post('/trends/ingest/segments', payload),
  ingestSeasonalityProfiles: (payload) => aiMicroservice.post('/seasonality/ingest/profiles', payload),
  ingestMatchingProfiles: (payload) => aiMicroservice.post('/matching/profiles/ingest', payload),

  // ─── IA local (stack principal) ────────────────────────────────────────────

  /**
   * @param {{ userId: string, sessionId: string, message: string }} payload
   */
  sendLocalChatMessage: (payload) => aiMicroservice.post('/local/chat/message', payload),

  /**
   * @param {string} sessionId
   * @param {number} [limit]
   */
  getLocalChatHistory: (sessionId, limit = 50) =>
    aiMicroservice.get(`/local/chat/history/${encodeURIComponent(sessionId)}`, {
      params: { limit },
    }),

  /**
   * Ranking con candidatos reales enviados por el cliente (ver OpenAPI / README).
   * @param {{ userId: string, query: string, limit?: number, candidates: Array<{ id: string, name: string, category: string, price?: number, contentText?: string }> }} payload
   */
  rankWithLocalRecommendations: (payload) => aiMicroservice.post('/local/recommendations', payload),

  /**
   * Feedback para ítems rankeados por `/local/recommendations`.
   */
  submitLocalRecommendationFeedback: (userId, itemId, rating) =>
    aiMicroservice.post('/local/recommendations/feedback', null, {
      params: { userId, itemId, rating },
    }),

  // ─── Chat “travel planner” (ChatService / LLM) — opcional ─────────────────
  // Misma superficie que antes, por si se usa detrás de proxy o A/B.

  chat: (userId, message) => aiMicroservice.post('/chat', { userId, message }),

  getHistory: (userId) => aiMicroservice.get(`/chat/${userId}/history`),

  clearHistory: (userId) => aiMicroservice.delete(`/chat/${userId}/history`),

  // ─── Matching ──────────────────────────────────────────────────────────────

  /**
   * @param {string} userId
   * @param {string | null | { location?: string | null, seekerFootprint?: string[] | null, limit?: number }} locationOrOptions
   * @param {number} [limitArg]
   */
  getBuddyRecommendations: (userId, locationOrOptions = null, limitArg = 10) => {
    let location = null
    let seekerFootprint = null
    let limit = limitArg
    if (
      locationOrOptions != null &&
      typeof locationOrOptions === 'object' &&
      !Array.isArray(locationOrOptions)
    ) {
      location = locationOrOptions.location ?? null
      seekerFootprint = locationOrOptions.seekerFootprint ?? locationOrOptions.seeker_footprint ?? null
      limit = locationOrOptions.limit ?? limitArg
    } else {
      location = locationOrOptions
    }
    const params = { limit }
    if (location) params.location = location
    if (seekerFootprint) {
      const fp = Array.isArray(seekerFootprint)
        ? seekerFootprint.filter(Boolean).join(',')
        : String(seekerFootprint)
      if (fp) params.seekerFootprint = fp
    }
    return aiMicroservice.get(`/matching/recommendations/${encodeURIComponent(userId)}`, { params })
  },

  getCompatibilityScore: (userId, targetUserId) =>
    aiMicroservice.get(`/matching/compatibility/${userId}/${targetUserId}`),

  submitMatchFeedback: (userId, targetUserId, rating, feedbackText = null) =>
    aiMicroservice.post(`/matching/feedback/${userId}/${targetUserId}`, null, {
      params: {
        rating,
        ...(feedbackText ? { feedbackText } : {}),
      },
    }),

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

  // ─── Preferencias de viaje ─────────────────────────────────────────────────

  getTravelPreferences: (userId) => aiMicroservice.get(`/users/profile/${userId}`),
  startQuestionnaire: (userId) =>
    aiMicroservice.post('/travel-preferences/questionnaire/step', {
      userId,
      answers: [
        {
          questionId: 'primary_travel_style',
          selectedOptionIds: [],
        },
      ],
    }),
  submitQuestionnaireStep: ({ userId, sessionId, answers }) =>
    aiMicroservice.post('/travel-preferences/questionnaire/step', { userId, sessionId, answers }),
  submitQuestionnaire: (sessionId, formattedAnswers, userId = undefined) =>
    aiMicroservice.post('/travel-preferences/questionnaire/submit', {
      userId,
      sessionId,
      answers: formattedAnswers,
    }),

  // ─── Tendencias (sustituye “actividades trending” del antiguo router) ────

  getTrendsDashboard: () => aiMicroservice.get('/trends/dashboard'),
  getSegmentInsights: (segmentId) => aiMicroservice.get(`/trends/segments/${segmentId}/insights`),
  /** Digest semanal — en API: GET `/trends/weekly-digest` (la colección Postman usa esta ruta). */
  getWeeklyTrendsDigest: () => aiMicroservice.get('/trends/weekly-digest'),

  // ─── Estacionalidad ───────────────────────────────────────────────────────

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

  // ─── Usuarios (perfil IA) ──────────────────────────────────────────────────

  createUserProfile: (payload) => aiMicroservice.post('/users/profile', payload),
  getUserProfile: (userId) => aiMicroservice.get(`/users/profile/${userId}`),
  updateUserProfile: (userId, payload) => aiMicroservice.put(`/users/profile/${userId}`, payload),
  deleteUserProfile: (userId) => aiMicroservice.delete(`/users/profile/${userId}`),
  updateUserPreferences: (userId, payload) => aiMicroservice.post(`/users/preferences/${userId}`, payload),
  recordUserInteraction: (payload) => aiMicroservice.post('/users/interaction', payload),
  getUserHistory: (userId, limit = 50) =>
    aiMicroservice.get(`/users/history/${userId}`, { params: { limit } }),
  getUserInsights: (userId) => aiMicroservice.get(`/users/insights/${userId}`),
}
