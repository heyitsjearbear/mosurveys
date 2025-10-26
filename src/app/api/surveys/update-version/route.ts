import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { SurveyData } from '@/types/survey'
import { questionToDbInsert } from '@/types/survey'
import { calculateNextVersion } from '@/lib/versionUtils'
import { createLogger } from '@/lib/logger'

const logger = createLogger('UpdateVersion')

// ─────────────────────────────────────────────
// Update Survey Version API Route
// ─────────────────────────────────────────────
// Saves edited survey data by creating a NEW survey row (not UPDATE)
// with an incremented version number and updated content.
//
// This creates a complete new version, preserving the original
// survey and its responses intact.
//
// Note: Activity feed logging is handled automatically by database trigger.

interface UpdateVersionRequest {
  surveyData: SurveyData
  orgId: string
  parentId: string
  currentVersion: number
  isMajorVersion?: boolean
  changelog?: string
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const { 
      surveyData, 
      orgId, 
      parentId,
      currentVersion,
      isMajorVersion = false,
      changelog = 'No changelog provided'
    }: UpdateVersionRequest = await request.json()

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

    if (!orgId || !parentId) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Organization ID and parent ID are required' 
        },
        { status: 400 }
      )
    }

    // Step 1: Calculate next version number
    const nextVersion = calculateNextVersion(currentVersion, isMajorVersion)

    logger.info('Creating new survey version with edited data', {
      parentId,
      currentVersion,
      nextVersion,
      isMajorVersion
    })

    // Step 2: Insert NEW survey row with edited data and incremented version
    const newSurvey = {
      title: surveyData.title,
      description: surveyData.description || null,
      audience: surveyData.audience,
      org_id: orgId,
      version: nextVersion,
      parent_id: parentId, // Link to parent survey
      changelog: changelog,
      // id, created_at, updated_at are auto-generated
    }

    const { data: createdSurvey, error: surveyError } = await supabaseAdmin
      .from('surveys')
      .insert(newSurvey)
      .select()
      .single()

    if (surveyError || !createdSurvey) {
      logger.error('Failed to create new survey version', surveyError, {
        parentId,
        nextVersion,
        surveyTitle: surveyData.title
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
      title: createdSurvey.title
    })

    // Step 3: Insert edited questions into survey_questions table
    const questionsToInsert = surveyData.questions.map((question, index) =>
      questionToDbInsert(question, createdSurvey.id, index)
    )

    const { error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      logger.error('Failed to create survey questions', questionsError, {
        surveyId: createdSurvey.id,
        questionCount: questionsToInsert.length
      })
      
      // Rollback: delete the survey if questions fail
      await supabaseAdmin.from('surveys').delete().eq('id', createdSurvey.id)
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create survey questions' 
        },
        { status: 500 }
      )
    }

    logger.info('Survey questions created successfully', {
      surveyId: createdSurvey.id,
      questionCount: questionsToInsert.length
    })

    // Note: Activity feed is automatically logged by database trigger
    // The trigger detects parent_id and logs as SURVEY_EDITED with changelog

    // Step 4: Return success with new survey ID and shareable link
    const shareableLink = `${request.nextUrl.origin}/mojeremiah/respond/${createdSurvey.id}`

    return NextResponse.json({
      success: true,
      survey: {
        id: createdSurvey.id,
        title: createdSurvey.title,
        version: createdSurvey.version,
        parentId: createdSurvey.parent_id,
        shareableLink
      },
      message: `Survey updated to version ${createdSurvey.version}`
    })

  } catch (error) {
    logger.error('Update version error', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

