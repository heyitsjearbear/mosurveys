import Link from "next/link";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";

interface EmptyResponsesStateProps {
  surveyId: string;
}

/**
 * EmptyResponsesState Component
 *
 * Displays a friendly empty state when a survey has no responses yet.
 * Includes an icon, message, and CTA to view the survey form.
 *
 * @param surveyId - The ID of the survey
 */
export function EmptyResponsesState({ surveyId }: EmptyResponsesStateProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-12">
      <div className="text-center max-w-md mx-auto">
        {/* Icon */}
        <div className="mb-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
            <ChatBubbleLeftRightIcon className="w-8 h-8 text-slate-400" />
          </div>
        </div>

        {/* Text */}
        <h3 className="font-heading text-xl font-semibold text-slate-900 mb-2">
          No Responses Yet
        </h3>
        <p className="font-body text-slate-600 leading-relaxed mb-6">
          Share your survey to start collecting responses. Analytics and insights
          will appear here once responses are submitted.
        </p>

        {/* CTA Button */}
        <Link
          href={`/mojeremiah/respond/${surveyId}`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#2663EB] hover:bg-[#2054C8] text-white font-accent text-sm font-medium rounded-lg transition-colors duration-200"
        >
          View Survey Form
        </Link>
      </div>
    </div>
  );
}
