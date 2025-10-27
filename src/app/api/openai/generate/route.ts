import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'
import { generateQuestions } from '@/lib/openaiClient'
import { validateWithSchema, openAIGenerateSchema } from '@/lib/validation'

const logger = createLogger('OpenAIGenerate')

// ─────────────────────────────────────────────
// OpenAI Question Generation API Route
// ─────────────────────────────────────────────
// ✨ REFACTORED: Now uses openaiClient and validation utilities!
//
// Generates survey questions based on survey context.
// Falls back to mock questions if OpenAI API key is not configured.

export async function POST(request: NextRequest) {
  try {
    logger.info('AI question generation requested')
    
    const body = await request.json()

    // Use centralized validation
    const validation = validateWithSchema(openAIGenerateSchema, body)
    
    if (!validation.success) {
      logger.warn('Invalid request payload', { errors: validation.errors })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data',
          details: validation.errors 
        },
        { status: 400 }
      )
    }

    const { title, description, audience } = validation.data

    logger.debug('Request data received', { title, description, audience })

    // Use centralized OpenAI client
    const { questions, isMock, error: clientError } = await generateQuestions(
      title, 
      audience, 
      description || undefined
    )

    if (isMock && clientError) {
      logger.warn('Using mock questions', { title, audience, reason: clientError })
    } else if (isMock) {
      logger.info('Using mock questions (no API key)', { title, audience })
    } else {
      logger.info('OpenAI questions generated', { title, audience, questionCount: questions.length })
    }

    return NextResponse.json({
      success: true,
      questions,
      isMock,
      ...(clientError && { error: clientError })
    })

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

