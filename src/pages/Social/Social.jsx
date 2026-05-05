import React, { useState } from 'react'
import Card from '../../components/UI/Card'
import Button from '../../components/UI/Button'
import ActiveConnections from '../../components/ActiveConnections/ActiveConnections'
import { SHARED_ACTIVITY_ACTIONS, SHARED_ACTIVITY_STATUSES } from '../../api/socialContracts'
import { useSocialCollaboration } from '../../hooks/useSocialCollaboration'
import { useAuth } from '../../contexts/AuthContext'
import './Social.css'

const Social = () => {
  const { user } = useAuth()
  const userId = user?.id ?? null

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
    if (!userId) return
    loadConnections(userId)
  }

  const handleLoadActivities = (event) => {
    event.preventDefault()
    const id = Number(travelPlanId)
    if (Number.isNaN(id) || id <= 0) return
    loadActivities(id)
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

      {/* 🔹 ESTA PARTE VIENE DE LA OTRA RAMA (IMPORTANTE) */}
      <Card title="Tus relaciones en la plataforma">
        <ActiveConnections userId={userId} />
      </Card>

      <div className="social-grid">
        <Card title="Shared Activities">
          <form className="form-stack" onSubmit={handleLoadConnections}>
            <Button type="submit" loading={loading.connections}>
              Load Connections
            </Button>
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
            <label>Travel plan ID</label>
            <input value={travelPlanId} onChange={(e) => setTravelPlanId(e.target.value)} />
            <Button type="submit" loading={loading.activities}>
              Load Activities
            </Button>
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
            <Button type="submit" loading={loading.share}>
              Share Selected Activity
            </Button>
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
            <label>Shared activity ID</label>
            <input value={sharedActivityId} onChange={(e) => setSharedActivityId(e.target.value)} />

            <div className="button-row">
              <Button type="submit" loading={loading.resolve}>
                Accept
              </Button>
              <Button
                type="button"
                variant="outline"
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
          {!sharedActivities.length && <p>No results yet.</p>}

          {sharedActivities.map((item) => (
            <div key={item.id}>
              <strong>#{item.id}</strong> - {item.status || SHARED_ACTIVITY_STATUSES.PENDING}
            </div>
          ))}
        </Card>
      </div>

      <Card title="Compatibility Suggestions">
        <form onSubmit={handleCompatibilitySubmit}>
          <input placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          <input placeholder="Interests" value={interestsRaw} onChange={(e) => setInterestsRaw(e.target.value)} />

          <Button type="submit" loading={loading.matches}>
            Find Matches
          </Button>
        </form>

        <div className="chip-list">
          {availableInterests.map((i) => (
            <button
              key={i}
              className={selectedInterests.includes(i) ? 'active chip' : 'chip'}
              onClick={() => toggleInterest(i)}
            >
              {i}
            </button>
          ))}
        </div>

        {filteredMatches.map((m) => (
          <div key={m.userId}>
            User {m.userId} - Score {m.totalScore.toFixed(2)}
          </div>
        ))}
      </Card>
    </div>
  )
}

export default Social