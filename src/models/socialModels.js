import { SHARED_ACTIVITY_STATUSES } from '../api/socialContracts'

const toArray = (value) => (Array.isArray(value) ? value : [])

export const normalizeConnections = (payload) =>
  toArray(payload).map((item) => ({
    id: Number(item?.id) || 0,
    username: String(item?.username || 'Unknown user'),
    status: String(item?.status || '')
  }))

export const normalizeActivities = (payload) =>
  toArray(payload).map((item) => ({
    id: Number(item?.id) || 0,
    name: String(item?.name || `Activity ${item?.id ?? ''}`).trim()
  }))

export const normalizeSharedActivity = (payload) => ({
  id: Number(payload?.id) || 0,
  activityId: Number(payload?.activityId) || 0,
  senderId: Number(payload?.senderId) || 0,
  receiverId: Number(payload?.receiverId) || 0,
  status: String(payload?.status || SHARED_ACTIVITY_STATUSES.PENDING),
  sharedPlan: Boolean(payload?.sharedPlan)
})

export const normalizeCompatibilityMatches = (payload) =>
  toArray(payload).map((item) => ({
    userId: Number(item?.userId) || 0,
    totalScore: Number(item?.totalScore) || 0,
    destinationScore: Number(item?.destinationScore) || 0,
    dateProximityScore: Number(item?.dateProximityScore) || 0,
    interestScore: Number(item?.interestScore) || 0,
    matchedInterests: toArray(item?.matchedInterests).map((interest) => String(interest))
  }))
