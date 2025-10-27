# MoSurveys 📊

**An AI-powered survey management platform designed for the MoFlo Cloud ecosystem.**

Create surveys in minutes, collect responses instantly, and get AI-generated insights automatically—without hiring a data scientist.

**Live Demo:** https://mosurveys.vercel.app/

## About

MoSurveys is a lightweight survey creation and management platform that helps teams build surveys, collect responses (anonymous or identified), and analyze results with optional AI-powered insights. It includes a drag-and-drop survey builder, built-in versioning, a realtime activity feed, and an analytics dashboard. The project is suitable for local demos and small production deployments backed by Supabase.

## Setup & Run (summary)

There are two common paths:

- **Path 1 — Demo / Testing**: Use the provided `.env` from the project owner and run the app locally (no personal Supabase required).
- **Path 2 — Active Development**: Create your own Supabase project, apply migrations, and generate types. See the full Getting Started section below for step-by-step commands.

Common commands:
```bash
npm install
npm run dev        # start dev server
npm run db:push    # apply supabase migrations (dev)
npm run db:types   # generate TypeScript types
```

## Key features & functionality

- **Survey builder**: Create surveys with multiple question types (text, multiple choice, rating, yes/no) and reorder questions.
- **Versioning & changelogs**: Track changes and maintain previous versions of a survey.
- **Response collection**: Public shareable links for collecting responses; supports anonymous responses.
- **Realtime activity feed**: Live updates using Supabase Realtime and webhook-driven event logging.
- **Analytics & AI**: Dashboard metrics plus optional OpenAI-powered question suggestions, sentiment analysis, and response summaries.
- **Extensible API**: Server endpoints and modular lib code for adding integrations or custom processing.

## Assumptions & limitations

- Designed primarily as a demo / lightweight production prototype — not an enterprise-grade survey platform.
- AI features require a valid `OPENAI_API_KEY` and are optional; the app gracefully falls back when unavailable.
- Supabase is required for persistence and realtime features; Row Level Security (RLS) is assumed to be configured via migrations.
- No full multi-tenant user-management is implemented beyond organization IDs; add custom auth for stricter isolation.
- Not optimized for extremely high scale (millions of responses) without adding pagination, caching, and horizontal scaling.

## 📑 Table of Contents

