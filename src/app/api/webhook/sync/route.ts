import { NextRequest, NextResponse } from 'next/server'
import { createLogger } from '@/lib/logger'
import { processWebhook } from '@/lib/webhooks'

const logger = createLogger('WebhookSync')

// ─────────────────────────────────────────────
// Webhook Sync API Route
// ─────────────────────────────────────────────

// Accepts activity events and logs them to the activity_feed table.
// This enables real-time dashboard updates via Supabase Realtime.

export async function POST(request: NextRequest) {
  try {
    logger.info('Webhook received')
    
    const body = await request.json()
    logger.debug('Webhook payload received', body)

    // Use centralized webhook processing
    const result = await processWebhook(body)

    if (!result.success) {
      return NextResponse.json(result, { 
        status: result.error?.includes('Invalid') ? 400 : 500 
      })
    }

    return NextResponse.json(result)

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

