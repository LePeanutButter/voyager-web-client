import { useState, useEffect } from 'react'
import { getPendingRequests, acceptConnectionRequest, rejectConnectionRequest } from '../../services/socialService'
import './ConnectionRequests.css'

/**
 * Component for managing connection requests
 * 
 * This component implements Task 3: Accept or reject connection requests
 */
const ConnectionRequests = () => {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(false)
  const [processing, setProcessing] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  useEffect(() => {
    fetchPendingRequests()
  }, [])

  const fetchPendingRequests = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const pendingRequests = await getPendingRequests()
      setRequests(pendingRequests)
    } catch (err) {
      setError(err.message || 'Failed to load pending requests')
    } finally {
      setLoading(false)
    }
  }

  const handleAcceptRequest = async (requestId) => {
    setProcessing(requestId)
    setError(null)
    setSuccessMessage(null)

    try {
      await acceptConnectionRequest(requestId)
      setSuccessMessage('Connection request accepted!')
      
      // Remove the accepted request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      setError(err.message || 'Failed to accept connection request')
    } finally {
      setProcessing(null)
    }
  }

  const handleRejectRequest = async (requestId) => {
    setProcessing(requestId)
    setError(null)
    setSuccessMessage(null)

    try {
      await rejectConnectionRequest(requestId)
      setSuccessMessage('Connection request rejected')
      
      // Remove the rejected request from the list
      setRequests(prev => prev.filter(req => req.id !== requestId))
    } catch (err) {
      setError(err.message || 'Failed to reject connection request')
    } finally {
      setProcessing(null)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="connection-requests loading">
        <div className="spinner"></div>
        <p>Loading connection requests...</p>
      </div>
    )
  }

  return (
    <div className="connection-requests">
      <div className="connection-requests__header">
        <h2>Connection Requests</h2>
        <p>Manage requests from travelers who want to connect with you</p>
      </div>

      {error && (
        <div className="connection-requests__error">
          <p>{error}</p>
          <button onClick={() => setError(null)} className="btn-close">×</button>
        </div>
      )}

      {successMessage && (
        <div className="connection-requests__success">
          <p>{successMessage}</p>
          <button onClick={() => setSuccessMessage(null)} className="btn-close">×</button>
        </div>
      )}

      <div className="connection-requests__list">
        {requests.map((request) => (
          <div key={request.id} className="request-card">
            <div className="request-card__header">
              <div className="request-card__avatar">
                {request.requesterProfileImage ? (
                  <img src={request.requesterProfileImage} alt={request.requesterName} />
                ) : (
                  <div className="avatar-placeholder">
                    {request.requesterName ? request.requesterName.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
              </div>
              <div className="request-card__info">
                <h3>{request.requesterName || 'Traveler'}</h3>
                <p className="request-date">Requested {formatDate(request.createdAt)}</p>
                {request.message && (
                  <p className="request-message">
                    <q cite="#">{request.message}</q>
                  </p>
                )}
              </div>
              <div className="request-card__status">
                <span className="status-badge pending">Pending</span>
              </div>
            </div>

            <div className="request-card__actions">
              <div className="action-buttons">
                <button
                  onClick={() => handleAcceptRequest(request.id)}
                  disabled={processing === request.id}
                  className="btn btn-accept"
                >
                  {processing === request.id ? (
                    <>
                      <div className="btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    'Accept'
                  )}
                </button>
                <button
                  onClick={() => handleRejectRequest(request.id)}
                  disabled={processing === request.id}
                  className="btn btn-reject"
                >
                  {processing === request.id ? (
                    <>
                      <div className="btn-spinner"></div>
                      Processing...
                    </>
                  ) : (
                    'Reject'
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {requests.length === 0 && !loading && (
        <div className="connection-requests__empty">
          <div className="empty-icon">📭</div>
          <h3>No pending requests</h3>
          <p>{'You don\u2019t have any pending connection requests at the moment.'}</p>
          <p>{'When travelers send you connection requests, they\u2019ll appear here.'}</p>
        </div>
      )}
    </div>
  )
}

export default ConnectionRequests
