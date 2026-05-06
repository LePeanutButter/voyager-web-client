import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { socialService } from '../../services/socialService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import { ArrowLeft, Send, User } from 'lucide-react'

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

  useEffect(() => {
    if (!user?.id || !connectionId) return
    loadMessages()
    // Poll for new messages every 5 seconds (since we don't have WebSocket implemented yet)
    const interval = setInterval(loadMessages, 5000)
    return () => clearInterval(interval)
  }, [user?.id, connectionId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const loadMessages = async () => {
    try {
      const msgs = await socialService.getAllConversationMessages(connectionId, user.id)
      setMessages(msgs || [])
      setError(null)
      setLoading(false)
    } catch (err) {
      console.error(err)
      if (loading) setError('Failed to load messages')
      setLoading(false)
    }
  }

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
    messageArea = messages.map((msg) => {
      const isMine = String(msg.senderId) === String(user.id)
      return (
        <div key={msg.id || msg.createdAt || msg.timestamp || `${msg.senderId}-${msg.content}`} style={{ display: 'flex', flexDirection: isMine ? 'row-reverse' : 'row', gap: '0.75rem', maxWidth: '80%', alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: isMine ? 'var(--gradient-primary)' : 'var(--color-info-light)', color: isMine ? '#fff' : 'var(--voyager-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <User size={16} />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ background: isMine ? 'var(--gradient-primary)' : 'var(--gray-100)', color: isMine ? '#fff' : 'var(--text-primary)', padding: '0.75rem 1rem', borderRadius: '1rem', borderTopRightRadius: isMine ? 0 : '1rem', borderTopLeftRadius: isMine ? '1rem' : 0 }}>
              {msg.content}
            </div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', alignSelf: isMine ? 'flex-end' : 'flex-start' }}>
              {formatTime(msg.timestamp || msg.createdAt)}
            </span>
          </div>
        </div>
      )
    })
  }

  const handleSend = async (e) => {
    e.preventDefault()
    if (!inputValue.trim() || sending) return
    
    setSending(true)
    try {
      await socialService.sendTravelerMessage({
        connectionId: Number(connectionId),
        senderId: user.id,
        content: inputValue.trim()
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

  const formatTime = (ts) => {
    if (!ts) return ''
    try {
      return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 800, height: 'calc(100vh - 120px)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
        <button className="btn-ghost" onClick={() => navigate('/social')} style={{ padding: '0.5rem' }}>
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0 }}>Traveler Chat</h1>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>Connection #{connectionId}</p>
        </div>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      <div style={{ flex: 1, background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {/* Messages Area */}
        <div style={{ flex: 1, padding: '1.5rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messageArea}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--surface-bg)' }}>
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--border-color)', outline: 'none' }}
            />
            <button type="submit" disabled={!inputValue.trim() || sending} style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputValue.trim() ? 'pointer' : 'not-allowed', opacity: inputValue.trim() ? 1 : 0.6 }}>
              <Send size={18} />
            </button>
          </form>
        </div>

      </div>
    </div>
  )
}

export default TravelerChatPage
