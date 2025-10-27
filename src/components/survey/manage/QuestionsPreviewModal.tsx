import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { supabase } from "@/lib/supabaseClient";
import { createLogger } from "@/lib/logger";
import { QUESTION_TYPES } from "@/types/survey";
import type { Database } from "@/types/supabase";
import { LoadingState, ErrorState } from "@/components/common";

const logger = createLogger('QuestionsPreviewModal');

type SurveyQuestion = Database["public"]["Tables"]["survey_questions"]["Row"];

/**
 * QuestionsPreviewModal Component
 * 
 * Modal that displays all questions in a survey
 * 
 * Features:
 * - Fetches questions from database
 * - Displays question type, text, and options
 * - Loading and error states
 * - Scrollable list for many questions
 */

interface QuestionsPreviewModalProps {
  surveyId: string;
  surveyTitle: string;
  onClose: () => void;
}

export default function QuestionsPreviewModal({
  surveyId,
  surveyTitle,
  onClose,
}: QuestionsPreviewModalProps) {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchQuestions();
  }, [surveyId]);

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("survey_questions")
        .select("*")
        .eq("survey_id", surveyId)
        .order("position", { ascending: true });

      if (fetchError) throw fetchError;

      setQuestions(data || []);
      logger.debug('Questions loaded', { surveyId, count: data?.length || 0 });
    } catch (err) {
      logger.error('Failed to fetch questions', err, { surveyId });
      setError("Failed to load questions. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeMetadata = (type: string) => {
    return QUESTION_TYPES.find((qt) => qt.type === type) || QUESTION_TYPES[0];
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div>
            <h2 className="font-heading text-xl font-semibold text-slate-900">
              Survey Questions
            </h2>
            <p className="font-body text-sm text-slate-600 mt-1">{surveyTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
            title="Close"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && <LoadingState message="Loading questions..." />}

          {error && !loading && <ErrorState message={error} onRetry={fetchQuestions} />}

          {!loading && !error && questions.length === 0 && (
            <div className="text-center py-8">
              <p className="font-body text-base text-slate-600">
                No questions found in this survey.
              </p>
            </div>
          )}

          {!loading && !error && questions.length > 0 && (
            <div className="space-y-4">
              {questions.map((question, index) => {
                const metadata = getQuestionTypeMetadata(question.type);
                return (
                  <div
                    key={question.id}
                    className="bg-slate-50 rounded-lg border border-slate-200 p-4 transition-all duration-200 hover:shadow-sm"
                  >
                    {/* Question Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <span className="flex-shrink-0 w-8 h-8 bg-[#2663EB] text-white rounded-full flex items-center justify-center font-accent text-sm font-semibold">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{metadata.icon}</span>
                          <span className="inline-flex items-center px-2 py-1 bg-white border border-slate-200 text-slate-700 font-accent text-xs font-medium rounded">
                            {metadata.label}
                          </span>
                          {question.required && (
                            <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 font-accent text-xs font-medium rounded">
                              Required
                            </span>
                          )}
                        </div>
                        <p className="font-body text-base text-slate-900 font-medium">
                          {question.question}
                        </p>
                      </div>
                    </div>

                    {/* Question Options (for multiple choice) */}
                    {question.type === "multiple_choice" && question.options && (
                      <div className="ml-11 mt-3 space-y-2">
                        <p className="font-body text-xs text-slate-600 mb-2">Options:</p>
                        {question.options.map((option: string, optIndex: number) => (
                          <div
                            key={optIndex}
                            className="flex items-center gap-2 text-sm text-slate-700"
                          >
                            <span className="w-5 h-5 rounded-full border-2 border-slate-300 flex items-center justify-center font-body text-xs">
                              {String.fromCharCode(65 + optIndex)}
                            </span>
                            <span className="font-body">{option}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Rating Scale Info */}
                    {question.type === "rating" && (
                      <div className="ml-11 mt-3">
                        <p className="font-body text-xs text-slate-600">
                          Scale: 1 to 5 stars
                        </p>
                      </div>
                    )}

                    {/* Yes/No Info */}
                    {question.type === "yes_no" && (
                      <div className="ml-11 mt-3 flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 font-accent text-xs rounded">
                          Yes
                        </span>
                        <span className="inline-flex items-center px-2 py-1 bg-red-100 text-red-700 font-accent text-xs rounded">
                          No
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
          <p className="font-body text-sm text-slate-600">
            {questions.length} question{questions.length !== 1 ? "s" : ""} total
          </p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#2663EB] text-white font-accent text-sm font-medium rounded-lg hover:bg-[#2054C8] transition-colors duration-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

