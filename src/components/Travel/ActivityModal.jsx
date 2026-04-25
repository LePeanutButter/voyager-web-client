import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Button from '../UI/Button'
import './ActivityModal.css'

const emptyForm = {
  name: '',
  description: '',
  startTime: '',
  endTime: '',
  location: ''
}

const ActivityModal = ({ isOpen, mode = 'create', initialData = null, onClose, onSubmit, loading = false }) => {
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) return
    if (initialData) {
      setForm({
        name: initialData.name ?? '',
        description: initialData.description ?? '',
        startTime: (initialData.startTime ?? '').slice(0, 16),
        endTime: (initialData.endTime ?? '').slice(0, 16),
        location: initialData.location ?? ''
      })
      return
    }
    setForm(emptyForm)
  }, [isOpen, initialData])

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!form.name.trim()) {
      setError('El titulo es obligatorio')
      return
    }

    if (!form.startTime || !form.endTime) {
      setError('La fecha/hora de inicio y fin son obligatorias')
      return
    }

    if (new Date(form.endTime) < new Date(form.startTime)) {
      setError('endTime no puede ser menor que startTime')
      return
    }

    onSubmit({
      ...form,
      name: form.name.trim(),
      description: form.description.trim()
    })
  }

  return (
    <div className="activity-modal-overlay">
      <dialog className="activity-modal" open>
        <h3>{mode === 'edit' ? 'Editar actividad' : 'Nueva actividad'}</h3>
        <form onSubmit={handleSubmit}>
          <label htmlFor="activity-name">Titulo</label>
          <input
            id="activity-name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            placeholder="Ej. Museo del Louvre"
          />

          <label htmlFor="activity-description">Descripcion</label>
          <textarea
            id="activity-description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            rows={3}
          />

          <label htmlFor="activity-start-time">Inicio</label>
          <input
            id="activity-start-time"
            type="datetime-local"
            value={form.startTime}
            onChange={(e) => setForm((prev) => ({ ...prev, startTime: e.target.value }))}
          />

          <label htmlFor="activity-end-time">Fin</label>
          <input
            id="activity-end-time"
            type="datetime-local"
            value={form.endTime}
            onChange={(e) => setForm((prev) => ({ ...prev, endTime: e.target.value }))}
          />

          <label htmlFor="activity-location">Ubicacion</label>
          <input
            id="activity-location"
            value={form.location}
            onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))}
            placeholder="Direccion o punto de encuentro"
          />

          {error && <p className="activity-modal-error">{error}</p>}

          <div className="activity-modal-actions">
            <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button type="submit" loading={loading}>{mode === 'edit' ? 'Guardar cambios' : 'Crear actividad'}</Button>
          </div>
        </form>
      </dialog>
    </div>
  )
}

ActivityModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['create', 'edit']),
  initialData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    description: PropTypes.string,
    startTime: PropTypes.string,
    endTime: PropTypes.string,
    location: PropTypes.string
  }),
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool
}

export default ActivityModal
