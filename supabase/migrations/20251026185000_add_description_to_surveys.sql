-- Add description column to surveys table
-- This field is used for AI question generation context and displayed to survey respondents

alter table public.surveys
  add column description text;

-- Add comment
comment on column public.surveys.description is 'Optional description providing context for the survey';


