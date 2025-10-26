# Survey Editing Implementation Log

**Feature**: Hierarchical Survey Versioning System  
**Started**: October 25, 2025  
**Status**: In Progress

---

## Overview

Implementing a comprehensive survey editing system with hierarchical versioning (v1.0 → v1.1 → v1.2 → v2.0). Each edit creates a new database row, preserving complete version history and maintaining response data integrity.

## Implementation Progress

### ✅ Phase 0: Database Migration - PENDING
**Goal**: Prepare database for survey editing feature

**Changes Needed**:
1. Fix RLS INSERT Policy (allow anon + authenticated)
2. Fix RLS UPDATE Policy (allow anon + authenticated)
3. Add composite index `surveys_org_parent_idx`
4. Add composite index `surveys_parent_version_idx`
5. Create trigger function `log_survey_edit()`
6. Create trigger `on_survey_version_created`

**Migration File**: `/supabase/migrations/20251025234935_prepare_for_survey_versioning.sql`

**Status**: Ready to create

---

### ⏳ Phase 1: Version Calculation Utilities - PENDING
**File**: `/src/lib/versionUtils.ts`

**Functions to implement**:
- `calculateNextVersion(currentVersion: number, isMajor: boolean): number`
- `parseVersion(version: number): { major: number, minor: number }`
- `getVersionFamily(surveys: Survey[], majorVersion: number): Survey[]`
- `findLatestVersion(surveys: Survey[], parentId: string): Survey | null`

**Status**: Not started

---

### ⏳ Phase 2: API Endpoint for Creating Versions - PENDING
**File**: `/src/app/api/surveys/create-version/route.ts`

**Functionality**:
- Fetch original survey + questions
- Calculate next version number
- Create new survey row with parent_id
- Duplicate questions
- Return new survey ID

**Status**: Not started

---

### ⏳ Phase 3: Survey Editor Hook - PENDING
**File**: `/src/hooks/useSurveyEditor.ts`

**Based on**: `useSurveyBuilder.ts`

**Key Features**:
- Load existing survey data
- Pre-populate form state
- Save new version with changelog
- Loading and error states

**Status**: Not started

---

### ⏳ Phase 4: Update Version Save API - PENDING
**File**: `/src/app/api/surveys/update-version/route.ts`

**Functionality**:
- Validate edited survey data
- Insert new survey row (not UPDATE)
- Insert questions for new version
- Return new survey ID

**Status**: Not started

---

### ⏳ Phase 5: Edit Page - PENDING
**File**: `/src/app/mojeremiah/edit/[surveyId]/page.tsx`

**Features**:
- Load survey data from URL param
- Pre-populate 3-step form
- Add "Mark as Major Version" checkbox
- Add "Changelog" textarea
- "Save New Version" button

**Status**: Not started

---

### ⏳ Phase 6: Add Edit Button to SurveyCard - PENDING
**File**: `/src/components/survey/manage/SurveyCard.tsx`

**Changes**:
- Add Edit button with PencilSquareIcon
- Amber color theme (bg-amber-100)
- Link to `/mojeremiah/edit/${survey.id}`

**Status**: Not started

---

### ⏳ Phase 7: Version History Component - PENDING
**File**: `/src/components/survey/manage/VersionHistory.tsx`

**Features**:
- Timeline-style UI
- Show version lineage
- Display changelog for each version
- View/Restore/Edit actions

**Status**: Not started

---

### ⏳ Phase 8: Version History Modal - PENDING
**File**: `/src/components/survey/manage/VersionHistoryModal.tsx`

**Features**:
- Modal wrapper for VersionHistory
- Restore version functionality
- Close/cancel actions

**Status**: Not started

---

### ⏳ Phase 9: Add Version History Button - PENDING
**File**: `/src/components/survey/manage/SurveyCard.tsx`

**Changes**:
- Add ClockIcon button next to version badge
- Open VersionHistoryModal on click
- Conditional display if versions exist

**Status**: Not started

---

### ⏳ Phase 10: Restore Version API - PENDING
**File**: `/src/app/api/surveys/restore-version/route.ts`

**Functionality**:
- Fetch old survey + questions
- Calculate next version
- Create new row with restored data
- Set changelog: "Restored from vX.X"

**Status**: Not started

---

### ⏳ Phase 11: Update SurveyCard Props - PENDING
**File**: `/src/app/mojeremiah/view/page.tsx`

**Changes**:
- Add `onEdit` handler
- Add `onViewHistory` handler
- Pass handlers to SurveyCard

