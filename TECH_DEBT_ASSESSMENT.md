# MoSurveys Technical Debt Assessment

**Date:** October 26, 2025  
**Assessment Type:** Code Review & Technical Debt Analysis  
**Overall Status:** 🟢 **GOOD** - Production-ready MVP with preventable tech debt

---

## 📋 Executive Summary

Your codebase demonstrates modern best practices with Next.js 15, TypeScript, and Supabase. The architecture is clean, components are well-organized, and the code follows your documented standards. However, there are several areas where technical debt exists or could accumulate that should be addressed before scaling.

**Key Findings:**
- ✅ Strong foundation with TypeScript and modular architecture
- ⚠️ Security gaps (webhook auth, rate limiting, RLS verification needed)
- ⚠️ Type safety issues with JSONB fields using `as any`
- ⚠️ Missing input validation library (manual validation is error-prone)
- ⚠️ Excessive console logging in production code

**Estimated Refactoring Effort:** 2-3 days for high-priority items

---

## 🔴 Critical Issues

### 1. Hardcoded Default Organization ID

**Severity:** 🔴 Critical  
**Impact:** Scalability, Maintainability  
**Files Affected:**
- `src/app/mojeremiah/view/page.tsx:31`
- `src/app/mojeremiah/create/page.tsx:20`
- `src/components/dashboard/ActivityFeed.tsx:20`

**Problem:**
```typescript
const DEFAULT_ORG_ID = process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001';
```

- Hardcoded fallback UUID is duplicated across 3+ files
- This pattern will break when you add multi-org support
- Environment variable is exposed client-side (`NEXT_PUBLIC_`)
- No centralized configuration

**Recommendation:**
Create a centralized config file:

```typescript
// src/lib/config.ts
export const config = {
  defaultOrgId: process.env.NEXT_PUBLIC_DEFAULT_ORG_ID || '00000000-0000-0000-0000-000000000001',
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY,
  }
} as const;
```

Better long-term solution:
- Move org ID logic to a context provider or custom hook
- Consider using server-side sessions for org identification
- Implement proper multi-tenancy architecture

**Priority:** High  
**Effort:** 2-3 hours

---

### 2. Missing Row Level Security (RLS) Policy Verification

**Severity:** 🔴 Critical  
**Impact:** Security, Data Isolation  
**Current State:** RLS mentioned but not fully audited

**Risk:**
- Users could potentially access surveys from other organizations
- Need to audit all Supabase queries for org_id filtering
- Client-side filters can be bypassed without proper RLS

**Recommendation:**
1. Review all RLS policies in Supabase dashboard
2. Ensure every table has proper org_id-based policies
3. Test policies with different org_id values
4. Add integration tests to verify policy enforcement

**Example RLS Policy:**
```sql
-- Surveys table RLS
CREATE POLICY "Users can only view surveys from their org"
ON surveys FOR SELECT
USING (org_id = current_setting('app.current_org_id')::uuid);

CREATE POLICY "Users can only insert surveys for their org"
ON surveys FOR INSERT
WITH CHECK (org_id = current_setting('app.current_org_id')::uuid);
```

**Priority:** High  
**Effort:** 4-6 hours

---

## 🟡 High Priority Tech Debt

### 3. TODO in Type Definitions

**Severity:** 🟡 High  
**Impact:** Data Consistency  
**Location:** `src/types/survey.ts:31`

**Problem:**
```typescript
required: boolean; // TODO: Add to DB schema if needed
```

- `required` field exists in UI types but not in database schema
- Creates data inconsistency between frontend and backend
- The field is being ignored when saving surveys
- Users might expect questions to enforce "required" validation

**Recommendation:**
**Option A:** Add to database schema (preferred)
```sql
-- Migration: add_required_field_to_questions.sql
ALTER TABLE survey_questions ADD COLUMN required boolean DEFAULT true;
```

**Option B:** Remove from UI types if not needed
```typescript
export interface Question {
  id: string;
  type: QuestionType;
  text: string;
  options?: string[];
  // Remove: required: boolean;
  position?: number;
}
```

**Priority:** High  
**Effort:** 1 hour (including migration and type updates)

