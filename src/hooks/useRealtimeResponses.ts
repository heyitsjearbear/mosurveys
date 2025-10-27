/**
 * useRealtimeResponses Hook
 * ────────────────────────────────────────────────────
 * Manages Realtime subscription for survey response updates.
 * 
 * Why this hook exists:
 * - Isolates Realtime logic for response tracking
 * - Provides notification system for new responses
 * - Auto-refresh with configurable delay (for AI processing)
 * - Reusable across analytics pages and dashboard widgets
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

const logger = createLogger('useRealtimeResponses');

/**
 * Hook Configuration Options
 */
interface UseRealtimeResponsesOptions {
  /**
   * Whether to enable the subscription
   * @default true
   */
  enabled?: boolean;
  
  /**
   * Delay (ms) before auto-refreshing data after new response
   * This gives time for AI sentiment analysis to complete
   * @default 5000
   */
  autoRefreshDelay?: number;
  
  /**
   * Callback function when new response is detected
   */
  onNewResponse?: (responseId: string) => void;
}

/**
 * Hook Return Type
 */
interface UseRealtimeResponsesReturn {
  /**
   * Number of new responses since last refresh
   */
  newResponseCount: number;
  
  /**
   * Whether there are new responses to review
   */
  hasNewResponses: boolean;
  
  /**
   * Reset the new response counter
   */
  clearNewResponses: () => void;
  
  /**
   * Manually trigger the auto-refresh callback
   */
  triggerRefresh: () => void;
}

/**
 * useRealtimeResponses Hook
 * ────────────────────────────────────────────────────
 * Subscribes to new response inserts for a specific survey.
 * Tracks new responses and triggers auto-refresh with configurable delay.
 * 
 * Features:
 * - Real-time notifications when new responses arrive
 * - Auto-refresh callback with delay (for AI processing)
 * - New response counter
 * - Cleanup on unmount
 * - Configurable options
 * 
 * @param surveyId - Survey ID to watch for responses
 * @param onRefresh - Callback to refresh data (e.g., refetch analytics)
 * @param options - Configuration options
 * @returns Response tracking state and helpers
 * 
 * @example
 * ```typescript
 * const { hasNewResponses, newResponseCount, clearNewResponses } = useRealtimeResponses(
 *   surveyId,
 *   fetchAnalyticsData,
 *   { autoRefreshDelay: 3000 }
 * );
 * ```
 */
export function useRealtimeResponses(
  surveyId: string | undefined,
  onRefresh: () => void | Promise<void>,
  options: UseRealtimeResponsesOptions = {}
): UseRealtimeResponsesReturn {
  const {
    enabled = true,
    autoRefreshDelay = 5000,
    onNewResponse,
  } = options;

  const [newResponseCount, setNewResponseCount] = useState(0);
  const [hasNewResponses, setHasNewResponses] = useState(false);
  
  // Track pending auto-refresh timeouts
  const refreshTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Track if component is mounted
  const isMountedRef = useRef(true);

  /**
   * Clear new response notifications
   */
  const clearNewResponses = useCallback(() => {
    setNewResponseCount(0);
    setHasNewResponses(false);
  }, []);

  /**
   * Manually trigger refresh
   */
  const triggerRefresh = useCallback(() => {
    logger.info('Manually triggering refresh');
    onRefresh();
    clearNewResponses();
  }, [onRefresh, clearNewResponses]);

  /**
   * Setup Realtime subscription
   */
  useEffect(() => {
    // Skip if disabled or no survey ID
    if (!enabled || !surveyId) {
      logger.debug('Realtime responses disabled or no survey ID', { enabled, surveyId });
      return;
    }

    isMountedRef.current = true;

    logger.info('Setting up Realtime subscription for responses', { surveyId });

    const channel: RealtimeChannel = supabase
      .channel(`responses-${surveyId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `survey_id=eq.${surveyId}`,
        },
        (payload) => {
          // Only process if still mounted
          if (!isMountedRef.current) return;

          const responseId = payload.new.id as string;
          
          logger.info('New response detected', {
            responseId,
            surveyId,
          });

          // Update counter and flag
          setNewResponseCount((prev) => prev + 1);
          setHasNewResponses(true);

          // Call optional callback
          if (onNewResponse) {
            onNewResponse(responseId);
          }

          // Clear any existing timeout
          if (refreshTimeoutRef.current) {
            clearTimeout(refreshTimeoutRef.current);
          }

          // Schedule auto-refresh after delay
          logger.info(`Scheduling auto-refresh in ${autoRefreshDelay}ms...`);
          refreshTimeoutRef.current = setTimeout(() => {
            if (isMountedRef.current) {
              logger.info('Auto-refreshing data after new response');
              onRefresh();
            }
          }, autoRefreshDelay);
        }
      )
      .subscribe();

    // Cleanup
    return () => {
      logger.debug('Cleaning up Realtime subscription for responses', { surveyId });
      isMountedRef.current = false;
      
      // Clear pending timeout
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
        refreshTimeoutRef.current = null;
      }
      
      // Remove channel
      supabase.removeChannel(channel);
    };
  }, [surveyId, enabled, autoRefreshDelay, onRefresh, onNewResponse]);

  return {
    newResponseCount,
    hasNewResponses,
    clearNewResponses,
    triggerRefresh,
  };
}

