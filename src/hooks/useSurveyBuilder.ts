import { useState } from "react";
import type { SurveyData, Question, QuestionType } from "@/types/survey";
import { createLogger } from "@/lib/logger";

const logger = createLogger('SurveyBuilder');

// ─────────────────────────────────────────────
// Survey Builder Hook
// ─────────────────────────────────────────────

export function useSurveyBuilder() {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    title: "",
    description: "",
    audience: "",
    questions: [],
  });
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiGeneratedQuestions, setAIGeneratedQuestions] = useState<Question[]>([]);
  const [isAIMock, setIsAIMock] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Question Management
  // ─────────────────────────────────────────────

  const addQuestion = (type: QuestionType) => {
    const newQuestion: Question = {
      id: `q-${Date.now()}`,
      type,
      text: "",
      required: true,
      options: type === "multiple_choice" ? ["Option 1", "Option 2"] : undefined,
    };
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, newQuestion],
    });
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setSurveyData({
      ...surveyData,
      questions: surveyData.questions.map((q) =>
        q.id === id ? { ...q, ...updates } : q
      ),
    });
  };

  const deleteQuestion = (id: string) => {
    setSurveyData({
      ...surveyData,
      questions: surveyData.questions.filter((q) => q.id !== id),
    });
  };

  const reorderQuestions = (activeId: string, overId: string) => {
    const oldIndex = surveyData.questions.findIndex((q) => q.id === activeId);
    const newIndex = surveyData.questions.findIndex((q) => q.id === overId);

    if (oldIndex !== -1 && newIndex !== -1) {
      const newQuestions = [...surveyData.questions];
      const [removed] = newQuestions.splice(oldIndex, 1);
      newQuestions.splice(newIndex, 0, removed);
      
      setSurveyData({
        ...surveyData,
        questions: newQuestions,
      });
    }
  };

  // ─────────────────────────────────────────────
  // Multiple Choice Option Management
  // ─────────────────────────────────────────────

  const addOption = (questionId: string) => {
    const question = surveyData.questions.find((q) => q.id === questionId);
    if (question && question.options) {
      updateQuestion(questionId, {
        options: [...question.options, `Option ${question.options.length + 1}`],
      });
    }
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    const question = surveyData.questions.find((q) => q.id === questionId);
    if (question && question.options) {
      const newOptions = [...question.options];
      newOptions[optionIndex] = value;
      updateQuestion(questionId, { options: newOptions });
    }
  };

  const deleteOption = (questionId: string, optionIndex: number) => {
    const question = surveyData.questions.find((q) => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
      const newOptions = question.options.filter((_, i) => i !== optionIndex);
      updateQuestion(questionId, { options: newOptions });
    }
  };

  // ─────────────────────────────────────────────
  // AI Generation with Preview Modal
  // ─────────────────────────────────────────────

  const handleAIGenerate = async () => {
    setIsGeneratingAI(true);
    setShowAIPreview(true);
    setPublishError(null);

    try {
      const response = await fetch('/api/openai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: surveyData.title,
          description: surveyData.description,
          audience: surveyData.audience
        })
      });

      const data = await response.json();

      if (data.success) {
        setAIGeneratedQuestions(data.questions);
        setIsAIMock(data.isMock || false);
      } else {
        throw new Error(data.error || 'Failed to generate questions');
      }
    } catch (error) {
      logger.error('AI question generation failed', error, {
        title: surveyData.title,
        audience: surveyData.audience
      });
      setPublishError('Failed to generate questions. Please try again.');
      setShowAIPreview(false);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addSelectedAIQuestions = (selectedQuestions: Question[]) => {
    setSurveyData({
      ...surveyData,
      questions: [...surveyData.questions, ...selectedQuestions],
    });
    setShowAIPreview(false);
    setAIGeneratedQuestions([]);
  };

  const closeAIPreview = () => {
    setShowAIPreview(false);
    setAIGeneratedQuestions([]);
    setIsGeneratingAI(false);
  };

  // ─────────────────────────────────────────────
  // Survey Publishing
  // ─────────────────────────────────────────────

  const publishSurvey = async (orgId: string): Promise<{ success: boolean; surveyId?: string; error?: string }> => {
    setIsPublishing(true);
    setPublishError(null);

    try {
      const response = await fetch('/api/surveys/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyData,
          orgId
        })
      });

      const data = await response.json();

      if (data.success) {
        logger.info('Survey published successfully', { surveyId: data.survey.id });
        return { success: true, surveyId: data.survey.id };
      } else {
        setPublishError(data.error || 'Failed to publish survey');
        return { success: false, error: data.error };
      }
    } catch (error) {
      logger.error('Failed to publish survey', error, {
        title: surveyData.title,
        questionCount: surveyData.questions.length
      });
      const errorMessage = 'Failed to publish survey. Please try again.';
      setPublishError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPublishing(false);
    }
  };

  return {
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
    reorderQuestions,
    addOption,
    updateOption,
    deleteOption,
    handleAIGenerate,
    addSelectedAIQuestions,
    closeAIPreview,
    publishSurvey,
  };
}

