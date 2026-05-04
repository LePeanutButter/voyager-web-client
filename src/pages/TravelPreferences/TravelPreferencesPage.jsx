import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { travelPreferencesService } from '../../services/travelPreferencesService'
import { decodeJwtPayload, getNumericId, safeJsonParse } from '../../utils/jwt'
import Button from '../../components/UI/Button'
import Card from '../../components/UI/Card'
import './TravelPreferencesPage.css'

function TravelPreferencesPage() {
  const navigate = useNavigate()
  const { user, isAuthenticated, token: ctxToken } = useAuth()

  const token = ctxToken || localStorage.getItem('smartrip_token') || localStorage.getItem('token')

  const userId = useMemo(() => {
    const fromUser = getNumericId(user?.id) ?? user?.id?.toString()
    if (fromUser) return String(fromUser)

    const stored = safeJsonParse(localStorage.getItem('userData') || '')
    const fromStorage = getNumericId(stored?.id)
    if (fromStorage) return String(fromStorage)

    if (token) {
      const payload = decodeJwtPayload(token)
      const fromJwt =
        getNumericId(payload?.userId) ?? getNumericId(payload?.id)
      if (fromJwt) return String(fromJwt)
    }

    return user?.email || ''
  }, [user?.id, user?.email, token])

  const [sessionId, setSessionId] = useState(null)
  const [stepIndex, setStepIndex] = useState(0)
  const [questions, setQuestions] = useState([])
  const [selections, setSelections] = useState({})
  const [derivedCategory, setDerivedCategory] = useState(null)
  const [awaitingFinal, setAwaitingFinal] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [submitResult, setSubmitResult] = useState(null)

  const canProceed = useMemo(() => {
    if (!questions.length) return false
    return questions.every((q) => {
      const selection = selections[q.id]
      return selection && (
        Array.isArray(selection) ? selection.length > 0 : true
      )
    })
  }, [questions, selections])

  const bootstrap = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    setError(null)
    try {
      const data = await travelPreferencesService.postQuestionnaireStep({
        user_id: userId,
        session_id: null,
        answers: []
      })
      setSessionId(data.session_id)
      setStepIndex(data.step_index)
      setQuestions(data.questions || [])
      setDerivedCategory(data.derived_primary_category)
      setAwaitingFinal(!!data.is_complete)
    } catch (e) {
      setError(e.message || 'No se pudo iniciar el cuestionario')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (isAuthenticated && userId) bootstrap()
  }, [isAuthenticated, userId, bootstrap])

  const handleNext = async () => {
    if (!canProceed || !sessionId) return
    const answers = questions.map((q) => ({
      question_id: q.id,
      selected_option_ids: Array.isArray(selections[q.id]) 
        ? selections[q.id] 
        : [selections[q.id]]
    }))
    setLoading(true)
    setError(null)
    try {
      const data = await travelPreferencesService.postQuestionnaireStep({
        user_id: userId,
        session_id: sessionId,
        answers
      })
      setSessionId(data.session_id)
      setStepIndex(data.step_index)
      setQuestions(data.questions || [])
      setDerivedCategory(data.derived_primary_category)
      setAwaitingFinal(!!data.is_complete)
      setSelections({})
    } catch (e) {
      setError(e.message || 'Error al enviar respuestas')
    } finally {
      setLoading(false)
    }
  }

  const handleFinalize = async () => {
    if (!sessionId) return
    setLoading(true)
    setError(null)
    try {
      const data = await travelPreferencesService.submitQuestionnaire({
        user_id: userId,
        session_id: sessionId,
        answers: []
      })
      setSubmitResult(data)
    } catch (e) {
      setError(e.message || 'Error al guardar')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="travel-prefs-page">
        <p>Inicia sesión para configurar tus preferencias.</p>
        <Button onClick={() => navigate('/login')}>Ir a login</Button>
      </div>
    )
  }

  return (
    <div className="travel-prefs-page">
      <header className="travel-prefs-header">
        <h1>Preferencias de viaje</h1>
        <p className="travel-prefs-sub">
          Cuestionario inteligente que alimenta el motor de IA — paso{' '}
          {stepIndex + 1}
        </p>
      </header>

      {derivedCategory && (
        <p className="travel-prefs-derived">
          Estilo seleccionado: <strong>{derivedCategory}</strong>
        </p>
      )}

      {error && <div className="travel-prefs-error">{error}</div>}

      {loading && <div className="travel-prefs-loading">Cargando…</div>}

      {submitResult && (
        <Card className="travel-prefs-result">
          <h2>Preferencias guardadas</h2>
          <p>
            <strong>Categoría principal:</strong> {submitResult.primary_category}
          </p>
          <p className="travel-prefs-summary">{submitResult.ai_context_summary}</p>
          <Button onClick={() => navigate('/profile')}>Volver al perfil</Button>
        </Card>
      )}

      {!submitResult && awaitingFinal && (
        <Card className="travel-prefs-card">
          <p>
            Has completado el cuestionario. Guarda para enviar el perfil al motor
            de recomendaciones.
          </p>
          <div className="travel-prefs-actions">
            <Button onClick={handleFinalize} disabled={loading}>
              Guardar preferencias
            </Button>
            <Button variant="secondary" onClick={() => navigate('/profile')}>
              Cancelar
            </Button>
          </div>
        </Card>
      )}

      {!submitResult && !awaitingFinal && questions.length > 0 && (
        <>
          {questions.map((q) => (
            <Card key={q.id} className="travel-prefs-card">
              <h3>{q.prompt}</h3>
              <div className="travel-prefs-options" role={q.allow_multiple ? "group" : "radiogroup"}>
                {q.options.map((opt) => (
                  <label key={opt.id} className="travel-prefs-option">
                    <input
                      type={q.allow_multiple ? "checkbox" : "radio"}
                      name={q.id}
                      checked={
                        q.allow_multiple
                          ? Array.isArray(selections[q.id]) && selections[q.id].includes(opt.id)
                          : selections[q.id] === opt.id
                      }
                      onChange={() => {
                        if (q.allow_multiple) {
                          setSelections((prev) => {
                            const current = prev[q.id] || []
                            const isSelected = current.includes(opt.id)
                            return {
                              ...prev,
                              [q.id]: isSelected
                                ? current.filter(id => id !== opt.id)
                                : [...current, opt.id]
                            }
                          })
                        } else {
                          setSelections((prev) => ({ ...prev, [q.id]: opt.id }))
                        }
                      }}
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </Card>
          ))}
          <div className="travel-prefs-actions">
            <Button onClick={handleNext} disabled={loading || !canProceed}>
              Siguiente
            </Button>
            <Button variant="secondary" onClick={() => navigate('/profile')}>
              Volver
            </Button>
          </div>
        </>
      )}

      {!submitResult && !awaitingFinal && !questions.length && !loading && (
        <Button onClick={bootstrap}>Reintentar</Button>
      )}
    </div>
  )
}

export default TravelPreferencesPage
