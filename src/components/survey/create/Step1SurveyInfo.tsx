import type { SurveyData } from "@/types/survey";
import { CheckCircleIcon } from "@heroicons/react/24/solid";

// ─────────────────────────────────────────────
// STEP 1: Survey Info Component
// ─────────────────────────────────────────────

interface Step1SurveyInfoProps {
  surveyData: SurveyData;
  setSurveyData: (data: SurveyData) => void;
}

// ─────────────────────────────────────────────
// Quality Score Calculator
// ─────────────────────────────────────────────

function calculateDescriptionQuality(description: string): {
  score: number;
  metrics: {
    charScore: number;
    wordCount: number;
    hasKeywords: boolean;
    hasSpecificity: boolean;
    hasStructure: boolean;
  };
} {
  const length = description.length;
  const words = description.trim().split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;

  // Character Score (50% of total)
  let charScore = 0;
  if (length >= 150) {
    charScore = 50;
  } else if (length >= 50) {
    charScore = ((length - 50) / 100) * 50; // Linear progression from 50 to 150 chars
  }

  // Quality Metrics (50% of total)
  let qualityScore = 0;

  // Word count (15 points): 15+ words
  const wordCountScore = wordCount >= 15 ? 15 : 0;
  qualityScore += wordCountScore;

  // Keywords (10 points): survey-related terms
  const keywords = ['survey', 'feedback', 'customer', 'questions', 'experience', 'satisfaction', 'opinions'];
  const hasKeywords = keywords.some(keyword => 
    description.toLowerCase().includes(keyword)
  );
  if (hasKeywords) {
    qualityScore += 10;
  }

  // Specificity (10 points): contains numbers or capital letters (proper nouns)
  const hasNumbers = /\d/.test(description);
  const hasProperNouns = /[A-Z][a-z]+/.test(description);
  const hasSpecificity = hasNumbers || hasProperNouns;
  if (hasSpecificity) {
    qualityScore += 10;
  }

  // Structure (15 points): starts with capital, ends with punctuation
  const startsWithCapital = /^[A-Z]/.test(description);
  const endsWithPunctuation = /[.!?]$/.test(description.trim());
  const hasStructure = startsWithCapital && endsWithPunctuation;
  if (hasStructure) {
    qualityScore += 15;
  }

  const totalScore = Math.min(100, Math.round(charScore + qualityScore));

  return {
    score: totalScore,
    metrics: {
      charScore,
      wordCount,
      hasKeywords,
      hasSpecificity,
      hasStructure
    }
  };
}

export function Step1SurveyInfo({ surveyData, setSurveyData }: Step1SurveyInfoProps) {
  const quality = calculateDescriptionQuality(surveyData.description);
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
          <div className="mt-2 flex items-center justify-between">
            <p className="font-body text-xs text-slate-500">
              {surveyData.description.length}/500 characters
            </p>
          </div>

          {/* Quality Score Bar */}
          {surveyData.description.length > 0 && (
            <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
              <div className="flex items-center justify-between mb-2">
                <span className="font-accent text-sm font-medium text-slate-700">
                  Description Quality for AI
                </span>
                <span className={`
                  font-accent text-sm font-semibold
                  ${quality.score >= 80 ? 'text-green-600' : 
                    quality.score >= 50 ? 'text-amber-600' : 
                    'text-red-600'}
                `}>
                  {quality.score}%
                </span>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden mb-3">
                <div
                  className={`
                    h-full transition-all duration-300 rounded-full
                    ${quality.score >= 80 ? 'bg-gradient-to-r from-green-500 to-green-600' : 
                      quality.score >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-600' : 
                      'bg-gradient-to-r from-red-500 to-red-600'}
                  `}
                  style={{ width: `${quality.score}%` }}
                />
              </div>

              {/* Quality Metrics */}
              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className={`flex items-center gap-1.5 text-xs ${quality.metrics.wordCount >= 15 ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="font-body">15+ words</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${quality.metrics.hasKeywords ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="font-body">Survey keywords</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${quality.metrics.hasSpecificity ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="font-body">Specific details</span>
                </div>
                <div className={`flex items-center gap-1.5 text-xs ${quality.metrics.hasStructure ? 'text-green-600' : 'text-slate-400'}`}>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span className="font-body">Good structure</span>
                </div>
              </div>

              {/* Motivational Text */}
              <p className="font-body text-xs text-slate-600 mt-2">
                {quality.score >= 80 ? (
                  <span className="text-green-700 font-medium">
                    ✨ Great detail! AI will generate better questions with this context.
                  </span>
                ) : quality.score >= 50 ? (
                  <span className="text-amber-700">
                    Good start! Add more details to help AI understand your survey goals.
                  </span>
                ) : (
                  <span className="text-slate-600">
                    Add more context to improve AI question generation.
                  </span>
                )}
              </p>
            </div>
          )}
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

