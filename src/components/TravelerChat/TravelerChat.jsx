import React, { useState, useEffect, useCallback, useRef } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import { getAllConversationMessages, sendTravelerMessage } from '../../services/socialService'
import { useTravelerChatSocket } from '../../hooks/useTravelerChatSocket'
import './TravelerChat.css'

const getMessageId = (m) => m?.id ?? m?.messageId
const getCreated = (m) => m?.createdAt ?? m?.timestamp ?? m?.sentAt

const normalizeIncoming = (m) => ({
  id: getMessageId(m),
  senderId: m?.senderId,
  content: m?.content ?? '',
  createdAt: getCreated(m),
  status: m?.status,
  type: m?.type ?? 'MESSAGE',
})

/** Oldest first for reading continuity; id breaks ties when timestamps match. */
const sortByTime = (a, b) => {
  const ta = new Date(getCreated(a) || 0).getTime()
  const tb = new Date(getCreated(b) || 0).getTime()
  if (ta !== tb) return ta - tb
  const ida = getMessageId(a)
  const idb = getMessageId(b)
  if (ida != null && idb != null) return Number(ida) - Number(idb)
  return 0
}

const TravelerChat = ({ connectionId, userId, peerName = 'Viajero' }) => {
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [inputError, setInputError] = useState(false)
  const [loadError, setLoadError] = useState(null)
  const [loadingHistory, setLoadingHistory] = useState(false)
  const [sending, setSending] = useState(false)
  const listEndRef = useRef(null)

  const appendMessages = useCallback((incoming) => {
    if (incoming == null) return
    const list = Array.isArray(incoming) ? incoming : [incoming]
    setMessages((prev) => {
      const map = new Map()
      for (const p of prev) {
        const id = getMessageId(p)
        if (id != null) map.set(id, p)
      }
      for (const raw of list) {
        const n = normalizeIncoming(raw)
        if (n.type === 'ERROR') continue
        if (n.id != null) map.set(n.id, n)
        else map.set(`tmp-${Math.random()}`, n)
      }
      return Array.from(map.values()).sort(sortByTime)
    })
  }, [])

  const { connected, publishSend, hasBroker } = useTravelerChatSocket(connectionId, {
    enabled: Boolean(connectionId && userId),
    onMessage: (msg) => {
      if (msg?.type === 'ERROR') {
        setLoadError(msg.content || 'Error al enviar el mensaje')
        return
      }
      appendMessages(msg)
    },
  })

  useEffect(() => {
    if (connectionId == null || userId == null) {
      setMessages([])
      setLoadingHistory(false)
      return undefined
    }

    let cancelled = false
    setMessages([])
    setLoadingHistory(true)
    setLoadError(null)

    ;(async () => {
      try {
        const history = await getAllConversationMessages(connectionId, userId, 50)
        if (!cancelled) appendMessages(history)
      } catch (e) {
        if (!cancelled) setLoadError(e.message || 'No se pudo cargar la conversación')
      } finally {
        if (!cancelled) setLoadingHistory(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [connectionId, userId, appendMessages])

  useEffect(() => {
    listEndRef.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [messages])

  const submit = async (e) => {
    e?.preventDefault?.()
    const text = draft.trim()
    if (!text) {
      setInputError(true)
      return
    }
    setInputError(false)
    if (connectionId == null || userId == null) return

    setSending(true)
    setLoadError(null)
    try {
      const sentBySocket =
        hasBroker && connected ? publishSend(Number(userId), text) : false

      if (!sentBySocket) {
        const saved = await sendTravelerMessage({
          connectionId: Number(connectionId),
          senderId: Number(userId),
          content: text,
        })
        appendMessages(saved)
      }
      setDraft('')
    } catch (err) {
      setLoadError(err.message || 'No se pudo enviar el mensaje')
    } finally {
      setSending(false)
    }
  }

  const onDraftChange = (v) => {
    setDraft(v)
    if (inputError && v.trim()) setInputError(false)
  }

  const canSend = draft.trim().length > 0 && !sending

  if (connectionId == null || userId == null) {
    return (
      <div className="traveler-chat traveler-chat--notice">
        <p>Debes iniciar sesión para usar el chat.</p>
        <Link to="/login">Ir a login</Link>
      </div>
    )
  }

  return (
    <div className="traveler-chat">
      <header className="traveler-chat__header">
        <Link to="/social" className="traveler-chat__back">
          ← Volver
        </Link>
        <div className="traveler-chat__peer">
          <h1 className="traveler-chat__title">{peerName}</h1>
          {hasBroker && (
            <span className={connected ? 'traveler-chat__live traveler-chat__live--on' : 'traveler-chat__live'}>
              {connected ? 'En vivo' : 'Conectando…'}
            </span>
          )}
        </div>
      </header>

      {loadError && (
        <div className="traveler-chat__banner" role="alert">
          {loadError}
        </div>
      )}

      <div className="traveler-chat__messages" role="log" aria-live="polite">
        {loadingHistory && (
          <div className="traveler-chat__loading" aria-busy="true">
            <span className="traveler-chat__loading-spinner" aria-hidden />
            <p>Cargando historial…</p>
          </div>
        )}
        {!loadingHistory && messages.length === 0 && !loadError && (
          <p className="traveler-chat__empty">
            Aún no hay mensajes en esta conversación. Escribe abajo para empezar a coordinar tu viaje.
          </p>
        )}
        {messages.map((m) => {
          const mine = Number(m.senderId) === Number(userId)
          const time = getCreated(m)
          const label = time
            ? new Date(time).toLocaleString('es-ES', { dateStyle: 'short', timeStyle: 'short' })
            : ''
          return (
            <div key={getMessageId(m) ?? `${m.senderId}-${m.content}-${label}`} className={`traveler-chat__bubble ${mine ? 'is-mine' : ''}`}>
              <p className="traveler-chat__text">{m.content}</p>
              {label && <time className="traveler-chat__time">{label}</time>}
            </div>
          )
        })}
        <div ref={listEndRef} />
      </div>

      <form className="traveler-chat__composer" onSubmit={submit}>
        <label htmlFor="traveler-chat-input" className="visually-hidden">
          Mensaje
        </label>
        <textarea
          id="traveler-chat-input"
          className={`traveler-chat__input ${inputError ? 'has-error' : ''}`}
          rows={2}
          placeholder="Escribe un mensaje…"
          value={draft}
          onChange={(e) => onDraftChange(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              submit(e)
            }
          }}
          disabled={sending}
        />
        {inputError && <p className="traveler-chat__field-error">El mensaje no puede estar vacío.</p>}
        <button type="submit" className="traveler-chat__send" disabled={!canSend}>
          {sending ? 'Enviando…' : 'Enviar'}
        </button>
      </form>
    </div>
  )
}

TravelerChat.propTypes = {
  connectionId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  peerName: PropTypes.string,
}

export default TravelerChat
