import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { socialService } from '../../services/socialService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { Users, Search, MessageCircle, UserPlus, Check, X } from 'lucide-react'
import './Social.css'

const Social = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('connections') // 'connections', 'requests', 'discover'
  
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Discover state
  const [discoverPlanId, setDiscoverPlanId] = useState('')
  const [matches, setMatches] = useState([])
  const [discoverLoading, setDiscoverLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    loadSocialData()
  }, [user?.id])

  const loadSocialData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [conns, reqs] = await Promise.all([
        socialService.getUserConnections(user.id),
        socialService.getPendingRequests()
      ])
      setConnections(conns || [])
      setPendingRequests(reqs || [])
    } catch (err) {
      setError(err?.message || 'Failed to load social data')
    } finally {
      setLoading(false)
    }
  }

  const handleDiscover = async (e) => {
    e.preventDefault()
    if (!discoverPlanId) return
    setDiscoverLoading(true)
    setError(null)
    try {
      const results = await socialService.getCompatibleTravelers(discoverPlanId)
      setMatches(results || [])
    } catch (err) {
      setError(err?.message || 'Failed to find matches. Make sure the Plan ID is valid.')
    } finally {
      setDiscoverLoading(false)
    }
  }

  const handleSendRequest = async (recipientId) => {
    try {
      await socialService.sendConnectionRequest({ recipientId, message: 'Hi! Let\'s connect.' })
      alert('Connection request sent!')
      loadSocialData()
    } catch (err) {
      alert(err?.message || 'Failed to send request')
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await socialService.acceptConnectionRequest(requestId)
      loadSocialData()
    } catch (err) {
      alert(err?.message || 'Failed to accept')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await socialService.rejectConnectionRequest(requestId)
      loadSocialData()
    } catch (err) {
      alert(err?.message || 'Failed to reject')
    }
  }

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 800 }}>
        <SkeletonLoader variant="title" width="40%" />
        <SkeletonLoader variant="card" height="400px" style={{ marginTop: '2rem' }} />
      </div>
    )
  }

  return (
    <div className="page-container" style={{ maxWidth: 800 }}>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Traveler Network</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Connect with fellow travelers and find travel buddies.</p>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <button 
          className={`social-tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <Users size={18} /> My Connections ({connections.length})
        </button>
        <button 
          className={`social-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <UserPlus size={18} /> Requests {pendingRequests.length > 0 && <span className="badge-count">{pendingRequests.length}</span>}
        </button>
        <button 
          className={`social-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Search size={18} /> Discover
        </button>
      </div>

      {/* Content */}
      <div style={{ background: 'var(--surface-card)', borderRadius: 'var(--border-radius-xl)', padding: '2rem', border: '1px solid var(--border-color)', boxShadow: 'var(--shadow-sm)' }}>
        
        {/* Connections Tab */}
        {activeTab === 'connections' && (
          <div>
            {connections.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <h3>No connections yet</h3>
                <p>Go to the Discover tab to find travelers with similar plans!</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {connections.map(conn => {
                  const otherUser = conn.senderId === user.id ? conn.recipient : conn.sender
                  return (
                    <div key={conn.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                          {(otherUser?.firstName?.[0] || otherUser?.username?.[0] || '?').toUpperCase()}
                        </div>
                        <div>
                          <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{otherUser?.firstName} {otherUser?.lastName}</h4>
                          <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{otherUser?.username}</p>
                        </div>
                      </div>
                      <button className="btn-primary" onClick={() => navigate(`/social/chat/${conn.id}`)}>
                        <MessageCircle size={16} /> Chat
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div>
            {pendingRequests.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                <UserPlus size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <h3>No pending requests</h3>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {pendingRequests.map(req => (
                  <div key={req.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--gradient-primary)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.25rem' }}>
                        {(req.sender?.firstName?.[0] || req.sender?.username?.[0] || '?').toUpperCase()}
                      </div>
                      <div>
                        <h4 style={{ margin: '0 0 0.25rem', fontSize: '1rem' }}>{req.sender?.firstName} {req.sender?.lastName}</h4>
                        <p style={{ margin: 0, fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{req.sender?.username}</p>
                        {req.message && <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontStyle: 'italic' }}>"{req.message}"</p>}
                      </div>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-primary" onClick={() => handleAccept(req.id)} style={{ padding: '0.5rem' }}>
                        <Check size={18} />
                      </button>
                      <button className="btn-ghost" onClick={() => handleReject(req.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)' }}>
                        <X size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <form onSubmit={handleDiscover} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
              <input 
                type="text"
                placeholder="Enter a Travel Plan ID to find matches"
                value={discoverPlanId}
                onChange={(e) => setDiscoverPlanId(e.target.value)}
                style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}
                required
              />
              <button type="submit" className="btn-primary" disabled={discoverLoading}>
                {discoverLoading ? 'Searching...' : 'Find Matches'}
              </button>
            </form>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {matches.map(match => (
                <div key={match.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius)', background: 'var(--surface-bg)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--voyager-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                      {(match.firstName?.[0] || match.username?.[0] || '?').toUpperCase()}
                    </div>
                    <div>
                      <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{match.firstName} {match.lastName}</h4>
                      <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>@{match.username}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px' }}>
                          {Math.round(match.compatibilityScore * 100)}% Match
                        </span>
                      </div>
                    </div>
                  </div>
                  <button className="btn-outline-sm" onClick={() => handleSendRequest(match.id)}>
                    <UserPlus size={16} /> Connect
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default Social