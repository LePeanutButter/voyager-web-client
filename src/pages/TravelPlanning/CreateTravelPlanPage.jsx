import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { travelPlanService } from '../../services/travelPlanService'

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

const toLocalDateTime = (date, endOfDay = false) => {
  if (!date) return undefined
  return `${date}${endOfDay ? 'T23:59:59' : 'T00:00:00'}`
}

const inputStyle = {
  width: '100%',
  padding: '0.75rem 1rem',
  border: '1px solid var(--border-color, #e9ecef)',
  borderRadius: '8px',
  outline: 'none'
}

const errorStyle = {
  padding: '0.75rem',
  background: '#f8d7da',
  color: '#721c24',
  border: '1px solid #f5c6cb',
  borderRadius: '8px',
  fontSize: '0.875rem'
}

const successStyle = {
  padding: '0.75rem',
  background: '#d1e7dd',
  color: '#0f5132',
  border: '1px solid #badbcc',
  borderRadius: '8px',
  fontSize: '0.875rem'
}

const CreateTravelPlanPage = () => {
  const [formData, setFormData] = useState({
    title: '',
    destinationLocation: '',
    originLocation: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    numberOfTravelers: 1,
    description: ''
  })
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const setValue = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validate = () => {
    const next = {}
    if (!formData.title.trim()) next.title = 'El título es requerido'
    if (!formData.destinationLocation.trim()) next.destinationLocation = 'El destino es requerido'
    if (!formData.startDate) next.startDate = 'La fecha de inicio es requerida'
    if (!formData.endDate) next.endDate = 'La fecha de fin es requerida'

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate)
      const end = new Date(formData.endDate)
      if (end < start) next.endDate = 'El rango de fechas es inválido'
    }

    const travelers = Number(formData.numberOfTravelers)
    if (!Number.isFinite(travelers) || travelers < 1) next.numberOfTravelers = 'Mínimo 1 viajero'

    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        title: formData.title.trim(),
        destinationLocation: formData.destinationLocation.trim(),
        originLocation: formData.originLocation?.trim() || undefined,
        startDate: toLocalDateTime(formData.startDate, false),
        endDate: toLocalDateTime(formData.endDate, true),
        estimatedBudget: formData.estimatedBudget === '' ? undefined : Number(formData.estimatedBudget),
        numberOfTravelers: Number(formData.numberOfTravelers),
        description: formData.description?.trim() || undefined
      }

      const created = await travelPlanService.create(payload)
      const createdPlan = created?.data || created
      localStorage.setItem('last_created_travel_plan', JSON.stringify(createdPlan))
      try {
        const plansKey = getPlansStorageKey()
        const previous = JSON.parse(localStorage.getItem(plansKey) || '[]')
        const next = Array.isArray(previous) ? [createdPlan, ...previous] : [createdPlan]
        localStorage.setItem(plansKey, JSON.stringify(next))
      } catch {
        localStorage.setItem(getPlansStorageKey(), JSON.stringify([createdPlan]))
      }
      setSuccess('Plan de viaje creado. Redirigiendo…')
      setTimeout(() => navigate('/travel-planning', { replace: true }), 900)
    } catch (err) {
      setError(err?.message || 'No se pudo crear el plan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ margin: '0 0 1rem 0' }}>Crear plan de viaje</h1>

      <Card title="Nuevo plan">
        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '1rem' }}>
          <div>
            <label htmlFor="travel-plan-title">Título *</label>
            <input
              id="travel-plan-title"
              style={inputStyle}
              value={formData.title}
              onChange={(e) => setValue('title', e.target.value)}
            />
            {fieldErrors.title && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.title}</div>}
          </div>

          <div>
            <label htmlFor="travel-plan-destination">Destino *</label>
            <input
              id="travel-plan-destination"
              style={inputStyle}
              value={formData.destinationLocation}
              onChange={(e) => setValue('destinationLocation', e.target.value)}
            />
            {fieldErrors.destinationLocation && (
              <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.destinationLocation}</div>
            )}
          </div>

          <div>
            <label htmlFor="travel-plan-origin">Origen (opcional)</label>
            <input
              id="travel-plan-origin"
              style={inputStyle}
              value={formData.originLocation}
              onChange={(e) => setValue('originLocation', e.target.value)}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="travel-plan-start-date">Fecha de inicio *</label>
              <input
                id="travel-plan-start-date"
                style={inputStyle}
                type="date"
                value={formData.startDate}
                onChange={(e) => setValue('startDate', e.target.value)}
              />
              {fieldErrors.startDate && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.startDate}</div>}
            </div>
            <div>
              <label htmlFor="travel-plan-end-date">Fecha de fin *</label>
              <input
                id="travel-plan-end-date"
                style={inputStyle}
                type="date"
                value={formData.endDate}
                onChange={(e) => setValue('endDate', e.target.value)}
              />
              {fieldErrors.endDate && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.endDate}</div>}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label htmlFor="travel-plan-estimated-budget">Presupuesto estimado (opcional)</label>
              <input
                id="travel-plan-estimated-budget"
                style={inputStyle}
                type="number"
                value={formData.estimatedBudget}
                onChange={(e) => setValue('estimatedBudget', e.target.value)}
                min="0"
              />
            </div>
            <div>
              <label htmlFor="travel-plan-travelers">Número de viajeros *</label>
              <input
                id="travel-plan-travelers"
                style={inputStyle}
                type="number"
                value={formData.numberOfTravelers}
                onChange={(e) => setValue('numberOfTravelers', e.target.value)}
                min="1"
              />
              {fieldErrors.numberOfTravelers && (
                <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.numberOfTravelers}</div>
              )}
            </div>
          </div>

          <div>
            <label htmlFor="travel-plan-description">Descripción (opcional)</label>
            <textarea
              id="travel-plan-description"
              style={{ ...inputStyle, minHeight: '120px' }}
              value={formData.description}
              onChange={(e) => setValue('description', e.target.value)}
            />
          </div>

          {error && <div style={errorStyle}>{error}</div>}
          {success && <div style={successStyle}>{success}</div>}

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="primary" loading={loading}>
              Crear
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}

export default CreateTravelPlanPage

