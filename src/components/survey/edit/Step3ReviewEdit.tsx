import { useState } from "react";
import type { SurveyData } from "@/types/survey";
import { formatVersion, calculateNextVersion } from "@/lib/versionUtils";

// ─────────────────────────────────────────────
// STEP 3: Review & Save Version Component (Edit Mode)
// ─────────────────────────────────────────────
// Modified version of Step3Review for editing surveys.
// Adds version controls and changelog field.

interface Step3ReviewEditProps {
  surveyData: SurveyData;
  currentVersion: number;
  isMajorVersion: boolean;
  setIsMajorVersion: (value: boolean) => void;
  changelog: string;
  setChangelog: (value: string) => void;
}

export function Step3ReviewEdit({
  surveyData,
  currentVersion,
  isMajorVersion,
  setIsMajorVersion,
  changelog,
  setChangelog,
}: Step3ReviewEditProps) {
  // Calculate statistics
  const totalQuestions = surveyData.questions.length;
  const requiredQuestions = surveyData.questions.filter((q) => q.required).length;
  const estimatedTime = Math.max(2, Math.ceil(totalQuestions * 0.5));

  // Calculate next version for preview
  const nextVersion = calculateNextVersion(currentVersion, isMajorVersion);

  return (
    <div className="space-y-6">
      {/* Version Info Banner */}
      <div className="bg-gradient-to-r from-[#2663EB] to-[#6366F1] rounded-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-accent text-sm text-white/80 mb-1">Creating New Version</p>
            <div className="flex items-center gap-3">
              <span className="font-heading text-2xl font-semibold text-white">
                {formatVersion(currentVersion)}
              </span>
              <span className="text-white/60 text-lg">→</span>
              <span className="font-heading text-2xl font-semibold text-white">
                {formatVersion(nextVersion)}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="font-accent text-xs text-white/80">Version Type</p>
            <p className="font-accent text-sm font-medium text-white">
              {isMajorVersion ? "Major Update" : "Minor Update"}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Overview */}
      <div className="bg-white rounded-lg border border-slate-200 shadow-sm p-8">
        <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-6">
          3. Review Your Changes
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

          {/* Version Control Section */}
          <div className="pt-6 border-t border-slate-200 space-y-4">
            <h4 className="font-heading text-lg font-semibold text-slate-900">
              Version Settings
            </h4>

            {/* Major Version Toggle */}
            <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-lg">
              <input
                type="checkbox"
                id="majorVersion"
                checked={isMajorVersion}
                onChange={(e) => setIsMajorVersion(e.target.checked)}
                className="mt-1 w-5 h-5 text-[#2663EB] border-slate-300 rounded focus:ring-2 focus:ring-[#2663EB] focus:ring-offset-2 cursor-pointer"
              />
              <div className="flex-1">
                <label
                  htmlFor="majorVersion"
                  className="font-body text-sm font-medium text-slate-900 cursor-pointer"
                >
                  Mark as Major Version
                </label>
                <p className="font-body text-xs text-slate-600 mt-1">
                  Use this for significant changes (major redesign, new question types, substantial content updates).
                  Minor versions are for small edits and fixes.
                </p>
              </div>
            </div>

            {/* Changelog */}
            <div>
              <label
                htmlFor="changelog"
                className="block font-body text-sm font-medium text-slate-700 mb-2"
              >
                Changelog <span className="text-slate-500">(Optional)</span>
              </label>
              <textarea
                id="changelog"
                value={changelog}
                onChange={(e) => setChangelog(e.target.value)}
                placeholder="Describe what changed in this version (e.g., 'Added new rating questions', 'Updated audience targeting', 'Fixed question wording')"
                rows={4}
                className="w-full px-4 py-3 font-body text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#2663EB] focus:border-transparent transition-all duration-200"
              />
              <p className="font-body text-xs text-slate-500 mt-2">
                This helps track changes across versions and will be visible in version history.
              </p>
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

