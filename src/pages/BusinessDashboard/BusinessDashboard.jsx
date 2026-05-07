import { useEffect, useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { businessService } from '../../services/businessService'
import ErrorBanner from '../../components/UI/ErrorBanner'
import { 
  Users, 
  DollarSign, 
  Calendar, 
  Star,
  BarChart3,
  Settings,
  Plus
} from 'lucide-react'
import './BusinessDashboard.css'

const defaultDashboard = {
  stats: [],
  bookings: [],
  services: [],
  performance: [],
}

const BusinessDashboard = () => {
  const [businessStats, setBusinessStats] = useState(defaultDashboard.stats)
  const [recentBookings, setRecentBookings] = useState(defaultDashboard.bookings)
  const [services, setServices] = useState(defaultDashboard.services)
  const [performanceData, setPerformanceData] = useState(defaultDashboard.performance)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const loadBusinessData = async () => {
      setLoading(true)
      setError('')
      try {
        const [dashboardRes, bookingsRes, servicesRes, analyticsRes] = await Promise.allSettled([
          businessService.getDashboardStats(),
          businessService.getBookings({ page: 0, size: 4 }),
          businessService.getServices(),
          businessService.getAnalytics(),
        ])
        const dashboard = dashboardRes.status === 'fulfilled' ? dashboardRes.value : null
        const bookings = bookingsRes.status === 'fulfilled' ? bookingsRes.value : []
        const serviceRows = servicesRes.status === 'fulfilled' ? servicesRes.value : []
        const analytics = analyticsRes.status === 'fulfilled' ? analyticsRes.value : null

        if (dashboard && typeof dashboard === 'object') {
          setBusinessStats([
            {
              label: 'Ingresos totales',
              value:
                dashboard.totalRevenue !== null && dashboard.totalRevenue !== undefined
                  ? `$${dashboard.totalRevenue}`
                  : '$0',
              icon: DollarSign,
              trend: dashboard.revenueTrend || '—',
              positive: true,
            },
            {
              label: 'Reservas activas',
              value: String(dashboard.activeBookings ?? 0),
              icon: Calendar,
              trend: dashboard.bookingsTrend || '—',
              positive: true,
            },
            {
              label: 'Calificacion de clientes',
              value: String(dashboard.rating ?? 0),
              icon: Star,
              trend: dashboard.ratingTrend || '—',
              positive: true,
            },
            {
              label: 'Clientes totales',
              value: String(dashboard.totalCustomers ?? 0),
              icon: Users,
              trend: dashboard.customersTrend || '—',
              positive: true,
            },
          ])
        }

        if (Array.isArray(bookings)) {
          setRecentBookings(
            bookings.slice(0, 4).map((row) => ({
              id: row.id,
              customer: row.customerName || row.customer || 'Cliente',
              service: row.serviceName || row.service || 'Servicio',
              date: row.date || row.createdAt || '—',
              amount:
                row.amount !== null && row.amount !== undefined ? `$${row.amount}` : '—',
              status: row.status || 'pending',
            }))
          )
        }

        if (Array.isArray(serviceRows)) {
          setServices(
            serviceRows.map((row) => ({
              name: row.name || row.serviceName || 'Servicio',
              bookings: row.bookings || 0,
              revenue:
                row.revenue !== null && row.revenue !== undefined ? `$${row.revenue}` : '$0',
              rating: row.rating || 0,
            }))
          )
        }

        setPerformanceData(Array.isArray(analytics?.performance) ? analytics.performance : [])
      } catch (err) {
        setError(err?.message || 'No se pudieron cargar los datos del proveedor.')
      } finally {
        setLoading(false)
      }
    }

    loadBusinessData()
  }, [])

  if (loading) {
    return (
      <div className="loading-center">
        <div className="spinner" />
        <p>Cargando panel de negocios...</p>
      </div>
    )
  }

  return (
    <div className="business-dashboard">
      <ErrorBanner variant="error" message={error} onDismiss={() => setError('')} />
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Panel de negocios</h1>
          <p>Administra tu negocio turistico y da seguimiento a su rendimiento</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">
            <Plus size={16} />
            Agregar servicio
          </Button>
          <Button variant="outline">
            <Settings size={16} />
            Configuracion
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        {businessStats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label} hover>
              <div className="stat-card">
                <div className="stat-icon">
                  <Icon size={24} />
                </div>
                <div className="stat-content">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                  <span className={`stat-trend ${stat.positive ? 'positive' : 'negative'}`}>
                    {stat.trend}
                  </span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <Card title="Reservas recientes">
            <div className="bookings-table">
              <div className="table-header">
                <div>Cliente</div>
                <div>Servicio</div>
                <div>Fecha</div>
                <div>Monto</div>
                <div>Estado</div>
                <div>Acciones</div>
              </div>
              <div className="table-body">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="table-row">
                    <div className="customer-info">
                      <div className="customer-name">{booking.customer}</div>
                    </div>
                    <div>{booking.service}</div>
                    <div>{booking.date}</div>
                    <div className="amount">{booking.amount}</div>
                    <div>
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div>
                      <Button size="small" variant="outline">Ver</Button>
                    </div>
                  </div>
                ))}
                {recentBookings.length === 0 && (
                  <div className="table-row">
                    <div>No hay reservas recientes</div>
                  </div>
                )}
              </div>
            </div>
          </Card>

          <Card title="Rendimiento de servicios">
            <div className="performance-chart">
              <div className="chart-header">
                <h4>Ingresos y reservas mensuales</h4>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color revenue"></div>
                    <span>Ingresos</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bookings"></div>
                    <span>Reservas</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {performanceData.map((data) => (
                  <div key={data.month} className="chart-bar">
                    <div className="bar-group">
                      <div 
                        className="bar revenue-bar" 
                        style={{ height: `${(data.revenue / 50000) * 100}%` }}
                      ></div>
                      <div 
                        className="bar bookings-bar" 
                        style={{ height: `${(data.bookings / 200) * 100}%` }}
                      ></div>
                    </div>
                    <div className="bar-label">{data.month}</div>
                  </div>
                ))}
                {performanceData.length === 0 && (
                  <p style={{ color: 'var(--text-muted)' }}>No hay datos de rendimiento.</p>
                )}
              </div>
            </div>
          </Card>
        </div>

        <div className="dashboard-sidebar">
          <Card title="Resumen de servicios">
            <div className="services-list">
              {services.map((service) => (
                <div key={service.name} className="service-item">
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <div className="service-stats">
                      <span>{service.bookings} reservas</span>
                      <span>{service.revenue}</span>
                    </div>
                    <div className="service-rating">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span>{service.rating}</span>
                    </div>
                  </div>
                  <Button size="small" variant="outline">Gestionar</Button>
                </div>
              ))}
              {services.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No hay servicios cargados.</p>}
            </div>
          </Card>

          <Card title="Acciones rapidas">
            <div className="quick-actions">
              <Button variant="primary" className="action-btn">
                <Plus size={16} />
                Crear promocion
              </Button>
              <Button variant="outline" className="action-btn">
                <BarChart3 size={16} />
                Ver reportes
              </Button>
              <Button variant="outline" className="action-btn">
                <Users size={16} />
                Gestionar clientes
              </Button>
              <Button variant="outline" className="action-btn">
                <Calendar size={16} />
                Vista de calendario
              </Button>
            </div>
          </Card>

          <Card title="Insights de negocio">
            <div className="insights-list">
              <div className="insight-item">
                <h4>Alerta de temporada alta</h4>
                <p>Las reservas de verano aumentaron 35% frente al ano pasado</p>
              </div>
              <div className="insight-item">
                <h4>Servicio con mejor rendimiento</h4>
                <p>Los tours por la ciudad generan el mayor ingreso por reserva</p>
              </div>
              <div className="insight-item">
                <h4>Satisfaccion de clientes</h4>
                <p>El 98% de clientes califica tus servicios con 4+ estrellas</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