- [What is MoSurveys?](#-what-is-mosurveys)
- [Key Features & Functionality](#-key-features--functionality)
- [Tech Stack](#️-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Available Scripts](#-available-scripts)
- [Development Workflow](#-development-workflow)
- [Database Schema](#️-database-schema)
- [AI Features](#-ai-features-optional)
- [Security](#-security)
- [Assumptions & Limitations](#️-assumptions--limitations)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)
- [Contributing](#-contributing)

---

## 📖 What is MoSurveys?

MoSurveys is a modern feedback collection and analysis platform built specifically for small and medium-sized businesses. It bridges the gap between basic survey tools (like Google Forms) and expensive enterprise solutions (like Qualtrics).

### The Problem It Solves

Businesses struggle to:
- **Collect feedback efficiently** - Manual survey creation takes hours
- **Understand customer sentiment** - Reading hundreds of responses manually is time-consuming
- **Get actionable insights** - No way to quantify satisfaction or spot trends
- **Connect feedback to business actions** - Survey data lives in isolation from other tools

### The MoSurveys Solution

1. **AI-Powered Survey Creation** - Generate contextual questions in seconds using OpenAI
2. **Instant Response Collection** - Shareable links that work on any device
3. **Automatic Sentiment Analysis** - AI analyzes every response and generates summaries
4. **Real-Time Analytics** - Live dashboard with sentiment trends and response tracking
5. **MoFlo Ecosystem Integration** - Connects with MoMail, MoSocial, MoBlogs, MoLead, and more

### Who It's For

- **Marketing agencies** - Client satisfaction surveys
- **SaaS companies** - Product feedback and feature requests
- **E-commerce stores** - Post-purchase experience surveys
- **Service businesses** - Customer satisfaction tracking
- **HR teams** - Employee engagement surveys
- **Content creators** - Audience feedback on blog posts and content

---

## ✨ Key Features & Functionality

### 🎨 Survey Builder
- **5 Question Types:**
  - Short text (one-line answers)
  - Long text (paragraph responses)
  - Multiple choice (4-6 options)
  - Rating scale (1-10 ratings)
  - Yes/No (binary questions)
- **Drag-and-drop reordering** for questions
- **Inline editing** with real-time preview
- **AI question generation** - Get 5 contextual questions in 3 seconds
- **Survey versioning** - Track changes with changelog and restore previous versions

### 📊 Response Collection
- **Shareable links** - One-click copy for distribution
- **Anonymous responses** - No login required for respondents
- **Mobile-responsive forms** - Works on any device
- **Progress indicator** - Shows completion percentage
- **Real-time submission** - Instant capture with webhooks

### 🤖 AI-Powered Analytics
- **Automatic sentiment analysis** - Positive, Negative, Neutral, Mixed
- **AI-generated summaries** - One-sentence insights for each response
- **Question-specific analysis** - Understand patterns by question
- **Graceful fallbacks** - Works with or without OpenAI API key (uses mock analysis)

### 📈 Real-Time Dashboard
- **Live activity feed** - See surveys created, responses received, analysis completed
- **Sentiment distribution** - Pie charts showing sentiment breakdown
- **Response tracking** - Monitor response count and engagement
- **Survey management** - View, edit, delete, and analyze all surveys in one place
- **Analytics per survey** - Deep dive into individual survey performance

### 🔄 Advanced Features
- **Survey versioning** - Create new versions while preserving response history
- **Version comparison** - See what changed between versions
- **Restore previous versions** - Roll back to earlier survey states
- **Webhook integration** - All events sync to MoFlo activity feed
- **Real-time updates** - Supabase Realtime for live data sync

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Realtime)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: OpenAI API (optional)
- **Type Safety**: Auto-generated TypeScript types from database schema

---

## 📋 Prerequisites

### For Everyone
- **Node.js** 20.x or later ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Git**

### Additional for Development (Path 2)
- **Supabase Account** ([Sign up free](https://supabase.com))
- **OpenAI API Key** (optional, for AI features)

---

## 🎯 Quick Start: Choose Your Path

### Path 1: Just Running the App (Demo/Testing)
**You DO NOT need your own Supabase project.**

If you just want to run the app locally to test it:
- Get the `.env` file from the project owner
- The app will connect to the existing Supabase project
- Perfect for: demos, testing, non-developers trying it out

**Setup time**: ~2 minutes

### Path 2: Active Development
**You NEED your own Supabase project.**

If you're developing features, contributing, or testing database changes:
- Create your own Supabase project
- Run migrations to set up your database
- Use your own environment variables
- Test freely without affecting production data

**Setup time**: ~10 minutes

---

## 🚀 Getting Started

### ⚡ Quick Start Summary

**Just want to run the app?** → Follow **Path 1** (2 minutes)
- Get the `.env` file
- Run `npm install` and `npm run dev`
- Open http://localhost:3000

**Want to develop/modify?** → Follow **Path 2** (10 minutes)
- Create your own Supabase project
- Run database migrations
- Set up your own environment variables

---

### For Demo/Testing (Path 1)

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mosurveys
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Get Environment Variables

Ask the project owner for the `.env` file and place it in the project root.

#### 4. Run the App

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. ✨

---

### For Development (Path 2)

#### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mosurveys
```

#### 2. Install Dependencies

```bash
npm install
```

#### 3. Set Up Supabase

##### a) Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `mosurveys`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
   - **Plan**: Free (for development)

##### b) Link Your Local Project

After your Supabase project is created, get your project reference from the dashboard URL:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

Then link your local project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

You'll be prompted to enter your database password.

##### c) Apply Database Migrations

Create all necessary tables by running:

```bash
npm run db:push
```

This creates the following tables:
- `surveys` - Survey definitions with versioning
- `survey_questions` - Questions belonging to surveys
- `responses` - User responses with AI analysis
- `activity_feed` - Event log for webhooks and tracking

##### d) Generate TypeScript Types

Generate type-safe interfaces from your database schema:

```bash
npm run db:types
```

This creates `src/types/supabase.ts` with all your database types.

#### 4. Set Up Environment Variables

Create a `.env` file in the project root:

```bash
# Supabase Configuration
# Get these from: Supabase Dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# OpenAI (Optional - for AI features)
OPENAI_API_KEY=sk-...

# Default Organization ID (for local development)
NEXT_PUBLIC_DEFAULT_ORG_ID=00000000-0000-0000-0000-000000000001
```

**⚠️ Important**: Never commit `.env` to version control!

#### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 🚀

---

## 📁 Project Structure

```
mosurveys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── mojeremiah/        # Survey routes
│   │   │   ├── page.tsx       # Dashboard
│   │   │   ├── create/        # Survey builder
│   │   │   ├── view/          # Manage surveys
│   │   │   ├── respond/       # Public survey form
│   │   │   └── analytics/     # Insights dashboard
│   │   └── api/               # API routes
│   │       ├── surveys/
│   │       ├── responses/
│   │       └── openai/
│   ├── components/            # React components
│   ├── lib/                   # Utilities (Supabase clients, etc.)
│   ├── types/                 # TypeScript types
│   │   └── supabase.ts       # Auto-generated DB types
│   └── hooks/                 # Custom React hooks
├── supabase/
│   └── migrations/            # Database migrations
├── public/                    # Static assets
└── package.json
```

---

## 🎬 Available Scripts

### Development
```bash
npm run dev          # Start Next.js dev server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
```

### Database Management
```bash
npm run db:push      # Apply migrations to cloud database
npm run db:types     # Generate TypeScript types from schema
npm run db:migration # Create new migration file
npm run db:status    # Check Supabase connection status
npm run db:studio    # Open Supabase Studio in browser
```

---

## 🔄 Development Workflow

### Making Database Changes

1. **Create a migration**:
   ```bash
   npm run db:migration add_new_feature
   ```

2. **Edit the migration file** in `supabase/migrations/`:
   ```sql
   -- Example: Add a new column
   ALTER TABLE surveys ADD COLUMN tags text[];
   ```

3. **Apply to cloud database**:
   ```bash
   npm run db:push
   ```

4. **Update TypeScript types**:
   ```bash
   npm run db:types
   ```

5. **Start coding** with type-safe database access!

### Creating a Survey

1. Navigate to `/mojeremiah/create`
2. Fill in survey title and audience
3. Add questions (text, multiple choice, rating, yes/no)
4. Save - survey is stored in Supabase
5. Share the response link: `http://localhost:3000/mojeremiah/respond/[surveyId]`

### Sharing Surveys on Local Network

To allow other devices on your network to access surveys:

1. Find your local IP address:
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig | findstr IPv4
   ```

2. Share this link format:
   ```
   http://192.168.1.X:3000/mojeremiah/respond/[surveyId]
   ```

---

## 🗄️ Database Schema

### Tables

- **surveys** - Survey definitions with versioning support
  - `id`, `org_id`, `title`, `audience`, `version`, `parent_id`, `changelog`, `ai_suggestions`

- **survey_questions** - Questions with ordering
  - `id`, `survey_id`, `position`, `type`, `question`, `options`

- **responses** - User responses with AI analysis
  - `id`, `survey_id`, `org_id`, `answers` (JSONB), `sentiment`, `summary`

- **activity_feed** - Event log for tracking
  - `id`, `org_id`, `type`, `details` (JSONB)

### Relationships
```
surveys 1 ──→ * survey_questions
surveys 1 ──→ * responses
responses ──→ activity_feed (via webhooks)
```

---

## 🤖 AI Features (Optional)

The app includes optional OpenAI integration for:

- **Question Suggestions** - AI-generated question recommendations
- **Sentiment Analysis** - Automatic sentiment scoring of responses
- **Response Summaries** - AI-generated insights

To enable AI features:
1. Get an API key from [OpenAI](https://platform.openai.com/api-keys)
2. Add `OPENAI_API_KEY` to `.env`
3. The app will automatically use AI when available, with graceful fallbacks

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Environment variables** for sensitive data (never committed)
- **Input validation** on all forms and API routes
- **Sanitized queries** using Supabase's built-in protections

---

## ⚠️ Assumptions & Limitations

### Current Assumptions

**1. Single Organization Model**
- The app currently operates under a single default organization (`NEXT_PUBLIC_DEFAULT_ORG_ID`)
- All surveys and responses belong to this one organization
- Multi-tenancy is not yet implemented
- **Rationale:** Simplifies demo/portfolio scope while maintaining production-ready architecture

**2. Authentication Disabled for Demo**
- Row Level Security (RLS) policies are currently permissive (`USING (true)`)
- No user login or session management
- Anyone can create, edit, or delete surveys
- **Rationale:** Allows easy testing without auth setup barriers
- **Migration Path:** RLS policies are ready—just needs Supabase Auth integration (3-4 days)

**3. OpenAI Optional**
- AI features gracefully fallback to mock analysis if API key is missing
- Mock analysis uses basic keyword matching
- **Rationale:** App remains functional without paid API keys

**4. Anonymous Responses**
- No respondent authentication or tracking
- Cannot prevent duplicate responses from the same person
- No email validation or identity verification
- **Rationale:** Maximizes response rate by removing friction

**5. Local Development Focus**
- Optimized for localhost testing and development
- Production deployment requires additional hardening
- **Rationale:** Portfolio/internship project scope

### Known Limitations

**Security & Production Readiness**
- ❌ **No authentication system** - Anyone can access admin features
- ❌ **No webhook signature validation** - Webhook endpoint is unprotected
- ❌ **No rate limiting** - API routes can be spammed
- ❌ **Manual transaction rollback** - Not atomic (see TECH_DEBT_ASSESSMENT.md)
- ⚠️ **Service role used in API routes** - Bypasses RLS (acceptable for single-org demo)

**Features Not Yet Implemented**
- ❌ **NPS (Net Promoter Score) calculation** - Planned for Phase 3
- ❌ **User roles and permissions** - Admin, Editor, Viewer
- ❌ **Email notifications** - For new responses or negative sentiment
- ❌ **Export functionality** - CSV/Excel/PDF reports
- ❌ **Survey templates library** - Pre-built industry templates
- ❌ **Conditional branching** - Skip logic based on answers
- ❌ **Multi-language support** - Currently English only
- ❌ **Response editing** - Once submitted, cannot be modified
- ❌ **Survey scheduling** - No start/end dates for surveys

**Scalability Considerations**
- ⚠️ **No query pagination** - Dashboard loads all surveys (fine for <1000 surveys)
- ⚠️ **No caching strategy** - Every page load queries database
- ⚠️ **No database connection pooling** - Default Supabase limits apply
- ⚠️ **No CDN for assets** - Served directly from Next.js (Vercel handles in production)

**Data & Analytics**
- ⚠️ **Basic sentiment analysis only** - No topic clustering or trend analysis
- ⚠️ **No comparative benchmarking** - Cannot compare against industry averages
- ⚠️ **Limited data visualization** - Basic pie charts and tables
- ⚠️ **No custom dashboards** - Fixed dashboard layout

**Integration Limitations**
- ❌ **No actual MoFlo integrations** - Architecture ready, but APIs not connected
- ❌ **No Zapier/webhook API** - Cannot trigger external automations
- ❌ **No email embedding** - Cannot directly embed surveys in emails
- ❌ **No iframe/widget support** - Cannot embed on external websites

### What This Means For You

**✅ Perfect For:**
- Demo/portfolio presentations
- Local development and testing
- Understanding modern full-stack architecture
- Learning Next.js 15, Supabase, and OpenAI integration
- Proof-of-concept for MoFlo ecosystem

**⚠️ Not Ready For:**
- Production deployment with real customers (without security hardening)
- Multi-tenant SaaS (requires auth + org isolation)
- High-volume response collection (needs rate limiting + caching)
- Sensitive data collection (needs encryption + compliance)

**🚀 Production Readiness Estimate:**
- **Basic security fixes:** 3-4 days
- **Full authentication:** 1 week
- **Enterprise features:** 2-3 months

See `TECH_DEBT_ASSESSMENT.md` for detailed technical audit and roadmap.

---

## 🐛 Troubleshooting

### "Cannot find project ref" Error
```bash
# Re-link your project
npx supabase link --project-ref YOUR_PROJECT_REF
```

### Type Generation Fails
```bash
# Check connection status
npm run db:status

# Verify tables exist in Supabase Studio
npm run db:studio
```

### Migration Already Applied
```bash
# Check migration history
npx supabase migration list --remote
```

### Port Already in Use
```bash
# Kill process on port 3000 (macOS/Linux)
lsof -ti:3000 | xargs kill -9

# Or use a different port
npm run dev -- -p 3001
```

---

## 📚 Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs)

---

## 🤝 Contributing

### For Contributors

If you're contributing to the project, follow **Path 2** (Active Development) above to set up your own Supabase project.

**Workflow**:
1. Create your own Supabase project (don't use production)
2. Create a feature branch
3. Make your changes
4. Create a migration if database changes are needed
5. Update types: `npm run db:types`
6. Test thoroughly in your environment
7. Commit with clear messages

### Sharing Your Work

When sharing with non-developers or for demos:
- Simply provide your `.env` file (they follow **Path 1**)
- They don't need Supabase access or to be added to your project

---

## 👨‍💻 Author

Built by Jeremiah Ramiscal for the Mo-Something Activity

---

**Need Help?** Check the troubleshooting section or review the [Supabase Workflow Guide](.cursor/rules/supabase_workflow.mdc).
