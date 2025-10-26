-- =====================================================
-- Update Question Types Migration
-- =====================================================
-- This migration updates the question type constraint
-- to support short_text and long_text instead of just text

-- Drop the old constraint
ALTER TABLE public.survey_questions
DROP CONSTRAINT IF EXISTS survey_questions_type_valid;

-- Add the new constraint with updated types
ALTER TABLE public.survey_questions
ADD CONSTRAINT survey_questions_type_valid 
CHECK (type IN ('short_text', 'long_text', 'multiple_choice', 'rating', 'yes_no'));

-- Add comment
COMMENT ON CONSTRAINT survey_questions_type_valid ON public.survey_questions 
IS 'Validates question types: short_text, long_text, multiple_choice, rating, yes_no';

