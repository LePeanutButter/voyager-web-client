import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { aiService } from '../../services/aiService'
import { StatCardSkeleton, TravelCardSkeleton } from '../../components/UI/SkeletonLoader'
import ErrorBanner from '../../components/UI/ErrorBanner'
import {
  MapPin, Calendar, TrendingUp, Users, Plane,
  Plus, Star, ArrowRight, Zap, Globe, Compass
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plans, loading: plansLoading, error: plansError, refresh } = useTravelPlans(true)
  const [trending, setTrending] = useState([])
  const [trendingLoading, setTrendingLoading] = useState(true)

  useEffect(() => {
    aiService.getTrendingActivities(null, 3)
      .then((res) => setTrending(res?.activities || []))
      .catch(() => setTrending([]))
      .finally(() => setTrendingLoading(false))
  }, [])

  // Derive stats from real plans
  const stats = React.useMemo(() => {
    const total = plans.length
    const upcoming = plans.filter((p) => p.status === 'PLANNING' || p.status === 'ACTIVE').length
    const completed = plans.filter((p) => p.status === 'COMPLETED').length
    const destinations = new Set(plans.map((p) => p.destinationLocation).filter(Boolean)).size
    return [
      { label: 'Total Plans', value: total, icon: Plane, color: 'var(--voyager-blue)', bg: '#dbeafe' },
      { label: 'Upcoming', value: upcoming, icon: Calendar, color: 'var(--color-success)', bg: '#d1fae5' },
      { label: 'Completed', value: completed, icon: Star, color: 'var(--accent-gold)', bg: '#fef3c7' },
      { label: 'Destinations', value: destinations, icon: Globe, color: 'var(--voyager-indigo)', bg: '#ede9fe' },
    ]
  }, [plans])

  const recentPlans = plans.slice(0, 3)
  const firstName = user?.firstName || user?.username || 'Traveler'

  const greeting = () => {
    const h = new Date().getHours()
    if (h < 12) return 'Good morning'
    if (h < 18) return 'Good afternoon'
    return 'Good evening'
  }

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'

  const statusConfig = {
    PLANNING: { label: 'Planning', cls: 'badge-planning' },
    ACTIVE: { label: 'Active', cls: 'badge-active' },
    COMPLETED: { label: 'Completed', cls: 'badge-completed' },
    CANCELLED: { label: 'Cancelled', cls: 'badge-cancelled' },
  }

  return (
    <div className="dashboard-page page-container">
      {/* Header */}
      <div className="dashboard-header">
        <div>
          <p className="dashboard-greeting">{greeting()},</p>
          <h1 className="dashboard-name">{firstName} <span className="wave">👋</span></h1>
          <p className="dashboard-subtitle">Here&apos;s an overview of your travel activity</p>
        </div>
        <button
          id="dashboard-new-plan-btn"
          className="btn-primary"
          onClick={() => navigate('/travel-plans/create')}
        >
          <Plus size={18} />
          New Plan
        </button>
      </div>

      <ErrorBanner variant="error" message={plansError} />

      {/* Stats */}
      <div className="dashboard-stats">
        {plansLoading
          ? Array.from({ length: 4 }, (_, i) => <StatCardSkeleton key={i} />)
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
            <h2>Recent Plans</h2>
            <button className="btn-link" onClick={() => navigate('/my-travels')}>
              View all <ArrowRight size={15} />
            </button>
          </div>

          {plansLoading ? (
            <div className="plans-list">
              {Array.from({ length: 3 }, (_, i) => <TravelCardSkeleton key={i} />)}
            </div>
          ) : recentPlans.length === 0 ? (
            <div className="empty-state" style={{ padding: '3rem 1rem' }}>
              <div className="empty-state-icon" style={{ width: 64, height: 64 }}>
                <Plane size={28} />
              </div>
              <h3>No plans yet</h3>
              <p>Create your first travel plan and start your adventure!</p>
              <button className="btn-primary" onClick={() => navigate('/travel-plans/create')}>
                <Plus size={16} /> Create First Plan
              </button>
            </div>
          ) : (
            <div className="plans-list">
              {recentPlans.map((plan) => {
                const sc = statusConfig[plan.status] || { label: plan.status, cls: 'badge-planning' }
                return (
                  <div key={plan.id} className="plan-row" onClick={() => navigate(`/travel-plans/${plan.id}`)}>
                    <div className="plan-row-icon">
                      <MapPin size={18} />
                    </div>
                    <div className="plan-row-info">
                      <h4>{plan.title}</h4>
                      <p>{plan.destinationLocation} · {formatDate(plan.startDate)}</p>
                    </div>
                    <span className={`badge ${sc.cls}`}>{sc.label}</span>
                    <ArrowRight size={16} className="plan-row-arrow" />
                  </div>
                )
              })}
            </div>
          )}

          {/* Quick actions */}
          <div className="section-header" style={{ marginTop: '2rem' }}>
            <h2>Quick Actions</h2>
          </div>
          <div className="quick-actions">
            {[
              { label: 'Plan a Trip', icon: Plane, action: () => navigate('/travel-plans/create'), primary: true },
              { label: 'AI Assistant', icon: Zap, action: () => navigate('/ai-assistant') },
              { label: 'Find Travelers', icon: Users, action: () => navigate('/social') },
              { label: 'My Profile', icon: Compass, action: () => navigate('/profile') },
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
            <h2>Trending Now</h2>
          </div>

          {trendingLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {Array.from({ length: 3 }, (_, i) => (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--surface-card)', borderRadius: 'var(--border-radius)', border: '1px solid var(--border-color)' }}>
                  <div className="skeleton skeleton-text skeleton-line-medium" />
                  <div className="skeleton skeleton-text skeleton-line-short" />
                </div>
              ))}
            </div>
          ) : trending.length === 0 ? (
            <div className="trending-empty">
              <TrendingUp size={24} />
              <p>No trending data available</p>
            </div>
          ) : (
            <div className="trending-list">
              {trending.map((item, i) => (
                <div key={i} className="trending-card animate-fadeIn">
                  <div className="trending-rank">#{i + 1}</div>
                  <div className="trending-info">
                    <h4>{item.name || item.title || 'Activity'}</h4>
                    <p>{item.category || item.type || 'Travel'}</p>
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
          )}

          {/* AI CTA */}
          <div className="ai-cta-card" onClick={() => navigate('/ai-assistant')}>
            <div className="ai-cta-icon">
              <Zap size={22} />
            </div>
            <div>
              <h4>AI Travel Assistant</h4>
              <p>Get personalized recommendations</p>
            </div>
            <ArrowRight size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
