import { ReactNode } from "react";
import type { Response } from "@/types/supabase";
import { AnalyticsStatCard } from "./AnalyticsStatCard";
import { formatTimeAgo } from "@/lib/utils";
import {
  ChatBubbleLeftRightIcon,
  FaceSmileIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

interface AnalyticsData {
  total: number;
  sentimentCounts: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    unanalyzed: number;
  };
  avgSentiment: string;
  latestResponse: Response | null;
}

interface StatsGridProps {
  analytics: AnalyticsData;
  questionCount: number;
}

/**
 * StatsGrid Component
 *
 * Displays a grid of four key analytics metrics:
 * - Total Responses
 * - Average Sentiment
 * - Latest Response
 * - Analyzed vs Pending
 *
 * Responsive: 1 column on mobile, 2 on tablet, 4 on desktop.
 *
 * @param analytics - Computed analytics data
 * @param questionCount - Number of questions in the survey
 */
export function StatsGrid({ analytics, questionCount }: StatsGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total Responses Card */}
      <AnalyticsStatCard
        title="Total Responses"
        value={analytics.total}
        subtitle={`${questionCount} questions`}
        icon={<ChatBubbleLeftRightIcon className="w-5 h-5" />}
        color="blue"
      />

      {/* Average Sentiment Card */}
      <AnalyticsStatCard
        title="Average Sentiment"
        value={analytics.avgSentiment}
        subtitle={`${analytics.sentimentCounts.positive} positive`}
        icon={<FaceSmileIcon className="w-5 h-5" />}
        color={
          analytics.avgSentiment === 'Positive'
            ? 'green'
            : analytics.avgSentiment === 'Negative'
            ? 'red'
            : 'slate'
        }
      />

      {/* Latest Response Card */}
      <AnalyticsStatCard
        title="Latest Response"
        value={
          analytics.latestResponse
            ? formatTimeAgo(analytics.latestResponse.created_at)
            : 'N/A'
        }
        subtitle="Most recent"
        icon={<ClockIcon className="w-5 h-5" />}
        color="purple"
      />

      {/* Analyzed Card */}
      <AnalyticsStatCard
        title="Analyzed"
        value={`${analytics.total - analytics.sentimentCounts.unanalyzed}/${analytics.total}`}
        subtitle={`${analytics.sentimentCounts.unanalyzed} pending`}
        icon={<FaceSmileIcon className="w-5 h-5" />}
        color="amber"
      />
    </div>
  );
}
