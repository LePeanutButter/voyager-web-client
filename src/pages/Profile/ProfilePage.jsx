import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import { usersService } from '../../services/usersService'

const safeJsonParse = (value) => {
  try {
    return JSON.parse(value)
  } catch {
    return null
  }
}

const decodeJwtPayload = (token) => {
  try {
    const payloadPart = token.split('.')[1]
    if (!payloadPart) return null
    const normalized = payloadPart.replace(/-/g, '+').replace(/_/g, '/')
    const padded = normalized.padEnd(normalized.length + ((4 - (normalized.length % 4)) % 4), '=')
    return safeJsonParse(atob(padded))
  } catch {
    return null
  }
}

const chipStyle = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: '0.5rem',
  padding: '0.35rem 0.6rem',
  borderRadius: '999px',
  border: '1px solid var(--border-color, #e9ecef)',
  background: 'var(--card-bg, #fff)',
  fontSize: '0.85rem'
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

const ProfilePage = () => {
  const { user, token: ctxToken, login } = useAuth()

  const token = ctxToken || localStorage.getItem('smartrip_token') || localStorage.getItem('token')

  const userId = useMemo(() => {
    if (user?.id) return user.id
    const stored = safeJsonParse(localStorage.getItem('userData') || '')
    if (stored?.id) return stored.id
    if (token) {
      const payload = decodeJwtPayload(token)
      return payload?.userId || payload?.sub || payload?.id || null
    }
    return null
  }, [user?.id, token])

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    bio: '',
    phoneNumber: '',
    interests: []
  })
  const [interestInput, setInterestInput] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!userId) return
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const res = await usersService.getUserById(userId)
        const data = res?.data || res
        setFormData({
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          bio: data?.bio || '',
          phoneNumber: data?.phoneNumber || '',
          interests: Array.isArray(data?.interests) ? data.interests : []
        })

        if (token) {
          const mergedUser = { ...(user || {}), ...(data || {}) }
          localStorage.setItem('userData', JSON.stringify(mergedUser))
          await login(mergedUser, token)
        }
      } catch (err) {
        setError(err?.message || 'No se pudo cargar el perfil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userId, token, login, user])

  const setValue = (name, value) => {
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validate = () => {
    const next = {}
    if (!formData.firstName.trim()) next.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) next.lastName = 'El apellido es requerido'
    if (!formData.bio.trim()) next.bio = 'La biografía es requerida'
    if (formData.bio && formData.bio.length > 500) next.bio = 'Máximo 500 caracteres'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const addInterest = () => {
    const value = interestInput.trim()
    if (!value) return
    setFormData((prev) => ({
      ...prev,
      interests: prev.interests.includes(value) ? prev.interests : [...prev.interests, value]
    }))
    setInterestInput('')
  }

  const removeInterest = (value) => {
    setFormData((prev) => ({ ...prev, interests: prev.interests.filter((i) => i !== value) }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    if (!userId) {
      setError('No se pudo determinar el usuario autenticado.')
      return
    }
    if (!validate()) return

    setSaving(true)
    setError('')
    setSuccess('')
    try {
      const payload = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        bio: formData.bio.trim(),
        phoneNumber: formData.phoneNumber?.trim() || undefined,
        interests: formData.interests
      }
      const res = await usersService.updateUserById(userId, payload)
      const data = res?.data || res
      setSuccess('Perfil guardado correctamente.')

      if (token) {
        const mergedUser = { ...(user || {}), ...(data || {}), ...payload, id: userId }
        localStorage.setItem('userData', JSON.stringify(mergedUser))
        await login(mergedUser, token)
      }
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ margin: '0 0 1rem 0' }}>Perfil</h1>

      <Card title="Perfil de viajero">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando…</p>
          </div>
        ) : (
          <form onSubmit={handleSave} style={{ display: 'grid', gap: '1rem' }}>
            <div>
              <label>Nombre *</label>
              <input
                style={inputStyle}
                value={formData.firstName}
                onChange={(e) => setValue('firstName', e.target.value)}
              />
              {fieldErrors.firstName && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.firstName}</div>}
            </div>

            <div>
              <label>Apellido *</label>
              <input
                style={inputStyle}
                value={formData.lastName}
                onChange={(e) => setValue('lastName', e.target.value)}
              />
              {fieldErrors.lastName && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.lastName}</div>}
            </div>

            <div>
              <label>Biografía *</label>
              <textarea
                style={{ ...inputStyle, minHeight: '120px' }}
                value={formData.bio}
                onChange={(e) => setValue('bio', e.target.value)}
                maxLength={500}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#6c757d' }}>
                <span>{fieldErrors.bio ? <span style={{ color: '#dc3545' }}>{fieldErrors.bio}</span> : '\u00A0'}</span>
                <span>{formData.bio.length}/500</span>
              </div>
            </div>

            <div>
              <label>Teléfono (opcional)</label>
              <input
                style={inputStyle}
                value={formData.phoneNumber}
                onChange={(e) => setValue('phoneNumber', e.target.value)}
              />
            </div>

            <div>
              <label>Intereses</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  style={inputStyle}
                  value={interestInput}
                  onChange={(e) => setInterestInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addInterest()
                    }
                  }}
                  placeholder="Escribe un interés y presiona Enter"
                />
                <Button type="button" variant="outline" onClick={addInterest}>
                  Agregar
                </Button>
              </div>
              <div style={{ marginTop: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {formData.interests.map((i) => (
                  <span key={i} style={chipStyle}>
                    {i}
                    <button
                      type="button"
                      onClick={() => removeInterest(i)}
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer', fontSize: '1rem' }}
                      aria-label={`Eliminar ${i}`}
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {error && <div style={errorStyle}>{error}</div>}
            {success && <div style={successStyle}>{success}</div>}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" loading={saving}>
                Guardar
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  )
}

export default ProfilePage

