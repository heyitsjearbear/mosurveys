import type { SurveyData } from "@/types/survey";

// ─────────────────────────────────────────────
// STEP 1: Survey Info Component
// ─────────────────────────────────────────────

interface Step1SurveyInfoProps {
  surveyData: SurveyData;
  setSurveyData: (data: SurveyData) => void;
}

export function Step1SurveyInfo({ surveyData, setSurveyData }: Step1SurveyInfoProps) {
  return (
    <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
          1. Survey Information
        </h2>
        <p className="font-body text-base text-slate-600">
          Let's start with the basics. Tell us about your survey.
        </p>
      </div>

      <div className="space-y-6">
        {/* Survey Title */}
        <div>
          <label
            htmlFor="survey-title"
            className="block font-body text-sm font-medium text-slate-700 mb-2"
          >
            Survey Title <span className="text-red-500">*</span>
          </label>
          <input
            id="survey-title"
            type="text"
            value={surveyData.title}
            onChange={(e) => setSurveyData({ ...surveyData, title: e.target.value })}
            className="w-full px-4 py-3 font-body text-base text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
            placeholder="e.g., Customer Satisfaction Survey"
          />
        </div>

        {/* Survey Description */}
        <div>
          <label
            htmlFor="survey-description"
            className="block font-body text-sm font-medium text-slate-700 mb-2"
          >
            Description <span className="text-slate-400">(Optional)</span>
          </label>
          <textarea
            id="survey-description"
            value={surveyData.description}
            onChange={(e) =>
              setSurveyData({ ...surveyData, description: e.target.value })
            }
            rows={4}
            maxLength={500}
            className="w-full px-4 py-3 font-body text-base text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200 resize-none"
            placeholder="Provide context for your survey participants..."
          />
          <p className="mt-2 font-body text-xs text-slate-500">
            {surveyData.description.length}/500 characters
          </p>
        </div>

        {/* Target Audience */}
        <div>
          <label
            htmlFor="survey-audience"
            className="block font-body text-sm font-medium text-slate-700 mb-2"
          >
            Target Audience <span className="text-red-500">*</span>
          </label>
          <input
            id="survey-audience"
            type="text"
            value={surveyData.audience}
            onChange={(e) => setSurveyData({ ...surveyData, audience: e.target.value })}
            className="w-full px-4 py-3 font-body text-base text-slate-900 placeholder:text-slate-400 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
            placeholder="e.g., New Customers, All Users, Beta Testers"
          />
        </div>
      </div>
    </div>
  );
}

