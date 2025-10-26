# MoSurveys – Product Requirements & Architecture Document (w/ OpenAI API Integration)

## **1. Product Overview**

**MoSurveys** is a “Mo-Something” application for **MoFlo Cloud**, designed to help **small and medium-sized businesses (SMBs)** collect, analyze, and act on customer feedback.

The app enables the full feedback lifecycle — **Create → Collect → Analyze → Iterate** — with a focus on automation, usability, and AI-assisted insights.

It leverages:

- **Supabase** (Postgres + Realtime) for data persistence and synchronization.
- **Next.js 15 (App Router)** + **TypeScript** for a modern, maintainable frontend.
- **OpenAI API** for intelligent question generation and sentiment analysis.
- **Webhooks** for real-time cross-module activity propagation.

---

### **Core Features**

| Feature | Description |
| --- | --- |
| **Landing Dashboard** (`/mojeremiah`) | Displays real-time survey metrics (Total Responses, Avg NPS, Sentiment %) and an activity feed synced via Supabase Realtime. |
| **Survey Builder** (`/mojeremiah/create`) | Step-by-step builder with validation, AI question generation, and Supabase persistence. |
| **Manage View** (`/mojeremiah/view`) | View, edit, filter, clone, and version surveys with a grid/table layout toggle. |
| **Response Form** (`/mojeremiah/respond/[surveyId]`) | Public form for customers to take surveys; submissions trigger analytics updates and sentiment classification. |
| **Analytics Dashboard** (`/mojeremiah/analytics/[surveyId]`) | Displays computed metrics such as NPS, sentiment distribution, and AI-generated summaries. |
| **Realtime Webhooks** | Logs survey creation and responses in the `activity_feed` table for cross-app visibility. |
| **OpenAI Integration** | `/api/openai/generate` for question drafts; `/api/openai/analyze` for response sentiment. |

---

## **2. Goals**

1. **Deliver a complete MoFlo integration:**
    
    A working web app that feels native to MoFlo Cloud and fits into its modular ecosystem.
    
2. **Meet all MoFlo technical requirements:**
    - Next.js 15 + App Router
    - TypeScript
    - Tailwind CSS with MoFlo design language
    - React Hooks + Context for state management
    - Proper file structure, validation, and type safety
3. **Showcase intelligence and scalability:**
    - Supabase for live updates and storage
    - OpenAI API for AI-powered generation and classification
    - Webhooks for modular communication
4. **Fulfill every deliverable from the assignment doc:**
    - Pages: `/mojeremiah`, `/create`, `/view`
    - JSON/TXT export of survey data
    - Validation, error handling, and seeded schema
    - Responsive design across devices

---

## **3. User Experience & Screens**

### **`/mojeremiah` – Landing Dashboard**

**Purpose:** Overview of survey health and engagement.

**Components:**

- **Insight Cards:**
    - Total Surveys
    - Avg NPS
    - % Positive Sentiment
- **AI Summary Card (OpenAI):**
    
    Automatically summarizes trends from the last 24h of responses.
    
    Example: *“Users appreciate onboarding speed but mention unclear follow-ups.”*
    
- **Activity Feed (Supabase Realtime):**
    
    Live updates for:
    
    - `SURVEY_CREATED`
    - `RESPONSE_RECEIVED`
    - `SUMMARY_GENERATED`

---

### **`/mojeremiah/create` – Survey Builder**

**Workflow:**

1. **Survey Metadata:**
    
    Inputs for title, audience, and purpose.
    
2. **Question Builder:**
    
    Add questions manually or click “✨ Generate with AI.”
    
3. **AI Question Generator (OpenAI):**
    
    Calls `/api/openai/generate` → prompts `gpt-4o-mini`:
    
    ```tsx
    const prompt = `Generate 5 engaging survey questions about ${purpose}.`;
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    
    ```
    
    Returns a JSON array of suggested questions.
    
4. **Validation:**
    - Must include a title and ≥1 question.
    - Inline error feedback if rules fail.
