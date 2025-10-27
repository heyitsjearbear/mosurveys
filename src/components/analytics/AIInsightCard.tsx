import { SparklesIcon } from "@heroicons/react/24/outline";

interface AIInsightCardProps {
  insight: string | null;
  loading?: boolean;
}

export default function AIInsightCard({ insight, loading }: AIInsightCardProps) {
  if (!insight && !loading) return null;

  return (
    <div className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-lg shadow-sm p-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <SparklesIcon className="w-6 h-6 text-white" />
        </div>
        <div className="flex-1">
          <h3 className="font-heading text-lg font-semibold text-white mb-2">
            AI Insights
          </h3>
          {loading ? (
            <div className="animate-pulse">
              <div className="h-4 bg-blue-300 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-blue-300 rounded w-1/2"></div>
            </div>
          ) : (
            <p className="font-body text-sm text-blue-50 leading-relaxed">
              {insight}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
