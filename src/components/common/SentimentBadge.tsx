/**
 * SentimentBadge Component
 * 
 * Displays sentiment with consistent color coding across the app.
 * Used in analytics, response cards, and activity feeds.
 * 
 * @example
 * <SentimentBadge sentiment="positive" />
 * <SentimentBadge sentiment="negative" size="lg" />
 */

type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed' | null;

interface SentimentBadgeProps {
  /** Sentiment value */
  sentiment: Sentiment;
  /** Size variant (default: 'sm') */
  size?: 'xs' | 'sm' | 'md';
  /** Whether to show emoji (default: false) */
  showEmoji?: boolean;
}

const sentimentConfig = {
  positive: {
    color: 'bg-green-100 text-green-700',
    emoji: '😊',
    label: 'Positive',
  },
  negative: {
    color: 'bg-red-100 text-red-700',
    emoji: '😞',
    label: 'Negative',
  },
  neutral: {
    color: 'bg-slate-100 text-slate-700',
    emoji: '😐',
    label: 'Neutral',
  },
  mixed: {
    color: 'bg-amber-100 text-amber-700',
    emoji: '🤔',
    label: 'Mixed',
  },
};

const sizeClasses = {
  xs: 'px-2 py-0.5 text-xs',
  sm: 'px-2 py-1 text-xs',
  md: 'px-3 py-1.5 text-sm',
};

export default function SentimentBadge({
  sentiment,
  size = 'sm',
  showEmoji = false,
}: SentimentBadgeProps) {
  // Default to neutral if sentiment is null or invalid
  const config = sentiment && sentimentConfig[sentiment] 
    ? sentimentConfig[sentiment]
    : sentimentConfig.neutral;

  return (
    <span
      className={`inline-flex items-center gap-1 ${config.color} ${sizeClasses[size]} font-accent font-medium rounded-full capitalize`}
    >
      {showEmoji && <span>{config.emoji}</span>}
      {config.label}
    </span>
  );
}

/**
 * Helper function to get sentiment color classes
 * Used when you need just the colors without the component
 */
export function getSentimentColor(sentiment: Sentiment): string {
  const config = sentiment && sentimentConfig[sentiment]
    ? sentimentConfig[sentiment]
    : sentimentConfig.neutral;
  return config.color;
}

/**
 * Helper function to get sentiment emoji
 */
export function getSentimentEmoji(sentiment: Sentiment): string {
  const config = sentiment && sentimentConfig[sentiment]
    ? sentimentConfig[sentiment]
    : sentimentConfig.neutral;
  return config.emoji;
}