5. **Save Flow:**
    - Inserts survey + questions into Supabase.
    - Exports JSON object to `/public/surveys.txt`.
    - Generates shareable localhost link to `/respond/[surveyId]`.
    - Triggers webhook `/api/webhook/sync` with event `SURVEY_CREATED`.
    - Emits realtime update to dashboard feed.

---

### **`/mojeremiah/respond/[surveyId]` – Public Survey Form**

**Purpose:** Collect customer feedback anonymously or by email.

**Process:**

- Loads questions from Supabase.
- Users submit responses → saved in `responses` table.
- Backend triggers OpenAI sentiment classification:
    
    ```tsx
    const prompt = `Classify sentiment of: "${responseText}" as positive, neutral, or negative.`;
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
    });
    
    ```
    
- Saves classification result in `responses.sentiment`.
- Posts webhook:
    
    ```json
    {
      "type": "RESPONSE_RECEIVED",
      "survey_id": "uuid",
      "details": { "sentiment": "positive" }
    }
    
    ```
    
- Updates the analytics dashboard in real-time.

---

### **`/mojeremiah/view` – Manage Surveys**

**Purpose:** Provide CRUD and version control for surveys.

**Features:**

- Load surveys from Supabase + local `/public/surveys.txt`.
- Switch between **Grid** and **Table** view using Context.
- Filter by audience, creation date, or sentiment.
- Edit / Delete / Clone (increment version numbers).
- Copy survey link and open analytics in one click.

---

### **`/mojeremiah/analytics/[surveyId]` – Insights Dashboard**

**Purpose:** Provide high-level analytics and summaries.

**Displayed Metrics:**

- NPS Score = (% Promoters − % Detractors)
- Sentiment Breakdown Pie Chart
- Total Responses Over Time (Realtime updates via Supabase)
- AI-Generated Insights from `/api/openai/analyze` summaries
- Version history: v1.0 → v1.1 → v2.0

---

## **4. Database Architecture**

### **Schema Overview**

```
surveys 1 ─ * survey_questions
surveys 1 ─ * responses
responses * ─ 1 activity_feed  ◀─  webhooks

```

---

### **Tables**

### **surveys**

| Column | Type | Description |
| --- | --- | --- |
| id | uuid (pk) | Unique survey ID |
| org_id | uuid | Organization scope |
| title | text | Survey title |
| audience | text | Target group |
| version | numeric | Version (e.g., 1.0, 1.1) |
| parent_id | uuid (fk) | Reference to previous version |
| changelog | text | Description of edits |
| ai_suggestions | jsonb | OpenAI-generated question suggestions |
| created_at | timestamptz | Default now() |

---

### **survey_questions**

| Column | Type | Description |
| --- | --- | --- |
| id | serial (pk) | Question ID |
| survey_id | uuid (fk) | Linked survey |
| position | integer | Order of appearance |
| type | text | “text” |
| question | text | Question prompt |
| options | text[] | Multiple-choice options |
| created_at | timestamptz | Default now() |

---

### **responses**

| Column | Type | Description |
| --- | --- | --- |
| id | uuid (pk) | Response ID |
| survey_id | uuid (fk) | Associated survey |
| org_id | uuid | Org scope |
| answers | jsonb | User answers |
| sentiment | text | “positive” |
| summary | text | Short AI-generated insight |
| created_at | timestamptz | Default now() |

---

### **activity_feed**

| Column | Type | Description |
| --- | --- | --- |
| id | serial (pk) | Event ID |
| org_id | uuid | Org scope |
| type | text | Event type |
| details | jsonb | Extra info (survey_title, sentiment) |
| created_at | timestamptz | Default now() |

---

## **5. Webhook & OpenAI Integration**

### **Webhooks**

**Endpoint:** `/api/webhook/sync`

**Method:** POST

**Purpose:** Propagate survey and response events to the `activity_feed` and other MoFlo modules.

**Example Payload:**

