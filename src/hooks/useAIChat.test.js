import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const aiMock = vi.hoisted(() => ({
  getLocalChatHistory: vi.fn(),
  sendLocalChatMessage: vi.fn(),
  submitLocalRecommendationFeedback: vi.fn(),
  getTrendsDashboard: vi.fn().mockResolvedValue({ emergingDestinations: [] }),
  rankWithLocalRecommendations: vi.fn(),
}))

vi.mock('../services/aiService', () => ({ aiService: aiMock }))

vi.mock('../utils/localAiSession', () => ({
  getOrCreateLocalChatSessionId: vi.fn((uid) => `session-${uid}`),
  rotateLocalChatSessionId: vi.fn((uid) => `session-rotated-${uid}`),
}))

import { useAIChat } from './useAIChat'

beforeEach(() => {
  vi.clearAllMocks()
  aiMock.getLocalChatHistory.mockImplementation((sessionId) => {
    if (String(sessionId).includes('rotated')) {
      return Promise.resolve({ messages: [] })
    }
    return Promise.resolve({ messages: [{ role: 'user', content: 'hi' }] })
  })
  aiMock.sendLocalChatMessage.mockResolvedValue({ reply: 'hello' })
  aiMock.submitLocalRecommendationFeedback.mockResolvedValue(undefined)
})

describe('useAIChat', () => {
  it('loads history', async () => {
    const { result } = renderHook(() => useAIChat('1'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    expect(result.current.messages.some((m) => m.type === 'user')).toBe(true)
  })

  it('welcome on history failure', async () => {
    aiMock.getLocalChatHistory.mockRejectedValueOnce(new Error('404'))
    const { result } = renderHook(() => useAIChat('2'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    expect(result.current.messages[0].type).toBe('ai')
  })

  it('sendMessage', async () => {
    const { result } = renderHook(() => useAIChat('3'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('trip')
    })
    expect(aiMock.sendLocalChatMessage).toHaveBeenCalled()
  })

  it('sendMessage noop without userId', async () => {
    const { result } = renderHook(() => useAIChat(null))
    await act(async () => {
      await result.current.sendMessage('x')
    })
    expect(aiMock.sendLocalChatMessage).not.toHaveBeenCalled()
  })

  it('clearHistory and submitFeedback', async () => {
    const { result } = renderHook(() => useAIChat('4'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.clearHistory()
    })
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    expect(result.current.messages).toHaveLength(1)
    expect(result.current.messages[0].type).toBe('ai')
    expect(result.current.messages[0].content).toMatch(/nueva|Voyager IA/i)
    await act(async () => {
      await result.current.submitFeedback('m1', 'act1', 5)
    })
    expect(aiMock.submitLocalRecommendationFeedback).toHaveBeenCalled()
    act(() => result.current.clearError())
  })
})
