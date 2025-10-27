import { ClipboardDocumentListIcon } from "@heroicons/react/24/outline";
import {
  SurveyCard,
  SurveyTableRow,
  SurveyListItem,
} from "@/components/survey/manage";
import { LoadingState, ErrorState, EmptyState } from "@/components/common";
import type { Database } from "@/types/supabase";
import type { ViewMode } from "@/components/survey/manage";

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

/**
 * SurveyViewContent Component
 * 
 * Displays surveys in the selected view mode (grid, table, or list)
 * Handles loading, error, and empty states
 */

interface SurveyViewContentProps {
  viewMode: ViewMode;
  surveys: (Survey & { responseCount?: number })[];
  loading: boolean;
  error: string | null;
  copiedId: string | null;
  deletingId: string | null;
  onCopyLink: (surveyId: string) => void;
  onDelete: (surveyId: string) => void;
  onViewHistory?: (surveyId: string) => void;
  onViewQuestions: (surveyId: string) => void;
  onRetry: () => void;
  isLatestVersion: (survey: Survey) => boolean;
}

export default function SurveyViewContent({
  viewMode,
  surveys,
  loading,
  error,
  copiedId,
  deletingId,
  onCopyLink,
  onDelete,
  onViewHistory,
  onViewQuestions,
  onRetry,
  isLatestVersion,
}: SurveyViewContentProps) {
  // Loading state
  if (loading) {
    return <LoadingState message="Loading surveys..." />;
  }

  // Error state
  if (error) {
    return <ErrorState message={error} onRetry={onRetry} />;
  }

  // Empty state
  if (surveys.length === 0) {
    return (
      <EmptyState
        icon={<ClipboardDocumentListIcon className="w-8 h-8 text-[#2663EB]" />}
        title="No Surveys Yet"
        description="Get started by creating your first survey. Design questions, share with your audience, and collect valuable feedback."
        actionLabel="Create Your First Survey"
        actionHref="/mojeremiah/create"
      />
    );
  }

  // Grid View
  if (viewMode === "grid") {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {surveys.map((survey) => (
          <SurveyCard
            key={survey.id}
            survey={survey}
            copiedId={copiedId}
            deletingId={deletingId}
            onCopyLink={onCopyLink}
            onDelete={onDelete}
            onViewHistory={onViewHistory}
            onViewQuestions={onViewQuestions}
            isLatest={isLatestVersion(survey)}
          />
        ))}
      </div>
    );
  }

  // Table View
  if (viewMode === "table") {
    return (
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Survey
              </th>
              <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Version
              </th>
              <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Responses
              </th>
              <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Created
              </th>
              <th className="px-4 py-3 text-left font-heading text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {surveys.map((survey) => (
              <SurveyTableRow
                key={survey.id}
                survey={survey}
                copiedId={copiedId}
                deletingId={deletingId}
                onCopyLink={onCopyLink}
                onDelete={onDelete}
                onViewHistory={onViewHistory}
                onViewQuestions={onViewQuestions}
                isLatest={isLatestVersion(survey)}
              />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  // List View
  return (
    <div className="space-y-4">
      {surveys.map((survey) => (
        <SurveyListItem
          key={survey.id}
          survey={survey}
          copiedId={copiedId}
          deletingId={deletingId}
          onCopyLink={onCopyLink}
          onDelete={onDelete}
          onViewHistory={onViewHistory}
          onViewQuestions={onViewQuestions}
          isLatest={isLatestVersion(survey)}
        />
      ))}
    </div>
  );
}
