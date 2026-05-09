import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { travelService } from '../../services/travelService'
import { socialService } from '../../services/socialService'
import { aiService } from '../../services/aiService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { extractErrorMessage } from '../../utils/errorUtils'
import {
  MapPin, Calendar, Users, DollarSign, ArrowLeft,
  Edit, Plus, Trash2, Globe, Clock,
  Activity, UserCheck, UserPlus, Sparkles,
} from 'lucide-react'
import './TravelDetails.css'
import QuickEditModal from '../../components/TravelPlan/QuickEditModal'
import { CatalogDestinationsPanel } from '../../components/Catalog/CatalogDestinationsPanel'
import {
  planDayStartDatetimeLocal,
  planDayEndDatetimeLocal,
} from '../../utils/planActivityDatetimeBounds'
import { mergeDiscoveryMatches, normalizeTravelerListResponse } from '../../utils/planTravelerMatches'

const statusConfig = {
  PLANNING:  { label: 'Planificando',  cls: 'badge-planning'  },
  ACTIVE:    { label: 'Activo',        cls: 'badge-active'    },
  COMPLETED: { label: 'Completado',    cls: 'badge-completed' },
  CANCELLED: { label: 'Cancelado',     cls: 'badge-cancelled' },
}

const STATUS_TRANSITIONS = {
  PLANNING:  ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

async function persistPlanActivity(planId, isEdit, activity, payload) {
  if (isEdit) {
    return travelService.updateActivity(planId, activity.id, payload)
  }
  return travelService.addActivity(planId, payload)
}

function getActivitySubmitLabel(loading, isEdit) {
  if (loading) return 'Saving…'
  if (isEdit) return 'Guardar cambios'
  return 'Agregar actividad'
}

/* ── Activity Modal ────────────────────────────────────────────────────────── */
const ActivityModal = ({ planId, plan = null, activity, prefill, onClose, onSaved }) => {
  const isEdit = Boolean(activity?.id)
  const defaultLocation =
    activity?.location ||
    prefill?.location ||
    (!isEdit && plan?.destinationLocation) ||
    ''

  const [form, setForm] = useState({
    name: activity?.name || prefill?.name || '',
    description: activity?.description || prefill?.description || '',
    location: defaultLocation,
    startTime:
      activity?.startTime
        ? String(activity.startTime).slice(0, 16)
        : prefill?.startTime || '',
    endTime:
      activity?.endTime
        ? String(activity.endTime).slice(0, 16)
        : prefill?.endTime || '',
  })

  useEffect(() => {
    if (isEdit || !prefill) return
    setForm((prev) => ({
      ...prev,
      name: prefill.name || prev.name,
      description: prefill.description || prev.description,
      location: prefill.location || prev.location,
      startTime: prefill.startTime || prev.startTime,
      endTime: prefill.endTime || prev.endTime,
    }))
  }, [prefill, isEdit])

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const planStartMin = plan?.startDate ? planDayStartDatetimeLocal(plan.startDate) : ''
  const planEndMax = plan?.endDate ? planDayEndDatetimeLocal(plan.endDate) : ''
  const hasPlanRange = Boolean(planStartMin && planEndMax)

  const endInputMin = form.startTime || planStartMin || undefined

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => {
      const next = { ...prev, [name]: value }
      if (name === 'startTime') {
        if (value && prev.endTime && prev.endTime < value) {
          next.endTime = value
        }
      }
      if (name === 'endTime' && prev.startTime && value && value < prev.startTime) {
        next.endTime = prev.startTime
      }
      return next
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) {
      setError('El nombre de la actividad es obligatorio')
      return
    }
    if (!form.startTime) {
      setError('La hora de inicio es obligatoria')
      return
    }
    if (!form.endTime) {
      setError('La hora de fin es obligatoria')
      return
    }
    const startMs = new Date(form.startTime).getTime()
    const endMs = new Date(form.endTime).getTime()
    if (Number.isNaN(startMs) || Number.isNaN(endMs)) {
      setError('Las fechas no son válidas')
      return
    }
    if (endMs < startMs) {
      setError('La hora de fin no puede ser anterior a la de inicio')
      return
    }
    if (hasPlanRange) {
      const rangeStart = new Date(planStartMin).getTime()
      const rangeEnd = new Date(planEndMax).getTime()
      if (startMs < rangeStart || startMs > rangeEnd) {
        setError('El inicio de la actividad debe estar dentro de las fechas del viaje')
        return
      }
      if (endMs < rangeStart || endMs > rangeEnd) {
        setError('El fin de la actividad debe estar dentro de las fechas del viaje')
        return
      }
    }
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        location: form.location?.trim() || undefined,
        startTime: form.startTime ? new Date(form.startTime).toISOString() : undefined,
        endTime: form.endTime ? new Date(form.endTime).toISOString() : undefined,
      }
      const result = await persistPlanActivity(planId, isEdit, activity, payload)
      onSaved(result, isEdit)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  const btnText = getActivitySubmitLabel(loading, isEdit)

  return (
    <div className="activity-modal-overlay">
      <button type="button" className="activity-modal-backdrop" onClick={onClose} aria-label="Cerrar" />
      <dialog open className="activity-modal-panel animate-scaleIn" aria-labelledby="activity-modal-title">
        <div className="activity-modal-body">
          <h3 id="activity-modal-title">{isEdit ? 'Editar actividad' : 'Agregar actividad'}</h3>
          {error && <ErrorBanner variant="error" message={error} onDismiss={() => setError('')} />}
          {hasPlanRange && (
            <p className="activity-modal-hint">
              Las actividades deben quedar entre el {formatDate(plan.startDate)} y el {formatDate(plan.endDate)}.
            </p>
          )}
          <form className="activity-modal-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="act-name">Nombre de actividad *</label>
              <input id="act-name" name="name" value={form.name} onChange={handleChange} placeholder="Visitar Torre Eiffel" />
            </div>
            <div className="form-row-2 activity-modal-datetime-row">
              <div className="form-group">
                <label htmlFor="act-start">Hora inicio *</label>
                <input
                  id="act-start"
                  name="startTime"
                  type="datetime-local"
                  value={form.startTime}
                  onChange={handleChange}
                  min={planStartMin || undefined}
                  max={planEndMax || undefined}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="act-end">Hora fin *</label>
                <input
                  id="act-end"
                  name="endTime"
                  type="datetime-local"
                  value={form.endTime}
                  onChange={handleChange}
                  min={endInputMin}
                  max={planEndMax || undefined}
                  required
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="act-location">Ubicación</label>
              <input
                id="act-location"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder={plan?.destinationLocation || 'Ciudad o lugar'}
              />
            </div>
            <div className="form-group">
              <label htmlFor="act-description">Descripción</label>
              <textarea
                id="act-description"
                name="description"
                className="activity-modal-textarea"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Descripción breve…"
              />
            </div>
            <div className="activity-modal-actions">
              <button type="button" className="btn-ghost" onClick={onClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-primary" disabled={loading}>
                {btnText}
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  )
}

ActivityModal.propTypes = {
  planId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  plan: PropTypes.shape({
    startDate: PropTypes.string,
    endDate: PropTypes.string,
    destinationLocation: PropTypes.string,
  }),
  activity: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    type: PropTypes.string,
    location: PropTypes.string,
    startTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    endTime: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    estimatedCost: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    notes: PropTypes.string,
  }),
  prefill: PropTypes.shape({
    name: PropTypes.string,
    description: PropTypes.string,
    location: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
  }),
  onClose: PropTypes.func.isRequired,
  onSaved: PropTypes.func.isRequired,
}

