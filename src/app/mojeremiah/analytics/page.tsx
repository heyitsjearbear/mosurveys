"use client";

import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useInsightsData } from "@/hooks/useInsightsData";
import LoadingState from "@/components/common/LoadingState";
import ErrorState from "@/components/common/ErrorState";
import { AppHeader, AppFooter } from "@/components/layout";
import {
  AnalyticsStatsGrid,
  SentimentBreakdownCard,
  TopSurveysCard,
  RecentFeedbackCard,
  AnalyticsEmptyState,
  AnalyticsCallToAction,
} from "@/components/analytics";

/**
 * MoSurveys Analytics Overview Page
 * 
 * This page displays aggregate insights across all surveys:
 * - Overall response statistics and trends
 * - Sentiment distribution across all responses
 * - Top performing surveys
 * - Recent feedback
 * 
 * This is the main analytics dashboard accessible at /mojeremiah/analytics
 * Individual survey analytics are at /mojeremiah/analytics/[surveyId]
 */
export default function AnalyticsOverviewPage() {
  const { data: insightsData, loading: insightsLoading, error: insightsError } = useInsightsData();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation Header */}
      <AppHeader activeTab="insights" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link
              href="/mojeremiah"
              className="group inline-flex items-center gap-2 px-3 py-1.5 border border-slate-300 font-accent text-sm font-medium rounded-full text-slate-700 bg-slate-50 hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 active:scale-95"
            >
              <ArrowLeftIcon className="w-4 h-4" />
              Back to Dashboard
            </Link>
          </div>
          <h2 className="font-heading text-3xl md:text-4xl font-semibold text-slate-900 tracking-tight mb-2">
            Analytics & Insights
          </h2>
          <p className="font-body text-slate-600 leading-relaxed">
            View aggregate insights and sentiment analysis across all your surveys.
          </p>
        </div>

        {/* Loading State */}
        {insightsLoading && (
          <div className="mb-8">
            <LoadingState message="Loading insights..." />
          </div>
        )}

        {/* Error State */}
        {insightsError && (
          <div className="mb-8">
            <ErrorState message={insightsError} />
          </div>
        )}

        {/* Insights Content */}
        {!insightsLoading && !insightsError && insightsData && (
          <div className="space-y-6">
            {/* Empty State - No Responses */}
            {insightsData.totalResponses === 0 && <AnalyticsEmptyState />}

            {/* Insights with Data */}
            {insightsData.totalResponses > 0 && (
              <>
                {/* Overview Stats */}
                <AnalyticsStatsGrid insightsData={insightsData} />

                {/* Sentiment Breakdown */}
                <SentimentBreakdownCard
                  sentimentBreakdown={insightsData.sentimentBreakdown}
                  totalResponses={insightsData.totalResponses}
                />

                {/* Top Surveys and Recent Responses */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <TopSurveysCard topSurveys={insightsData.topSurveys} />
                  <RecentFeedbackCard recentResponses={insightsData.recentResponses} />
                </div>

                {/* Call to Action - View Individual Surveys */}
                <AnalyticsCallToAction />
              </>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <AppFooter />
    </div>
  );
}
