/**
 * useMenuOrganization Hook
 * Provides easy access to menu organization functionality
 */

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  getPersonalizedMenuLayout,
  getDefaultMenuLayout,
  updateMenuPreferences,
  getMenuAnalytics,
  resetMenuLayout,
  MenuTracker,
  MenuInteractionType
} from '../services/menuOrganizationService';

export const useMenuOrganization = () => {
  const { user } = useAuth();
  const [menuData, setMenuData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [menuTracker, setMenuTracker] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Initialize menu tracker
  useEffect(() => {
    if (user?.id) {
      setMenuTracker(new MenuTracker(user.id));
    }
  }, [user]);

  // Load personalized menu
  const loadMenu = useCallback(async () => {
    if (!user?.id) return;

    setLoading(true);
    setError(null);

    try {
      // Try to get personalized menu first
      let menuResponse;
      try {
        menuResponse = await getPersonalizedMenuLayout(user.id);
      } catch (personalizedError) {
        // Fallback to default menu if personalization fails
        console.warn('Personalized menu not available, using default:', personalizedError.message);
        menuResponse = await getDefaultMenuLayout();
      }

      setMenuData(menuResponse);
    } catch (err) {
      setError(err.message);
      console.error('Error loading menu:', err);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  // Load menu analytics
  const loadAnalytics = useCallback(async (days = 30) => {
    if (!user?.id) return;

    setAnalyticsLoading(true);
    try {
      const analyticsData = await getMenuAnalytics(user.id, days);
      setAnalytics(analyticsData);
    } catch (err) {
      console.error('Error loading menu analytics:', err);
      setAnalytics(null);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [user?.id]);

  // Update menu preferences
  const updatePreferences = useCallback(async (preferences) => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      await updateMenuPreferences(user.id, preferences);
      // Reload menu after updating preferences
      await loadMenu();
      return true;
    } catch (err) {
      console.error('Error updating menu preferences:', err);
      throw err;
    }
  }, [user?.id, loadMenu]);

  // Reset menu layout
  const resetLayout = useCallback(async () => {
    if (!user?.id) throw new Error('User not authenticated');

    try {
      await resetMenuLayout(user.id);
      // Reload menu after reset
      await loadMenu();
      return true;
    } catch (err) {
      console.error('Error resetting menu layout:', err);
      throw err;
    }
  }, [user?.id, loadMenu]);

  // Track menu interaction
  const trackInteraction = useCallback(async (menuItem, action, context = {}) => {
    if (!menuTracker) return;

    try {
      await menuTracker.track(menuItem, action, context);
    } catch (err) {
      console.error('Error tracking menu interaction:', err);
    }
  }, [menuTracker]);

  // Track menu click
  const trackClick = useCallback(async (menuItem, context = {}) => {
    await trackInteraction(menuItem, MenuInteractionType.CLICK, context);
  }, [trackInteraction]);

  // Track menu view
  const trackView = useCallback(async (menuItem, context = {}) => {
    await trackInteraction(menuItem, MenuInteractionType.VIEW, context);
  }, [trackInteraction]);

  // Track menu dismiss
  const trackDismiss = useCallback(async (menuItem, context = {}) => {
    await trackInteraction(menuItem, MenuInteractionType.DISMISS, context);
  }, [trackInteraction]);

  // Flush pending interactions
  const flushPendingInteractions = useCallback(async () => {
    if (menuTracker) {
      try {
        await menuTracker.flushPendingInteractions();
      } catch (err) {
        console.error('Error flushing pending interactions:', err);
      }
    }
  }, [menuTracker]);

  // Auto-load menu on user change
  useEffect(() => {
    if (user?.id) {
      loadMenu();
    }
  }, [user?.id, loadMenu]);

  return {
    // Menu data
    menuData,
    loading,
    error,
    
    // Analytics
    analytics,
    analyticsLoading,
    
    // Actions
    loadMenu,
    loadAnalytics,
    updatePreferences,
    resetLayout,
    
    // Tracking
    trackInteraction,
    trackClick,
    trackView,
    trackDismiss,
    flushPendingInteractions,
    
    // Utilities
    menuTracker,
    isPersonalized: menuData?.adaptation_score > 0.1,
    adaptationScore: menuData?.adaptation_score || 0,
    basedOnInteractions: menuData?.based_on_interactions || 0
  };
};
