import { useState } from 'react'
import PropTypes from 'prop-types'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import './Auth.css'

function collectRegisterErrors(formData) {
  const newErrors = {}
  if (!formData.name) newErrors.name = 'Name is required'
  if (!formData.email) newErrors.email = 'Email is required'
  if (!formData.password) newErrors.password = 'Password is required'
  if (!formData.confirmPassword) newErrors.confirmPassword = 'Please confirm your password'
  if (formData.password !== formData.confirmPassword) {
    newErrors.confirmPassword = 'Passwords do not match'
  }
  if (formData.password && formData.password.length < 6) {
    newErrors.password = 'Password must be at least 6 characters'
  }
  return newErrors
}

function RegisterNameEmailFields({ formData, errors, onChange }) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="name">Full Name</label>
        <div className="input-with-icon">
          <User size={20} />
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={onChange}
            placeholder="Enter your full name"
            className={errors.name ? 'error' : ''}
          />
        </div>
        {errors.name && <span className="error-message">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="email">Email</label>
        <div className="input-with-icon">
          <Mail size={20} />
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={onChange}
            placeholder="Enter your email"
            className={errors.email ? 'error' : ''}
          />
        </div>
        {errors.email && <span className="error-message">{errors.email}</span>}
      </div>
    </>
  )
}

RegisterNameEmailFields.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }).isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  onChange: PropTypes.func.isRequired,
}

function RegisterPasswordFields({
  formData,
  errors,
  showPassword,
  onTogglePassword,
  onChange,
}) {
  return (
    <>
      <div className="form-group">
        <label htmlFor="password">Password</label>
        <div className="input-with-icon">
          <Lock size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            id="password"
            name="password"
            value={formData.password}
            onChange={onChange}
            placeholder="Create a password"
            className={errors.password ? 'error' : ''}
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="password-toggle"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {errors.password && <span className="error-message">{errors.password}</span>}
      </div>

      <div className="form-group">
        <label htmlFor="confirmPassword">Confirm Password</label>
        <div className="input-with-icon">
          <Lock size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={onChange}
            placeholder="Confirm your password"
            className={errors.confirmPassword ? 'error' : ''}
          />
        </div>
        {errors.confirmPassword && <span className="error-message">{errors.confirmPassword}</span>}
      </div>
    </>
  )
}

RegisterPasswordFields.propTypes = {
  formData: PropTypes.shape({
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
  }).isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  showPassword: PropTypes.bool.isRequired,
  onTogglePassword: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
}

function RegisterForm({
  formData,
  errors,
  showPassword,
  onTogglePassword,
  onChange,
  onSubmit,
  loading,
  error,
}) {
  return (
    <form onSubmit={onSubmit} className="auth-form">
      <RegisterNameEmailFields formData={formData} errors={errors} onChange={onChange} />
      <RegisterPasswordFields
        formData={formData}
        errors={errors}
        showPassword={showPassword}
        onTogglePassword={onTogglePassword}
        onChange={onChange}
      />

      {error && <div className="auth-error">{error}</div>}

      <Button
        type="submit"
        variant="primary"
        size="large"
        loading={loading}
        className="auth-submit"
      >
        Create Account
      </Button>
    </form>
  )
}

RegisterForm.propTypes = {
  formData: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
    password: PropTypes.string,
    confirmPassword: PropTypes.string,
  }).isRequired,
  errors: PropTypes.objectOf(PropTypes.string).isRequired,
  showPassword: PropTypes.bool.isRequired,
  onTogglePassword: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  loading: PropTypes.bool.isRequired,
  error: PropTypes.string,
}

RegisterForm.defaultProps = {
  error: null,
}

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState({})

  const { register, loading, error } = useAuth()
  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    const newErrors = collectRegisterErrors(formData)

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    try {
      await register(formData)
      navigate('/dashboard')
    } catch {
      // Error is handled by the auth context
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Create Account</h1>
            <p>Join TourismAI and start planning amazing trips</p>
          </div>

          <RegisterForm
            formData={formData}
            errors={errors}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword((v) => !v)}
            onChange={handleChange}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
          />

          <div className="auth-footer">
            <p>
              Already have an account? <Link to="/login">Sign in</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default Register
