/**
 * useRealtimeActivityFeed Hook
 * ────────────────────────────────────────────────────
 * Manages Realtime subscription for activity feed updates.
 * 
 * Why this hook exists:
 * - Isolates complex Realtime subscription logic
 * - Handles cleanup to prevent memory leaks
 * - Safe state updates (checks if component is mounted)
 * - Reusable across any component that needs activity feed
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

const logger = createLogger('useRealtimeActivityFeed');

type ActivityFeedRow = Database['public']['Tables']['activity_feed']['Row'];

const DEFAULT_ORG_ID =
  process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

/**
 * Realtime Status Types
 */
type RealtimeStatus = 'connecting' | 'connected' | 'error';

/**
 * Hook Return Type
 */
interface UseRealtimeActivityFeedReturn {
  activities: ActivityFeedRow[];
  loading: boolean;
  error: string | null;
  realtimeStatus: RealtimeStatus;
  refetch: () => Promise<void>;
}

/**
 * useRealtimeActivityFeed Hook
 * ────────────────────────────────────────────────────
 * Fetches activity feed data and subscribes to real-time updates.
 * 
 * Features:
 * - Initial data fetch on mount
 * - Realtime subscription for live updates
 * - Automatic cleanup on unmount
 * - Safe state updates (prevents updates after unmount)
 * - Connection status tracking
 * 
 * @param orgId - Organization ID (defaults to DEFAULT_ORG_ID)
 * @param limit - Number of activities to fetch (default: 10)
 * @returns Activity feed data and helpers
 */
export function useRealtimeActivityFeed(
  orgId: string = DEFAULT_ORG_ID,
  limit: number = 10
): UseRealtimeActivityFeedReturn {
  const [activities, setActivities] = useState<ActivityFeedRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting');

  // Track if component is mounted to prevent state updates after unmount
  const isMountedRef = useRef(true);

  /**
   * Fetch activities from database
   */
  const fetchActivities = useCallback(async () => {
    try {
      // Only update state if component is still mounted
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      logger.debug('Fetching activities', { orgId, limit });

      const { data, error: fetchError } = await supabase
        .from('activity_feed')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) {
        throw fetchError;
      }

      logger.debug('Activities fetched successfully', { count: data?.length || 0 });

      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setActivities(data || []);
      }
    } catch (err) {
      logger.error('Failed to fetch activities', err);
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setError('Failed to load activity feed. Please try again.');
      }
    } finally {
      // Only update state if component is still mounted
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [orgId, limit]);

  /**
   * Setup Realtime subscription
   */
  useEffect(() => {
    // Mark component as mounted
    isMountedRef.current = true;

    // Initial fetch
    fetchActivities();

    logger.debug('Setting up Realtime subscription for activity feed', { orgId });

    // Subscribe to real-time updates
    const channel = supabase.channel('activity_feed_changes');

    channel
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'activity_feed',
          filter: `org_id=eq.${orgId}`,
        },
        (payload) => {
          logger.debug('Activity feed update received', { event: payload.eventType });
          // Refresh activities when there's a change (only if still mounted)
          if (isMountedRef.current) {
            fetchActivities();
          }
        }
      )
      .subscribe((status, err) => {
        // Only update state if component is still mounted
        if (!isMountedRef.current) return;

        logger.debug('Realtime subscription status changed', { status });

        if (status === 'SUBSCRIBED') {
          logger.info('Realtime connection established for activity feed');
          setRealtimeStatus('connected');
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          logger.error('Realtime connection failed', err, { status });
          setRealtimeStatus('error');
        }
        // Note: 'CLOSED' status is expected during cleanup, so we ignore it
        else if (status === 'CLOSED') {
          logger.debug('Realtime connection closed (cleanup)');
        }
      });

    // Cleanup subscription on unmount
    return () => {
      logger.debug('Cleaning up Realtime subscription for activity feed');
      isMountedRef.current = false; // Mark as unmounted BEFORE unsubscribe
      supabase.removeChannel(channel);
    };
  }, [orgId, fetchActivities]);

  return {
    activities,
    loading,
    error,
    realtimeStatus,
    refetch: fetchActivities,
  };
}

