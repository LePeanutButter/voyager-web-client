import React, { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { usersService } from '../../services/usersService'
import { useAuth } from '../../hooks/useAuth'
import { Lock, Eye, EyeOff, User } from 'lucide-react'
import './Auth.css'

const LoginPage = () => {
  const [formData, setFormData] = useState({ usernameOrEmail: '', password: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const { login } = useAuth()
  const navigate = useNavigate()

  const microsoftLoginUrl = useMemo(() => {
    const base = import.meta.env.VITE_API_BASE_URL || ''
    return `${base.replace(/\/$/, '')}/auth/microsoft/login`
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (fieldErrors[name]) setFieldErrors((prev) => ({ ...prev, [name]: '' }))
    if (error) setError('')
  }

  const validate = () => {
    const next = {}
    if (!formData.usernameOrEmail?.trim()) next.usernameOrEmail = 'El usuario o email es requerido'
    if (!formData.password) next.password = 'La contraseña es requerida'
    setFieldErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    setLoading(true)
    setError('')
    try {
      const res = await usersService.login({
        usernameOrEmail: formData.usernameOrEmail.trim(),
        password: formData.password
      })

      const payload = res?.data || res
      const token = payload?.token
      if (!token) throw new Error('El backend no retornó token')

      localStorage.setItem('smartrip_token', token)
      localStorage.setItem('userData', JSON.stringify(payload))
      await login(payload, token)

      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err?.message || 'Credenciales inválidas')
    } finally {
      setLoading(false)
    }
  }

  const handleMicrosoft = () => {
    window.location.href = microsoftLoginUrl
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Iniciar sesión</h1>
            <p>Accede a tu cuenta</p>
          </div>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="usernameOrEmail">Usuario o Email</label>
              <div className="input-with-icon">
                <User size={20} />
                <input
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  placeholder="Tu usuario o email"
                  className={fieldErrors.usernameOrEmail ? 'error' : ''}
                  autoComplete="username"
                />
              </div>
              {fieldErrors.usernameOrEmail && <span className="error-message">{fieldErrors.usernameOrEmail}</span>}
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
                  placeholder="Tu contraseña"
                  className={fieldErrors.password ? 'error' : ''}
                  autoComplete="current-password"
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

            {error && <div className="auth-error">{error}</div>}

            <Button type="submit" variant="primary" size="large" loading={loading} className="auth-submit">
              Iniciar sesión
            </Button>

            <Button
              type="button"
              variant="outline"
              size="large"
              onClick={handleMicrosoft}
              disabled={loading}
              className="auth-submit"
            >
              Continuar con Microsoft
            </Button>
          </form>

          <div className="auth-footer">
            <p>
              ¿No tienes cuenta? <Link to="/register">Crear cuenta</Link>
            </p>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default LoginPage

