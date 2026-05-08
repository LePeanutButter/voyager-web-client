import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { travelPlanService } from '../../services/travelPlanService'
import { MapPin, Calendar, Users, DollarSign, ArrowLeft, Save, X } from 'lucide-react'
import ErrorBanner from '../../components/UI/ErrorBanner'
import './TravelPlanning.css'

const EDIT_BORDER = '1px solid var(--border-color)'
const EDIT_FORM_GROUP_COL = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
const EDIT_LABEL = { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }
const EDIT_INPUT = { 
  padding: '0.75rem', 
  borderRadius: 'var(--border-radius)', 
  border: EDIT_BORDER,
  backgroundColor: 'var(--surface-input)',
  color: 'var(--text-primary)'
}
const EDIT_INPUT_ICON = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
  borderRadius: 'var(--border-radius)',
  border: EDIT_BORDER,
  backgroundColor: 'var(--surface-input)',
  color: 'var(--text-primary)'
}
const EDIT_ICON_POS = { position: 'absolute', left: '0.75rem', top: '0.875rem', color: 'var(--text-muted)' }
const EDIT_CONTAINER = {
  backgroundColor: 'var(--surface-card)',
  border: EDIT_BORDER,
  borderRadius: 'var(--border-radius-lg)',
  padding: '2rem'
}

const EditTravelPlanPage = () => {
  const navigate = useNavigate()
  const { planId } = useParams()
  const { update, error, clearError } = useTravelPlans(true)
  const [loading, setLoading] = useState(false)
  const [fetchLoading, setFetchLoading] = useState(true)
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
  const [originalData, setOriginalData] = useState({})

  useEffect(() => {
    const fetchPlan = async () => {
      if (!planId) {
        navigate('/my-travels')
        return
      }

      try {
        setFetchLoading(true)
        const response = await travelPlanService.getById(planId)
        const planData = response.data || response
        
        const formattedData = {
          title: planData.title || '',
          description: planData.description || '',
          destinationLocation: planData.destinationLocation || '',
          originLocation: planData.originLocation || '',
          startDate: planData.startDate ? new Date(planData.startDate).toISOString().split('T')[0] : '',
          endDate: planData.endDate ? new Date(planData.endDate).toISOString().split('T')[0] : '',
          numberOfTravelers: planData.numberOfTravelers || '',
          estimatedBudget: planData.estimatedBudget || '',
        }
        
        setFormData(formattedData)
        setOriginalData(formattedData)
      } catch (err) {
        console.error('Error fetching travel plan:', err)
        navigate('/my-travels')
      } finally {
        setFetchLoading(false)
      }
    }

    fetchPlan()
  }, [planId, navigate])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!formData.title.trim()) {
      alert('El título es requerido')
      return
    }

    if (!formData.destinationLocation.trim()) {
      alert('El destino es requerido')
      return
    }

    if (formData.startDate && formData.endDate && new Date(formData.startDate) > new Date(formData.endDate)) {
      alert('La fecha de inicio no puede ser posterior a la fecha de fin')
      return
    }

    setLoading(true)
    try {
      const payload = {
        ...formData,
        numberOfTravelers: formData.numberOfTravelers ? Number(formData.numberOfTravelers) : null,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : null,
      }

      await travelPlanService.update(planId, payload)
      navigate(`/travel-details/${planId}`)
    } catch (err) {
      console.error('Error updating travel plan:', err)
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify(originalData)
  }

  const handleCancel = () => {
    if (hasChanges()) {
      if (confirm('¿Tienes cambios sin guardar. ¿Estás seguro de que quieres salir?')) {
        navigate(`/travel-details/${planId}`)
      }
    } else {
      navigate(`/travel-details/${planId}`)
    }
  }

  if (fetchLoading) {
    return (
      <div className="page-container">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <div className="spinner" />
          <p style={{ marginLeft: '1rem', color: 'var(--text-secondary)' }}>Cargando plan de viaje...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={handleCancel}
            className="btn-ghost"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
            title="Cancelar"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 style={{ margin: 0, color: 'var(--text-primary)' }}>Editar Plan de Viaje</h1>
            <p style={{ margin: '0.25rem 0 0', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
              Modifica los detalles de tu plan de viaje
            </p>
          </div>
        </div>
      </div>

      <ErrorBanner variant="error" message={error} onDismiss={clearError} />

      {/* Form */}
      <div style={EDIT_CONTAINER}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Title */}
          <div style={EDIT_FORM_GROUP_COL}>
            <label style={EDIT_LABEL}>Título del Viaje *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej: Aventura en Europa"
              style={EDIT_INPUT}
              required
            />
          </div>

          {/* Description */}
          <div style={EDIT_FORM_GROUP_COL}>
            <label style={EDIT_LABEL}>Descripción</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe tu plan de viaje..."
              rows={3}
              style={{ ...EDIT_INPUT, resize: 'vertical', minHeight: '80px' }}
            />
          </div>

          {/* Origin and Destination */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Origen</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={EDIT_ICON_POS} size={16} />
                <input
                  type="text"
                  name="originLocation"
                  value={formData.originLocation}
                  onChange={handleChange}
                  placeholder="Ciudad de origen"
                  style={EDIT_INPUT_ICON}
                />
              </div>
            </div>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Destino *</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={EDIT_ICON_POS} size={16} />
                <input
                  type="text"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={handleChange}
                  placeholder="Ciudad de destino"
                  style={EDIT_INPUT_ICON}
                  required
                />
              </div>
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Fecha de Inicio</label>
              <div style={{ position: 'relative' }}>
                <Calendar style={EDIT_ICON_POS} size={16} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  style={EDIT_INPUT_ICON}
                />
              </div>
            </div>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Fecha de Fin</label>
              <div style={{ position: 'relative' }}>
                <Calendar style={EDIT_ICON_POS} size={16} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  style={EDIT_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          {/* Travelers and Budget */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Número de Viajeros</label>
              <div style={{ position: 'relative' }}>
                <Users style={EDIT_ICON_POS} size={16} />
                <input
                  type="number"
                  name="numberOfTravelers"
                  value={formData.numberOfTravelers}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  style={EDIT_INPUT_ICON}
                />
              </div>
            </div>
            <div style={EDIT_FORM_GROUP_COL}>
              <label style={EDIT_LABEL}>Presupuesto Estimado (USD)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign style={EDIT_ICON_POS} size={16} />
                <input
                  type="number"
                  name="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  style={EDIT_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: EDIT_BORDER }}>
            <button
              type="button"
              onClick={handleCancel}
              className="btn-ghost"
              style={{ padding: '0.75rem 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <X size={16} />
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={loading || !hasChanges()}
              style={{ 
                padding: '0.75rem 1.5rem', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem',
                opacity: (!hasChanges() || loading) ? 0.6 : 1,
                cursor: (!hasChanges() || loading) ? 'not-allowed' : 'pointer'
              }}
            >
              <Save size={16} />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Info Box */}
      <div style={{ 
        marginTop: '1.5rem', 
        padding: '1rem', 
        backgroundColor: 'var(--surface-secondary)', 
        borderRadius: 'var(--border-radius)',
        border: EDIT_BORDER,
        fontSize: '0.875rem',
        color: 'var(--text-secondary)'
      }}>
        <p style={{ margin: 0 }}>
          <strong>Nota:</strong> Los campos marcados con * son obligatorios. Los cambios se guardarán automáticamente al presionar "Guardar Cambios".
        </p>
      </div>
    </div>
  )
}

export default EditTravelPlanPage
