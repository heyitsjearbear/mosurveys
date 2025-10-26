import { SparklesIcon } from "@heroicons/react/24/outline";
import type { SurveyData, QuestionType, Question } from "@/types/survey";
import { QUESTION_TYPES } from "@/types/survey";
import { QuestionTypeButton } from "./QuestionTypeButton";
import { QuestionCard } from "./QuestionCard";

// ─────────────────────────────────────────────
// STEP 2: Add Questions Component
// ─────────────────────────────────────────────

interface Step2AddQuestionsProps {
  surveyData: SurveyData;
  addQuestion: (type: QuestionType) => void;
  updateQuestion: (id: string, updates: Partial<Question>) => void;
  deleteQuestion: (id: string) => void;
  addOption: (questionId: string) => void;
  updateOption: (questionId: string, optionIndex: number, value: string) => void;
  deleteOption: (questionId: string, optionIndex: number) => void;
  handleAIGenerate: () => void;
  isGeneratingAI: boolean;
}

export function Step2AddQuestions({
  surveyData,
  addQuestion,
  updateQuestion,
  deleteQuestion,
  addOption,
  updateOption,
  deleteOption,
  handleAIGenerate,
  isGeneratingAI,
}: Step2AddQuestionsProps) {
  return (
    <div className="space-y-6">
      {/* Header with AI Button */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
              2. Add Questions
            </h2>
            <p className="font-body text-base text-slate-600">
              Build your survey by adding questions manually or use AI to generate them.
            </p>
          </div>

          {/* AI Generate Button */}
          <button
            onClick={handleAIGenerate}
            disabled={isGeneratingAI}
            className="group inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-[#2663EB] to-[#6366F1] text-white font-accent text-sm font-medium rounded-full shadow-md hover:shadow-lg transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <SparklesIcon className={`w-5 h-5 ${isGeneratingAI ? "animate-pulse" : ""}`} />
            {isGeneratingAI ? "Generating..." : "Generate with AI"}
          </button>
        </div>

        {/* Add Question Buttons - Show when no questions */}
        {surveyData.questions.length === 0 && (
          <div className="flex flex-wrap gap-3">
            {QUESTION_TYPES.map((qt) => (
              <QuestionTypeButton
                key={qt.type}
                type={qt.type}
                label={qt.label}
                icon={qt.icon}
                onClick={() => addQuestion(qt.type)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Question Cards */}
      {surveyData.questions.length > 0 && (
        <>
          {surveyData.questions.map((question, index) => (
            <QuestionCard
              key={question.id}
              question={question}
              index={index}
              updateQuestion={updateQuestion}
              deleteQuestion={deleteQuestion}
              addOption={addOption}
              updateOption={updateOption}
              deleteOption={deleteOption}
            />
          ))}

          {/* Add Another Question */}
          <div className="bg-white rounded-lg border-2 border-dashed border-slate-300 p-6 hover:border-[#2663EB] transition-colors duration-200">
            <p className="font-body text-sm text-slate-600 mb-4 text-center">
              Add another question
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              {QUESTION_TYPES.map((qt) => (
                <QuestionTypeButton
                  key={qt.type}
                  type={qt.type}
                  label={qt.label}
                  icon={qt.icon}
                  onClick={() => addQuestion(qt.type)}
                />
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

