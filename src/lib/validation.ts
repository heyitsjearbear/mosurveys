/**
 * Validation Schemas
 * ────────────────────────────────────────────────────
 * Centralized Zod validation schemas for forms and API routes.
 * 
 */

import { z } from 'zod';

/**
 * Survey Creation Schema
 * ────────────────────────────────────────────────────
 * Validates survey metadata when creating a new survey
 */
export const surveyCreationSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim(),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  
  audience: z
    .string()
    .min(2, 'Audience must be at least 2 characters')
    .max(100, 'Audience must be less than 100 characters')
    .trim(),
  
  org_id: z
    .string()
    .uuid('Invalid organization ID'),
});

export type SurveyCreationInput = z.infer<typeof surveyCreationSchema>;

/**
 * Question Schema
 * ────────────────────────────────────────────────────
 * Validates individual survey questions
 */
export const questionSchema = z.object({
  id: z.string(),
  
  type: z.enum(['short_text', 'long_text', 'multiple_choice', 'rating', 'yes_no'], {
    message: 'Invalid question type',
  }),
  
  text: z
    .string()
    .min(5, 'Question must be at least 5 characters')
    .max(500, 'Question must be less than 500 characters')
    .trim(),
  
  options: z
    .array(z.string().min(1, 'Option cannot be empty'))
    .optional()
    .nullable(),
  
  required: z.boolean().default(true),
});

export type QuestionInput = z.infer<typeof questionSchema>;

/**
 * Multiple Questions Array Schema
 * ────────────────────────────────────────────────────
 * Validates an array of questions with min/max constraints
 */
export const questionsArraySchema = z
  .array(questionSchema)
  .min(1, 'Survey must have at least 1 question')
  .max(50, 'Survey cannot have more than 50 questions');

/**
 * Response Submission Schema
 * ────────────────────────────────────────────────────
 * Validates survey response submissions from users
 */
export const responseSubmissionSchema = z.object({
  survey_id: z
    .string()
    .uuid('Invalid survey ID'),
  
  answers: z
    .record(z.string(), z.string())
    .refine((answers) => Object.keys(answers).length > 0, {
      message: 'At least one answer is required',
    }),
  
  respondent_info: z
    .object({
      email: z.string().email('Invalid email').optional().nullable(),
      name: z.string().max(100, 'Name too long').optional().nullable(),
    })
    .optional()
    .nullable(),
});

export type ResponseSubmissionInput = z.infer<typeof responseSubmissionSchema>;

/**
 * Webhook Payload Schema
 * ────────────────────────────────────────────────────
 * Validates webhook event payloads
 */
export const webhookPayloadSchema = z.object({
  type: z.enum([
    'SURVEY_CREATED',
    'RESPONSE_RECEIVED',
    'SURVEY_UPDATED',
    'SURVEY_DELETED',
    'SUMMARY_GENERATED',
    'SURVEY_EDITED',
  ]),
  
  org_id: z
    .string()
    .min(1, 'Organization ID is required'),
  
  survey_id: z
    .string()
    .optional()
    .nullable(),
  
  details: z
    .record(z.string(), z.unknown())
    .optional()
    .nullable(),
});

export type WebhookPayloadInput = z.infer<typeof webhookPayloadSchema>;

/**
 * OpenAI Question Generation Schema
 * ────────────────────────────────────────────────────
 * Validates input for AI question generation
 */
export const openAIGenerateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title too long')
    .trim(),
  
  description: z
    .string()
    .max(1000, 'Description too long')
    .optional()
    .nullable(),
  
  audience: z
    .string()
    .min(2, 'Audience must be at least 2 characters')
    .max(100, 'Audience too long')
    .trim(),
});

export type OpenAIGenerateInput = z.infer<typeof openAIGenerateSchema>;

/**
 * OpenAI Analysis Schema
 * ────────────────────────────────────────────────────
 * Validates input for AI sentiment analysis
 */
export const openAIAnalysisSchema = z.object({
  responseId: z
    .string()
    .uuid('Invalid response ID'),
  
  surveyId: z
    .string()
    .uuid('Invalid survey ID'),
  
  answers: z
    .record(z.string(), z.string())
    .refine((answers) => Object.keys(answers).length > 0, {
      message: 'Answers cannot be empty',
    }),
});

export type OpenAIAnalysisInput = z.infer<typeof openAIAnalysisSchema>;

/**
 * Survey Update Schema
 * ────────────────────────────────────────────────────
 * Validates survey updates (title, description, audience)
 */
export const surveyUpdateSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be less than 200 characters')
    .trim()
    .optional(),
  
  description: z
    .string()
    .max(1000, 'Description must be less than 1000 characters')
    .optional()
    .nullable(),
  
  audience: z
    .string()
    .min(2, 'Audience must be at least 2 characters')
    .max(100, 'Audience must be less than 100 characters')
    .trim()
    .optional(),
});

export type SurveyUpdateInput = z.infer<typeof surveyUpdateSchema>;

/**
 * Version Creation Schema
 * ────────────────────────────────────────────────────
 * Validates survey version creation
 */
export const versionCreationSchema = z.object({
  survey_id: z
    .string()
    .uuid('Invalid survey ID'),
  
  changelog: z
    .string()
    .max(500, 'Changelog must be less than 500 characters')
    .optional()
    .nullable(),
});

export type VersionCreationInput = z.infer<typeof versionCreationSchema>;

/**
 * Helper: Safe Parse with Logging
 * ────────────────────────────────────────────────────
 * Wrapper around Zod's safeParse that formats errors nicely
 * 
 * @param schema - Zod schema to validate against
 * @param data - Data to validate
 * @returns Validation result with formatted errors
 */
export function validateWithSchema<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);
  
  if (result.success) {
    return { success: true, data: result.data };
  } else {
    const errors = result.error.issues.map((err) => {
      const path = err.path.join('.');
      return path ? `${path}: ${err.message}` : err.message;
    });
    
    return { success: false, errors };
  }
}

