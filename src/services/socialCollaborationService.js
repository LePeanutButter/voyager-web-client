import api from './api'
import { SOCIAL_ENDPOINTS } from '../api/socialContracts'
import {
  normalizeActivities,
  normalizeCompatibilityMatches,
  normalizeConnections,
  normalizeSharedActivity
} from '../models/socialModels'

const unwrapApiResponse = (response) => {
  if (!response || typeof response !== 'object') {
    return null
  }
  // Backend usually returns ApiResponse<T> with a `data` field.
  // Keep a safe fallback for direct payload responses to avoid runtime data loss.
  return Object.hasOwn(response, 'data') ? response.data : response
}

export const socialCollaborationService = {
  async getConnections(userId) {
    const response = await api.get(SOCIAL_ENDPOINTS.connections(userId))
    return normalizeConnections(unwrapApiResponse(response))
  },

  async getTripActivities(travelPlanId) {
    const response = await api.get(SOCIAL_ENDPOINTS.tripActivities(travelPlanId))
    return normalizeActivities(unwrapApiResponse(response))
  },

  async shareActivity(activityId, receiverId) {
    const response = await api.post(SOCIAL_ENDPOINTS.shareActivity(activityId), {
      receiverId
    })
    return normalizeSharedActivity(unwrapApiResponse(response))
  },

  async updateSharedActivity(sharedActivityId, action) {
    const response = await api.patch(SOCIAL_ENDPOINTS.sharedActivityDecision(sharedActivityId), {
      action
    })
    return normalizeSharedActivity(unwrapApiResponse(response))
  },

  async getCompatibilityMatches(request) {
    const response = await api.post(SOCIAL_ENDPOINTS.compatibilityMatches, request)
    return normalizeCompatibilityMatches(unwrapApiResponse(response))
  },

  // Legacy endpoints (backward compatibility)
  async shareActivityLegacy(activityId, receiverId) {
    const response = await api.post(`/legacy/activities/${activityId}/share`, { receiverId })
    return normalizeSharedActivity(unwrapApiResponse(response))
  },

  async updateSharedActivityLegacy(sharedActivityId, action) {
    const response = await api.patch(`/legacy/shared-activities/${sharedActivityId}`, { action })
    return normalizeSharedActivity(unwrapApiResponse(response))
  },
}