const ActivityList = ({ activities, onEdit, onDelete }) => {
  if (activities.length === 0) {
    return (
      <div className="activities-empty">
        <Activity size={28} />
        <p>Aun no hay actividades — haz clic en Agregar para planear tus dias.</p>
      </div>
    )
  }
  return (
    <div className="activities-list">
      {activities.map((act) => (
        <div key={act.id} className="activity-item">
          <div className="activity-item-left">
            <div className="activity-icon"><Activity size={15} /></div>
            <div>
              <h4>{act.name}</h4>
              {act.type && <span className="activity-type">{act.type}</span>}
              {act.location && (
                <div className="meta-row" style={{ marginTop: '0.25rem' }}>
                  <MapPin size={12} /><span>{act.location}</span>
                </div>
              )}
              {act.description && <p className="activity-desc">{act.description}</p>}
            </div>
          </div>
          <div className="activity-item-right">
            {act.estimatedCost != null && (
              <span className="activity-cost">${Number(act.estimatedCost).toLocaleString()}</span>
            )}
            <div style={{ display: 'flex', gap: '0.25rem' }}>
              <button className="icon-btn" onClick={() => onEdit(act)} title="Editar">
                <Edit size={14} />
              </button>
              <button className="icon-btn danger" onClick={() => onDelete(act.id)} title="Eliminar">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

ActivityList.propTypes = {
  activities: PropTypes.array.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
}

const CompatibleTravelersList = ({ loading, travelers, onConnect, connectingId }) => {
  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {['first', 'second', 'third'].map((item) => (
          <div key={item} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40 }} />
            <div style={{ flex: 1 }}>
              <SkeletonLoader variant="text" width="60%" />
              <SkeletonLoader variant="text" width="40%" />
            </div>
          </div>
        ))}
      </div>
    )
  }
  
  if (travelers.length === 0) {
    return (
      <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
        {'Haz clic en “Buscar” para cargar viajeros compatibles (planes solapados + sugerencias IA).'}
      </p>
    )
  }

  return (
    <div className="compat-list">
      {travelers.map((t) => {
        const uid = t.userId ?? t.user_id ?? t.id
        const shared = t.sharedDestinations?.length ? t.sharedDestinations : t.shared_destinations
        return (
          <div key={uid ?? t.username ?? `${t.firstName}-${t.lastName}`} className="compat-item compat-item--row">
            <div className="compat-item-main">
              <div className="compat-avatar">
                {(t.firstName || t.username || '?')[0].toUpperCase()}
              </div>
              <div className="compat-item-text">
                <h4>{t.firstName} {t.lastName}</h4>
                <p>@{t.username}</p>
                {Array.isArray(shared) && shared.length > 0 && (
                  <p className="compat-footprint">Huella en común: {shared.join(', ')}</p>
                )}
                {(t.source === 'ai' || t.source === 'both') && (
                  <span className="compat-ia-badge"><Sparkles size={11} /> IA</span>
                )}
              </div>
            </div>
            <div className="compat-item-actions">
              {t.compatibilityScore != null && (
                <span className="compat-score">{Math.round(Math.min(1, Math.max(0, t.compatibilityScore)) * 100)}%</span>
              )}
              <button
                type="button"
                className="btn-outline-sm"
                disabled={!uid || connectingId === uid}
                onClick={() => onConnect(uid)}
              >
                <UserPlus size={14} /> {connectingId === uid ? 'Enviando…' : 'Conectar'}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}

CompatibleTravelersList.propTypes = {
  loading: PropTypes.bool.isRequired,
  travelers: PropTypes.array.isRequired,
  onConnect: PropTypes.func.isRequired,
  connectingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

function catalogDefaultTimes(plan) {
  const day = plan?.startDate
    ? String(plan.startDate).slice(0, 10)
    : new Date().toISOString().slice(0, 10)
  return {
    startTime: `${day}T10:00`,
    endTime: `${day}T13:00`,
  }
}

function TravelDetailsBreadcrumb({ navigate }) {
  return (
    <div className="breadcrumb">
      <button type="button" className="btn-back" onClick={() => navigate('/my-travels')}>
        <ArrowLeft size={16} /> Mis viajes
      </button>
    </div>
  )
}

TravelDetailsBreadcrumb.propTypes = {
  navigate: PropTypes.func.isRequired,
}

function TravelDetailsTopSection({ plan, id, sc, transitions, statusLoading, handleStatusChange, onQuickEdit }) {
  return (
    <div className="details-header">
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`badge ${sc.cls}`}>{sc.label}</span>
          {transitions.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {transitions.map((st) => (
                <button
                  key={st}
                  type="button"
                  className="btn-status"
                  onClick={() => handleStatusChange(st)}
                  disabled={statusLoading}
                >
                  {statusLoading ? '…' : `Marcar ${st.charAt(0) + st.slice(1).toLowerCase()}`}
                </button>
              ))}
            </div>
          )}
        </div>
        <h1 style={{ marginBottom: '0.5rem' }}>{plan.title}</h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
          ID del plan: <strong>{id}</strong>
        </p>
        {plan.description && <p>{plan.description}</p>}
      </div>
      <div style={{ display: 'flex', gap: '0.75rem' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={onQuickEdit}
          title="Editar detalles rápidos"
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
        >
          <Edit size={16} /> Editar plan
        </button>
      </div>
    </div>
  )
}

TravelDetailsTopSection.propTypes = {
  plan: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  sc: PropTypes.object.isRequired,
  transitions: PropTypes.arrayOf(PropTypes.string).isRequired,
  statusLoading: PropTypes.bool.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  onQuickEdit: PropTypes.func.isRequired,
}

function PlanInfoCards({ plan }) {
  const cards = [
    plan.destinationLocation && { icon: MapPin, label: 'Destino', value: plan.destinationLocation },
    plan.originLocation && { icon: Globe, label: 'Origen', value: plan.originLocation },
    { icon: Calendar, label: 'Fechas', value: `${formatDate(plan.startDate)} – ${formatDate(plan.endDate)}` },
    plan.numberOfTravelers && { icon: Users, label: 'Viajeros', value: `${plan.numberOfTravelers} viajero${plan.numberOfTravelers > 1 ? 's' : ''}` },
    plan.estimatedBudget && { icon: DollarSign, label: 'Presupuesto', value: `$${Number(plan.estimatedBudget).toLocaleString()}` },
    plan.createdAt && { icon: Clock, label: 'Creado', value: formatDate(plan.createdAt) },
  ].filter(Boolean)

  return (
    <div className="info-cards">
      {cards.map(({ icon: Icon, label, value }) => (
        <div key={label} className="info-card">
          <div className="info-card-icon"><Icon size={16} /></div>
          <div>
            <span className="info-card-label">{label}</span>
            <span className="info-card-value">{value}</span>
          </div>
        </div>
      ))}
    </div>
  )
}

PlanInfoCards.propTypes = {
  plan: PropTypes.object.isRequired,
}

function TravelDetailsView({
  plan,
  id,
  navigate,
  error,
  setError,
  activeModal,
  setActiveModal,
  activityPrefill,
  setActivityPrefill,
  statusLoading,
  handleStatusChange,
  handleActivitySaved,
  handleDeleteActivity,
  compatTravelers,
  compatLoading,
  compatNotice,
  loadCompatibleTravelers,
  compatConnectingId,
  onConnectTraveler,
  onQuickEdit,
  onPickCatalogActivity,
}) {
  const sc = statusConfig[plan.status] || { label: plan.status, cls: 'badge-planning' }
  const transitions = STATUS_TRANSITIONS[plan.status] || []
  const activities = plan.activities || []

  return (
    <div className="travel-details-page page-container">
      <TravelDetailsBreadcrumb navigate={navigate} />
      <TravelDetailsTopSection
        plan={plan}
        id={id}
        sc={sc}
        transitions={transitions}
        statusLoading={statusLoading}
        handleStatusChange={handleStatusChange}
        onQuickEdit={onQuickEdit}
      />

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      <div className="details-grid">
        <div>
          <PlanInfoCards plan={plan} />

          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Activity size={18} />
                <h2>Actividades ({activities.length})</h2>
              </div>
              <button
                type="button"
                id="add-activity-btn"
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                onClick={() => {
                  setActivityPrefill(null)
                  setActiveModal('add')
                }}
              >
                <Plus size={15} /> Agregar
              </button>
            </div>
            <ActivityList
              activities={activities}
              onEdit={(act) => setActiveModal(act)}
              onDelete={handleDeleteActivity}
            />
          </div>

          <CatalogDestinationsPanel plan={plan} onPickCatalogActivity={onPickCatalogActivity} />
        </div>

        <div>
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <UserCheck size={18} />
                <h2>Viajeros compatibles</h2>
              </div>
              <div className="travel-details-compat-actions">
                {compatTravelers.length === 0 ? (
                  <button type="button" className="btn-outline-sm" onClick={loadCompatibleTravelers} disabled={compatLoading}>
                    {compatLoading ? 'Cargando…' : 'Buscar'}
                  </button>
                ) : (
                  <button type="button" className="btn-outline-sm" onClick={loadCompatibleTravelers} disabled={compatLoading}>
                    {compatLoading ? 'Cargando…' : 'Actualizar'}
                  </button>
                )}
                <Link to="/social" state={{ focusPlanId: id }} className="btn-outline-sm travel-details-social-link">
                  Red de viajeros
                </Link>
              </div>
            </div>
            {compatNotice && (
              <output className="travel-details-compat-notice" aria-live="polite">{compatNotice}</output>
            )}
            <CompatibleTravelersList
              loading={compatLoading}
              travelers={compatTravelers}
              onConnect={onConnectTraveler}
              connectingId={compatConnectingId}
            />
          </div>
        </div>
      </div>

      {activeModal ? (
        <ActivityModal
          planId={id}
          plan={plan}
          activity={activeModal === 'add' ? null : activeModal}
          prefill={activeModal === 'add' ? activityPrefill : null}
          onClose={() => {
            setActiveModal(null)
            setActivityPrefill(null)
          }}
          onSaved={handleActivitySaved}
        />
      ) : null}
    </div>
  )
}

TravelDetailsView.propTypes = {
  plan: PropTypes.object.isRequired,
  id: PropTypes.string.isRequired,
  navigate: PropTypes.func.isRequired,
  error: PropTypes.string,
  setError: PropTypes.func.isRequired,
  activeModal: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  setActiveModal: PropTypes.func.isRequired,
  activityPrefill: PropTypes.object,
  setActivityPrefill: PropTypes.func.isRequired,
  statusLoading: PropTypes.bool.isRequired,
  handleStatusChange: PropTypes.func.isRequired,
  handleActivitySaved: PropTypes.func.isRequired,
  handleDeleteActivity: PropTypes.func.isRequired,
  compatTravelers: PropTypes.array.isRequired,
  compatLoading: PropTypes.bool.isRequired,
  compatNotice: PropTypes.string,
  loadCompatibleTravelers: PropTypes.func.isRequired,
  compatConnectingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  onConnectTraveler: PropTypes.func.isRequired,
  onQuickEdit: PropTypes.func.isRequired,
  onPickCatalogActivity: PropTypes.func.isRequired,
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
const TravelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // null | 'add' | activityObj | 'quick-edit'
  const [statusLoading, setStatusLoading] = useState(false)
  const [compatTravelers, setCompatTravelers] = useState([])
  const [compatLoading, setCompatLoading] = useState(false)
  const [compatNotice, setCompatNotice] = useState(null)
  const [compatConnectingId, setCompatConnectingId] = useState(null)
  const [showQuickEdit, setShowQuickEdit] = useState(false)
  const [activityPrefill, setActivityPrefill] = useState(null)

  const fetchPlan = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await travelService.getById(id)
      setPlan(data)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchPlan() }, [fetchPlan])

  const handleStatusChange = async (newStatus) => {
    setStatusLoading(true)
    try {
      const updated = await travelService.updateStatus(id, newStatus)
      setPlan(updated)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setStatusLoading(false)
    }
  }

  const handleActivitySaved = (saved, isEdit) => {
    setPlan((prev) => {
      if (!prev) return prev
      const acts = prev.activities || []
      const updated = isEdit
        ? acts.map((a) => (String(a.id) === String(saved.id) ? saved : a))
        : [...acts, saved]
      return { ...prev, activities: updated }
    })
    setActiveModal(null)
  }

  const handleDeleteActivity = async (actId) => {
    if (globalThis.confirm('¿Eliminar esta actividad?') === false) return
    try {
      await travelService.deleteActivity(id, actId)
      setPlan((prev) => ({
        ...prev,
        activities: (prev.activities || []).filter((a) => String(a.id) !== String(actId)),
      }))
    } catch (err) {
      setError(extractErrorMessage(err))
    }
  }

  const handleQuickEditUpdate = (updatedData) => {
    setPlan(prev => ({ ...prev, ...updatedData }))
  }

  const handlePickCatalogActivity = (act) => {
    if (!plan) return
    setActivityPrefill({
      name: act.name,
      description: act.description || '',
      location: plan.destinationLocation || '',
      ...catalogDefaultTimes(plan),
    })
    setActiveModal('add')
  }

  const loadCompatibleTravelers = useCallback(async () => {
    if (!plan) return
    setCompatLoading(true)
    setCompatNotice(null)
    try {
      const raw = await travelService.getCompatibleTravelers(id)
      const baseList = normalizeTravelerListResponse(raw)
      const dest = plan.destinationLocation || plan.destination_location || ''
      const footprint = dest ? [String(dest).trim()] : []

      let buddies = {}
      if (user?.id) {
        try {
          buddies = await aiService.getBuddyRecommendations(String(user.id), {
            location: dest || null,
            seekerFootprint: footprint.length ? footprint : null,
            limit: 12,
          })
        } catch {
          buddies = {}
        }
      }

      const merged = mergeDiscoveryMatches(baseList, buddies, dest, user?.id)

      const enriched = await Promise.all(
        merged.map(async (traveler) => {
          const travelerId = traveler?.userId ?? traveler?.user_id ?? traveler?.id
          if (travelerId == null) return traveler
          try {
            const summary = await socialService.getTravelerSummary(travelerId)
            return { ...summary, ...traveler }
          } catch {
            return traveler
          }
        })
      )
      setCompatTravelers(enriched)
      if (enriched.length === 0) {
        setCompatNotice('No hay coincidencias para este plan. Puedes ampliar en Red de viajeros (Descubrir).')
      }
    } catch (e) {
      setCompatTravelers([])
      setCompatNotice(extractErrorMessage(e) || 'No se pudieron obtener viajeros compatibles.')
    } finally {
      setCompatLoading(false)
    }
  }, [id, plan, user?.id])

  const handleCompatConnect = useCallback(async (recipientId) => {
    setCompatConnectingId(recipientId)
    try {
      await socialService.sendConnectionRequest({
        recipientId,
        message: '¡Hola! Vi que tenemos planes compatibles.',
      })
      globalThis.alert('Solicitud de conexión enviada.')
      setCompatTravelers((prev) =>
        prev.filter((t) => String(t.userId ?? t.user_id ?? t.id) !== String(recipientId))
      )
    } catch (e) {
      setCompatNotice(extractErrorMessage(e) || 'No se pudo enviar la solicitud.')
    } finally {
      setCompatConnectingId(null)
    }
  }, [])

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SkeletonLoader variant="title" width="50%" />
          <div className="details-grid">
            <div>
              <SkeletonLoader variant="card" />
              <div style={{ marginTop: '1rem' }}>
                {['first', 'second', 'third'].map((item) => <SkeletonLoader key={item} variant="text" />)}
              </div>
            </div>
            <SkeletonLoader variant="card" />
          </div>
        </div>
      </div>
    )
  }

  if (error && !plan) {
    return (
      <div className="page-container">
        <ErrorBanner variant="error" message={error} />
        <button className="btn-ghost" onClick={() => navigate(-1)} style={{ marginTop: '1rem' }}>
          <ArrowLeft size={16} /> Volver
        </button>
      </div>
    )
  }

  if (!plan) return null

  return (
    <>
      <TravelDetailsView
        plan={plan}
        id={id}
        navigate={navigate}
        error={error}
        setError={setError}
        activeModal={activeModal}
        setActiveModal={setActiveModal}
        activityPrefill={activityPrefill}
        setActivityPrefill={setActivityPrefill}
        statusLoading={statusLoading}
        handleStatusChange={handleStatusChange}
        handleActivitySaved={handleActivitySaved}
        handleDeleteActivity={handleDeleteActivity}
        compatTravelers={compatTravelers}
        compatLoading={compatLoading}
        compatNotice={compatNotice}
        loadCompatibleTravelers={loadCompatibleTravelers}
        compatConnectingId={compatConnectingId}
        onConnectTraveler={handleCompatConnect}
        onQuickEdit={() => setShowQuickEdit(true)}
        onPickCatalogActivity={handlePickCatalogActivity}
      />
      <QuickEditModal
        isOpen={showQuickEdit}
        onClose={() => setShowQuickEdit(false)}
        planId={id}
        currentData={plan}
        onUpdate={handleQuickEditUpdate}
      />
    </>
  )
}

export default TravelDetails
