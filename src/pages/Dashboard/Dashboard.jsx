import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { aiService } from '../../services/aiService'
import { StatCardSkeleton, TravelCardSkeleton } from '../../components/UI/SkeletonLoader'
import ErrorBanner from '../../components/UI/ErrorBanner'
import {
  MapPin, Calendar, TrendingUp, Users, Plane,
  Plus, Star, ArrowRight, Zap, Globe, Compass
} from 'lucide-react'
import './Dashboard.css'

const THREE_PLACEHOLDERS = [1, 2, 3]
const FOUR_PLACEHOLDERS = [1, 2, 3, 4]
const PRIMARY_BUTTON_CLASS = 'btn-primary'
const CREATE_PLAN_ROUTE = '/travel-plans/create'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plans, loading: plansLoading, error: plansError } = useTravelPlans(true)
  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [trendsDigest, setTrendsDigest] = useState([])
  const [seasonalityHighlights, setSeasonalityHighlights] = useState([])
  const [adaptiveModules, setAdaptiveModules] = useState([])

  const asArray = (value) => (Array.isArray(value) ? value : [])

  const pickFirstArray = (...candidates) => {
    for (const value of candidates) {
      if (Array.isArray(value)) return value
    }
    return []
  }

  useEffect(() => {
    aiService.getTrendingActivities(null, 3)
      .then((res) => setTrending(res?.activities || []))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    aiService.getWeeklyTrendsDigest()
      .then((res) => {
        setTrendsDigest(
          pickFirstArray(
            res?.microTrends,
            res?.trends,
            res?.items,
            res?.highlights
          ).slice(0, 3)
        )
      })
      .catch(() => setTrendsDigest([]))

    aiService.getSeasonalityOverview()
      .then((res) => {
        setSeasonalityHighlights(
          pickFirstArray(
            res?.destinations,
            res?.profiles,
            res?.seasonalityProfiles,
            res?.items
          ).slice(0, 3)
        )
      })
      .catch(() => setSeasonalityHighlights([]))

    aiService.getAdaptiveHomeFeed(user.id)
      .then((res) => {
        setAdaptiveModules(
          pickFirstArray(
            res?.sections,
            res?.modules,
            res?.cards,
            res?.items
          ).slice(0, 4)
        )
      })
      .catch(() => setAdaptiveModules([]))
  }, [user?.id])

  // Derive stats from real plans
  const stats = useMemo(() => {
    const total = plans.length
    const upcoming = plans.filter((p) => p.status === 'PLANNING' || p.status === 'ACTIVE').length
    const completed = plans.filter((p) => p.status === 'COMPLETED').length
    const destinations = new Set(plans.map((p) => p.destinationLocation).filter(Boolean)).size
    return [
      { label: 'Planes totales', value: total, icon: Plane, color: 'var(--voyager-blue)', bg: '#dbeafe' },
      { label: 'Proximos', value: upcoming, icon: Calendar, color: 'var(--color-success)', bg: '#d1fae5' },
      { label: 'Completados', value: completed, icon: Star, color: 'var(--accent-gold)', bg: '#fef3c7' },
      { label: 'Destinos', value: destinations, icon: Globe, color: 'var(--voyager-indigo)', bg: '#ede9fe' },
    ]
  }, [plans])

  const recentPlans = plans.slice(0, 3)
  const firstName = user?.firstName || user?.username || 'Viajero'
  const hasRecentPlans = recentPlans.length > 0

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Buenos dias'
    if (h < 18) return 'Buenas tardes'
    return 'Buenas noches'
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const statusConfig = {
    PLANNING: { label: 'Planning', cls: 'badge-planning' },
    ACTIVE: { label: 'Active', cls: 'badge-active' },
    COMPLETED: { label: 'Completed', cls: 'badge-completed' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled' },
  }

  let recentPlansContent
  if (plansLoading) {
    recentPlansContent = (
      <div className="plans-list">
        {THREE_PLACEHOLDERS.map((item) => <TravelCardSkeleton key={item} />)}
      </div>
    )
  } else if (hasRecentPlans) {
    recentPlansContent = (
      <div className="plans-list">
        {recentPlans.map((plan) => {
          const sc = statusConfig[plan.status] || { label: plan.status, cls: 'badge-planning' }
          return (
            <Link key={plan.id} to={`/travel-plans/${plan.id}`} className="plan-row">
              <div className="plan-row-icon">
                <MapPin size={18} />
              </div>
              <div className="plan-row-info">
                <h4>{plan.title}</h4>
                <p>{plan.destinationLocation} · {formatDate(plan.startDate)}</p>
              </div>
              <span className={`badge ${sc.cls}`}>{sc.label}</span>
              <ArrowRight size={16} className="plan-row-arrow" />
            </Link>
          )
        })}
      </div>
    )
  } else {
    recentPlansContent = (
      <div className="empty-state" style={{ padding: '3rem 1rem' }}>
        <div className="empty-state-icon" style={{ width: 64, height: 64 }}>
          <Plane size={28} />
        </div>
        <h3>Aun no tienes planes</h3>
        <p>Crea tu primer plan de viaje y comienza tu aventura.</p>
        <button className={PRIMARY_BUTTON_CLASS} onClick={() => navigate(CREATE_PLAN_ROUTE)}>
          <Plus size={16} /> Crear primer plan
        </button>
      </div>
    )
  }

  let trendingContent
  if (trendingLoading) {
    trendingContent = (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {THREE_PLACEHOLDERS.map((item) => (
          <div key={item} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--surface-card)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
            <div className="skeleton skeleton-text skeleton-line-medium" />
            <div className="skeleton skeleton-text skeleton-line-short" />
          </div>
        ))}
      </div>
    )
  } else if (trending.length === 0) {
    trendingContent = (
      <div className="trending-empty">
        <TrendingUp size={24} />
        <p>No hay datos de tendencias disponibles</p>
      </div>
    )
  } else {
    trendingContent = (
      <div className="trending-list">
        {trending.map((item, index) => (
          <div key={item.id ?? item.name ?? item.title ?? index} className="trending-card animate-fadeIn">
            <div className="trending-rank">#{index + 1}</div>
            <div className="trending-info">
              <h4>{item.name || item.title || 'Activity'}</h4>
              <p>{item.category || item.type || 'Viaje'}</p>
            </div>
            {item.rating && (
              <div className="trending-rating">
                <Star size={13} fill="var(--accent-gold)" color="var(--accent-gold)" />
                <span>{Number(item.rating).toFixed(1)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    )
  }

  const trendsDigestContent = trendsDigest.length > 0 && (
    <div className="section-card" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2>Resumen semanal de tendencias</h2>
      </div>
      <div className="trending-list">
        {asArray(trendsDigest).map((item, index) => (
          <div key={item.id ?? item.name ?? item.title ?? index} className="trending-card">
            <div className="trending-rank">#{index + 1}</div>
            <div className="trending-info">
              <h4>{item.title || item.name || item.destination || 'Tendencia'}</h4>
              <p>{item.summary || item.description || item.signal || 'Senal emergente de viaje'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const seasonalityContent = seasonalityHighlights.length > 0 && (
    <div className="section-card" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2>Panorama estacional</h2>
      </div>
      <div className="trending-list">
        {asArray(seasonalityHighlights).map((item, index) => (
          <div key={item.id ?? item.destinationId ?? item.destination ?? index} className="trending-card">
            <div className="trending-rank">#{index + 1}</div>
            <div className="trending-info">
              <h4>{item.destination || item.destinationId || item.name || 'Destino'}</h4>
              <p>{item.note || item.summary || item.label || 'Perfil estacional disponible'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  const adaptiveFeedContent = adaptiveModules.length > 0 && (
    <div className="section-card" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2>Feed adaptativo de inicio</h2>
      </div>
      <div className="trending-list">
        {asArray(adaptiveModules).map((item, index) => (
          <div key={item.id ?? item.key ?? item.title ?? index} className="trending-card">
            <div className="trending-rank">#{index + 1}</div>
            <div className="trending-info">
              <h4>{item.title || item.name || item.key || 'Modulo'}</h4>
              <p>{item.subtitle || item.description || item.reason || 'Modulo personalizado'}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <div className="dashboard-page page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{greeting()},</p>
          <h1 className="dashboard-name">{firstName} <span className="wave">👋</span></h1>
          <p className="dashboard-subtitle">Aqui tienes un resumen de tu actividad de viaje</p>
        </div>
        <button
          id="dashboard-new-plan-btn"
          className={PRIMARY_BUTTON_CLASS}
          onClick={() => navigate(CREATE_PLAN_ROUTE)}
        >
          <Plus size={18} />
          Nuevo plan
        </button>
      </div>

      <ErrorBanner variant="error" message={plansError} />

      {/* Stats */}
      <div className="dashboard-stats">
        {plansLoading
          ? FOUR_PLACEHOLDERS.map((item) => <StatCardSkeleton key={item} />)
          : stats.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="stat-card animate-fadeIn">
                  <div className="stat-icon" style={{ background: s.bg, color: s.color }}>
                    <Icon size={22} />
                  </div>
                  <div className="stat-body">
                    <span className="stat-value">{s.value}</span>
                    <span className="stat-label">{s.label}</span>
                  </div>
                </div>
              )
            })}
      </div>

      {/* Main content */}
      <div className="dashboard-grid">
        {/* Recent plans */}
        <div className="dashboard-main">
          <div className="section-header">
            <h2>Planes recientes</h2>
            <button className="btn-link" onClick={() => navigate('/my-travels')}>
              Ver todos <ArrowRight size={15} />
            </button>
          </div>

          {recentPlansContent}

          {/* Quick actions */}
          <div className="section-header" style={{ marginTop: '2rem' }}>
            <h2>Acciones rapidas</h2>
          </div>
          <div className="quick-actions">
            {[
              { label: 'Planear viaje', icon: Plane, action: () => navigate(CREATE_PLAN_ROUTE), primary: true },
              { label: 'Asistente IA', icon: Zap, action: () => navigate('/ai-assistant') },
              { label: 'Buscar viajeros', icon: Users, action: () => navigate('/social') },
              { label: 'Mi perfil', icon: Compass, action: () => navigate('/profile') },
            ].map(({ label, icon: Icon, action, primary }) => (
              <button
                key={label}
                className={primary ? 'quick-action-btn primary' : 'quick-action-btn'}
                onClick={action}
              >
                <Icon size={20} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="dashboard-sidebar">
          <div className="section-header">
            <h2>Tendencia actual</h2>
          </div>

          {trendingContent}
          {trendsDigestContent}
          {seasonalityContent}
          {adaptiveFeedContent}

          {/* AI CTA */}
          <Link className="ai-cta-card" to="/ai-assistant">
            <div className="ai-cta-icon">
              <Zap size={22} />
            </div>
            <div>
              <h4>Asistente IA de viajes</h4>
              <p>Obtén recomendaciones personalizadas</p>
            </div>
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
