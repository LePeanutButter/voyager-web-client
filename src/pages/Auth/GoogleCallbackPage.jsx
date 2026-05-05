import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Plane } from 'lucide-react'

/**
 * GoogleCallbackPage
 * Backend redirects to /auth/google/callback?token=<JWT> on success,
 * or /auth/google/callback?error=<code>&message=<desc> on failure.
 */
const GoogleCallbackPage = () => {
  const [status, setStatus] = useState('loading') // 'loading' | 'error'
  const [errorMessage, setErrorMessage] = useState('')
  const [searchParams] = useSearchParams()
  const { login } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const processCallback = async () => {
      const token = searchParams.get('token')
      const error = searchParams.get('error')
      const message = searchParams.get('message')

      if (error) {
        setErrorMessage(message || 'Google authentication failed. Please try again.')
        setStatus('error')
        return
      }

      if (!token) {
        setErrorMessage('No authentication token received.')
        setStatus('error')
        return
      }

      try {
        // Inject the Google-issued JWT into the auth context
        // The user object will be fetched from /users/me automatically
        await login(null, token)
        navigate('/dashboard', { replace: true })
      } catch (err) {
        setErrorMessage(err?.message || 'Authentication failed. Please try again.')
        setStatus('error')
      }
    }

    processCallback()
  }, [searchParams, login, navigate])

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--surface-bg)',
        gap: '1.5rem',
        padding: '2rem',
      }}
    >
      <div
        style={{
          width: 64,
          height: 64,
          background: 'var(--gradient-primary)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          boxShadow: 'var(--shadow-blue)',
        }}
      >
        <Plane size={28} />
      </div>

      {status === 'loading' ? (
        <>
          <div className="spinner" />
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Signing you in…</h2>
            <p style={{ color: 'var(--text-secondary)' }}>
              Completing Google authentication, please wait.
            </p>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <h2 style={{ color: 'var(--color-danger)', marginBottom: '0.75rem' }}>
            Authentication Failed
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            {errorMessage}
          </p>
          <button
            className="btn-primary"
            onClick={() => navigate('/login')}
            style={{ display: 'inline-flex' }}
          >
            Return to Login
          </button>
        </div>
      )}
    </div>
  )
}

export default GoogleCallbackPage
