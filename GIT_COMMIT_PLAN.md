# Git Commit Plan - Survey Analytics Feature

This guide breaks down all changes into logical, atomic commits that tell a clear story.

---

## 📦 **Commit 1: Add analytics components and stat cards**

**Purpose:** Foundation components for displaying analytics data

**Files:**
```bash
git add src/components/analytics/ResponseCard.tsx
git add src/components/analytics/AIInsightCard.tsx
git add src/components/analytics/AnalyticsStatCard.tsx
git add src/components/analytics/index.ts
```

**Commit Message:**
```bash
git commit -m "feat(analytics): add reusable analytics components

- Add ResponseCard for displaying individual survey responses with Q&A pairs
- Add AIInsightCard for showing AI-generated insights with loading states
- Add AnalyticsStatCard for metric display with icons and trends
- Export all components via index.ts for clean imports

Components support:
- Sentiment badges with emojis
- Expandable/collapsible responses
- Loading, error, and empty states
- Responsive design"
```

---

## 📦 **Commit 2: Create OpenAI sentiment analysis API route**

**Purpose:** Backend API for analyzing response sentiment

**Files:**
```bash
git add src/app/api/openai/analyze/route.ts
```

**Commit Message:**
```bash
git commit -m "feat(api): add OpenAI sentiment analysis endpoint

- Create /api/openai/analyze route for response sentiment analysis
- Integrate with OpenAI GPT-4o-mini for sentiment classification
- Generate brief summaries for each response
- Update responses table with sentiment and summary data
- Include mock keyword-based fallback when API key not configured
- Non-blocking design prevents submission failures

Sentiment types: positive, negative, neutral, mixed"
```

---

## 📦 **Commit 3: Build analytics dashboard page**

**Purpose:** Complete analytics page with real-time updates

**Files:**
```bash
git add src/app/mojeremiah/analytics/[surveyId]/page.tsx
```

**Commit Message:**
```bash
git commit -m "feat(analytics): create survey analytics dashboard

- Add /mojeremiah/analytics/[surveyId] page for viewing survey responses
- Display individual responses with question-answer pairs
- Show sentiment breakdown and key metrics
- Implement Supabase Realtime for live response updates
- Add non-intrusive notification badge for new responses
- Include version selector for multi-version surveys
- Support CSV and JSON export functionality
- Comprehensive empty, loading, and error states

Features:
- Real-time notifications when new responses arrive
- Click-to-refresh with manual control
- Export analytics data for external analysis
- Switch between survey versions seamlessly"
```

---

## 📦 **Commit 4: Enhance response submission with AI and webhooks**

**Purpose:** Integrate AI analysis and activity logging on submission

**Files:**
```bash
git add src/app/mojeremiah/respond/[surveyId]/page.tsx
```

**Commit Message:**
```bash
git commit -m "feat(responses): integrate AI analysis and activity logging

- Log RESPONSE_RECEIVED events to activity_feed table
- Trigger AI sentiment analysis after successful submission
- Non-blocking async pipeline (doesn't fail submission on error)
- Comprehensive error handling and logging throughout

Pipeline:
1. Save response to database
2. Log to activity feed
3. Trigger AI analysis (async)
4. Show success screen

All operations gracefully handle failures without blocking user"
```

---

## 📦 **Commit 5: Add response counts to survey cards**

**Purpose:** Display response counts on survey management page

**Files:**
```bash
git add src/components/survey/manage/SurveyCard.tsx
git add src/app/mojeremiah/view/page.tsx
```

**Commit Message:**
```bash
git commit -m "feat(surveys): display response counts on survey cards

- Add response count badge to each survey card
- Update survey fetch query to include response counts
- Show chat bubble icon with count
- Efficient batch query prevents N+1 problem

UI changes:
- Badge shows: 💬 5 (for 5 responses)
- Updates automatically when new responses submitted
- Positioned alongside version and date info"
```

---

## 📦 **Commit 6: Implement dashboard insights tab with aggregate analytics**

**Purpose:** Add cross-survey insights dashboard

**Files:**
```bash
git add src/hooks/useInsightsData.ts
git add src/app/mojeremiah/page.tsx
```

