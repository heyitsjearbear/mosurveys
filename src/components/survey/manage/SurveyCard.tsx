import { useState } from "react";
import Link from "next/link";
import {
  LinkIcon,
  ChartBarIcon,
  TrashIcon,
  PencilSquareIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon,
  ArrowDownTrayIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import type { Database } from "@/types/supabase";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";

const logger = createLogger('SurveyCard');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

/**
 * SurveyCard Component
 * 
 * Displays a single survey with actions (copy link, edit, analytics, download, delete)
 * Used in the survey management/view page
 * 
 * Features:
 * - Copy shareable survey link
 * - Edit survey (creates new version)
 * - Navigate to analytics dashboard
 * - Download survey as JSON txt file (formatted per DB schema)
 * - Delete survey with loading state
 */

interface SurveyCardProps {
  survey: Survey & { responseCount?: number };
  copiedId: string | null;
  deletingId: string | null;
  onCopyLink: (surveyId: string) => void;
  onDelete: (surveyId: string) => void;
  onViewHistory?: (surveyId: string) => void;
  onViewQuestions?: (surveyId: string) => void;
  isLatest?: boolean;
}

export default function SurveyCard({ survey, copiedId, deletingId, onCopyLink, onDelete, onViewHistory, onViewQuestions, isLatest = false }: SurveyCardProps) {
  const isDeleting = deletingId === survey.id;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      // Fetch survey data
      const { data: surveyData, error: surveyError } = await supabase
        .from('surveys')
        .select('*')
        .eq('id', survey.id)
        .single();

      if (surveyError) throw surveyError;

      // Fetch questions
      const { data: questions, error: questionsError } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', survey.id)
        .order('position', { ascending: true });

      if (questionsError) throw questionsError;

      // Format according to DB schema
      const exportData = {
        survey: {
          id: surveyData.id,
          org_id: surveyData.org_id,
          title: surveyData.title,
          description: surveyData.description,
          audience: surveyData.audience,
          version: surveyData.version,
          parent_id: surveyData.parent_id,
          changelog: surveyData.changelog,
          ai_suggestions: surveyData.ai_suggestions,
          created_at: surveyData.created_at,
          updated_at: surveyData.updated_at,
        },
        questions: questions.map((q) => ({
          id: q.id,
          survey_id: q.survey_id,
          position: q.position,
          type: q.type,
          question: q.question,
          options: q.options,
          required: q.required,
          created_at: q.created_at,
          updated_at: q.updated_at,
        })),
      };

      // Create blob and download
      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `survey-${survey.id}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      logger.info('Survey JSON downloaded', { surveyId: survey.id });
    } catch (error) {
      logger.error('Failed to download survey JSON', error, { surveyId: survey.id });
      alert('Failed to download survey data. Please try again.');
    } finally {
      setIsDownloading(false);
    }
  };

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
          <div className="flex items-center gap-1">
            <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
              v{survey.version}
            </span>
            {isLatest && (
              <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 font-accent text-xs font-medium rounded-full">
                Latest
              </span>
            )}
            {onViewHistory && (
              <button
                onClick={() => onViewHistory(survey.id)}
                className="p-1 text-slate-400 hover:text-[#2663EB] hover:bg-blue-50 rounded transition-colors duration-200"
                title="View version history"
              >
                <ClockIcon className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 font-accent text-xs font-medium rounded-full">
            <ChatBubbleLeftRightIcon className="w-3 h-3" />
            {survey.responseCount || 0}
          </span>
          <span className="font-body text-xs text-slate-500">
            {new Date(survey.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        {onViewQuestions && (
          <button
            onClick={() => onViewQuestions(survey.id)}
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-purple-100 text-purple-700 hover:bg-purple-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
            title="View questions"
          >
            <EyeIcon className="w-3.5 h-3.5" />
            Questions
          </button>
        )}
        
        <button
          onClick={() => onCopyLink(survey.id)}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="Copy shareable link"
        >
        <LinkIcon className="w-3.5 h-3.5" />
        {copiedId === survey.id ? "Copied!" : "Copy Link"}
      </button>
      
      {/* Only show Edit button for the latest version */}
      {isLatest && (
        <Link
          href={`/mojeremiah/edit/${survey.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="Edit survey (creates new version)"
        >
          <PencilSquareIcon className="w-3.5 h-3.5" />
          Edit
        </Link>
      )}
      
      <Link
          href={`/mojeremiah/analytics/${survey.id}`}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-[#2663EB] hover:bg-blue-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
          title="View analytics"
        >
          <ChartBarIcon className="w-3.5 h-3.5" />
          Analytics
        </Link>

        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 hover:bg-green-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-green-100"
          title="Download survey as JSON"
        >
          {isDownloading ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-green-700/30 border-t-green-700 rounded-full animate-spin" />
              Downloading...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="w-3.5 h-3.5" />
              Download
            </>
          )}
        </button>

        <button
          onClick={() => onDelete(survey.id)}
          disabled={isDeleting}
          className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 hover:bg-red-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-red-100"
          title="Delete survey"
        >
          {isDeleting ? (
            <>
              <div className="w-3.5 h-3.5 border-2 border-red-700/30 border-t-red-700 rounded-full animate-spin" />
              Deleting...
            </>
          ) : (
            <>
              <TrashIcon className="w-3.5 h-3.5" />
              Delete
            </>
          )}
        </button>
      </div>
    </div>
  );
}

