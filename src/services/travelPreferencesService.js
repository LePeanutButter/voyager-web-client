import aiMicroservice from './aiMicroservice'

/**
 * Adaptive travel preference questionnaire — same contract as voyager-ai-service.
 */
export const travelPreferencesService = {
  /**
   * @param {{ user_id: string, session_id?: string|null, answers?: Array<{ question_id: string, selected_option_ids: string[] }> }} payload
   */
  postQuestionnaireStep: async (payload) => {
    return aiMicroservice.post('/travel-preferences/questionnaire/step', payload)
  },

  /**
   * @param {{ user_id: string, session_id: string, answers?: Array<{ question_id: string, selected_option_ids: string[] }> }} payload
   */
  submitQuestionnaire: async (payload) => {
    return aiMicroservice.post('/travel-preferences/questionnaire/submit', payload)
  }
}
