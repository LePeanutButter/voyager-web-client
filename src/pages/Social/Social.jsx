import React, { useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import { SHARED_ACTIVITY_ACTIONS, SHARED_ACTIVITY_STATUSES } from '../../api/socialContracts'
import { useSocialCollaboration } from '../../hooks/useSocialCollaboration'
import { useAuth } from '../../contexts/AuthContext'
import './Social.css'

const Social = () => {
  const { user } = useAuth()
  const [userId, setUserId] = useState('')
  const [travelPlanId, setTravelPlanId] = useState('')
  const [selectedActivityId, setSelectedActivityId] = useState('')
  const [selectedReceiverId, setSelectedReceiverId] = useState('')
  const [sharedActivityId, setSharedActivityId] = useState('')
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [interestsRaw, setInterestsRaw] = useState('')

  const {
    connections,
    activities,
    sharedActivities,
    filteredMatches,
    availableInterests,
    selectedInterests,
    loading,
    error,
    success,
    loadConnections,
    loadActivities,
    shareActivity,
    resolveSharedActivity,
    loadCompatibilityMatches,
    toggleInterest
  } = useSocialCollaboration()

  const handleLoadConnections = (event) => {
    event.preventDefault()
    const parsedUserId = Number(userId || user?.id)
    if (Number.isNaN(parsedUserId) || parsedUserId <= 0) return
    loadConnections(parsedUserId)
  }

  const handleLoadActivities = (event) => {
    event.preventDefault()
    const parsedTravelPlanId = Number(travelPlanId)
    if (Number.isNaN(parsedTravelPlanId) || parsedTravelPlanId <= 0) return
    loadActivities(parsedTravelPlanId)
  }

  const handleShareActivity = (event) => {
    event.preventDefault()
    const activityId = Number(selectedActivityId)
    const receiverId = Number(selectedReceiverId)
    if (Number.isNaN(activityId) || Number.isNaN(receiverId) || activityId <= 0 || receiverId <= 0) return
    shareActivity(activityId, receiverId)
  }

  const handleCompatibilitySubmit = (event) => {
    event.preventDefault()
    if (!destination.trim() || !startDate || !endDate) return
    loadCompatibilityMatches({ destination, startDate, endDate, interestsRaw })
  }

  return (
    <div className="social-page">
      <h1>Social Collaboration</h1>
      <p className="social-subtitle">Shared activities and compatibility suggestions</p>

      {success && <div className="alert success">{success}</div>}
      {error && <div className="alert error">{error}</div>}

      <div className="social-grid">
        <Card title="Shared Activities">
          <form className="form-stack" onSubmit={handleLoadConnections}>
            <label htmlFor="userId">Your user ID</label>
            <input id="userId" value={userId} onChange={(event) => setUserId(event.target.value)} />
            <Button type="submit" loading={loading.connections}>Load Connections</Button>
          </form>

          <div className="chip-list">
            {connections.map((connection) => (
              <button
                key={connection.id}
                type="button"
                className={`chip ${String(connection.id) === selectedReceiverId ? 'active' : ''}`}
                onClick={() => setSelectedReceiverId(String(connection.id))}
              >
                {connection.username} ({connection.status})
              </button>
            ))}
          </div>

          <form className="form-stack" onSubmit={handleLoadActivities}>
            <label htmlFor="travelPlanId">Travel plan ID</label>
            <input id="travelPlanId" value={travelPlanId} onChange={(event) => setTravelPlanId(event.target.value)} />
            <Button type="submit" loading={loading.activities}>Load Activities</Button>
          </form>

          <div className="chip-list">
            {activities.map((activity) => (
              <button
                key={activity.id}
                type="button"
                className={`chip ${String(activity.id) === selectedActivityId ? 'active' : ''}`}
                onClick={() => setSelectedActivityId(String(activity.id))}
              >
                {activity.name}
              </button>
            ))}
          </div>

          <form className="form-stack" onSubmit={handleShareActivity}>
            <label htmlFor="activityId">Activity ID</label>
            <input id="activityId" value={selectedActivityId} onChange={(event) => setSelectedActivityId(event.target.value)} />
            <label htmlFor="receiverId">Receiver ID</label>
            <input id="receiverId" value={selectedReceiverId} onChange={(event) => setSelectedReceiverId(event.target.value)} />
            <Button type="submit" loading={loading.share}>Share Activity</Button>
          </form>

          <form
            className="form-stack compact"
            onSubmit={(event) => {
              event.preventDefault()
              const id = Number(sharedActivityId)
              if (Number.isNaN(id) || id <= 0) return
              resolveSharedActivity(id, SHARED_ACTIVITY_ACTIONS.ACCEPT)
            }}
          >
            <label htmlFor="sharedActivityId">Shared activity ID (incoming)</label>
            <input id="sharedActivityId" value={sharedActivityId} onChange={(event) => setSharedActivityId(event.target.value)} />
            <div className="button-row">
              <Button type="submit" variant="primary" loading={loading.resolve}>Accept</Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading.resolve}
                onClick={() => {
                  const id = Number(sharedActivityId)
                  if (Number.isNaN(id) || id <= 0) return
                  resolveSharedActivity(id, SHARED_ACTIVITY_ACTIONS.REJECT)
                }}
              >
                Reject
              </Button>
            </div>
          </form>
        </Card>

        <Card title="Shared Activity Results">
          {!sharedActivities.length && <p className="empty-text">No shared activity responses yet.</p>}
          <div className="result-list">
            {sharedActivities.map((item) => (
              <div key={item.id} className="result-item">
                <div>
                  <strong>Shared #{item.id}</strong> | Activity #{item.activityId}
                </div>
                <span className={`status-badge ${item.status?.toLowerCase()}`}>
                  {item.status || SHARED_ACTIVITY_STATUSES.PENDING}
                </span>
                <small>
                  sender: {item.senderId} | receiver: {item.receiverId} | sharedPlan: {String(item.sharedPlan)}
                </small>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card title="Compatibility Suggestions">
        <form className="compatibility-form" onSubmit={handleCompatibilitySubmit}>
          <div className="grid-2">
            <div className="form-stack compact">
              <label htmlFor="destination">Destination</label>
              <input id="destination" value={destination} onChange={(event) => setDestination(event.target.value)} />
            </div>
            <div className="form-stack compact">
              <label htmlFor="interests">Interests (comma separated)</label>
              <input id="interests" value={interestsRaw} onChange={(event) => setInterestsRaw(event.target.value)} />
            </div>
            <div className="form-stack compact">
              <label htmlFor="startDate">Start date</label>
              <input id="startDate" type="date" value={startDate} onChange={(event) => setStartDate(event.target.value)} />
            </div>
            <div className="form-stack compact">
              <label htmlFor="endDate">End date</label>
              <input id="endDate" type="date" value={endDate} onChange={(event) => setEndDate(event.target.value)} />
            </div>
          </div>
          <Button type="submit" loading={loading.matches}>Find Matches</Button>
        </form>

        {!!availableInterests.length && (
          <div className="chip-list">
            {availableInterests.map((interest) => (
              <button
                key={interest}
                type="button"
                className={`chip ${selectedInterests.includes(interest) ? 'active' : ''}`}
                onClick={() => toggleInterest(interest)}
              >
                {interest}
              </button>
            ))}
          </div>
        )}

        {!loading.matches && !filteredMatches.length && (
          <p className="empty-text">No compatibility matches found for the selected criteria.</p>
        )}

        <div className="result-list">
          {filteredMatches.map((match) => (
            <div key={`${match.userId}-${match.totalScore}`} className="result-item">
              <div className="result-heading">
                <strong>Traveler #{match.userId}</strong>
                <span className="score">{match.totalScore.toFixed(2)}</span>
              </div>
              <small>
                destination: {match.destinationScore.toFixed(2)} | date: {match.dateProximityScore.toFixed(2)} | interests: {match.interestScore.toFixed(2)}
              </small>
              <small>matched interests: {match.matchedInterests.join(', ') || 'none'}</small>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default Social
