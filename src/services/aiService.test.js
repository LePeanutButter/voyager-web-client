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
    expect(aiMock.get).toHaveBeenCalledWith('/matching/recommendations/1', { params: { limit: 10 } })
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

  it('ingest extras (segments, seasonality)', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.ingestTrendSegments({ segments: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/trends/ingest/segments', { segments: [] })
    await aiService.ingestSeasonalityProfiles({ profiles: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/seasonality/ingest/profiles', { profiles: [] })
  })

  it('rank with local recommendations', async () => {
    aiMock.post.mockResolvedValue({})
    await aiService.rankWithLocalRecommendations({ userId: '1', query: 'beach', candidates: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/local/recommendations', {
      userId: '1',
      query: 'beach',
      candidates: [],
    })
  })

  describe('getBuddyRecommendations', () => {
    it('accepts string location', async () => {
      aiMock.get.mockResolvedValue({})
      await aiService.getBuddyRecommendations('u1', 'Paris', 5)
      expect(aiMock.get).toHaveBeenCalledWith('/matching/recommendations/u1', {
        params: { limit: 5, location: 'Paris' },
      })
    })

    it('accepts options object with seekerFootprint array', async () => {
      aiMock.get.mockResolvedValue({})
      await aiService.getBuddyRecommendations('u1', {
        location: 'Paris',
        seekerFootprint: ['Roma', 'Berlin'],
        limit: 3,
      })
      expect(aiMock.get).toHaveBeenCalledWith('/matching/recommendations/u1', {
        params: { limit: 3, location: 'Paris', seekerFootprint: 'Roma,Berlin' },
      })
    })

    it('reads snake_case seeker_footprint from options', async () => {
      aiMock.get.mockResolvedValue({})
      await aiService.getBuddyRecommendations('u1', {
        seeker_footprint: 'Madrid',
      })
      expect(aiMock.get).toHaveBeenCalledWith('/matching/recommendations/u1', {
        params: { limit: 10, seekerFootprint: 'Madrid' },
      })
    })
  })

  it('matching find / connect / connections / respond / outcome', async () => {
    aiMock.post.mockResolvedValue({})
    aiMock.get.mockResolvedValue({})
    aiMock.put.mockResolvedValue({})
    await aiService.findTravelPartners({ q: 1 })
    expect(aiMock.post).toHaveBeenCalledWith('/matching/find', { q: 1 })
    await aiService.initiateConnection(1, 2, 'hi')
    expect(aiMock.post).toHaveBeenCalledWith('/matching/connect/1/2', null, {
      params: { message: 'hi' },
    })
    await aiService.initiateConnection(1, 2)
    expect(aiMock.post).toHaveBeenLastCalledWith('/matching/connect/1/2', null, { params: {} })
    await aiService.getUserConnections(1, 'PENDING')
    expect(aiMock.get).toHaveBeenCalledWith('/matching/connections/1', {
      params: { status: 'PENDING' },
    })
    await aiService.getUserConnections(1)
    expect(aiMock.get).toHaveBeenLastCalledWith('/matching/connections/1', { params: {} })
    await aiService.respondToConnection(7, 'ACCEPT', 'thanks')
    expect(aiMock.put).toHaveBeenCalledWith('/matching/connections/7/respond', null, {
      params: { response: 'ACCEPT', message: 'thanks' },
    })
    await aiService.respondToConnection(7, 'ACCEPT')
    expect(aiMock.put).toHaveBeenLastCalledWith('/matching/connections/7/respond', null, {
      params: { response: 'ACCEPT' },
    })
    await aiService.submitConnectionOutcome({ outcome: 'good' })
    expect(aiMock.post).toHaveBeenCalledWith('/matching/learning/connection-outcome', {
      outcome: 'good',
    })
    await aiService.submitMatchFeedback(1, 2, 5, 'great')
    expect(aiMock.post).toHaveBeenLastCalledWith('/matching/feedback/1/2', null, {
      params: { rating: 5, feedbackText: 'great' },
    })
  })

  it('trends extras', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getSegmentInsights('seg-1')
    expect(aiMock.get).toHaveBeenCalledWith('/trends/segments/seg-1/insights')
    await aiService.getWeeklyTrendsDigest()
    expect(aiMock.get).toHaveBeenCalledWith('/trends/weekly-digest')
  })

  it('seasonality endpoints', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getSeasonalityOverview()
    expect(aiMock.get).toHaveBeenCalledWith('/seasonality/overview', { params: {} })
    await aiService.getSeasonalityOverview('2026-06')
    expect(aiMock.get).toHaveBeenLastCalledWith('/seasonality/overview', {
      params: { referenceMonth: '2026-06' },
    })
    await aiService.getDestinationSeasonality('PAR')
    expect(aiMock.get).toHaveBeenCalledWith('/seasonality/destinations/PAR')
    aiMock.post.mockResolvedValue({})
    await aiService.getSeasonalForecast({ destination: 'PAR' })
    expect(aiMock.post).toHaveBeenCalledWith('/seasonality/forecast', { destination: 'PAR' })
    await aiService.getVisibilityAdjustments({ regions: [] })
    expect(aiMock.post).toHaveBeenCalledWith('/seasonality/visibility-adjustments', { regions: [] })
  })

  it('adaptive UI endpoints', async () => {
    aiMock.get.mockResolvedValue({})
    await aiService.getAdaptiveMenu(1)
    expect(aiMock.get).toHaveBeenCalledWith('/adaptive-ui/menu/1')
    await aiService.getAdaptiveHomeFeed(1)
    expect(aiMock.get).toHaveBeenCalledWith('/adaptive-ui/home-feed/1')
  })

  it('users profile and interactions endpoints', async () => {
    aiMock.post.mockResolvedValue({})
    aiMock.get.mockResolvedValue({})
    aiMock.put.mockResolvedValue({})
    aiMock.delete.mockResolvedValue({})
    await aiService.createUserProfile({ userId: 1 })
    expect(aiMock.post).toHaveBeenCalledWith('/users/profile', { userId: 1 })
    await aiService.getUserProfile(1)
    expect(aiMock.get).toHaveBeenCalledWith('/users/profile/1')
    await aiService.updateUserProfile(1, { foo: 1 })
    expect(aiMock.put).toHaveBeenCalledWith('/users/profile/1', { foo: 1 })
    await aiService.deleteUserProfile(1)
    expect(aiMock.delete).toHaveBeenCalledWith('/users/profile/1')
    await aiService.updateUserPreferences(1, { p: 1 })
    expect(aiMock.post).toHaveBeenCalledWith('/users/preferences/1', { p: 1 })
    await aiService.recordUserInteraction({ event: 'click' })
    expect(aiMock.post).toHaveBeenCalledWith('/users/interaction', { event: 'click' })
    await aiService.getUserHistory(1, 25)
    expect(aiMock.get).toHaveBeenCalledWith('/users/history/1', { params: { limit: 25 } })
    await aiService.getUserInsights(1)
    expect(aiMock.get).toHaveBeenCalledWith('/users/insights/1')
  })
})
