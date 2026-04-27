import api from './api'

/**
 * Service for social features including traveler matching and connection requests
 */

/**
 * Find compatible travelers for a specific travel plan
 * @param {string} travelPlanId - The ID of the travel plan
 * @returns {Promise<Array>} List of compatible travelers
 */
export const getCompatibleTravelers = async (travelPlanId) => {
  try {
    const response = await api.get(`/travel-plans/${travelPlanId}/compatible-travelers`)
    return response.data || []
  } catch (error) {
    console.error('Error fetching compatible travelers:', error)
    throw error
  }
}

/**
 * Send a connection request to another traveler
 * @param {Object} requestData - Connection request data
 * @param {number} requestData.recipientId - ID of the recipient
 * @param {string} [requestData.message] - Optional message
 * @returns {Promise<Object>} Created connection request
 */
export const sendConnectionRequest = async (requestData) => {
  try {
    const response = await api.post('/social/connections', requestData)
    return response.data
  } catch (error) {
    console.error('Error sending connection request:', error)
    throw error
  }
}

/**
 * Accept a connection request
 * @param {string} requestId - The ID of the connection request
 * @returns {Promise<Object>} Updated connection request
 */
export const acceptConnectionRequest = async (requestId) => {
  try {
    const response = await api.put(`/social/connections/${requestId}/accept`)
    return response.data
  } catch (error) {
    console.error('Error accepting connection request:', error)
    throw error
  }
}

/**
 * Reject a connection request
 * @param {string} requestId - The ID of the connection request
 * @returns {Promise<Object>} Updated connection request
 */
export const rejectConnectionRequest = async (requestId) => {
  try {
    const response = await api.put(`/social/connections/${requestId}/reject`)
    return response.data
  } catch (error) {
    console.error('Error rejecting connection request:', error)
    throw error
  }
}

/**
 * Get pending connection requests received by the user
 * @returns {Promise<Array>} List of pending connection requests
 */
export const getPendingRequests = async () => {
  try {
    const response = await api.get('/social/connections/pending')
    return response.data || []
  } catch (error) {
    console.error('Error fetching pending requests:', error)
    throw error
  }
}

/**
 * Get connection requests sent by the user
 * @returns {Promise<Array>} List of sent connection requests
 */
export const getSentRequests = async () => {
  try {
    const response = await api.get('/social/connections/sent')
    return response.data || []
  } catch (error) {
    console.error('Error fetching sent requests:', error)
    throw error
  }
}
