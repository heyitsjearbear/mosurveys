import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabaseAdmin'
import type { ActivityEventType, ActivityDetails } from '@/types/activity'
import { isValidEventType } from '@/types/activity'
import { createLogger } from '@/lib/logger'

const logger = createLogger('WebhookSync')

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
    logger.info('Webhook received')
    
    // Parse request body
    const payload: WebhookPayload = await request.json()
    logger.debug('Webhook payload received', payload)

    // Validate required fields
    if (!payload.type || !payload.org_id) {
      logger.warn('Missing required fields in webhook payload', { 
        type: payload.type, 
        org_id: payload.org_id 
      })
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
      logger.warn('Invalid event type received', { 
        receivedType: payload.type,
        validTypes: VALID_EVENT_TYPES 
      })
      return NextResponse.json(
        { 
          success: false, 
          error: `Invalid event type. Must be one of: ${VALID_EVENT_TYPES.join(', ')}` 
        },
        { status: 400 }
      )
    }

    // Insert into activity_feed table
    logger.debug('Inserting activity into database', { type: payload.type })
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
      logger.error('Failed to insert activity into database', error, {
        org_id: payload.org_id,
        type: payload.type
      })
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to log activity',
          details: error.message
        },
        { status: 500 }
      )
    }

    logger.info('Activity logged successfully', { 
      activityId: data.id,
      type: data.type,
      org_id: data.org_id
    })

    // Return success response
    return NextResponse.json({
      success: true,
      activity: data
    })

  } catch (error) {
    logger.error('Webhook sync error', error)
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

