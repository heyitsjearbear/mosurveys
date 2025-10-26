import type { SurveyData } from "@/types/survey";

// ─────────────────────────────────────────────
// STEP 3: Review & Publish Component
// ─────────────────────────────────────────────

interface Step3ReviewProps {
  surveyData: SurveyData;
}

export function Step3Review({ surveyData }: Step3ReviewProps) {
  // Calculate statistics
  const totalQuestions = surveyData.questions.length;
  const requiredQuestions = surveyData.questions.filter((q) => q.required).length;
  const estimatedTime = Math.max(2, Math.ceil(totalQuestions * 0.5));

  return (
    <div className="space-y-6">
      {/* Survey Overview */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-6">
          3. Review Your Survey
        </h2>

        <div className="space-y-6">
          {/* Survey Info Summary */}
          <div className="pb-6 border-b border-slate-200">
            <h3 className="font-heading text-xl font-semibold text-slate-900 mb-4">
              {surveyData.title || "Untitled Survey"}
            </h3>
            {surveyData.description && (
              <p className="font-body text-base text-slate-600 mb-4">
                {surveyData.description}
              </p>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-[#2663EB] font-accent text-sm font-medium rounded-full">
              <span>👥</span>
              {surveyData.audience}
            </div>
          </div>

          {/* Questions Preview */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-slate-900 mb-4">
              Questions ({totalQuestions})
            </h4>
            <div className="space-y-4">
              {surveyData.questions.map((question, index) => (
                <div
                  key={question.id}
                  className="p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <div className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 bg-[#2663EB] text-white rounded-full flex items-center justify-center font-accent text-sm font-semibold">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <p className="font-body text-base text-slate-900 mb-2">
                        {question.text || "Question text"}
                        {question.required && (
                          <span className="ml-1 text-red-500">*</span>
                        )}
                      </p>
                      <p className="font-accent text-xs text-slate-500">
                        {question.type === "short_text" && "Short text answer"}
                        {question.type === "long_text" && "Long text answer"}
                        {question.type === "multiple_choice" &&
                          `Multiple choice (${question.options?.length || 0} options)`}
                        {question.type === "rating" && "Rating scale (1-5)"}
                        {question.type === "yes_no" && "Yes/No question"}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center">
          <p className="font-body text-sm text-slate-600 mb-1">Total Questions</p>
          <p className="font-heading text-3xl font-semibold text-slate-900">
            {totalQuestions}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center">
          <p className="font-body text-sm text-slate-600 mb-1">Required Questions</p>
          <p className="font-heading text-3xl font-semibold text-slate-900">
            {requiredQuestions}
          </p>
        </div>
        <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-6 text-center">
          <p className="font-body text-sm text-slate-600 mb-1">Est. Time</p>
          <p className="font-heading text-3xl font-semibold text-slate-900">
            {estimatedTime} min
          </p>
        </div>
      </div>
    </div>
  );
}

