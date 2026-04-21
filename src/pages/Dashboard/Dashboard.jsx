import React from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { 
  MapPin, 
  Calendar, 
  TrendingUp, 
  Users, 
  Star,
  Plane,
  Hotel,
  Camera
} from 'lucide-react'
import './Dashboard.css'

const Dashboard = () => {
  const stats = [
    { label: 'Trips Planned', value: '12', icon: MapPin, trend: '+2 this month' },
    { label: 'Upcoming Trips', value: '3', icon: Calendar, trend: 'Next: Paris' },
    { label: 'Places Visited', value: '28', icon: Camera, trend: '+4 this year' },
    { label: 'Travel Points', value: '2,450', icon: TrendingUp, trend: '+150 earned' },
  ]

  const recentTrips = [
    { destination: 'Tokyo, Japan', date: 'Mar 2024', status: 'completed', rating: 5 },
    { destination: 'Paris, France', date: 'Jun 2024', status: 'upcoming', rating: 0 },
    { destination: 'Bali, Indonesia', date: 'Aug 2024', status: 'planning', rating: 0 },
  ]

  const recommendations = [
    { title: 'Santorini, Greece', type: 'Beach Destination', price: '$1,200', image: 'santorini' },
    { title: 'Swiss Alps', type: 'Mountain Adventure', price: '$2,500', image: 'alps' },
    { title: 'Dubai, UAE', type: 'Luxury City', price: '$1,800', image: 'dubai' },
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, Traveler!</h1>
        <p>Here's your travel overview and personalized recommendations</p>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => {
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
                  <span className="stat-trend">{stat.trend}</span>
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          <Card title="Recent & Upcoming Trips">
            <div className="trips-list">
              {recentTrips.map((trip, index) => (
                <div key={index} className="trip-item">
                  <div className="trip-info">
                    <h4>{trip.destination}</h4>
                    <p>{trip.date}</p>
                    <span className={`trip-status ${trip.status}`}>
                      {trip.status}
                    </span>
                  </div>
                  <div className="trip-actions">
                    {trip.rating > 0 && (
                      <div className="trip-rating">
                        {[...Array(trip.rating)].map((_, i) => (
                          <Star key={i} size={16} fill="#fbbf24" color="#fbbf24" />
                        ))}
                      </div>
                    )}
                    <Button size="small" variant="outline">View Details</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Quick Actions">
            <div className="quick-actions-grid">
              <Button variant="primary" className="action-btn">
                <Plane size={20} />
                Plan New Trip
              </Button>
              <Button variant="outline" className="action-btn">
                <Hotel size={20} />
                Book Hotels
              </Button>
              <Button variant="outline" className="action-btn">
                <Camera size={20} />
                Travel Photos
              </Button>
              <Button variant="outline" className="action-btn">
                <Users size={20} />
                Find Travelers
              </Button>
            </div>
          </Card>
        </div>

        <div className="dashboard-sidebar">
          <Card title="Recommended for You">
            <div className="recommendations">
              {recommendations.map((rec, index) => (
                <div key={index} className="recommendation-card">
                  <div className="rec-image">
                    <img src={`/api/placeholder/200/120?text=${rec.image}`} alt={rec.title} />
                  </div>
                  <div className="rec-content">
                    <h4>{rec.title}</h4>
                    <p>{rec.type}</p>
                    <span className="rec-price">{rec.price}</span>
                    <Button size="small" variant="primary">Explore</Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card title="Travel Tips">
            <div className="travel-tips">
              <div className="tip-item">
                <h4>Best Time to Visit Europe</h4>
                <p>May through September offers the best weather for most European destinations.</p>
              </div>
              <div className="tip-item">
                <h4>Packing Essentials</h4>
                <p>Don't forget universal adapter, portable charger, and travel insurance.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
