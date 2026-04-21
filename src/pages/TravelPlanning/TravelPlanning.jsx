import React, { useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Plane,
  Hotel,
  Car,
  Camera,
  Plus,
  Search,
  Filter,
  Star
} from 'lucide-react'
import './TravelPlanning.css'

const TravelPlanning = () => {
  const [activeTab, setActiveTab] = useState('planner')
  const [tripData, setTripData] = useState({
    destination: '',
    startDate: '',
    endDate: '',
    travelers: 2,
    budget: 'medium',
    interests: []
  })

  const destinations = [
    { name: 'Paris, France', rating: 4.8, price: '$1,200', image: 'paris', type: 'City' },
    { name: 'Bali, Indonesia', rating: 4.9, price: '$800', image: 'bali', type: 'Beach' },
    { name: 'Tokyo, Japan', rating: 4.7, price: '$1,500', image: 'tokyo', type: 'City' },
    { name: 'Santorini, Greece', rating: 4.9, price: '$1,100', image: 'santorini', type: 'Island' }
  ]

  const planningSteps = [
    { id: 1, title: 'Choose Destination', completed: true, icon: MapPin },
    { id: 2, title: 'Set Dates', completed: true, icon: Calendar },
    { id: 3, title: 'Budget Planning', completed: false, icon: DollarSign },
    { id: 4, title: 'Book Flights', completed: false, icon: Plane },
    { id: 5, title: 'Accommodation', completed: false, icon: Hotel },
    { id: 6, title: 'Activities', completed: false, icon: Camera }
  ]

  const interests = [
    'Adventure', 'Culture', 'Beach', 'Food & Wine', 'Shopping', 
    'Nature', 'History', 'Nightlife', 'Photography', 'Relaxation'
  ]

  const handleInterestToggle = (interest) => {
    setTripData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }))
  }

  return (
    <div className="travel-planning">
      <div className="planning-header">
        <h1>Travel Planning Studio</h1>
        <p>Plan your perfect trip with AI-powered recommendations</p>
      </div>

      <div className="planning-tabs">
        <button 
          className={`tab-btn ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          Trip Planner
        </button>
        <button 
          className={`tab-btn ${activeTab === 'destinations' ? 'active' : ''}`}
          onClick={() => setActiveTab('destinations')}
        >
          Explore Destinations
        </button>
        <button 
          className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          Itinerary Builder
        </button>
      </div>

      {activeTab === 'planner' && (
        <div className="planner-content">
          <div className="planner-main">
            <Card title="Trip Details">
              <div className="trip-form">
                <div className="form-row">
                  <div className="form-group">
                    <label>Destination</label>
                    <div className="input-with-icon">
                      <MapPin size={20} />
                      <input
                        type="text"
                        placeholder="Where do you want to go?"
                        value={tripData.destination}
                        onChange={(e) => setTripData(prev => ({...prev, destination: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date</label>
                    <div className="input-with-icon">
                      <Calendar size={20} />
                      <input
                        type="date"
                        value={tripData.startDate}
                        onChange={(e) => setTripData(prev => ({...prev, startDate: e.target.value}))}
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <div className="input-with-icon">
                      <Calendar size={20} />
                      <input
                        type="date"
                        value={tripData.endDate}
                        onChange={(e) => setTripData(prev => ({...prev, endDate: e.target.value}))}
                      />
                    </div>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Travelers</label>
                    <div className="input-with-icon">
                      <Users size={20} />
                      <select
                        value={tripData.travelers}
                        onChange={(e) => setTripData(prev => ({...prev, travelers: parseInt(e.target.value)}))}
                      >
                        <option value={1}>1 Person</option>
                        <option value={2}>2 People</option>
                        <option value={3}>3 People</option>
                        <option value={4}>4 People</option>
                        <option value={5}>5+ People</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Budget</label>
                    <div className="input-with-icon">
                      <DollarSign size={20} />
                      <select
                        value={tripData.budget}
                        onChange={(e) => setTripData(prev => ({...prev, budget: e.target.value}))}
                      >
                        <option value="budget">Budget ($0-500)</option>
                        <option value="medium">Medium ($500-1500)</option>
                        <option value="comfort">Comfort ($1500-3000)</option>
                        <option value="luxury">Luxury ($3000+)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="form-group">
                  <label>Interests</label>
                  <div className="interests-grid">
                    {interests.map(interest => (
                      <button
                        key={interest}
                        className={`interest-tag ${tripData.interests.includes(interest) ? 'active' : ''}`}
                        onClick={() => handleInterestToggle(interest)}
                      >
                        {interest}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            <Card title="Planning Progress">
              <div className="progress-steps">
                {planningSteps.map(step => {
                  const Icon = step.icon
                  return (
                    <div key={step.id} className={`step ${step.completed ? 'completed' : ''}`}>
                      <div className="step-icon">
                        <Icon size={20} />
                      </div>
                      <div className="step-content">
                        <h4>{step.title}</h4>
                      </div>
                    </div>
                  )
                })}
              </div>
            </Card>
          </div>

          <div className="planner-sidebar">
            <Card title="Quick Actions">
              <div className="quick-actions">
                <Button variant="primary" className="action-btn">
                  <Search size={16} />
                  Get AI Recommendations
                </Button>
                <Button variant="outline" className="action-btn">
                  <Plane size={16} />
                  Search Flights
                </Button>
                <Button variant="outline" className="action-btn">
                  <Hotel size={16} />
                  Find Hotels
                </Button>
                <Button variant="outline" className="action-btn">
                  <Car size={16} />
                  Rent a Car
                </Button>
              </div>
            </Card>

            <Card title="Saved Trips">
              <div className="saved-trips">
                <div className="trip-card">
                  <h4>European Adventure</h4>
                  <p>Jun 15-30, 2024</p>
                  <div className="trip-status">Planning</div>
                </div>
                <div className="trip-card">
                  <h4>Beach Weekend</h4>
                  <p>Aug 5-7, 2024</p>
                  <div className="trip-status confirmed">Confirmed</div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}

      {activeTab === 'destinations' && (
        <div className="destinations-content">
          <div className="destinations-header">
            <h2>Popular Destinations</h2>
            <div className="destinations-filters">
              <Button variant="outline" size="small">
                <Filter size={16} />
                Filters
              </Button>
            </div>
          </div>

          <div className="destinations-grid">
            {destinations.map((dest, index) => (
              <Card key={index} hover className="destination-card">
                <div className="destination-image">
                  <img src={`/api/placeholder/300/200?text=${dest.image}`} alt={dest.name} />
                  <div className="destination-type">{dest.type}</div>
                </div>
                <div className="destination-content">
                  <h3>{dest.name}</h3>
                  <div className="destination-rating">
                    <Star size={16} fill="#fbbf24" color="#fbbf24" />
                    <span>{dest.rating}</span>
                  </div>
                  <div className="destination-price">{dest.price}</div>
                  <Button variant="primary" size="small">Explore</Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'itinerary' && (
        <div className="itinerary-content">
          <Card title="Build Your Itinerary">
            <div className="itinerary-builder">
              <div className="day-planner">
                <div className="day-header">
                  <h3>Day 1 - Arrival</h3>
                  <Button variant="outline" size="small">
                    <Plus size={16} />
                    Add Activity
                  </Button>
                </div>
                <div className="day-activities">
                  <div className="activity-item">
                    <div className="activity-time">9:00 AM</div>
                    <div className="activity-content">
                      <h4>Airport Arrival</h4>
                      <p>Arrive at destination airport</p>
                    </div>
                  </div>
                  <div className="activity-item">
                    <div className="activity-time">12:00 PM</div>
                    <div className="activity-content">
                      <h4>Hotel Check-in</h4>
                      <p>Check into accommodation</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default TravelPlanning
