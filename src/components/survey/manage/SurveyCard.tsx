import Link from "next/link";
import {
  LinkIcon,
  ChartBarIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import type { Database } from "@/types/supabase";

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

/**
 * SurveyCard Component
 * 
 * Displays a single survey with actions (copy link, analytics, delete)
 * Used in the survey management/view page
 */

interface SurveyCardProps {
  survey: Survey;
  copiedId: string | null;
  onCopyLink: (surveyId: string) => void;
  onDelete: (surveyId: string) => void;
}

export default function SurveyCard({ survey, copiedId, onCopyLink, onDelete }: SurveyCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6 transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
      {/* Survey Header */}
      <div className="mb-4">
        <h3 className="font-heading text-lg font-semibold text-slate-900 mb-1">
          {survey.title}
        </h3>
        {survey.audience && (
          <p className="font-body text-sm text-slate-600">
            Audience: {survey.audience}
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
            v{survey.version}
          </span>
          <span className="font-body text-xs text-slate-500">
            {new Date(survey.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => onCopyLink(survey.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="Copy shareable link"
        >
          <LinkIcon className="w-3.5 h-3.5" />
          {copiedId === survey.id ? "Copied!" : "Copy Link"}
        </button>
        
        <Link
          href={`/mojeremiah/analytics/${survey.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-[#2663EB] hover:bg-blue-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="View analytics"
        >
          <ChartBarIcon className="w-3.5 h-3.5" />
          Analytics
        </Link>

        <button
          onClick={() => onDelete(survey.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="Delete survey"
        >
          <TrashIcon className="w-3.5 h-3.5" />
          Delete
        </button>
      </div>
    </div>
  );
}