---

### 4. Inconsistent Error Handling Patterns

**Severity:** 🟡 High  
**Impact:** User Experience, Debugging, Monitoring

**Examples:**
- Some API routes return generic "Internal server error"
- Some components use `ErrorState` component, others use inline error messages
- No consistent error logging strategy
- API routes use `console.error` with varying detail levels

**Problem Files:**
- `src/app/api/surveys/save/route.ts`
- `src/app/api/openai/generate/route.ts`
- `src/app/api/webhook/sync/route.ts`
- Various component files

**Recommendation:**
Create a centralized error handling system:

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class ValidationError extends AppError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

export class NotFoundError extends AppError {
  constructor(message: string) {
    super(message, 404, 'NOT_FOUND');
  }
}

// src/lib/logger.ts
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export const logger = {
  debug: (...args: any[]) => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[DEBUG]', new Date().toISOString(), ...args);
    }
  },
  info: (...args: any[]) => console.info('[INFO]', new Date().toISOString(), ...args),
  warn: (...args: any[]) => console.warn('[WARN]', new Date().toISOString(), ...args),
  error: (...args: any[]) => console.error('[ERROR]', new Date().toISOString(), ...args),
};

// src/lib/api-response.ts
export function handleApiError(error: unknown) {
  if (error instanceof AppError) {
    return NextResponse.json(
      { success: false, error: error.message, code: error.code },
      { status: error.statusCode }
    );
  }
  
  logger.error('Unexpected error:', error);
  return NextResponse.json(
    { success: false, error: 'Internal server error' },
    { status: 500 }
  );
}
```

**Priority:** High  
**Effort:** 4-6 hours

---

### 5. No Request Rate Limiting

**Severity:** 🟡 High  
**Impact:** Security, Cost Control, Abuse Prevention

**Problem:**
- API routes have no rate limiting:
  - `/api/openai/generate` - could result in excessive OpenAI costs
  - `/api/surveys/save` - spam survey creation possible
  - `/api/webhook/sync` - flood attacks possible
- No protection against brute force survey creation
- Vulnerable to abuse and excessive API costs

**Recommendation:**
Implement rate limiting middleware using Upstash Redis or in-memory solution:

```typescript
// src/middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Simple in-memory rate limiter (use Redis for production)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const now = Date.now();
  const windowMs = 60 * 1000; // 1 minute
  const maxRequests = 10;

  // Clean up old entries
  for (const [key, value] of rateLimitMap.entries()) {
    if (now > value.resetTime) {
      rateLimitMap.delete(key);
    }
  }

  const key = `${ip}:${request.nextUrl.pathname}`;
  const record = rateLimitMap.get(key);

  if (!record) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
  } else if (now > record.resetTime) {
    record.count = 1;
    record.resetTime = now + windowMs;
  } else if (record.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429 }
    );
  } else {
    record.count++;
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
```

**Priority:** High  
**Effort:** 3-4 hours

---

### 6. Excessive Console Logging in Production Code

**Severity:** 🟡 High  
**Impact:** Performance, Security, Code Cleanliness

**Found:** 17 `console.log` statements across 5 files

**Locations:**
- `src/app/api/webhook/sync/route.ts` (4 logs)
- `src/app/api/surveys/save/route.ts` (3 logs)
- `src/app/api/openai/generate/route.ts` (1 log)
- `src/components/dashboard/ActivityFeed.tsx` (7 logs)
- `src/app/mojeremiah/view/page.tsx` (2 logs)

**Problem:**
- Console logs expose internal logic in production
- Performance overhead in high-traffic scenarios
- Clutters browser console for end users
- Makes debugging harder by mixing important and trivial logs

**Recommendation:**
Replace all `console.log` with environment-aware logger:

```typescript
// Use the logger from #4 above
import { logger } from '@/lib/logger';

// Before:
console.log('📡 Calling webhook:', webhookUrl);
console.log('📦 Webhook payload:', webhookPayload);

// After:
logger.debug('Calling webhook:', webhookUrl);
logger.debug('Webhook payload:', webhookPayload);
```

**Priority:** High  
**Effort:** 1-2 hours

---

### 7. Type Safety Issues with `as any`

**Severity:** 🟡 High  
**Impact:** Type Safety, Runtime Errors, Maintainability

**Locations:**
- `src/components/dashboard/ActivityFeed.tsx:202`
- Multiple places using `as any` for JSONB fields

**Problem:**
```typescript
const details = activity.details as any;

// Usage:
return `Survey "${details?.survey_title || "Untitled"}" created`;
```

- Loses TypeScript safety benefits
- Runtime errors possible from unexpected data shapes
- No autocomplete or type checking
- Makes refactoring dangerous

**Recommendation:**
Define proper TypeScript interfaces for JSONB fields:

```typescript
// src/types/activity.ts
export interface SurveyCreatedDetails {
  survey_title: string;
  question_count: number;
  audience: string;
}

export interface ResponseReceivedDetails {
  survey_title: string;
  response_id: string;
  sentiment?: string;
}

export interface SurveyDeletedDetails {
  survey_title: string;
  question_count: number;
}

export type ActivityDetails = 
  | { type: 'SURVEY_CREATED'; data: SurveyCreatedDetails }
  | { type: 'RESPONSE_RECEIVED'; data: ResponseReceivedDetails }
  | { type: 'SURVEY_DELETED'; data: SurveyDeletedDetails }
  | { type: 'SURVEY_UPDATED'; data: Partial<SurveyCreatedDetails> }
  | { type: 'SUMMARY_GENERATED'; data: { survey_title: string } };

// Usage with type guard:
function getActivityDescription(activity: ActivityFeedRow) {
  const details = activity.details as ActivityDetails;
  
  if (details.type === 'SURVEY_CREATED') {
    return `Survey "${details.data.survey_title}" created with ${details.data.question_count} questions`;
  }
  // ... type-safe access to other types
}
```

**Priority:** High  
**Effort:** 2-3 hours

---

## 🟢 Medium Priority Issues

### 8. No Input Validation Library

**Severity:** 🟢 Medium  
**Impact:** Data Integrity, Security

**Current State:** Manual validation in API routes

**Problem:**
```typescript
// Current approach:
if (!surveyData.title || !surveyData.audience || surveyData.questions.length === 0) {
  return NextResponse.json({ success: false, error: 'Validation failed' }, { status: 400 });
}
```

- Validation logic is inconsistent across routes
- Easy to miss edge cases (max length, special characters, etc.)
- No schema validation for complex objects
- Hard to maintain and test

**Recommendation:**
Add Zod for runtime validation:

```bash
npm install zod
```

```typescript
// src/lib/validation.ts
import { z } from 'zod';

export const questionSchema = z.object({
  id: z.string(),
  type: z.enum(['short_text', 'long_text', 'multiple_choice', 'rating', 'yes_no']),
  text: z.string().min(1).max(500),
  options: z.array(z.string()).optional(),
  required: z.boolean(),
  position: z.number().optional(),
});

export const surveyDataSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000).optional(),
  audience: z.string().min(1, 'Audience is required').max(100),
  questions: z.array(questionSchema).min(1, 'At least one question required'),
});

