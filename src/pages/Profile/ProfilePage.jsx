import React, { useEffect, useMemo, useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import { usersService } from '../../services/usersService'
import { decodeJwtPayload, getNumericId, safeJsonParse } from '../../utils/jwt'

const pickUserObject = (raw) => {
  if (!raw) return null
  if (Array.isArray(raw)) return raw[0] || null
  if (Array.isArray(raw?.content)) return raw.content[0] || null
  if (Array.isArray(raw?.data)) return raw.data[0] || null
  return raw?.data || raw
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
  const { user, token: ctxToken } = useAuth()

  const token = ctxToken || localStorage.getItem('smartrip_token') || localStorage.getItem('token')

  const userId = useMemo(() => {
    const fromUser = getNumericId(user?.id)
    if (fromUser) return fromUser

    const stored = safeJsonParse(localStorage.getItem('userData') || '')
    const fromStorage = getNumericId(stored?.id)
    if (fromStorage) return fromStorage

    if (token) {
      const payload = decodeJwtPayload(token)
      return getNumericId(payload?.userId) ?? getNumericId(payload?.id) ?? null
    }
    return null
  }, [user?.id, token])
  const [resolvedUserId, setResolvedUserId] = useState(userId)

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
    setResolvedUserId(userId)
  }, [userId])

  useEffect(() => {
    const resolveFromIdentity = async () => {
      if (resolvedUserId) return
      if (!token) return

      setLoading(true)
      setError('')
      try {
        const payload = decodeJwtPayload(token) || {}
        const username = payload?.username || payload?.preferred_username || payload?.sub || user?.username
        const email = payload?.email || user?.email

        let foundUser = null

        if (username) {
          try {
            const byUsername = await usersService.getUserByUsername(username)
            foundUser = pickUserObject(byUsername)
          } catch {
            // keep trying
          }
        }

        if (!foundUser && email) {
          try {
            const byEmail = await usersService.getUserByEmail(email)
            foundUser = pickUserObject(byEmail)
          } catch {
            // keep trying
          }
        }

        const numericId = getNumericId(foundUser?.id)
        if (!numericId) {
          setError('No se pudo resolver tu userId para perfil. El backend debe incluir userId/id numérico en JWT o exponer endpoint para usuario actual.')
          return
        }

        setResolvedUserId(numericId)
        const mergedUser = { ...(user || {}), ...(foundUser || {}), id: numericId }
        localStorage.setItem('userData', JSON.stringify(mergedUser))
      } catch {
        setError('No se pudo resolver tu userId para perfil. El backend debe incluir userId/id numérico en JWT o exponer endpoint para usuario actual.')
      } finally {
        setLoading(false)
      }
    }

    resolveFromIdentity()
  }, [resolvedUserId, token, user?.username, user?.email])

  useEffect(() => {
    const load = async () => {
      if (!resolvedUserId) {
        return
      }
      setLoading(true)
      setError('')
      setSuccess('')
      try {
        const res = await usersService.getUserById(resolvedUserId)
        const data = res?.data || res
        setFormData({
          firstName: data?.firstName || '',
          lastName: data?.lastName || '',
          bio: data?.bio || '',
          phoneNumber: data?.phoneNumber || '',
          interests: Array.isArray(data?.interests) ? data.interests : []
        })

        const mergedUser = { ...(user || {}), ...(data || {}), id: resolvedUserId }
        localStorage.setItem('userData', JSON.stringify(mergedUser))
      } catch (err) {
        setError(err?.message || 'No se pudo cargar el perfil')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [resolvedUserId])

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
    if (!resolvedUserId) {
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
      const res = await usersService.updateUserById(resolvedUserId, payload)
      const data = res?.data || res
      setSuccess('Perfil guardado correctamente.')

      const mergedUser = { ...(user || {}), ...(data || {}), ...payload, id: resolvedUserId }
      localStorage.setItem('userData', JSON.stringify(mergedUser))
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
              <label htmlFor="profile-first-name">Nombre *</label>
              <input
                id="profile-first-name"
                style={inputStyle}
                value={formData.firstName}
                onChange={(e) => setValue('firstName', e.target.value)}
              />
              {fieldErrors.firstName && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.firstName}</div>}
            </div>

            <div>
              <label htmlFor="profile-last-name">Apellido *</label>
              <input
                id="profile-last-name"
                style={inputStyle}
                value={formData.lastName}
                onChange={(e) => setValue('lastName', e.target.value)}
              />
              {fieldErrors.lastName && <div style={{ color: '#dc3545', fontSize: '0.8rem' }}>{fieldErrors.lastName}</div>}
            </div>

            <div>
              <label htmlFor="profile-bio">Biografía *</label>
              <textarea
                id="profile-bio"
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
              <label htmlFor="profile-phone-number">Teléfono (opcional)</label>
              <input
                id="profile-phone-number"
                style={inputStyle}
                value={formData.phoneNumber}
                onChange={(e) => setValue('phoneNumber', e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="profile-interest-input">Intereses</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input
                  id="profile-interest-input"
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

