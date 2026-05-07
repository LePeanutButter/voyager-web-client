import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { socialService } from '../../services/socialService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { Users, Search, MessageCircle, UserPlus, Check, X } from 'lucide-react'
import './Social.css'

const BORDER_DEFAULT = '1px solid var(--border-color)'
const BORDER_RADIUS_STD = 'var(--border-radius)'
const TEXT_SECONDARY = 'var(--text-secondary)'
const TEXT_MUTED = 'var(--text-muted)'
const H4_CONNECTION_NAME_STYLE = { margin: '0 0 0.25rem', fontSize: '1rem' }

const PANEL_SURFACE_STYLE = {
  background: 'var(--surface-card)',
  borderRadius: 'var(--border-radius-xl)',
  padding: '2rem',
  border: BORDER_DEFAULT,
  boxShadow: 'var(--shadow-sm)',
}

const CONNECTION_ROW_STYLE = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '1rem',
  border: BORDER_DEFAULT,
  borderRadius: BORDER_RADIUS_STD,
}

const AVATAR_CIRCLE_STYLE = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'var(--gradient-primary)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 700,
  fontSize: '1.25rem',
}

const EMPTY_STATE_STYLE = {
  textAlign: 'center',
  padding: '3rem 1rem',
  color: TEXT_MUTED,
}

const FLEX_COL_GAP = { display: 'flex', flexDirection: 'column', gap: '1rem' }
const FLEX_ROW_GAP = { display: 'flex', alignItems: 'center', gap: '1rem' }
const USERNAME_SUB_STYLE = { margin: 0, fontSize: '0.875rem', color: TEXT_SECONDARY }

const normalizeFeedPayload = (response) => {
  if (Array.isArray(response?.content)) return response.content
  if (Array.isArray(response)) return response
  if (Array.isArray(response?.data?.content)) return response.data.content
  return []
}

function SocialConnectionsPanel({ connections, user, navigate }) {
  if (connections.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
        <h3>No connections yet</h3>
        <p>Go to the Discover tab to find travelers with similar plans!</p>
      </div>
    )
  }
  return (
    <div style={FLEX_COL_GAP}>
      {connections.map((conn) => {
        const otherUser = conn.senderId === user.id ? conn.recipient : conn.sender
        return (
          <div key={conn.id} style={CONNECTION_ROW_STYLE}>
            <div style={FLEX_ROW_GAP}>
              <div style={AVATAR_CIRCLE_STYLE}>
                {(otherUser?.firstName?.[0] || otherUser?.username?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <h4 style={H4_CONNECTION_NAME_STYLE}>{otherUser?.firstName} {otherUser?.lastName}</h4>
                <p style={USERNAME_SUB_STYLE}>@{otherUser?.username}</p>
              </div>
            </div>
            <button type="button" className="btn-primary" onClick={() => navigate(`/social/chat/${conn.id}`)}>
              <MessageCircle size={16} /> Chat
            </button>
          </div>
        )
      })}
    </div>
  )
}

SocialConnectionsPanel.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }).isRequired,
  navigate: PropTypes.func.isRequired,
}

