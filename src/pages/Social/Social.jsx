import { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import PropTypes from 'prop-types'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { socialService } from '../../services/socialService'
import { travelService } from '../../services/travelService'
import { aiService } from '../../services/aiService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { Users, Search, MessageCircle, UserPlus, Check, X, Trash2, Sparkles, MapPin, Calendar } from 'lucide-react'
import { mergeDiscoveryMatches, normalizeTravelerListResponse } from '../../utils/planTravelerMatches'
import {
  checkDiscoverRefreshAllowed,
  recordDiscoverManualRefresh,
  DISCOVER_REFRESH_COOLDOWN_MS,
} from '../../utils/discoverRefreshLimiter'
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

const getConnectionRecordId = (conn) => conn?.id ?? conn?.connectionId ?? null

const normalizeConnectionPeer = (conn = {}) => ({
  id:
    conn?.connectedUserId ??
    conn?.otherUserId ??
    conn?.peerUserId ??
    conn?.userId ??
    conn?.id ??
    null,
  firstName: conn?.firstName ?? conn?.connectedUserName ?? conn?.displayName ?? conn?.travelerName ?? 'Viajero',
  lastName: conn?.lastName ?? '',
  username: conn?.username ?? conn?.connectedUsername ?? conn?.peerUsername ?? 'usuario',
})

async function handleDeleteConnection(connectionId, userName, onDeleteConnection) {
  if (globalThis.confirm(`¿Estás seguro de que quieres eliminar la conexión con ${userName}?`)) {
    try {
      await socialService.removeConnection(connectionId)
      globalThis.alert('Conexión eliminada exitosamente')
      onDeleteConnection()
    } catch (err) {
      console.error('Error removing connection:', err)
      globalThis.alert(err?.message || 'No se pudo eliminar la conexión')
    }
  }
}

function SocialConnectionsPanel({ connections, navigate, onDeleteConnection }) {
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
        const otherUser = normalizeConnectionPeer(conn)
        const connectionId = getConnectionRecordId(conn)
        return (
          <div key={connectionId ?? `${otherUser.username}-${otherUser.id}`} style={CONNECTION_ROW_STYLE}>
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
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate(`/social/chat/${connectionId}`)}
                disabled={!connectionId}
              >
                <MessageCircle size={16} /> Chat
              </button>
              <button 
                type="button" 
                className="btn-ghost" 
                disabled={!connectionId}
                onClick={() =>
                  handleDeleteConnection(
                    connectionId,
                    otherUser?.firstName || otherUser?.username,
                    onDeleteConnection
                  )}
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
}

SocialConnectionsPanel.propTypes = {
  connections: PropTypes.arrayOf(PropTypes.object).isRequired,
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

function formatDiscoverDate(v) {
  if (v == null || v === '') return null
  try {
    const d = new Date(v)
    if (Number.isNaN(d.getTime())) return null
    return d.toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
  } catch {
    return null
  }
}

function SocialDiscoverPanel({
  myPlans,
  selectedPlanId,
  setSelectedPlanId,
  discoverLoading,
  discoverManualCooldownSec,
  discoverRefreshNotice,
  aiMatches,
  matches,
  handleSendRequest,
  onRefresh,
  onViewProfile,
}) {
  return (
    <div>
      <p style={{ color: TEXT_SECONDARY, marginBottom: '1.25rem', lineHeight: 1.5 }}>
        Elige uno de <strong>tus planes</strong>: cargamos automáticamente viajeros compatibles (backend) y
        sugerencias del servicio de IA. Puedes actualizar cuando cambies de plan.
      </p>

      {discoverRefreshNotice && (
        <p style={{ fontSize: '0.8125rem', color: 'var(--color-warning)', marginBottom: '0.75rem' }} role="status">
          {discoverRefreshNotice}
        </p>
      )}

      {myPlans.length === 0 ? (
        <div style={{ ...EMPTY_STATE_STYLE, padding: '2rem 1rem' }}>
          <Search size={40} style={{ opacity: 0.2, margin: '0 auto 1rem' }} />
          <h3>Crea un plan para ver recomendaciones</h3>
          <p style={{ color: TEXT_MUTED }}>En Mis viajes puedes añadir un destino; aquí aparecerán coincidencias sin buscar por ID.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.5rem' }}>
          <div style={{ flex: '1 1 220px' }}>
            <label htmlFor="discover-plan-select" style={{ display: 'block', fontSize: '0.8125rem', fontWeight: 600, marginBottom: '0.375rem', color: TEXT_SECONDARY }}>
              Plan de viaje
            </label>
            <select
              id="discover-plan-select"
              value={selectedPlanId}
              onChange={(e) => setSelectedPlanId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.75rem 1rem',
                borderRadius: BORDER_RADIUS_STD,
                border: BORDER_DEFAULT,
                background: 'var(--surface-card)',
                fontSize: '0.9375rem',
              }}
            >
              {myPlans.map((p) => (
                <option key={p.id} value={String(p.id)}>
                  {p.title || `Plan ${p.id}`}
                  {p.destinationLocation ? ` — ${p.destinationLocation}` : ''} (id {p.id})
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            className="btn-outline-sm"
            onClick={onRefresh}
            disabled={discoverLoading || discoverManualCooldownSec > 0}
          >
            {discoverLoading
              ? 'Actualizando…'
              : discoverManualCooldownSec > 0
                ? `Actualizar (${discoverManualCooldownSec}s)`
                : 'Actualizar sugerencias'}
          </button>
        </div>
      )}

      <div style={FLEX_COL_GAP}>
        {aiMatches.length > 0 && (
          <div className="social-discover-ai-row">
            <div className="social-discover-ai-title">
              <Sparkles size={15} /> Recomendados por IA para este plan
            </div>
            <div className="social-discover-ai-cards">
              {aiMatches.map((match) => {
                const uid = match.userId ?? match.user_id
                return (
                  <button
                    key={`ai-${uid}`}
                    type="button"
                    className="social-discover-ai-card"
                    onClick={() => onViewProfile(match)}
                  >
                    <span className="social-discover-ai-name">
                      {match.firstName} {match.lastName}
                    </span>
                    <span className="social-discover-ai-user">@{match.username}</span>
                    <span className="social-discover-ai-score">
                      {Math.round(Math.min(1, Math.max(0, match.compatibilityScore || 0)) * 100)}% match
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        )}

        {matches.map((match) => {
          const uid = match.userId ?? match.user_id
          const startL = formatDiscoverDate(match.travelStartDate)
          const endL = formatDiscoverDate(match.travelEndDate)
          const dateLine =
            startL && endL ? `${startL} – ${endL}` : startL || endL || null
          const shared = match.sharedDestinations?.length
            ? match.sharedDestinations
            : match.shared_destinations
          return (
            <div
              key={String(uid)}
              className="social-discover-item"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '1rem',
                padding: '1.25rem',
                border: BORDER_DEFAULT,
                borderRadius: BORDER_RADIUS_STD,
                background: 'var(--surface-bg)',
                flexWrap: 'wrap',
                width: '100%',
                textAlign: 'left',
              }}
            >
              <button
                type="button"
                className="social-discover-profile-hit"
                onClick={() => onViewProfile(match)}
                style={{
                  ...FLEX_ROW_GAP,
                  flex: '1 1 240px',
                  cursor: 'pointer',
                  border: 'none',
                  background: 'transparent',
                  padding: 0,
                  margin: 0,
                  font: 'inherit',
                  color: 'inherit',
                  textAlign: 'left',
                }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-info-light)', color: 'var(--voyager-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1.5rem' }}>
                  {(match.firstName?.[0] || match.username?.[0] || '?').toUpperCase()}
                </div>
                <div>
                  <h4 style={{ margin: '0 0 0.25rem', fontSize: '1.1rem' }}>
                    {match.firstName} {match.lastName}
                  </h4>
                  <p style={{ margin: '0 0 0.35rem', fontSize: '0.875rem', color: TEXT_SECONDARY }}>
                    @{match.username}
                  </p>
                  {match.travelPlanTitle && (
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      Plan: {match.travelPlanTitle}
                    </p>
                  )}
                  {match.destinationLocation && (
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: TEXT_SECONDARY, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <MapPin size={14} /> {match.destinationLocation}
                    </p>
                  )}
                  {dateLine && (
                    <p style={{ margin: '0 0 0.25rem', fontSize: '0.8125rem', color: TEXT_SECONDARY, display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                      <Calendar size={14} /> {dateLine}
                    </p>
                  )}
                  {Array.isArray(shared) && shared.length > 0 && (
                    <p style={{ margin: '0.35rem 0 0', fontSize: '0.8125rem', color: TEXT_SECONDARY, lineHeight: 1.4 }}>
                      <strong style={{ color: 'var(--text-primary)' }}>Huella en común:</strong> {shared.join(', ')}
                    </p>
                  )}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 800, background: 'var(--color-success-light)', color: 'var(--color-success)', padding: '2px 8px', borderRadius: '12px' }}>
                      {Math.round(Math.min(1, Math.max(0, match.compatibilityScore || 0)) * 100)}% compatibilidad
                    </span>
                    {(match.source === 'ai' || match.source === 'both') && (
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, background: 'var(--color-info-light)', color: 'var(--voyager-blue)', padding: '2px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Sparkles size={12} /> IA
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <button
                type="button"
                className="btn-outline-sm"
                onClick={() => handleSendRequest(uid)}
                disabled={!uid}
              >
                <UserPlus size={16} /> Conectar
              </button>
            </div>
          )
        })}
      </div>

      {!discoverLoading && myPlans.length > 0 && matches.length === 0 && (
        <p style={{ textAlign: 'center', color: TEXT_MUTED, marginTop: '1.5rem', fontSize: '0.875rem' }}>
          No hay sugerencias para este plan. Prueba otro viaje o actualiza más tarde.
        </p>
      )}
    </div>
  )
}

SocialDiscoverPanel.propTypes = {
  myPlans: PropTypes.arrayOf(PropTypes.object).isRequired,
  selectedPlanId: PropTypes.string.isRequired,
  setSelectedPlanId: PropTypes.func.isRequired,
  discoverLoading: PropTypes.bool.isRequired,
  discoverManualCooldownSec: PropTypes.number.isRequired,
  discoverRefreshNotice: PropTypes.string,
  aiMatches: PropTypes.arrayOf(PropTypes.object).isRequired,
  matches: PropTypes.arrayOf(PropTypes.object).isRequired,
  handleSendRequest: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onViewProfile: PropTypes.func.isRequired,
}

const Social = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('connections') // 'connections', 'requests', 'discover'
  
  const [connections, setConnections] = useState([])
  const [pendingRequests, setPendingRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Discover state (planes del usuario + sugerencias automáticas)
  const [myPlans, setMyPlans] = useState([])
  const [selectedPlanId, setSelectedPlanId] = useState('')
  const [aiMatches, setAiMatches] = useState([])
  const [matches, setMatches] = useState([])
  const [discoverLoading, setDiscoverLoading] = useState(false)
  const [profileLoading, setProfileLoading] = useState(false)
  const [activeTravelerProfile, setActiveTravelerProfile] = useState(null)
  const refreshAttemptsRef = useRef([])
  const [discoverManualCooldownUntil, setDiscoverManualCooldownUntil] = useState(0)
  const [discoverCooldownTick, setDiscoverCooldownTick] = useState(0)
  const [discoverRefreshNotice, setDiscoverRefreshNotice] = useState('')

  const discoverManualCooldownSec = useMemo(() => {
    void discoverCooldownTick
    if (!discoverManualCooldownUntil) return 0
    const left = Math.ceil((discoverManualCooldownUntil - Date.now()) / 1000)
    return left > 0 ? left : 0
  }, [discoverManualCooldownUntil, discoverCooldownTick])

  useEffect(() => {
    if (discoverManualCooldownUntil <= Date.now()) return undefined
    const id = setInterval(() => setDiscoverCooldownTick((n) => n + 1), 1000)
    return () => clearInterval(id)
  }, [discoverManualCooldownUntil])

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

  useEffect(() => {
    if (activeTab !== 'discover' || !user?.id) return
    let cancelled = false
    ;(async () => {
      try {
        const list = await travelService.list()
        if (cancelled) return
        const arr = Array.isArray(list) ? list : []
        setMyPlans(arr)
        setSelectedPlanId((prev) => {
          if (prev && arr.some((p) => String(p.id) === String(prev))) return prev
          return arr[0] ? String(arr[0].id) : ''
        })
      } catch {
        if (!cancelled) {
          setMyPlans([])
          setSelectedPlanId('')
        }
      }
    })()
    return () => {
      cancelled = true
    }
  }, [activeTab, user?.id])

  useEffect(() => {
    const fid = location.state?.focusPlanId
    if (fid == null) return
    setActiveTab('discover')
    setSelectedPlanId(String(fid))
    const prev = location.state && typeof location.state === 'object' ? { ...location.state } : {}
    delete prev.focusPlanId
    navigate(location.pathname, { replace: true, state: prev })
  }, [location.pathname, location.state, navigate])

  const fetchDiscoverMatches = useCallback(
    async (options = {}) => {
      const { recordManualSuccess = false } = options
      if (!user?.id) {
        setMatches([])
        setAiMatches([])
        return
      }
      if (!myPlans.length) {
        setMatches([])
        setAiMatches([])
        return
      }
      setDiscoverLoading(true)
      setError(null)
      try {
        const planMeta =
          myPlans.find((p) => String(p.id) === String(selectedPlanId)) || myPlans[0]
        const compatPlanId = selectedPlanId || String(planMeta.id)
        const dest = planMeta?.destinationLocation || planMeta?.destination_location || ''
        const footprint = [
          ...new Set(
            myPlans
              .map((p) => p.destinationLocation || p.destination_location)
              .filter(Boolean)
              .map((x) => String(x).trim())
          ),
        ]
        const [compat, buddies] = await Promise.all([
          socialService.getCompatibleTravelers(compatPlanId).catch(() => []),
          aiService
            .getBuddyRecommendations(String(user.id), {
              location: dest || null,
              seekerFootprint: footprint.length ? footprint : null,
              limit: 15,
            })
            .catch(() => ({})),
        ])
        const merged = mergeDiscoveryMatches(
          normalizeTravelerListResponse(compat),
          buddies,
          dest,
          user.id
        )
        const onlyAi = merged
          .filter((m) => m.source === 'ai' || m.source === 'both')
          .slice(0, 4)
        const aiIds = new Set(onlyAi.map((m) => String(m.userId ?? m.user_id)))
        const ranked = [...onlyAi, ...merged.filter((m) => !aiIds.has(String(m.userId ?? m.user_id)))]
        setAiMatches(onlyAi)
        setMatches(ranked)
        if (recordManualSuccess) {
          recordDiscoverManualRefresh(refreshAttemptsRef)
          setDiscoverManualCooldownUntil(Date.now() + DISCOVER_REFRESH_COOLDOWN_MS)
          setDiscoverCooldownTick((n) => n + 1)
        }
      } catch (err) {
        setError(err?.message || 'No se pudieron cargar las sugerencias.')
        setAiMatches([])
        setMatches([])
      } finally {
        setDiscoverLoading(false)
      }
    },
    [user?.id, selectedPlanId, myPlans]
  )

  const handleManualDiscoverRefresh = useCallback(() => {
    const gate = checkDiscoverRefreshAllowed(refreshAttemptsRef)
    if (!gate.ok) {
      const sec = Math.max(1, Math.ceil(gate.retryAfterMs / 1000))
      setDiscoverRefreshNotice(
        gate.code === 'rate'
          ? `Has alcanzado el límite de actualizaciones. Vuelve a intentar en ${sec} s.`
          : `Por seguridad, espera ${sec} s antes de volver a actualizar.`
      )
      setDiscoverManualCooldownUntil(Date.now() + gate.retryAfterMs)
      setDiscoverCooldownTick((n) => n + 1)
      return
    }
    setDiscoverRefreshNotice('')
    fetchDiscoverMatches({ recordManualSuccess: true })
  }, [fetchDiscoverMatches])

  const openTravelerProfile = async (traveler) => {
    const travelerId = traveler?.userId ?? traveler?.user_id ?? traveler?.id
    setActiveTravelerProfile({
      ...traveler,
      summary: null,
    })
    if (!travelerId) return
    setProfileLoading(true)
    try {
      const summary = await socialService.getTravelerSummary(travelerId)
      setActiveTravelerProfile((prev) => (prev ? { ...prev, summary } : prev))
    } catch {
      // fallback silencioso: se mantiene info base del match
    } finally {
      setProfileLoading(false)
    }
  }

  useEffect(() => {
    if (activeTab !== 'discover' || !user?.id) return
    if (!myPlans.length) return
    fetchDiscoverMatches()
  }, [activeTab, user?.id, myPlans.length, fetchDiscoverMatches])

  useEffect(() => {
    if (activeTab !== 'discover') setDiscoverRefreshNotice('')
  }, [activeTab])

  useEffect(() => {
    if (!activeTravelerProfile) return undefined
    const onKey = (e) => {
      if (e.key === 'Escape') setActiveTravelerProfile(null)
    }
    globalThis.addEventListener('keydown', onKey)
    return () => globalThis.removeEventListener('keydown', onKey)
  }, [activeTravelerProfile])

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
      </div>

      {/* Content */}
      <div style={PANEL_SURFACE_STYLE}>
        {activeTab === 'connections' && (
          <SocialConnectionsPanel 
            connections={connections} 
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
            myPlans={myPlans}
            selectedPlanId={selectedPlanId}
            setSelectedPlanId={setSelectedPlanId}
            discoverLoading={discoverLoading}
            discoverManualCooldownSec={discoverManualCooldownSec}
            discoverRefreshNotice={discoverRefreshNotice}
            aiMatches={aiMatches}
            matches={matches}
            handleSendRequest={handleSendRequest}
            onRefresh={handleManualDiscoverRefresh}
            onViewProfile={openTravelerProfile}
          />
        )}
      </div>

      {activeTravelerProfile && (
        <div className="social-profile-overlay-root">
          <button
            type="button"
            className="social-profile-backdrop"
            aria-label="Cerrar"
            onClick={() => setActiveTravelerProfile(null)}
          />
          <div
            className="social-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="social-profile-title"
          >
            <div className="social-profile-head">
              <h3 id="social-profile-title">
                {activeTravelerProfile.firstName} {activeTravelerProfile.lastName}
              </h3>
              <button type="button" className="btn-ghost" onClick={() => setActiveTravelerProfile(null)}>
                Cerrar
              </button>
            </div>
            <p className="social-profile-username">@{activeTravelerProfile.username}</p>
            <p className="social-profile-line">
              Compatibilidad: {Math.round(Math.min(1, Math.max(0, activeTravelerProfile.compatibilityScore || 0)) * 100)}%
            </p>
            {activeTravelerProfile.destinationLocation && (
              <p className="social-profile-line">Destino: {activeTravelerProfile.destinationLocation}</p>
            )}
            {Array.isArray(activeTravelerProfile.sharedDestinations) &&
              activeTravelerProfile.sharedDestinations.length > 0 && (
                <p className="social-profile-line">
                  Huella en común: {activeTravelerProfile.sharedDestinations.join(', ')}
                </p>
              )}
            {profileLoading ? (
              <p className="social-profile-line">Cargando perfil...</p>
            ) : (
              <>
                {activeTravelerProfile?.summary?.bio && (
                  <p className="social-profile-bio">{activeTravelerProfile.summary.bio}</p>
                )}
                {Array.isArray(activeTravelerProfile?.summary?.interests) &&
                activeTravelerProfile.summary.interests.length > 0 ? (
                  <p className="social-profile-line">
                    Intereses: {activeTravelerProfile.summary.interests.join(', ')}
                  </p>
                ) : null}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Social