import { useState, useEffect, useRef, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { socialService } from '../../services/socialService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import { ArrowLeft, Send, User } from 'lucide-react'

const BORDER_1 = '1px solid var(--border-color)'
const SURFACE_CARD_STYLE = {
  flex: 1,
  background: 'var(--surface-card)',
  borderRadius: 'var(--border-radius-xl)',
  border: BORDER_1,
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
}

function formatChatTime(ts) {
  if (!ts) return ''
  try {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  } catch {
    return ''
  }
}

const BUBBLE_RADIUS = '1rem'
const GRADIENT_PRIMARY = 'var(--gradient-primary)'
const CHAT_THEME_MINE = {
  rowDir: 'row-reverse',
  rowAlign: 'flex-end',
  avatarBg: GRADIENT_PRIMARY,
  avatarColor: '#fff',
  bubbleBg: GRADIENT_PRIMARY,
  bubbleColor: '#fff',
  bubbleTopRight: 0,
  bubbleTopLeft: BUBBLE_RADIUS,
  timeAlign: 'flex-end',
}
const CHAT_THEME_THEIRS = {
  rowDir: 'row',
  rowAlign: 'flex-start',
  avatarBg: 'var(--color-info-light)',
  avatarColor: 'var(--voyager-blue)',
  bubbleBg: 'var(--gray-100)',
  bubbleColor: 'var(--text-primary)',
  bubbleTopRight: BUBBLE_RADIUS,
  bubbleTopLeft: 0,
  timeAlign: 'flex-start',
}

function TravelerChatMessageBubble({ msg, userId }) {
  const isMine = String(msg.senderId) === String(userId)
  const t = isMine ? CHAT_THEME_MINE : CHAT_THEME_THEIRS
  const rowStyle = {
    display: 'flex',
    flexDirection: t.rowDir,
    gap: '0.75rem',
    maxWidth: '80%',
    alignSelf: t.rowAlign,
  }
  const avatarStyle = {
    width: 32,
    height: 32,
    borderRadius: '50%',
    background: t.avatarBg,
    color: t.avatarColor,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }
  const bubbleStyle = {
    background: t.bubbleBg,
    color: t.bubbleColor,
    padding: '0.75rem 1rem',
    borderRadius: BUBBLE_RADIUS,
    borderTopRightRadius: t.bubbleTopRight,
    borderTopLeftRadius: t.bubbleTopLeft,
  }
  return (
    <div style={rowStyle}>
      <div style={avatarStyle}>
        <User size={16} />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        <div style={bubbleStyle}>
          {msg.content}
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: t.timeAlign }}>
          {formatChatTime(msg.timestamp || msg.createdAt)}
        </span>
      </div>
    </div>
  )
}

TravelerChatMessageBubble.propTypes = {
  msg: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    senderId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    content: PropTypes.node,
    timestamp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    createdAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  }).isRequired,
  userId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
}

const TravelerChatPage = () => {
  const { connectionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [messages, setMessages] = useState([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState(null)

  const messagesEndRef = useRef(null)
  const isFirstLoadRef = useRef(true)

  const loadMessages = useCallback(async () => {
    if (!connectionId || !user?.id) return
    try {
      const msgs = await socialService.getAllConversationMessages(connectionId, user.id)
      setMessages(msgs || [])
      setError(null)
      setLoading(false)
      isFirstLoadRef.current = false
    } catch (err) {
      console.error(err)
      if (isFirstLoadRef.current) setError('Failed to load messages')
      setLoading(false)
    }
  }, [connectionId, user?.id])

  useEffect(() => {
    if (!user?.id || !connectionId) return
    isFirstLoadRef.current = true
    setLoading(true)
    loadMessages()
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [user?.id, connectionId, loadMessages])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  let messageArea

  if (loading) {
    messageArea = <div className="loading-center"><div className="spinner" /></div>
  } else if (messages.length === 0) {
    messageArea = (
      <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto 0' }}>
        <p>No messages yet. Say hi!</p>
      </div>
    )
  } else {
    messageArea = messages.map((msg) => (
      <TravelerChatMessageBubble key={msg.id || msg.createdAt || msg.timestamp || `${msg.senderId}-${msg.content}`} msg={msg} userId={user.id} />
    ))
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || sending) return

    setSending(true)
    try {
      await socialService.sendTravelerMessage({
        connectionId: Number(connectionId),
        senderId: user.id,
        content: inputValue.trim(),
      })
      setInputValue('')
      loadMessages()
    } catch (err) {
      console.error(err)
      setError('Failed to send message')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 800, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <button type="button" className="btn-ghost" onClick={() => navigate('/social')} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Traveler Chat</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Connection #{connectionId}</p>
        </div>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      <div style={SURFACE_CARD_STYLE}>

        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messageArea}
          <div ref={messagesEndRef} />
        </div>

        <div style={{ padding: '1rem 1.5rem', borderTop: BORDER_1, background: 'var(--surface-bg)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-full)', border: BORDER_1, outline: 'none' }}
            />
            <button type="submit" disabled={!inputValue.trim() || sending} style={{ width: 42, height: 42, borderRadius: '50%', background: GRADIENT_PRIMARY, color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', opacity: inputValue.trim() ? 1 : 0.6 }}>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default TravelerChatPage
