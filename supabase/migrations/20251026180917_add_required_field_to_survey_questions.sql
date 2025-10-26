-- =====================================================
-- Add 'required' field to survey_questions table
-- =====================================================
-- This enables marking questions as required or optional in surveys
-- Resolves TODO in src/types/survey.ts:31

-- Add 'required' column with default value of true
ALTER TABLE survey_questions 
ADD COLUMN required boolean NOT NULL DEFAULT true;

-- Add comment for documentation
COMMENT ON COLUMN survey_questions.required IS 'Whether this question must be answered (true) or is optional (false). Defaults to true for all questions.';

