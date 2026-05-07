import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { TravelCardSkeleton } from '../../components/UI/SkeletonLoader'
import ErrorBanner from '../../components/UI/ErrorBanner'
import {
  Plane, MapPin, Calendar, Users, DollarSign,
  Plus, Clock, Trash2, ArrowRight, Filter
} from 'lucide-react'
import './MyTravels.css'

const STATUS_FILTERS = ['ALL', 'PLANNING', 'ACTIVE', 'COMPLETED', 'CANCELLED']

const statusConfig = {
  PLANNING: { label: 'Planificando', cls: 'badge-planning' },
  ACTIVE:   { label: 'Activo',       cls: 'badge-active' },
  COMPLETED:{ label: 'Completado',   cls: 'badge-completed' },
  CANCELLED:{ label: 'Cancelado',    cls: 'badge-cancelled' },
}

const MyTravels = () => {
  const navigate = useNavigate()
  const { plans, loading, error, remove, clearError } = useTravelPlans(true)
  const [activeFilter, setActiveFilter] = useState('ALL')
  const [deletingId, setDeletingId] = useState(null)
  const [confirmDelete, setConfirmDelete] = useState(null)

  const filtered = activeFilter === 'ALL'
    ? plans
    : plans.filter((p) => p.status === activeFilter)

  const formatDate = (d) => {
    if (!d) return '—'
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const handleDelete = async (id) => {
    setDeletingId(id)
    try {
      await remove(id)
    } finally {
      setDeletingId(null)
      setConfirmDelete(null)
    }
  }

  let emptyStateContent
  if (plans.length === 0) {
    emptyStateContent = (
      <>
        <div className="empty-state-icon">
          <Plane size={32} />
        </div>
        <h3>Aun no tienes planes de viaje</h3>
        <p>Comienza a planear tu primera aventura y deja que la IA te guie al destino ideal.</p>
        <Link to="/travel-plans/create" className="btn-primary" style={{ display: 'inline-flex' }}>
          <Plus size={16} /> Crear mi primer plan
        </Link>
      </>
    )
  } else {
    emptyStateContent = (
      <>
        <div className="empty-state-icon">
          <Filter size={28} />
        </div>
        <h3>No hay planes {activeFilter.toLowerCase()}</h3>
        <p>Prueba seleccionando un filtro diferente.</p>
        <button className="btn-primary" onClick={() => setActiveFilter('ALL')} style={{ display: 'inline-flex' }}>
          Ver todos los planes
        </button>
      </>
    )
  }

  let content
  if (loading) {
    content = (
      <div className="travels-grid">
        {['one', 'two', 'three', 'four', 'five', 'six'].map((item) => <TravelCardSkeleton key={item} />)}
      </div>
    )
  } else if (filtered.length === 0) {
    content = (
      <div className="empty-state">
        {emptyStateContent}
      </div>
    )
  } else {
    content = (
      <div className="travels-grid">
        {filtered.map((plan) => {
          const sc = statusConfig[plan.status] || { label: plan.status, cls: 'badge-planning' }
          return (
            <div key={plan.id} className="travel-card animate-fadeIn">
              {/* Card gradient header */}
              <div className="travel-card-header">
                <span className={`badge ${sc.cls}`}>{sc.label}</span>
                <button
                  className="delete-btn"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(plan.id) }}
                  title="Eliminar plan"
                  aria-label="Eliminar plan"
                >
                  <Trash2 size={15} />
                </button>
                <h3 className="travel-card-title">{plan.title}</h3>
              </div>

              {/* Body */}
              <div className="travel-card-body">
                {plan.description && (
                  <p className="travel-description">{plan.description}</p>
                )}

                <div className="travel-meta">
                  {plan.destinationLocation && (
                    <div className="meta-row">
                      <MapPin size={14} />
                      <span>{plan.destinationLocation}</span>
                    </div>
                  )}
                  <div className="meta-row">
                    <Calendar size={14} />
                    <span>{formatDate(plan.startDate)} → {formatDate(plan.endDate)}</span>
                  </div>
                  <div className="meta-row-row">
                    {plan.numberOfTravelers && (
                      <div className="meta-row">
                        <Users size={14} />
                        <span>{plan.numberOfTravelers} viajero{plan.numberOfTravelers > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {plan.estimatedBudget && (
                      <div className="meta-row">
                        <DollarSign size={14} />
                        <span>${Number(plan.estimatedBudget).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="travel-card-footer">
                  <div className="meta-row" style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    <Clock size={12} />
                    <span>{formatDate(plan.createdAt)}</span>
                  </div>
                  <button
                    className="btn-view-details"
                    onClick={() => navigate(`/travel-plans/${plan.id}`)}
                  >
                    Detalles <ArrowRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  return (
    <div className="my-travels-page page-container">
      {/* Header */}
      <div className="page-header">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1>Mis Viajes</h1>
            <p>Administra y da seguimiento a todos tus planes de viaje</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/travel-plans/create')}>
            <Plus size={18} /> Nuevo plan
          </button>
        </div>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={clearError} />

      {/* Filter tabs */}
      {!loading && plans.length > 0 && (
        <div className="filter-bar">
          <Filter size={15} className="text-muted" />
          {STATUS_FILTERS.map((f) => (
            <button
              key={f}
              className={`filter-tab ${activeFilter === f ? 'active' : ''}`}
              onClick={() => setActiveFilter(f)}
            >
              {f === 'ALL' ? `Todos (${plans.length})` : (statusConfig[f]?.label || f)}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {content}

      {confirmDelete && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <button type="button" onClick={() => setConfirmDelete(null)} aria-label="Close modal" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', background: 'transparent', border: 'none', cursor: 'default' }} />
          <dialog open className="modal-box animate-scaleIn" style={{ maxWidth: 500, position: 'relative', zIndex: 1, margin: 0 }}>
            <h3>¿Eliminar plan de viaje?</h3>
            <p>Esta accion no se puede deshacer. El plan y todas sus actividades se eliminaran permanentemente.</p>
            <div className="modal-actions">
              <button className="btn-ghost" onClick={() => setConfirmDelete(null)}>Cancelar</button>
              <button
                className="btn-danger"
                onClick={() => handleDelete(confirmDelete)}
                disabled={deletingId === confirmDelete}
              >
                {deletingId === confirmDelete ? 'Eliminando…' : 'Eliminar plan'}
              </button>
            </div>
          </dialog>
        </div>
      )}
    </div>
  )
}

export default MyTravels
