# Survey Editing with Hierarchical Versioning

## Implementation Overview

Build a comprehensive survey editing system that creates new versions (not in-place updates) while maintaining complete version history. Each edit creates a new database row with an incremented version number (v1.0 → v1.1 → v1.2), preserving old versions and their associated responses.

## Phase 0: Database Migration (PREREQUISITE)

**File**: `/supabase/migrations/[timestamp]_prepare_for_survey_versioning.sql` (new)

Prepare database for survey editing feature by fixing RLS policies and adding performance optimizations:

1. **Fix RLS INSERT Policy** - Allow anon + authenticated users to create surveys
2. **Fix RLS UPDATE Policy** - Allow anon + authenticated users to update surveys
3. **Add composite index** `surveys_org_parent_idx` for efficient version family queries
4. **Add composite index** `surveys_parent_version_idx` for version lineage queries
5. **Create trigger function** `log_survey_edit()` to auto-log edits to activity_feed
6. **Create trigger** `on_survey_version_created` to fire after INSERT on surveys table

**Why needed**:
- Current RLS policies only allow `authenticated` role, but app uses `anon` key (supabaseClient)
- Composite indexes dramatically improve query performance for version families
- Auto-logging trigger eliminates need for manual webhook calls in API routes

**Migration SQL**:

```sql
-- 1. Fix RLS INSERT Policy
DROP POLICY IF EXISTS "Authenticated users can create surveys" ON public.surveys;
CREATE POLICY "Anyone can create surveys"
  ON public.surveys
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- 2. Fix RLS UPDATE Policy  
DROP POLICY IF EXISTS "Users can update surveys in their org" ON public.surveys;
CREATE POLICY "Anyone can update surveys"
  ON public.surveys
  FOR UPDATE  
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- 3. Add composite index for version family queries
CREATE INDEX IF NOT EXISTS surveys_org_parent_idx 
  ON public.surveys(org_id, parent_id);

-- 4. Add composite index for version lineage queries  
CREATE INDEX IF NOT EXISTS surveys_parent_version_idx 
  ON public.surveys(parent_id, version DESC);

-- 5. Create trigger function to auto-log survey edits
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

-- 6. Create trigger to auto-log version creation
CREATE TRIGGER on_survey_version_created
  AFTER INSERT ON public.surveys
  FOR EACH ROW
  EXECUTE FUNCTION log_survey_edit();

-- Comments
COMMENT ON INDEX surveys_org_parent_idx IS 'Optimizes fetching all versions in a family within an org';
COMMENT ON INDEX surveys_parent_version_idx IS 'Optimizes fetching version history sorted by version number';
COMMENT ON FUNCTION log_survey_edit() IS 'Auto-logs survey edits to activity_feed when parent_id is set';
```

**Note**: Apply this migration BEFORE implementing any code changes.

---

## Phase 1: Version Calculation Utilities

**File**: `/src/lib/versionUtils.ts` (new)

Create utility functions for version number calculations:
- `calculateNextVersion(currentVersion: number, isMajor: boolean)` - Calculates next version (1.0 → 1.1 or 1.1 → 2.0)
- `parseVersion(version: number)` - Splits version into major/minor (1.2 → {major: 1, minor: 2})
- `getVersionFamily(surveys: Survey[], majorVersion: number)` - Groups surveys by major version
- `findLatestVersion(surveys: Survey[], parentId: string)` - Finds highest version in a family

**Logic**:
```typescript
// v1.0 editing → v1.1 (first minor)
// v1.1 editing → v1.2 (second minor)
// v1.x with "Mark as Major" → v2.0
// Major version = Math.floor(version)
// Minor version = (version % 1) * 10
```

## Phase 2: API Endpoint for Creating Versions

**File**: `/src/app/api/surveys/create-version/route.ts` (new)

Build API endpoint that:
1. Fetches original survey + questions by `surveyId`
2. Calculates next version number using `versionUtils`
3. Creates new survey row with:
   - New UUID
   - Incremented version
   - `parent_id` pointing to original survey
   - `changelog` field populated with edit description
4. Duplicates all questions with new `survey_id`
5. ~~Triggers webhook: `SURVEY_VERSION_CREATED`~~ **NO LONGER NEEDED** - Database trigger handles this automatically
6. Returns new survey ID for navigation

**Request body**:
```typescript
{
  originalSurveyId: string,
  isMajorVersion: boolean,
  changelog: string
}
```

**Response**:
```typescript
{
  success: boolean,
  newSurveyId: string,
  newVersion: number
}
```

**Note**: Database trigger `on_survey_version_created` automatically logs to activity_feed when a survey with `parent_id` is inserted.

## Phase 3: Survey Editor Hook

