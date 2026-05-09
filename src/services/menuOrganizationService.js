/**
 * Menu Organization Service
 * Handles intelligent menu reorganization API calls
 */

import axios from 'axios';

// Create separate API instance for AI service
const aiApi = axios.create({
  baseURL: import.meta.env.VITE_AI_SERVICE_BASE_URL || 'http://localhost:8000',
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
    return Promise.reject(error)
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
    
    // Extract error message with better handling for menu organization errors
    let errorMessage = error.message || 'An error occurred'
    
    if (error.response?.data?.detail) {
      errorMessage = error.response.data.detail
    } else if (error.response?.data?.message) {
      errorMessage = error.response.data.message
    }
    
    // Handle common menu organization errors with user-friendly messages
    if (errorMessage.includes('No interaction data found')) {
      errorMessage = 'No hay datos de interacción. Usa el menú durante unos días para generar patrones.'
    } else if (error.response?.status === 404) {
      errorMessage = 'No se encontraron datos de personalización. Se mostrará el menú predeterminado.'
    } else if (error.response?.status === 422) {
      errorMessage = 'Se necesitan más interacciones para personalizar el menú. Continúa usando la plataforma.'
    }
    
    // Return a more user-friendly error
    return Promise.reject(new Error(errorMessage))
  }
);

// Menu interaction types enum
export const MenuInteractionType = {
  CLICK: 'click',
  VIEW: 'view',
  DISMISS: 'dismiss',
  HOVER: 'hover',
  SEARCH: 'search'
};

// Menu priority enum
export const MenuPriority = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low'
};

// Menu category enum
export const MenuCategory = {
  PRIMARY: 'primary',
  SECONDARY: 'secondary',
  HIDDEN: 'hidden'
};

/**
 * Track menu interaction for intelligent reorganization
 * @param {Object} trackingData - Menu interaction tracking data
 * @param {string} trackingData.userId - User ID
 * @param {string} trackingData.menuItem - Menu item ID or name
 * @param {string} trackingData.action - Type of interaction (click, view, dismiss, hover, search)
 * @param {Date} [trackingData.timestamp] - Timestamp of interaction
 * @param {Object} [trackingData.context] - Additional context information
 * @returns {Promise<Object>} API response
 */
export const trackMenuInteraction = async (trackingData) => {
  try {
    const response = await aiApi.post('/api/v1/menu/track-interaction', {
      ...trackingData,
      timestamp: trackingData.timestamp || new Date().toISOString()
    });
    return response;
  } catch (error) {
    console.error('Error tracking menu interaction:', error);
    throw error;
  }
};

/**
 * Get personalized menu layout based on user behavior
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Personalized menu layout
 */
export const getPersonalizedMenuLayout = async (userId) => {
  try {
    const response = await aiApi.get(`/api/v1/menu/personalized-layout/${userId}`);
    return response;
  } catch (error) {
    console.error('Error getting personalized menu layout:', error);
    throw error;
  }
};

/**
 * Update user's explicit menu preferences
 * @param {string} userId - User ID
 * @param {Object} preferences - Menu preferences
 * @param {Array} [preferences.preferredItems] - List of menu items to prioritize
 * @param {Array} [preferences.hiddenItems] - List of menu items to hide
 * @param {Object} [preferences.priorityChanges] - Manual priority adjustments
 * @returns {Promise<Object>} API response
 */
export const updateMenuPreferences = async (userId, preferences) => {
  try {
    const response = await aiApi.post(`/api/v1/menu/user-preferences/${userId}`, preferences);
    return response;
  } catch (error) {
    console.error('Error updating menu preferences:', error);
    throw error;
  }
};

/**
 * Get menu usage analytics for a user
 * @param {string} userId - User ID
 * @param {number} [days=30] - Number of days to analyze
 * @returns {Promise<Object>} Menu usage analytics
 */
export const getMenuAnalytics = async (userId, days = 30) => {
  try {
    const response = await aiApi.get(`/api/v1/menu/analytics/${userId}`, {
      params: { days }
    });
    return response;
  } catch (error) {
    console.error('Error getting menu analytics:', error);
    throw error;
  }
};

/**
 * Reset user's menu layout to default
 * @param {string} userId - User ID
 * @returns {Promise<Object>} API response
 */
