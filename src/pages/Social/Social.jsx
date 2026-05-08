import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { socialService } from '../../services/socialService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { Users, Search, MessageCircle, UserPlus, Check, X, Trash2 } from 'lucide-react'
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

function SocialConnectionsPanel({ connections, user, navigate, onDeleteConnection }) {
  if (connections.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <Users size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
        <h3>Aun no tienes conexiones</h3>
        <p>Ve a la pestaña Descubrir para encontrar viajeros con planes similares.</p>
      </div>
    )
  }
  return (
    <div style={FLEX_COL_GAP}>
      {connections.map((conn) => {
        console.log('Connection object in My Connections:', conn)
        const otherUser = conn.userId === user.id ? conn : conn
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
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button type="button" className="btn-primary" onClick={() => navigate(`/social/chat/${conn.id}`)}>
                <MessageCircle size={16} /> Chat
              </button>
              <button 
                type="button" 
                className="btn-ghost" 
                onClick={() => handleDeleteConnection(conn.id, otherUser?.firstName || otherUser?.username)}
                style={{ padding: '0.5rem', color: 'var(--color-danger)' }}
                title="Eliminar conexión"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )

  async function handleDeleteConnection(connectionId, userName) {
    if (window.confirm(`¿Estás seguro de que quieres eliminar la conexión con ${userName}?`)) {
      try {
        await socialService.removeConnection(connectionId)
        alert('Conexión eliminada exitosamente')
        onDeleteConnection() // Refresh the connections list
      } catch (err) {
        console.error('Error removing connection:', err)
        alert(err?.message || 'No se pudo eliminar la conexión')
      }
    }
  }
}

SocialConnectionsPanel.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
  user: PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]) }).isRequired,
  navigate: PropTypes.func.isRequired,
  onDeleteConnection: PropTypes.func.isRequired,
}

function SocialRequestsPanel({ pendingRequests, handleAccept, handleReject }) {
  if (pendingRequests.length === 0) {
    return (
      <div style={EMPTY_STATE_STYLE}>
        <UserPlus size={48} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
        <h3>No hay solicitudes pendientes</h3>
      </div>
    )
  }
  return (
    <div style={FLEX_COL_GAP}>
      {pendingRequests.map((req) => (
        <div key={req.id} style={CONNECTION_ROW_STYLE}>
          <div style={FLEX_ROW_GAP}>
            <div style={AVATAR_CIRCLE_STYLE}>
              {(req.requesterName?.[0] || req.requesterUsername?.[0] || '?').toUpperCase()}
            </div>
            <div>
              <h4 style={H4_CONNECTION_NAME_STYLE}>{req.requesterName || 'Usuario'}</h4>
              <p style={USERNAME_SUB_STYLE}>@{req.requesterUsername || 'usuario'}</p>
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
          placeholder="Ingresa el ID de un plan para buscar coincidencias"
          value={discoverPlanId}
          onChange={(e) => setDiscoverPlanId(e.target.value)}
          style={{ flex: 1, padding: '0.75rem 1rem', borderRadius: BORDER_RADIUS_STD, border: BORDER_DEFAULT }}
          required
        />
        <button type="submit" className="btn-primary" disabled={discoverLoading}>
          {discoverLoading ? 'Buscando...' : 'Buscar coincidencias'}
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
                    {Math.round(match.compatibilityScore * 100)}% Compatibilidad
                  </span>
                </div>
              </div>
            </div>
            <button type="button" className="btn-outline-sm" onClick={() => handleSendRequest(match.userId)}>
              <UserPlus size={16} /> Conectar
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
      setError(err?.message || 'No se pudieron cargar los datos sociales')
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
      setError(err?.message || 'No se pudo cargar el feed social')
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
      setError(err?.message || 'No se encontraron coincidencias. Verifica que el ID del plan sea valido.')
    } finally {
      setDiscoverLoading(false)
    }
  }

  const handleSendRequest = async (recipientId) => {
    try {
      const payload = { recipientId, message: '¡Hola! Conectemos.' }
      console.log('Sending connection request payload:', payload)
      await socialService.sendConnectionRequest(payload)
      alert('¡Solicitud de conexion enviada!')
      loadSocialData()
    } catch (err) {
      console.error('Connection request error:', err)
      alert(err?.message || 'No se pudo enviar la solicitud')
    }
  }

  const handleAccept = async (requestId) => {
    try {
      await socialService.acceptConnectionRequest(requestId)
      loadSocialData()
    } catch (err) {
      alert(err?.message || 'No se pudo aceptar la solicitud')
    }
  }

  const handleReject = async (requestId) => {
    try {
      await socialService.rejectConnectionRequest(requestId)
      loadSocialData()
    } catch (err) {
      alert(err?.message || 'No se pudo rechazar la solicitud')
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
        <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Red de viajeros</h1>
        <p style={{ color: TEXT_SECONDARY }}>Conecta con otros viajeros y encuentra compañeros de viaje.</p>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: BORDER_DEFAULT }}>
        <button 
          className={`social-tab ${activeTab === 'connections' ? 'active' : ''}`}
          onClick={() => setActiveTab('connections')}
        >
          <Users size={18} /> Mis conexiones ({connections.length})
        </button>
        <button 
          className={`social-tab ${activeTab === 'requests' ? 'active' : ''}`}
          onClick={() => setActiveTab('requests')}
        >
          <UserPlus size={18} /> Solicitudes {pendingRequests.length > 0 && <span className="badge-count">{pendingRequests.length}</span>}
        </button>
        <button 
          className={`social-tab ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          <Search size={18} /> Descubrir
        </button>
        <button
          className={`social-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => setActiveTab('feed')}
        >
          <MessageCircle size={18} /> Inicio social
        </button>
      </div>

      {/* Content */}
      <div style={PANEL_SURFACE_STYLE}>
        {activeTab === 'connections' && (
          <SocialConnectionsPanel 
            connections={connections} 
            user={user} 
            navigate={navigate} 
            onDeleteConnection={loadSocialData}
          />
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
                <h3>Aun no hay feed social</h3>
                <p>Todavia no hay publicaciones disponibles para tu cuenta.</p>
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
                <h4 style={{ margin: '0 0 0.5rem' }}>{post.author || 'Viajero'}</h4>
                <p style={{ margin: 0 }}>{post.content || post.text || 'Publicacion'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Social