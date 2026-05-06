import PropTypes from 'prop-types'
import './SkeletonLoader.css'

/**
 * SkeletonLoader — flexible shimmer placeholder.
 *
 * @param {'text'|'title'|'card'|'avatar'|'block'} variant
 * @param {string} width - CSS width (default: '100%')
 * @param {string} height - CSS height (default: depends on variant)
 * @param {number} count - number of skeletons to render
 * @param {string} className - extra classes
 */
const SkeletonLoader = ({
  variant = 'text',
  width,
  height,
  count = 1,
  className = '',
}) => {
  const getStyle = () => {
    const base = {}
    if (width) base.width = width
    if (height) base.height = height
    return base
  }

  const getClass = () => {
    const map = {
      text: 'skeleton skeleton-text',
      title: 'skeleton skeleton-title',
      card: 'skeleton skeleton-card',
      avatar: 'skeleton skeleton-avatar',
      block: 'skeleton',
    }
    return `${map[variant] || 'skeleton'} ${className}`.trim()
  }

  if (count === 1) {
    return <div className={getClass()} style={getStyle()} aria-hidden="true" />
  }

  return (
    <>
      {Array.from({ length: count }, () => globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`).map((skeletonKey, index) => (
        <div
          key={skeletonKey}
          className={getClass()}
          style={{
            ...getStyle(),
            width: variant === 'text' && !width
              ? `${85 - (index % 3) * 15}%`
              : width || '100%',
          }}
          aria-hidden="true"
        />
      ))}
    </>
  )
}

SkeletonLoader.propTypes = {
  variant: PropTypes.oneOf(['text', 'title', 'card', 'avatar', 'block']),
  width: PropTypes.string,
  height: PropTypes.string,
  count: PropTypes.number,
  className: PropTypes.string,
}

/**
 * Pre-built skeleton for a stat card row.
 */
export const StatCardSkeleton = () => (
  <div className="skeleton-stat-card" aria-label="Loading…">
    <div className="skeleton skeleton-avatar" style={{ width: 48, height: 48 }} />
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '40%', height: '1.75rem', marginBottom: '0.5rem' }} />
      <div className="skeleton skeleton-text" style={{ width: '60%' }} />
    </div>
  </div>
)

/**
 * Pre-built skeleton for a travel plan card.
 */
export const TravelCardSkeleton = () => (
  <div className="skeleton-travel-card" aria-label="Loading…">
    <div className="skeleton" style={{ height: 120, borderRadius: '10px 10px 0 0' }} />
    <div style={{ padding: '1rem' }}>
      <div className="skeleton skeleton-text skeleton-line-medium" style={{ marginBottom: '0.75rem' }} />
      <div className="skeleton skeleton-text skeleton-line-long" />
      <div className="skeleton skeleton-text skeleton-line-short" style={{ marginTop: '0.5rem' }} />
    </div>
  </div>
)

/**
 * Pre-built skeleton for a chat message.
 */
export const ChatMessageSkeleton = ({ isUser = false }) => (
  <div className={`skeleton-chat-msg ${isUser ? 'user' : 'ai'}`} aria-label="Loading…">
    {!isUser && <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }} />}
    <div style={{ flex: 1 }}>
      <div className="skeleton skeleton-text" style={{ width: '70%' }} />
      <div className="skeleton skeleton-text" style={{ width: '50%' }} />
    </div>
    {isUser && <div className="skeleton skeleton-avatar" style={{ width: 36, height: 36 }} />}
  </div>
)

ChatMessageSkeleton.propTypes = {
  isUser: PropTypes.bool,
}

export default SkeletonLoader
