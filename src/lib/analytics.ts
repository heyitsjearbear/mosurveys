/**
 * Analytics Utilities
 * ────────────────────────────────────────────────────
 * Pure functions for calculating survey analytics metrics.
 * 
 * Why this file exists:
 * - Centralized calculations mean one source of truth for metrics
 * - Pure functions are easily testable (no side effects)
 * - Can be reused across components, APIs, CLI tools, etc.
 * - Changes to calculation logic only need to happen in one place
 */

import type { Database } from '@/types/supabase';

type Response = Database['public']['Tables']['responses']['Row'];
type Sentiment = 'positive' | 'negative' | 'neutral' | 'mixed';

/**
 * Sentiment Counts
 * ────────────────────────────────────────────────────
 * Breakdown of responses by sentiment category
 */
export interface SentimentCounts {
  positive: number;
  negative: number;
  neutral: number;
  mixed: number;
  unanalyzed: number;
}

/**
 * Analytics Summary
 * ────────────────────────────────────────────────────
 * Complete analytics data for a survey
 */
export interface AnalyticsSummary {
  total: number;
  sentimentCounts: SentimentCounts;
  avgSentiment: 'Positive' | 'Negative' | 'Neutral' | 'N/A';
  latestResponse: Response | null;
}

/**
 * Calculate sentiment breakdown from responses
 * 
 * @param responses - Array of survey responses
 * @returns Sentiment counts by category
 */
export function calculateSentimentCounts(responses: Response[]): SentimentCounts {
  return {
    positive: responses.filter((r) => r.sentiment === 'positive').length,
    negative: responses.filter((r) => r.sentiment === 'negative').length,
    neutral: responses.filter((r) => r.sentiment === 'neutral').length,
    mixed: responses.filter((r) => r.sentiment === 'mixed').length,
    unanalyzed: responses.filter((r) => !r.sentiment).length,
  };
}

/**
 * Determine overall sentiment trend from counts
 * 
 * Industry Practice: Simple majority wins
 * - If positive > negative → "Positive"
 * - If negative > positive → "Negative"
 * - Otherwise → "Neutral"
 * 
 * @param sentimentCounts - Breakdown of sentiments
 * @param totalResponses - Total number of responses
 * @returns Overall sentiment label
 */
export function calculateAverageSentiment(
  sentimentCounts: SentimentCounts,
  totalResponses: number
): 'Positive' | 'Negative' | 'Neutral' | 'N/A' {
  if (totalResponses === 0) return 'N/A';

  if (sentimentCounts.positive > sentimentCounts.negative) {
    return 'Positive';
  } else if (sentimentCounts.negative > sentimentCounts.positive) {
    return 'Negative';
  } else {
    return 'Neutral';
  }
}

/**
 * Calculate complete analytics summary
 * 
 * This is the main function used by components and hooks.
 * It orchestrates all the individual calculations.
 * 
 * @param responses - Array of survey responses (should be sorted by created_at DESC)
 * @returns Complete analytics summary
 */
export function calculateAnalyticsSummary(responses: Response[]): AnalyticsSummary {
  const total = responses.length;
  const sentimentCounts = calculateSentimentCounts(responses);
  const avgSentiment = calculateAverageSentiment(sentimentCounts, total);
  const latestResponse = responses.length > 0 ? responses[0] : null;

  return {
    total,
    sentimentCounts,
    avgSentiment,
    latestResponse,
  };
}

/**
 * Calculate sentiment percentage
 * 
 * @param count - Count of responses with this sentiment
 * @param total - Total number of responses
 * @returns Percentage (0-100)
 */
export function calculateSentimentPercentage(count: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((count / total) * 100);
}

/**
 * Get sentiment color for UI display
 * 
 * @param sentiment - Sentiment type
 * @returns Tailwind color classes
 */
export function getSentimentColor(sentiment: Sentiment | null): {
  bg: string;
  text: string;
  border: string;
} {
  switch (sentiment) {
    case 'positive':
      return {
        bg: 'bg-green-100',
        text: 'text-green-700',
        border: 'border-green-200',
      };
    case 'negative':
      return {
        bg: 'bg-red-100',
        text: 'text-red-700',
        border: 'border-red-200',
      };
    case 'mixed':
      return {
        bg: 'bg-purple-100',
        text: 'text-purple-700',
        border: 'border-purple-200',
      };
    case 'neutral':
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-200',
      };
  }
}

/**
 * Get sentiment icon/emoji for UI display
 * 
 * @param sentiment - Sentiment type
 * @returns Emoji string
 */
export function getSentimentIcon(sentiment: Sentiment | null): string {
  switch (sentiment) {
    case 'positive':
      return '😊';
    case 'negative':
      return '😞';
    case 'mixed':
      return '😐';
    case 'neutral':
    default:
      return '😶';
  }
}

/**
 * Calculate response rate (if you track expected vs actual responses)
 * 
 * @param actualResponses - Number of responses received
 * @param expectedResponses - Number of expected responses
 * @returns Percentage (0-100)
 */
export function calculateResponseRate(
  actualResponses: number,
  expectedResponses: number
): number {
  if (expectedResponses === 0) return 0;
  return Math.round((actualResponses / expectedResponses) * 100);
}

