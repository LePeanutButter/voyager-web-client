import { useState, useEffect } from 'react'
import { travelService } from '../../services/travelService'
import { MapPin, Calendar, DollarSign, X, Save } from 'lucide-react'

const QUICK_EDIT_BORDER = '1px solid var(--border-color)'
const QUICK_EDIT_FORM_GROUP = { display: 'flex', flexDirection: 'column', gap: '0.5rem' }
const QUICK_EDIT_LABEL = { fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }
const QUICK_EDIT_INPUT = { 
  padding: '0.75rem', 
  borderRadius: 'var(--border-radius)', 
  border: QUICK_EDIT_BORDER,
  backgroundColor: 'var(--surface-input)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem'
}
const QUICK_EDIT_INPUT_ICON = {
  width: '100%',
  padding: '0.75rem 0.75rem 0.75rem 2.25rem',
  borderRadius: 'var(--border-radius)',
  border: QUICK_EDIT_BORDER,
  backgroundColor: 'var(--surface-input)',
  color: 'var(--text-primary)',
  fontSize: '0.875rem'
}
const QUICK_EDIT_ICON_POS = { position: 'absolute', left: '0.75rem', top: '0.875rem', color: 'var(--text-muted)' }
const QUICK_EDIT_MODAL = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000
}
const QUICK_EDIT_CONTENT = {
  backgroundColor: 'var(--surface-card)',
  borderRadius: 'var(--border-radius-lg)',
  padding: '2rem',
  width: '90%',
  maxWidth: '500px',
  maxHeight: '90vh',
  overflowY: 'auto',
  border: QUICK_EDIT_BORDER
}