export const saveSurveyRequestSchema = z.object({
  surveyData: surveyDataSchema,
  orgId: z.string().uuid('Invalid organization ID'),
});

// Usage in API route:
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = saveSurveyRequestSchema.parse(body);
    
    // Now `validated` is fully type-safe and validated
    // ...
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Validation failed', issues: error.issues },
        { status: 400 }
      );
    }
    // ...
  }
}
```

**Priority:** Medium  
**Effort:** 3-4 hours

---

### 9. No Loading State Debouncing

**Severity:** 🟢 Medium  
**Impact:** User Experience, Performance

**Problem:**
- Dashboard stats and activity feed refetch on every Realtime event
- Rapid updates can cause UI flicker
- No debouncing on refetch operations
- Excessive re-renders

**Recommendation:**
Add debounce to data fetching:

```typescript
// src/hooks/useDashboardStats.ts
import { debounce } from 'lodash'; // or create custom debounce

useEffect(() => {
  fetchStats();

  // Debounced refetch function
  const debouncedFetch = debounce(fetchStats, 500);

  const surveysChannel = supabase
    .channel("dashboard-surveys")
    .on("postgres_changes", { /* ... */ }, () => {
      debouncedFetch(); // Debounced call
    })
    .subscribe();

  return () => {
    debouncedFetch.cancel(); // Cancel pending calls
    supabase.removeChannel(surveysChannel);
  };
}, []);
```

**Priority:** Medium  
**Effort:** 1-2 hours

---

### 10. Large Component Files

**Severity:** 🟢 Medium  
**Impact:** Maintainability, Testability

**Examples:**
- `ActivityFeed.tsx` (346 lines) - includes helper functions that could be extracted
- `page.tsx` (350 lines in dashboard) - could extract navigation into separate component

**Recommendation:**
Following your own modularization rules:

```typescript
// Extract helper functions to utilities
// src/lib/activity-helpers.ts
export function getActivityStyle(type: string) { /* ... */ }
export function formatTimeAgo(timestamp: string) { /* ... */ }
export function getActivityDescription(activity: ActivityFeedRow) { /* ... */ }