**File**: `/src/hooks/useSurveyEditor.ts` (new, based on `useSurveyBuilder.ts`)

Extend survey builder logic for editing:
- `loadSurveyData(surveyId: string)` - Fetch survey + questions, populate form
- `saveVersion(orgId: string, isMajor: boolean, changelog: string)` - Call `/api/surveys/update-version/route.ts`
- Reuse all question management functions from `useSurveyBuilder`
- Add `isLoading`, `loadError`, `isSaving`, `saveError` states

**Key difference from builder**: Initialize with existing data instead of empty state.

## Phase 4: Update Version Save API

**File**: `/src/app/api/surveys/update-version/route.ts` (new)

Similar to `/api/surveys/save/route.ts` but for updates:
1. Validates edited survey data
2. Inserts new survey row (not UPDATE - creates new version)
3. Inserts questions for new version
4. ~~Triggers webhook: `SURVEY_EDITED`~~ **NO LONGER NEEDED** - Database trigger handles this automatically
5. Returns new survey ID

**Request body**:
```typescript
{
  surveyData: SurveyData,
  orgId: string,
  parentId: string,
  version: number,
  changelog: string
}
```

**Note**: Database trigger `on_survey_version_created` automatically logs `SURVEY_EDITED` event with changelog when new version is inserted.

## Phase 5: Edit Page

**File**: `/src/app/mojeremiah/edit/[surveyId]/page.tsx` (new)

Clone `/src/app/mojeremiah/create/page.tsx` structure with modifications:
- Use `useSurveyEditor` instead of `useSurveyBuilder`
- Load existing survey data on mount via `surveyId` param
- Show loading state while fetching
- Pre-populate all form fields (title, audience, questions)
- Add "Mark as Major Version" checkbox in Step 3
- Add "Changelog" textarea in Step 3 (explain what changed)
- Replace "Publish" button with "Save New Version"
- Navigate to `/mojeremiah/view` after save

**Reuse components**:
- `ProgressBar`
- `Step1SurveyInfo`
- `Step2AddQuestions`
- `NavigationButtons`

**New component**: `Step3ReviewEdit` (shows version info + changelog field)

## Phase 6: Add Edit Button to SurveyCard

**File**: `/src/components/survey/manage/SurveyCard.tsx`

Add Edit button between "Copy Link" and "Analytics":
- Icon: `PencilSquareIcon` from Heroicons
- Button style: Yellow/orange theme (`bg-amber-100 text-amber-700`)
- Links to: `/mojeremiah/edit/${survey.id}`
- Tooltip: "Edit survey (creates new version)"

**Button placement**:
```tsx
<Link
  href={`/mojeremiah/edit/${survey.id}`}
  className="inline-flex items-center gap-1 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 font-accent text-xs font-medium rounded-lg transition-colors duration-200"
  title="Edit survey (creates new version)"
>
  <PencilSquareIcon className="w-3.5 h-3.5" />
  Edit
</Link>
```

## Phase 7: Version History Component

**File**: `/src/components/survey/manage/VersionHistory.tsx` (new)

Display version tree for a survey:
- Fetch all surveys with same `parent_id` lineage (use composite indexes for performance)
- Show chronological list: v1.0 → v1.1 → v1.2 → v2.0
- Each version shows:
  - Version number (badge)
  - Created date
  - Changelog text
  - Response count
  - Actions: "View" | "Restore" | "Edit"
- Current version highlighted
- Expandable/collapsible by major version

**Visual design**: Timeline-style UI with connecting lines between versions.

**Query optimization**: Uses `surveys_parent_version_idx` composite index for fast version fetching.

## Phase 8: Version History Modal

**File**: `/src/components/survey/manage/VersionHistoryModal.tsx` (new)

Modal triggered from SurveyCard "Version History" button:
- Shows `VersionHistory` component
- Allows viewing old versions (read-only)
- "Restore Version" button creates new version from old data
- Close button returns to survey list

## Phase 9: Add Version History Button to SurveyCard

**File**: `/src/components/survey/manage/SurveyCard.tsx` (modify)

Add new button after version badge:
- Small icon button next to `v1.2` badge
- Icon: `ClockIcon` from Heroicons
- Opens `VersionHistoryModal`
- Only shows if `parent_id` exists or survey has children

## Phase 10: Restore Version API

**File**: `/src/app/api/surveys/restore-version/route.ts` (new)

Creates new version from old version's data:
1. Fetch old survey + questions by `oldSurveyId`
2. Calculate next version (e.g., restoring v1.0 when current is v2.3 → creates v2.4)
3. Create new survey row with restored data
4. Set `parent_id` to current latest version
5. Set `changelog`: "Restored from v1.0"
6. Duplicate questions
7. ~~Trigger webhook: `SURVEY_RESTORED`~~ **NO LONGER NEEDED** - Database trigger automatically logs as `SURVEY_EDITED` with "Restored from vX.X" changelog

