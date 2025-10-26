"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useSurveyEditor } from "@/hooks/useSurveyEditor";
import { ProgressBar } from "@/components/survey/create/ProgressBar";
import { Step1SurveyInfo } from "@/components/survey/create/Step1SurveyInfo";
import { Step2AddQuestions } from "@/components/survey/create/Step2AddQuestions";
import { Step3ReviewEdit } from "@/components/survey/edit/Step3ReviewEdit";
import { NavigationButtons } from "@/components/survey/create/NavigationButtons";
import { AIPreviewModal } from "@/components/survey/create/AIPreviewModal";

// ─────────────────────────────────────────────
// Survey Edit Page
// ─────────────────────────────────────────────
// Allows editing existing surveys by creating new versions.
// Pre-populates form with existing data and saves as v1.1, v1.2, etc.

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export default function EditSurveyPage() {
  const params = useParams();
  const router = useRouter();
  const surveyId = params.surveyId as string;

  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [isMajorVersion, setIsMajorVersion] = useState(false);
  const [changelog, setChangelog] = useState("");
  
  // Survey editor hook
  const {
    surveyData,
    setSurveyData,
    originalVersion,
    parentId,
    isLoading,
    loadError,
    isGeneratingAI,
    showAIPreview,
    aiGeneratedQuestions,
    isAIMock,
    isSaving,
    saveError,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addOption,
    updateOption,
    deleteOption,
    handleAIGenerate,
    addSelectedAIQuestions,
    closeAIPreview,
    saveVersion,
  } = useSurveyEditor(surveyId);

  // Constants
  const totalSteps = 3;
  const stepLabels = ["Survey Info", "Edit Questions", "Review & Save"];

  // ─────────────────────────────────────────────
  // Navigation Logic
  // ─────────────────────────────────────────────

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - save new version to database
      const result = await saveVersion(
        DEFAULT_ORG_ID,
        isMajorVersion,
        changelog || "No changelog provided"
      );
      
      if (result.success && result.surveyId) {
        // Navigate back to manage view
        router.push("/mojeremiah/view");
      }
      // Error is handled by the hook and displayed in UI
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const canProceed = () => {
    if (currentStep === 1) {
      return surveyData.title.trim() !== "" && surveyData.audience.trim() !== "";
    }
    if (currentStep === 2) {
      return surveyData.questions.length > 0;
    }
    return true;
  };

  // ─────────────────────────────────────────────
  // Render Step Content
  // ─────────────────────────────────────────────

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return <Step1SurveyInfo surveyData={surveyData} setSurveyData={setSurveyData} />;
      case 2:
        return (
          <Step2AddQuestions
            surveyData={surveyData}
            addQuestion={addQuestion}
            updateQuestion={updateQuestion}
            deleteQuestion={deleteQuestion}
            addOption={addOption}
            updateOption={updateOption}
            deleteOption={deleteOption}
            handleAIGenerate={handleAIGenerate}
            isGeneratingAI={isGeneratingAI}
          />
        );
      case 3:
        return (
          <Step3ReviewEdit
            surveyData={surveyData}
            currentVersion={originalVersion}
            isMajorVersion={isMajorVersion}
            setIsMajorVersion={setIsMajorVersion}
            changelog={changelog}
            setChangelog={setChangelog}
          />
        );
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────
  // Loading & Error States
  // ─────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#2663EB] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="font-body text-base text-slate-600">Loading survey data...</p>
        </div>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <h2 className="font-heading text-2xl font-semibold text-slate-900 mb-2">
            Failed to Load Survey
          </h2>
          <p className="font-body text-base text-slate-600 mb-6">
            {loadError}
          </p>
          <Link
            href="/mojeremiah/view"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#2663EB] text-white font-accent text-base font-medium rounded-lg hover:bg-[#2054C8] transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to Surveys
          </Link>
        </div>
      </div>
    );
  }

  // ─────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/mojeremiah/view"
              className="group inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors duration-200"
            >
              <ArrowLeftIcon className="w-5 h-5" />
              <span className="font-accent text-sm font-medium">Back to Surveys</span>
            </Link>
            <div className="text-center">
              <h1 className="font-heading text-2xl font-semibold text-slate-900">
                Edit Survey
              </h1>
              <p className="font-accent text-xs text-slate-500 mt-1">
                Creating version {originalVersion ? `${Math.floor(originalVersion) + (isMajorVersion ? 1 : 0)}.${isMajorVersion ? 0 : Math.round((originalVersion % 1) * 10) + 1}` : '...'}
              </p>
            </div>
            <div className="w-32" /> {/* Spacer for center alignment */}
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <ProgressBar
        currentStep={currentStep}
        totalSteps={totalSteps}
        stepLabels={stepLabels}
      />

      {/* Main Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          {renderStepContent()}

          {/* Error Message */}
          {saveError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-body text-sm text-red-700">{saveError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            canProceed={canProceed() && !isSaving}
            onBack={handleBack}
            onNext={handleNext}
            finalButtonText="Save New Version"
          />

          {/* Saving Loading State */}
          {isSaving && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-[#2663EB] border-t-transparent rounded-full animate-spin"></div>
              <p className="font-body text-sm text-slate-600">Saving new version...</p>
            </div>
          )}
        </div>
      </main>

      {/* AI Preview Modal */}
      {showAIPreview && (
        <AIPreviewModal
          questions={aiGeneratedQuestions}
          isLoading={isGeneratingAI}
          isMock={isAIMock}
          onAddSelected={addSelectedAIQuestions}
          onClose={closeAIPreview}
        />
      )}
    </div>
  );
}