// Extract components
// src/components/dashboard/ActivityFeedItem.tsx
export function ActivityFeedItem({ activity }: { activity: ActivityFeedRow }) {
  // Single activity item logic
}

// Simplified ActivityFeed.tsx
import { ActivityFeedItem } from './ActivityFeedItem';
import { getActivityStyle, formatTimeAgo } from '@/lib/activity-helpers';
```

**Priority:** Medium  
**Effort:** 3-4 hours

---

### 11. No Webhook Authentication

**Severity:** 🟢 Medium (High if webhooks are used extensively)  
**Impact:** Security, Data Integrity

**Location:** `src/app/api/webhook/sync/route.ts`

**Problem:**
- Webhook endpoint has no authentication
- Anyone can send fake events to your activity feed
- Potential for spam or malicious activity logging
- No way to verify payload source

**Recommendation:**
Add webhook signature verification:

```typescript
// src/app/api/webhook/sync/route.ts
import crypto from 'crypto';

const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET!;

function verifyWebhookSignature(
  payload: string,
  signature: string
): boolean {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-webhook-signature');
    const rawBody = await request.text();
    
    if (!signature || !verifyWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 401 }
      );
    }
    
    const payload = JSON.parse(rawBody);
    // Process webhook...
  } catch (error) {
    // ...
  }
}
```

Don't forget to sign webhooks when sending:

```typescript
// When calling webhook
const signature = crypto
  .createHmac('sha256', WEBHOOK_SECRET)
  .update(JSON.stringify(payload))
  .digest('hex');

await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-webhook-signature': signature,
  },
  body: JSON.stringify(payload),
});
```

**Priority:** Medium  
**Effort:** 2-3 hours

---

### 12. Missing Pagination

**Severity:** 🟢 Medium  
**Impact:** Performance, User Experience

**Locations:**
- Survey list page (`/mojeremiah/view`) - no pagination
- Activity feed - limited to 10, but no "Load More" or pagination UI

**Problem:**
- Performance issues when users have 100+ surveys
- All surveys loaded into memory at once
- Poor UX when scrolling through large lists
- Activity feed only shows 10 items with no way to see more

**Recommendation:**
Implement cursor-based pagination:

```typescript
// src/app/mojeremiah/view/page.tsx
const [surveys, setSurveys] = useState<Survey[]>([]);
const [hasMore, setHasMore] = useState(true);
const [cursor, setCursor] = useState<string | null>(null);

const fetchSurveys = async (loadMore = false) => {
  const pageSize = 20;
  let query = supabase
    .from("surveys")
    .select("*")
    .eq("org_id", DEFAULT_ORG_ID)
    .order("created_at", { ascending: false })
    .limit(pageSize);

  if (cursor && loadMore) {
    query = query.lt('created_at', cursor);
  }

  const { data, error } = await query;

  if (error) throw error;

  if (loadMore) {
    setSurveys([...surveys, ...data]);
  } else {
    setSurveys(data);
  }

  setHasMore(data.length === pageSize);
  if (data.length > 0) {
    setCursor(data[data.length - 1].created_at);
  }
};

