import { useMemo, useState } from 'react'
import { SHARED_ACTIVITY_ACTIONS } from '../api/socialContracts'
import { socialCollaborationService } from '../services/socialCollaborationService'

const toInterestList = (rawValue) =>
  rawValue
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

export const useSocialCollaboration = () => {
  const [connections, setConnections] = useState([])
  const [activities, setActivities] = useState([])
  const [sharedActivities, setSharedActivities] = useState([])
  const [allMatches, setAllMatches] = useState([])
  const [selectedInterests, setSelectedInterests] = useState([])
  const [loading, setLoading] = useState({
    connections: false,
    activities: false,
    share: false,
    resolve: false,
    matches: false
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const filteredMatches = useMemo(() => {
    if (!selectedInterests.length) return allMatches
    return allMatches.filter((match) =>
      match.matchedInterests.some((interest) => selectedInterests.includes(interest))
    )
  }, [allMatches, selectedInterests])

  const availableInterests = useMemo(
    () => [...new Set(allMatches.flatMap((match) => match.matchedInterests))],
    [allMatches]
  )

  const loadConnections = async (userId) => {
    setLoading((prev) => ({ ...prev, connections: true }))
    setError('')
    try {
      const result = await socialCollaborationService.getConnections(userId)
      setConnections(result)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load connections')
    } finally {
      setLoading((prev) => ({ ...prev, connections: false }))
    }
  }

  const loadActivities = async (travelPlanId) => {
    setLoading((prev) => ({ ...prev, activities: true }))
    setError('')
    try {
      const result = await socialCollaborationService.getTripActivities(travelPlanId)
      setActivities(result)
    } catch (requestError) {
      setError(requestError.message || 'Failed to load activities')
    } finally {
      setLoading((prev) => ({ ...prev, activities: false }))
    }
  }

  const shareActivity = async (activityId, receiverId) => {
    setLoading((prev) => ({ ...prev, share: true }))
    setError('')
    setSuccess('')
    try {
      const result = await socialCollaborationService.shareActivity(activityId, receiverId)
      setSharedActivities((prev) => [result, ...prev.filter((item) => item.id !== result.id)])
      setSuccess('Activity shared successfully.')
    } catch (requestError) {
      setError(requestError.message || 'Failed to share activity')
    } finally {
      setLoading((prev) => ({ ...prev, share: false }))
    }
  }

  const resolveSharedActivity = async (sharedActivityId, action) => {
    setLoading((prev) => ({ ...prev, resolve: true }))
    setError('')
    setSuccess('')
    try {
      const result = await socialCollaborationService.updateSharedActivity(sharedActivityId, action)
      setSharedActivities((prev) => {
        const exists = prev.some((item) => item.id === result.id)
        if (!exists) return [result, ...prev]
        return prev.map((item) => (item.id === result.id ? result : item))
      })
      setSuccess(`Shared activity ${action === SHARED_ACTIVITY_ACTIONS.ACCEPT ? 'accepted' : 'rejected'}.`)
    } catch (requestError) {
      setError(requestError.message || 'Failed to update shared activity')
    } finally {
      setLoading((prev) => ({ ...prev, resolve: false }))
    }
  }

  const loadCompatibilityMatches = async ({ destination, startDate, endDate, interestsRaw }) => {
    setLoading((prev) => ({ ...prev, matches: true }))
    setError('')
    setSuccess('')
    try {
      const request = {
        destination: destination.trim(),
        startDate,
        endDate,
        interests: toInterestList(interestsRaw)
      }
      const result = await socialCollaborationService.getCompatibilityMatches(request)
      setAllMatches(result)
      setSelectedInterests([])
    } catch (requestError) {
      setError(requestError.message || 'Failed to load compatibility matches')
    } finally {
      setLoading((prev) => ({ ...prev, matches: false }))
    }
  }

  const toggleInterest = (interest) => {
    setSelectedInterests((prev) =>
      prev.includes(interest) ? prev.filter((item) => item !== interest) : [...prev, interest]
    )
  }

  return {
    connections,
    activities,
    sharedActivities,
    allMatches,
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
  }
}
