import { useState, useCallback, useRef, useEffect } from 'react'
import { aiService } from '../services/aiService'
import { extractErrorMessage } from '../utils/errorUtils'

/**
 * Custom hook for the AI travel chatbot.
 *
 * @param {string|number|null} userId - The current authenticated user's id.
 * @returns chat state and handlers
 */
export function useAIChat(userId) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)   // sending a message
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // ── Scroll to bottom whenever messages change ─────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // ── Load history on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!userId) return

    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        const history = await aiService.getHistory(String(userId))
        const mapped = (history?.messages || []).map((m, i) => ({
          id: `hist-${i}`,
          type: m.role === 'user' ? 'user' : 'ai',
          content: m.content || m.message || '',
          timestamp: m.timestamp || null,
          suggestions: m.suggestions || [],
        }))
        setMessages(mapped)
      } catch {
        // History not found (404) is acceptable — start fresh
        setMessages([
          {
            id: 'welcome',
            type: 'ai',
            content:
              "Hello! I'm Voyager AI, your personal travel planning assistant. Ask me anything about destinations, itineraries, budgets, or tips!",
            timestamp: new Date().toISOString(),
            suggestions: [],
          },
        ])
      } finally {
        setLoadingHistory(false)
      }
    }

    loadHistory()
  }, [userId])

  // ── Send message ──────────────────────────────────────────────────────────
  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || !userId) return

      const userMsg = {
        id: `user-${Date.now()}`,
        type: 'user',
        content: text.trim(),
        timestamp: new Date().toISOString(),
        suggestions: [],
      }

      setMessages((prev) => [...prev, userMsg])
      setLoading(true)
      setError(null)

      try {
        const response = await aiService.chat(String(userId), text.trim())

        const aiMsg = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: response?.reply || response?.message || 'No response received.',
          timestamp: new Date().toISOString(),
          suggestions: response?.suggestions || [],
          metadata: response,
        }

        setMessages((prev) => [...prev, aiMsg])
        return aiMsg
      } catch (err) {
        setError(extractErrorMessage(err))
        const errMsg = {
          id: `err-${Date.now()}`,
          type: 'ai',
          content: "I'm sorry, I couldn't process your request. Please try again.",
          timestamp: new Date().toISOString(),
          suggestions: [],
          isError: true,
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setLoading(false)
      }
    },
    [userId]
  )

  // ── Clear history ─────────────────────────────────────────────────────────
  const clearHistory = useCallback(async () => {
    if (!userId) return
    try {
      await aiService.clearHistory(String(userId))
    } catch {
      // Even if server fails, clear locally
    }
    setMessages([])
    setError(null)
  }, [userId])

  // ── Submit feedback for an AI message ─────────────────────────────────────
  const submitFeedback = useCallback(
    async (messageId, activityId, rating) => {
      if (!userId) return
      try {
        await aiService.submitRecommendationFeedback(
          String(userId),
          activityId,
          rating
        )
      } catch (err) {
        setError(extractErrorMessage(err))
      }
    },
    [userId]
  )

  const clearError = useCallback(() => setError(null), [])

  return {
    messages,
    loading,
    loadingHistory,
    error,
    messagesEndRef,
    sendMessage,
    clearHistory,
    submitFeedback,
    clearError,
  }
}
