export const SOCIAL_ENDPOINTS = {
  connections: (userId) => `/v1/social/connections/${userId}`,
  tripActivities: (travelPlanId) => `/v1/travel-plans/${travelPlanId}/activities`,
  shareActivity: (activityId) => `/v1/activities/${activityId}/share`,
  sharedActivityDecision: (sharedActivityId) => `/v1/shared-activities/${sharedActivityId}`,
  compatibilityMatches: '/v1/compatibility/matches'
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
