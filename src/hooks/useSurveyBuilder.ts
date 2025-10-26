import { useState } from "react";
import type { SurveyData, Question, QuestionType } from "@/types/survey";

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
  // AI Generation (Mock)
  // ─────────────────────────────────────────────

  const handleAIGenerate = () => {
    setIsGeneratingAI(true);
    
    // Simulate AI generation delay
    // TODO: Replace with actual OpenAI API call
    setTimeout(() => {
      const aiQuestions: Question[] = [
        {
          id: `q-${Date.now()}-1`,
          type: "rating",
          text: "How would you rate your overall experience?",
          required: true,
        },
        {
          id: `q-${Date.now()}-2`,
          type: "multiple_choice",
          text: "What did you like most about our service?",
          options: ["Quality", "Speed", "Price", "Support"],
          required: true,
        },
        {
          id: `q-${Date.now()}-3`,
          type: "long_text",
          text: "What could we improve?",
          required: false,
        },
      ];
      setSurveyData({
        ...surveyData,
        questions: [...surveyData.questions, ...aiQuestions],
      });
      setIsGeneratingAI(false);
    }, 2000);
  };

  return {
    surveyData,
    setSurveyData,
    isGeneratingAI,
    addQuestion,
    updateQuestion,
    deleteQuestion,
    addOption,
    updateOption,
    deleteOption,
    handleAIGenerate,
  };
}

