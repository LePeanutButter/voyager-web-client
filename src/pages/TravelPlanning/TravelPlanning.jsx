import React, { useEffect, useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { travelPlanService } from '../../services/travelPlanService'
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

const getPlansStorageKey = () => {
  try {
    const raw = localStorage.getItem('userData')
    const user = raw ? JSON.parse(raw) : null
    const identity = user?.id || user?.username || user?.email || 'anonymous'
    return `created_travel_plans_${identity}`
  } catch {
    return 'created_travel_plans_anonymous'
  }
}

const toDateInputValue = (value) => {
  if (!value) return ''
  return String(value).split('T')[0]
}

const toLocalDateTimeString = (value, endOfDay = false) => {
  if (!value) return null
  const stringValue = String(value)
  if (stringValue.includes('T')) return stringValue
  return endOfDay ? `${stringValue}T23:59:59` : `${stringValue}T00:00:00`
}

const TravelPlanning = () => {
  const [activeTab, setActiveTab] = useState('planner')
  const [lastCreatedPlan, setLastCreatedPlan] = useState(null)
  const [userPlans, setUserPlans] = useState([])
  const [plansLoading, setPlansLoading] = useState(false)
  const [plansError, setPlansError] = useState('')
  const [editingPlanId, setEditingPlanId] = useState(null)
  const [savingPlanId, setSavingPlanId] = useState(null)
  const [deletingPlanId, setDeletingPlanId] = useState(null)
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

  useEffect(() => {
    try {
      const stored = localStorage.getItem('last_created_travel_plan')
      if (!stored) return
      const parsed = JSON.parse(stored)
      if (parsed && typeof parsed === 'object') setLastCreatedPlan(parsed)
    } catch {
      // ignore malformed local storage values
    }
  }, [])

  useEffect(() => {
    const loadPlans = async () => {
      setPlansLoading(true)
      setPlansError('')
      try {
        const res = await travelPlanService.list()
        const raw = res?.data || res
        const plans = Array.isArray(raw) ? raw : (Array.isArray(raw?.content) ? raw.content : [])
        if (plans.length > 0) {
          setUserPlans(plans)
        } else {
          const localPlans = JSON.parse(localStorage.getItem(getPlansStorageKey()) || '[]')
          setUserPlans(Array.isArray(localPlans) ? localPlans : [])
        }
      } catch (err) {
        const localPlans = JSON.parse(localStorage.getItem(getPlansStorageKey()) || '[]')
        if (Array.isArray(localPlans) && localPlans.length > 0) {
          setUserPlans(localPlans)
          setPlansError('')
        } else {
          setPlansError(err?.message || 'No se pudieron cargar los planes')
        }
      } finally {
        setPlansLoading(false)
      }
    }
    loadPlans()
  }, [])

  const updatePlanField = (planId, field, value) => {
    setUserPlans((prev) => prev.map((p) => (p.id === planId ? { ...p, [field]: value } : p)))
  }

  const savePlan = async (plan) => {
    try {
      setSavingPlanId(plan.id)
      const {
        id,
        createdAt,
        updatedAt,
        shareToken,
        ...updatableFields
      } = plan
      const payload = {
        ...updatableFields,
        startDate: toLocalDateTimeString(updatableFields.startDate, false),
        endDate: toLocalDateTimeString(updatableFields.endDate, true)
      }
      await travelPlanService.update(plan.id, payload)
      setEditingPlanId(null)
      setPlansError('')
    } catch (err) {
      setPlansError(err?.message || 'No se pudo actualizar el plan')
    } finally {
      setSavingPlanId(null)
    }
  }

  const deletePlan = async (planId) => {
    const confirmed = window.confirm('Quieres borrar este plan? Esta accion no se puede deshacer.')
    if (!confirmed) return

    try {
      setDeletingPlanId(planId)
      await travelPlanService.remove(planId)
      setUserPlans((prev) => prev.filter((plan) => plan.id !== planId))
      setPlansError('')
      if (editingPlanId === planId) setEditingPlanId(null)
    } catch (err) {
      setPlansError(err?.message || 'No se pudo borrar el plan')
    } finally {
      setDeletingPlanId(null)
    }
  }

  return (
    <div className="travel-planning">
      <div className="planning-header">
        <h1>Travel Planning Studio</h1>
        <p>Plan your perfect trip with AI-powered recommendations</p>
      </div>

      {lastCreatedPlan && (
        <Card title="Ultimo plan creado">
          <p>
            {lastCreatedPlan.title || 'Plan sin titulo'} - {lastCreatedPlan.destinationLocation || 'Destino no especificado'}
          </p>
        </Card>
      )}

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

            <Card title="Mis planes creados">
              <div className="saved-trips">
                {plansLoading && <p>Cargando planes…</p>}
                {plansError && <p style={{ color: '#dc3545' }}>{plansError}</p>}
                {!plansLoading && userPlans.length === 0 && <p>Aun no tienes planes creados.</p>}

                {userPlans.map((plan) => (
                  <div key={plan.id} className="trip-card">
                    {editingPlanId === plan.id ? (
                      <>
                        <input
                          value={plan.title || ''}
                          onChange={(e) => updatePlanField(plan.id, 'title', e.target.value)}
                          placeholder="Titulo"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          value={plan.destinationLocation || ''}
                          onChange={(e) => updatePlanField(plan.id, 'destinationLocation', e.target.value)}
                          placeholder="Destino"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          value={plan.originLocation || ''}
                          onChange={(e) => updatePlanField(plan.id, 'originLocation', e.target.value)}
                          placeholder="Origen"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          type="date"
                          value={toDateInputValue(plan.startDate)}
                          onChange={(e) => updatePlanField(plan.id, 'startDate', e.target.value)}
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          type="date"
                          value={toDateInputValue(plan.endDate)}
                          onChange={(e) => updatePlanField(plan.id, 'endDate', e.target.value)}
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          type="number"
                          min="0"
                          value={plan.estimatedBudget ?? ''}
                          onChange={(e) => updatePlanField(plan.id, 'estimatedBudget', e.target.value === '' ? null : Number(e.target.value))}
                          placeholder="Presupuesto estimado"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <input
                          type="number"
                          min="1"
                          value={plan.numberOfTravelers ?? ''}
                          onChange={(e) => updatePlanField(plan.id, 'numberOfTravelers', e.target.value === '' ? null : Number(e.target.value))}
                          placeholder="Numero de viajeros"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <textarea
                          value={plan.description || ''}
                          onChange={(e) => updatePlanField(plan.id, 'description', e.target.value)}
                          placeholder="Descripcion"
                          style={{ width: '100%', marginBottom: '0.5rem' }}
                        />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button
                            size="small"
                            variant="primary"
                            onClick={() => savePlan(plan)}
                            disabled={savingPlanId === plan.id}
                          >
                            {savingPlanId === plan.id ? 'Guardando...' : 'Guardar'}
                          </Button>
                          <Button size="small" variant="outline" onClick={() => setEditingPlanId(null)}>
                            Cancelar
                          </Button>
                        </div>
                      </>
                    ) : (
                      <>
                        <h4>{plan.title || 'Plan sin titulo'}</h4>
                        <p>{plan.destinationLocation || 'Destino no especificado'}</p>
                        <div className="trip-status">{plan.status || 'Planning'}</div>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <Button size="small" variant="outline" onClick={() => setEditingPlanId(plan.id)}>
                            Editar
                          </Button>
                          <Button
                            size="small"
                            variant="outline"
                            onClick={() => deletePlan(plan.id)}
                            disabled={deletingPlanId === plan.id}
                          >
                            {deletingPlanId === plan.id ? 'Borrando...' : 'Borrar'}
                          </Button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
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
