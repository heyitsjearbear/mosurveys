"use client";

import { useState } from "react";
import { XMarkIcon, SparklesIcon } from "@heroicons/react/24/outline";
import type { Question } from "@/types/survey";
import { QUESTION_TYPES } from "@/types/survey";

// ─────────────────────────────────────────────
// AI Preview Modal Component
// ─────────────────────────────────────────────
// Displays AI-generated questions and allows users to select
// which ones to add to their survey.

interface AIPreviewModalProps {
  questions: Question[];
  isLoading: boolean;
  isMock: boolean;
  onAddSelected: (selectedQuestions: Question[]) => void;
  onClose: () => void;
}

export function AIPreviewModal({
  questions,
  isLoading,
  isMock,
  onAddSelected,
  onClose
}: AIPreviewModalProps) {
  // Track which questions are selected (all selected by default)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(questions.map(q => q.id))
  );

  const toggleQuestion = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleAddSelected = () => {
    const selectedQuestions = questions.filter(q => selectedIds.has(q.id));
    onAddSelected(selectedQuestions);
  };

  const getQuestionTypeMetadata = (type: string) => {
    return QUESTION_TYPES.find(qt => qt.type === type) || QUESTION_TYPES[0];
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-full flex items-center justify-center">
              <SparklesIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="font-heading text-2xl font-semibold text-slate-900">
                AI-Generated Questions
              </h2>
              {isMock && (
                <p className="font-body text-sm text-amber-600 mt-1">
                  Using fallback questions (OpenAI not configured)
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
          >
            <XMarkIcon className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <div className="w-16 h-16 bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-full animate-pulse mb-4"></div>
            <p className="font-body text-lg text-slate-700 mb-2">Generating questions...</p>
            <p className="font-body text-sm text-slate-500">AI is analyzing your survey context</p>
          </div>
        )}

        {/* Questions List */}
        {!isLoading && questions.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto p-6">
              <p className="font-body text-sm text-slate-600 mb-4">
                Select the questions you'd like to add to your survey. You can edit them later.
              </p>
              
              <div className="space-y-3">
                {questions.map((question) => {
                  const metadata = getQuestionTypeMetadata(question.type);
                  const isSelected = selectedIds.has(question.id);

                  return (
                    <div
                      key={question.id}
                      onClick={() => toggleQuestion(question.id)}
                      className={`
                        border-2 rounded-lg p-4 cursor-pointer transition-all duration-200
                        ${isSelected 
                          ? 'border-[#2663EB] bg-blue-50' 
                          : 'border-slate-200 bg-white hover:border-slate-300'
                        }
                      `}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <div className={`
                          flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5
                          transition-colors duration-200
                          ${isSelected 
                            ? 'bg-[#2663EB] border-[#2663EB]' 
                            : 'bg-white border-slate-300'
                          }
                        `}>
                          {isSelected && (
                            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                          )}
                        </div>

                        {/* Question Content */}
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-lg">{metadata.icon}</span>
                            <span className="font-accent text-xs font-medium text-slate-500 uppercase tracking-wide">
                              {metadata.label}
                            </span>
                          </div>
                          <p className="font-body text-base text-slate-900 mb-2">
                            {question.text}
                          </p>
                          {question.options && question.options.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                              {question.options.map((option, idx) => (
                                <span
                                  key={idx}
                                  className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 font-body text-xs rounded"
                                >
                                  {option}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-slate-200 bg-slate-50">
              <p className="font-body text-sm text-slate-600">
                {selectedIds.size} of {questions.length} questions selected
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={onClose}
                  className="px-6 py-3 border border-slate-300 font-accent text-base font-medium rounded-full text-slate-700 bg-white hover:bg-slate-100 hover:border-slate-400 transition-all duration-200 active:scale-95"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSelected}
                  disabled={selectedIds.size === 0}
                  className={`
                    px-6 py-3 border border-transparent font-accent text-base font-medium rounded-full 
                    shadow-sm transition-all duration-200
                    ${selectedIds.size > 0
                      ? 'text-white bg-[#2663EB] hover:bg-[#2054C8] hover:shadow-md active:scale-95'
                      : 'opacity-50 cursor-not-allowed text-white bg-slate-400'
                    }
                  `}
                >
                  Add Selected Questions
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty State */}
        {!isLoading && questions.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center p-12">
            <p className="font-body text-lg text-slate-700 mb-2">No questions generated</p>
            <p className="font-body text-sm text-slate-500">Please try again</p>
          </div>
        )}
      </div>
    </div>
  );
}

