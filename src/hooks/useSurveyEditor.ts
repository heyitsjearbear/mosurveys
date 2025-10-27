import { useState, useEffect } from "react";
import type { SurveyData, Question, QuestionType } from "@/types/survey";
import { createLogger } from "@/lib/logger";
import { supabase } from "@/lib/supabaseClient";

const logger = createLogger('SurveyEditor');

// ─────────────────────────────────────────────
// Survey Editor Hook
// ─────────────────────────────────────────────
// Similar to useSurveyBuilder but designed for editing existing surveys.
// Loads survey data from database, allows editing, and saves as new version.

interface DbQuestion {
  id: number;
  survey_id: string;
  question: string;
  type: string;
  position: number;
  options: string[] | null;
  required: boolean;
}

export function useSurveyEditor(surveyId: string | null) {
  const [surveyData, setSurveyData] = useState<SurveyData>({
    title: "",
    description: "",
    audience: "",
    questions: [],
  });
  const [originalVersion, setOriginalVersion] = useState<number>(1.0);
  const [parentId, setParentId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [showAIPreview, setShowAIPreview] = useState(false);
  const [aiGeneratedQuestions, setAIGeneratedQuestions] = useState<Question[]>([]);
  const [isAIMock, setIsAIMock] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ─────────────────────────────────────────────
  // Load Existing Survey Data
  // ─────────────────────────────────────────────

  useEffect(() => {
    if (!surveyId) return;

    const loadSurveyData = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        // Fetch survey
        const { data: survey, error: surveyError } = await supabase
          .from('surveys')
          .select('*')
          .eq('id', surveyId)
          .single();

        if (surveyError) {
          throw new Error('Failed to load survey');
        }

        if (!survey) {
          throw new Error('Survey not found');
        }

        // Fetch questions
        const { data: questions, error: questionsError } = await supabase
          .from('survey_questions')
          .select('*')
          .eq('survey_id', surveyId)
          .order('position', { ascending: true });

        if (questionsError) {
          throw new Error('Failed to load survey questions');
        }

        // Convert database questions to Question format
        const convertedQuestions: Question[] = (questions as DbQuestion[]).map((q) => ({
          id: q.id.toString(),
          type: q.type as QuestionType,
          text: q.question,
          required: q.required,
          options: q.options || undefined,
        }));

        // Set survey data
        setSurveyData({
          title: survey.title,
          description: survey.description || "",
          audience: survey.audience || "",
          questions: convertedQuestions,
        });

        setOriginalVersion(survey.version);
        setParentId(survey.id); // Use this survey as parent

        logger.info('Survey data loaded successfully', {
          surveyId,
          version: survey.version,
          questionCount: convertedQuestions.length
        });

      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load survey';
        logger.error('Failed to load survey data', error, { surveyId });
        setLoadError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    loadSurveyData();
  }, [surveyId]);

  // ─────────────────────────────────────────────
  // Question Management (same as useSurveyBuilder)
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
    const activeIndex = surveyData.questions.findIndex(q => q.id === activeId);
    const overIndex = surveyData.questions.findIndex(q => q.id === overId);
    
    if (activeIndex !== -1 && overIndex !== -1) {
      const newQuestions = [...surveyData.questions];
      [newQuestions[activeIndex], newQuestions[overIndex]] = [newQuestions[overIndex], newQuestions[activeIndex]];
      setSurveyData({ ...surveyData, questions: newQuestions });
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
    setSaveError(null);

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
      setSaveError('Failed to generate questions. Please try again.');
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
  // Save New Version (different from publishSurvey)
  // ─────────────────────────────────────────────

  const saveVersion = async (
    orgId: string, 
    isMajorVersion: boolean, 
    changelog: string
  ): Promise<{ success: boolean; surveyId?: string; error?: string }> => {
    setIsSaving(true);
    setSaveError(null);

    try {
      const response = await fetch('/api/surveys/update-version', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyData,
          orgId,
          parentId,
          currentVersion: originalVersion,
          isMajorVersion,
          changelog
        })
      });

      const data = await response.json();

      if (data.success) {
        logger.info('Survey version saved successfully', { 
          newSurveyId: data.survey.id,
          version: data.survey.version
        });
        return { success: true, surveyId: data.survey.id };
      } else {
        setSaveError(data.error || 'Failed to save survey version');
        return { success: false, error: data.error };
      }
    } catch (error) {
      logger.error('Failed to save survey version', error, {
        title: surveyData.title,
        parentId,
        questionCount: surveyData.questions.length
      });
      const errorMessage = 'Failed to save survey version. Please try again.';
      setSaveError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsSaving(false);
    }
  };

  return {
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
    reorderQuestions,
    addOption,
    updateOption,
    deleteOption,
    handleAIGenerate,
    addSelectedAIQuestions,
    closeAIPreview,
    saveVersion,
  };
}

