/**
 * SentimentBreakdownCard Component
 * 
 * Displays a visual breakdown of sentiment distribution across all survey responses.
 * Shows counts and percentages for positive, neutral, negative, and mixed sentiments.
 * 
 * @param sentimentBreakdown - Object containing counts for each sentiment type
 * @param totalResponses - Total number of responses for percentage calculations
 */

interface SentimentBreakdownCardProps {
  sentimentBreakdown: {
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  };
  totalResponses: number;
}

export default function SentimentBreakdownCard({
  sentimentBreakdown,
  totalResponses,
}: SentimentBreakdownCardProps) {
  // Calculate percentages for each sentiment
  const calculatePercentage = (count: number) => {
    return totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
      <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
        Overall Sentiment Distribution
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Positive Sentiment */}
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="font-heading text-2xl font-semibold text-green-700">
            {sentimentBreakdown.positive}
          </p>
          <p className="font-accent text-xs text-green-600 mt-1">Positive</p>
          <p className="font-body text-xs text-slate-500 mt-1">
            {calculatePercentage(sentimentBreakdown.positive)}%
          </p>
        </div>

        {/* Neutral Sentiment */}
        <div className="text-center p-4 bg-slate-50 rounded-lg">
          <p className="font-heading text-2xl font-semibold text-slate-700">
            {sentimentBreakdown.neutral}
          </p>
          <p className="font-accent text-xs text-slate-600 mt-1">Neutral</p>
          <p className="font-body text-xs text-slate-500 mt-1">
            {calculatePercentage(sentimentBreakdown.neutral)}%
          </p>
        </div>

        {/* Negative Sentiment */}
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="font-heading text-2xl font-semibold text-red-700">
            {sentimentBreakdown.negative}
          </p>
          <p className="font-accent text-xs text-red-600 mt-1">Negative</p>
          <p className="font-body text-xs text-slate-500 mt-1">
            {calculatePercentage(sentimentBreakdown.negative)}%
          </p>
        </div>

        {/* Mixed Sentiment */}
        <div className="text-center p-4 bg-amber-50 rounded-lg">
          <p className="font-heading text-2xl font-semibold text-amber-700">
            {sentimentBreakdown.mixed}
          </p>
          <p className="font-accent text-xs text-amber-600 mt-1">Mixed</p>
          <p className="font-body text-xs text-slate-500 mt-1">
            {calculatePercentage(sentimentBreakdown.mixed)}%
          </p>
        </div>
      </div>
    </div>
  );
}

