import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';
import type { Database } from '@/types/supabase';

const logger = createLogger('useInsightsData');

type Survey = Database['public']['Tables']['surveys']['Row'];
type Response = Database['public']['Tables']['responses']['Row'];

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export interface InsightsData {
  totalResponses: number;
  totalSurveys: number;
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
    unanalyzed: number;
  };
  topSurveys: Array<{
    survey: Survey;
    responseCount: number;
    avgSentiment: string;
  }>;
  recentResponses: Array<{
    response: Response;
    survey: Survey | null;
  }>;
  responseTrend: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
}

/**
 * useInsightsData Hook
 * 
 * Fetches aggregate insights data across all surveys for the dashboard.
 * Provides overall statistics, trends, and recent activity.
 */
export function useInsightsData() {
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchInsightsData();
  }, []);

  const fetchInsightsData = async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching insights data');

      // Fetch all surveys
      const { data: surveys, error: surveysError } = await supabase
        .from('surveys')
        .select('*')
        .eq('org_id', DEFAULT_ORG_ID)
        .order('created_at', { ascending: false });

      if (surveysError) throw surveysError;

      // Fetch all responses
      const { data: responses, error: responsesError } = await supabase
        .from('responses')
        .select('*, survey:surveys(*)')
        .eq('org_id', DEFAULT_ORG_ID)
        .order('created_at', { ascending: false });

      if (responsesError) throw responsesError;

      // Calculate sentiment breakdown
      const sentimentBreakdown = {
        positive: 0,
        neutral: 0,
        negative: 0,
        mixed: 0,
        unanalyzed: 0,
      };

      (responses || []).forEach((r) => {
        if (!r.sentiment) {
          sentimentBreakdown.unanalyzed++;
        } else if (r.sentiment === 'positive') {
          sentimentBreakdown.positive++;
        } else if (r.sentiment === 'negative') {
          sentimentBreakdown.negative++;
        } else if (r.sentiment === 'neutral') {
          sentimentBreakdown.neutral++;
        } else if (r.sentiment === 'mixed') {
          sentimentBreakdown.mixed++;
        }
      });

      // Calculate top surveys (by response count)
      const surveyResponseCounts = new Map<string, number>();
      const surveyMap = new Map<string, Survey>();
      
      (surveys || []).forEach(s => surveyMap.set(s.id, s));
      (responses || []).forEach((r) => {
        surveyResponseCounts.set(r.survey_id, (surveyResponseCounts.get(r.survey_id) || 0) + 1);
      });

      const topSurveys = Array.from(surveyResponseCounts.entries())
        .map(([surveyId, count]) => {
          const survey = surveyMap.get(surveyId);
          if (!survey) return null;

          // Calculate avg sentiment for this survey
          const surveyResponses = (responses || []).filter(r => r.survey_id === surveyId);
          const posCount = surveyResponses.filter(r => r.sentiment === 'positive').length;
          const negCount = surveyResponses.filter(r => r.sentiment === 'negative').length;
          
          let avgSentiment = 'Neutral';
          if (posCount > negCount && posCount > 0) avgSentiment = 'Positive';
          else if (negCount > posCount && negCount > 0) avgSentiment = 'Negative';

          return {
            survey,
            responseCount: count,
            avgSentiment,
          };
        })
        .filter((item): item is NonNullable<typeof item> => item !== null)
        .sort((a, b) => b.responseCount - a.responseCount)
        .slice(0, 5);

      // Get recent responses (last 10)
      const recentResponses = (responses || []).slice(0, 10).map(r => ({
        response: r,
        survey: (r as any).survey || null,
      }));

      // Calculate response trends
      const now = new Date();
      const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const responseTrend = {
        today: (responses || []).filter(r => new Date(r.created_at) > oneDayAgo).length,
        thisWeek: (responses || []).filter(r => new Date(r.created_at) > oneWeekAgo).length,
        thisMonth: (responses || []).filter(r => new Date(r.created_at) > oneMonthAgo).length,
      };

      const insightsData: InsightsData = {
        totalResponses: responses?.length || 0,
        totalSurveys: surveys?.length || 0,
        sentimentBreakdown,
        topSurveys,
        recentResponses,
        responseTrend,
      };

      setData(insightsData);
      logger.debug('Insights data loaded', {
        totalResponses: insightsData.totalResponses,
        totalSurveys: insightsData.totalSurveys,
      });

    } catch (err) {
      logger.error('Failed to fetch insights data', err);
      setError('Failed to load insights. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return {
    data,
    loading,
    error,
    refetch: fetchInsightsData,
  };
}