**Commit Message:**
```bash
git commit -m "feat(insights): implement dashboard insights tab with aggregate data

- Create useInsightsData hook for fetching cross-survey analytics
- Populate Insights tab with real aggregate data
- Display sentiment distribution across all surveys
- Show top performing surveys ranked by response count
- Include recent feedback feed with sentiment indicators
- Add response trends (today, this week, this month)
- Comprehensive empty state for zero responses

Insights include:
- Total responses across all surveys
- Overall sentiment breakdown with percentages
- Top 5 surveys by response count (clickable to analytics)
- Last 5 responses from any survey with timestamps
- Analysis progress tracking"
```

---

## 📦 **Commit 7: Add database seeding script and utilities**

**Purpose:** Tool for populating test data

**Files:**
```bash
git add scripts/seed-test-data.ts
git add scripts/README.md
git add package.json
```

**Commit Message:**
```bash
git commit -m "chore(dev): add database seeding script for test data

- Create seed script to populate database with realistic test data
- Add npm script 'db:seed' for easy execution
- Include tsx dependency for TypeScript execution
- Add comprehensive documentation in scripts/README.md

Script creates:
- 3 sample surveys with questions
- 1 survey version (v2.0)
- 40-50 realistic responses with varied sentiments
- All activity feed events
- AI analysis data for all responses

Usage: npm run db:seed"
```

---

## 📦 **Commit 8: Add comprehensive documentation**

**Purpose:** Document the complete implementation

**Files:**
```bash
git add SURVEY_RESPONSE_VIEWING_PLAN.md
git add SURVEY_RESPONSE_IMPLEMENTATION_COMPLETE.md
git add QUICK_START.md
git add GIT_COMMIT_PLAN.md
```

**Commit Message:**
```bash
git commit -m "docs: add comprehensive documentation for analytics feature

- Add SURVEY_RESPONSE_VIEWING_PLAN.md with implementation roadmap
- Add SURVEY_RESPONSE_IMPLEMENTATION_COMPLETE.md with full technical docs
- Add QUICK_START.md for testing guide
- Add GIT_COMMIT_PLAN.md for organized commit strategy

Documentation includes:
- Architecture decisions and rationale
- Component specifications and usage
- Database queries and structure
- Testing scenarios and troubleshooting
- Future enhancement suggestions
- Complete feature summary"
```

---

## 🚀 **Execute All Commits**

Run these commands in order:

