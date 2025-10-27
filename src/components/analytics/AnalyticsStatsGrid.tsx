import {
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ChartBarIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";
import { StatCard } from "@/components/dashboard";

/**
 * AnalyticsStatsGrid Component
 * 
 * Displays a grid of key analytics metrics across all surveys:
 * - Total responses across all surveys
 * - This week's response trend
 * - Positive sentiment percentage
 * - Analysis progress (analyzed vs pending)
 * 
 * @param insightsData - Aggregate insights data from all surveys
 */

interface InsightsData {
  totalResponses: number;
  totalSurveys: number;
  responseTrend: {
    thisWeek: number;
    today: number;
  };
  sentimentBreakdown: {
    positive: number;
    negative: number;
    neutral: number;
    mixed: number;
    unanalyzed: number;
  };
}

interface AnalyticsStatsGridProps {
  insightsData: InsightsData;
}

export default function AnalyticsStatsGrid({ insightsData }: AnalyticsStatsGridProps) {
  // Calculate positive sentiment percentage
  const positivePercentage = Math.round(
    (insightsData.sentimentBreakdown.positive / insightsData.totalResponses) * 100
  );

  // Calculate analyzed responses
  const analyzedResponses =
    insightsData.totalResponses - insightsData.sentimentBreakdown.unanalyzed;

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      <StatCard
        title="Total Responses"
        value={insightsData.totalResponses.toString()}
        description={`Across ${insightsData.totalSurveys} surveys`}
        icon={<ChatBubbleLeftRightIcon className="w-6 h-6" />}
        color="blue"
      />
      <StatCard
        title="This Week"
        value={insightsData.responseTrend.thisWeek.toString()}
        description={`${insightsData.responseTrend.today} today`}
        icon={<ChartBarIcon className="w-6 h-6" />}
        color="green"
      />
      <StatCard
        title="Positive Sentiment"
        value={`${positivePercentage}%`}
        description={`${insightsData.sentimentBreakdown.positive} positive responses`}
        icon={<CheckCircleIcon className="w-6 h-6" />}
        color="green"
      />
      <StatCard
        title="Analysis Progress"
        value={`${analyzedResponses}/${insightsData.totalResponses}`}
        description={`${insightsData.sentimentBreakdown.unanalyzed} pending`}
        icon={<ClipboardDocumentListIcon className="w-6 h-6" />}
        color="purple"
      />
    </div>
  );
}

