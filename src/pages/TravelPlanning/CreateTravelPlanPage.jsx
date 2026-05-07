import { useMemo, useState } from 'react'
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
  const {
    create: add,
    error,
    clearError,
    plans,
    loading: plansLoading,
  } = useTravelPlans(true)
  const [loading, setLoading] = useState(false)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
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

  const existingPlans = useMemo(
    () => plans.filter((plan) => plan?.id != null),
    [plans]
  )

  let templatePlaceholder = 'Selecciona un plan'
  if (plansLoading) templatePlaceholder = 'Cargando planes...'
  else if (existingPlans.length === 0) templatePlaceholder = 'No hay planes disponibles'

  const applyTemplate = () => {
    if (!selectedTemplateId) return
    const template = existingPlans.find((p) => String(p.id) === selectedTemplateId)
    if (!template) return
    setFormData((prev) => ({
      ...prev,
      title: template.title || prev.title,
      description: template.description || prev.description,
      destinationLocation: template.destinationLocation || prev.destinationLocation,
      originLocation: template.originLocation || prev.originLocation,
      startDate: template.startDate ? String(template.startDate).slice(0, 10) : prev.startDate,
      endDate: template.endDate ? String(template.endDate).slice(0, 10) : prev.endDate,
      numberOfTravelers:
        template.numberOfTravelers !== null && template.numberOfTravelers !== undefined
          ? String(template.numberOfTravelers)
          : prev.numberOfTravelers,
      estimatedBudget:
        template.estimatedBudget !== null && template.estimatedBudget !== undefined
          ? String(template.estimatedBudget)
          : prev.estimatedBudget,
    }))
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
        <ArrowLeft size={16} /> Volver a Mis Viajes
      </button>

      <div style={{ background: 'var(--surface-card)', padding: '2rem', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Crear plan de viaje</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Planea tu proxima gran aventura.</p>

        <ErrorBanner variant="error" message={error} onDismiss={clearError} />

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          <div style={{ border: CP_BORDER, borderRadius: 'var(--border-radius)', padding: '1rem', background: 'var(--surface-bg)' }}>
            <label htmlFor="plan-template" style={{ ...CP_LABEL, marginBottom: '0.5rem', display: 'block' }}>
              Usar un plan existente como base
            </label>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <select
                id="plan-template"
                value={selectedTemplateId}
                onChange={(e) => setSelectedTemplateId(e.target.value)}
                style={{ ...CP_INPUT, flex: 1 }}
                disabled={plansLoading || existingPlans.length === 0}
              >
                <option value="">
                  {templatePlaceholder}
                </option>
                {existingPlans.map((plan) => (
                  <option key={plan.id} value={String(plan.id)}>
                    {plan.title || `Plan ${plan.id}`}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="btn-outline-sm"
                onClick={applyTemplate}
                disabled={!selectedTemplateId}
              >
                Cargar
              </button>
            </div>
          </div>

          <div className="form-group" style={CP_FORM_GROUP_COL}>
            <label htmlFor="title" style={CP_LABEL}>Titulo *</label>
            <input
              id="title"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Ej.: Verano en Paris"
              required
              style={CP_INPUT}
            />
          </div>

          <div className="form-group" style={CP_FORM_GROUP_COL}>
            <label htmlFor="description" style={CP_LABEL}>Descripcion</label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="¿Cual es el estilo del viaje?"
              rows={3}
              style={CP_INPUT}
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="originLocation" style={CP_LABEL}>Origen</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={CP_ICON_POS} />
                <input
                  id="originLocation"
                  name="originLocation"
                  value={formData.originLocation}
                  onChange={handleChange}
                  placeholder="Tu ciudad"
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="destinationLocation" style={CP_LABEL}>Destino *</label>
              <div style={{ position: 'relative' }}>
                <MapPin size={16} style={CP_ICON_POS} />
                <input
                  id="destinationLocation"
                  name="destinationLocation"
                  value={formData.destinationLocation}
                  onChange={handleChange}
                  placeholder="¿A donde vas?"
                  required
                  style={CP_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="startDate" style={CP_LABEL}>Fecha de inicio *</label>
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
              <label htmlFor="endDate" style={CP_LABEL}>Fecha de fin *</label>
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
              <label htmlFor="numberOfTravelers" style={CP_LABEL}>Viajeros</label>
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
              <label htmlFor="estimatedBudget" style={CP_LABEL}>Presupuesto ($)</label>
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
            {loading ? 'Creando...' : 'Crear plan'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default CreateTravelPlanPage
