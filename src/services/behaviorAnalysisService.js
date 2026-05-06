/**
 * Behavior Analysis Service
 * Handles implicit user behavior tracking and analysis API calls
 */

import axios from 'axios';

// Create separate API instance for AI service
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_BASE_URL || '/api/v1',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
aiApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('smartrip_token') || localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    throw error
  }
);

// Response interceptor for error handling
aiApi.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    // Handle common error cases
    if (error.response?.status === 401) {
      // Unauthorized - clear token and redirect to login
      localStorage.removeItem('smartrip_token')
      localStorage.removeItem('token')
      localStorage.removeItem('userData')
      globalThis.location.href = '/login'
    }
    
    // Extract error message with better handling for behavior analysis errors
    let errorMessage = error.message || 'An error occurred'
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    // Handle common behavior analysis errors with user-friendly messages
    if (errorMessage.includes('No behavior data found')) {
      errorMessage = 'No hay datos de comportamiento. Usa la plataforma durante unos días para generar patrones.'
    } else if (error.response?.status === 422) {
      errorMessage = 'Se necesitan más interacciones para analizar el comportamiento. Continúa usando la plataforma.'
    }
    
    // Return a more user-friendly error
    throw new Error(errorMessage)
  }
);

// Interaction types enum
export const InteractionType = {
  VIEW: 'view',
  CLICK: 'click',
  BOOKMARK: 'bookmark',
  SHARE: 'share',
  REJECT: 'reject',
  BOOK: 'book',
  RATE: 'rate',
  SEARCH: 'search',
  FILTER: 'filter'
};

/**
 * Track user interaction for behavior analysis
 * @param {Object} trackingData - Behavior tracking data
 * @param {string} trackingData.userId - User ID
 * @param {string} trackingData.interactionType - Type of interaction
 * @param {string} [trackingData.activityId] - Activity ID
 * @param {string} [trackingData.activityCategory] - Activity category
 * @param {number} [trackingData.sessionDuration] - Session duration in seconds
 * @param {Object} [trackingData.context] - Additional context
 * @returns {Promise<Object>} API response
 */
export const trackUserBehavior = async (trackingData) => {
  try {
    const response = await aiApi.post('/api/v1/behavior-analysis/track', trackingData);
    return response;
  } catch (error) {
    console.error('Error tracking user behavior:', error);
    throw error;
  }
};

/**
 * Analyze user behavior patterns
 * @param {Object} analysisData - Behavior analysis data
 * @param {string} analysisData.userId - User ID
 * @param {number} [analysisData.analysisPeriodDays=7] - Analysis period in days
 * @param {boolean} [analysisData.includePatterns=true] - Include detected patterns
 * @param {boolean} [analysisData.includePreferenceUpdates=true] - Include preference updates
 * @returns {Promise<Object>} Implicit preference update
 */
export const analyzeUserBehavior = async (analysisData) => {
  try {
    const response = await aiApi.post('/api/v1/behavior-analysis/analyze', analysisData);
    return response;
  } catch (error) {
    console.error('Error analyzing user behavior:', error);
    throw error;
  }
};

/**
 * Get behavior summary for a user
 * @param {string} userId - User ID
 * @param {number} [days=30] - Number of days to analyze
 * @returns {Promise<Object>} Behavior summary
 */
export const getBehaviorSummary = async (userId, days = 30) => {
  try {
    const response = await aiApi.get(`/api/v1/behavior-analysis/summary/${userId}`, {
      params: { days }
    });
    return response;
  } catch (error) {
    console.error('Error getting behavior summary:', error);
    throw error;
  }
};

/**
 * Batch track multiple user interactions
 * @param {Array} trackingRequests - Array of behavior tracking requests
 * @returns {Promise<Object>} API response
 */
export const batchTrackBehavior = async (trackingRequests) => {
  try {
    const response = await aiApi.post('/api/v1/behavior-analysis/batch-track', trackingRequests);
    return response;
  } catch (error) {
    console.error('Error batch tracking behavior:', error);
    throw error;
  }
};

