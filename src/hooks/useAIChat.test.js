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

  it('triggers ranking when message asks for recommendations and reports errors', async () => {
    aiMock.getTrendsDashboard.mockResolvedValueOnce({
      emergingDestinations: [
        { destinationId: 'd1', name: 'Bali', country: 'ID', tags: ['beach'] },
      ],
    })
    aiMock.rankWithLocalRecommendations.mockResolvedValue({
      items: [{ id: 'd1', name: 'Bali Beach' }],
    })
    aiMock.sendLocalChatMessage.mockResolvedValue({
      message: 'Aqui van las recom',
      recommendations: ['Bali', { name: 'Goa' }, { title: 'Phuket' }, { text: 'Maldivas' }, 42],
    })
    const { result } = renderHook(() => useAIChat('77'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('necesito recom de hoteles')
    })
    expect(aiMock.rankWithLocalRecommendations).toHaveBeenCalled()
    const lastAi = result.current.messages.findLast?.((m) => m.type === 'ai')
      ?? [...result.current.messages].reverse().find((m) => m.type === 'ai')
    expect(lastAi.suggestions).toEqual(expect.arrayContaining(['Bali', 'Goa', 'Bali Beach']))
  })

  it('reports error when sendLocalChatMessage rejects', async () => {
    aiMock.sendLocalChatMessage.mockRejectedValueOnce(new Error('chat-broke'))
    const { result } = renderHook(() => useAIChat('5'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('hola')
    })
    expect(result.current.error).toBeTruthy()
    const last = result.current.messages.at(-1)
    expect(last.isError).toBe(true)
    act(() => result.current.clearError())
    expect(result.current.error).toBeNull()
  })

  it('submitFeedback noop without userId and swallows API errors', async () => {
    const { result: resultNoUser } = renderHook(() => useAIChat(null))
    await act(async () => {
      await resultNoUser.current.submitFeedback('m', 'a', 5)
    })
    expect(aiMock.submitLocalRecommendationFeedback).not.toHaveBeenCalled()

    aiMock.submitLocalRecommendationFeedback.mockRejectedValueOnce(new Error('feedback-fail'))
    const { result } = renderHook(() => useAIChat('6'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.submitFeedback('m', null, 4)
    })
    expect(result.current.error).toBeTruthy()
  })

  it('keeps ranking pool empty when trends fail or are empty', async () => {
    aiMock.getTrendsDashboard.mockRejectedValueOnce(new Error('down'))
    const { result } = renderHook(() => useAIChat('8'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('quiero recom de tours')
    })
    expect(aiMock.rankWithLocalRecommendations).not.toHaveBeenCalled()
  })

  it('sendMessage no-op on blank text', async () => {
    const { result } = renderHook(() => useAIChat('9'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('   ')
    })
    expect(aiMock.sendLocalChatMessage).not.toHaveBeenCalled()
  })

  it('welcome message when history is empty array', async () => {
    aiMock.getLocalChatHistory.mockResolvedValueOnce({ messages: [] })
    const { result } = renderHook(() => useAIChat('10'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    expect(result.current.messages[0].id).toBe('welcome')
    expect(result.current.messages[0].content).toMatch(/Voyager IA/)
  })

  it('ranking failure still appends AI reply', async () => {
    aiMock.getTrendsDashboard.mockResolvedValueOnce({
      emergingDestinations: [{ destinationId: '1', name: 'X', tags: ['t'] }],
    })
    aiMock.rankWithLocalRecommendations.mockRejectedValueOnce(new Error('rank-down'))
    aiMock.sendLocalChatMessage.mockResolvedValueOnce({ reply: 'sigue' })
    const { result } = renderHook(() => useAIChat('11'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    await act(async () => {
      await result.current.sendMessage('dame recomendaciones')
    })
    expect(result.current.messages.at(-1).content).toBe('sigue')
  })

  it('scrollMessagesPanelToBottom finds overflow parent', async () => {
    const g = vi.spyOn(globalThis, 'getComputedStyle').mockReturnValue({ overflowY: 'auto' })
    const { result } = renderHook(() => useAIChat('12'))
    await waitFor(() => expect(result.current.loadingHistory).toBe(false))
    const scrollTo = vi.fn()
    const panel = document.createElement('div')
    Object.defineProperty(panel, 'scrollHeight', { value: 500, configurable: true })
    Object.defineProperty(panel, 'clientHeight', { value: 100, configurable: true })
    panel.scrollTo = scrollTo
    const anchor = document.createElement('div')
    panel.appendChild(anchor)
    document.body.appendChild(panel)
    result.current.messagesEndRef.current = anchor
    await act(async () => {
      await result.current.sendMessage('hola')
    })
    expect(scrollTo).toHaveBeenCalled()
    document.body.removeChild(panel)
    g.mockRestore()
  })
})
