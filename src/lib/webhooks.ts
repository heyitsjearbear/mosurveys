/**
 * Webhook Utilities
 * ────────────────────────────────────────────────────
 * Utilities for handling webhook events and activity logging.
 * 
 * Why this file exists:
 * - Centralized webhook validation and processing
 * - Type-safe event handling
 * - Consistent error handling across webhook endpoints
 * - Reusable activity logging functions
 */

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { createLogger } from '@/lib/logger';
import type { ActivityEventType, ActivityDetails } from '@/types/activity';
import { webhookPayloadSchema, validateWithSchema } from '@/lib/validation';

const logger = createLogger('WebhookUtils');

/**
 * Webhook Payload Interface
 * ────────────────────────────────────────────────────
 */
export interface WebhookPayload {
  type: ActivityEventType;
  org_id: string;
  survey_id?: string | null;
  details?: ActivityDetails;
}

/**
 * Webhook Response Interface
 * ────────────────────────────────────────────────────
 */
export interface WebhookResponse {
  success: boolean;
  activity?: {
    id: string;
    type: string;
    org_id: string;
    created_at: string;
  };
  error?: string;
  details?: string;
}

/**
 * Valid Activity Event Types
 * ────────────────────────────────────────────────────
 * These are the event types we support in the activity feed
 */
export const VALID_EVENT_TYPES: readonly ActivityEventType[] = [
  'SURVEY_CREATED',
  'RESPONSE_RECEIVED',
  'SURVEY_UPDATED',
  'SURVEY_DELETED',
  'SUMMARY_GENERATED',
  'SURVEY_EDITED',
] as const;

/**
 * Type guard to check if a string is a valid ActivityEventType
 * 
 * @param type - String to check
 * @returns True if valid event type
 */
export function isValidEventType(type: string): type is ActivityEventType {
  return VALID_EVENT_TYPES.includes(type as ActivityEventType);
}

/**
 * Validate Webhook Payload
 * ────────────────────────────────────────────────────
 * Uses Zod schema to validate incoming webhook data
 * 
 * @param payload - Raw payload from webhook request
 * @returns Validation result
 */
export function validateWebhookPayload(payload: unknown): {
  success: boolean;
  data?: WebhookPayload;
  errors?: string[];
} {
  const result = validateWithSchema(webhookPayloadSchema, payload);
  
  if (!result.success) {
    logger.warn('Invalid webhook payload', { errors: result.errors });
    return { success: false, errors: result.errors };
  }
  
  return { success: true, data: result.data as WebhookPayload };
}

/**
 * Log Activity to Database
 * ────────────────────────────────────────────────────
 * Inserts activity event into activity_feed table
 * 
 * @param payload - Validated webhook payload
 * @returns Database response
 */
export async function logActivity(
  payload: WebhookPayload
): Promise<WebhookResponse> {
  try {
    logger.debug('Logging activity to database', { type: payload.type });
    
    const { data, error } = await supabaseAdmin
      .from('activity_feed')
      .insert({
        org_id: payload.org_id,
        type: payload.type,
        details: payload.details || {},
      })
      .select()
      .single();

    if (error) {
      logger.error('Failed to log activity', error, {
        org_id: payload.org_id,
        type: payload.type,
      });
      
      return {
        success: false,
        error: 'Failed to log activity',
        details: error.message,
      };
    }

    logger.info('Activity logged successfully', {
      activityId: data.id,
      type: data.type,
      org_id: data.org_id,
    });

    return {
      success: true,
      activity: {
        id: String(data.id),
        type: String(data.type),
        org_id: String(data.org_id),
        created_at: String(data.created_at),
      },
    };
  } catch (error) {
    logger.error('Unexpected error logging activity', error);
    
    return {
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process Webhook Request
 * ────────────────────────────────────────────────────
 * Complete webhook processing: validate + log activity
 * 
 * This is the main function used by webhook route handlers.
 * It handles validation, logging, and error responses.
 * 
 * @param payload - Raw webhook payload
 * @returns Webhook response
 */
export async function processWebhook(payload: unknown): Promise<WebhookResponse> {
  logger.info('Processing webhook request');
  
  // Step 1: Validate payload
  const validation = validateWebhookPayload(payload);
  
  if (!validation.success || !validation.data) {
    return {
      success: false,
      error: 'Invalid webhook payload',
      details: validation.errors?.join(', '),
    };
  }
  
  // Step 2: Log activity to database
  const result = await logActivity(validation.data);
  
  return result;
}

/**
 * Create Activity Payload Helper
 * ────────────────────────────────────────────────────
 * Type-safe helper for constructing webhook payloads
 * 
 * @param type - Activity event type
 * @param org_id - Organization ID
 * @param details - Event details
 * @param survey_id - Optional survey ID
 * @returns Webhook payload
 */
export function createActivityPayload(
  type: ActivityEventType,
  org_id: string,
  details: ActivityDetails,
  survey_id?: string
): WebhookPayload {
  return {
    type,
    org_id,
    survey_id: survey_id || null,
    details,
  };
}

/**
 * Send Webhook to Activity Feed
 * ────────────────────────────────────────────────────
 * Helper to POST webhook to /api/webhook/sync endpoint
 * 
 * Use this from other API routes or server-side code to
 * log activities without directly inserting to database.
 * 
 * @param payload - Webhook payload
 * @returns Success status
 */
export async function sendWebhookEvent(payload: WebhookPayload): Promise<boolean> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
    
    logger.debug('Sending webhook event', { 
      type: payload.type,
      endpoint: `${baseUrl}/api/webhook/sync` 
    });
    
    const response = await fetch(`${baseUrl}/api/webhook/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      logger.error('Webhook request failed', null, {
        status: response.status,
        error: errorData.error,
      });
      return false;
    }

    logger.info('Webhook event sent successfully', { type: payload.type });
    return true;
  } catch (error) {
    logger.error('Failed to send webhook event', error, { type: payload.type });
    return false;
  }
}

