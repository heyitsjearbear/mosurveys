# Survey Response Viewing & Analytics - Implementation Plan

## 📊 Current Status Summary

### ✅ **What Exists:**
1. **Response Submission** (`/mojeremiah/respond/[surveyId]`)
   - ✅ Form working and submitting to database
   - ✅ 1 test response in DB (survey v1.10, 4 answers)
   - ✅ Validation and loading states
   - ✅ Success confirmation screen

2. **Database Structure**
   - ✅ `responses` table with proper schema
   - ✅ `answers` stored as JSONB (question_id → answer)
   - ✅ `sentiment` field (currently null - needs AI)
   - ✅ `summary` field (currently null - needs AI)

3. **Survey Management**
   - ✅ SurveyCard shows "Analytics" button → `/mojeremiah/analytics/[surveyId]`
   - ✅ Version tracking system in place
   - ✅ 5 surveys (multiple versions of same survey)

### 🚧 **What's Missing:**

#### 1. **Analytics Page** (`/mojeremiah/analytics/[surveyId]`)
**Status:** 🔴 **DOES NOT EXIST** - Directory not even created

**Required Path:** `/src/app/mojeremiah/analytics/[surveyId]/page.tsx`

**PRD Requirements:**
- NPS Score calculation (% Promoters - % Detractors)
- Sentiment Breakdown Pie Chart
- Total Responses Over Time (Realtime updates)
- AI-Generated Insights summaries
- **Version history display: v1.0 → v1.1 → v2.0**

**Current Database Data (Per Version):**
```
Survey v1.00: 0 responses
Survey v1.10: 1 response (sentiment: null)
Survey v1.20: 0 responses
Survey v2.00: 0 responses
Survey v2.10: 0 responses
```

---

## 🎯 Required UI Components for Response Viewing

### **Page 1: Analytics Dashboard** (`/mojeremiah/analytics/[surveyId]`)

#### **Critical Feature: Version-Specific Analytics**
Each survey version should have its OWN analytics page showing ONLY responses for that specific version.

**Layout Structure:**

```
┌─────────────────────────────────────────────────────────────┐
│ Header                                                       │
│ ← Back to Surveys      Survey Title v1.10    🔄 Compare     │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Version Selector (if survey has multiple versions)          │
│ [v1.00] [v1.10 ✓] [v1.20] [v2.00] [v2.10]                  │
└─────────────────────────────────────────────────────────────┘

┌──────────────┬──────────────┬──────────────┬──────────────┐
│ Total        │ Avg          │ Completion   │ Latest       │
│ Responses    │ Sentiment    │ Rate         │ Response     │
│ 24           │ Positive     │ 87%          │ 2 hours ago  │
└──────────────┴──────────────┴──────────────┴──────────────┘

┌─────────────────────────────────────────────────────────────┐
│ AI-Generated Insights (with sparkle icon)                   │
│ "Users appreciate onboarding speed but mention unclear..."  │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│ Sentiment Breakdown  │ Responses Over Time                  │
│ [Pie Chart]          │ [Line Chart]                         │
│ Positive: 65%        │                                      │
│ Neutral: 25%         │                                      │
│ Negative: 10%        │                                      │
└──────────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Individual Responses                                         │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Response #1 - 2 hours ago              [Positive 😊]    │ │
│ │ Q1: How satisfied are you?                              │ │
│ │ A1: "Very satisfied with the service!"                  │ │
│ │                                                          │ │
│ │ Q2: Would you recommend us?                             │ │
│ │ A2: "Absolutely!"                                       │ │
│ │                                                          │ │
│ │ AI Summary: Highly positive feedback...                │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                              │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Response #2 - 5 hours ago              [Neutral 😐]     │ │
│ │ ...                                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Export Options                                               │
│ [Download CSV] [Download JSON] [Generate Report]            │
└─────────────────────────────────────────────────────────────┘
```

---

#### **Version Comparison View** (Optional but valuable)

Users should be able to **compare responses across versions** to see how changes impacted feedback.

```
┌─────────────────────────────────────────────────────────────┐
│ Compare Versions: [v1.10] vs [v2.00]                       │
└─────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────────────────────┐
│ Version 1.10         │ Version 2.00                         │
│ 24 responses         │ 18 responses                         │
│ Avg: Positive        │ Avg: Very Positive                   │
│                      │                                      │
│ Sentiment:           │ Sentiment:                           │
│ Positive: 65%        │ Positive: 78%                        │
│ Neutral: 25%         │ Neutral: 15%                         │
│ Negative: 10%        │ Negative: 7%                         │
└──────────────────────┴──────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│ Key Differences (AI-Generated)                              │
│ "Version 2.00 shows improved satisfaction with onboarding.  │
│  Users responded more positively to the new question..."    │
└─────────────────────────────────────────────────────────────┘
```

---

### **Page 2: Survey Management View - Enhancements** (`/mojeremiah/view`)

