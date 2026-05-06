import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { MapPin, Calendar, Users, DollarSign, ArrowLeft } from 'lucide-react'
import ErrorBanner from '../../components/UI/ErrorBanner'

const CP_BORDER = '1px solid var(--border-color)'
const CP_FORM_GROUP_COL = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
const CP_LABEL = { fontWeight: 600, fontSize: '0.875rem' }
const CP_INPUT = { padding: '0.75rem', borderRadius: 'var(--border-radius)', border: CP_BORDER }
const CP_INPUT_ICON = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
  borderRadius: 'var(--border-radius)',
  border: CP_BORDER,
}
const CP_ICON_POS = { position: 'absolute', left: '0.75rem', top: '0.875rem', color: 'var(--text-muted)' }

const CreateTravelPlanPage = () => {
  const navigate = useNavigate()
  const { add, error, clearError } = useTravelPlans()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationLocation: '',
    originLocation: '',
    startDate: '',
    endDate: '',
    numberOfTravelers: '',
    estimatedBudget: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearError()

    try {
      const payload = {
        ...formData,
        numberOfTravelers: formData.numberOfTravelers ? Number(formData.numberOfTravelers) : undefined,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : undefined,
      }
      
      const newPlan = await add(payload)
      navigate(`/travel-plans/${newPlan.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <button className="btn-back" onClick={() => navigate('/my-travels')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to My Travels
      </button>

      <div style={{ background: 'var(--surface-card)', padding: '2rem', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Create Travel Plan</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Plan your next big adventure.</p>

        <ErrorBanner variant="error" message={error} onDismiss={clearError} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div className="form-group" style={CP_FORM_GROUP_COL}>
            <label htmlFor="title" style={CP_LABEL}>Title *</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="E.g., Summer in Paris"
              required
              style={CP_INPUT}
            />
          </div>

          <div className="form-group" style={CP_FORM_GROUP_COL}>
            <label htmlFor="description" style={CP_LABEL}>Description</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="What's the vibe?"
              rows={3}
              style={CP_INPUT}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="originLocation" style={CP_LABEL}>Origin</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={CP_ICON_POS} />
                <input
                  id="originLocation"
                  name="originLocation"
                  value={formData.originLocation}
                  onChange={handleChange}
                  placeholder="Your city"
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="destinationLocation" style={CP_LABEL}>Destination *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={CP_ICON_POS} />
                <input
                  id="destinationLocation"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={handleChange}
                  placeholder="Where to?"
                  required
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="startDate" style={CP_LABEL}>Start Date *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={CP_ICON_POS} />
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="endDate" style={CP_LABEL}>End Date *</label>
              <div style={{ position: 'relative' }}>
                <Calendar size={16} style={CP_ICON_POS} />
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="numberOfTravelers" style={CP_LABEL}>Travelers</label>
              <div style={{ position: 'relative' }}>
                <Users size={16} style={CP_ICON_POS} />
                <input
                  type="number"
                  min="1"
                  id="numberOfTravelers"
                  name="numberOfTravelers"
                  value={formData.numberOfTravelers}
                  onChange={handleChange}
                  placeholder="2"
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="estimatedBudget" style={CP_LABEL}>Budget ($)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign size={16} style={CP_ICON_POS} />
                <input
                  type="number"
                  min="0"
                  step="100"
                  id="estimatedBudget"
                  name="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                  placeholder="2000"
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" disabled={loading} style={{ marginTop: '1rem' }}>
            {loading ? 'Creating...' : 'Create Plan'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateTravelPlanPage
