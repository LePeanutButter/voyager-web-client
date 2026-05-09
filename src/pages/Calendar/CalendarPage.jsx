import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, MapPin, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import ErrorBanner from '../../components/UI/ErrorBanner'
import Card from '../../components/UI/Card'
import './CalendarPage.css'

const WEEK_LABELS = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom']

const dateKey = (date) => {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const asDate = (value) => {
  if (!value) return null
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return null
  return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate())
}

const formatPlanDate = (value) => {
  const parsed = asDate(value)
  if (!parsed) return 'Sin fecha'
  return parsed.toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

const monthLabel = (value) =>
  value.toLocaleDateString('es-CO', { month: 'long', year: 'numeric' })

const buildMonthDays = (cursorMonth) => {
  const monthStart = new Date(cursorMonth.getFullYear(), cursorMonth.getMonth(), 1)
  const firstWeekday = monthStart.getDay()
  const mondayOffset = firstWeekday === 0 ? 6 : firstWeekday - 1
  const gridStart = new Date(monthStart)
  gridStart.setDate(monthStart.getDate() - mondayOffset)

  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(gridStart)
    day.setDate(gridStart.getDate() + index)
    return day
  })
}

const CalendarPage = () => {
  const { plans, loading, error, clearError } = useTravelPlans(true)
  const [cursorMonth, setCursorMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })

  const plansByDate = useMemo(() => {
    const grouped = new Map()

    plans.forEach((plan) => {
      const start = asDate(plan.startDate)
      const end = asDate(plan.endDate) || start
      if (!start || !end) return

      const safeEnd = new Date(Math.max(start.getTime(), end.getTime()))
      const cursor = new Date(start)

      // Guardarrail para evitar loops infinitos por data inconsistente.
      let maxSpan = 400
      while (cursor.getTime() <= safeEnd.getTime() && maxSpan > 0) {
        const key = dateKey(cursor)
        const dayPlans = grouped.get(key) || []
        dayPlans.push(plan)
        grouped.set(key, dayPlans)
        cursor.setDate(cursor.getDate() + 1)
        maxSpan -= 1
      }
    })

    return grouped
  }, [plans])

  const monthDays = useMemo(() => buildMonthDays(cursorMonth), [cursorMonth])
  const todayKey = dateKey(new Date())
  const visibleMonth = cursorMonth.getMonth()

  const upcomingPlans = useMemo(() => {
    const now = asDate(new Date())
    return [...plans]
      .filter((plan) => {
        const start = asDate(plan.startDate)
        const end = asDate(plan.endDate) || start
        if (!start || !end || !now) return false
        return end >= now
      })
      .sort((a, b) => {
        const aDate = asDate(a.startDate)?.getTime() || 0
        const bDate = asDate(b.startDate)?.getTime() || 0
        return aDate - bDate
      })
      .slice(0, 8)
  }, [plans])

  let upcomingContent
  if (loading) {
    upcomingContent = <p className="calendar-empty">Cargando planes...</p>
  } else if (upcomingPlans.length > 0) {
    upcomingContent = (
      <div className="calendar-items">
        {upcomingPlans.map((plan) => (
          <Link key={plan.id} to={`/travel-plans/${plan.id}`} className="calendar-item">
            <div className="calendar-item-top">
              <span className="calendar-type">{plan.status || 'Plan'}</span>
              <strong>{plan.title}</strong>
            </div>
            <div className="calendar-item-meta">
              <span>
                <CalendarDays size={14} /> {formatPlanDate(plan.startDate)}
              </span>
              <span>
                <MapPin size={14} /> {plan.destinationLocation || 'Destino pendiente'}
              </span>
            </div>
          </Link>
        ))}
      </div>
    )
  } else {
    upcomingContent = <p className="calendar-empty">Aun no tienes planes futuros para mostrar.</p>
  }

  return (
    <div className="calendar-page page-container">
      <div className="page-header">
        <h1>Calendario</h1>
        <p>Visualiza tus planes reales en formato mensual, al estilo agenda.</p>
      </div>

      <Card className="calendar-highlight" hover>
        <div className="calendar-highlight-head">
          <Sparkles size={16} />
          <span>Sugerencia IA</span>
        </div>
        <h3>Tu semana esta optimizada para movilidad urbana y experiencias sociales</h3>
        <p>Podemos reordenar tu agenda automaticamente segun clima, trafico y compatibilidad de grupo.</p>
      </Card>

      <ErrorBanner variant="error" message={error} onDismiss={clearError} />

      <div className="calendar-layout">
        <Card className="calendar-month-card">
          <div className="calendar-toolbar">
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() =>
                setCursorMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
              }
              aria-label="Mes anterior"
            >
              <ChevronLeft size={16} />
            </button>
            <h2>{monthLabel(cursorMonth)}</h2>
            <button
              type="button"
              className="calendar-nav-btn"
              onClick={() =>
                setCursorMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
              }
              aria-label="Mes siguiente"
            >
              <ChevronRight size={16} />
            </button>
          </div>

          <div className="calendar-grid-head">
            {WEEK_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="calendar-grid-body">
            {monthDays.map((day) => {
              const key = dateKey(day)
              const dayPlans = plansByDate.get(key) || []
              const extraCount = dayPlans.length > 2 ? dayPlans.length - 2 : 0
              const isCurrentMonthDay = day.getMonth() === visibleMonth
              return (
                <div
                  key={key}
                  className={[
                    'calendar-day',
                    isCurrentMonthDay ? '' : 'is-outside',
                    key === todayKey ? 'is-today' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <div className="calendar-day-number">{day.getDate()}</div>
                  <div className="calendar-day-events">
                    {dayPlans.slice(0, 2).map((plan) => (
                      <Link
                        key={`${key}-${plan.id}`}
                        to={`/travel-plans/${plan.id}`}
                        className="calendar-chip"
                        title={plan.title}
                      >
                        {plan.title}
                      </Link>
                    ))}
                    {extraCount > 0 && <span className="calendar-more">+{extraCount} mas</span>}
                  </div>
                </div>
              )
            })}
          </div>
        </Card>

        <div className="calendar-list">
          <Card className="calendar-list-card" hover={false}>
            <div className="calendar-list-head">
              <h3>Proximos planes</h3>
              <span>{upcomingPlans.length}</span>
            </div>
            {upcomingContent}
          </Card>
        </div>
      </div>

      {!loading && plans.length === 0 && (
        <Card className="calendar-empty-state" hover={false}>
          <h3>Tu calendario esta vacio</h3>
          <p>Crea tu primer plan de viaje y empezaremos a llenar tu agenda automaticamente.</p>
        </Card>
      )}

      <div className="calendar-actions">
        <Link to="/travel-plans/create" className="btn btn-primary">Planear nuevo viaje</Link>
        <Link to="/my-travels" className="btn btn-outline">Ver todos mis viajes</Link>
      </div>
    </div>
  )
}

export default CalendarPage
