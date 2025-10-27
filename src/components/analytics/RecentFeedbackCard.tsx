/**
 * RecentFeedbackCard Component
 * 
 * Displays a list of recent survey responses with sentiment indicators.
 * Shows survey title, response summary, sentiment badge, and time ago.
 * 
 * @param recentResponses - Array of recent responses with sentiment analysis
 */

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

  // Helper function to calculate time ago
  const getTimeAgo = (createdAt: string): string => {
    const now = new Date();
    const responseTime = new Date(createdAt);
    const diffMs = now.getTime() - responseTime.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  // Helper function to get sentiment styling
  const getSentimentStyle = (sentiment: string | null) => {
    const styles = {
      positive: { color: 'text-green-600 bg-green-100', emoji: '😊' },
      negative: { color: 'text-red-600 bg-red-100', emoji: '😞' },
      neutral: { color: 'text-slate-600 bg-slate-100', emoji: '😐' },
      mixed: { color: 'text-amber-600 bg-amber-100', emoji: '🤔' },
    };
    return styles[sentiment as keyof typeof styles] || styles.neutral;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h4 className="font-heading text-md font-semibold text-slate-900 mb-4">
        Recent Feedback
      </h4>
      <div className="space-y-3">
        {displayedResponses.map((item) => {
          const timeAgo = getTimeAgo(item.response.created_at);
          const sentimentStyle = getSentimentStyle(item.response.sentiment);

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
                  className={`inline-flex items-center gap-1 px-2 py-0.5 ${sentimentStyle.color} font-accent text-xs font-medium rounded-full ml-2`}
                >
                  {sentimentStyle.emoji}
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

