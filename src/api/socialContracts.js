export const SOCIAL_ENDPOINTS = {
  connections: (userId) => `/social/connections/${userId}`,
  tripActivities: (travelPlanId) => `/travel-plans/${travelPlanId}/activities`,
  shareActivity: (activityId) => `/activities/${activityId}/share`,
  sharedActivityDecision: (sharedActivityId) => `/shared-activities/${sharedActivityId}`,
  compatibilityMatches: '/compatibility/matches'
}

export const SHARED_ACTIVITY_ACTIONS = {
  ACCEPT: 'ACCEPT',
  REJECT: 'REJECT'
}

export const SHARED_ACTIVITY_STATUSES = {
  PENDING: 'PENDING',
  ACCEPTED: 'ACCEPTED',
  REJECTED: 'REJECTED'
}