/**
 * Get detected behavior patterns for a user
 * @param {string} userId - User ID
 * @param {number} [days=7] - Number of days to analyze
 * @returns {Promise<Object>} Detected patterns
 */
export const getDetectedPatterns = async (userId, days = 7) => {
  try {
    const response = await aiApi.get(`/api/v1/behavior-analysis/patterns/${userId}`, {
      params: { days }
    });
    return response;
  } catch (error) {
    console.error('Error getting detected patterns:', error);
    throw error;
  }
};

/**
 * Clear all behavior data for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} API response
 */
export const clearUserBehaviorData = async (userId) => {
  try {
    const response = await aiApi.delete(`/api/v1/behavior-analysis/clear/${userId}`);
    return response;
  } catch (error) {
    console.error('Error clearing behavior data:', error);
    throw error;
  }
};

/**
 * Behavior tracking utility class for easier usage
 */
export class BehaviorTracker {
  constructor(userId) {
    this.userId = userId;
    this.sessionStartTime = Date.now();
    this.pendingInteractions = [];
  }

  /**
   * Track an interaction
   * @param {string} interactionType - Type of interaction
   * @param {Object} [options] - Additional options
   */
  async track(interactionType, options = {}) {
    const trackingData = {
      userId: this.userId,
      interactionType,
      activityId: options.activityId,
      activityCategory: options.activityCategory,
      sessionDuration: Math.floor((Date.now() - this.sessionStartTime) / 1000),
      context: {
        ...options.context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      }
    };

    try {
      await trackUserBehavior(trackingData);
    } catch (error) {
      // Queue failed interactions for batch retry
      this.pendingInteractions.push(trackingData);
      console.warn('Interaction queued for batch retry:', error);
    }
  }

  /**
   * Track a view interaction
   * @param {Object} options - Additional options
   */
  async trackView(options = {}) {
    await this.track(InteractionType.VIEW, options);
  }

  /**
   * Track a click interaction
   * @param {Object} options - Additional options
   */
  async trackClick(options = {}) {
    await this.track(InteractionType.CLICK, options);
  }

  /**
   * Track a bookmark interaction
   * @param {Object} options - Additional options
   */
  async trackBookmark(options = {}) {
    await this.track(InteractionType.BOOKMARK, options);
  }

  /**
   * Track a share interaction
   * @param {Object} options - Additional options
   */
  async trackShare(options = {}) {
    await this.track(InteractionType.SHARE, options);
  }

  /**
   * Track a rejection interaction
   * @param {Object} options - Additional options
   */
  async trackReject(options = {}) {
    await this.track(InteractionType.REJECT, options);
  }

  /**
   * Track a booking interaction
   * @param {Object} options - Additional options
   */
  async trackBook(options = {}) {
    await this.track(InteractionType.BOOK, options);
  }

  /**
   * Track a rating interaction
   * @param {Object} options - Additional options
   */
  async trackRate(options = {}) {
    await this.track(InteractionType.RATE, options);
  }

  /**
   * Track a search interaction
   * @param {Object} options - Additional options
   */
  async trackSearch(options = {}) {
    await this.track(InteractionType.SEARCH, options);
  }

  /**
   * Track a filter interaction
   * @param {Object} options - Additional options
   */
  async trackFilter(options = {}) {
    await this.track(InteractionType.FILTER, options);
  }

  /**
   * Flush pending interactions
   */
  async flushPendingInteractions() {
    if (this.pendingInteractions.length > 0) {
      try {
        await batchTrackBehavior(this.pendingInteractions);
        this.pendingInteractions = [];
      } catch (error) {
        console.error('Failed to flush pending interactions:', error);
      }
    }
  }

  /**
   * Get session duration in seconds
   */
  getSessionDuration() {
    return Math.floor((Date.now() - this.sessionStartTime) / 1000);
  }
}

export default {
  InteractionType,
  trackUserBehavior,
  analyzeUserBehavior,
  getBehaviorSummary,
  batchTrackBehavior,
  getDetectedPatterns,
  clearUserBehaviorData,
  BehaviorTracker
};
