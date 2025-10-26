-- =====================================================
-- Survey Versioning System - Database Preparation
-- =====================================================
-- Migration: 20251025234935_prepare_for_survey_versioning
-- Description: Prepares database for hierarchical survey versioning feature
--              - Fixes RLS policies to allow anon + authenticated
--              - Adds composite indexes for version family queries
--              - Creates auto-logging trigger for version creation
-- =====================================================

-- =====================================================
-- 1. Fix RLS INSERT Policy (Allow anon + authenticated)
-- =====================================================

DROP POLICY IF EXISTS "Authenticated users can create surveys" ON public.surveys;

CREATE POLICY "Anyone can create surveys"
  ON public.surveys
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

COMMENT ON POLICY "Anyone can create surveys" ON public.surveys
  IS 'Development policy - allows anon access. TODO: Restrict to authenticated org members when auth is implemented.';

-- =====================================================
-- 2. Fix RLS UPDATE Policy (Allow anon + authenticated)
-- =====================================================

DROP POLICY IF EXISTS "Users can update surveys in their org" ON public.surveys;

CREATE POLICY "Anyone can update surveys"
  ON public.surveys
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

COMMENT ON POLICY "Anyone can update surveys" ON public.surveys
  IS 'Development policy - allows anon access. TODO: Restrict to authenticated org members when auth is implemented.';

-- =====================================================
-- 3. Add Composite Index: org_id + parent_id
-- =====================================================
-- Purpose: Optimizes fetching all versions in a family within an org
-- Query pattern: WHERE org_id = ? AND parent_id = ?

CREATE INDEX IF NOT EXISTS surveys_org_parent_idx 
  ON public.surveys(org_id, parent_id);

COMMENT ON INDEX surveys_org_parent_idx 
  IS 'Optimizes fetching all versions in a family within an org';

-- =====================================================
-- 4. Add Composite Index: parent_id + version DESC
-- =====================================================
-- Purpose: Optimizes fetching version history sorted by version number
-- Query pattern: WHERE parent_id = ? ORDER BY version DESC

CREATE INDEX IF NOT EXISTS surveys_parent_version_idx 
  ON public.surveys(parent_id, version DESC);

COMMENT ON INDEX surveys_parent_version_idx 
  IS 'Optimizes fetching version history sorted by version number';

-- =====================================================
-- 5. Create Trigger Function: log_survey_edit()
-- =====================================================
-- Purpose: Auto-logs survey edits to activity_feed when new version is created
-- Trigger condition: Only logs when parent_id IS NOT NULL

CREATE OR REPLACE FUNCTION log_survey_edit()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if this is a new version (has parent_id)
  IF NEW.parent_id IS NOT NULL THEN
    INSERT INTO public.activity_feed (org_id, type, details)
    VALUES (
      NEW.org_id,
      'SURVEY_EDITED',
      jsonb_build_object(
        'survey_id', NEW.id,
        'survey_title', NEW.title,
        'version', NEW.version,
        'parent_id', NEW.parent_id,
        'changelog', COALESCE(NEW.changelog, 'No changelog provided')
      )
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION log_survey_edit() 
  IS 'Auto-logs survey edits to activity_feed when parent_id is set';

-- =====================================================
-- 6. Create Trigger: on_survey_version_created
-- =====================================================
-- Purpose: Fires after INSERT on surveys table to auto-log version creation
-- When: AFTER INSERT FOR EACH ROW
-- Action: Calls log_survey_edit() function

DROP TRIGGER IF EXISTS on_survey_version_created ON public.surveys;

CREATE TRIGGER on_survey_version_created
  AFTER INSERT ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION log_survey_edit();

COMMENT ON TRIGGER on_survey_version_created ON public.surveys
  IS 'Auto-logs version creation by calling log_survey_edit() after INSERT';

-- =====================================================
-- Migration Complete
-- =====================================================
-- Summary:
-- ✅ RLS policies updated to allow anon + authenticated
-- ✅ Composite indexes created for performance
-- ✅ Auto-logging trigger configured
-- ✅ Activity feed integration complete
-- 
-- Next steps:
-- - Apply migration: npm run db:push
-- - Generate types: npm run db:types
-- - Proceed to Phase 1: Version utilities
-- =====================================================

