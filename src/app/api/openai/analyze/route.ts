import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createLogger } from '@/lib/logger';
import { analyzeSentiment } from '@/lib/openaiClient';
import { validateWithSchema, openAIAnalysisSchema } from '@/lib/validation';

const logger = createLogger('OpenAIAnalyze');

// ─────────────────────────────────────────────
// OpenAI Sentiment Analysis API Route
// ─────────────────────────────────────────────

// Analyzes survey responses for sentiment and generates summaries.
// Falls back to mock analysis if OpenAI API key is not configured.

export async function POST(request: NextRequest) {
  try {
    logger.info('AI sentiment analysis requested');
    
    const body = await request.json();

    // Use centralized validation
    const validation = validateWithSchema(openAIAnalysisSchema, body);
    
    if (!validation.success) {
      logger.warn('Invalid request payload', { errors: validation.errors });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validation.errors 
        },
        { status: 400 }
      );
    }

    const { responseId, surveyId, answers } = validation.data;

    logger.debug('Analysis request received', { 
      responseId, 
      surveyId,
      answerCount: Object.keys(answers).length 
    });

    // Use centralized OpenAI client
    const { analysis, isMock, error: clientError } = await analyzeSentiment(answers);

    if (isMock && clientError) {
      logger.warn('Using mock analysis', { responseId, reason: clientError });
    } else if (isMock) {
      logger.info('Using mock analysis (no API key)', { responseId });
    } else {
      logger.info('OpenAI analysis completed', { responseId, sentiment: analysis.sentiment });
    }

    // Update the response in database with sentiment and summary
    // Using admin client to bypass RLS
    const { error: updateError } = await supabaseAdmin
      .from('responses')
      .update({
        sentiment: analysis.sentiment,
        summary: analysis.summary,
        updated_at: new Date().toISOString()
      })
      .eq('id', responseId);

    if (updateError) {
      logger.error('Failed to update response with analysis', updateError, { responseId });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to save analysis results' 
        },
        { status: 500 }
      );
    }

    logger.info('Response updated with analysis results', {
      responseId,
      sentiment: analysis.sentiment
    });

    return NextResponse.json({
      success: true,
      analysis,
      isMock
    });

  } catch (error) {
    logger.error('Failed to analyze response', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

