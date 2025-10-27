/**
 * useAnalytics Hook
 * ────────────────────────────────────────────────────
 * Orchestrates analytics data fetching and calculations.
 * 
 * Why this hook exists:
 * - Centralizes all analytics data fetching logic
 * - Coordinates multiple database queries
 * - Integrates with analytics calculation utilities
 * - Provides clean API for components
 * - Easy to extend with caching, pagination, etc.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import { calculateAnalyticsSummary, type AnalyticsSummary } from '@/lib/analytics';
import type { Database } from '@/types/supabase';

const logger = createLogger('useAnalytics');

type Survey = Database['public']['Tables']['surveys']['Row'];
type SurveyQuestion = Database['public']['Tables']['survey_questions']['Row'];
type Response = Database['public']['Tables']['responses']['Row'];

/**
 * Hook Return Type
 */
interface UseAnalyticsReturn {
  // Data
  survey: Survey | null;
  questions: SurveyQuestion[];
  responses: Response[];
  analytics: AnalyticsSummary;
  
  // State
  loading: boolean;
  error: string | null;
  
  // Actions
  refetch: () => Promise<void>;
}

/**
 * useAnalytics Hook
 * ────────────────────────────────────────────────────
 * Fetches survey data, questions, and responses, then calculates analytics.
 * 
 * Features:
 * - Fetches survey metadata
 * - Fetches survey questions
 * - Fetches survey responses
 * - Calculates analytics summary using lib/analytics
 * - Error handling with detailed logging
 * - Refetch capability
 * 
 * @param surveyId - Survey ID to fetch analytics for
 * @returns Analytics data and state
 * 
 * @example
 * ```typescript
 * const { survey, questions, responses, analytics, loading, error, refetch } = useAnalytics(surveyId);
 * 
 * if (loading) return <LoadingState />;
 * if (error) return <ErrorState message={error} />;
 * 
 * return <AnalyticsDashboard analytics={analytics} />;
 * ```
 */
export function useAnalytics(surveyId: string | undefined): UseAnalyticsReturn {
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch all analytics data
   */
  const fetchAnalyticsData = useCallback(async () => {
    if (!surveyId) {
      logger.warn('No survey ID provided');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching analytics data', { surveyId });

      // Fetch survey metadata
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', surveyId)
        .single();

      if (surveyError) throw surveyError;
      if (!surveyData) throw new Error('Survey not found');

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', surveyId)
        .order('position', { ascending: true });

      if (questionsError) throw questionsError;

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from('responses')
        .select('*')
        .eq('survey_id', surveyId)
        .order('created_at', { ascending: false });

      if (responsesError) throw responsesError;

      setSurvey(surveyData);
      setQuestions(questionsData || []);
      setResponses(responsesData || []);

      logger.debug('Analytics data loaded successfully', {
        surveyId,
        questionCount: questionsData?.length || 0,
        responseCount: responsesData?.length || 0,
      });
    } catch (err) {
      logger.error('Failed to load analytics data', err, { surveyId });
      setError('Failed to load analytics. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [surveyId]);

  // Initial fetch
  useEffect(() => {
    fetchAnalyticsData();
  }, [fetchAnalyticsData]);

  // Calculate analytics summary
  const analytics = calculateAnalyticsSummary(responses);

  return {
    survey,
    questions,
    responses,
    analytics,
    loading,
    error,
    refetch: fetchAnalyticsData,
  };
}