**Request body**:
```typescript
{
  oldSurveyId: string,
  currentLatestSurveyId: string,
  orgId: string
}
```

**Note**: Database trigger handles activity feed logging automatically.

## Phase 11: Update SurveyCard Props

**File**: `/src/app/mojeremiah/view/page.tsx`

Add handlers:
- `onEdit(surveyId)` - Navigate to edit page
- `onViewHistory(surveyId)` - Open version history modal
- Pass to `SurveyCard` component

## Phase 12: Database Query Optimization

**File**: `/src/app/mojeremiah/view/page.tsx`

Enhance survey fetch to include version family data (leverages composite indexes):

```typescript
// Fetch with version family count
const { data, error } = await supabase
  .from("surveys")
  .select(`
    *,
    children:surveys!parent_id(count)
  `)
  .eq("org_id", DEFAULT_ORG_ID)
  .order("created_at", { ascending: false });
```

Shows "v1.2 (3 versions)" if survey has version history.

**Performance**: `surveys_org_parent_idx` composite index makes this query fast even with thousands of surveys.

## Phase 13: Update Activity Feed

**File**: Activity feed already configured via database triggers

Activity feed events are now **automatically logged by database triggers**:
- `SURVEY_EDITED` - Auto-logged when new version inserted with `parent_id`
- Includes: survey_id, survey_title, version, parent_id, changelog
- No manual webhook calls needed in API routes

Activity feed will show: "Survey '{title}' updated to v1.2" with changelog preview.

**Migration from Phase 0 handles all logging automatically** - no additional webhook setup needed.

## Phase 14: Analytics Update

**File**: `/src/app/mojeremiah/analytics/[surveyId]/page.tsx` (future enhancement)

Add version switcher dropdown:
- View analytics for specific version
- Compare versions side-by-side
- Filter responses by survey version

Not critical for initial implementation - can be Phase 2 feature.

## Phase 15: Testing & Edge Cases

Test scenarios:
- Edit brand new survey (v1.0 → v1.1)
- Edit already edited survey (v1.1 → v1.2)
- Promote to major version (v1.3 → v2.0)
- Restore old version (v1.0 → v2.1 when current is v2.0)
- Edit with no questions (should fail validation)
- Concurrent edits (two users editing same survey)
- Verify RLS policies work with both anon and authenticated roles
- Verify activity feed auto-logs all edits via trigger
- Test composite index performance with large datasets

## Key Files Summary

**New Database Migration**:
- `/supabase/migrations/[timestamp]_prepare_for_survey_versioning.sql` **(APPLY FIRST)**

**New Files**:
- `/src/lib/versionUtils.ts`
- `/src/hooks/useSurveyEditor.ts`
- `/src/app/api/surveys/create-version/route.ts`
- `/src/app/api/surveys/update-version/route.ts`
- `/src/app/api/surveys/restore-version/route.ts`
- `/src/app/mojeremiah/edit/[surveyId]/page.tsx`
- `/src/components/survey/edit/Step3ReviewEdit.tsx`
- `/src/components/survey/manage/VersionHistory.tsx`
- `/src/components/survey/manage/VersionHistoryModal.tsx`

**Modified Files**:
- `/src/components/survey/manage/SurveyCard.tsx` (add Edit + History buttons)
- `/src/app/mojeremiah/view/page.tsx` (add handlers, update query)

## Version Number Examples

```
User Journey:
1. Create survey → v1.0 (parent_id: null)
2. Edit v1.0 → v1.1 (parent_id: v1.0's UUID)
3. Edit v1.0 again → v1.2 (parent_id: v1.0's UUID)
4. Edit v1.1 → v1.3 (parent_id: v1.1's UUID) OR v2.0 if marked major
5. Restore v1.0 when current is v2.0 → v2.1 (parent_id: v2.0's UUID)
```

Database structure ensures responses stay with original version since `survey_id` never changes for responses.

## Database Schema Status

✅ **Already in place** (from existing migrations):
- `version` field (numeric, default 1.0)
- `parent_id` field with FK to surveys(id) ON DELETE SET NULL
- `changelog` field (text, nullable)
- Individual indexes on parent_id, version, org_id, created_at
- Triggers for updated_at and deletion logging

✅ **Added in Phase 0 migration**:
- RLS policies for anon + authenticated on INSERT/UPDATE
- Composite indexes for performance (org_id+parent_id, parent_id+version)
- Auto-logging trigger for version creation
- Activity feed integration via database trigger

**Result**: No manual webhook calls needed in API routes - database handles all logging automatically!

