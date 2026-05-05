import React from 'react'
import { AlertCircle, CheckCircle, X, AlertTriangle, Info } from 'lucide-react'

const VARIANTS = {
  error: {
    cls: 'alert alert-error',
    Icon: AlertCircle,
  },
  success: {
    cls: 'alert alert-success',
    Icon: CheckCircle,
  },
  warning: {
    cls: 'alert alert-warning',
    Icon: AlertTriangle,
  },
  info: {
    cls: 'alert alert-info',
    Icon: Info,
  },
}

/**
 * ErrorBanner — displays a dismissible alert banner.
 *
 * @param {'error'|'success'|'warning'|'info'} variant
 * @param {string|null} message
 * @param {() => void} [onDismiss]
 */
const ErrorBanner = ({ variant = 'error', message, onDismiss }) => {
  if (!message) return null

  const { cls, Icon } = VARIANTS[variant] || VARIANTS.error

  return (
    <div className={cls} role="alert" aria-live="polite" style={{ marginBottom: '1rem' }}>
      <Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
      <span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          aria-label="Dismiss"
          style={{
            background: 'none',
            padding: '2px',
            color: 'inherit',
            opacity: 0.7,
            flexShrink: 0,
          }}
        >
          <X size={16} />
        </button>
      )}
    </div>
  )
}

export default ErrorBanner
