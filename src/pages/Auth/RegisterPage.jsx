import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, User, Mail, Phone, Plane } from 'lucide-react'
import { useAuth } from '../../contexts/use-auth.js'
import { extractFieldErrors } from '../../utils/errorUtils'
import ErrorBanner from '../../components/UI/ErrorBanner'
import './Auth.css'

const Field = ({
  id,
  name,
  label,
  type = 'text',
  placeholder,
  icon: Icon,
  autoComplete,
  formData,
  fieldErrors,
  onChange,
  showPassword,
  onTogglePassword,
}) => (
  <div className="form-group">
    <label htmlFor={id}>{label}</label>
    <div className="input-wrapper">
      {Icon && <Icon size={17} className="input-icon" />}
      <input
        id={id}
        name={name}
        type={type}
        value={formData[name]}
        onChange={onChange}
        placeholder={placeholder}
        className={fieldErrors[name] ? 'error' : ''}
        autoComplete={autoComplete}
        style={Icon ? undefined : { paddingLeft: '1rem' }}
      />
      {name === 'password' && (
        <button
          type="button"
          className="input-action-btn"
          onClick={onTogglePassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      )}
    </div>
    {fieldErrors[name] && <span className="field-error">{fieldErrors[name]}</span>}
  </div>
)

Field.propTypes = {
  id: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  type: PropTypes.string,
  placeholder: PropTypes.string,
  icon: PropTypes.elementType,
  autoComplete: PropTypes.string,
  formData: PropTypes.object.isRequired,
  fieldErrors: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  showPassword: PropTypes.bool.isRequired,
  onTogglePassword: PropTypes.func.isRequired,
}

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
    phoneNumber: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { register } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const isValidEmail = (email) => {
    const parts = email.split('@')
    return parts.length === 2 && parts[0].length > 0 && parts[1].includes('.') && parts[1].split('.').every((p) => p.length > 0)
  }

  const validate = () => {
    const errs = {}
    if (!formData.firstName.trim()) errs.firstName = 'First name is required'
    if (!formData.lastName.trim()) errs.lastName = 'Last name is required'
    if (!formData.username.trim()) errs.username = 'Username is required'
    else if (formData.username.length < 3) errs.username = 'Username must be at least 3 characters'
    if (!formData.email.trim()) errs.email = 'Email is required'
    else if (!isValidEmail(formData.email)) errs.email = 'Enter a valid email address'
    if (!formData.password) errs.password = 'Password is required'
    else if (formData.password.length < 8) errs.password = 'Password must be at least 8 characters'
    setFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return
    setLoading(true)
    setError('')
    try {
      await register({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        username: formData.username.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        ...(formData.phoneNumber ? { phoneNumber: formData.phoneNumber.trim() } : {}),
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const fieldErrs = extractFieldErrors(err)
      if (Object.keys(fieldErrs).length > 0) {
        setFieldErrors(fieldErrs)
      } else {
        setError(err?.message || 'Registration failed. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      {/* Hero */}
      <div className="auth-hero">
        <div className="auth-hero-content">
          <div className="auth-logo">
            <Plane size={28} />
            <span>Voyager</span>
          </div>
          <h1>Join the<br />travel community</h1>
          <p>Create your free account and start planning unforgettable journeys powered by AI.</p>
          <div className="auth-features">
            {[
              'Personalized AI travel recommendations',
              'Connect with like-minded travelers',
              'Smart itinerary builder & planning tools',
              'Real-time compatibility scoring',
            ].map((f) => (
              <div key={f} className="auth-feature-item">
                <div className="auth-feature-dot" />
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-hero-bg" />
      </div>

      {/* Form */}
      <div className="auth-form-panel">
        <div className="auth-form-container animate-fadeIn">
          <div className="auth-form-header">
            <h2>Create account</h2>
            <p>Start your adventure — it&apos;s free</p>
          </div>

          <ErrorBanner variant="error" message={error} onDismiss={() => setError('')} />

          <form onSubmit={handleSubmit} className="auth-form" noValidate>
            <div className="form-row">
              <Field id="reg-firstName" name="firstName" label="First name" placeholder="John" icon={User} autoComplete="given-name" />
              <Field id="reg-lastName" name="lastName" label="Last name" placeholder="Doe" autoComplete="family-name" formData={formData} fieldErrors={fieldErrors} onChange={handleChange} showPassword={showPassword} onTogglePassword={() => setShowPassword((v) => !v)} />
            </div>

              <Field id="reg-username" name="username" label="Username" placeholder="john_doe" icon={User} autoComplete="username" formData={formData} fieldErrors={fieldErrors} onChange={handleChange} showPassword={showPassword} onTogglePassword={() => setShowPassword((v) => !v)} />
              <Field id="reg-email" name="email" label="Email address" type="email" placeholder="john@example.com" icon={Mail} autoComplete="email" formData={formData} fieldErrors={fieldErrors} onChange={handleChange} showPassword={showPassword} onTogglePassword={() => setShowPassword((v) => !v)} />
            <Field
              id="reg-password"
              name="password"
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Minimum 8 characters"
              icon={Lock}
              autoComplete="new-password"
              formData={formData}
              fieldErrors={fieldErrors}
              onChange={handleChange}
              showPassword={showPassword}
              onTogglePassword={() => setShowPassword((v) => !v)}
            />
            <Field id="reg-phone" name="phoneNumber" label="Phone (optional)" type="tel" placeholder="+1 555 000 0000" icon={Phone} autoComplete="tel" formData={formData} fieldErrors={fieldErrors} onChange={handleChange} showPassword={showPassword} onTogglePassword={() => setShowPassword((v) => !v)} />

            <button
              id="register-submit-btn"
              type="submit"
              className="btn-primary w-full"
              disabled={loading}
              style={{ marginTop: '0.25rem' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="spinner" style={{ width: 18, height: 18, borderWidth: 2 }} />
                  {'Creating account…'}
                </span>
              ) : (
                'Create Account'
              )}
            </button>

            <p className="auth-terms">
              By creating an account you agree to our{' '}
              <a href="/terms">Terms of Service</a> and <a href="/privacy">Privacy Policy</a>.
            </p>
          </form>

          <div className="auth-footer">
            <p>
              Already have an account?{' '}
              <Link to="/login" className="auth-link">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
