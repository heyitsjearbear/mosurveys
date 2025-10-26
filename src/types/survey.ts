import type { Tables, TablesInsert } from "./supabase";

// ─────────────────────────────────────────────
// Database Type Aliases
// ─────────────────────────────────────────────

// Direct references to Supabase-generated types
export type DbSurvey = Tables<"surveys">;
export type DbSurveyInsert = TablesInsert<"surveys">;
export type DbQuestion = Tables<"survey_questions">;
export type DbQuestionInsert = TablesInsert<"survey_questions">;
export type DbResponse = Tables<"responses">;

// ─────────────────────────────────────────────
// UI/Frontend Types (for forms and components)
// ─────────────────────────────────────────────

export type QuestionType = 
  | "short_text" 
  | "long_text" 
  | "multiple_choice" 
  | "rating" 
  | "yes_no";

// UI Question - used in the survey builder (before saving to DB)
export interface Question {
  id: string; // Temporary ID for React keys (will be DB id after save)
  type: QuestionType;
  text: string; // Maps to DB 'question' field
  options?: string[]; // For multiple choice
  required: boolean; // Whether this question must be answered
  position?: number; // Maps to DB 'position' field
}

// UI Survey Data - used in the survey builder form
export interface SurveyData {
  title: string;
  description: string; // Saved to surveys.description column
  audience: string;
  questions: Question[];
}

// ─────────────────────────────────────────────
// Type Converters (UI <-> Database)
// ─────────────────────────────────────────────

/**
 * Convert UI Question to Database Question Insert
 */
export function questionToDbInsert(
  question: Question,
  surveyId: string,
  position: number
): DbQuestionInsert {
  return {
    survey_id: surveyId,
    question: question.text,
    type: question.type,
    options: question.options || null,
    position,
    required: question.required,
  };
}

/**
 * Convert Database Question to UI Question
 */
export function dbQuestionToUi(dbQuestion: DbQuestion): Question {
  return {
    id: dbQuestion.id.toString(),
    type: dbQuestion.type as QuestionType,
    text: dbQuestion.question,
    options: dbQuestion.options || undefined,
    required: dbQuestion.required,
    position: dbQuestion.position,
  };
}

/**
 * Convert UI Survey Data to Database Survey Insert
 */
export function surveyToDbInsert(
  surveyData: SurveyData,
  orgId: string
): DbSurveyInsert {
  return {
    org_id: orgId,
    title: surveyData.title,
    description: surveyData.description || null,
    audience: surveyData.audience,
    ai_suggestions: null,
  };
}

// ─────────────────────────────────────────────
// Question Type Metadata
// ─────────────────────────────────────────────

export interface QuestionTypeMetadata {
  type: QuestionType;
  label: string;
  icon: string;
  description: string;
}

export const QUESTION_TYPES: QuestionTypeMetadata[] = [
  {
    type: "short_text",
    label: "Short Text",
    icon: "📝",
    description: "Brief one-line answer",
  },
  {
    type: "long_text",
    label: "Long Text",
    icon: "📄",
    description: "Detailed paragraph answer",
  },
  {
    type: "multiple_choice",
    label: "Multiple Choice",
    icon: "☑️",
    description: "Select from options",
  },
  {
    type: "rating",
    label: "Rating Scale",
    icon: "⭐",
    description: "Rate from 1 to 5",
  },
  {
    type: "yes_no",
    label: "Yes/No",
    icon: "✓✗",
    description: "Binary choice",
  },
];

