import { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useNavigate } from 'react-router-dom'
import { aiService } from '../../services/aiService'
import { useAuth } from '../../contexts/use-auth.js'
import ErrorBanner from '../../components/UI/ErrorBanner'
import SkeletonLoader from '../../components/UI/SkeletonLoader'
import { Compass, CheckCircle, ChevronRight, ArrowLeft } from 'lucide-react'
import './TravelPreferencesPage.css'

function TravelPreferencesQuestionnaire({
  navigate,
  stepIndex,
  questions,
  currentQuestion,
  answers,
  saving,
  error,
  onDismissError,
  onOptionSelect,
  onNext,
}) {
  const progress = ((stepIndex + 1) / questions.length) * 100
  const currentAnswers = answers[currentQuestion?.id] || []
  const canProceed = currentAnswers.length > 0

  return (
    <div className="page-container" style={{ maxWidth: 600 }}>
      <button type="button" className="btn-back" onClick={() => navigate(-1)} style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', color: 'var(--text-secondary)', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div style={{ background: 'var(--surface-card)', padding: '2.5rem', borderRadius: 'var(--border-radius-xl)', boxShadow: 'var(--shadow-md)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--voyager-blue)' }}>
            <Compass size={24} />
            <span style={{ fontWeight: 700, fontSize: '0.875rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Travel Profile</span>
          </div>
          <span style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontWeight: 600 }}>
            Step {stepIndex + 1} of {questions.length}
          </span>
        </div>

        <div style={{ height: 6, background: 'var(--gray-100)', borderRadius: 3, marginBottom: '2.5rem', overflow: 'hidden' }}>
          <div style={{ height: '100%', background: 'var(--gradient-primary)', width: `${progress}%`, transition: 'width 0.3s ease' }} />
        </div>

        <ErrorBanner variant="error" message={error} onDismiss={onDismissError} />

        <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '2rem', lineHeight: 1.4 }}>
          {currentQuestion.text}
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '2.5rem' }}>
          {currentQuestion.options?.map((opt) => {
            const isSelected = currentAnswers.includes(opt.id)
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onOptionSelect(currentQuestion.id, opt.id, currentQuestion.allowMultiple)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.25rem 1.5rem',
                  background: isSelected ? 'var(--color-info-light)' : 'var(--surface-bg)',
                  border: `2px solid ${isSelected ? 'var(--voyager-blue)' : 'var(--border-color)'}`,
                  borderRadius: 'var(--border-radius-lg)',
                  color: isSelected ? 'var(--voyager-blue-dark)' : 'var(--text-primary)',
                  fontWeight: isSelected ? 700 : 500,
                  fontSize: '1rem',
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  textAlign: 'left',
                }}
              >
                <span>{opt.text}</span>
                {isSelected && <CheckCircle size={18} color="var(--voyager-blue)" />}
              </button>
            )
          })}
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={onNext}
            disabled={!canProceed || saving}
            style={{ padding: '0.875rem 2rem', fontSize: '1rem' }}
          >
            {saving ? 'Saving...' : (
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {stepIndex < questions.length - 1 ? 'Next' : 'Finish'} <ChevronRight size={18} />
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

TravelPreferencesQuestionnaire.propTypes = {
  navigate: PropTypes.func.isRequired,
  stepIndex: PropTypes.number.isRequired,
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  currentQuestion: PropTypes.shape({
    id: PropTypes.string.isRequired,
    text: PropTypes.string.isRequired,
    allowMultiple: PropTypes.bool,
    options: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })),
  }).isRequired,
  answers: PropTypes.objectOf(PropTypes.arrayOf(PropTypes.string)).isRequired,
  saving: PropTypes.bool.isRequired,
  error: PropTypes.string,
  onDismissError: PropTypes.func.isRequired,
  onOptionSelect: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
}

TravelPreferencesQuestionnaire.defaultProps = {
  error: null,
}

const TravelPreferencesPage = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const userId = user?.id ?? null

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const [preferences, setPreferences] = useState(null)
  const [sessionId, setSessionId] = useState(null)
  const [questions, setQuestions] = useState([])
  const [answers, setAnswers] = useState({})
  const [stepIndex, setStepIndex] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)

  useEffect(() => {
    if (!userId) return

    const init = async () => {
      try {
        setLoading(true)
        let existingPrefs = null
        try {
          existingPrefs = await aiService.getTravelPreferences(userId)
        } catch (err) {
          if (err?.response?.status !== 404) {
            throw err
          }
        }

        if (existingPrefs?.isCompleted) {
          setPreferences(existingPrefs)
          setIsCompleted(true)
          setLoading(false)
          return
        }

        const session = await aiService.startQuestionnaire(userId)
        setSessionId(session.sessionId)
        setQuestions(session.questions || [])

      } catch (err) {
        setError(err?.message || 'Failed to initialize preferences.')
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [userId])

  const handleOptionSelect = (questionId, optionId, allowMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionId] || []

      if (!allowMultiple) {
        return { ...prev, [questionId]: [optionId] }
      }

      const isSelected = current.includes(optionId)
      const next = isSelected
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]

      return { ...prev, [questionId]: next }
    })
  }

  const handleNext = async () => {
    if (stepIndex < questions.length - 1) {
      setStepIndex((step) => step + 1)
      return
    }

    setSaving(true)
    setError(null)

    try {
      const formattedAnswers = Object.entries(answers).map(([qId, oIds]) => ({
        questionId: qId,
        selectedOptionIds: oIds,
      }))

      await aiService.submitQuestionnaire(sessionId, formattedAnswers)
      const finalPrefs = await aiService.getTravelPreferences(userId)

      setPreferences(finalPrefs)
      setIsCompleted(true)
    } catch (err) {
      setError(err?.message || 'Failed to submit preferences.')
    } finally {
      setSaving(false)
    }
  }

  const currentQuestion = questions[stepIndex]

  if (loading) {
    return (
      <div className="page-container" style={{ maxWidth: 600 }}>
        <SkeletonLoader variant="title" width="60%" />
        <SkeletonLoader variant="card" height="300px" style={{ marginTop: '2rem' }} />
      </div>
    )
  }

  if (isCompleted) {
    return (
      <div className="page-container animate-fadeIn" style={{ maxWidth: 600, textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ display: 'inline-flex', padding: '1.5rem', background: 'var(--color-success-light)', color: 'var(--color-success)', borderRadius: '50%', marginBottom: '1.5rem' }}>
          <CheckCircle size={48} />
        </div>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', fontWeight: 800 }}>Preferences Saved!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.1rem' }}>
          Your travel profile has been analyzed. You are categorized as a{' '}
          <strong style={{ color: 'var(--text-primary)', margin: '0 0.25rem' }}>{preferences?.travelerCategory || 'Explorer'}</strong>.
        </p>
        <button type="button" className="btn-primary" onClick={() => navigate('/dashboard')}>
          Go to Dashboard
        </button>
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="page-container" style={{ maxWidth: 600 }}>
        <ErrorBanner variant="error" message={error || 'No questions available.'} />
      </div>
    )
  }

  return (
    <TravelPreferencesQuestionnaire
      navigate={navigate}
      stepIndex={stepIndex}
      questions={questions}
      currentQuestion={currentQuestion}
      answers={answers}
      saving={saving}
      error={error}
      onDismissError={() => setError(null)}
      onOptionSelect={handleOptionSelect}
      onNext={handleNext}
    />
  )
}

export default TravelPreferencesPage