**Current Status:** Page exists but missing response counts on cards.

#### **Required Updates to SurveyCard:**

```tsx
// Add response count display
<div className="flex items-center gap-2 mt-2">
  <span className="inline-flex items-center px-2 py-1 bg-slate-100 text-slate-700 font-accent text-xs font-medium rounded-full">
    <ChatBubbleLeftRightIcon className="w-3 h-3 mr-1" />
    {responseCount} responses
  </span>
  <span className="inline-flex items-center px-2 py-1 bg-blue-100 text-[#2663EB] font-accent text-xs font-medium rounded-full">
    v{survey.version}
  </span>
  {isLatest && (
    <span className="inline-flex items-center px-2 py-1 bg-green-100 text-green-700 font-accent text-xs font-medium rounded-full">
      Latest
    </span>
  )}
</div>
```

**Current Card Data:**
- ✅ Title
- ✅ Audience
- ✅ Version badge
- ✅ "Latest" badge
- ✅ Created date
- 🔴 **MISSING: Response count**
- 🔴 **MISSING: Last response date**
- 🔴 **MISSING: Sentiment indicator**

**Required Query Update:**
```tsx
// Fetch surveys WITH response counts
const { data, error } = await supabase
  .from("surveys")
  .select(`
    *,
    responses:responses(count)
  `)
  .eq("org_id", DEFAULT_ORG_ID)
  .order("created_at", { ascending: false });
```

---

### **Page 3: Dashboard Enhancements** (`/mojeremiah/page.tsx`)

**Current Status:** Shows total surveys, total responses, active surveys.

#### **Missing Data Displays:**
1. 🔴 **Recent Responses Widget**
   - Show last 5 responses across all surveys
   - Display survey name, response time, sentiment

2. 🔴 **Top Performing Surveys**
   - Surveys with most responses
   - Surveys with highest positive sentiment

3. 🔴 **Response Rate Trends**
   - Responses per day/week chart
   - Growth indicators

---

## 🛠️ Required New Components

### 1. **ResponseCard Component**
```tsx
// src/components/analytics/ResponseCard.tsx
interface ResponseCardProps {
  response: Response;
  questions: SurveyQuestion[];
  showSurveyInfo?: boolean; // For dashboard view
}
```

### 2. **SentimentPieChart Component**
```tsx
// src/components/analytics/SentimentPieChart.tsx
interface SentimentPieChartProps {
  data: {
    positive: number;
    neutral: number;
    negative: number;
    mixed: number;
  };
}
```

### 3. **ResponseTimeline Component**
```tsx
// src/components/analytics/ResponseTimeline.tsx
interface ResponseTimelineProps {
  responses: Response[];
  dateRange: "day" | "week" | "month" | "all";
}
```

### 4. **AIInsightCard Component**
```tsx
// src/components/analytics/AIInsightCard.tsx
interface AIInsightCardProps {
  insight: string;
  loading?: boolean;
  error?: string;
}
```

### 5. **VersionComparison Component**
```tsx
// src/components/analytics/VersionComparison.tsx
interface VersionComparisonProps {
  versionA: string;
  versionB: string;
  surveyId: string;
}
```

---

## 📋 Database Queries Needed

### **Query 1: Get all responses for a specific survey**
```sql
SELECT 
  r.*,
  s.title,
  s.version
FROM responses r
JOIN surveys s ON r.survey_id = s.id
WHERE r.survey_id = $1
ORDER BY r.created_at DESC;
```

### **Query 2: Get sentiment breakdown for a survey**
```sql
SELECT 
  sentiment,
  COUNT(*) as count
FROM responses
WHERE survey_id = $1
GROUP BY sentiment;
```

### **Query 3: Get responses over time (for chart)**
```sql
SELECT 
  DATE(created_at) as date,
  COUNT(*) as count
FROM responses
WHERE survey_id = $1
  AND created_at >= NOW() - INTERVAL '30 days'
GROUP BY DATE(created_at)
ORDER BY date ASC;
```

### **Query 4: Get all responses for surveys in a version family**
```sql
-- First get all survey IDs in the version family
WITH RECURSIVE version_tree AS (
  SELECT id, parent_id, version
  FROM surveys
  WHERE id = $1 -- starting survey
  
  UNION
  
  SELECT s.id, s.parent_id, s.version
  FROM surveys s
  INNER JOIN version_tree vt ON s.parent_id = vt.id OR s.id = vt.parent_id
)
SELECT 
  r.*,
  s.version,
  s.title
FROM responses r
JOIN surveys s ON r.survey_id = s.id
WHERE s.id IN (SELECT id FROM version_tree)
ORDER BY s.version, r.created_at DESC;
```

---

## 🔧 Required Backend Work

### **Missing API Route: Sentiment Analysis**
```
POST /api/openai/analyze
```

