# 🌱 Database Seeding Scripts

## Seed Test Data

This script populates your database with realistic test data for development and testing.

### What It Creates:

- **3 Sample Surveys** (Product Feedback, Customer Satisfaction, Onboarding)
- **1 Survey Version** (v2.0 of first survey)
- **40-50 Sample Responses** (spread across surveys)
- **All Activity Feed Events** (SURVEY_CREATED, RESPONSE_RECEIVED, SURVEY_UPDATED)
- **AI Analysis Data** (sentiment + summaries for all responses)

### Sentiment Distribution:
- 3 Positive responses
- 2 Neutral responses  
- 2 Negative responses
- 1 Mixed response

### How to Run:

#### Step 1: Install Dependencies
```bash
npm install
```

#### Step 2: Set Environment Variables
Make sure you have `.env.local` with:
```bash
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
# OR
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

#### Step 3: Run the Seed Script
```bash
npm run db:seed
```

### Expected Output:

```
🌱 Starting data seeding...

📋 Creating sample surveys...
  ✅ Created: Product Feedback Survey (v1.0)
     Added 4 questions
  ✅ Created: Customer Satisfaction Survey (v1.0)
     Added 4 questions
  ✅ Created: Onboarding Experience Survey (v1.0)
     Added 3 questions

💬 Creating sample responses...
  ✅ Product Feedback Survey: 8 responses
  ✅ Customer Satisfaction Survey: 7 responses
  ✅ Onboarding Experience Survey: 6 responses

🔄 Creating survey version...
  ✅ Created v2.0 of "Product Feedback Survey"

✨ Seeding complete!

📊 Summary:
   Surveys created: 4 (including 1 version)
   Responses created: 21
   Activity events logged: 25

🎉 Your database is now populated with test data!

💡 Next steps:
   1. Visit: http://localhost:3000/mojeremiah
   2. Check the Insights tab
   3. View individual survey analytics
   4. Test real-time updates by submitting new responses
```

### Verify the Data:

**Check Surveys:**
```bash
npm run db:studio
# Then: SELECT * FROM surveys;
```

**Check Responses:**
```sql
SELECT s.title, COUNT(r.id) as response_count
FROM surveys s
LEFT JOIN responses r ON s.id = r.survey_id
GROUP BY s.id, s.title;
```

**Check Activity Feed:**
```sql
SELECT type, COUNT(*) as count
FROM activity_feed
GROUP BY type;
```

### Clean Up (Optional):

If you want to remove all test data:

```sql
-- Delete in this order (respects foreign keys)
DELETE FROM activity_feed WHERE org_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM responses WHERE org_id = '00000000-0000-0000-0000-000000000001';
DELETE FROM survey_questions WHERE survey_id IN (
  SELECT id FROM surveys WHERE org_id = '00000000-0000-0000-0000-000000000001'
);
DELETE FROM surveys WHERE org_id = '00000000-0000-0000-0000-000000000001';
```

### Troubleshooting:

**Error: Missing Supabase credentials**
- Make sure `.env.local` exists and has correct values
- Try: `cp .env.example .env.local` (if you have an example file)

**Error: Foreign key constraint**
- Run clean up script above
- Or reset database: `supabase db reset` (warning: deletes ALL data)

**Error: tsx not found**
- Run: `npm install`
- Make sure `tsx` is in devDependencies

### Customize the Seed Data:

Edit `seed-test-data.ts` to:
- Add more surveys
- Change response counts
- Adjust sentiment distribution
- Add custom questions
- Modify timestamps

