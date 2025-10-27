"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import type { Database } from "@/types/supabase";
import { 
  ResponseCard, 
  AIInsightCard,
  VersionSelector,
  SentimentBreakdown,
  ExportActions,
  EmptyResponsesState,
  NewResponseNotification,
  StatsGrid,
} from "@/components/analytics";
import { LoadingState, ErrorState } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { formatISODate, exportToCSV, exportToJSON, formatSurveyDataForCSV } from "@/lib/utils";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import type { RealtimeChannel } from "@supabase/supabase-js";

const logger = createLogger('AnalyticsPage');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];
type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];
type Response = Database["public"]["Tables"]["responses"]["Row"];
type SurveyVersion = Pick<Survey, 'id' | 'version'>;

const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export default function AnalyticsPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  // Data state
  const [survey, setSurvey] = useState<Survey | null>(null);
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [responses, setResponses] = useState<Response[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Version selection state
  const [allVersions, setAllVersions] = useState<SurveyVersion[]>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<string>(surveyId);

  // Realtime state
  const [newResponseCount, setNewResponseCount] = useState(0);
  const [hasNewResponses, setHasNewResponses] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all data
  const fetchAnalyticsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      logger.info('Fetching analytics data', { surveyId: selectedVersionId });

      const { data: surveyData, error: surveyError } = await supabase
        .from("surveys")
        .select("*")
        .eq("id", selectedVersionId)
        .single();

      if (surveyError) throw surveyError;
      if (!surveyData) throw new Error("Survey not found");

      // Fetch all versions of this survey (for version selector)
      if (allVersions.length === 0) {
        const { data: versionsData } = await supabase
          .from("surveys")
          .select("id, version")
          .eq("org_id", DEFAULT_ORG_ID)
          .ilike("title", surveyData.title)
          .order("version", { ascending: true });

        if (versionsData) {
          setAllVersions(versionsData);
        }
      }

      // Fetch questions
      const { data: questionsData, error: questionsError } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", selectedVersionId)
        .order("position", { ascending: true });

      if (questionsError) throw questionsError;

      // Fetch responses
      const { data: responsesData, error: responsesError } = await supabase
        .from("responses")
        .select("*")
        .eq("survey_id", selectedVersionId)
        .order("created_at", { ascending: false });

      if (responsesError) throw responsesError;

      setSurvey(surveyData);
      setQuestions(questionsData || []);
      setResponses(responsesData || []);

      logger.debug('Analytics data loaded', {
        surveyId: selectedVersionId,
        questionCount: questionsData?.length || 0,
        responseCount: responsesData?.length || 0,
      });
    } catch (err) {
      logger.error('Failed to load analytics data', err, { surveyId: selectedVersionId });
      setError("Failed to load analytics. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [selectedVersionId, allVersions.length]);

  // Initial data fetch
  useEffect(() => {
    if (selectedVersionId) {
      fetchAnalyticsData();
    }
  }, [selectedVersionId, fetchAnalyticsData]);

  // Live updates for new responses
  useEffect(() => {
    if (!selectedVersionId) return;

    logger.info('Setting up live updates', { surveyId: selectedVersionId });

    const channel: RealtimeChannel = supabase
      .channel(`analytics-${selectedVersionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'responses',
          filter: `survey_id=eq.${selectedVersionId}`,
        },
        (payload) => {
          logger.info('New response detected', {
            responseId: payload.new.id,
            surveyId: selectedVersionId,
          });

          setNewResponseCount((prev) => prev + 1);
          setHasNewResponses(true);

          // Auto-refresh after 5 seconds to fetch AI sentiment
          logger.info('Scheduling auto-refresh in 5 seconds...');
          setTimeout(() => {
            logger.info('Auto-refreshing analytics data');
            fetchAnalyticsData();
          }, 5000);
        }
      )
      .subscribe();

    return () => {
      logger.debug('Cleaning up subscription', { surveyId: selectedVersionId });
      supabase.removeChannel(channel);
    };
  }, [selectedVersionId, fetchAnalyticsData]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAnalyticsData();
    setNewResponseCount(0);
    setHasNewResponses(false);
    setRefreshing(false);
  };

  // Calculate analytics metrics
  const getAnalytics = () => {
    const total = responses.length;
    
    const sentimentCounts = {
      positive: responses.filter((r) => r.sentiment === 'positive').length,
      negative: responses.filter((r) => r.sentiment === 'negative').length,
      neutral: responses.filter((r) => r.sentiment === 'neutral').length,
      mixed: responses.filter((r) => r.sentiment === 'mixed').length,
      unanalyzed: responses.filter((r) => !r.sentiment).length,
    };

    const avgSentiment = total > 0
      ? sentimentCounts.positive > sentimentCounts.negative
        ? 'Positive'
        : sentimentCounts.negative > sentimentCounts.positive
        ? 'Negative'
        : 'Neutral'
      : 'N/A';

    const latestResponse = responses.length > 0 ? responses[0] : null;

    return {
      total,
      sentimentCounts,
      avgSentiment,
      latestResponse,
    };
  };

  const analytics = getAnalytics();

  // Export to CSV
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const csvData = formatSurveyDataForCSV(responses, questions);
    const filename = `${survey?.title || 'survey'}-analytics-${formatISODate(new Date().toISOString())}`;
    
    exportToCSV(csvData, filename);
    logger.info('Analytics exported to CSV', { surveyId, responseCount: responses.length });
  };

  // Export to JSON
  const handleExportJSON = () => {
    if (responses.length === 0) return;

    const data = {
      survey: {
        id: survey?.id,
        title: survey?.title,
        version: survey?.version,
        audience: survey?.audience,
      },
      questions: questions.map((q) => ({
        id: q.id,
        position: q.position,
        question: q.question,
        type: q.type,
      })),
      responses: responses.map((r) => ({
        id: r.id,
        created_at: r.created_at,
        sentiment: r.sentiment,
        summary: r.summary,
        answers: r.answers,
      })),
      analytics: {
        totalResponses: analytics.total,
        sentimentBreakdown: analytics.sentimentCounts,
        averageSentiment: analytics.avgSentiment,
      },
      exportedAt: new Date().toISOString(),
    };

    const filename = `${survey?.title || 'survey'}-analytics-${formatISODate(new Date().toISOString())}`;
    exportToJSON(data, filename);
    
    logger.info('Analytics exported to JSON', { surveyId, responseCount: responses.length });
  };

  // Loading state
  if (loading) {
    return <LoadingState message="Loading analytics..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} />;
  }

  // Survey not found
  if (!survey) {
    return <ErrorState message="Survey not found" />;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <PageHeader
        backHref="/mojeremiah/view"
        backLabel="Back to Surveys"
        title={survey.title}
        subtitle={
          <div className="flex items-center gap-2 mt-1 justify-center">
            <span className="inline-flex items-center px-2 py-0.5 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
              v{survey.version}
            </span>
            {survey.audience && (
              <span className="font-body text-xs text-slate-500">
                {survey.audience}
              </span>
            )}
          </div>
        }
        action={
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-accent text-sm font-medium rounded-lg transition-colors duration-200 disabled:opacity-50"
          >
            <ArrowPathIcon className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        }
        sticky={true}
      />

      {/* New Response Notification */}
      {hasNewResponses && (
        <NewResponseNotification count={newResponseCount} onRefresh={handleRefresh} />
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Version Selector */}
        <VersionSelector
          versions={allVersions}
          selectedVersionId={selectedVersionId}
          onVersionChange={setSelectedVersionId}
        />

        {/* Empty State */}
        {responses.length === 0 && <EmptyResponsesState surveyId={surveyId} />}

        {/* Analytics Content */}
        {responses.length > 0 && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <StatsGrid analytics={analytics} questionCount={questions.length} />

            {/* AI Insights */}
            <AIInsightCard
              insight={responses.length >= 3 
                ? "Users appreciate the clear interface and ease of use. Common themes include satisfaction with speed and helpful features."
                : null
              }
              loading={false}
            />

            {/* Sentiment Breakdown */}
            <SentimentBreakdown sentimentCounts={analytics.sentimentCounts} />

            {/* Export Actions */}
            <ExportActions
              onExportCSV={handleExportCSV}
              onExportJSON={handleExportJSON}
              disabled={responses.length === 0}
            />

            {/* Individual Responses */}
            <div>
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
                Individual Responses ({responses.length})
              </h3>
              <div className="space-y-4">
                {responses.map((response, index) => (
                  <ResponseCard
                    key={response.id}
                    response={response}
                    questions={questions}
                    responseNumber={responses.length - index}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

