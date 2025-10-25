# MoSurveys 📊

A modern survey creation and management platform built with Next.js 15, TypeScript, Supabase, and OpenAI. Create surveys, collect responses, and gain AI-powered insights—all running locally.

## 🎯 Features

- **Survey Builder** - Create custom surveys with multiple question types (text, multiple choice, rating, yes/no)
- **Version Control** - Track survey changes with built-in versioning and changelog
- **Response Collection** - Collect anonymous responses via shareable links
- **AI-Powered Insights** - OpenAI integration for question suggestions and sentiment analysis
- **Real-time Updates** - Live activity feed using Supabase Realtime
- **Analytics Dashboard** - View response trends, sentiment analysis, and key metrics

## 🛠️ Tech Stack

- **Frontend**: Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Supabase (PostgreSQL + Realtime)
- **Database**: Supabase (PostgreSQL with Row Level Security)
- **AI**: OpenAI API (optional)
- **Type Safety**: Auto-generated TypeScript types from database schema

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.x or later ([Download](https://nodejs.org/))
- **npm** (comes with Node.js)
- **Supabase Account** ([Sign up free](https://supabase.com))
- **Git**

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd mosurveys
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Supabase

#### a) Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in the details:
   - **Name**: `mosurveys`
   - **Database Password**: Choose a strong password (save this!)
   - **Region**: Select closest to your location
   - **Plan**: Free (for development)

#### b) Link Your Local Project

After your Supabase project is created, get your project reference from the dashboard URL:
```
https://supabase.com/dashboard/project/YOUR_PROJECT_REF
```

Then link your local project:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
```

You'll be prompted to enter your database password.

#### c) Apply Database Migrations

Create all necessary tables by running:

```bash
npm run db:push
```

This creates the following tables:
- `surveys` - Survey definitions with versioning
- `survey_questions` - Questions belonging to surveys
- `responses` - User responses with AI analysis
- `activity_feed` - Event log for webhooks and tracking

#### d) Generate TypeScript Types

Generate type-safe interfaces from your database schema:

```bash
npm run db:types
```

This creates `src/types/supabase.ts` with all your database types.

### 4. Set Up Environment Variables

Create a `.env.local` file in the project root:

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

**⚠️ Important**: Never commit `.env.local` to version control!

### 5. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
mosurveys/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── mosurveys/         # Survey routes
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

1. Navigate to `/mosurveys/create`
2. Fill in survey title and audience
3. Add questions (text, multiple choice, rating, yes/no)
4. Save - survey is stored in Supabase
5. Share the response link: `http://localhost:3000/mosurveys/respond/[surveyId]`

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
   http://192.168.1.X:3000/mosurveys/respond/[surveyId]
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
2. Add `OPENAI_API_KEY` to `.env.local`
3. The app will automatically use AI when available, with graceful fallbacks

---

## 🔒 Security

- **Row Level Security (RLS)** enabled on all tables
- **Environment variables** for sensitive data (never committed)
- **Input validation** on all forms and API routes
- **Sanitized queries** using Supabase's built-in protections

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

This is a local development project. If extending:

1. Create a feature branch
2. Make your changes
3. Create a migration if database changes are needed
4. Update types: `npm run db:types`
5. Test thoroughly
6. Commit with clear messages

---

## 📝 License

This project is for educational and local development purposes.

---

## 👨‍💻 Author

Built by Jeremiah Ramiscal as part of the MoFlo Cloud ecosystem.

---

**Need Help?** Check the troubleshooting section or review the [Supabase Workflow Guide](.cursor/rules/supabase_workflow.mdc).