export const resetMenuLayout = async (userId) => {
  try {
    const response = await aiApi.post(`/api/v1/menu/reset-layout/${userId}`);
    return response;
  } catch (error) {
    console.error('Error resetting menu layout:', error);
    throw error;
  }
};

/**
 * Get the default menu layout
 * @returns {Promise<Object>} Default menu layout
 */
export const getDefaultMenuLayout = async () => {
  try {
    const response = await aiApi.get('/api/v1/menu/default-layout');
    return response;
  } catch (error) {
    console.error('Error getting default menu layout:', error);
    throw error;
  }
};

/**
 * Track multiple menu interactions in a batch
 * @param {Array} trackingRequests - Array of menu interaction requests
 * @returns {Promise<Object>} API response
 */
export const batchTrackMenuInteractions = async (trackingRequests) => {
  try {
    const response = await aiApi.post('/api/v1/menu/batch-track', trackingRequests);
    return response;
  } catch (error) {
    console.error('Error batch tracking menu interactions:', error);
    throw error;
  }
};

/**
 * Menu tracking utility class for easier usage
 */
export class MenuTracker {
  constructor(userId) {
    this.userId = userId;
    this.pendingInteractions = [];
    this.lastViewedItems = new Set();
  }

  /**
   * Track a menu interaction
   * @param {string} menuItem - Menu item ID or name
   * @param {string} action - Type of interaction
   * @param {Object} [context] - Additional context
   */
  async track(menuItem, action, context = {}) {
    const trackingData = {
      userId: this.userId,
      menuItem,
      action,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: globalThis.location.href,
        viewport: {
          width: globalThis.innerWidth,
          height: globalThis.innerHeight
        }
      }
    };

    try {
      await trackMenuInteraction(trackingData);
    } catch (error) {
      // Queue failed interactions for batch retry
      this.pendingInteractions.push(trackingData);
      console.warn('Menu interaction queued for batch retry:', error);
    }
  }

  /**
   * Track a menu click
   * @param {string} menuItem - Menu item ID or name
   * @param {Object} [context] - Additional context
   */
  async trackClick(menuItem, context = {}) {
    await this.track(menuItem, MenuInteractionType.CLICK, context);
  }

  /**
   * Track a menu view
   * @param {string} menuItem - Menu item ID or name
   * @param {Object} [context] - Additional context
   */
  async trackView(menuItem, context = {}) {
    // Avoid duplicate view tracking for the same item in a session
    if (this.lastViewedItems.has(menuItem)) {
      return;
    }
    
    await this.track(menuItem, MenuInteractionType.VIEW, context);
    this.lastViewedItems.add(menuItem);
  }

  /**
   * Track a menu dismiss
   * @param {string} menuItem - Menu item ID or name
   * @param {Object} [context] - Additional context
   */
  async trackDismiss(menuItem, context = {}) {
    await this.track(menuItem, MenuInteractionType.DISMISS, context);
  }

  /**
   * Track a menu hover
   * @param {string} menuItem - Menu item ID or name
   * @param {Object} [context] - Additional context
   */
  async trackHover(menuItem, context = {}) {
    await this.track(menuItem, MenuInteractionType.HOVER, context);
  }

  /**
   * Track a menu search
   * @param {string} menuItem - Menu item ID or name
   * @param {Object} [context] - Additional context
   */
  async trackSearch(menuItem, context = {}) {
    await this.track(menuItem, MenuInteractionType.SEARCH, context);
  }

  /**
   * Flush pending interactions
   */
  async flushPendingInteractions() {
    if (this.pendingInteractions.length > 0) {
      try {
        await batchTrackMenuInteractions(this.pendingInteractions);
        this.pendingInteractions = [];
      } catch (error) {
        console.error('Failed to flush pending menu interactions:', error);
      }
    }
  }

  /**
   * Clear viewed items tracking (useful for new sessions)
   */
  clearViewedItems() {
    this.lastViewedItems.clear();
  }
}

export default {
  MenuInteractionType,
  MenuPriority,
  MenuCategory,
  trackMenuInteraction,
  getPersonalizedMenuLayout,
  updateMenuPreferences,
  getMenuAnalytics,
  resetMenuLayout,
  getDefaultMenuLayout,
  batchTrackMenuInteractions,
  MenuTracker
};
