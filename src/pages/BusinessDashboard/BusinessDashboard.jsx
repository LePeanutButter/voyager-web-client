import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
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

const BusinessDashboard = () => {
  const businessStats = [
    { label: 'Total Revenue', value: '$45,280', icon: DollarSign, trend: '+12.5%', positive: true },
    { label: 'Active Bookings', value: '156', icon: Calendar, trend: '+8 this week', positive: true },
    { label: 'Customer Rating', value: '4.8', icon: Star, trend: '+0.2', positive: true },
    { label: 'Total Customers', value: '2,847', icon: Users, trend: '+127', positive: true },
  ]

  const recentBookings = [
    { id: 1, customer: 'John Smith', service: 'City Tour', date: '2024-06-15', amount: '$250', status: 'confirmed' },
    { id: 2, customer: 'Sarah Johnson', service: 'Hotel Package', date: '2024-06-18', amount: '$1,200', status: 'pending' },
    { id: 3, customer: 'Mike Davis', service: 'Airport Transfer', date: '2024-06-20', amount: '$80', status: 'confirmed' },
    { id: 4, customer: 'Emma Wilson', service: 'Adventure Tour', date: '2024-06-22', amount: '$450', status: 'pending' },
  ]

  const services = [
    { name: 'City Tours', bookings: 45, revenue: '$11,250', rating: 4.9 },
    { name: 'Hotel Packages', bookings: 28, revenue: '$28,000', rating: 4.7 },
    { name: 'Airport Transfers', bookings: 67, revenue: '$5,360', rating: 4.8 },
    { name: 'Adventure Tours', bookings: 16, revenue: '$7,200', rating: 4.9 },
  ]

  const performanceData = [
    { month: 'Jan', revenue: 32000, bookings: 120 },
    { month: 'Feb', revenue: 35000, bookings: 135 },
    { month: 'Mar', revenue: 38000, bookings: 142 },
    { month: 'Apr', revenue: 42000, bookings: 158 },
    { month: 'May', revenue: 45280, bookings: 167 },
    { month: 'Jun', revenue: 48000, bookings: 175 },
  ]

  return (
    <div className="business-dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Business Dashboard</h1>
          <p>Manage your tourism business and track performance</p>
        </div>
        <div className="header-actions">
          <Button variant="primary">
            <Plus size={16} />
            Add Service
          </Button>
          <Button variant="outline">
            <Settings size={16} />
            Settings
          </Button>
        </div>
      </div>

      <div className="stats-grid">
        {businessStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index} hover>
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
          <Card title="Recent Bookings">
            <div className="bookings-table">
              <div className="table-header">
                <div>Customer</div>
                <div>Service</div>
                <div>Date</div>
                <div>Amount</div>
                <div>Status</div>
                <div>Actions</div>
              </div>
              <div className="table-body">
                {recentBookings.map(booking => (
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
                      <Button size="small" variant="outline">View</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          <Card title="Service Performance">
            <div className="performance-chart">
              <div className="chart-header">
                <h4>Monthly Revenue & Bookings</h4>
                <div className="chart-legend">
                  <div className="legend-item">
                    <div className="legend-color revenue"></div>
                    <span>Revenue</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color bookings"></div>
                    <span>Bookings</span>
                  </div>
                </div>
              </div>
              <div className="chart-container">
                {performanceData.map((data, index) => (
                  <div key={index} className="chart-bar">
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
              </div>
            </div>
          </Card>
        </div>

        <div className="dashboard-sidebar">
          <Card title="Services Overview">
            <div className="services-list">
              {services.map((service, index) => (
                <div key={index} className="service-item">
                  <div className="service-info">
                    <h4>{service.name}</h4>
                    <div className="service-stats">
                      <span>{service.bookings} bookings</span>
                      <span>{service.revenue}</span>
                    </div>
                    <div className="service-rating">
                      <Star size={14} fill="#fbbf24" color="#fbbf24" />
                      <span>{service.rating}</span>
                    </div>
                  </div>
                  <Button size="small" variant="outline">Manage</Button>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="quick-actions">
              <Button variant="primary" className="action-btn">
                <Plus size={16} />
                Create Promotion
              </Button>
              <Button variant="outline" className="action-btn">
                <BarChart3 size={16} />
                View Reports
              </Button>
              <Button variant="outline" className="action-btn">
                <Users size={16} />
                Manage Customers
              </Button>
              <Button variant="outline" className="action-btn">
                <Calendar size={16} />
                Calendar View
              </Button>
            </div>
          </Card>

          <Card title="Business Insights">
            <div className="insights-list">
              <div className="insight-item">
                <h4>Peak Season Alert</h4>
                <p>Summer bookings increased by 35% compared to last year</p>
              </div>
              <div className="insight-item">
                <h4>Top Performing Service</h4>
                <p>City Tours generate the highest revenue per booking</p>
              </div>
              <div className="insight-item">
                <h4>Customer Satisfaction</h4>
                <p>98% of customers rate your services 4+ stars</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard
