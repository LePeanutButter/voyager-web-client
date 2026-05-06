import PropTypes from 'prop-types'
import './Card.css'

const Card = ({
  children,
  title,
  subtitle,
  footer,
  className = '',
  hover = false,
  padding = 'medium',
  ...props
}) => {
  const baseClasses = 'card'
  const hoverClass = hover ? 'card-hover' : ''
  const paddingClass = `card-padding-${padding}`

  const classes = [
    baseClasses,
    hoverClass,
    paddingClass,
    className,
  ].filter(Boolean).join(' ')

  return (
    <div className={classes} {...props}>
      {(title || subtitle) && (
        <div className="card-header">
          {title && <h3 className="card-title">{title}</h3>}
          {subtitle && <p className="card-subtitle">{subtitle}</p>}
        </div>
      )}

      <div className="card-body">
        {children}
      </div>

      {footer && (
        <div className="card-footer">
          {footer}
        </div>
      )}
    </div>
  )
}

Card.propTypes = {
  children: PropTypes.node,
  title: PropTypes.node,
  subtitle: PropTypes.node,
  footer: PropTypes.node,
  className: PropTypes.string,
  hover: PropTypes.bool,
  padding: PropTypes.string,
}

export const CardHeader = ({ children, className = '', ...props }) => (
  <div className={['card-header', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
)

CardHeader.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

export const CardTitle = ({ children, className = '', ...props }) => (
  <h3 className={['card-title', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </h3>
)

CardTitle.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

export const CardContent = ({ children, className = '', ...props }) => (
  <div className={['card-inner', className].filter(Boolean).join(' ')} {...props}>
    {children}
  </div>
)

CardContent.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
}

export default Card
