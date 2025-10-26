import { readFileSync } from 'fs';
import { resolve } from 'path';

// ─────────────────────────────────────────────
// Re-analyze Existing Responses Script
// ─────────────────────────────────────────────
// This script re-runs AI sentiment analysis on all existing responses
// that haven't been analyzed yet (where sentiment is NULL).

// Load environment variables from .env file
const envPath = resolve(process.cwd(), '.env');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) return;
    
    const [key, ...valueParts] = trimmedLine.split('=');
    const value = valueParts.join('=').replace(/^["']|["']$/g, '');
    
    if (key && value) {
      process.env[key] = value;
    }
  });
  
  console.log('✅ Environment variables loaded from .env');
} catch (error) {
  console.error('❌ Failed to load .env file:', error);
  process.exit(1);
}

// Import Supabase after env vars are loaded
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function reanalyzeResponses() {
  console.log('\n🔄 Re-analyzing unanalyzed responses...\n');

  try {
    // Fetch all responses that haven't been analyzed
    const { data: responses, error: fetchError } = await supabase
      .from('responses')
      .select('id, survey_id, answers')
      .is('sentiment', null); // Only get responses without sentiment

    if (fetchError) {
      throw fetchError;
    }

    if (!responses || responses.length === 0) {
      console.log('✅ All responses have already been analyzed!');
      return;
    }

    console.log(`📊 Found ${responses.length} unanalyzed response(s)\n`);

    let successCount = 0;
    let errorCount = 0;

    // Process each response
    for (const response of responses) {
      try {
        console.log(`  Analyzing response ${response.id}...`);

        // Call the AI analysis API
        const analyzeResponse = await fetch('http://localhost:3000/api/openai/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            responseId: response.id,
            surveyId: response.survey_id,
            answers: response.answers,
          }),
        });

        if (analyzeResponse.ok) {
          const data = await analyzeResponse.json();
          console.log(`  ✅ Analyzed: ${data.analysis.sentiment}`);
          successCount++;
        } else {
          const errorData = await analyzeResponse.json();
          console.log(`  ❌ Failed: ${errorData.error}`);
          errorCount++;
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (err) {
        console.log(`  ❌ Error: ${err instanceof Error ? err.message : String(err)}`);
        errorCount++;
      }
    }

    console.log('\n─────────────────────────────────────────────');
    console.log(`✅ Successfully analyzed: ${successCount}`);
    console.log(`❌ Failed: ${errorCount}`);
    console.log('─────────────────────────────────────────────\n');
  } catch (error) {
    console.error('❌ Failed to re-analyze responses:', error);
    process.exit(1);
  }
}

// Run the script
reanalyzeResponses();

