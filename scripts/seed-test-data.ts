/**
 * Seed Test Data Script
 * 
 * Populates database with sample surveys, responses, and activity feed events
 * for testing analytics and insights features.
 * 
 * Run with: npm run db:seed
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { join } from 'path';
import type { Database } from '../src/types/supabase';

// Load environment variables from .env file
const envPath = join(process.cwd(), '.env');
try {
  const envFile = readFileSync(envPath, 'utf-8');
  envFile.split('\n').forEach(line => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '').split('#')[0].trim();
      if (value) {
        process.env[key.trim()] = value;
      }
    }
  });
  console.log('✅ Loaded environment variables from .env\n');
} catch (error) {
  console.log('⚠️  No .env file found, using existing environment variables\n');
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or NEXT_PUBLIC_SUPABASE_ANON_KEY)');
  process.exit(1);
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceKey);

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';

// Sample survey data
const sampleSurveys = [
  {
    title: 'Product Feedback Survey',
    description: 'Help us improve our product with your valuable feedback',
    audience: 'Product Users',
    questions: [
      { type: 'rating', question: 'How would you rate your overall experience with our product?', position: 0 },
      { type: 'multiple_choice', question: 'What feature do you use most frequently?', options: ['Dashboard', 'Reports', 'Analytics', 'Settings'], position: 1 },
      { type: 'long_text', question: 'What improvements would you like to see?', position: 2 },
      { type: 'yes_no', question: 'Would you recommend our product to others?', position: 3 },
    ]
  },
  {
    title: 'Customer Satisfaction Survey',
    description: 'We value your opinion about our service',
    audience: 'All Customers',
    questions: [
      { type: 'rating', question: 'How satisfied are you with our customer service?', position: 0 },
      { type: 'short_text', question: 'What did you like most about our service?', position: 1 },
      { type: 'short_text', question: 'What could we improve?', position: 2 },
      { type: 'rating', question: 'How likely are you to use our service again?', position: 3 },
    ]
  },
  {
    title: 'Onboarding Experience Survey',
    description: 'Tell us about your onboarding experience',
    audience: 'New Users',
    questions: [
      { type: 'rating', question: 'How clear was the onboarding process?', position: 0 },
      { type: 'multiple_choice', question: 'Which onboarding step was most helpful?', options: ['Welcome Tutorial', 'Feature Tour', 'Setup Guide', 'Video Demos'], position: 1 },
      { type: 'long_text', question: 'What questions were left unanswered?', position: 2 },
    ]
  }
];

// Sample responses for different sentiments
const sampleResponses = [
  // Positive responses
  {
    sentiment: 'positive',
    answers: {
      rating: '5',
      text: 'Excellent service! The team was very helpful and responsive. I really appreciate the quick turnaround time.',
      yesno: 'Yes',
      choice: 'Dashboard'
    }
  },
  {
    sentiment: 'positive',
    answers: {
      rating: '5',
      text: 'Great experience overall. The product is intuitive and easy to use. Love the new features!',
      yesno: 'Yes',
      choice: 'Analytics'
    }
  },
  {
    sentiment: 'positive',
    answers: {
      rating: '4',
      text: 'Very satisfied with the service. The interface is clean and everything works smoothly.',
      yesno: 'Yes',
      choice: 'Reports'
    }
  },
  // Neutral responses
  {
    sentiment: 'neutral',
    answers: {
      rating: '3',
      text: 'It works as expected. Nothing special but gets the job done.',
      yesno: 'Maybe',
      choice: 'Settings'
    }
  },
  {
    sentiment: 'neutral',
    answers: {
      rating: '3',
      text: 'Average experience. Some features are good, others could be better.',
      yesno: 'Not sure',
      choice: 'Dashboard'
    }
  },
  // Negative responses
  {
    sentiment: 'negative',
    answers: {
      rating: '2',
      text: 'Disappointed with the response time. The interface is confusing and hard to navigate.',
      yesno: 'No',
      choice: 'Settings'
    }
  },
  {
    sentiment: 'negative',
    answers: {
      rating: '1',
      text: 'Poor experience. Too many bugs and the support is slow to respond.',
      yesno: 'No',
      choice: 'Dashboard'
    }
  },
  // Mixed responses
  {
    sentiment: 'mixed',
    answers: {
      rating: '3',
      text: 'Good features but terrible performance. Love the design but hate the loading times.',
      yesno: 'Maybe',
      choice: 'Analytics'
    }
  }
];

// Helper to generate realistic timestamps (spread over last 7 days)
function getRandomPastDate(daysAgo: number) {
  const now = new Date();
  const randomDays = Math.random() * daysAgo;
  return new Date(now.getTime() - randomDays * 24 * 60 * 60 * 1000).toISOString();
}

// Helper to get AI summary based on sentiment
function getAISummary(sentiment: string): string {
  const summaries = {
    positive: [
      'User expressed high satisfaction with the service quality and responsiveness.',
      'Customer provided enthusiastic feedback about product features and usability.',
      'Highly positive response indicating strong satisfaction with the experience.',
    ],
    neutral: [
      'User provided balanced feedback with both positive and neutral observations.',
      'Customer expressed moderate satisfaction with room for improvement.',
      'Neutral response indicating acceptable but unremarkable experience.',
    ],
    negative: [
      'User expressed dissatisfaction with performance and support responsiveness.',
      'Customer highlighted significant issues that need immediate attention.',
      'Negative feedback indicating problems with user experience and reliability.',
    ],
    mixed: [
      'User provided mixed feedback with both positive features and negative concerns.',
      'Customer expressed appreciation for some aspects while criticizing others.',
      'Balanced response showing both satisfaction and areas needing improvement.',
    ]
  };
  const options = summaries[sentiment as keyof typeof summaries] || summaries.neutral;
  return options[Math.floor(Math.random() * options.length)];
}

async function seedData() {
  console.log('🌱 Starting data seeding...\n');

  try {
    // 1. Create surveys
    console.log('📋 Creating sample surveys...');
    const createdSurveys = [];

    for (const surveyData of sampleSurveys) {
      // Create base survey (v1.0)
      const { data: survey, error: surveyError } = await supabase
        .from('surveys')
        .insert({
          org_id: DEFAULT_ORG_ID,
          title: surveyData.title,
          description: surveyData.description,
          audience: surveyData.audience,
          version: 1.0,
          status: 'active',
          created_at: getRandomPastDate(7),
        })
        .select()
        .single();

      if (surveyError) throw surveyError;
      if (!survey) throw new Error('Survey creation failed');

      createdSurveys.push(survey);
      console.log(`  ✅ Created: ${survey.title} (v${survey.version})`);

      // Create questions for survey
      for (const questionData of surveyData.questions) {
        const { error: questionError } = await supabase
          .from('survey_questions')
          .insert({
            survey_id: survey.id,
            type: questionData.type as any,
            question: questionData.question,
            options: questionData.options || null,
            position: questionData.position,
            required: true,
          });

        if (questionError) throw questionError;
      }

      // Log survey creation to activity feed
      await supabase
        .from('activity_feed')
        .insert({
          org_id: DEFAULT_ORG_ID,
          type: 'SURVEY_CREATED',
          details: {
            survey_id: survey.id,
            survey_title: survey.title,
            version: survey.version,
            audience: survey.audience,
          },
          created_at: survey.created_at,
        });

      console.log(`     Added ${surveyData.questions.length} questions`);
    }

    // 2. Create responses for each survey
    console.log('\n💬 Creating sample responses...');
    let totalResponses = 0;

    for (const survey of createdSurveys) {
      // Fetch questions for this survey
      const { data: questions } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', survey.id)
        .order('position');

      if (!questions) continue;

      // Create 5-10 responses per survey
      const responseCount = 5 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < responseCount; i++) {
        const sampleResponse = sampleResponses[Math.floor(Math.random() * sampleResponses.length)];
        
        // Build answers object matching questions
        const answers: Record<string, string> = {};
        questions.forEach((q) => {
          if (q.type === 'rating') {
            answers[q.id.toString()] = sampleResponse.answers.rating;
          } else if (q.type === 'yes_no') {
            answers[q.id.toString()] = sampleResponse.answers.yesno;
          } else if (q.type === 'multiple_choice') {
            answers[q.id.toString()] = sampleResponse.answers.choice;
          } else {
            answers[q.id.toString()] = sampleResponse.answers.text;
          }
        });

        const responseTimestamp = getRandomPastDate(5);

        // Create response
        const { data: response, error: responseError } = await supabase
          .from('responses')
          .insert({
            org_id: DEFAULT_ORG_ID,
            survey_id: survey.id,
            answers: answers,
            sentiment: sampleResponse.sentiment,
            summary: getAISummary(sampleResponse.sentiment),
            created_at: responseTimestamp,
          })
          .select()
          .single();

        if (responseError) throw responseError;
        if (!response) continue;

        // Log response to activity feed
        await supabase
          .from('activity_feed')
          .insert({
            org_id: DEFAULT_ORG_ID,
            type: 'RESPONSE_RECEIVED',
            details: {
              survey_id: survey.id,
              survey_title: survey.title,
              response_id: response.id,
              sentiment: response.sentiment,
            },
            created_at: responseTimestamp,
          });

        totalResponses++;
      }

      console.log(`  ✅ ${survey.title}: ${responseCount} responses`);
    }

    // 3. Create a version 2.0 of the first survey
    console.log('\n🔄 Creating survey version...');
    const firstSurvey = createdSurveys[0];
    
    const { data: v2Survey, error: v2Error } = await supabase
      .from('surveys')
      .insert({
        org_id: DEFAULT_ORG_ID,
        title: firstSurvey.title,
        description: firstSurvey.description + ' (Updated)',
        audience: firstSurvey.audience,
        version: 2.0,
        parent_id: firstSurvey.id,
        changelog: 'Updated questions and added new options',
        status: 'active',
        created_at: getRandomPastDate(2),
      })
      .select()
      .single();

    if (v2Error) throw v2Error;
    if (v2Survey) {
      // Copy questions from v1 with slight modifications
      const { data: v1Questions } = await supabase
        .from('survey_questions')
        .select('*')
        .eq('survey_id', firstSurvey.id);

      if (v1Questions) {
        for (const q of v1Questions) {
          await supabase
            .from('survey_questions')
            .insert({
              survey_id: v2Survey.id,
              type: q.type,
              question: q.question,
              options: q.options,
              position: q.position,
              required: q.required,
            });
        }
      }

      // Log survey update
      await supabase
        .from('activity_feed')
        .insert({
          org_id: DEFAULT_ORG_ID,
          type: 'SURVEY_UPDATED',
          details: {
            survey_id: v2Survey.id,
            survey_title: v2Survey.title,
            version: v2Survey.version,
            parent_version: firstSurvey.version,
            changelog: v2Survey.changelog,
          },
          created_at: v2Survey.created_at,
        });

      console.log(`  ✅ Created v2.0 of "${firstSurvey.title}"`);
    }

    // Summary
    console.log('\n✨ Seeding complete!\n');
    console.log('📊 Summary:');
    console.log(`   Surveys created: ${createdSurveys.length + 1} (including 1 version)`);
    console.log(`   Responses created: ${totalResponses}`);
    console.log(`   Activity events logged: ${createdSurveys.length + totalResponses + 1}`);
    console.log('\n🎉 Your database is now populated with test data!');
    console.log('\n💡 Next steps:');
    console.log('   1. Visit: http://localhost:3000/mojeremiah');
    console.log('   2. Check the Insights tab');
    console.log('   3. View individual survey analytics');
    console.log('   4. Test real-time updates by submitting new responses\n');

  } catch (error) {
    console.error('\n❌ Error seeding data:', error);
    process.exit(1);
  }
}

// Run the seed function
seedData();

