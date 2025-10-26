-- =====================================================
-- Fix Survey DELETE Policy & Add Activity Feed Logging
-- =====================================================
-- This migration fixes the RLS policy for survey deletions
-- and adds a trigger to log deletions to activity_feed
-- =====================================================

-- -----------------------------------------------------
-- 1. DROP OLD DELETE POLICY (requires authenticated)
-- -----------------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can delete surveys" ON public.surveys;

-- -----------------------------------------------------
-- 2. CREATE NEW DELETE POLICY (allows anon + authenticated)
-- -----------------------------------------------------
-- NOTE: This is for development. In production, restrict to authenticated
-- users with proper org membership checks.
CREATE POLICY "Anyone can delete surveys"
  ON public.surveys
  FOR DELETE
  TO anon, authenticated
  USING (true);

COMMENT ON POLICY "Anyone can delete surveys" ON public.surveys 
  IS 'Development policy - allows anon deletion. TODO: Restrict to org members in production.';

-- -----------------------------------------------------
-- 3. CREATE FUNCTION TO LOG SURVEY DELETIONS
-- -----------------------------------------------------
CREATE OR REPLACE FUNCTION public.log_survey_deletion()
RETURNS TRIGGER AS $$
BEGIN
  -- Insert activity feed entry when survey is deleted
  INSERT INTO public.activity_feed (org_id, type, details)
  VALUES (
    OLD.org_id,
    'SURVEY_DELETED',
    jsonb_build_object(
      'survey_id', OLD.id,
      'survey_title', OLD.title,
      'survey_audience', OLD.audience,
      'survey_version', OLD.version,
      'deleted_at', NOW()
    )
  );
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- -----------------------------------------------------
-- 4. CREATE TRIGGER FOR SURVEY DELETIONS
-- -----------------------------------------------------
DROP TRIGGER IF EXISTS on_survey_delete ON public.surveys;

CREATE TRIGGER on_survey_delete
  BEFORE DELETE ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION public.log_survey_deletion();

COMMENT ON TRIGGER on_survey_delete ON public.surveys 
  IS 'Logs survey deletions to activity_feed before cascade delete happens';

-- -----------------------------------------------------
-- 5. UPDATE ACTIVITY_FEED POLICY (allow anon inserts)
-- -----------------------------------------------------
-- Need to allow anon to insert activity feed entries
DROP POLICY IF EXISTS "Authenticated users can create activity events" ON public.activity_feed;

CREATE POLICY "Anyone can create activity events"
  ON public.activity_feed
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- =====================================================
-- END OF MIGRATION
-- =====================================================

