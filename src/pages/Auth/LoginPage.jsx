import React, { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, User, Globe, Plane } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { extractFieldErrors } from '../../utils/errorUtils'
import ErrorBanner from '../../components/UI/ErrorBanner'
import './Auth.css'

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const googleLoginUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1'
    return `${base.replace(/\/api\/v1\/?$/, '')}/api/v1/auth/google/login`
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const validate = () => {
    const errs = {}
    if (!formData.usernameOrEmail?.trim()) errs.usernameOrEmail = 'Username or email is required'
    if (!formData.password) errs.password = 'Password is required'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      await login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password,
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
      } else {
        setError(err?.message || 'Invalid credentials. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Left hero panel */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <Plane size={28} />
            <span>Voyager</span>
          </div>
          <h1>Your journey<br />starts here</h1>
          <p>Plan smarter trips, connect with fellow travelers, and let AI guide your adventures.</p>
          <div className="auth-features">
            {['AI-powered travel planning', 'Real-time traveler matching', 'Smart itinerary builder'].map((f) => (
              <div key={f} className="auth-feature-item">
                <div className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-hero-bg" />
      </div>

      {/* Right form panel */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fadeIn">
          <div className="auth-form-header">
            <h2>Welcome back</h2>
            <p>Sign in to your Voyager account</p>
          </div>

          <ErrorBanner variant="error" message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Username or Email</label>
              <div className="input-wrapper">
                <User size={17} className="input-icon" />
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  type="text"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="your_username or email@example.com"
                  className={fieldErrors.usernameOrEmail ? 'error' : ''}
                  autoComplete="username"
                  autoFocus
                />
              </div>
              {fieldErrors.usernameOrEmail && (
                <span className="field-error">{fieldErrors.usernameOrEmail}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <Lock size={17} className="input-icon" />
                <input
                  id="login-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className={fieldErrors.password ? 'error' : ''}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="input-action-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
              {fieldErrors.password && (
                <span className="field-error">{fieldErrors.password}</span>
              )}
            </div>

            <button
              id="login-submit-btn"
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />{' '}Signing in…
                </span>
              ) : (
                'Sign In'
              )}
            </button>

            <div className="divider-text">or</div>

            <button
              id="google-login-btn"
              type="button"
              className="btn-google w-full"
              onClick={() => { globalThis.location.href = googleLoginUrl }}
              disabled={loading}
            >
              <Globe size={18} />
              Continue with Google
            </button>
          </form>

          <div className="auth-footer">
            <p>
              Don&apos;t have an account?{' '}
              <Link to="/register" className="auth-link">Create one free</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
