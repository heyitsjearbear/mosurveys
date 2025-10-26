import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { SurveyData } from '@/types/survey'
import { surveyToDbInsert, questionToDbInsert } from '@/types/survey'

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
      console.error('Error creating survey:', surveyError)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create survey' 
        },
        { status: 500 }
      )
    }

    // Step 2: Insert questions into survey_questions table
    const questionsToInsert = surveyData.questions.map((question, index) =>
      questionToDbInsert(question, survey.id, index)
    )

    const { error: questionsError } = await supabaseAdmin
      .from('survey_questions')
      .insert(questionsToInsert)

    if (questionsError) {
      console.error('Error creating questions:', questionsError)
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
      console.log('📡 Calling webhook:', webhookUrl)
      
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
      console.log('📦 Webhook payload:', webhookPayload)
      
      const webhookResponse = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookPayload)
      })
      
      const webhookResult = await webhookResponse.json()
      console.log('✅ Webhook response:', webhookResult)
      
      if (!webhookResponse.ok) {
        console.error('⚠️ Webhook failed with status:', webhookResponse.status, webhookResult)
      }
    } catch (webhookError) {
      // Log but don't fail - survey was created successfully
      console.error('❌ Webhook error (non-critical):', webhookError)
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
    console.error('Survey save error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

