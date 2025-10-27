/**
 * RecentFeedbackCard Component
 * 
 * Displays a list of recent survey responses with sentiment indicators.
 * Shows survey title, response summary, sentiment badge, and time ago.
 * 
 * @param recentResponses - Array of recent responses with sentiment analysis
 */

import { formatTimeAgo } from "@/lib/utils";
import { getSentimentColor, getSentimentEmoji } from "@/components/common";

interface Response {
  id: string;
  created_at: string;
  sentiment: string | null;
  summary: string | null;
}

interface Survey {
  title: string;
}

interface RecentResponse {
  response: Response;
  survey: Survey | null;
}

interface RecentFeedbackCardProps {
  recentResponses: RecentResponse[];
  limit?: number;
}

export default function RecentFeedbackCard({
  recentResponses,
  limit = 5,
}: RecentFeedbackCardProps) {
  const displayedResponses = recentResponses.slice(0, limit);


  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h4 className="font-heading text-md font-semibold text-slate-900 mb-4">
        Recent Feedback
      </h4>
      <div className="space-y-3">
        {displayedResponses.map((item) => {
          const timeAgo = formatTimeAgo(item.response.created_at, { shortFormat: true });
          const sentimentColor = getSentimentColor(item.response.sentiment as 'positive' | 'negative' | 'neutral' | 'mixed' | null);
          const sentimentEmoji = getSentimentEmoji(item.response.sentiment as 'positive' | 'negative' | 'neutral' | 'mixed' | null);

          return (
            <div
              key={item.response.id}
              className="p-3 rounded-lg border border-slate-200 hover:border-slate-300 transition-colors duration-200"
            >
              <div className="flex items-start justify-between mb-2">
                <p className="font-body text-xs text-slate-500 flex-1">
                  {item.survey?.title || 'Unknown Survey'}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 ${sentimentColor} font-accent text-xs font-medium rounded-full ml-2`}
                >
                  {sentimentEmoji}
                </span>
              </div>
              <p className="font-body text-sm text-slate-700 line-clamp-2">
                {item.response.summary || 'Response received'}
              </p>
              <p className="font-body text-xs text-slate-400 mt-1">{timeAgo}</p>
            </div>
          );
        })}
        {displayedResponses.length === 0 && (
          <p className="font-body text-sm text-slate-500 text-center py-4">
            No recent responses yet
          </p>
        )}
      </div>
    </div>
  );
}

