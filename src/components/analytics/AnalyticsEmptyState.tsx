import Link from "next/link";
import { ChartBarIcon, ArrowRightIcon } from "@heroicons/react/24/outline";

/**
 * AnalyticsEmptyState Component
 * 
 * Displayed when there are no survey responses yet.
 * Encourages users to create their first survey with a clear call-to-action.
 */

export default function AnalyticsEmptyState() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-8">
      <div className="text-center py-12">
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-full">
            <ChartBarIcon className="w-8 h-8 text-white" />
          </div>
        </div>
        <h4 className="font-heading text-lg font-medium text-slate-900 mb-2">
          No Insights Available Yet
        </h4>
        <p className="font-body text-slate-600 leading-relaxed mb-4 max-w-md mx-auto">
          Insights will appear here once you start collecting survey responses. Create
          your first survey to get started.
        </p>
        <Link
          href="/mojeremiah/create"
          className="group inline-flex items-center gap-3 px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full text-white bg-[#2663EB] hover:bg-[#2054C8] transition-all duration-200 hover:shadow-md active:scale-95"
        >
          <span className="relative w-6 h-6 rounded-full bg-white flex items-center justify-center overflow-hidden">
            <ArrowRightIcon className="w-4 h-4 text-[#2663EB] absolute -translate-x-8 group-hover:translate-x-0 transition-transform duration-300" />
          </span>
          Create Your First Survey
        </Link>
      </div>
    </div>
  );
}

