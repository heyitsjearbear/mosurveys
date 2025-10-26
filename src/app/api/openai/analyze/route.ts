import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { createLogger } from '@/lib/logger';

const logger = createLogger('OpenAIAnalyze');

// ─────────────────────────────────────────────
// OpenAI Sentiment Analysis API Route
// ─────────────────────────────────────────────
// Analyzes survey responses for sentiment and generates summaries.
// Falls back to mock analysis if OpenAI API key is not configured.

interface AnalyzeRequest {
  responseId: string;
  surveyId: string;
  answers: Record<string, string>;
}

interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  summary: string;
}

export async function POST(request: NextRequest) {
  try {
    logger.info('AI sentiment analysis requested');
    
    const { responseId, surveyId, answers }: AnalyzeRequest = await request.json();

    logger.debug('Analysis request received', { 
      responseId, 
      surveyId,
      answerCount: Object.keys(answers).length 
    });

    // Validate inputs
    if (!responseId || !surveyId || !answers) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Response ID, survey ID, and answers are required' 
        },
        { status: 400 }
      );
    }

    // Combine all answers into a single text for analysis
    const combinedText = Object.values(answers)
      .filter(answer => answer && answer.trim().length > 0)
      .join(' | ');

    if (!combinedText || combinedText.trim().length === 0) {
      logger.warn('No text content to analyze', { responseId });
      return NextResponse.json(
        { 
          success: false, 
          error: 'No text content to analyze' 
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENAI_API_KEY;

    let analysis: AnalysisResult;

    // If no API key, use mock analysis
    if (!apiKey) {
      analysis = generateMockAnalysis(combinedText);
      
      logger.info('OpenAI API key not configured, using mock analysis', {
        responseId,
        sentiment: analysis.sentiment
      });
    } else {
      // Call OpenAI API for real analysis
      try {
        analysis = await analyzeWithOpenAI(combinedText, apiKey);
        
        logger.info('OpenAI successfully analyzed response', {
          responseId,
          sentiment: analysis.sentiment,
          model: 'gpt-4o-mini'
        });
      } catch (openaiError) {
        // Fall back to mock analysis on error
        analysis = generateMockAnalysis(combinedText);
        
        logger.warn('OpenAI API error, falling back to mock analysis', {
          responseId,
          sentiment: analysis.sentiment,
          error: openaiError instanceof Error ? openaiError.message : String(openaiError)
        });
      }
    }

    // Update the response in database with sentiment and summary
    const { error: updateError } = await supabase
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
      analysis
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

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

async function analyzeWithOpenAI(text: string, apiKey: string): Promise<AnalysisResult> {
  const prompt = buildAnalysisPrompt(text);
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'You are a sentiment analysis expert. Analyze survey responses and provide clear, concise summaries. Return results as JSON only.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  const data = await response.json();
  const content = data.choices[0].message.content;
  const parsed = JSON.parse(content);
  
  return {
    sentiment: parsed.sentiment || 'neutral',
    summary: parsed.summary || 'No summary available'
  };
}

function buildAnalysisPrompt(text: string): string {
  return `Analyze the sentiment of this survey response and generate a brief summary.

Response text: "${text}"

Return a JSON object with this exact structure:
{
  "sentiment": "positive",
  "summary": "Brief one-sentence summary of the key points or sentiment"
}

Sentiment options: "positive", "negative", "neutral", or "mixed"

Rules:
- "positive" = clearly positive feedback, satisfaction, praise
- "negative" = clearly negative feedback, dissatisfaction, complaints  
- "neutral" = factual, balanced, or no strong sentiment
- "mixed" = contains both positive and negative elements

Summary should be 1-2 sentences maximum and capture the main theme or feeling.`;
}

function generateMockAnalysis(text: string): AnalysisResult {
  // Simple keyword-based mock analysis
  const lowerText = text.toLowerCase();
  
  // Positive keywords
  const positiveWords = ['great', 'excellent', 'good', 'love', 'amazing', 'perfect', 'happy', 'satisfied', 'wonderful', 'fantastic'];
  const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
  
  // Negative keywords
  const negativeWords = ['bad', 'poor', 'terrible', 'awful', 'hate', 'disappointed', 'frustrated', 'angry', 'unhappy', 'worst'];
  const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
  
  let sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  let summary: string;
  
  if (positiveCount > negativeCount && positiveCount > 0) {
    sentiment = 'positive';
    summary = 'User expressed positive feedback and satisfaction with the experience.';
  } else if (negativeCount > positiveCount && negativeCount > 0) {
    sentiment = 'negative';
    summary = 'User expressed concerns or dissatisfaction that should be addressed.';
  } else if (positiveCount > 0 && negativeCount > 0) {
    sentiment = 'mixed';
    summary = 'User provided balanced feedback with both positive aspects and areas for improvement.';
  } else {
    sentiment = 'neutral';
    summary = 'User provided factual feedback without strong positive or negative sentiment.';
  }
  
  return { sentiment, summary };
}

