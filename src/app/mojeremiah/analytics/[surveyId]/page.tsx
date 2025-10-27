"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { createLogger } from "@/lib/logger";
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
import { useAnalytics } from "@/hooks/useAnalytics";
import { useRealtimeResponses } from "@/hooks/useRealtimeResponses";
import { useSurveyVersions } from "@/hooks/useSurveyVersions";

const logger = createLogger('AnalyticsPage');

export default function AnalyticsPage() {
  const params = useParams();
  const initialSurveyId = params.surveyId as string;

  const { 
    survey, 
    questions, 
    responses, 
    analytics, 
    loading, 
    error, 
    refetch: refetchAnalytics 
  } = useAnalytics(initialSurveyId);

  // Version management
  const { 
    versions: allVersions, 
    selectedVersionId, 
    setSelectedVersionId 
  } = useSurveyVersions(initialSurveyId, survey?.title);

  // Realtime response tracking
  const { 
    hasNewResponses, 
    newResponseCount, 
    clearNewResponses 
  } = useRealtimeResponses(selectedVersionId || initialSurveyId, refetchAnalytics);

  // Manual refresh state
  const [refreshing, setRefreshing] = useState(false);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await refetchAnalytics();
    clearNewResponses();
    setRefreshing(false);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (responses.length === 0) return;

    const csvData = formatSurveyDataForCSV(responses, questions);
    const filename = `${survey?.title || 'survey'}-analytics-${formatISODate(new Date().toISOString())}`;
    
    exportToCSV(csvData, filename);
    logger.info('Analytics exported to CSV', { surveyId: initialSurveyId, responseCount: responses.length });
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
    
    logger.info('Analytics exported to JSON', { surveyId: initialSurveyId, responseCount: responses.length });
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
          selectedVersionId={selectedVersionId || initialSurveyId}
          onVersionChange={setSelectedVersionId}
        />

        {/* Empty State */}
        {responses.length === 0 && <EmptyResponsesState surveyId={initialSurveyId} />}

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

