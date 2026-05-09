import { useEffect, useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/use-auth.js'
import { useAdaptiveUI } from '../../contexts/adaptive-ui-provider.jsx'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { aiService } from '../../services/aiService'
import { StatCardSkeleton, TravelCardSkeleton } from '../../components/UI/SkeletonLoader'
import ErrorBanner from '../../components/UI/ErrorBanner'
import {
  MapPin, Calendar, TrendingUp, Users, Plane,
  Plus, Star, ArrowRight, Zap, Globe, Compass
} from 'lucide-react'
import './Dashboard.css'
import { destinationExplorePath } from '../../utils/destinationExploreNavigation'
import { normalizeDestinationSlugForSearch } from '../../utils/destinationGeoHints'

const THREE_PLACEHOLDERS = [1, 2, 3]
const FOUR_PLACEHOLDERS = [1, 2, 3, 4]
const PRIMARY_BUTTON_CLASS = 'btn-primary'
const CREATE_PLAN_ROUTE = '/travel-plans/create'

const PRIMARY_THEME_LABELS = {
  balanced: 'Equilibrado',
  adventure: 'Aventura',
  cultural: 'Cultura',
  foodie: 'Gastronomia',
  nature: 'Naturaleza',
  beach: 'Playa',
  relaxation: 'Relax',
}

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { feedLayout, loadError: adaptiveLoadError, clearLoadError } = useAdaptiveUI()
  const { plans, loading: plansLoading, error: plansError } = useTravelPlans(true)
  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)
  const [trendsApiError, setTrendsApiError] = useState(null)
  const [trendsDigest, setTrendsDigest] = useState([])
  const [digestApiError, setDigestApiError] = useState(null)
  const [seasonalityHighlights, setSeasonalityHighlights] = useState([])
  const [seasonalityApiError, setSeasonalityApiError] = useState(null)

  const asArray = (value) => (Array.isArray(value) ? value : [])

  const pickFirstArray = (...candidates) => {
    for (const value of candidates) {
      if (Array.isArray(value)) return value
    }
    return []
  }

  useEffect(() => {
    setTrendsApiError(null)
    aiService
      .getTrendsDashboard()
      .then((res) => {
        const emerging = asArray(res?.emergingDestinations)
        setTrending(
          emerging.slice(0, 3).map((d) => ({
            id: d.destinationId,
            name: d.name,
            country: d.country || '',
            category: d.country || (Array.isArray(d.tags) ? d.tags.slice(0, 2).join(' · ') : '') || 'Destino',
            rating: typeof d.surgeRatio === 'number' && d.surgeRatio > 0 ? Math.min(5, 3 + d.surgeRatio) : undefined,
          }))
        )
      })
      .catch((err) => {
        setTrendsApiError(err?.message || 'No se pudo cargar el panel de tendencias (servicio de IA).')
        setTrending([])
      })
      .finally(() => setTrendingLoading(false))
  }, [])

  useEffect(() => {
    if (!user?.id) return
    setDigestApiError(null)
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
      .catch((err) => {
        setDigestApiError(err?.message || 'Digest semanal no disponible.')
        setTrendsDigest([])
      })

    setSeasonalityApiError(null)
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
      .catch((err) => {
        setSeasonalityApiError(err?.message || 'Panorama estacional no disponible.')
        setSeasonalityHighlights([])
      })
  }, [user?.id])

  const adaptiveModules = useMemo(() => {
    const sections = pickFirstArray(
      feedLayout?.sections,
      feedLayout?.modules,
      feedLayout?.cards,
      feedLayout?.items
    )
    return Array.isArray(sections) ? sections.slice(0, 6) : []
  }, [feedLayout])

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
          <button
            key={item.id ?? item.name ?? item.title ?? index}
            type="button"
            className="trending-card trending-card--action animate-fadeIn"
            onClick={() =>
              navigate(
                destinationExplorePath({
                  loc: item.name || item.title,
                  country: item.country,
                  destId: item.id,
                })
              )
            }
          >
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
          </button>
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
        {asArray(trendsDigest).map((item, index) => {
          const g = item.geo
          const locFromGeo = (g?.name || '').trim()
          const slugFromDigestId = normalizeDestinationSlugForSearch(g?.destinationId)
          const geo =
            locFromGeo ||
            slugFromDigestId ||
            item.destination ||
            item.city ||
            item.region ||
            item.primaryDestination ||
            item.affectedDestination
          const country = (g?.country || '').trim() || item.country
          const destId = (g?.destinationId || '').trim() || item.trendId || item.id
          const openDigest = () => {
            const loc =
              locFromGeo ||
              slugFromDigestId ||
              (typeof geo === 'string' ? normalizeDestinationSlugForSearch(geo) || geo : '')
            if (loc || country) {
              navigate(
                destinationExplorePath({
                  loc: loc || country,
                  country: loc ? country : undefined,
                  destId,
                })
              )
            } else {
              navigate('/ai-assistant')
            }
          }
          return (
            <button
              key={item.id ?? item.name ?? item.title ?? index}
              type="button"
              className="trending-card trending-card--action"
              onClick={openDigest}
            >
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-info">
                <h4>{item.title || item.name || item.destination || 'Tendencia'}</h4>
                <p>{item.summary || item.description || item.signal || 'Senal emergente de viaje'}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const seasonalityContent = seasonalityHighlights.length > 0 && (
    <div className="section-card" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2>Panorama estacional</h2>
      </div>
      <div className="trending-list">
        {asArray(seasonalityHighlights).map((item, index) => {
          const raw = item.destination || item.destinationId || item.name || ''
          const loc = normalizeDestinationSlugForSearch(raw) || raw
          return (
            <button
              key={item.id ?? item.destinationId ?? item.destination ?? index}
              type="button"
              className="trending-card trending-card--action"
              onClick={() =>
                navigate(
                  destinationExplorePath({
                    loc,
                    destId: item.destinationId || item.id,
                  })
                )
              }
            >
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-info">
                <h4>{item.destination || item.destinationId || item.name || 'Destino'}</h4>
                <p>{item.note || item.summary || item.label || 'Perfil estacional disponible'}</p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )

  const adaptiveFeedContent = adaptiveModules.length > 0 && (
    <div className="section-card dashboard-adaptive-feed" style={{ marginTop: '1rem' }}>
      <div className="section-header">
        <h2>Feed adaptativo de inicio</h2>
      </div>
      {feedLayout?.feedRefreshNote ? (
        <p className="dashboard-adaptive-feed-note">{feedLayout.feedRefreshNote}</p>
      ) : null}
      {feedLayout?.recommendationThemeWeights &&
      Object.keys(feedLayout.recommendationThemeWeights).length > 0 ? (
        <div className="dashboard-adaptive-weights" aria-label="Pesos por tema">
          {Object.entries(feedLayout.recommendationThemeWeights).map(([k, v]) => (
            <span key={k} className="dashboard-adaptive-weight-chip">
              {k}: {typeof v === 'number' ? `${Math.round(v * 100)}%` : v}
            </span>
          ))}
        </div>
      ) : null}
      <div className="trending-list">
        {asArray(adaptiveModules).map((item, index) => {
          const geo = item.destination || item.location || item.relatedDestination || item.city
          const themeTags = item.themeTags || item.theme_tags || []
          const contentTypes = item.contentTypes || item.content_types || []
          const subtitle =
            [contentTypes.join(', '), themeTags.join(' · ')].filter(Boolean).join(' · ') ||
            item.subtitle ||
            item.description ||
            item.reason ||
            'Modulo personalizado'
          const openAdaptive = () => {
            if (geo) {
              navigate(
                destinationExplorePath({
                  loc: normalizeDestinationSlugForSearch(geo) || geo,
                  destId: item.sectionId || item.section_id || item.id || item.key,
                })
              )
            } else if (item.href && /^https?:\/\//i.test(item.href)) {
              globalThis.open(item.href, '_blank', 'noopener,noreferrer')
            } else if (themeTags.length) {
              navigate('/ai-assistant')
            } else {
              navigate('/my-travels')
            }
          }
          return (
            <button
              key={item.sectionId || item.section_id || item.id || item.key || index}
              type="button"
              className="trending-card trending-card--action"
              onClick={openAdaptive}
            >
              <div className="trending-rank">#{index + 1}</div>
              <div className="trending-info">
                <h4>{item.title || item.name || item.key || 'Modulo'}</h4>
                <p>{subtitle}</p>
                {item.priorityWeight != null || item.priority_weight != null ? (
                  <p className="trending-adaptive-meta">
                    Prioridad:{' '}
                    {Math.round(
                      Number(item.priorityWeight ?? item.priority_weight ?? 0) * 100
                    )}
                    %
                  </p>
                ) : null}
              </div>
            </button>
          )
        })}
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
          {feedLayout?.primaryTheme ? (
            <output className="dashboard-adaptive-theme">
              <Zap size={15} aria-hidden />
              <span>
                UI adaptativa: tema{' '}
                <strong>
                  {PRIMARY_THEME_LABELS[feedLayout.primaryTheme] || feedLayout.primaryTheme}
                </strong>
              </span>
            </output>
          ) : null}
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
      {(trendsApiError || digestApiError || seasonalityApiError || adaptiveLoadError) && (
        <ErrorBanner
          variant="error"
          message={[trendsApiError, digestApiError, seasonalityApiError, adaptiveLoadError]
            .filter(Boolean)
            .join(' ')}
          onDismiss={() => {
            setTrendsApiError(null)
            setDigestApiError(null)
            setSeasonalityApiError(null)
            clearLoadError()
          }}
        />
      )}

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
