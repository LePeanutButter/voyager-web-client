import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import { usersService } from '../../services/usersService'
import { decodeJwtPayload, getNumericId, safeJsonParse } from '../../utils/jwt'
import { useBehaviorAnalysis } from '../../hooks/useBehaviorAnalysis.js'
import { trackUserBehavior, InteractionType } from '../../services/behaviorAnalysisService.js'

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

const mergeDefined = (...objects) => Object.assign({}, ...objects.filter(Boolean))

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
  
  // Behavior analysis state
  const [showBehaviorAnalysis, setShowBehaviorAnalysis] = useState(false)
  const {
    summary,
    patterns,
    preferenceUpdate,
    loading: behaviorLoading,
    error: behaviorError,
    loadSummary,
    analyzeBehavior,
    clearError: clearBehaviorError
  } = useBehaviorAnalysis()

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
        const payload = decodeJwtPayload(token)
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
        const mergedUser = mergeDefined(user, foundUser, { id: numericId })
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

        const mergedUser = mergeDefined(user, data, { id: resolvedUserId })
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

      const mergedUser = mergeDefined(user, data, payload, { id: resolvedUserId })
      localStorage.setItem('userData', JSON.stringify(mergedUser))
    } catch (err) {
      setError(err?.message || 'No se pudo guardar el perfil')
    } finally {
      setSaving(false)
    }
  }

  const handleTestTracking = async () => {
    if (!resolvedUserId) return;
    
    try {
      // Generate more sample interactions for testing (minimum 5 needed for analysis)
      const sampleInteractions = [
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.VIEW,
          activity_category: 'adventure',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.VIEW,
          activity_category: 'adventure',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.VIEW,
          activity_category: 'adventure',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.REJECT,
          activity_category: 'beach',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.REJECT,
          activity_category: 'beach',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.REJECT,
          activity_category: 'beach',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.BOOKMARK,
          activity_category: 'cultural',
          context: { test: true, timestamp: new Date().toISOString() }
        },
        {
          user_id: resolvedUserId.toString(),
          interaction_type: InteractionType.CLICK,
          activity_category: 'nature',
          context: { test: true, timestamp: new Date().toISOString() }
        }
      ];

      // Track all sample interactions
      for (const interaction of sampleInteractions) {
        await trackUserBehavior(interaction);
      }

      setSuccess('Datos de prueba generados correctamente (8 interacciones). Ahora puedes analizar el comportamiento.');
    } catch (error) {
      setError('Error al generar datos de prueba: ' + error.message);
    }
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ margin: '0 0 1rem 0' }}>Perfil</h1>

      <p style={{ margin: '0 0 1rem 0' }}>
        <Link to="/travel-preferences">Cuestionario de preferencias de viaje (IA)</Link>
      </p>

      <p style={{ margin: '0 0 1rem 0' }}>
        <button 
          type="button" 
          onClick={() => setShowBehaviorAnalysis(!showBehaviorAnalysis)}
          style={{ 
            background: 'none', 
            border: 'none', 
            color: '#007bff', 
            textDecoration: 'underline', 
            cursor: 'pointer',
            padding: 0 
          }}
        >
          {showBehaviorAnalysis ? 'Ocultar' : 'Mostrar'} análisis de comportamiento
        </button>
      </p>

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

      {/* Behavior Analysis Section */}
      {showBehaviorAnalysis && (
        <Card title="Análisis de Comportamiento">
          {behaviorLoading ? (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <div className="loading-spinner"></div>
              <p>Cargando análisis de comportamiento...</p>
            </div>
          ) : behaviorError ? (
            <div style={errorStyle}>
              {behaviorError}
              <Button 
                type="button" 
                variant="outline" 
                onClick={clearBehaviorError}
                style={{ marginTop: '0.5rem' }}
              >
                Cerrar
              </Button>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '1rem' }}>
              {/* Summary Section */}
              {summary && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Resumen de Actividad</h4>
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', 
                    gap: '1rem',
                    marginBottom: '1rem'
                  }}>
                    <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#007bff' }}>
                        {summary.total_interactions}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        Interacciones
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#28a745' }}>
                        {summary.analysis_period_days}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        Días analizados
                      </div>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem', border: '1px solid #e9ecef', borderRadius: '8px' }}>
                      <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ffc107' }}>
                        {summary.recent_patterns?.length || 0}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: '#6c757d' }}>
                        Patrones detectados
                      </div>
                    </div>
                  </div>

                  {/* Interaction Breakdown */}
                  {summary.interaction_breakdown && Object.keys(summary.interaction_breakdown).length > 0 && (
                    <div>
                      <h5 style={{ margin: '0 0 0.5rem 0' }}>Tipos de Interacción</h5>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        {Object.entries(summary.interaction_breakdown).map(([type, count]) => (
                          <div key={type} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                            <span style={{ textTransform: 'capitalize' }}>{type}</span>
                            <span style={{ fontWeight: 'medium' }}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Patterns Section */}
              {patterns && patterns.length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Patrones Detectados</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {patterns.map((pattern, index) => (
                      <div key={index} style={{ 
                        padding: '0.75rem', 
                        border: '1px solid #e9ecef', 
                        borderRadius: '8px',
                        fontSize: '0.875rem'
                      }}>
                        <div style={{ fontWeight: 'medium', marginBottom: '0.25rem' }}>
                          {pattern.pattern_type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#6c757d' }}>
                          <span>Confianza: {Math.round(pattern.confidence * 100)}%</span>
                          <span>Frecuencia: {pattern.frequency}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preference Updates */}
              {preferenceUpdate && preferenceUpdate.preference_changes && Object.keys(preferenceUpdate.preference_changes).length > 0 && (
                <div>
                  <h4 style={{ margin: '0 0 0.5rem 0' }}>Actualizaciones de Preferencia</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    {Object.entries(preferenceUpdate.preference_changes).map(([category, change]) => (
                      <div key={category} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ textTransform: 'capitalize' }}>{category}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div style={{ 
                            width: '60px', 
                            height: '4px', 
                            backgroundColor: '#e9ecef', 
                            borderRadius: '2px',
                            overflow: 'hidden'
                          }}>
                            <div style={{ 
                              width: `${Math.abs(change) * 100}%`, 
                              height: '100%', 
                              backgroundColor: change > 0 ? '#28a745' : '#dc3545' 
                            }} />
                          </div>
                          <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 'medium',
                            color: change > 0 ? '#28a745' : '#dc3545'
                          }}>
                            {change > 0 ? '+' : ''}{change.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#6c757d' }}>
                    Confianza general: {Math.round(preferenceUpdate.confidence_score * 100)}%
                  </div>
                </div>
              )}

              {/* No Data Message */}
              {!summary && !patterns && !preferenceUpdate && (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#6c757d' }}>
                  <p>No hay datos de comportamiento disponibles.</p>
                  <p style={{ fontSize: '0.875rem', marginTop: '0.5rem' }}>
                    Usa la plataforma durante unos días para generar patrones de comportamiento.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                <Button 
                  type="button" 
                  onClick={() => loadSummary(resolvedUserId)}
                  disabled={behaviorLoading}
                >
                  Actualizar Resumen
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => analyzeBehavior(resolvedUserId)}
                  disabled={behaviorLoading}
                >
                  Analizar Comportamiento
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={handleTestTracking}
                  disabled={behaviorLoading}
                >
                  Generar Datos de Prueba
                </Button>
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default ProfilePage

