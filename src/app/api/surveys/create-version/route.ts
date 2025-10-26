import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { calculateNextVersion } from '@/lib/versionUtils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('CreateVersion')

// ─────────────────────────────────────────────
// Create Survey Version API Route
// ─────────────────────────────────────────────
// Creates a new version of an existing survey by duplicating
// the original survey and questions with an incremented version number.
//
// This is the first step when editing a survey - it creates the
// new version row that will be populated with edited data.
//
// Note: Activity feed logging is handled automatically by database trigger.

interface CreateVersionRequest {
  originalSurveyId: string
  isMajorVersion?: boolean
  changelog?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { 
      originalSurveyId, 
      isMajorVersion = false,
      changelog = 'No changelog provided' 
    }: CreateVersionRequest = await request.json()

    // Validate required fields
    if (!originalSurveyId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Original survey ID is required' 
        },
        { status: 400 }
      )
    }

    // Step 1: Fetch original survey
    const { data: originalSurvey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', originalSurveyId)
      .single()

    if (surveyError || !originalSurvey) {
      logger.error('Failed to fetch original survey', surveyError, {
        surveyId: originalSurveyId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Survey not found' 
        },
        { status: 404 }
      )
    }

    logger.info('Original survey fetched', {
      surveyId: originalSurvey.id,
      currentVersion: originalSurvey.version
    })

    // Step 2: Fetch original questions
    const { data: originalQuestions, error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .select('*')
      .eq('survey_id', originalSurveyId)
      .order('position', { ascending: true })

    if (questionsError) {
      logger.error('Failed to fetch original questions', questionsError, {
        surveyId: originalSurveyId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch survey questions' 
        },
        { status: 500 }
      )
    }

    if (!originalQuestions || originalQuestions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot create version of survey with no questions' 
        },
        { status: 400 }
      )
    }

    // Step 3: Calculate next version number
    const nextVersion = calculateNextVersion(originalSurvey.version, isMajorVersion)

    logger.info('Calculated next version', {
      currentVersion: originalSurvey.version,
      nextVersion,
      isMajorVersion
    })

    // Step 4: Create new survey row with incremented version
    // Note: We use the original survey's ID as parent_id to maintain lineage
    const newSurvey = {
      title: originalSurvey.title,
      description: originalSurvey.description,
      audience: originalSurvey.audience,
      org_id: originalSurvey.org_id,
      version: nextVersion,
      parent_id: originalSurvey.id, // Link to original survey
      changelog: changelog,
      // Don't copy: id (auto-generated), created_at (auto), updated_at (auto)
    }

    const { data: createdSurvey, error: createError } = await supabaseAdmin
      .from('surveys')
      .insert(newSurvey)
      .select()
      .single()

    if (createError || !createdSurvey) {
      logger.error('Failed to create new survey version', createError, {
        originalSurveyId,
        nextVersion
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create new survey version' 
        },
        { status: 500 }
      )
    }

    logger.info('New survey version created', {
      newSurveyId: createdSurvey.id,
      version: createdSurvey.version,
      parentId: createdSurvey.parent_id
    })

    // Step 5: Duplicate questions for new survey version
    const newQuestions = originalQuestions.map((question) => ({
      survey_id: createdSurvey.id, // Link to new survey
      question: question.question,
      type: question.type,
      position: question.position,
      options: question.options,
      required: question.required,
      // Don't copy: id (auto-generated), created_at (auto)
    }))

    const { error: insertQuestionsError } = await supabaseAdmin
      .from('survey_questions')
      .insert(newQuestions)

    if (insertQuestionsError) {
      logger.error('Failed to duplicate questions', insertQuestionsError, {
        newSurveyId: createdSurvey.id,
        questionCount: newQuestions.length
      })
      
      // Rollback: delete the new survey if questions fail
      await supabaseAdmin.from('surveys').delete().eq('id', createdSurvey.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to duplicate survey questions' 
        },
        { status: 500 }
      )
    }

    logger.info('Questions duplicated successfully', {
      newSurveyId: createdSurvey.id,
      questionCount: newQuestions.length
    })

    // Note: Activity feed is automatically logged by database trigger
    // (no manual webhook call needed)

    // Step 6: Return success with new survey ID
    return NextResponse.json({
      success: true,
      newSurveyId: createdSurvey.id,
      newVersion: createdSurvey.version,
      parentId: createdSurvey.parent_id,
      message: `Created ${isMajorVersion ? 'major' : 'minor'} version ${createdSurvey.version}`
    })

  } catch (error) {
    logger.error('Create version error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

