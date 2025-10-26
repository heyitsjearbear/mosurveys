import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import { calculateNextVersion } from '@/lib/versionUtils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('RestoreVersion')

// ─────────────────────────────────────────────
// Restore Survey Version API Route
// ─────────────────────────────────────────────
// Creates a new version from an old version's data by copying
// the old survey and questions forward as the latest version.
//
// Example: User wants to restore v1.0 when current version is v2.3
// Result: Creates v2.4 with v1.0's data (restoring old content)
//
// Note: Activity feed logging is handled automatically by database trigger.

interface RestoreVersionRequest {
  oldSurveyId: string          // The version to restore (e.g., v1.0)
  currentLatestSurveyId: string // The current latest version (e.g., v2.3)
  orgId: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { 
      oldSurveyId, 
      currentLatestSurveyId, 
      orgId 
    }: RestoreVersionRequest = await request.json()

    // Validate required fields
    if (!oldSurveyId || !currentLatestSurveyId || !orgId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Old survey ID, current survey ID, and org ID are required' 
        },
        { status: 400 }
      )
    }

    // Step 1: Fetch the old survey data (to be restored)
    const { data: oldSurvey, error: oldSurveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', oldSurveyId)
      .single()

    if (oldSurveyError || !oldSurvey) {
      logger.error('Failed to fetch old survey', oldSurveyError, {
        surveyId: oldSurveyId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Old survey version not found' 
        },
        { status: 404 }
      )
    }

    // Step 2: Fetch the current latest survey (to determine next version)
    const { data: currentSurvey, error: currentSurveyError } = await supabaseAdmin
      .from('surveys')
      .select('*')
      .eq('id', currentLatestSurveyId)
      .single()

    if (currentSurveyError || !currentSurvey) {
      logger.error('Failed to fetch current survey', currentSurveyError, {
        surveyId: currentLatestSurveyId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Current survey version not found' 
        },
        { status: 404 }
      )
    }

    // Step 3: Fetch old survey questions
    const { data: oldQuestions, error: oldQuestionsError } = await supabaseAdmin
      .from('survey_questions')
      .select('*')
      .eq('survey_id', oldSurveyId)
      .order('position', { ascending: true })

    if (oldQuestionsError) {
      logger.error('Failed to fetch old questions', oldQuestionsError, {
        surveyId: oldSurveyId
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to fetch old survey questions' 
        },
        { status: 500 }
      )
    }

    if (!oldQuestions || oldQuestions.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot restore survey with no questions' 
        },
        { status: 400 }
      )
    }

    // Step 4: Calculate next version (minor increment from current)
    const nextVersion = calculateNextVersion(currentSurvey.version, false)

    logger.info('Restoring old survey version', {
      oldSurveyId,
      oldVersion: oldSurvey.version,
      currentVersion: currentSurvey.version,
      nextVersion
    })

    // Step 5: Create new survey row with restored data
    const restoredSurvey = {
      title: oldSurvey.title,
      description: oldSurvey.description,
      audience: oldSurvey.audience,
      org_id: orgId,
      version: nextVersion,
      parent_id: currentLatestSurveyId, // Link to current latest as parent
      changelog: `Restored from v${oldSurvey.version}`,
      // Don't copy: id (auto-generated), created_at (auto), updated_at (auto)
    }

    const { data: createdSurvey, error: createError } = await supabaseAdmin
      .from('surveys')
      .insert(restoredSurvey)
      .select()
      .single()

    if (createError || !createdSurvey) {
      logger.error('Failed to create restored survey', createError, {
        oldSurveyId,
        nextVersion
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to restore survey version' 
        },
        { status: 500 }
      )
    }

    logger.info('Restored survey created', {
      newSurveyId: createdSurvey.id,
      version: createdSurvey.version,
      restoredFrom: oldSurvey.version
    })

    // Step 6: Duplicate old questions to restored survey
    const restoredQuestions = oldQuestions.map((question) => ({
      survey_id: createdSurvey.id, // Link to newly created survey
      question: question.question,
      type: question.type,
      position: question.position,
      options: question.options,
      required: question.required,
      // Don't copy: id (auto-generated), created_at (auto)
    }))

    const { error: insertQuestionsError } = await supabaseAdmin
      .from('survey_questions')
      .insert(restoredQuestions)

    if (insertQuestionsError) {
      logger.error('Failed to duplicate questions', insertQuestionsError, {
        newSurveyId: createdSurvey.id,
        questionCount: restoredQuestions.length
      })
      
      // Rollback: delete the restored survey if questions fail
      await supabaseAdmin.from('surveys').delete().eq('id', createdSurvey.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to restore survey questions' 
        },
        { status: 500 }
      )
    }

    logger.info('Questions restored successfully', {
      newSurveyId: createdSurvey.id,
      questionCount: restoredQuestions.length
    })

    // Note: Activity feed is automatically logged by database trigger
    // The trigger will log: SURVEY_EDITED with changelog "Restored from vX.X"

    // Step 7: Return success with new survey ID
    return NextResponse.json({
      success: true,
      newSurveyId: createdSurvey.id,
      newVersion: createdSurvey.version,
      restoredFrom: oldSurvey.version,
      message: `Restored version ${oldSurvey.version} as version ${createdSurvey.version}`
    })

  } catch (error) {
    logger.error('Restore version error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

