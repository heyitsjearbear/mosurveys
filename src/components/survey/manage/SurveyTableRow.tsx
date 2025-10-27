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

const logger = createLogger('SurveyTableRow');

type Survey = Database["public"]["Tables"]["surveys"]["Row"];

/**
 * SurveyTableRow Component
 * 
 * Displays a single survey as a table row
 * Used in table view mode
 * 
 * Features:
 * - Compact table layout
 * - All actions inline
 * - Responsive on mobile (stacks vertically)
 */

interface SurveyTableRowProps {
  survey: Survey & { responseCount?: number };
  copiedId: string | null;
  deletingId: string | null;
  onCopyLink: (surveyId: string) => void;
  onDelete: (surveyId: string) => void;
  onViewHistory?: (surveyId: string) => void;
  onViewQuestions: (surveyId: string) => void;
  isLatest?: boolean;
}

export default function SurveyTableRow({
  survey,
  copiedId,
  deletingId,
  onCopyLink,
  onDelete,
  onViewHistory,
  onViewQuestions,
  isLatest = false,
}: SurveyTableRowProps) {
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
    <tr className="border-b border-slate-200 hover:bg-slate-50 transition-colors duration-200">
      {/* Title & Audience */}
      <td className="px-4 py-4">
        <div>
          <h3 className="font-heading text-sm font-semibold text-slate-900 mb-1">
            {survey.title}
          </h3>
          {survey.audience && (
            <p className="font-body text-xs text-slate-600">
              {survey.audience}
            </p>
          )}
        </div>
      </td>

      {/* Version */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
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
      </td>

      {/* Responses */}
      <td className="px-4 py-4">
        <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-700 font-accent text-xs font-medium rounded-full">
          <ChatBubbleLeftRightIcon className="w-3 h-3" />
          {survey.responseCount || 0}
        </span>
      </td>

      {/* Created Date */}
      <td className="px-4 py-4">
        <span className="font-body text-xs text-slate-600">
          {new Date(survey.created_at).toLocaleDateString()}
        </span>
      </td>

      {/* Actions */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onViewQuestions(survey.id)}
            className="p-2 text-slate-600 hover:text-[#2663EB] hover:bg-blue-50 rounded transition-colors duration-200"
            title="View questions"
          >
            <EyeIcon className="w-4 h-4" />
          </button>

          <button
            onClick={() => onCopyLink(survey.id)}
            className="p-2 text-slate-600 hover:text-[#2663EB] hover:bg-blue-50 rounded transition-colors duration-200"
            title="Copy shareable link"
          >
            <LinkIcon className="w-4 h-4" />
          </button>

          {isLatest && (
            <Link
              href={`/mojeremiah/edit/${survey.id}`}
              className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors duration-200"
              title="Edit survey"
            >
              <PencilSquareIcon className="w-4 h-4" />
            </Link>
          )}

          <Link
            href={`/mojeremiah/analytics/${survey.id}`}
            className="p-2 text-[#2663EB] hover:text-[#2054C8] hover:bg-blue-50 rounded transition-colors duration-200"
            title="View analytics"
          >
            <ChartBarIcon className="w-4 h-4" />
          </Link>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="p-2 text-green-600 hover:text-green-700 hover:bg-green-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Download survey as JSON"
          >
            {isDownloading ? (
              <div className="w-4 h-4 border-2 border-green-600/30 border-t-green-600 rounded-full animate-spin" />
            ) : (
              <ArrowDownTrayIcon className="w-4 h-4" />
            )}
          </button>

          <button
            onClick={() => onDelete(survey.id)}
            disabled={isDeleting}
            className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Delete survey"
          >
            {isDeleting ? (
              <div className="w-4 h-4 border-2 border-red-600/30 border-t-red-600 rounded-full animate-spin" />
            ) : (
              <TrashIcon className="w-4 h-4" />
            )}
          </button>
        </div>
      </td>
    </tr>
  );
}

