import React, { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { useAuth } from '../../hooks/useAuth'
import './Auth.css'

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

const GoogleCallbackPage = () => {
  const { search } = useLocation()
  const navigate = useNavigate()
  const { login } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const token = useMemo(() => {
    const params = new URLSearchParams(search)
    return params.get('token') || ''
  }, [search])

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setError('')

      if (!token) {
        setError('No se recibió token en la URL. Para este frontend, el backend debe redirigir a /auth/google/callback?token=...')
        setLoading(false)
        return
      }

      try {
        localStorage.setItem('smartrip_token', token)
        localStorage.setItem('token', token)

        const payload = decodeJwtPayload(token) || {}
        const userData = {
          id: payload.userId || payload.sub || payload.id,
          email: payload.email,
          firstName: payload.firstName,
          lastName: payload.lastName,
          username: payload.username,
          provider: 'google'
        }

        localStorage.setItem('userData', JSON.stringify(userData))
        await login(userData, token)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setError(err?.message || 'No se pudo completar el login con Google.')
      } finally {
        setLoading(false)
      }
    }

    run()
  }, [token, login, navigate])

  if (loading) {
    return (
      <div className="auth-page">
        <div className="auth-container">
          <Card className="auth-card">
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Validando sesión con Google…</p>
            </div>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-page">
      <div className="auth-container">
        <Card className="auth-card">
          <div className="auth-header">
            <h1>Google Login</h1>
            <p>No se pudo completar automáticamente</p>
          </div>

          {error && <div className="auth-error">{error}</div>}

          <Button type="button" variant="primary" size="large" onClick={() => navigate('/login')} className="auth-submit">
            Volver al login
          </Button>
        </Card>
      </div>
    </div>
  )
}

export default GoogleCallbackPage

