import { useState, useEffect, useCallback } from 'react'
import PropTypes from 'prop-types'
import { getCompatibleTravelers, sendConnectionRequest } from '../../services/socialService'
import './TravelerMatching.css'

/**
 * Component for finding and connecting with compatible travelers
 * 
 * This component implements Task 1: Search travelers by destination and similar dates
 * and Task 2: Send connection requests
 */
const TravelerMatching = ({ travelPlanId }) => {
  const [travelers, setTravelers] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)
  const [sendingTo, setSendingTo] = useState(null)

  const fetchCompatibleTravelers = useCallback(async () => {
    setLoading(true)
    setError(null)
    
    try {
      const compatibleTravelers = await getCompatibleTravelers(travelPlanId)
      setTravelers(compatibleTravelers)
      
      if (compatibleTravelers.length === 0) {
        setError('No se encontraron viajeros compatibles para este plan')
      }
    } catch (err) {
      setError(err.message || 'No se pudieron encontrar viajeros compatibles')
    } finally {
      setLoading(false)
    }
  }, [travelPlanId])

  useEffect(() => {
    if (travelPlanId) {
      fetchCompatibleTravelers()
    }
  }, [travelPlanId, fetchCompatibleTravelers])

  const handleSendConnectionRequest = async (recipientId, recipientName) => {
    setSendingTo(recipientId)
    setError(null)
    setSuccessMessage(null)

    try {
      await sendConnectionRequest({
        recipientId,
        message: '¡Hola! Veo que viajamos al mismo destino. Me encantaria conectar.'
      })
      
      setSuccessMessage(`¡Solicitud de conexion enviada a ${recipientName}!`)
      
      // Remove the traveler from the list to prevent duplicate requests
      setTravelers(prev => prev.filter(t => t.userId !== recipientId))
    } catch (err) {
      if (err.message.includes('already pending')) {
        setError('Ya tienes una solicitud pendiente con este viajero')
      } else {
        setError(err.message || 'No se pudo enviar la solicitud de conexion')
      }
    } finally {
      setSendingTo(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  if (loading) {
    return (
      <div className="traveler-matching loading">
        <div className="spinner"></div>
        <p>Buscando viajeros compatibles...</p>
      </div>
    )
  }

  return (
    <div className="traveler-matching">
      <div className="traveler-matching__header">
        <h2>Viajeros compatibles</h2>
        <p>Viajeros con destinos similares y fechas compatibles</p>
      </div>

      {error && !travelers.length && (
        <div className="traveler-matching__error">
          <p>{error}</p>
          <button onClick={fetchCompatibleTravelers} className="btn btn-secondary">
            Reintentar
          </button>
        </div>
      )}

      {successMessage && (
        <div className="traveler-matching__success">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="btn-close">×</button>
        </div>
      )}

      <div className="traveler-matching__list">
        {travelers.map((traveler) => (
          <div key={traveler.userId} className="traveler-card">
            <div className="traveler-card__header">
              <div className="traveler-card__avatar">
                {traveler.profileImageUrl ? (
                  <img src={traveler.profileImageUrl} alt={`${traveler.firstName} ${traveler.lastName}`} />
                ) : (
                  <div className="avatar-placeholder">
                    {traveler.firstName.charAt(0)}{traveler.lastName.charAt(0)}
                  </div>
                )}
              </div>
              <div className="traveler-card__info">
                <h3>{traveler.firstName} {traveler.lastName}</h3>
                <p className="username">@{traveler.username}</p>
                {traveler.bio && <p className="bio">{traveler.bio}</p>}
              </div>
              <div className="traveler-card__compatibility">
                <div className="compatibility-score">
                  <span className="score">{traveler.compatibilityScore}%</span>
                  <span className="label">Compatibilidad</span>
                </div>
              </div>
            </div>

            <div className="traveler-card__trip-details">
              <div className="trip-info">
                <h4>{traveler.travelPlanTitle}</h4>
                <p className="destination">
                  <strong>Destino:</strong> {traveler.destinationLocation}
                </p>
                <p className="dates">
                  <strong>Fechas de viaje:</strong> {formatDate(traveler.travelStartDate)} - {formatDate(traveler.travelEndDate)}
                </p>
                <p className="overlap">
                  <strong>Coincidencia:</strong> {traveler.daysOverlap} dias
                </p>
                <p className="travelers-count">
                  <strong>Tamano del grupo:</strong> {traveler.numberOfTravelers} {traveler.numberOfTravelers === 1 ? 'viajero' : 'viajeros'}
                </p>
              </div>
            </div>

            <div className="traveler-card__actions">
              <button
                onClick={() => handleSendConnectionRequest(traveler.userId, traveler.firstName)}
                disabled={sendingTo === traveler.userId}
                className="btn btn-primary"
              >
                {sendingTo === traveler.userId ? (
                  <>
                    <div className="btn-spinner"></div>
                    Enviando...
                  </>
                ) : (
                  'Enviar solicitud de conexion'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {travelers.length === 0 && !loading && !error && (
        <div className="traveler-matching__empty">
          <p>No se encontraron viajeros compatibles para este plan.</p>
          <p>Prueba ajustando fechas o destino para encontrar mas coincidencias.</p>
        </div>
      )}
    </div>
  )
}

TravelerMatching.propTypes = {
  travelPlanId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
}

export default TravelerMatching
