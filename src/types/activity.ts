// ─────────────────────────────────────────────
// Activity Feed Type Definitions
// ─────────────────────────────────────────────
// Type-safe definitions for activity_feed.details JSONB field

/**
 * Details for SURVEY_CREATED events
 * 
 * Sent when a new survey is created via /api/surveys/save
 */
export interface SurveyCreatedDetails {
  survey_title: string;
  question_count: number;
  audience: string;
}

/**
 * Details for RESPONSE_RECEIVED events
 * 
 * Sent when a user submits a survey response
 */
export interface ResponseReceivedDetails {
  survey_title: string;
  response_id: string;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'mixed';
}

/**
 * Details for SURVEY_UPDATED events
 * 
 * Sent when survey metadata or questions are modified
 */
export interface SurveyUpdatedDetails {
  survey_title: string;
  question_count?: number;
  audience?: string;
}

/**
 * Details for SURVEY_DELETED events
 * 
 * Sent when a survey is permanently deleted
 */
export interface SurveyDeletedDetails {
  survey_title: string;
  question_count: number;
}

/**
 * Details for SUMMARY_GENERATED events
 * 
 * Sent when AI generates a summary for survey responses
 */
export interface SummaryGeneratedDetails {
  survey_title: string;
  summary_text?: string;
}

/**
 * Discriminated union of all activity detail types
 * 
 * USAGE PATTERN:
 * ```typescript
 * const details = activity.details as ActivityDetails;
 * 
 * switch (activity.type) {
 *   case 'SURVEY_CREATED':
 *     // TypeScript knows this is SurveyCreatedDetails
 *     const d = details as SurveyCreatedDetails;
 *     console.log(d.question_count); // ✅ Autocomplete works!
 *     break;
 * }
 * ```
 */
export type ActivityDetails =
  | SurveyCreatedDetails
  | ResponseReceivedDetails
  | SurveyUpdatedDetails
  | SurveyDeletedDetails
  | SummaryGeneratedDetails;

/**
 * Valid activity event types
 * 
 * This type is derived from a const array to ensure consistency
 * between runtime validation and type checking
 */
export type ActivityEventType =
  | 'SURVEY_CREATED'
  | 'RESPONSE_RECEIVED'
  | 'SURVEY_UPDATED'
  | 'SURVEY_DELETED'
  | 'SUMMARY_GENERATED';

/**
 * Type guard to validate event type at runtime
 * @param type - The string to validate
 * @returns True if the type is a valid ActivityEventType
 */
export function isValidEventType(type: string): type is ActivityEventType {
  const validTypes: readonly string[] = [
    'SURVEY_CREATED',
    'RESPONSE_RECEIVED',
    'SURVEY_UPDATED',
    'SURVEY_DELETED',
    'SUMMARY_GENERATED'
  ];
  return validTypes.includes(type);
}

/**
 * Type guard to check if details match SURVEY_CREATED event
 * 
 * Useful for type narrowing when you need to access specific fields
 */
export function isSurveyCreatedDetails(
  details: ActivityDetails
): details is SurveyCreatedDetails {
  return 'question_count' in details && 'audience' in details;
}

/**
 * Type guard to check if details match RESPONSE_RECEIVED event
 * 
 * Useful for type narrowing when you need to access response-specific fields
 */
export function isResponseReceivedDetails(
  details: ActivityDetails
): details is ResponseReceivedDetails {
  return 'response_id' in details;
}