// UI:
{hasMore && (
  <button onClick={() => fetchSurveys(true)}>
    Load More
  </button>
)}
```

**Priority:** Medium  
**Effort:** 2-3 hours per component

---

### 13. No Data Caching Strategy

**Severity:** 🟢 Medium  
**Impact:** Performance, User Experience, API Costs

**Problem:**
- Every page load fetches fresh data
- Dashboard stats are refetched on every Realtime event
- No caching for frequently accessed surveys
- Redundant API calls

**Recommendation:**
Consider using React Query (TanStack Query) or SWR:

```bash
npm install @tanstack/react-query
```

```typescript
// src/app/providers.tsx
'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000, // 1 minute
      cacheTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// Usage:
import { useQuery } from '@tanstack/react-query';

export function useDashboardStats() {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { count: totalSurveys } = await supabase
        .from("surveys")
        .select("*", { count: "exact", head: true });
      // ...
      return { totalSurveys, activeSurveys, totalResponses };
    },
    refetchInterval: 30000, // Refetch every 30s
  });
}
```

**Priority:** Medium  
**Effort:** 4-6 hours

---

## 🔵 Low Priority / Future Considerations

### 14. No Automated Testing

**Severity:** 🔵 Low (but important for long-term)  
**Impact:** Code Quality, Confidence, Regression Prevention

**Current State:**
- No unit tests
- No integration tests
- No E2E tests

**Recommendation:**
Add testing infrastructure:

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
npm install -D @playwright/test
```

**Test Coverage Priorities:**
1. **Unit Tests:**
   - Utility functions (validation, helpers)
   - Custom hooks (useSurveyBuilder, useDashboardStats)
   - Type converters

2. **Integration Tests:**
   - API routes (surveys/save, openai/generate)
   - Database operations

3. **E2E Tests:**
   - Survey creation flow
   - Response submission
   - Dashboard navigation

```typescript
// Example: src/hooks/__tests__/useSurveyBuilder.test.ts
import { renderHook, act } from '@testing-library/react';
import { useSurveyBuilder } from '../useSurveyBuilder';

describe('useSurveyBuilder', () => {
  it('should add a question', () => {
    const { result } = renderHook(() => useSurveyBuilder());
    
    act(() => {
      result.current.addQuestion('short_text');
    });
    
    expect(result.current.surveyData.questions).toHaveLength(1);
    expect(result.current.surveyData.questions[0].type).toBe('short_text');
  });
});
```

**Priority:** Low (but recommended)  
**Effort:** 1-2 weeks for comprehensive coverage

---

### 15. No Analytics/Monitoring

**Severity:** 🔵 Low  
**Impact:** Observability, Debugging, Product Insights

**Missing:**
- Error tracking (Sentry, Rollbar)
- Performance monitoring (Web Vitals)
- Usage analytics (user behavior)
- Custom business metrics

**Recommendation:**
Add error tracking:

```bash
npm install @sentry/nextjs
```

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});

// Usage:
try {
  await publishSurvey(orgId);
} catch (error) {
  Sentry.captureException(error, {
    tags: { feature: 'survey-creation' },
    extra: { surveyData, orgId },
  });
  throw error;
}
```

**Priority:** Low (but valuable for production)  
**Effort:** 2-4 hours

---

### 16. OpenAI API Cost Management

**Severity:** 🔵 Low (Medium if budget-constrained)  
**Impact:** Cost Control, Budget Management

**Location:** `src/app/api/openai/generate/route.ts`

**Problem:**
- No cost tracking
- No usage limits per user/org
- Could result in unexpected costs
- No budget alerts

**Recommendation:**
Implement usage quotas:

```typescript
// Track usage in database
// Migration: add_ai_usage_tracking.sql
CREATE TABLE ai_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL REFERENCES organizations(id),
  endpoint text NOT NULL,
  tokens_used integer NOT NULL,
  cost_usd numeric(10, 6) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

