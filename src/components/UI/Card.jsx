import React from 'react'
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
    className
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

export default Card
