import { useMemo, useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTravelPlans } from '../../hooks/useTravelPlans'
import { travelService } from '../../services/travelService'
import { MapPin, Calendar, Users, Banknote, ArrowLeft } from 'lucide-react'
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
  boxSizing: 'border-box',
}
const CP_ICON_POS = { position: 'absolute', left: '0.75rem', top: '0.875rem', color: 'var(--text-muted)' }
const CP_TEXTAREA = {
  ...CP_INPUT,
  resize: 'vertical',
  maxWidth: '100%',
  width: '100%',
  minHeight: '5.5rem',
  boxSizing: 'border-box',
}

/** Coincide con TEXT en backend; límite UI razonable */
const DESCRIPTION_MAX_LEN = 2000
const COP_MIN = 50_000
const COP_STEP = 50

const copFormatter = new Intl.NumberFormat('es-CO', {
  style: 'currency',
  currency: 'COP',
  maximumFractionDigits: 0,
})

function roundCop(n) {
  if (!Number.isFinite(n)) return COP_MIN
  const r = Math.round(n / COP_STEP) * COP_STEP
  return Math.max(COP_MIN, r)
}

function digitsOnly(s) {
  return String(s ?? '').replace(/\D/g, '')
}

const CreateTravelPlanPage = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const exploreSeedAppliedRef = useRef(null)
  const {
    create: add,
    error,
    clearError,
    plans,
    loading: plansLoading,
  } = useTravelPlans(true)
  const [loading, setLoading] = useState(false)
  const [localError, setLocalError] = useState(null)
  const [selectedTemplateId, setSelectedTemplateId] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationLocation: '',
    originLocation: '',
    startDate: '',
    endDate: '',
    numberOfTravelers: '1',
    estimatedBudget: '',
  })

  useEffect(() => {
    const seed = location.state?.exploreSeed
    if (!seed) return
    if (exploreSeedAppliedRef.current === location.key) return
    exploreSeedAppliedRef.current = location.key
    setFormData((prev) => {
      const dest = String(seed.destinationLocation || '').trim()
      const actName = String(seed.activityName || '').trim()
      const actDesc = String(seed.activityDescription || '').trim()
      let catalogLine = ''
      if (actName || actDesc) {
        const namePart = actName || 'Actividad'
        const descSuffix = actDesc ? ` — ${actDesc}` : ''
        catalogLine = `Idea del catálogo: ${namePart}${descSuffix}`
      }
      const mergedDesc = [prev.description.trim(), catalogLine].filter(Boolean).join('\n\n')
      const shortDest = dest ? dest.split(',')[0].trim() : ''
      return {
        ...prev,
        destinationLocation: dest || prev.destinationLocation,
        title: prev.title.trim() || (shortDest ? `Viaje a ${shortDest}` : prev.title),
        description: mergedDesc.slice(0, DESCRIPTION_MAX_LEN),
      }
    })
  }, [location.key, location.state])

  const budgetPreview = useMemo(() => {
    const n = Number(formData.estimatedBudget)
    if (!formData.estimatedBudget || !Number.isFinite(n) || n <= 0) return null
    return copFormatter.format(roundCop(n))
  }, [formData.estimatedBudget])

  const handleChange = (e) => {
    const { name, value } = e.target
    setLocalError(null)
    if (name === 'description') {
      setFormData((prev) => ({
        ...prev,
        description: value.slice(0, DESCRIPTION_MAX_LEN),
      }))
      return
    }
    if (name === 'numberOfTravelers') {
      const d = digitsOnly(value).replace(/^0+(?=\d)/, '')
      setFormData((prev) => ({ ...prev, numberOfTravelers: d }))
      return
    }
    if (name === 'estimatedBudget') {
      setFormData((prev) => ({ ...prev, estimatedBudget: digitsOnly(value) }))
      return
    }
    if (name === 'startDate') {
      setFormData((prev) => {
        const next = { ...prev, startDate: value }
        if (prev.endDate && value && prev.endDate < value) {
          next.endDate = value
        }
        return next
      })
      return
    }
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
    const tplBudget = template.estimatedBudget
    const budgetStr =
      tplBudget !== null && tplBudget !== undefined
        ? String(roundCop(Number(tplBudget)))
        : ''
    setFormData((prev) => ({
      ...prev,
      title: template.title || prev.title,
      description: (template.description || prev.description).slice(0, DESCRIPTION_MAX_LEN),
      destinationLocation: template.destinationLocation || prev.destinationLocation,
      originLocation: template.originLocation || prev.originLocation,
      startDate: template.startDate ? String(template.startDate).slice(0, 10) : prev.startDate,
      endDate: template.endDate ? String(template.endDate).slice(0, 10) : prev.endDate,
      numberOfTravelers:
        template.numberOfTravelers !== null && template.numberOfTravelers !== undefined
          ? String(Math.max(1, Number(template.numberOfTravelers)))
          : prev.numberOfTravelers,
      estimatedBudget: budgetStr,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    clearError()
    setLocalError(null)

    const rawBudget = formData.estimatedBudget ? Number(formData.estimatedBudget) : 0
    if (!rawBudget || rawBudget < COP_MIN) {
      setLocalError(
        `Indica un presupuesto minimo de ${copFormatter.format(COP_MIN)} (solo numeros, multiples de $${COP_STEP.toLocaleString('es-CO')}).`
      )
      setLoading(false)
      return
    }
    const budget = roundCop(rawBudget)

    const travelers = formData.numberOfTravelers
      ? Math.max(1, Number.parseInt(formData.numberOfTravelers, 10) || 1)
      : 1

    try {
      const payload = {
        ...formData,
        startDate: formData.startDate ? `${formData.startDate}T00:00:00` : undefined,
        endDate: formData.endDate ? `${formData.endDate}T23:59:59` : undefined,
        numberOfTravelers: travelers,
        estimatedBudget: budget,
      }

      const newPlan = await add(payload)

      await travelService.updateStatus(newPlan.id, 'ACTIVE')

      navigate(`/travel-plans/${newPlan.id}`)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const descLen = formData.description.length

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <button className="btn-back" onClick={() => navigate('/my-travels')} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Volver a Mis Viajes
      </button>

      <div style={{ background: 'var(--surface-card)', padding: '2rem', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 800 }}>Crear plan de viaje</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Planea tu proxima gran aventura.</p>

        <ErrorBanner variant="error" message={error || localError} onDismiss={() => { clearError(); setLocalError(null) }} />

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
              style={{ ...CP_INPUT, boxSizing: 'border-box', maxWidth: '100%' }}
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
              style={CP_TEXTAREA}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {descLen} / {DESCRIPTION_MAX_LEN} caracteres
            </span>
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
                  min={formData.startDate || undefined}
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
                  inputMode="numeric"
                  pattern="[0-9]*"
                  id="numberOfTravelers"
                  name="numberOfTravelers"
                  value={formData.numberOfTravelers}
                  onChange={handleChange}
                  placeholder="1"
                  style={CP_INPUT_ICON}
                />
              </div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Solo numeros (minimo 1)</span>
            </div>
            <div className="form-group" style={CP_FORM_GROUP_COL}>
              <label htmlFor="estimatedBudget" style={CP_LABEL}>Presupuesto estimado (COP) *</label>
              <div style={{ position: 'relative' }}>
                <Banknote size={16} style={CP_ICON_POS} />
                <input
                  inputMode="numeric"
                  id="estimatedBudget"
                  name="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                  placeholder="3000000"
                  required
                  style={CP_INPUT_ICON}
                  aria-describedby="budget-hint"
                />
              </div>
              <span id="budget-hint" style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                Minimo {copFormatter.format(COP_MIN)}, solo multiplos de ${COP_STEP.toLocaleString('es-CO')}. Sin puntos ni comas.
                {budgetPreview ? (
                  <> Valor ajustado: <strong>{budgetPreview}</strong></>
                ) : null}
              </span>
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
