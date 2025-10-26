import { NextRequest, NextResponse } from 'next/server'
import type { Question, QuestionType } from '@/types/survey'
import { createLogger } from '@/lib/logger'

const logger = createLogger('OpenAIGenerate')

// ─────────────────────────────────────────────
// OpenAI Question Generation API Route
// ─────────────────────────────────────────────
// Generates survey questions based on survey context.
// Falls back to mock questions if OpenAI API key is not configured.

interface GenerateRequest {
  title: string
  description: string
  audience: string
}

interface OpenAIQuestion {
  type: QuestionType
  text: string
  options?: string[]
}

export async function POST(request: NextRequest) {
  try {
    logger.info('AI question generation requested')
    
    const { title, description, audience }: GenerateRequest = await request.json()

    logger.debug('Request data received', { title, description, audience })

    // Validate inputs
    if (!title || !audience) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Title and audience are required' 
        },
        { status: 400 }
      )
    }

    const apiKey = process.env.OPENAI_API_KEY

    // If no API key, return mock questions
    if (!apiKey) {
      const mockQuestions = generateMockQuestions(title, audience)
      
      logger.info('OpenAI API key not configured, using mock questions', {
        title,
        audience,
        questionCount: mockQuestions.length
      })
      
      return NextResponse.json({
        success: true,
        questions: mockQuestions,
        isMock: true
      })
    }

    // Call OpenAI API
    try {
      const prompt = buildPrompt(title, description, audience)
      
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
              content: 'You are a survey design expert. Generate engaging, clear, and relevant survey questions. Return questions as a JSON array.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          response_format: { type: 'json_object' }
        })
      })

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status}`)
      }

      const data = await response.json()
      const content = data.choices[0].message.content
      const parsed = JSON.parse(content)
      
      // Extract questions from response
      const questions: OpenAIQuestion[] = parsed.questions || []
      
      // Convert to our Question format with IDs
      const formattedQuestions: Question[] = questions.map((q, idx) => ({
        id: `q-ai-${Date.now()}-${idx}`,
        type: q.type,
        text: q.text,
        options: q.options,
        required: true
      }))

      logger.info('OpenAI successfully generated questions', {
        title,
        audience,
        questionCount: formattedQuestions.length,
        model: 'gpt-4o-mini'
      })

      return NextResponse.json({
        success: true,
        questions: formattedQuestions,
        isMock: false
      })

    } catch (openaiError) {
      // Fall back to mock questions on error
      const mockQuestions = generateMockQuestions(title, audience)
      
      logger.warn('OpenAI API error, falling back to mock questions', {
        title,
        audience,
        questionCount: mockQuestions.length,
        error: openaiError instanceof Error ? openaiError.message : String(openaiError)
      })
      
      return NextResponse.json({
        success: true,
        questions: mockQuestions,
        isMock: true,
        error: 'OpenAI unavailable, using fallback questions'
      })
    }

  } catch (error) {
    logger.error('Failed to generate questions', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

// ─────────────────────────────────────────────
// Helper Functions
// ─────────────────────────────────────────────

function buildPrompt(title: string, description: string, audience: string): string {
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
- Tailor language and topics to the target audience`
}

function generateMockQuestions(title: string, audience: string): Question[] {
  return [
    {
      id: `q-mock-${Date.now()}-1`,
      type: 'rating',
      text: `How would you rate your overall experience with ${title}?`,
      required: true
    },
    {
      id: `q-mock-${Date.now()}-2`,
      type: 'multiple_choice',
      text: `What aspect is most important to you as a ${audience}?`,
      options: ['Quality', 'Speed', 'Price', 'Support'],
      required: true
    },
    {
      id: `q-mock-${Date.now()}-3`,
      type: 'yes_no',
      text: 'Would you recommend this to others?',
      required: true
    },
    {
      id: `q-mock-${Date.now()}-4`,
      type: 'long_text',
      text: 'What could we improve to better serve you?',
      required: false
    },
    {
      id: `q-mock-${Date.now()}-5`,
      type: 'short_text',
      text: 'How did you hear about us?',
      required: false
    }
  ]
}

