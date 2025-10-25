-- =====================================================
-- MoSurveys Database Schema Migration
-- =====================================================
-- This migration creates the core tables for MoSurveys:
--   1. surveys - Survey definitions with versioning
--   2. survey_questions - Questions belonging to surveys
--   3. responses - User responses to surveys
--   4. activity_feed - Event log for webhooks & activity
-- =====================================================

-- -----------------------------------------------------
-- 1. SURVEYS TABLE
-- -----------------------------------------------------
-- Core survey entity with versioning support
create table public.surveys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null,
  title text not null,
  audience text,
  version numeric(10, 2) not null default 1.0,
  parent_id uuid references public.surveys(id) on delete set null,
  changelog text,
  ai_suggestions jsonb default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint surveys_title_not_empty check (char_length(title) > 0),
  constraint surveys_version_positive check (version > 0)
);

-- Indexes for performance
create index surveys_org_id_idx on public.surveys(org_id);
create index surveys_parent_id_idx on public.surveys(parent_id);
create index surveys_created_at_idx on public.surveys(created_at desc);
create index surveys_version_idx on public.surveys(version);

-- Comments for documentation
comment on table public.surveys is 'Survey definitions with versioning support';
comment on column public.surveys.parent_id is 'Reference to previous version of this survey';
comment on column public.surveys.ai_suggestions is 'OpenAI-generated question suggestions stored as JSON array';

-- -----------------------------------------------------
-- 2. SURVEY_QUESTIONS TABLE
-- -----------------------------------------------------
-- Questions that belong to surveys, with ordering
create table public.survey_questions (
  id serial primary key,
  survey_id uuid not null references public.surveys(id) on delete cascade,
  position integer not null,
  type text not null default 'text',
  question text not null,
  options text[] default array[]::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint survey_questions_question_not_empty check (char_length(question) > 0),
  constraint survey_questions_position_positive check (position >= 0),
  constraint survey_questions_type_valid check (type in ('text', 'multiple_choice', 'rating', 'yes_no')),
  constraint survey_questions_unique_position unique (survey_id, position)
);

-- Indexes for performance
create index survey_questions_survey_id_idx on public.survey_questions(survey_id);
create index survey_questions_position_idx on public.survey_questions(survey_id, position);

-- Comments
comment on table public.survey_questions is 'Questions belonging to surveys with ordering';
comment on column public.survey_questions.position is 'Display order of question in survey (0-indexed)';
comment on column public.survey_questions.options is 'Array of options for multiple-choice questions';

-- -----------------------------------------------------
-- 3. RESPONSES TABLE
-- -----------------------------------------------------
-- User responses to surveys
create table public.responses (
  id uuid primary key default gen_random_uuid(),
  survey_id uuid not null references public.surveys(id) on delete cascade,
  org_id uuid not null,
  answers jsonb not null default '{}'::jsonb,
  sentiment text,
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Constraints
  constraint responses_sentiment_valid check (sentiment in ('positive', 'negative', 'neutral', 'mixed') or sentiment is null)
);

-- Indexes for performance
create index responses_survey_id_idx on public.responses(survey_id);
create index responses_org_id_idx on public.responses(org_id);
create index responses_created_at_idx on public.responses(created_at desc);
create index responses_sentiment_idx on public.responses(sentiment);

-- GIN index for JSONB queries on answers
create index responses_answers_gin_idx on public.responses using gin(answers);

-- Comments
comment on table public.responses is 'User responses to surveys with AI-generated insights';
comment on column public.responses.answers is 'JSONB object mapping question IDs to answers';
comment on column public.responses.sentiment is 'AI-generated sentiment analysis result';
comment on column public.responses.summary is 'AI-generated short insight about the response';

-- -----------------------------------------------------
-- 4. ACTIVITY_FEED TABLE
-- -----------------------------------------------------
-- Event log for webhooks and activity tracking
create table public.activity_feed (
  id serial primary key,
  org_id uuid not null,
  type text not null,
  details jsonb default '{}'::jsonb,
  created_at timestamptz not null default now(),
  
  -- Constraints
  constraint activity_feed_type_not_empty check (char_length(type) > 0)
);