```json
{
  "type": "SURVEY_CREATED",
  "survey_id": "a1b2c3",
  "org_id": "org_001",
  "details": {
    "survey_title": "Customer Onboarding",
    "creator": "alex@company.com"
  }
}

```

**Behavior:**

- Validates payload schema.
- Inserts record into `activity_feed`.
- Optionally syncs to MoFlo core analytics.
- Supports both internal and external event consumption.

---

### **OpenAI Endpoints**

### **1. `/api/openai/generate` – Question Generation**

- **Input:** Survey purpose or topic.
- **Output:** JSON array of suggested questions.
- **Model:** `gpt-4o-mini`
- **Example Response:**
    
    ```json
    {
      "suggestions": [
        "How would you rate your onboarding experience?",
        "What could we improve in our training process?"
      ]
    }
    
    ```
    

---

### **2. `/api/openai/analyze` – Sentiment & Summary**

- **Input:** Text response from a user.
- **Output:** `{ sentiment: "positive", summary: "Satisfied with support speed." }`
- **Usage:** Updates `responses.sentiment` and `responses.summary`.
- **Fallback:** Defaults to “neutral” if OpenAI API fails (app remains functional offline).

---

## **6. File Structure**

```
/app/
  /mojeremiah/
    page.tsx                        # Dashboard
    create/page.tsx                 # Survey Builder
    view/page.tsx                   # Manage Surveys
    respond/[surveyId]/page.tsx     # Public Response Form
    analytics/[surveyId]/page.tsx   # Analytics Dashboard
  /api/
    surveys/save/route.ts
    responses/submit/route.ts
    webhook/sync/route.ts
    openai/generate/route.ts
    openai/analyze/route.ts
/components/
  ActivityFeed.tsx  SurveyList.tsx  SurveyQuestionEditor.tsx
  AnalyticsCards.tsx  ErrorState.tsx
/context/
  OrgContext.tsx  UIContext.tsx
/hooks/
  useCreateSurvey.ts  useRealtimeActivityFeed.ts
  useRealtimeResponses.ts  useAnalytics.ts  useSurveyVersions.ts
/lib/
  supabaseClient.ts  supabaseAdmin.ts  analytics.ts
  openaiClient.ts  webhooks.ts  exportTxt.ts  validation.ts
/supabase/
  schema.sql  seed.example.json  policies.md
/public/
  surveys.txt  screenshots/  assets/

```

---

## **7. Validation & Error Handling**

| Mechanism | Description |
| --- | --- |
| **Form Validation** | Ensures title and ≥1 question before save. |
| **Webhook Validation** | Schema check for incoming payloads. |
| **OpenAI Error Handling** | Try/catch + fallback to static defaults. |
| **UI Feedback** | `ErrorState.tsx` for visual error indicators. |
| **TypeScript Models** | Strict typing for Survey, Question, Response. |

---

## **8. Submission Artifacts**

| Artifact | Purpose |
| --- | --- |
| `/public/surveys.txt` | Exported JSON (assignment deliverable). |
| `/supabase/seed.example.json` | Mock populated schema. |
| `/QUESTIONS.txt` | MoFlo reflection answers. |
| `/README.md` | Setup guide + screenshots. |
| `/public/screenshots/` | Visual proof of all pages. |
| `/app/api/openai/*` | Optional AI routes for bonus innovation. |

---

## **9. Why MoSurveys Stands Out**

✅ **Meets every MoFlo requirement** (Next.js 15, TS, Tailwind, validation, TXT export).

✅ **Integrates Supabase Realtime** for instant activity feed updates.

✅ **Leverages OpenAI API** for contextual question generation and sentiment analysis.

✅ **Implements version control, shareable links, and analytics dashboards.**

✅ **Offline-safe** — AI endpoints are optional with graceful fallbacks.

✅ **Extensible architecture** ready for MoFlo’s centralized analytics or CRM sync.

**Result:**

A **production-ready, AI-enhanced, event-driven survey system** that exemplifies both **technical excellence** and **MoFlo design compliance** — a strong, differentiating submission.