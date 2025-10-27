"use client";

import { useState } from "react";
import { useSurveyBuilder } from "@/hooks/useSurveyBuilder";
import { ProgressBar } from "@/components/survey/create/ProgressBar";
import { Step1SurveyInfo } from "@/components/survey/create/Step1SurveyInfo";
import { Step2AddQuestions } from "@/components/survey/create/Step2AddQuestions";
import { Step3Review } from "@/components/survey/create/Step3Review";
import { NavigationButtons } from "@/components/survey/create/NavigationButtons";
import { PublishModal } from "@/components/survey/create/PublishModal";
import { AIPreviewModal } from "@/components/survey/create/AIPreviewModal";
import { PageHeader } from "@/components/layout";

// ─────────────────────────────────────────────
// Survey Creation Page
// ─────────────────────────────────────────────

// Get default org ID from environment or use fallback
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';

export default function CreateSurveyPage() {
  // State management
  const [currentStep, setCurrentStep] = useState(1);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishedSurveyId, setPublishedSurveyId] = useState<string | null>(null);
  
  // Survey builder hook
  const {
    surveyData,
    setSurveyData,
    isGeneratingAI,
    showAIPreview,
    aiGeneratedQuestions,
    isAIMock,
    isPublishing,
    publishError,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addOption,
    updateOption,
    deleteOption,
    handleAIGenerate,
    addSelectedAIQuestions,
    closeAIPreview,
    publishSurvey,
  } = useSurveyBuilder();

  // Constants
  const totalSteps = 3;
  const stepLabels = ["Survey Info", "Add Questions", "Review & Publish"];

  // ─────────────────────────────────────────────
  // Navigation Logic
  // ─────────────────────────────────────────────

  const handleNext = async () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    } else {
      // Final step - publish survey to database
      const result = await publishSurvey(DEFAULT_ORG_ID);
      
      if (result.success && result.surveyId) {
        setPublishedSurveyId(result.surveyId);
        setShowPublishModal(true);
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
        return <Step3Review surveyData={surveyData} />;
      default:
        return null;
    }
  };

  // ─────────────────────────────────────────────
  // Main Render
  // ─────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <PageHeader
        backHref="/mojeremiah"
        backLabel="Back to Dashboard"
        title="Create New Survey"
      />

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
          {publishError && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="font-body text-sm text-red-700">{publishError}</p>
            </div>
          )}

          {/* Navigation Buttons */}
          <NavigationButtons
            currentStep={currentStep}
            totalSteps={totalSteps}
            canProceed={canProceed() && !isPublishing}
            onBack={handleBack}
            onNext={handleNext}
          />

          {/* Publishing Loading State */}
          {isPublishing && (
            <div className="mt-6 flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-3 border-[#2663EB] border-t-transparent rounded-full animate-spin"></div>
              <p className="font-body text-sm text-slate-600">Publishing your survey...</p>
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

      {/* Publish Success Modal */}
      {showPublishModal && publishedSurveyId && (
        <PublishModal
          surveyTitle={surveyData.title}
          surveyId={publishedSurveyId}
          onClose={() => setShowPublishModal(false)}
        />
      )}
    </div>
  );
}