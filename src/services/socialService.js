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
    return response || []
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
    return response
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
    return response
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
    return response
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
    return response || []
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
    return response || []
  } catch (error) {
    console.error('Error fetching sent requests:', error)
    throw error
  }
}

const unwrapList = (body) => {
  if (Array.isArray(body)) return body
  if (body && Array.isArray(body.data)) return body.data
  return []
}

/**
 * @param {number|string} userId
 * @returns {Promise<Array>}
 */
export const getUserConnections = async (userId) => {
  try {
    const response = await api.get(`/social/connections/${userId}`)
    return unwrapList(response)
  } catch (error) {
    console.error('Error fetching user connections:', error)
    throw error
  }
}

/**
 * @param {number|string} connectionId
 * @returns {Promise<void>}
 */
export const removeConnection = async (connectionId) => {
  try {
    await api.delete(`/social/connections/${connectionId}`)
  } catch (error) {
    console.error('Error removing connection:', error)
    throw error
  }
}

const unwrapPageContent = (body) => {
  if (!body) return []
  if (Array.isArray(body)) return body
  const inner = body.data === undefined ? body : body.data
  if (Array.isArray(inner)) return inner
  if (inner?.content && Array.isArray(inner.content)) return inner.content
  if (inner?.records && Array.isArray(inner.records)) return inner.records
  return []
}

/**
 * Paginated messages for a connection (REST).
 * @returns {Promise<{ messages: Array, raw: * }>}
 */
export const getConversationMessages = async (connectionId, userId, page = 0, size = 50) => {
  try {
    const response = await api.get(`/social/connections/${connectionId}/messages`, {
      params: { userId, page, size },
    })
    const messages = unwrapPageContent(response)
    return { messages, raw: response }
  } catch (error) {
    console.error('Error fetching conversation messages:', error)
    throw error
  }
}

/**
 * Spring Data Page (or similar) nested inside ApiResponse `data`.
 * @returns {{ last: boolean, totalPages: number|null, number: number }}
 */
const emptyPageMeta = () => ({ last: true, totalPages: null, number: 0 })

const unwrapPageNode = (raw) => {
  if (!raw || typeof raw !== 'object') return null
  let node = raw.data === undefined ? raw : raw.data
  if (node?.data?.content !== undefined) {
    node = node.data
  }
  return node
}

const extractPageMetadata = (raw) => {
  const node = unwrapPageNode(raw)
  if (node && typeof node === 'object' && Array.isArray(node.content)) {
    return {
      last: Boolean(node.last),
      totalPages: typeof node.totalPages === 'number' ? node.totalPages : null,
      number: typeof node.number === 'number' ? node.number : 0,
    }
  }
  return emptyPageMeta()
}

/**
 * Loads every page of messages for the connection (chronological order is applied in the UI).
 * @param {number|string} connectionId
 * @param {number|string} userId
 * @param {number} [pageSize=50]
 * @returns {Promise<Array>}
 */
export const getAllConversationMessages = async (connectionId, userId, pageSize = 50) => {
  const aggregated = []
  const maxPages = 100
  for (let page = 0; page < maxPages; page++) {
    const { messages, raw } = await getConversationMessages(connectionId, userId, page, pageSize)
    aggregated.push(...messages)
    const meta = extractPageMetadata(raw)
    if (meta.totalPages != null && page >= meta.totalPages - 1) break
    if (meta.last) break
    if (messages.length === 0) break
    if (messages.length < pageSize) break
  }
  return aggregated
}

/**
 * Send message via REST (same persistence as WebSocket handler on backend).
 * @param {{ connectionId: number, senderId: number, content: string }} payload
 */
export const sendTravelerMessage = async ({ connectionId, senderId, content }) => {
  try {
    const response = await api.post('/social/messages', {
      connectionId,
      senderId,
      content,
    })
    return response
  } catch (error) {
    console.error('Error sending traveler message:', error)
    throw error
  }
}

export const markMessageAsRead = async (messageId) => {
  try {
    return await api.put(`/social/messages/${messageId}/read`)
  } catch (error) {
    console.error('Error marking message as read:', error)
    throw error
  }
}

export const getTravelerSummary = async (travelerId) => {
  try {
    return await api.get(`/social/travelers/${travelerId}/summary`)
  } catch (error) {
    console.error('Error fetching traveler summary:', error)
    throw error
  }
}

// Demo-enabled social endpoints
export const getConversations = async (userId) => api.get(`/social/conversations/${userId}`)
export const getSocialFeed = async (userId, page = 0, size = 20) =>
  api.get(`/social/feed/${userId}`, { params: { page, size } })
export const createPost = async (payload) => api.post('/social/posts', payload)
export const likePost = async (postId) => api.post(`/social/posts/${postId}/like`)
export const unlikePost = async (postId) => api.delete(`/social/posts/${postId}/like`)
export const commentOnPost = async (postId, payload) => api.post(`/social/posts/${postId}/comments`, payload)
export const getPostComments = async (postId, page = 0, size = 20) =>
  api.get(`/social/posts/${postId}/comments`, { params: { page, size } })
export const createReview = async (payload) => api.post('/social/reviews', payload)
export const getReviews = async (targetType, targetId, page = 0, size = 20) =>
  api.get(`/social/reviews/${targetType}/${targetId}`, { params: { page, size } })
export const updateReview = async (reviewId, payload) => api.put(`/social/reviews/${reviewId}`, payload)
export const deleteReview = async (reviewId) => api.delete(`/social/reviews/${reviewId}`)

/** Aggregate export for consumers that prefer a single namespace object */
export const socialService = {
  getCompatibleTravelers,
  sendConnectionRequest,
  acceptConnectionRequest,
  rejectConnectionRequest,
  getPendingRequests,
  getSentRequests,
  getUserConnections,
  removeConnection,
  getConversationMessages,
  getAllConversationMessages,
  sendTravelerMessage,
  markMessageAsRead,
  getTravelerSummary,
  getConversations,
  getSocialFeed,
  createPost,
  likePost,
  unlikePost,
  commentOnPost,
  getPostComments,
  createReview,
  getReviews,
  updateReview,
  deleteReview,
}
