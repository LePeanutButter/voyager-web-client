import { describe, it, expect, vi, beforeEach } from 'vitest'

const aiMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
}))

vi.mock('./aiMicroservice', () => ({ default: aiMock }))

import { aiService } from './aiService'

beforeEach(() => vi.clearAllMocks())

describe('aiService', () => {
  it('chat and history', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.chat(1, 'hi')
    expect(aiMock.post).toHaveBeenCalledWith('/chat', { userId: 1, message: 'hi' })
    aiMock.get.mockResolvedValue([])
    await aiService.getHistory(2)
    expect(aiMock.get).toHaveBeenCalledWith('/chat/2/history')
    aiMock.delete.mockResolvedValue({})
    await aiService.clearHistory(3)
    expect(aiMock.delete).toHaveBeenCalledWith('/chat/3/history')
  })

  it('recommendations', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.getPersonalizedRecommendations({ userId: 1, x: 1 })
    aiMock.get.mockResolvedValue([])
    await aiService.getPopularActivities('Paris', 5)
    await aiService.getTrendingActivities(null, 10)
    await aiService.getTrendingActivities('cat', 3)
    await aiService.getSimilarActivities(9, 4)
    await aiService.getCategories()
    await aiService.submitRecommendationFeedback(1, 2, 5, null)
    await aiService.submitRecommendationFeedback(1, 2, 5, 'nice')
  })

  it('matching', async () => {
    aiMock.get.mockResolvedValue([])
    await aiService.getBuddyRecommendations(1, null, 10)
    await aiService.getBuddyRecommendations(1, 'Lima', 5)
    await aiService.getCompatibilityScore(1, 2)
    expect(aiMock.get).toHaveBeenCalledWith('/matching/compatibility/1/2')
    aiMock.post.mockResolvedValue({})
    await aiService.submitMatchFeedback(1, 2, 4, null)
  })

  it('preferences', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getTravelPreferences(1)
    expect(aiMock.get).toHaveBeenCalledWith('/users/profile/1')
    aiMock.post.mockResolvedValue({})
    await aiService.startQuestionnaire(1)
    await aiService.submitQuestionnaireStep({ userId: 1, sessionId: 's', answers: [] })
    await aiService.submitQuestionnaire('s', [{ questionId: 'q', selectedOptionIds: ['a'] }], 1)
  })
})
