import { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useAIChat } from '../../hooks/useAIChat'
import ErrorBanner from '../../components/UI/ErrorBanner'
import { ChatMessageSkeleton } from '../../components/UI/SkeletonLoader'
import {
  Send, Bot, User, MapPin, Calendar, DollarSign,
  Lightbulb, Trash2, ThumbsUp, ThumbsDown, Sparkles, TrendingUp
} from 'lucide-react'
import './AIAssistant.css'

const QUICK_SUGGESTIONS = [
  { icon: MapPin, text: 'Find romantic destinations in Europe' },
  { icon: Calendar, text: 'Plan a 7-day trip to Japan' },
  { icon: DollarSign, text: 'Budget-friendly vacation under $1,500' },
  { icon: Lightbulb, text: 'Best time to visit Southeast Asia' },
]

const AIAssistant = () => {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [inputValue, setInputValue] = useState('')
  const [feedbackGiven, setFeedbackGiven] = useState({}) // msgId → 'up'|'down'
  const inputRef = useRef(null)

  const {
    messages,
    loading,
    loadingHistory,
    error,
    messagesEndRef,
    sendMessage,
    clearHistory,
    submitFeedback,
    clearError,
  } = useAIChat(userId)

  const handleSend = async () => {
    const text = inputValue.trim()
    if (!text || loading) return
    setInputValue('')
    inputRef.current?.focus()
    await sendMessage(text)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const handleSuggestion = (text) => {
    setInputValue(text)
    inputRef.current?.focus()
  }

  const handleFeedback = async (msgId, activityId, rating) => {
    setFeedbackGiven((prev) => ({ ...prev, [msgId]: rating > 3 ? 'up' : 'down' }))
    await submitFeedback(msgId, activityId || 'general', rating)
  }

  const handleClearHistory = async () => {
    if (globalThis.confirm('Clear entire conversation history?') === false) return
    await clearHistory()
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
    <div className="ai-assistant-page page-container">
      {/* Header */}
      <div className="ai-header">
        <div className="ai-header-left">
          <div className="ai-avatar-lg">
            <Sparkles size={24} />
          </div>
          <div>
            <h1>AI Travel Assistant</h1>
            <p>Powered by advanced AI — ask anything about your travels</p>
          </div>
        </div>
        <div className="ai-header-actions">
          <button
            id="ai-clear-history-btn"
            className="btn-outline-sm"
            onClick={handleClearHistory}
            title="Clear conversation"
          >
            <Trash2 size={15} />
            Clear
          </button>
        </div>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={clearError} />

      <div className="ai-layout">
        {/* Chat panel */}
        <div className="ai-chat-panel">
          {/* Messages */}
          <div className="chat-messages" id="chat-messages-container">
            {loadingHistory ? (
              <>
                <ChatMessageSkeleton />
                <ChatMessageSkeleton isUser />
                <ChatMessageSkeleton />
              </>
            ) : (
              <>
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`chat-message ${msg.type} ${msg.isError ? 'error-msg' : ''} animate-fadeIn`}
                  >
                    <div className="msg-avatar">
                      {msg.type === 'ai' ? <Bot size={17} /> : <User size={17} />}
                    </div>
                    <div className="msg-body">
                      <div className="msg-bubble">{msg.content}</div>

                      {/* Suggestion chips */}
                      {msg.type === 'ai' && msg.suggestions?.length > 0 && (
                        <div className="msg-suggestions">
                          {msg.suggestions.slice(0, 4).map((s) => (
                            <button
                              key={typeof s === 'string' ? s : s.text || s.name}
                              className="suggestion-chip"
                              onClick={() => handleSuggestion(typeof s === 'string' ? s : s.text || s.name || '')}
                            >
                              {typeof s === 'string' ? s : s.text || s.name}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="msg-meta">
                        <span className="msg-time">{formatTime(msg.timestamp)}</span>
                        {msg.type === 'ai' && !msg.isError && (
                          <div className="msg-feedback">
                            <button
                              className={`feedback-btn ${feedbackGiven[msg.id] === 'up' ? 'active' : ''}`}
                              onClick={() => handleFeedback(msg.id, null, 5)}
                              title="Helpful"
                            >
                              <ThumbsUp size={13} />
                            </button>
                            <button
                              className={`feedback-btn ${feedbackGiven[msg.id] === 'down' ? 'active red' : ''}`}
                              onClick={() => handleFeedback(msg.id, null, 1)}
                              title="Not helpful"
                            >
                              <ThumbsDown size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {/* Typing indicator */}
                {loading && (
                  <div className="chat-message ai animate-fadeIn">
                    <div className="msg-avatar"><Bot size={17} /></div>
                    <div className="msg-body">
                      <div className="msg-bubble">
                        <div className="typing-indicator">
                          <span /><span /><span />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Input area */}
          <div className="chat-input-area">
            <textarea
              ref={inputRef}
              id="ai-chat-input"
              className="chat-textarea"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask about destinations, itineraries, budgets…"
              rows={1}
              disabled={loading}
              aria-label="Chat message input"
            />
            <button
              id="ai-send-btn"
              className="chat-send-btn"
              onClick={handleSend}
              disabled={!inputValue.trim() || loading}
              aria-label="Send message"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="chat-hint">Press Enter to send · Shift+Enter for new line</p>
        </div>

        {/* Sidebar */}
        <div className="ai-sidebar">
          {/* Quick suggestions */}
          <div className="ai-sidebar-section">
            <h3>Quick Prompts</h3>
            <div className="quick-suggestions">
              {QUICK_SUGGESTIONS.map((s) => {
                const Icon = s.icon
                return (
                  <button
                    key={s.text}
                    className="quick-suggestion-btn"
                    onClick={() => handleSuggestion(s.text)}
                  >
                    <Icon size={15} />
                    <span>{s.text}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Capabilities */}
          <div className="ai-sidebar-section">
            <h3>What I can do</h3>
            <div className="capabilities">
              {[
                { icon: Sparkles, label: 'Smart Recommendations', desc: 'Personalized for your style' },
                { icon: MapPin, label: 'Destination Discovery', desc: 'Hidden gems worldwide' },
                { icon: TrendingUp, label: 'Budget Planning', desc: 'Cost estimates & tips' },
                { icon: Calendar, label: 'Itinerary Builder', desc: 'Day-by-day planning' },
              ].map(({ icon: Icon, label, desc }) => (
                <div key={label} className="capability-item">
                  <div className="capability-icon">
                    <Icon size={16} />
                  </div>
                  <div>
                    <h4>{label}</h4>
                    <p>{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
