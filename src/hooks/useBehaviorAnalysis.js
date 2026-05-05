/**
 * Custom hook for behavior analysis functionality
 * Provides easy integration with behavior tracking and analysis
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext.jsx';
import { 
  BehaviorTracker, 
  trackUserBehavior,
  analyzeUserBehavior,
  getBehaviorSummary,
  getDetectedPatterns
} from '../services/behaviorAnalysisService.js';

/**
 * Hook for behavior analysis functionality
 * @param {Object} options - Hook options
 * @param {boolean} options.autoTrack - Enable automatic tracking
 * @param {number} options.batchInterval - Batch tracking interval in ms
 * @returns {Object} Behavior analysis utilities and state
 */
export const useBehaviorAnalysis = (options = {}) => {
  const { user } = useAuth();
  const { autoTrack = true, batchInterval = 30000 } = options;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [summary, setSummary] = useState(null);
  const [patterns, setPatterns] = useState([]);
  const [preferenceUpdate, setPreferenceUpdate] = useState(null);
  
  const trackerRef = useRef(null);
  const batchIntervalRef = useRef(null);

  // Initialize behavior tracker
  useEffect(() => {
    if (user?.id && !trackerRef.current) {
      trackerRef.current = new BehaviorTracker(user.id);
      
      // Set up batch interval for flushing pending interactions
      if (autoTrack) {
        batchIntervalRef.current = setInterval(() => {
          trackerRef.current?.flushPendingInteractions();
        }, batchInterval);
      }
    }

    return () => {
      if (batchIntervalRef.current) {
        clearInterval(batchIntervalRef.current);
      }
      // Flush any pending interactions on unmount
      trackerRef.current?.flushPendingInteractions();
    };
  }, [user?.id, autoTrack, batchInterval]);

  // Track interaction
  const trackInteraction = useCallback(async (interactionType, options = {}) => {
    if (!trackerRef.current) {
      console.warn('Behavior tracker not initialized');
      return;
    }

    try {
      await trackerRef.current.track(interactionType, options);
    } catch (err) {
      setError(err.message);
      console.error('Error tracking interaction:', err);
    }
  }, []);

  // Load behavior summary
  const loadSummary = useCallback(async (days = 30) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getBehaviorSummary(user.id, days);
      setSummary(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Analyze behavior
  const analyzeBehavior = useCallback(async (analysisDays = 7) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await analyzeUserBehavior({
        userId: user.id,
        analysisPeriodDays: analysisDays,
        includePatterns: true,
        includePreferenceUpdates: true
      });
      
      setPreferenceUpdate(data);
      setPatterns(data.detectedPatterns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load detected patterns
  const loadPatterns = useCallback(async (days = 7) => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getDetectedPatterns(user.id, days);
      setPatterns(data.patterns || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Convenience tracking methods
  const trackView = useCallback((options) => trackInteraction('view', options), [trackInteraction]);
  const trackClick = useCallback((options) => trackInteraction('click', options), [trackInteraction]);
  const trackBookmark = useCallback((options) => trackInteraction('bookmark', options), [trackInteraction]);
  const trackShare = useCallback((options) => trackInteraction('share', options), [trackInteraction]);
  const trackReject = useCallback((options) => trackInteraction('reject', options), [trackInteraction]);
  const trackBook = useCallback((options) => trackInteraction('book', options), [trackInteraction]);
  const trackRate = useCallback((options) => trackInteraction('rate', options), [trackInteraction]);
  const trackSearch = useCallback((options) => trackInteraction('search', options), [trackInteraction]);
  const trackFilter = useCallback((options) => trackInteraction('filter', options), [trackInteraction]);

  // Clear error
  const clearError = useCallback(() => setError(null), []);

  return {
    // State
    loading,
    error,
    summary,
    patterns,
    preferenceUpdate,
    
    // Methods
    trackInteraction,
    trackView,
    trackClick,
    trackBookmark,
    trackShare,
    trackReject,
    trackBook,
    trackRate,
    trackSearch,
    trackFilter,
    
    // Analysis methods
    loadSummary,
    analyzeBehavior,
    loadPatterns,
    clearError,
    
    // Tracker instance
    tracker: trackerRef.current
  };
};

/**
 * Hook for automatic behavior tracking on component interactions
 * @param {string} component - Component name for tracking
 * @param {Object} options - Tracking options
 */
export const useBehaviorTracking = (component, options = {}) => {
  const { trackInteraction } = useBehaviorAnalysis();
  const startTimeRef = useRef(Date.now());

  // Track component view
  useEffect(() => {
    trackInteraction('view', {
      context: {
        component,
        ...options.context
      }
    });
  }, [component, trackInteraction, options.context]);

  // Track component click
  const trackClick = useCallback((clickOptions = {}) => {
    trackInteraction('click', {
      context: {
        component,
        ...options.context,
        ...clickOptions.context
      },
      ...clickOptions
    });
  }, [component, trackInteraction]);

  // Track component duration on unmount
  useEffect(() => {
    return () => {
      const duration = Date.now() - startTimeRef.current;
      trackInteraction('view', {
        context: {
          component,
          duration: Math.floor(duration / 1000),
          ...options.context
        }
      });
    };
  }, [component, trackInteraction, options.context]);

  return { trackClick };
};

/**
 * Hook for tracking search behavior
 */
export const useSearchBehavior = () => {
  const { trackSearch, trackFilter } = useBehaviorAnalysis();

  const trackSearchQuery = useCallback((query, results = []) => {
    trackSearch({
      context: {
        query,
        resultCount: results.length,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackSearch]);

  const trackFilterChange = useCallback((filters) => {
    trackFilter({
      context: {
        filters,
        timestamp: new Date().toISOString()
      }
    });
  }, [trackFilter]);

  return {
    trackSearchQuery,
    trackFilterChange
  };
};

/**
 * Hook for tracking recommendation interactions
 */
export const useRecommendationBehavior = () => {
  const { trackClick, trackBookmark, trackReject, trackShare } = useBehaviorAnalysis();

  const trackRecommendationClick = useCallback((recommendationId, category) => {
    trackClick({
      activityId: recommendationId,
      activityCategory: category,
      context: {
        type: 'recommendation',
        recommendationId
      }
    });
  }, [trackClick]);

  const trackRecommendationBookmark = useCallback((recommendationId, category) => {
    trackBookmark({
      activityId: recommendationId,
      activityCategory: category,
      context: {
        type: 'recommendation',
        recommendationId
      }
    });
  }, [trackBookmark]);

  const trackRecommendationReject = useCallback((recommendationId, category) => {
    trackReject({
      activityId: recommendationId,
      activityCategory: category,
      context: {
        type: 'recommendation',
        recommendationId
      }
    });
  }, [trackReject]);

  const trackRecommendationShare = useCallback((recommendationId, category) => {
    trackShare({
      activityId: recommendationId,
      activityCategory: category,
      context: {
        type: 'recommendation',
        recommendationId
      }
    });
  }, [trackShare]);

  return {
    trackRecommendationClick,
    trackRecommendationBookmark,
    trackRecommendationReject,
    trackRecommendationShare
  };
};

export default useBehaviorAnalysis;