// Check quota before calling OpenAI
async function checkAIQuota(orgId: string): Promise<boolean> {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const { data } = await supabase
    .from('ai_usage')
    .select('cost_usd')
    .eq('org_id', orgId)
    .gte('created_at', thirtyDaysAgo.toISOString());
  
  const totalCost = data?.reduce((sum, row) => sum + Number(row.cost_usd), 0) || 0;
  const monthlyLimit = 10.00; // $10 per org per month
  
  return totalCost < monthlyLimit;
}

// Log usage after API call
async function logAIUsage(orgId: string, tokensUsed: number) {
  const costPerToken = 0.00015 / 1000; // gpt-4o-mini pricing
  const cost = tokensUsed * costPerToken;
  
  await supabase.from('ai_usage').insert({
    org_id: orgId,
    endpoint: 'generate-questions',
    tokens_used: tokensUsed,
    cost_usd: cost,
  });
}
```

**Priority:** Low  
**Effort:** 3-4 hours

---

### 17. Database Transaction Management

**Severity:** 🔵 Low  
**Impact:** Data Integrity, Race Conditions

**Location:** `src/app/api/surveys/save/route.ts:74-75`

**Current Implementation:**
```typescript
// Manual rollback with separate delete query
if (questionsError) {
  console.error('Error creating questions:', questionsError);
  await supabaseAdmin.from('surveys').delete().eq('id', survey.id);
  // ...
}
```

**Problems:**
- Not atomic - race conditions possible
- Cleanup could fail (leaving orphaned survey)
- No guarantee of consistency
- Multiple round trips to database

**Recommendation:**
Use Supabase database functions with proper transactions:

```sql
-- Migration: add_create_survey_function.sql
CREATE OR REPLACE FUNCTION create_survey_with_questions(
  p_org_id uuid,
  p_title text,
  p_audience text,
  p_ai_suggestions jsonb,
  p_questions jsonb
) RETURNS jsonb AS $$
DECLARE
  v_survey_id uuid;
  v_question jsonb;
  v_position int := 0;
BEGIN
  -- Insert survey
  INSERT INTO surveys (org_id, title, audience, ai_suggestions)
  VALUES (p_org_id, p_title, p_audience, p_ai_suggestions)
  RETURNING id INTO v_survey_id;
  
  -- Insert questions
  FOR v_question IN SELECT * FROM jsonb_array_elements(p_questions)
  LOOP
    INSERT INTO survey_questions (survey_id, question, type, options, position)
    VALUES (
      v_survey_id,
      v_question->>'text',
      (v_question->>'type')::text,
      (v_question->'options')::text[],
      v_position
    );
    v_position := v_position + 1;
  END LOOP;
  
  -- Return survey ID
  RETURN jsonb_build_object('id', v_survey_id, 'title', p_title);
END;
$$ LANGUAGE plpgsql;
```

```typescript
// Usage in API route (atomic operation):
const { data, error } = await supabaseAdmin
  .rpc('create_survey_with_questions', {
    p_org_id: orgId,
    p_title: surveyData.title,
    p_audience: surveyData.audience,
    p_ai_suggestions: surveyToDbInsert(surveyData, orgId).ai_suggestions,
    p_questions: surveyData.questions,
  });

