import { describe, it, expect, vi, beforeEach } from 'vitest'

const aiMock = vi.hoisted(() => ({
  post: vi.fn(),
  get: vi.fn(),
  delete: vi.fn(),
  put: vi.fn(),
}))

vi.mock('./aiMicroservice', () => ({ default: aiMock }))

import { aiService } from './aiService'

beforeEach(() => vi.clearAllMocks())

describe('aiService', () => {
  it('local chat', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.sendLocalChatMessage({ userId: '1', sessionId: 's', message: 'hi' })
    expect(aiMock.post).toHaveBeenCalledWith('/local/chat/message', {
      userId: '1',
      sessionId: 's',
      message: 'hi',
    })
    aiMock.get.mockResolvedValue({ messages: [] })
    await aiService.getLocalChatHistory('s', 20)
    expect(aiMock.get).toHaveBeenCalledWith('/local/chat/history/s', { params: { limit: 20 } })
    await aiService.submitLocalRecommendationFeedback('1', 'item', 5)
    expect(aiMock.post).toHaveBeenCalledWith('/local/recommendations/feedback', null, {
      params: { userId: '1', itemId: 'item', rating: 5 },
    })
  })

  it('optional LLM chat routes', async () => {
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

  it('ingest (Postman 01)', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.ingestTrendSignals({ rows: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/trends/ingest/signals', { rows: [] })
    await aiService.ingestMatchingProfiles({ profiles: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/matching/profiles/ingest', { profiles: [] })
  })

  it('trends and matching', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getTrendsDashboard()
    expect(aiMock.get).toHaveBeenCalledWith('/trends/dashboard')
    await aiService.getBuddyRecommendations(1, null, 10)
    await aiService.getCompatibilityScore(1, 2)
    expect(aiMock.get).toHaveBeenCalledWith('/matching/compatibility/1/2')
    aiMock.post.mockResolvedValue({})
    await aiService.submitMatchFeedback(1, 2, 4, null)
  })

  it('preferences and users profile', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getTravelPreferences(1)
    expect(aiMock.get).toHaveBeenCalledWith('/users/profile/1')
    aiMock.post.mockResolvedValue({})
    await aiService.startQuestionnaire(1)
    await aiService.submitQuestionnaireStep({ userId: 1, sessionId: 's', answers: [] })
    await aiService.submitQuestionnaire('s', [{ questionId: 'q', selectedOptionIds: ['a'] }], 1)
  })
})
