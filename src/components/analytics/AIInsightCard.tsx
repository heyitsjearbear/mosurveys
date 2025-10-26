import { SparklesIcon, ArrowPathIcon } from "@heroicons/react/24/outline";

/**
 * AIInsightCard Component
 * 
 * Displays AI-generated insights with a sparkle icon.
 * Shows loading state while generating insights.
 * Allows manual refresh/regeneration.
 */

interface AIInsightCardProps {
  insight: string | null;
  loading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

export default function AIInsightCard({ 
  insight, 
  loading = false, 
  error = null,
  onRefresh 
}: AIInsightCardProps) {
  
  // Loading state
  if (loading) {
    return (
      <div className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center animate-pulse">
            <SparklesIcon className="w-6 h-6 text-white" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold text-white mb-3">
              AI Insights
            </h3>
            <div className="space-y-2">
              <div className="h-4 bg-white/30 rounded animate-pulse"></div>
              <div className="h-4 bg-white/30 rounded animate-pulse w-5/6"></div>
              <div className="h-4 bg-white/30 rounded animate-pulse w-4/6"></div>
            </div>
            <p className="font-body text-sm text-white/80 mt-3">
              Analyzing responses...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-red-600" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold text-red-900 mb-2">
              AI Insights
            </h3>
            <p className="font-body text-sm text-red-700 leading-relaxed">
              {error}
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Try Again
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Empty state (no insights yet)
  if (!insight) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-lg shadow-sm p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
            <SparklesIcon className="w-6 h-6 text-slate-500" />
          </div>
          <div className="flex-1">
            <h3 className="font-heading text-lg font-semibold text-slate-900 mb-2">
              AI Insights
            </h3>
            <p className="font-body text-sm text-slate-600 leading-relaxed">
              Insights will be generated once you have enough responses. Submit at least 3 responses to see AI-powered analysis.
            </p>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
              >
                <ArrowPathIcon className="w-4 h-4" />
                Generate Insights
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Success state with insights
  return (
    <div className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0 w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between mb-3">
            <h3 className="font-heading text-lg font-semibold text-white">
              AI Insights
            </h3>
            {onRefresh && (
              <button
                onClick={onRefresh}
                className="inline-flex items-center gap-1 px-3 py-1 bg-white/20 hover:bg-white/30 text-white font-accent text-xs font-medium rounded-full transition-colors duration-200"
                title="Regenerate insights"
              >
                <ArrowPathIcon className="w-3 h-3" />
                Refresh
              </button>
            )}
          </div>
          <p className="font-body text-base text-white leading-relaxed">
            {insight}
          </p>
          <p className="font-body text-xs text-white/70 mt-3">
            Generated by AI • Based on response analysis
          </p>
        </div>
      </div>
    </div>
  );
}

