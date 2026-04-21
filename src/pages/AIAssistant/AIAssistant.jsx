import React, { useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { 
  Send, 
  Bot, 
  User, 
  MapPin, 
  Calendar, 
  DollarSign,
  Sparkles,
  MessageCircle,
  Lightbulb
} from 'lucide-react'
import './AIAssistant.css'

const AIAssistant = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'ai',
      content: 'Hello! I\'m your AI travel assistant. I can help you plan trips, find destinations, get travel tips, and answer any travel-related questions. How can I assist you today?',
      timestamp: '10:00 AM'
    }
  ])
  
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const quickSuggestions = [
    { icon: MapPin, text: 'Find romantic destinations in Europe' },
    { icon: Calendar, text: 'Plan a 7-day trip to Japan' },
    { icon: DollarSign, text: 'Budget-friendly vacation ideas' },
    { icon: Lightbulb, text: 'Best time to visit Southeast Asia' }
  ]

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: messages.length + 1,
        type: 'user',
        content: inputValue,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
      
      setMessages([...messages, newMessage])
      setInputValue('')
      setIsTyping(true)
      
      // Simulate AI response
      setTimeout(() => {
        const aiResponse = {
          id: messages.length + 2,
          type: 'ai',
          content: 'I\'m analyzing your request and preparing personalized recommendations for you...',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
        setMessages(prev => [...prev, aiResponse])
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion.text)
  }

  return (
    <div className="ai-assistant">
      <div className="assistant-header">
        <div className="header-content">
          <div className="ai-avatar">
            <Bot size={32} />
          </div>
          <div className="header-info">
            <h1>AI Travel Assistant</h1>
            <p>Your personal travel planning companion</p>
          </div>
        </div>
        <div className="header-actions">
          <Button variant="outline" size="small">Clear Chat</Button>
          <Button variant="outline" size="small">Export Chat</Button>
        </div>
      </div>

      <div className="assistant-content">
        <div className="chat-container">
          <div className="chat-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.type}`}>
                <div className="message-avatar">
                  {message.type === 'ai' ? <Bot size={20} /> : <User size={20} />}
                </div>
                <div className="message-content">
                  <div className="message-text">{message.content}</div>
                  <div className="message-time">{message.timestamp}</div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message ai">
                <div className="message-avatar">
                  <Bot size={20} />
                </div>
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="chat-input">
            <div className="input-container">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Ask me anything about travel..."
                className="message-input"
              />
              <Button 
                onClick={handleSendMessage} 
                variant="primary" 
                size="small"
                disabled={!inputValue.trim()}
              >
                <Send size={16} />
              </Button>
            </div>
          </div>
        </div>

        <div className="assistant-sidebar">
          <Card title="Quick Suggestions" className="suggestions-card">
            <div className="suggestions-list">
              {quickSuggestions.map((suggestion, index) => {
                const Icon = suggestion.icon
                return (
                  <button
                    key={index}
                    className="suggestion-item"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <Icon size={16} />
                    <span>{suggestion.text}</span>
                  </button>
                )
              })}
            </div>
          </Card>

          <Card title="AI Capabilities" className="capabilities-card">
            <div className="capabilities-list">
              <div className="capability-item">
                <Sparkles size={16} />
                <div>
                  <h4>Smart Recommendations</h4>
                  <p>Personalized suggestions based on your preferences</p>
                </div>
              </div>
              <div className="capability-item">
                <MessageCircle size={16} />
                <div>
                  <h4>Natural Conversation</h4>
                  <p>Chat naturally about your travel needs</p>
                </div>
              </div>
              <div className="capability-item">
                <Lightbulb size={16} />
                <div>
                  <h4>Travel Insights</h4>
                  <p>Get expert tips and local knowledge</p>
                </div>
              </div>
            </div>
          </Card>

          <Card title="Popular Topics" className="topics-card">
            <div className="topics-list">
              <span className="topic-tag">Budget Planning</span>
              <span className="topic-tag">Safety Tips</span>
              <span className="topic-tag">Local Culture</span>
              <span className="topic-tag">Best Season</span>
              <span className="topic-tag">Hidden Gems</span>
              <span className="topic-tag">Travel Documents</span>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default AIAssistant
