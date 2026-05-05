import React, { useState, useEffect } from 'react'
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

  useEffect(() => {
    if (travelPlanId) {
      fetchCompatibleTravelers()
    }
  }, [travelPlanId])

  const fetchCompatibleTravelers = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const compatibleTravelers = await getCompatibleTravelers(travelPlanId)
      setTravelers(compatibleTravelers)
      
      if (compatibleTravelers.length === 0) {
        setError('No compatible travelers found for this travel plan')
      }
    } catch (err) {
      setError(err.message || 'Failed to find compatible travelers')
    } finally {
      setLoading(false)
    }
  }

  const handleSendConnectionRequest = async (recipientId, recipientName) => {
    setSendingTo(recipientId)
    setError(null)
    setSuccessMessage(null)

    try {
      await sendConnectionRequest({
        recipientId,
        message: `Hi! I noticed we're both traveling to the same destination. Would love to connect!`
      })
      
      setSuccessMessage(`Connection request sent to ${recipientName}!`)
      
      // Remove the traveler from the list to prevent duplicate requests
      setTravelers(prev => prev.filter(t => t.userId !== recipientId))
    } catch (err) {
      if (err.message.includes('already pending')) {
        setError('You already have a pending connection request with this traveler')
      } else {
        setError(err.message || 'Failed to send connection request')
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

  const calculateOverlapDays = (startDate, endDate) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const diffTime = Math.abs(end - start)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  if (loading) {
    return (
      <div className="traveler-matching loading">
        <div className="spinner"></div>
        <p>Finding compatible travelers...</p>
      </div>
    )
  }

  return (
    <div className="traveler-matching">
      <div className="traveler-matching__header">
        <h2>Compatible Travelers</h2>
        <p>Travelers with similar destinations and compatible dates</p>
      </div>

      {error && !travelers.length && (
        <div className="traveler-matching__error">
          <p>{error}</p>
          <button onClick={fetchCompatibleTravelers} className="btn btn-secondary">
            Try Again
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
                  <span className="label">Match</span>
                </div>
              </div>
            </div>

            <div className="traveler-card__trip-details">
              <div className="trip-info">
                <h4>{traveler.travelPlanTitle}</h4>
                <p className="destination">
                  <strong>Destination:</strong> {traveler.destinationLocation}
                </p>
                <p className="dates">
                  <strong>Travel dates:</strong> {formatDate(traveler.travelStartDate)} - {formatDate(traveler.travelEndDate)}
                </p>
                <p className="overlap">
                  <strong>Overlap:</strong> {traveler.daysOverlap} days
                </p>
                <p className="travelers-count">
                  <strong>Group size:</strong> {traveler.numberOfTravelers} {traveler.numberOfTravelers === 1 ? 'traveler' : 'travelers'}
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
                    Sending...
                  </>
                ) : (
                  'Send Connection Request'
                )}
              </button>
            </div>
          </div>
        ))}
      </div>

      {travelers.length === 0 && !loading && !error && (
        <div className="traveler-matching__empty">
          <p>No compatible travelers found for this travel plan.</p>
          <p>Try adjusting your travel dates or destination to find more matches.</p>
        </div>
      )}
    </div>
  )
}

export default TravelerMatching