-- Indexes for performance
create index activity_feed_org_id_idx on public.activity_feed(org_id);
create index activity_feed_type_idx on public.activity_feed(type);
create index activity_feed_created_at_idx on public.activity_feed(created_at desc);

-- GIN index for JSONB queries on details
create index activity_feed_details_gin_idx on public.activity_feed using gin(details);

-- Comments
comment on table public.activity_feed is 'Event log for webhooks and activity tracking';
comment on column public.activity_feed.type is 'Event type (e.g., SURVEY_CREATED, RESPONSE_RECEIVED)';
comment on column public.activity_feed.details is 'Additional event information (survey_title, sentiment, etc.)';

-- -----------------------------------------------------
-- HELPER FUNCTIONS
-- -----------------------------------------------------
-- Function to automatically update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- -----------------------------------------------------
-- TRIGGERS
-- -----------------------------------------------------
-- Auto-update updated_at on surveys
create trigger update_surveys_updated_at
  before update on public.surveys
  for each row
  execute function public.handle_updated_at();

-- Auto-update updated_at on survey_questions
create trigger update_survey_questions_updated_at
  before update on public.survey_questions
  for each row
  execute function public.handle_updated_at();

-- Auto-update updated_at on responses
create trigger update_responses_updated_at
  before update on public.responses
  for each row
  execute function public.handle_updated_at();

-- -----------------------------------------------------
-- ROW LEVEL SECURITY (RLS)
-- -----------------------------------------------------
-- Enable RLS on all tables
alter table public.surveys enable row level security;
alter table public.survey_questions enable row level security;
alter table public.responses enable row level security;
alter table public.activity_feed enable row level security;

-- =====================================================
-- SURVEYS POLICIES
-- =====================================================
-- Allow public read access to surveys
create policy "Surveys are publicly readable"
  on public.surveys
  for select
  to anon, authenticated
  using (true);

-- Allow authenticated users to create surveys
create policy "Authenticated users can create surveys"
  on public.surveys
  for insert
  to authenticated
  with check (true);

-- Allow authenticated users to update surveys in their org
create policy "Users can update surveys in their org"
  on public.surveys
  for update
  to authenticated
  using (true)  -- TODO: Add org membership check when auth is implemented
  with check (true);

-- Allow authenticated users to delete surveys
create policy "Authenticated users can delete surveys"
  on public.surveys
  for delete
  to authenticated
  using (true);  -- TODO: Add org membership check when auth is implemented

-- =====================================================
-- SURVEY_QUESTIONS POLICIES
-- =====================================================
-- Allow public read access to questions
create policy "Survey questions are publicly readable"
  on public.survey_questions
  for select
  to anon, authenticated
  using (true);

-- Allow authenticated users to manage questions
create policy "Authenticated users can manage questions"
  on public.survey_questions
  for all
  to authenticated
  using (true)
  with check (true);

-- =====================================================
-- RESPONSES POLICIES
-- =====================================================
-- Allow anyone to submit responses (for public surveys)
create policy "Anyone can submit responses"
  on public.responses
  for insert
  to anon, authenticated
  with check (true);

-- Allow users to read responses in their org
create policy "Users can read responses in their org"
  on public.responses
  for select
  to authenticated
  using (true);  -- TODO: Add org membership check when auth is implemented

-- =====================================================
-- ACTIVITY_FEED POLICIES
-- =====================================================
-- Allow authenticated users to read activity feed in their org
create policy "Users can read activity feed in their org"
  on public.activity_feed
  for select
  to authenticated
  using (true);  -- TODO: Add org membership check when auth is implemented

-- Allow system to insert activity events
create policy "Authenticated users can create activity events"
  on public.activity_feed
  for insert
  to authenticated
  with check (true);

-- =====================================================
-- SAMPLE DATA (Optional - for development)
-- =====================================================
-- Uncomment below to insert sample data for testing

-- INSERT INTO public.surveys (org_id, title, audience) VALUES
--   ('00000000-0000-0000-0000-000000000001', 'Customer Satisfaction Survey Q1', 'Retail Customers'),
--   ('00000000-0000-0000-0000-000000000001', 'Employee Engagement Survey', 'All Employees');

-- =====================================================
-- END OF MIGRATION
-- =====================================================

