import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { usersService } from '../../services/usersService'
import { Mail, Lock, User, Eye, EyeOff, Phone, IdCard } from 'lucide-react'
import './Auth.css'

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phoneNumber: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
    if (success) setSuccess('')
  }

  const validate = () => {
    const next = {}
    if (!formData.username.trim()) next.username = 'El username es requerido'
    if (!formData.email.trim()) next.email = 'El email es requerido'
    if (formData.email && !emailRegex.test(formData.email)) next.email = 'Email inválido'
    if (!formData.firstName.trim()) next.firstName = 'El nombre es requerido'
    if (!formData.lastName.trim()) next.lastName = 'El apellido es requerido'
    if (!formData.password) next.password = 'La contraseña es requerida'
    if (formData.password && formData.password.length < 8) next.password = 'La contraseña debe tener mínimo 8 caracteres'
    if (!formData.confirmPassword) next.confirmPassword = 'Confirma tu contraseña'
    if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) {
      next.confirmPassword = 'Las contraseñas no coinciden'
    }
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const payload = {
        username: formData.username.trim(),
        email: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        phoneNumber: formData.phoneNumber?.trim() || undefined
      }

      await usersService.register(payload)
      setSuccess('Registro exitoso. Redirigiendo al login…')
      setTimeout(() => navigate('/login', { replace: true }), 900)
    } catch (err) {
      setError(err?.message || 'No se pudo registrar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Crear cuenta</h1>
            <p>Completa tus datos para registrarte</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-with-icon">
                <IdCard size={20} />
                <input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  placeholder="tu_usuario"
                  className={fieldErrors.username ? 'error' : ''}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.username && <span className="error-message">{fieldErrors.username}</span>}
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
                  onChange={handleChange}
                  placeholder="tu@email.com"
                  className={fieldErrors.email ? 'error' : ''}
                  autoComplete="email"
                />
              </div>
              {fieldErrors.email && <span className="error-message">{fieldErrors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="firstName">Nombre</label>
              <div className="input-with-icon">
                <User size={20} />
                <input
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="Tu nombre"
                  className={fieldErrors.firstName ? 'error' : ''}
                  autoComplete="given-name"
                />
              </div>
              {fieldErrors.firstName && <span className="error-message">{fieldErrors.firstName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="lastName">Apellido</label>
              <div className="input-with-icon">
                <User size={20} />
                <input
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="Tu apellido"
                  className={fieldErrors.lastName ? 'error' : ''}
                  autoComplete="family-name"
                />
              </div>
              {fieldErrors.lastName && <span className="error-message">{fieldErrors.lastName}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Teléfono (opcional)</label>
              <div className="input-with-icon">
                <Phone size={20} />
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  placeholder="+54 11 5555 5555"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 8 caracteres"
                  className={fieldErrors.password ? 'error' : ''}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="password-toggle"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {fieldErrors.password && <span className="error-message">{fieldErrors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <div className="input-with-icon">
                <Lock size={20} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repite tu contraseña"
                  className={fieldErrors.confirmPassword ? 'error' : ''}
                  autoComplete="new-password"
                />
              </div>
              {fieldErrors.confirmPassword && <span className="error-message">{fieldErrors.confirmPassword}</span>}
            </div>

            {error && <div className="auth-error">{error}</div>}
            {success && <div className="auth-error" style={{ background: '#d1e7dd', color: '#0f5132', borderColor: '#badbcc' }}>{success}</div>}

            <Button type="submit" variant="primary" size="large" loading={loading} className="auth-submit">
              Registrarme
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default RegisterPage

