import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'

// ─────────────────────────────────────────────
// Webhook Sync API Route
// ─────────────────────────────────────────────
// Accepts activity events and logs them to the activity_feed table.
// This enables real-time dashboard updates via Supabase Realtime.

interface WebhookPayload {
  type: string
  survey_id?: string
  org_id: string
  details?: Record<string, any>
}

// Valid event types
const VALID_EVENT_TYPES = [
  'SURVEY_CREATED',
  'RESPONSE_RECEIVED',
  'SURVEY_UPDATED',
  'SURVEY_DELETED',
  'SUMMARY_GENERATED'
] as const

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const payload: WebhookPayload = await request.json()

    // Validate required fields
    if (!payload.type || !payload.org_id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: type, org_id' 
        },
        { status: 400 }
      )
    }

    // Validate event type
    if (!VALID_EVENT_TYPES.includes(payload.type as any)) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Insert into activity_feed table
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
      console.error('Error inserting activity:', error)
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to log activity' 
        },
        { status: 500 }
      )
    }

    // Return success response
    return NextResponse.json({
      success: true,
      activity: data
    })

  } catch (error) {
    console.error('Webhook sync error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    )
  }
}

