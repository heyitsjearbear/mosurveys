/**
 * OpenAI Client
 * ────────────────────────────────────────────────────
 * Centralized OpenAI API client with consistent error handling.
 * 
 * Why this file exists:
 * - Single source of truth for OpenAI configuration
 * - Consistent error handling and fallback logic
 * - Easy to mock for testing
 * - Easy to add features like caching, rate limiting, retry logic
 * - Abstraction layer: can swap AI providers without changing route logic
 */

import { createLogger } from '@/lib/logger';
import type { Question, QuestionType } from '@/types/survey';

const logger = createLogger('OpenAIClient');

/**
 * OpenAI Configuration
 * ────────────────────────────────────────────────────
 */
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';
const OPENAI_MODEL = 'gpt-4o-mini';

/**
 * Analysis Result Interface
 * ────────────────────────────────────────────────────
 */
export interface AnalysisResult {
  sentiment: 'positive' | 'negative' | 'neutral' | 'mixed';
  summary: string;
}

/**
 * OpenAI Question Interface (raw from API)
 * ────────────────────────────────────────────────────
 */
interface OpenAIQuestion {
  type: QuestionType;
  text: string;
  options?: string[] | null;
}

/**
 * Generate Survey Questions with OpenAI
 * ────────────────────────────────────────────────────
 * Generates survey questions based on survey context.
 * Falls back to mock questions if API key is missing or request fails.
 * 
 * @param title - Survey title
 * @param audience - Target audience
 * @param description - Optional survey description
 * @returns Array of generated questions
 */
export async function generateQuestions(
  title: string,
  audience: string,
  description?: string
): Promise<{ questions: Question[]; isMock: boolean; error?: string }> {
  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, use mock questions
  if (!apiKey) {
    logger.info('OpenAI API key not configured, using mock questions', {
      title,
      audience,
    });
    
    const mockQuestions = generateMockQuestions(title, audience);
    return { questions: mockQuestions, isMock: true };
  }

  // Call OpenAI API
  try {
    logger.debug('Requesting question generation from OpenAI', { 
      title, 
      audience,
      model: OPENAI_MODEL 
    });
    
    const prompt = buildQuestionGenerationPrompt(title, audience, description);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a survey design expert. Generate engaging, clear, and relevant survey questions. Return questions as a JSON array.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.7,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    // Extract questions from response
    const openAIQuestions: OpenAIQuestion[] = parsed.questions || [];

    // Convert to our Question format with IDs
    const formattedQuestions: Question[] = openAIQuestions.map((q, idx) => ({
      id: `q-ai-${Date.now()}-${idx}`,
      type: q.type,
      text: q.text,
      options: q.options || undefined,
      required: true,
    }));

    logger.info('OpenAI successfully generated questions', {
      title,
      audience,
      questionCount: formattedQuestions.length,
      model: OPENAI_MODEL,
    });

    return { questions: formattedQuestions, isMock: false };
  } catch (error) {
    // Fall back to mock questions on error
    logger.warn('OpenAI API error, falling back to mock questions', {
      title,
      audience,
      error: error instanceof Error ? error.message : String(error),
    });

    const mockQuestions = generateMockQuestions(title, audience);
    return {
      questions: mockQuestions,
      isMock: true,
      error: 'OpenAI unavailable, using fallback questions',
    };
  }
}

/**
 * Analyze Response Sentiment with OpenAI
 * ────────────────────────────────────────────────────
 * Analyzes survey responses for sentiment and generates summaries.
 * Falls back to mock analysis if API key is missing or request fails.
 * 
 * @param answers - Record of question IDs to answer text
 * @returns Analysis result with sentiment and summary
 */