const QuickEditModal = ({ isOpen, onClose, planId, currentData, onUpdate }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    destinationLocation: '',
    originLocation: '',
    startDate: '',
    endDate: '',
    estimatedBudget: '',
    numberOfTravelers: ''
  })

  useEffect(() => {
    if (isOpen && currentData) {
      setFormData({
        destinationLocation: currentData.destinationLocation || '',
        originLocation: currentData.originLocation || '',
        startDate: currentData.startDate ? new Date(currentData.startDate).toISOString().split('T')[0] : '',
        endDate: currentData.endDate ? new Date(currentData.endDate).toISOString().split('T')[0] : '',
        estimatedBudget: currentData.estimatedBudget || '',
        numberOfTravelers: currentData.numberOfTravelers || ''
      })
    }
  }, [isOpen, currentData])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
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
        title: currentData?.title || '',
        ...formData,
        numberOfTravelers: formData.numberOfTravelers ? Number(formData.numberOfTravelers) : null,
        estimatedBudget: formData.estimatedBudget ? Number(formData.estimatedBudget) : null,
      }

      // Only include dates if they have values (backend requires non-null)
      if (formData.startDate) {
        payload.startDate = new Date(formData.startDate).toISOString()
      }
      if (formData.endDate) {
        payload.endDate = new Date(formData.endDate).toISOString()
      }

      console.log('Sending payload to backend:', payload)
      await travelService.update(planId, payload)
      onUpdate(payload)
      onClose()
    } catch (err) {
      console.error('Error updating travel plan:', err)
      alert('No se pudo actualizar el plan de viaje. Inténtalo de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  const hasChanges = () => {
    return JSON.stringify(formData) !== JSON.stringify({
      destinationLocation: currentData?.destinationLocation || '',
      originLocation: currentData?.originLocation || '',
      startDate: currentData?.startDate ? new Date(currentData.startDate).toISOString().split('T')[0] : '',
      endDate: currentData?.endDate ? new Date(currentData.endDate).toISOString().split('T')[0] : '',
      estimatedBudget: currentData?.estimatedBudget || '',
      numberOfTravelers: currentData?.numberOfTravelers || ''
    })
  }

  if (!isOpen) return null

  return (
    <div style={QUICK_EDIT_MODAL} onClick={onClose}>
      <div style={QUICK_EDIT_CONTENT} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '1.25rem' }}>
            Editar Detalles Rápidos
          </h2>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding: '0.5rem', display: 'flex', alignItems: 'center' }}
            title="Cerrar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Destination */}
          <div style={QUICK_EDIT_FORM_GROUP}>
            <label style={QUICK_EDIT_LABEL}>Destino *</label>
            <div style={{ position: 'relative' }}>
              <MapPin style={QUICK_EDIT_ICON_POS} size={16} />
              <input
                type="text"
                name="destinationLocation"
                value={formData.destinationLocation}
                onChange={handleChange}
                placeholder="Ciudad de destino"
                style={QUICK_EDIT_INPUT_ICON}
                required
              />
            </div>
          </div>

          {/* Origin */}
          <div style={QUICK_EDIT_FORM_GROUP}>
            <label style={QUICK_EDIT_LABEL}>Origen</label>
            <div style={{ position: 'relative' }}>
              <MapPin style={QUICK_EDIT_ICON_POS} size={16} />
              <input
                type="text"
                name="originLocation"
                value={formData.originLocation}
                onChange={handleChange}
                placeholder="Ciudad de origen"
                style={QUICK_EDIT_INPUT_ICON}
              />
            </div>
          </div>

          {/* Dates */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={QUICK_EDIT_FORM_GROUP}>
              <label style={QUICK_EDIT_LABEL}>Fecha Inicio</label>
              <div style={{ position: 'relative' }}>
                <Calendar style={QUICK_EDIT_ICON_POS} size={16} />
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleChange}
                  style={QUICK_EDIT_INPUT_ICON}
                />
              </div>
            </div>
            <div style={QUICK_EDIT_FORM_GROUP}>
              <label style={QUICK_EDIT_LABEL}>Fecha Fin</label>
              <div style={{ position: 'relative' }}>
                <Calendar style={QUICK_EDIT_ICON_POS} size={16} />
                <input
                  type="date"
                  name="endDate"
                  value={formData.endDate}
                  onChange={handleChange}
                  min={formData.startDate}
                  style={QUICK_EDIT_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          {/* Budget and Travelers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={QUICK_EDIT_FORM_GROUP}>
              <label style={QUICK_EDIT_LABEL}>Presupuesto (USD)</label>
              <div style={{ position: 'relative' }}>
                <DollarSign style={QUICK_EDIT_ICON_POS} size={16} />
                <input
                  type="number"
                  name="estimatedBudget"
                  value={formData.estimatedBudget}
                  onChange={handleChange}
                  placeholder="1000"
                  min="0"
                  step="0.01"
                  style={QUICK_EDIT_INPUT_ICON}
                />
              </div>
            </div>
            <div style={QUICK_EDIT_FORM_GROUP}>
              <label style={QUICK_EDIT_LABEL}>Viajeros</label>
              <div style={{ position: 'relative' }}>
                <MapPin style={QUICK_EDIT_ICON_POS} size={16} />
                <input
                  type="number"
                  name="numberOfTravelers"
                  value={formData.numberOfTravelers}
                  onChange={handleChange}
                  placeholder="1"
                  min="1"
                  style={QUICK_EDIT_INPUT_ICON}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            justifyContent: 'flex-end', 
            paddingTop: '1rem', 
            borderTop: QUICK_EDIT_BORDER 
          }}>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost"
              style={{ padding: '0.75rem 1.5rem' }}
            >
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
              {loading ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>

        {/* Info */}
        <div style={{ 
          marginTop: '1rem', 
          padding: '0.75rem', 
          backgroundColor: 'var(--surface-secondary)', 
          borderRadius: 'var(--border-radius)',
          fontSize: '0.8125rem',
          color: 'var(--text-secondary)'
        }}>
          <p style={{ margin: 0 }}>
            Solo puedes editar los campos básicos aquí. Para editar título o descripción, usa la página de edición completa.
          </p>
        </div>
      </div>
    </div>
  )
}

export default QuickEditModal