**Input:**
```json
{
  "surveyId": "uuid",
  "responseId": "uuid",
  "answers": { "1": "Great service!", "2": "Very satisfied" }
}
```

**Output:**
```json
{
  "sentiment": "positive",
  "summary": "Customer is highly satisfied with service quality"
}
```

**Implementation Steps:**
1. Call OpenAI API with all answers combined
2. Extract sentiment classification
3. Generate short summary
4. Update `responses` table with sentiment + summary
5. Trigger webhook `SUMMARY_GENERATED`

---

### **Missing API Route: Aggregate Insights**
```
GET /api/analytics/[surveyId]/insights
```

**Output:**
```json
{
  "totalResponses": 24,
  "sentimentBreakdown": {
    "positive": 15,
    "neutral": 6,
    "negative": 3,
    "mixed": 0
  },
  "averageSentiment": "positive",
  "aiSummary": "Overall positive feedback with key themes...",
  "responseRate": 0.87,
  "lastResponseAt": "2025-10-26T21:36:01Z"
}
```

---

## 🎯 Implementation Priority

### **Phase 1: Basic Analytics Page** (Core functionality)
1. ✅ Create `/src/app/mojeremiah/analytics/[surveyId]/page.tsx`
2. ✅ Fetch responses for specific survey
3. ✅ Display individual responses with Q&A pairs
4. ✅ Show basic stats (total responses, date range)
5. ✅ Empty state when no responses

### **Phase 2: Response Submission Enhancements**
1. ✅ Implement webhook to log `RESPONSE_RECEIVED` to activity_feed
2. ✅ Implement AI sentiment analysis after submission
3. ✅ Update validation to respect `required` field
4. ✅ Add progress indicator

### **Phase 3: Advanced Analytics**
1. ✅ Sentiment pie chart
2. ✅ Response timeline chart
3. ✅ AI-generated insights card
4. ✅ Export to CSV/JSON

### **Phase 4: Version-Specific Features**
1. ✅ Version selector on analytics page
2. ✅ Compare versions side-by-side
3. ✅ Show response counts on survey cards
4. ✅ Filter responses by version in dashboard

### **Phase 5: Real-time Updates**
1. ✅ Supabase Realtime subscription for new responses
2. ✅ Live update analytics when responses come in
3. ✅ Notification badges for new responses

---

## 📊 Key Architectural Decisions

### **Decision 1: Version-Specific vs Aggregated Analytics**
**Choice:** ⭐ **Version-Specific by Default, with Option to Aggregate**

**Rationale:**
- Each survey version represents different questions/structure
- Comparing responses across different question sets is misleading
- Users need to see impact of their edits (v1.0 → v1.1 changes)

**Implementation:**
- Default view: Show analytics for selected version only
- Optional: "Show all versions" toggle
- Optional: "Compare versions" feature for side-by-side

---

### **Decision 2: Real-time vs Static Analytics**
**Choice:** ⭐ **Hybrid - Static Load + Realtime Updates**

**Rationale:**
- Initial load: Fetch all data from database
- Subscribe to Realtime: Update when new responses arrive
- Best of both: Fast initial load + live updates

---

### **Decision 3: AI Analysis Timing**
**Choice:** ⭐ **Analyze on Submission + Re-analyze on Demand**

**Workflow:**
1. User submits response
2. Immediately analyze with OpenAI
3. Store sentiment + summary in DB
4. On analytics page: Show stored AI data
5. Provide "Re-analyze" button for manual refresh

---

## 🔍 Testing Checklist

- [ ] Analytics page loads for survey with 0 responses (empty state)
- [ ] Analytics page loads for survey with 1 response
- [ ] Analytics page loads for survey with 100+ responses
- [ ] Sentiment chart displays correct percentages
- [ ] Timeline chart shows correct date ranges
- [ ] Version selector switches between versions correctly
- [ ] Response count displays correctly on survey cards
- [ ] AI insights generate and display properly
- [ ] Export CSV contains all response data
- [ ] Realtime updates work when new response submitted
- [ ] Analytics page handles missing/null sentiment gracefully
- [ ] Compare versions feature works correctly

---

## 📝 Summary

**Total New Pages Needed:** 1 major page (`analytics/[surveyId]`)

**Total New Components Needed:** 5-7 components

**Total Backend Routes Needed:** 2 routes (analyze, insights)

**Current Completion:** ~30%
- ✅ Response submission working
- ✅ Database schema complete
- ✅ Survey versioning working
- 🔴 Analytics page missing
- 🔴 AI analysis missing
- 🔴 Response viewing UI missing

**Estimated Effort:** 
- Phase 1 (Basic Analytics): 4-6 hours
- Phase 2 (AI + Webhooks): 3-4 hours
- Phase 3 (Charts + Export): 3-4 hours
- Phase 4 (Version Features): 2-3 hours
- Phase 5 (Realtime): 2-3 hours
- **Total: 14-20 hours of development**