```bash
# Commit 1: Analytics components
git add src/components/analytics/ResponseCard.tsx src/components/analytics/AIInsightCard.tsx src/components/analytics/AnalyticsStatCard.tsx src/components/analytics/index.ts
git commit -m "feat(analytics): add reusable analytics components

- Add ResponseCard for displaying individual survey responses with Q&A pairs
- Add AIInsightCard for showing AI-generated insights with loading states
- Add AnalyticsStatCard for metric display with icons and trends
- Export all components via index.ts for clean imports

Components support:
- Sentiment badges with emojis
- Expandable/collapsible responses
- Loading, error, and empty states
- Responsive design"

# Commit 2: OpenAI API
git add src/app/api/openai/analyze/route.ts
git commit -m "feat(api): add OpenAI sentiment analysis endpoint

- Create /api/openai/analyze route for response sentiment analysis
- Integrate with OpenAI GPT-4o-mini for sentiment classification
- Generate brief summaries for each response
- Update responses table with sentiment and summary data
- Include mock keyword-based fallback when API key not configured
- Non-blocking design prevents submission failures

Sentiment types: positive, negative, neutral, mixed"

# Commit 3: Analytics page
git add src/app/mojeremiah/analytics/
git commit -m "feat(analytics): create survey analytics dashboard

- Add /mojeremiah/analytics/[surveyId] page for viewing survey responses
- Display individual responses with question-answer pairs
- Show sentiment breakdown and key metrics
- Implement Supabase Realtime for live response updates
- Add non-intrusive notification badge for new responses
- Include version selector for multi-version surveys
- Support CSV and JSON export functionality
- Comprehensive empty, loading, and error states

Features:
- Real-time notifications when new responses arrive
- Click-to-refresh with manual control
- Export analytics data for external analysis
- Switch between survey versions seamlessly"

# Commit 4: Response submission enhancements
git add src/app/mojeremiah/respond/\[surveyId\]/page.tsx
git commit -m "feat(responses): integrate AI analysis and activity logging

- Log RESPONSE_RECEIVED events to activity_feed table
- Trigger AI sentiment analysis after successful submission
- Non-blocking async pipeline (doesn't fail submission on error)
- Comprehensive error handling and logging throughout

Pipeline:
1. Save response to database
2. Log to activity feed
3. Trigger AI analysis (async)
4. Show success screen

All operations gracefully handle failures without blocking user"

# Commit 5: Response counts
git add src/components/survey/manage/SurveyCard.tsx src/app/mojeremiah/view/page.tsx
git commit -m "feat(surveys): display response counts on survey cards

- Add response count badge to each survey card
- Update survey fetch query to include response counts
- Show chat bubble icon with count
- Efficient batch query prevents N+1 problem

UI changes:
- Badge shows: 💬 5 (for 5 responses)
- Updates automatically when new responses submitted
- Positioned alongside version and date info"

# Commit 6: Insights tab
git add src/hooks/useInsightsData.ts src/app/mojeremiah/page.tsx
git commit -m "feat(insights): implement dashboard insights tab with aggregate data

- Create useInsightsData hook for fetching cross-survey analytics
- Populate Insights tab with real aggregate data
- Display sentiment distribution across all surveys
- Show top performing surveys ranked by response count
- Include recent feedback feed with sentiment indicators
- Add response trends (today, this week, this month)
- Comprehensive empty state for zero responses

Insights include:
- Total responses across all surveys
- Overall sentiment breakdown with percentages
- Top 5 surveys by response count (clickable to analytics)
- Last 5 responses from any survey with timestamps
- Analysis progress tracking"

# Commit 7: Seed script
git add scripts/ package.json
git commit -m "chore(dev): add database seeding script for test data

- Create seed script to populate database with realistic test data
- Add npm script 'db:seed' for easy execution
- Include tsx dependency for TypeScript execution
- Add comprehensive documentation in scripts/README.md

Script creates:
- 3 sample surveys with questions
- 1 survey version (v2.0)
- 40-50 realistic responses with varied sentiments
- All activity feed events
- AI analysis data for all responses

Usage: npm run db:seed"

# Commit 8: Documentation
git add *.md
git commit -m "docs: add comprehensive documentation for analytics feature

- Add SURVEY_RESPONSE_VIEWING_PLAN.md with implementation roadmap
- Add SURVEY_RESPONSE_IMPLEMENTATION_COMPLETE.md with full technical docs
- Add QUICK_START.md for testing guide
- Add GIT_COMMIT_PLAN.md for organized commit strategy

Documentation includes:
- Architecture decisions and rationale
- Component specifications and usage
- Database queries and structure
- Testing scenarios and troubleshooting
- Future enhancement suggestions
- Complete feature summary"
```

---

## 🎯 **Benefits of This Commit Structure:**

1. **Each commit is atomic** - Can be reverted independently
2. **Clear progression** - Story builds logically
3. **Easy code review** - Reviewers can review each commit separately
4. **Bisect-friendly** - Easy to find which commit introduced issues
5. **Meaningful history** - Git log tells a clear story
6. **Conventional commits** - Follows `feat()`, `chore()`, `docs()` format

---

## 📋 **Quick Reference:**

```bash
1. Analytics components      → Foundation
2. OpenAI API               → Backend logic
3. Analytics page           → Main feature
4. Response enhancements    → Integration
5. Response counts          → UI polish
6. Insights tab             → Dashboard feature
7. Seed script              → Dev tooling
8. Documentation            → Knowledge capture
```

---

## 🔍 **Verify Before Pushing:**

```bash
# Check all commits
git log --oneline -8

# Review changes in each commit
git show HEAD~7  # Commit 1
git show HEAD~6  # Commit 2
git show HEAD~5  # Commit 3
git show HEAD~4  # Commit 4
git show HEAD~3  # Commit 5
git show HEAD~2  # Commit 6
git show HEAD~1  # Commit 7
git show HEAD    # Commit 8

# Push to remote
git push origin feature/survey-submission-enhancement
```

---

## 💡 **Tips:**

- Each commit should pass linting (they all do! ✅)
- Each commit should be functional on its own (mostly true)
- Commit messages follow conventional commit format
- Can be squashed later if needed for cleaner main branch

---

**Total: 8 logical commits that tell a clear implementation story!** 🎉

