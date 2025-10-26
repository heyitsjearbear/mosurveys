import { useState } from "react";
import type { Database } from "@/types/supabase";
import { 
  FaceSmileIcon, 
  FaceFrownIcon, 
  MinusCircleIcon,
  QuestionMarkCircleIcon 
} from "@heroicons/react/24/outline";

type Response = Database["public"]["Tables"]["responses"]["Row"];
type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];

/**
 * ResponseCard Component
 * 
 * Displays a single survey response with:
 * - Timestamp and sentiment indicator
 * - Question → Answer pairs
 * - AI-generated summary (if available)
 * - Expandable/collapsible for long responses
 */

interface ResponseCardProps {
  response: Response;
  questions: SurveyQuestion[];
  responseNumber: number;
  showSurveyInfo?: boolean;
}

export default function ResponseCard({ 
  response, 
  questions, 
  responseNumber,
  showSurveyInfo = false 
}: ResponseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Parse answers (JSONB stored as object with question IDs as keys)
  const answers = response.answers as Record<string, string>;

  // Get sentiment display
  const getSentimentDisplay = (sentiment: string | null) => {
    switch (sentiment) {
      case 'positive':
        return {
          icon: <FaceSmileIcon className="w-5 h-5" />,
          label: 'Positive',
          bgColor: 'bg-green-100',
          textColor: 'text-green-700',
          emoji: '😊'
        };
      case 'negative':
        return {
          icon: <FaceFrownIcon className="w-5 h-5" />,
          label: 'Negative',
          bgColor: 'bg-red-100',
          textColor: 'text-red-700',
          emoji: '😞'
        };
      case 'neutral':
        return {
          icon: <MinusCircleIcon className="w-5 h-5" />,
          label: 'Neutral',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-700',
          emoji: '😐'
        };
      case 'mixed':
        return {
          icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
          label: 'Mixed',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-700',
          emoji: '🤔'
        };
      default:
        return {
          icon: <QuestionMarkCircleIcon className="w-5 h-5" />,
          label: 'Not Analyzed',
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-500',
          emoji: '⏳'
        };
    }
  };

  const sentimentDisplay = getSentimentDisplay(response.sentiment);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
      {/* Header */}
      <div className="flex items-start justify-between p-6 border-b border-slate-200">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-heading text-lg font-semibold text-slate-900">
              Response #{responseNumber}
            </h4>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 ${sentimentDisplay.bgColor} ${sentimentDisplay.textColor} font-accent text-xs font-medium rounded-full`}>
              <span className="text-base">{sentimentDisplay.emoji}</span>
              {sentimentDisplay.label}
            </span>
          </div>
          <p className="font-body text-sm text-slate-500">
            {formatTimestamp(response.created_at)}
          </p>
        </div>
        
        {/* Expand/Collapse Button */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ml-4 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors duration-200"
          aria-label={isExpanded ? "Collapse response" : "Expand response"}
        >
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Content - Expandable */}
      {isExpanded && (
        <div className="p-6 space-y-4">
          {/* AI Summary (if available) */}
          {response.summary && (
            <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-2">
                <span className="text-xl">✨</span>
                <div className="flex-1">
                  <p className="font-accent text-xs font-semibold text-blue-900 mb-1">
                    AI Summary
                  </p>
                  <p className="font-body text-sm text-blue-800 leading-relaxed">
                    {response.summary}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Question & Answer Pairs */}
          <div className="space-y-4">
            {questions
              .sort((a, b) => a.position - b.position)
              .map((question, index) => {
                const answer = answers[question.id.toString()];
                
                // Skip if no answer provided
                if (!answer || answer.trim() === '') return null;

                return (
                  <div key={question.id} className="space-y-2">
                    <div className="flex items-start gap-2">
                      <span className="flex-shrink-0 inline-flex items-center justify-center w-6 h-6 bg-[#2663EB] text-white font-accent text-xs font-semibold rounded-full">
                        {index + 1}
                      </span>
                      <p className="flex-1 font-body text-sm font-medium text-slate-900">
                        {question.question}
                      </p>
                    </div>
                    <div className="ml-8 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="font-body text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                        {answer}
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>

          {/* No answers case */}
          {Object.keys(answers).length === 0 && (
            <div className="text-center py-8">
              <p className="font-body text-sm text-slate-500">
                No answers recorded for this response.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

