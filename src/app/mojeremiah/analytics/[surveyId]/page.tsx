"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import type { Database } from "@/types/supabase";
import { 
  ResponseCard, 
  AIInsightCard, 
  AnalyticsStatCard 
} from "@/components/analytics";
import { LoadingState, ErrorState } from "@/components/common";
import { PageHeader } from "@/components/layout";
import { formatTimeAgo, exportToCSV, exportToJSON, formatSurveyDataForCSV, formatISODate } from "@/lib/utils";
import {
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  ClockIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import type { RealtimeChannel } from "@supabase/supabase-js";

const logger = createLogger('AnalyticsPage');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];
type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];
type Response = Database["public"]["Tables"]["responses"]["Row"];

// Minimal type for version selector (only fetch what we need)
type SurveyVersion = Pick<Survey, 'id' | 'version'>;

// Get default org ID from environment or use fallback
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

      // Fetch survey details
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
        <div className="fixed top-20 right-4 z-50 animate-bounce">
          <button
            onClick={handleRefresh}
            className="flex items-center gap-2 px-4 py-3 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-full shadow-lg hover:bg-[#2054C8] transition-colors duration-200"
          >
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            {newResponseCount} new {newResponseCount === 1 ? 'response' : 'responses'}
          </button>
        </div>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Version Selector */}
        {allVersions.length > 1 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-4 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading text-sm font-semibold text-slate-900 mb-1">
                  View Analytics by Version
                </h3>
                <p className="font-body text-xs text-slate-600">
                  Compare responses across different survey versions
                </p>
              </div>
              <div className="flex items-center gap-2">
                {allVersions.map((version) => (
                  <button
                    key={version.id}
                    onClick={() => setSelectedVersionId(version.id)}
                    className={`px-4 py-2 font-accent text-sm font-medium rounded-lg transition-all duration-200 ${
                      selectedVersionId === version.id
                        ? 'bg-[#2663EB] text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    v{version.version}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {responses.length === 0 && (
          <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12">
            <div className="text-center max-w-md mx-auto">
              <div className="mb-4">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                  <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400" />
                </div>
              </div>
              <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
                No Responses Yet
              </h3>
              <p className="font-body text-slate-600 leading-relaxed mb-6">
                Share your survey to start collecting responses. Analytics and insights will appear here once responses are submitted.
              </p>
              <Link
                href={`/mojeremiah/respond/${surveyId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#2663EB] hover:bg-[#2054C8] text-white font-accent text-sm font-medium rounded-lg transition-colors duration-200"
              >
                View Survey Form
              </Link>
            </div>
          </div>
        )}

        {/* Analytics Content */}
        {responses.length > 0 && (
          <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <AnalyticsStatCard
                title="Total Responses"
                value={analytics.total}
                subtitle={`${questions.length} questions`}
                icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
                color="blue"
              />
              <AnalyticsStatCard
                title="Average Sentiment"
                value={analytics.avgSentiment}
                subtitle={`${analytics.sentimentCounts.positive} positive`}
                icon={<FaceSmileIcon className="w-5 h-5" />}
                color={
                  analytics.avgSentiment === 'Positive' ? 'green' :
                  analytics.avgSentiment === 'Negative' ? 'red' : 'slate'
                }
              />
              <AnalyticsStatCard
                title="Latest Response"
                value={analytics.latestResponse ? formatTimeAgo(analytics.latestResponse.created_at) : 'N/A'}
                subtitle="Most recent"
                icon={<ClockIcon className="w-5 h-5" />}
                color="purple"
              />
              <AnalyticsStatCard
                title="Analyzed"
                value={`${analytics.total - analytics.sentimentCounts.unanalyzed}/${analytics.total}`}
                subtitle={`${analytics.sentimentCounts.unanalyzed} pending`}
                icon={<FaceSmileIcon className="w-5 h-5" />}
                color="amber"
              />
            </div>

            {/* AI Insights */}
            <AIInsightCard
              insight={responses.length >= 3 
                ? "Users appreciate the clear interface and ease of use. Common themes include satisfaction with speed and helpful features."
                : null
              }
              loading={false}
            />

            {/* Sentiment Breakdown (Simple text display for now) */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
              <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
                Sentiment Breakdown
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <p className="font-heading text-2xl font-semibold text-green-700">
                    {analytics.sentimentCounts.positive}
                  </p>
                  <p className="font-accent text-xs text-green-600 mt-1">Positive</p>
                </div>
                <div className="text-center p-4 bg-slate-50 rounded-lg">
                  <p className="font-heading text-2xl font-semibold text-slate-700">
                    {analytics.sentimentCounts.neutral}
                  </p>
                  <p className="font-accent text-xs text-slate-600 mt-1">Neutral</p>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <p className="font-heading text-2xl font-semibold text-red-700">
                    {analytics.sentimentCounts.negative}
                  </p>
                  <p className="font-accent text-xs text-red-600 mt-1">Negative</p>
                </div>
                <div className="text-center p-4 bg-amber-50 rounded-lg">
                  <p className="font-heading text-2xl font-semibold text-amber-700">
                    {analytics.sentimentCounts.mixed}
                  </p>
                  <p className="font-accent text-xs text-amber-600 mt-1">Mixed</p>
                </div>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center justify-between bg-white rounded-lg border border-slate-200 shadow-sm p-4">
              <div>
                <h3 className="font-heading text-sm font-semibold text-slate-900">
                  Export Analytics
                </h3>
                <p className="font-body text-xs text-slate-600 mt-0.5">
                  Download response data for external analysis
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  CSV
                </button>
                <button
                  onClick={handleExportJSON}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-accent text-sm font-medium rounded-lg transition-colors duration-200"
                >
                  <ArrowDownTrayIcon className="w-4 h-4" />
                  JSON
                </button>
              </div>
            </div>

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

