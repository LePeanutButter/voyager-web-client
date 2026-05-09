import { useState, useCallback, useRef, useEffect } from 'react'
import { aiService } from '../services/aiService'
import { extractErrorMessage } from '../utils/errorUtils'
import { getOrCreateLocalChatSessionId, rotateLocalChatSessionId } from '../utils/localAiSession'

/** Mismas palabras clave que `LocalSpanishChatbotService` para combinar chat + POST `/local/recommendations`. */
const RANK_TRIGGER_SUBSTRINGS = ['recom', 'suger', 'producto', 'comprar']

function wantsLocalRanking(message) {
  const t = message.toLowerCase()
  return RANK_TRIGGER_SUBSTRINGS.some((k) => t.includes(k))
}

/** Evita que scrollIntoView mueva el documento: solo el panel con overflow del chat. */
function scrollMessagesPanelToBottom(messagesEndRef) {
  const anchor = messagesEndRef.current
  if (!anchor) return
  let el = anchor.parentElement
  while (el && el !== document.body) {
    const { overflowY } = globalThis.getComputedStyle(el)
    if (
      (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
      el.scrollHeight > el.clientHeight
    ) {
      el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' })
      return
    }
    el = el.parentElement
  }
  anchor.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'nearest' })
}

function emergingDestinationsToCandidates(emerging) {
  if (!Array.isArray(emerging)) return []
  return emerging
    .map((d) => ({
      id: d.destinationId,
      name: d.name,
      category: (Array.isArray(d.tags) && d.tags[0]) || 'destination',
      price: 0,
      contentText: [d.name, d.country, ...(Array.isArray(d.tags) ? d.tags : [])].filter(Boolean).join(' · '),
    }))
    .filter((c) => c.id && c.name)
}

/**
 * Hook del asistente: flujo Postman `10 — Local AI` (chat) + ranking con candidatos cuando aplica.
 *
 * @param {string|number|null} userId
 */
export function useAIChat(userId) {
  const [messages, setMessages] = useState([])
  const [sessionId, setSessionId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const recommendationCandidatesRef = useRef([])

  useEffect(() => {
    scrollMessagesPanelToBottom(messagesEndRef)
  }, [messages])

  useEffect(() => {
    if (!userId) {
      setSessionId(null)
      return
    }
    setSessionId(getOrCreateLocalChatSessionId(String(userId)))
  }, [userId])

  useEffect(() => {
    if (!userId) {
      recommendationCandidatesRef.current = []
      return
    }
    let cancelled = false
    aiService
      .getTrendsDashboard()
      .then((res) => {
        if (!cancelled) {
          recommendationCandidatesRef.current = emergingDestinationsToCandidates(res?.emergingDestinations)
        }
      })
      .catch(() => {
        if (!cancelled) recommendationCandidatesRef.current = []
      })
    return () => {
      cancelled = true
    }
  }, [userId])

  useEffect(() => {
    if (!userId || !sessionId) return

    const loadHistory = async () => {
      setLoadingHistory(true)
      try {
        const history = await aiService.getLocalChatHistory(sessionId)
        const raw = history?.messages || []
        if (raw.length === 0) {
          setMessages([
            {
              id: 'welcome',
              type: 'ai',
              content:
                "Hola! Soy Voyager IA (modo local). Pregunta por destinos, itinerarios o presupuestos. Para sugerencias concretas sobre catálogo, el backend puede rankear candidatos que envíe la app.",
              timestamp: new Date().toISOString(),
              suggestions: [],
            },
          ])
          return
        }
        const mapped = raw.map((m, i) => ({
          id: `hist-${i}`,
          type: m.role === 'user' ? 'user' : 'ai',
          content: m.content || m.message || '',
          timestamp: m.timestamp || null,
          suggestions: [],
        }))
        setMessages(mapped)
      } catch {
        setMessages([
          {
            id: 'welcome',
            type: 'ai',
            content:
              'Hola! Soy Voyager IA. Pregunta lo que quieras sobre destinos, itinerarios o presupuestos.',
            timestamp: new Date().toISOString(),
            suggestions: [],
          },
        ])
      } finally {
        setLoadingHistory(false)
      }
    }

    loadHistory()
  }, [userId, sessionId])

  const suggestionsFromLocalResponse = (response) => {
    const out = []
    const recs = response?.recommendations
    if (!Array.isArray(recs)) return out
    for (const r of recs) {
      if (typeof r === 'string') out.push(r)
      else if (r?.name) out.push(r.name)
      else if (r?.title) out.push(r.title)
      else if (r?.text) out.push(r.text)
    }
    return out
  }

  const sendMessage = useCallback(
    async (text) => {
      if (!text?.trim() || !userId || !sessionId) return

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
        const response = await aiService.sendLocalChatMessage({
          userId: String(userId),
          sessionId,
          message: text.trim(),
        })

        let chips = suggestionsFromLocalResponse(response)
        let rankedItems = []

        const pool = recommendationCandidatesRef.current
        if (wantsLocalRanking(text.trim()) && pool.length > 0) {
          try {
            const ranked = await aiService.rankWithLocalRecommendations({
              userId: String(userId),
              query: text.trim(),
              limit: 5,
              candidates: pool.slice(0, 25),
            })
            rankedItems = Array.isArray(ranked?.items) ? ranked.items : []
            const names = rankedItems.map((it) => it.name || it.id).filter(Boolean)
            chips = [...new Set([...chips, ...names])]
          } catch {
            /* ranking opcional: el turno de chat sigue siendo válido */
          }
        }

        const aiMsg = {
          id: `ai-${Date.now()}`,
          type: 'ai',
          content: response?.reply || response?.message || 'Sin respuesta.',
          timestamp: new Date().toISOString(),
          suggestions: chips,
          metadata: { ...response, rankedItems },
        }

        setMessages((prev) => [...prev, aiMsg])
        return aiMsg
      } catch (err) {
        setError(extractErrorMessage(err))
        const errMsg = {
          id: `err-${Date.now()}`,
          type: 'ai',
          content: 'No pude procesar tu mensaje. Intenta de nuevo en un momento.',
          timestamp: new Date().toISOString(),
          suggestions: [],
          isError: true,
        }
        setMessages((prev) => [...prev, errMsg])
      } finally {
        setLoading(false)
      }
    },
    [userId, sessionId]
  )

  const clearHistory = useCallback(async () => {
    if (!userId) return
    const next = rotateLocalChatSessionId(String(userId))
    setSessionId(next)
    setMessages([
      {
        id: 'welcome',
        type: 'ai',
        content: 'Conversación nueva. ¿En qué puedo ayudarte?',
        timestamp: new Date().toISOString(),
        suggestions: [],
      },
    ])
    setError(null)
  }, [userId])

  const submitFeedback = useCallback(
    async (messageId, activityId, rating) => {
      if (!userId) return
      try {
        await aiService.submitLocalRecommendationFeedback(
          String(userId),
          activityId || 'general',
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