function SocialRequestsPanel({ pendingRequests, handleAccept, handleReject }) {
  if (pendingRequests.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <UserPlus size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
        <h3>No pending requests</h3>
      </div>
    )
  }
  return (
    <div style={FLEX_COL_GAP}>
      {pendingRequests.map((req) => (
        <div key={req.id} style={CONNECTION_ROW_STYLE}>
          <div style={FLEX_ROW_GAP}>
            <div style={AVATAR_CIRCLE_STYLE}>
              {(req.sender?.firstName?.[0] || req.sender?.username?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h4 style={H4_CONNECTION_NAME_STYLE}>{req.sender?.firstName} {req.sender?.lastName}</h4>
              <p style={USERNAME_SUB_STYLE}>@{req.sender?.username}</p>
              {req.message && (
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.875rem', fontStyle: 'italic' }}>
                  <q cite="#">{req.message}</q>
                </p>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button type="button" className="btn-primary" onClick={() => handleAccept(req.id)} style={{ padding: '0.5rem' }}>
              <Check size={18} />
            </button>
            <button type="button" className="btn-ghost" onClick={() => handleReject(req.id)} style={{ padding: '0.5rem', color: 'var(--color-danger)' }}>
              <X size={18} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

SocialRequestsPanel.propTypes = {
  pendingRequests: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleAccept: PropTypes.func.isRequired,
  handleReject: PropTypes.func.isRequired,
}

function SocialDiscoverPanel({
  discoverPlanId,
  setDiscoverPlanId,
  handleDiscover,
  discoverLoading,
  matches,
  handleSendRequest,
}) {
  return (
    <div>
      <form onSubmit={handleDiscover} style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <input
          type="text"
          placeholder="Enter a Travel Plan ID to find matches"
          value={discoverPlanId}
          onChange={(e) => setDiscoverPlanId(e.target.value)}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: BORDER_RADIUS_STD, border: BORDER_DEFAULT }}
          required
        />
        <button type="submit" className="btn-primary" disabled={discoverLoading}>
          {discoverLoading ? 'Searching...' : 'Find Matches'}
        </button>
      </form>

      <div style={FLEX_COL_GAP}>
        {matches.map((match) => (
          <div
            key={match.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '1.25rem',
              border: BORDER_DEFAULT,
              borderRadius: BORDER_RADIUS_STD,
              background: 'var(--surface-bg)',
            }}
          >
            <div style={FLEX_ROW_GAP}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--voyager-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                {(match.firstName?.[0] || match.username?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>{match.firstName} {match.lastName}</h4>
                <p style={{ margin: '0 0 0.5rem', fontSize: '0.875rem', color: TEXT_SECONDARY }}>@{match.username}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px' }}>
                    {Math.round(match.compatibilityScore * 100)}% Match
                  </span>
                </div>
              </div>
            </div>
            <button type="button" className="btn-outline-sm" onClick={() => handleSendRequest(match.id)}>
              <UserPlus size={16} /> Connect
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

SocialDiscoverPanel.propTypes = {
  discoverPlanId: PropTypes.string.isRequired,
  setDiscoverPlanId: PropTypes.func.isRequired,
  handleDiscover: PropTypes.func.isRequired,
  discoverLoading: PropTypes.bool.isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleSendRequest: PropTypes.func.isRequired,
}

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
  const [feed, setFeed] = useState([])
  const [feedLoading, setFeedLoading] = useState(false)

  const loadSocialData = useCallback(async () => {
    if (!user?.id) return
    setLoading(true)
    setError(null)
    try {
      const [conns, reqs] = await Promise.all([
        socialService.getUserConnections(user.id),
        socialService.getPendingRequests(),
      ])
      setConnections(conns || [])
      setPendingRequests(reqs || [])
    } catch (err) {
      setError(err?.message || 'Failed to load social data')
    } finally {
      setLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    loadSocialData()
  }, [loadSocialData])

  const loadFeed = useCallback(async () => {
    if (!user?.id) return
    setFeedLoading(true)
    try {
      const response = await socialService.getSocialFeed(user.id, 0, 20)
      setFeed(normalizeFeedPayload(response))
    } catch (err) {
      setError(err?.message || 'Failed to load social feed')
      setFeed([])
    } finally {
      setFeedLoading(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (activeTab === 'feed') {
      loadFeed()
    }
  }, [activeTab, loadFeed])

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
      await socialService.sendConnectionRequest({ recipientId, message: 'Hi! Let\u2019s connect.' })
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
        <p style={{ color: TEXT_SECONDARY }}>Connect with fellow travelers and find travel buddies.</p>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: BORDER_DEFAULT }}>
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
        <button
          className={`social-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <MessageCircle size={18} /> Feed
        </button>
      </div>

      {/* Content */}
      <div style={PANEL_SURFACE_STYLE}>
        {activeTab === 'connections' && (
          <SocialConnectionsPanel connections={connections} user={user} navigate={navigate} />
        )}
        {activeTab === 'requests' && (
          <SocialRequestsPanel
            pendingRequests={pendingRequests}
            handleAccept={handleAccept}
            handleReject={handleReject}
          />
        )}
        {activeTab === 'discover' && (
          <SocialDiscoverPanel
            discoverPlanId={discoverPlanId}
            setDiscoverPlanId={setDiscoverPlanId}
            handleDiscover={handleDiscover}
            discoverLoading={discoverLoading}
            matches={matches}
            handleSendRequest={handleSendRequest}
          />
        )}
        {activeTab === 'feed' && (
          <div style={FLEX_COL_GAP}>
            {feedLoading && (
              <>
                <SkeletonLoader variant="text" />
                <SkeletonLoader variant="text" />
                <SkeletonLoader variant="text" />
              </>
            )}
            {!feedLoading && feed.length === 0 && (
              <div style={EMPTY_STATE_STYLE}>
                <MessageCircle size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
                <h3>No social feed yet</h3>
                <p>There are no posts available for your account yet.</p>
              </div>
            )}
            {!feedLoading && feed.map((post) => (
              <div
                key={post.id ?? `${post.author}-${post.content}`}
                style={{
                  padding: '1rem',
                  border: BORDER_DEFAULT,
                  borderRadius: BORDER_RADIUS_STD,
                  background: 'var(--surface-bg)',
                }}
              >
                <h4 style={{ margin: '0 0 0.5rem' }}>{post.author || 'Traveler'}</h4>
                <p style={{ margin: 0 }}>{post.content || post.text || 'Post'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Social