**Status**: Not started

---

### ⏳ Phase 12: Database Query Optimization - PENDING
**File**: `/src/app/mojeremiah/view/page.tsx`

**Changes**:
- Add version family count to query
- Display "v1.2 (3 versions)" badge

**Status**: Not started

---

### ⏳ Phase 13: Activity Feed Integration - PENDING
**Status**: Auto-handled by database trigger from Phase 0

---

### ⏳ Phase 14: Analytics Update - FUTURE
**Status**: Deferred to Phase 2

---

### ⏳ Phase 15: Testing & Edge Cases - PENDING
**Test Scenarios**:
- [ ] Edit v1.0 → v1.1
- [ ] Edit v1.1 → v1.2
- [ ] Promote v1.3 → v2.0
- [ ] Restore v1.0 to v2.1
- [ ] Validation errors
- [ ] Concurrent edits
- [ ] RLS policy verification
- [ ] Activity feed auto-logging
- [ ] Performance with large datasets

**Status**: Not started

---

## Database Analysis Results

**Existing Schema** (already perfect for versioning):
- ✅ `version` field (numeric, default 1.0)
- ✅ `parent_id` field with FK constraint
- ✅ `changelog` field (text, nullable)
- ✅ Indexes on parent_id, version, org_id
- ✅ ON DELETE SET NULL for parent_id
- ✅ Triggers for updated_at and deletion logging

**Required Changes** (Phase 0 migration):
- ❌ RLS policies only allow `authenticated`, need `anon` too
- ❌ Missing composite indexes for performance
- ❌ No auto-logging trigger for version creation

---

## Version Number Logic

```
v1.0 (original) → Edit → v1.1
v1.1 → Edit → v1.2
v1.2 → Edit → v1.3
v1.x → Edit + "Mark as Major" → v2.0
v2.0 → Edit → v2.1
```

**Calculation**:
- Major version = `Math.floor(version)`
- Minor version = `(version % 1) * 10`
- Next minor = `major + ((minor + 1) / 10)`
- Next major = `Math.floor(version) + 1.0`

---

## Files Created

**Migrations**:
- [ ] `/supabase/migrations/20251025234935_prepare_for_survey_versioning.sql`

**Libraries**:
- [ ] `/src/lib/versionUtils.ts`

**Hooks**:
- [ ] `/src/hooks/useSurveyEditor.ts`

**API Routes**:
- [ ] `/src/app/api/surveys/create-version/route.ts`
- [ ] `/src/app/api/surveys/update-version/route.ts`
- [ ] `/src/app/api/surveys/restore-version/route.ts`

**Pages**:
- [ ] `/src/app/mojeremiah/edit/[surveyId]/page.tsx`

**Components**:
- [ ] `/src/components/survey/edit/Step3ReviewEdit.tsx`
- [ ] `/src/components/survey/manage/VersionHistory.tsx`
- [ ] `/src/components/survey/manage/VersionHistoryModal.tsx`

**Modified Files**:
- [ ] `/src/components/survey/manage/SurveyCard.tsx`
- [ ] `/src/app/mojeremiah/view/page.tsx`

---

## Notes & Decisions

### Database Trigger Approach
- Using database triggers to auto-log version creation eliminates need for manual webhook calls
- Trigger fires AFTER INSERT and checks if `parent_id IS NOT NULL`
- Automatically logs to activity_feed with type `SURVEY_EDITED`

### RLS Policy Updates
- Current policies only allow `authenticated` role
- App uses `anon` key in supabaseClient.ts
- Need to allow both roles for INSERT/UPDATE operations
- Note: Production should have stricter policies with org membership checks

### Performance Optimizations
- Composite indexes dramatically improve version family queries
- `(org_id, parent_id)` for fetching all versions in family
- `(parent_id, version DESC)` for version history sorted by version

### Response Data Integrity
- Responses always stay linked to their original survey version
- When v1.0 is edited to v1.1, v1.0's responses remain untouched
- v1.1 starts with 0 responses
- This prevents data corruption and maintains analytics accuracy

---

## Next Steps

1. ✅ Create this implementation log
2. ⏳ Apply Phase 0 database migration
3. ⏳ Implement version utilities
4. ⏳ Build API endpoints
5. ⏳ Create edit page and UI components
6. ⏳ Test all scenarios
7. ⏳ Deploy to production

---

## Timestamp Log

- **2025-10-25 23:49:35** - Implementation started, plan finalized
- **2025-10-25 23:49:35** - Migration timestamp generated: 20251025234935

