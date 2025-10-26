import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";

const logger = createLogger('DashboardStats');

/**
 * Dashboard Statistics Interface
 * 
 * Defines the shape of dashboard metrics:
 * - totalSurveys: Total count of all surveys
 * - activeSurveys: Count of surveys with status='active'
 * - totalResponses: Total count of all responses across all surveys
 */
export interface DashboardStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
}

/**
 * useDashboardStats Hook
 * 
 * Fetches real-time dashboard statistics from Supabase.
 * This hook:
 * 1. Queries the surveys table for total and active counts
 * 2. Queries the responses table for total response count
 * 3. Subscribes to Realtime updates for live data sync
 * 
 * @returns {Object} - { stats, loading, error }
 * 
 * Usage:
 * ```tsx
 * const { stats, loading, error } = useDashboardStats();
 * ```
 */
export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats>({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Fetch initial stats
    fetchStats();

    // Subscribe to Realtime updates for surveys table
    const surveysChannel = supabase
      .channel("dashboard-surveys")
      .on(
        "postgres_changes",
        {
          event: "*", // Listen to all events (INSERT, UPDATE, DELETE)
          schema: "public",
          table: "surveys",
        },
        () => {
          // Refetch stats when surveys change
          fetchStats();
        }
      )
      .subscribe();

    // Subscribe to Realtime updates for responses table
    const responsesChannel = supabase
      .channel("dashboard-responses")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "responses",
        },
        () => {
          // Refetch stats when responses change
          fetchStats();
        }
      )
      .subscribe();

    // Cleanup subscriptions on unmount
    return () => {
      supabase.removeChannel(surveysChannel);
      supabase.removeChannel(responsesChannel);
    };
  }, []);

  /**
   * fetchStats
   * 
   * Queries Supabase for:
   * 1. Total survey count
   * 2. Active survey count (status='active')
   * 3. Total response count
   */
  async function fetchStats() {
    try {
      setLoading(true);
      setError(null);

      // Query 1: Get total surveys count
      const { count: totalSurveys, error: surveysError } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true });

      if (surveysError) throw surveysError;

      // Query 2: Get active surveys count (status='active')
      const { count: activeSurveys, error: activeError } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true })
        .eq("status", "active");

      if (activeError) throw activeError;

      // Query 3: Get total responses count
      const { count: totalResponses, error: responsesError } = await supabase
        .from("responses")
        .select("*", { count: "exact", head: true });

      if (responsesError) throw responsesError;

      // Update state with fetched stats
      setStats({
        totalSurveys: totalSurveys ?? 0,
        activeSurveys: activeSurveys ?? 0,
        totalResponses: totalResponses ?? 0,
      });
      
      logger.debug('Dashboard stats fetched', {
        totalSurveys: totalSurveys ?? 0,
        activeSurveys: activeSurveys ?? 0,
        totalResponses: totalResponses ?? 0
      });
    } catch (err) {
      logger.error('Failed to fetch dashboard stats', err);
      setError(err instanceof Error ? err.message : "Failed to fetch stats");
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, error };
}

