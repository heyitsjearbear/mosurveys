import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { SurveyData } from '@/types/survey'
import { surveyToDbInsert, questionToDbInsert } from '@/types/survey'
import { createLogger } from '@/lib/logger'

const logger = createLogger('SurveySave')

// ─────────────────────────────────────────────
// Survey Save API Route
// ─────────────────────────────────────────────
// Handles survey publication: validates data, saves to database,
// triggers webhook for activity feed, and returns shareable link.

interface SaveSurveyRequest {
  surveyData: SurveyData
  orgId: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { surveyData, orgId }: SaveSurveyRequest = await request.json()

    // Validate required fields
    if (!surveyData.title || !surveyData.audience || surveyData.questions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Survey must have a title, audience, and at least one question' 
        },
        { status: 400 }
      )
    }

    // Validate that all questions have text
    const emptyQuestions = surveyData.questions.filter(q => !q.text || q.text.trim() === '')
    if (emptyQuestions.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `${emptyQuestions.length} question(s) are missing text. Please fill in all questions before saving.` 
        },
        { status: 400 }
      )
    }

    if (!orgId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization ID is required' 
        },
        { status: 400 }
      )
    }

    // Step 1: Insert survey into surveys table
    const surveyInsert = surveyToDbInsert(surveyData, orgId)
    
    const { data: survey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert(surveyInsert)
      .select()
      .single()

    if (surveyError) {
      logger.error('Failed to create survey in database', surveyError, {
        surveyTitle: surveyData.title,
        orgId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create survey' 
        },
        { status: 500 }
      )
    }

    logger.info('Survey created successfully', { 
      surveyId: survey.id, 
      title: survey.title 
    })

    // Step 2: Insert questions into survey_questions table
    const questionsToInsert = surveyData.questions.map((question, index) =>
      questionToDbInsert(question, survey.id, index)
    )

    const { error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      logger.error('Failed to create survey questions', questionsError, {
        surveyId: survey.id,
        questionCount: questionsToInsert.length,
        errorMessage: questionsError.message,
        errorDetails: questionsError.details,
        questionsData: questionsToInsert
      })
      // Rollback: delete the survey if questions fail
      await supabaseAdmin.from('surveys').delete().eq('id', survey.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create survey questions' 
        },
        { status: 500 }
      )
    }

    // Step 3: Trigger webhook for activity feed
    try {
      const webhookUrl = `${request.nextUrl.origin}/api/webhook/sync`
      
      const webhookPayload = {
        type: 'SURVEY_CREATED',
        survey_id: survey.id,
        org_id: orgId,
        details: {
          survey_title: survey.title,
          question_count: surveyData.questions.length,
          audience: survey.audience
        }
      }
      
      logger.debug('Calling webhook to log activity', { 
        webhookUrl, 
        eventType: 'SURVEY_CREATED' 
      })
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      })
      
      const webhookResult = await webhookResponse.json()
      
      if (!webhookResponse.ok) {
        logger.warn('Webhook call failed', {
          status: webhookResponse.status,
          result: webhookResult
        })
      } else {
        logger.debug('Webhook completed successfully', { result: webhookResult })
      }
    } catch (webhookError) {
      // Log but don't fail - survey was created successfully
      logger.warn('Webhook call failed (non-critical)', {
        surveyId: survey.id,
        error: webhookError instanceof Error ? webhookError.message : String(webhookError)
      })
    }

    // Step 4: Return success with survey ID and shareable link
    const shareableLink = `${request.nextUrl.origin}/mojeremiah/respond/${survey.id}`

    return NextResponse.json({
      success: true,
      survey: {
        id: survey.id,
        title: survey.title,
        shareableLink
      }
    })

  } catch (error) {
    logger.error('Survey save error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