if (error) throw error;
// Success! Transaction was atomic.
```

**Priority:** Low  
**Effort:** 2-3 hours

---

## 📊 Positive Observations

Your codebase demonstrates many best practices:

✅ **Well-organized component structure** - Clear separation of concerns with `components/`, `hooks/`, `lib/`  
✅ **Good use of TypeScript** - Strong type safety throughout (except JSONB fields)  
✅ **Modular hooks** - Reusable logic in `useSurveyBuilder`, `useDashboardStats`  
✅ **Proper environment variable handling** - `.env` in `.gitignore`, clear documentation  
✅ **Realtime subscriptions properly cleaned up** - No memory leaks from useEffect  
✅ **Optimistic updates implemented correctly** - Good UX with rollback on error  
✅ **Excellent documentation** - Comments, README, and rule files are comprehensive  
✅ **Consistent UI patterns** - Following MoFlo design system throughout  
✅ **Modern Next.js patterns** - App Router, Server Components, API routes  
✅ **Database migrations** - Proper version control of schema changes  

---

## 🎯 Priority Action Plan

### Immediate (This Week)
**Estimated Total:** 8-12 hours

1. ✅ **Centralize configuration** (#1) - 2-3 hours
   - Create `src/lib/config.ts`
   - Replace all hardcoded `DEFAULT_ORG_ID` references

2. ✅ **Fix the `required` field TODO** (#3) - 1 hour
   - Add database migration or remove from types

3. ✅ **Add webhook authentication** (#11) - 2-3 hours
   - Implement HMAC signature verification

4. ✅ **Reduce console.log statements** (#6) - 1-2 hours
   - Create logger utility
   - Replace all console.log calls

5. ✅ **Create error handling utilities** (#4 partial) - 2-3 hours
   - Basic logger and error classes

---

### Short Term (Next Sprint - 2 weeks)
**Estimated Total:** 15-20 hours

6. ✅ **Add input validation with Zod** (#8) - 3-4 hours
   - Install Zod
   - Create validation schemas
   - Update API routes

7. ✅ **Implement rate limiting** (#5) - 3-4 hours
   - Add middleware
   - Test rate limits

8. ✅ **Fix type safety issues** (#7) - 2-3 hours
   - Define JSONB interfaces
   - Remove `as any` casts

9. ✅ **Add pagination to survey list** (#12) - 2-3 hours
   - Cursor-based pagination
   - "Load More" UI

10. ✅ **Standardize error handling** (#4 complete) - 4-6 hours
    - Implement across all API routes
    - Update component error displays

---

### Medium Term (Next Month)
**Estimated Total:** 20-30 hours

11. ✅ **Implement comprehensive error tracking** (#15) - 2-4 hours
    - Set up Sentry
    - Add error boundaries

12. ✅ **Review and audit RLS policies** (#2) - 4-6 hours
    - Test all policies
    - Add missing policies
    - Document security model

13. ✅ **Set up basic automated tests** (#14) - 8-12 hours
    - Unit tests for hooks
    - Integration tests for API routes
    - Basic E2E test

14. ✅ **Add data caching strategy** (#13) - 4-6 hours
    - Implement React Query
    - Update data fetching hooks

15. ✅ **Refactor large components** (#10) - 3-4 hours
    - Extract helpers
    - Split ActivityFeed

---

### Long Term (Next Quarter)
**Nice to Have**

16. ✅ AI cost tracking (#16)
17. ✅ Database transaction functions (#17)
18. ✅ Performance monitoring
19. ✅ Comprehensive test coverage
20. ✅ Analytics integration

---

## 💡 Summary

### Risk Assessment

**Security Risks:** 🟡 Medium
- Webhook authentication missing
- RLS policies need verification
- Rate limiting absent

**Scalability Risks:** 🟡 Medium
- No pagination (performance issue with many surveys)
- Hardcoded org ID pattern
- No caching strategy

**Maintainability Risks:** 🟢 Low
- Well-organized codebase
- Good documentation
- Type safety mostly enforced

**Data Integrity Risks:** 🟢 Low-Medium
- Manual transaction rollback (not atomic)
- `required` field inconsistency
- Type safety gaps in JSONB fields

### Final Verdict

Your codebase is **production-ready for an MVP** with the following caveats:

✅ **Ship it if:**
- Limited user base (< 100 active users)
- Known/trusted users only
- Budget for potential OpenAI costs
- Can monitor and respond quickly to issues

⚠️ **Address these first if:**
- Public launch planned
- Multiple organizations will use it
- Untrusted users will have access
- Budget-constrained environment

**Recommended path:** Address the "Immediate" and "Short Term" items (total ~2-3 days work) before wider launch. This will significantly reduce risk while maintaining momentum.

---

## 📚 Additional Resources

- [Next.js Security Best Practices](https://nextjs.org/docs/app/building-your-application/configuring/security-headers)
- [Supabase Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Zod Documentation](https://zod.dev/)
- [Rate Limiting Patterns](https://blog.logrocket.com/rate-limiting-node-js/)
- [Error Handling in Next.js](https://nextjs.org/docs/app/building-your-application/routing/error-handling)

---

**Last Updated:** October 26, 2025  
**Next Review:** December 2025 (or after addressing high-priority items)

