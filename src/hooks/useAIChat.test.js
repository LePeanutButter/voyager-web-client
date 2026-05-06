import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'

const aiMock = vi.hoisted(() => ({
  getHistory: vi.fn(),
  chat: vi.fn(),
  clearHistory: vi.fn(),
  submitRecommendationFeedback: vi.fn(),
}))

vi.mock('../services/aiService', () => ({ aiService: aiMock }))

import { useAIChat } from './useAIChat'

beforeEach(() => {
  vi.clearAllMocks()
  aiMock.getHistory.mockResolvedValue({ messages: [{ role: 'user', content: 'hi' }] })
  aiMock.chat.mockResolvedValue({ message: 'hello' })
  aiMock.clearHistory.mockResolvedValue(undefined)
  aiMock.submitRecommendationFeedback.mockResolvedValue(undefined)
})

describe('useAIChat', () => {
  it('loads history', async () => {
    const { result } = renderHook(() => useAIChat('1'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    expect(result.current.messages.some((m) => m.type === 'user')).toBe(true)
  })

  it('welcome on history failure', async () => {
    aiMock.getHistory.mockRejectedValueOnce(new Error('404'))
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
    expect(aiMock.chat).toHaveBeenCalled()
  })

  it('sendMessage noop without userId', async () => {
    const { result } = renderHook(() => useAIChat(null))
    await act(async () => {
      await result.current.sendMessage('x')
    })
    expect(aiMock.chat).not.toHaveBeenCalled()
  })

  it('clearHistory and submitFeedback', async () => {
    const { result } = renderHook(() => useAIChat('4'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.clearHistory()
    })
    expect(result.current.messages).toEqual([])
    await act(async () => {
      await result.current.submitFeedback('m1', 'act1', 5)
    })
    expect(aiMock.submitRecommendationFeedback).toHaveBeenCalled()
    act(() => result.current.clearError())
  })
})
