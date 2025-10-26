import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { ActivityEventType, ActivityDetails } from '@/types/activity'
import { isValidEventType } from '@/types/activity'

// ─────────────────────────────────────────────
// Webhook Sync API Route
// ─────────────────────────────────────────────
// Accepts activity events and logs them to the activity_feed table.
// This enables real-time dashboard updates via Supabase Realtime.

interface WebhookPayload {
  type: string
  survey_id?: string
  org_id: string
  details?: ActivityDetails
}

// Valid event types derived from our type-safe ActivityEventType
const VALID_EVENT_TYPES: readonly ActivityEventType[] = [
  'SURVEY_CREATED',
  'RESPONSE_RECEIVED',
  'SURVEY_UPDATED',
  'SURVEY_DELETED',
  'SUMMARY_GENERATED'
] as const

export async function POST(request: NextRequest) {
  try {
    console.log('🎯 Webhook received')
    
    // Parse request body
    const payload: WebhookPayload = await request.json()
    console.log('📨 Webhook payload:', payload)

    // Validate required fields
    if (!payload.type || !payload.org_id) {
      console.error('❌ Missing required fields:', { type: payload.type, org_id: payload.org_id })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, org_id' 
        },
        { status: 400 }
      )
    }

    // Validate event type using type guard
    if (!isValidEventType(payload.type)) {
      console.error('❌ Invalid event type:', payload.type)
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Insert into activity_feed table
    console.log('💾 Inserting into activity_feed...')
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .insert({
        org_id: payload.org_id,
        type: payload.type,
        details: payload.details || {}
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error inserting activity:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to log activity',
          details: error.message
        },
        { status: 500 }
      )
    }

    console.log('✅ Activity logged successfully:', data)

    // Return success response
    return NextResponse.json({
      success: true,
      activity: data
    })

  } catch (error) {
    console.error('❌ Webhook sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

