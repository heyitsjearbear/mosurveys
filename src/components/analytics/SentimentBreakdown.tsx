interface SentimentCounts {
  positive: number;
  neutral: number;
  negative: number;
  mixed: number;
}

interface SentimentBreakdownProps {
  sentimentCounts: SentimentCounts;
}

/**
 * SentimentBreakdown Component
 *
 * Displays a visual breakdown of response sentiments across four categories:
 * Positive, Neutral, Negative, and Mixed. Each category shows color-coded cards.
 *
 * @param sentimentCounts - Object containing counts for each sentiment
 */
export function SentimentBreakdown({ sentimentCounts }: SentimentBreakdownProps) {
  const sentimentData = [
    {
      label: 'Positive',
      value: sentimentCounts.positive,
      bg: 'bg-green-50',
      textColor: 'text-green-700',
      labelColor: 'text-green-600',
    },
    {
      label: 'Neutral',
      value: sentimentCounts.neutral,
      bg: 'bg-slate-50',
      textColor: 'text-slate-700',
      labelColor: 'text-slate-600',
    },
    {
      label: 'Negative',
      value: sentimentCounts.negative,
      bg: 'bg-red-50',
      textColor: 'text-red-700',
      labelColor: 'text-red-600',
    },
    {
      label: 'Mixed',
      value: sentimentCounts.mixed,
      bg: 'bg-amber-50',
      textColor: 'text-amber-700',
      labelColor: 'text-amber-600',
    },
  ];

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6">
      <h3 className="font-heading text-lg font-semibold text-slate-900 mb-4">
        Sentiment Breakdown
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {sentimentData.map((sentiment) => (
          <div
            key={sentiment.label}
            className={`text-center p-4 ${sentiment.bg} rounded-lg`}
          >
            <p className={`font-heading text-2xl font-semibold ${sentiment.textColor}`}>
              {sentiment.value}
            </p>
            <p className={`font-accent text-xs ${sentiment.labelColor} mt-1`}>
              {sentiment.label}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
