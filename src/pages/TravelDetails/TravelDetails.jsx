import React, { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { travelService } from '../../services/travelService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { extractErrorMessage } from '../../utils/errorUtils'
import {
  MapPin, Calendar, Users, DollarSign, ArrowLeft,
  Edit, Plus, Trash2, CheckCircle, Globe, Clock,
  Activity, UserCheck
} from 'lucide-react'
import './TravelDetails.css'

const statusConfig = {
  PLANNING:  { label: 'Planning',  cls: 'badge-planning'  },
  ACTIVE:    { label: 'Active',    cls: 'badge-active'    },
  COMPLETED: { label: 'Completed', cls: 'badge-completed' },
  CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled' },
}

const STATUS_TRANSITIONS = {
  PLANNING:  ['ACTIVE', 'CANCELLED'],
  ACTIVE:    ['COMPLETED', 'CANCELLED'],
  COMPLETED: [],
  CANCELLED: [],
}

const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : '—'

/* ── Activity Modal ────────────────────────────────────────────────────────── */
const ActivityModal = ({ planId, activity, onClose, onSaved }) => {
  const isEdit = Boolean(activity)
  const [form, setForm] = useState({
    name: activity?.name || '',
    description: activity?.description || '',
    type: activity?.type || '',
    location: activity?.location || '',
    estimatedCost: activity?.estimatedCost ?? '',
    notes: activity?.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) { setError('Activity name is required'); return }
    setLoading(true)
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || undefined,
        type: form.type?.trim() || undefined,
        location: form.location?.trim() || undefined,
        estimatedCost: form.estimatedCost !== '' ? Number(form.estimatedCost) : undefined,
        notes: form.notes?.trim() || undefined,
      }
      let result
      if (isEdit) {
        result = await travelService.updateActivity(planId, activity.id, payload)
      } else {
        result = await travelService.addActivity(planId, payload)
      }
      onSaved(result, isEdit)
    } catch (err) {
      setError(extractErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box animate-scaleIn" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 500 }}>
        <h3>{isEdit ? 'Edit Activity' : 'Add Activity'}</h3>
        {error && <ErrorBanner variant="error" message={error} onDismiss={() => setError('')} />}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
          <div className="form-group">
            <label htmlFor="act-name">Activity Name *</label>
            <input id="act-name" name="name" value={form.name} onChange={handleChange} placeholder="Visit Eiffel Tower" />
          </div>
          <div className="form-row-2">
            <div className="form-group">
              <label htmlFor="act-type">Type</label>
              <input id="act-type" name="type" value={form.type} onChange={handleChange} placeholder="Sightseeing, Food, …" />
            </div>
            <div className="form-group">
              <label htmlFor="act-cost">Est. Cost ($)</label>
              <input id="act-cost" name="estimatedCost" type="number" min="0" value={form.estimatedCost} onChange={handleChange} placeholder="0.00" />
            </div>
          </div>
          <div className="form-group">
            <label htmlFor="act-location">Location</label>
            <input id="act-location" name="location" value={form.location} onChange={handleChange} placeholder="Paris, France" />
          </div>
          <div className="form-group">
            <label htmlFor="act-description">Description</label>
            <textarea id="act-description" name="description" value={form.description} onChange={handleChange} rows={2} placeholder="Brief description…" />
          </div>
          <div className="form-group">
            <label htmlFor="act-notes">Notes</label>
            <textarea id="act-notes" name="notes" value={form.notes} onChange={handleChange} rows={2} placeholder="Reminders, booking references…" />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn-ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Saving…' : isEdit ? 'Save Changes' : 'Add Activity'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ── Main Page ─────────────────────────────────────────────────────────────── */
const TravelDetails = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [plan, setPlan] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeModal, setActiveModal] = useState(null) // null | 'add' | activityObj
  const [statusLoading, setStatusLoading] = useState(false)
  const [compatTravelers, setCompatTravelers] = useState([])
  const [compatLoading, setCompatLoading] = useState(false)

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
    if (!window.confirm('Delete this activity?')) return
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

  const loadCompatibleTravelers = async () => {
    setCompatLoading(true)
    try {
      const result = await travelService.getCompatibleTravelers(id)
      setCompatTravelers(Array.isArray(result) ? result : [])
    } catch {
      setCompatTravelers([])
    } finally {
      setCompatLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <SkeletonLoader variant="title" width="50%" />
          <div className="details-grid">
            <div>
              <SkeletonLoader variant="card" />
              <div style={{ marginTop: '1rem' }}>
                {[...Array(3)].map((_, i) => <SkeletonLoader key={i} variant="text" />)}
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
          <ArrowLeft size={16} /> Go Back
        </button>
      </div>
    )
  }

  if (!plan) return null

  const sc = statusConfig[plan.status] || { label: plan.status, cls: 'badge-planning' }
  const transitions = STATUS_TRANSITIONS[plan.status] || []
  const activities = plan.activities || []

  return (
    <div className="travel-details-page page-container">
      {/* Breadcrumb */}
      <div className="breadcrumb">
        <button className="btn-back" onClick={() => navigate('/my-travels')}>
          <ArrowLeft size={16} /> My Travels
        </button>
      </div>

      {/* Plan header */}
      <div className="details-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
            <span className={`badge ${sc.cls}`}>{sc.label}</span>
            {transitions.length > 0 && (
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {transitions.map((st) => (
                  <button
                    key={st}
                    className="btn-status"
                    onClick={() => handleStatusChange(st)}
                    disabled={statusLoading}
                  >
                    {statusLoading ? '…' : `Mark ${st.charAt(0) + st.slice(1).toLowerCase()}`}
                  </button>
                ))}
              </div>
            )}
          </div>
          <h1 style={{ marginBottom: '0.5rem' }}>{plan.title}</h1>
          {plan.description && <p>{plan.description}</p>}
        </div>
        <button
          className="btn-primary"
          onClick={() => navigate(`/travel-plans/${id}/edit`)}
        >
          <Edit size={16} /> Edit Plan
        </button>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={() => setError(null)} />

      <div className="details-grid">
        {/* Main column */}
        <div>
          {/* Info cards */}
          <div className="info-cards">
            {[
              plan.destinationLocation && { icon: MapPin, label: 'Destination', value: plan.destinationLocation },
              plan.originLocation && { icon: Globe, label: 'Origin', value: plan.originLocation },
              { icon: Calendar, label: 'Dates', value: `${formatDate(plan.startDate)} – ${formatDate(plan.endDate)}` },
              plan.numberOfTravelers && { icon: Users, label: 'Travelers', value: `${plan.numberOfTravelers} traveler${plan.numberOfTravelers > 1 ? 's' : ''}` },
              plan.estimatedBudget && { icon: DollarSign, label: 'Budget', value: `$${Number(plan.estimatedBudget).toLocaleString()}` },
              plan.createdAt && { icon: Clock, label: 'Created', value: formatDate(plan.createdAt) },
            ].filter(Boolean).map(({ icon: Icon, label, value }) => (
              <div key={label} className="info-card">
                <div className="info-card-icon"><Icon size={16} /></div>
                <div>
                  <span className="info-card-label">{label}</span>
                  <span className="info-card-value">{value}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Activities */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <Activity size={18} />
                <h2>Activities ({activities.length})</h2>
              </div>
              <button
                id="add-activity-btn"
                className="btn-primary"
                style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
                onClick={() => setActiveModal('add')}
              >
                <Plus size={15} /> Add
              </button>
            </div>
            {activities.length === 0 ? (
              <div className="activities-empty">
                <Activity size={28} />
                <p>No activities yet — click Add to plan your days!</p>
              </div>
            ) : (
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
                        <button className="icon-btn" onClick={() => setActiveModal(act)} title="Edit">
                          <Edit size={14} />
                        </button>
                        <button className="icon-btn danger" onClick={() => handleDeleteActivity(act.id)} title="Delete">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          {/* Compatible travelers */}
          <div className="section-card">
            <div className="section-card-header">
              <div className="flex items-center gap-2">
                <UserCheck size={18} />
                <h2>Compatible Travelers</h2>
              </div>
              {compatTravelers.length === 0 && (
                <button className="btn-outline-sm" onClick={loadCompatibleTravelers} disabled={compatLoading}>
                  {compatLoading ? 'Loading…' : 'Find'}
                </button>
              )}
            </div>
            {compatLoading ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                {[...Array(3)].map((_, i) => (
                  <div key={i} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <div className="skeleton skeleton-avatar" style={{ width: 40, height: 40 }} />
                    <div style={{ flex: 1 }}>
                      <SkeletonLoader variant="text" width="60%" />
                      <SkeletonLoader variant="text" width="40%" />
                    </div>
                  </div>
                ))}
              </div>
            ) : compatTravelers.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', textAlign: 'center', padding: '1rem 0' }}>
                Click "Find" to discover travelers with similar plans
              </p>
            ) : (
              <div className="compat-list">
                {compatTravelers.map((t, i) => (
                  <div key={t.id || i} className="compat-item">
                    <div className="compat-avatar">
                      {(t.firstName || t.username || '?')[0].toUpperCase()}
                    </div>
                    <div>
                      <h4>{t.firstName} {t.lastName}</h4>
                      <p>@{t.username}</p>
                    </div>
                    {t.compatibilityScore != null && (
                      <span className="compat-score">{Math.round(t.compatibilityScore * 100)}%</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {activeModal && (
        <ActivityModal
          planId={id}
          activity={activeModal === 'add' ? null : activeModal}
          onClose={() => setActiveModal(null)}
          onSaved={handleActivitySaved}
        />
      )}
    </div>
  )
}

export default TravelDetails