export async function analyzeSentiment(
  answers: Record<string, string>
): Promise<{ analysis: AnalysisResult; isMock: boolean; error?: string }> {
  // Combine all answers into a single text for analysis
  const combinedText = Object.values(answers)
    .filter((answer) => answer && answer.trim().length > 0)
    .join(' | ');

  if (!combinedText || combinedText.trim().length === 0) {
    logger.warn('No text content to analyze');
    throw new Error('No text content to analyze');
  }

  const apiKey = process.env.OPENAI_API_KEY;

  // If no API key, use mock analysis
  if (!apiKey) {
    logger.info('OpenAI API key not configured, using mock analysis');
    
    const mockAnalysis = generateMockAnalysis(combinedText);
    return { analysis: mockAnalysis, isMock: true };
  }

  // Call OpenAI API for real analysis
  try {
    logger.debug('Requesting sentiment analysis from OpenAI', {
      textLength: combinedText.length,
      model: OPENAI_MODEL,
    });
    
    const prompt = buildSentimentAnalysisPrompt(combinedText);
    
    const response = await fetch(OPENAI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: [
          {
            role: 'system',
            content:
              'You are a sentiment analysis expert. Analyze survey responses and provide clear, concise summaries. Return results as JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        temperature: 0.3,
        response_format: { type: 'json_object' },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    const analysis: AnalysisResult = {
      sentiment: parsed.sentiment || 'neutral',
      summary: parsed.summary || 'No summary available',
    };

    logger.info('OpenAI successfully analyzed sentiment', {
      sentiment: analysis.sentiment,
      model: OPENAI_MODEL,
    });

    return { analysis, isMock: false };
  } catch (error) {
    // Fall back to mock analysis on error
    logger.warn('OpenAI API error, falling back to mock analysis', {
      error: error instanceof Error ? error.message : String(error),
    });

    const mockAnalysis = generateMockAnalysis(combinedText);
    return {
      analysis: mockAnalysis,
      isMock: true,
      error: 'OpenAI unavailable, using fallback analysis',
    };
  }
}

/**
 * Build Question Generation Prompt
 * ────────────────────────────────────────────────────
 * @param title - Survey title
 * @param audience - Target audience
 * @param description - Optional description
 * @returns Formatted prompt
 */
function buildQuestionGenerationPrompt(
  title: string,
  audience: string,
  description?: string
): string {
  return `Generate 5 engaging survey questions for the following survey:

Title: ${title}
Target Audience: ${audience}
${description ? `Description: ${description}` : ''}

Return a JSON object with this exact structure:
{
  "questions": [
    {
      "type": "rating",
      "text": "How would you rate your experience?",
      "options": null
    },
    {
      "type": "multiple_choice",
      "text": "What did you like most?",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"]
    }
  ]
}

Valid question types: "short_text", "long_text", "multiple_choice", "rating", "yes_no"

Requirements:
- Create 5 diverse questions using different question types
- Questions should be clear, specific, and relevant to the survey context
- Multiple choice questions must have 3-5 options
- Include at least one open-ended question (short_text or long_text)
- Tailor language and topics to the target audience`;
}

/**
 * Build Sentiment Analysis Prompt
 * ────────────────────────────────────────────────────
 * @param text - Combined response text
 * @returns Formatted prompt
 */
function buildSentimentAnalysisPrompt(text: string): string {
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

/**
 * Generate Mock Questions (Fallback)
 * ────────────────────────────────────────────────────
 * @param title - Survey title
 * @param audience - Target audience
 * @returns Array of mock questions
 */
function generateMockQuestions(title: string, audience: string): Question[] {
  return [
    {
      id: `q-mock-${Date.now()}-1`,
      type: 'rating',
      text: `How would you rate your overall experience with ${title}?`,
      required: true,
    },
    {
      id: `q-mock-${Date.now()}-2`,
      type: 'multiple_choice',
      text: `What aspect is most important to you as a ${audience}?`,
      options: ['Quality', 'Speed', 'Price', 'Support'],
      required: true,
    },
    {
      id: `q-mock-${Date.now()}-3`,
      type: 'yes_no',
      text: 'Would you recommend this to others?',
      required: true,
    },
    {
      id: `q-mock-${Date.now()}-4`,
      type: 'long_text',
      text: 'What could we improve to better serve you?',
      required: false,
    },
    {
      id: `q-mock-${Date.now()}-5`,
      type: 'short_text',
      text: 'How did you hear about us?',
      required: false,
    },
  ];
}

/**
 * Generate Mock Analysis (Fallback)
 * ────────────────────────────────────────────────────
 * Simple keyword-based sentiment detection
 * 
 * @param text - Response text
 * @returns Mock analysis result
 */
function generateMockAnalysis(text: string): AnalysisResult {
  const lowerText = text.toLowerCase();

  // Positive keywords
  const positiveWords = [
    'great',
    'excellent',
    'good',
    'love',
    'amazing',
    'perfect',
    'happy',
    'satisfied',
    'wonderful',
    'fantastic',
  ];
  const positiveCount = positiveWords.filter((word) => lowerText.includes(word)).length;

  // Negative keywords
  const negativeWords = [
    'bad',
    'poor',
    'terrible',
    'awful',
    'hate',
    'disappointed',
    'frustrated',
    'angry',
    'unhappy',
    'worst',
  ];
  const negativeCount = negativeWords.filter((word) => lowerText.includes(word)).length;

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
    summary =
      'User provided balanced feedback with both positive aspects and areas for improvement.';
  } else {
    sentiment = 'neutral';
    summary = 'User provided factual feedback without strong positive or negative sentiment.';
  }

  return { sentiment, summary };
}

