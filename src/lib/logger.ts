/**
 * Logger Utility for MoSurveys
 * 
 * A lightweight console wrapper that provides structured logging with context.
 * 
 * Features:
 * - Contextual logging (knows which module/file is logging)
 * - Structured data (JSON format in production)
 * - Pretty formatting in development (with emojis)
 * - TypeScript types for safety
 * - Easy upgrade path to Winston/Pino for production
 * 
 * Usage:
 *   const logger = createLogger('SurveyAPI');
 *   logger.info('Survey created', { surveyId: '123' });
 *   logger.error('Failed to create survey', error);
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: any;
}

class Logger {
  private context: string;
  private isDevelopment: boolean;

  constructor(context: string) {
    this.context = context;
    // Check both NODE_ENV and Next.js development mode
    this.isDevelopment = 
      process.env.NODE_ENV === 'development' || 
      process.env.NEXT_PUBLIC_NODE_ENV === 'development' ||
      !process.env.NODE_ENV; // Default to development if not set
  }

  /**
   * Formats log message based on environment
   * - Development: Pretty format with emojis
   * - Production: JSON format (easy to parse/search)
   */
  private formatMessage(level: LogLevel, message: string, meta?: LogContext): string {
    const timestamp = new Date().toISOString();
    const emoji = this.getEmoji(level);
    
    if (this.isDevelopment) {
      // Pretty format for development
      const metaStr = meta ? `\n${JSON.stringify(meta, null, 2)}` : '';
      return `${emoji} [${timestamp}] [${this.context}] ${message}${metaStr}`;
    } else {
      // JSON format for production (easy to parse)
      return JSON.stringify({
        timestamp,
        level,
        context: this.context,
        message,
        ...meta
      });
    }
  }

  /**
   * Get emoji for log level (development only)
   */
  private getEmoji(level: LogLevel): string {
    const emojis = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌'
    };
    return emojis[level];
  }

  /**
   * Log debug information (only shown in development)
   * Use for detailed diagnostic information
   */
  debug(message: string, meta?: LogContext) {
    // Always show debug in dev mode (npm run dev)
    // Use console.log instead of console.debug to avoid Chrome's "Verbose" filter
    if (this.isDevelopment) {
      console.log(this.formatMessage('debug', message, meta));
    }
  }

  /**
   * Log informational messages
   * Use for general application flow (e.g., "Survey created", "User logged in")
   */
  info(message: string, meta?: LogContext) {
    console.info(this.formatMessage('info', message, meta));
  }

  /**
   * Log warning messages
   * Use for recoverable issues (e.g., "Deprecated API used", "Rate limit approaching")
   */
  warn(message: string, meta?: LogContext) {
    console.warn(this.formatMessage('warn', message, meta));
  }

  /**
   * Log error messages with optional Error object
   * Use for failures that need attention
   */
  error(message: string, error?: Error | unknown, meta?: LogContext) {
    const errorMeta = error instanceof Error 
      ? { error: error.message, stack: error.stack, ...meta }
      : error
      ? { error: String(error), ...meta }
      : meta;
    
    console.error(this.formatMessage('error', message, errorMeta));
  }

  /**
   * Log with custom level (advanced usage)
   */
  log(level: LogLevel, message: string, meta?: LogContext) {
    const formattedMessage = this.formatMessage(level, message, meta);
    
    switch (level) {
      case 'debug':
        if (this.isDevelopment) console.log(formattedMessage);
        break;
      case 'info':
        console.info(formattedMessage);
        break;
      case 'warn':
        console.warn(formattedMessage);
        break;
      case 'error':
        console.error(formattedMessage);
        break;
    }
  }
}

/**
 * Creates a contextual logger for a specific module/component.
 * 
 * @param context - Name of the module/component (e.g., 'SurveyAPI', 'Dashboard', 'Database')
 * @returns Logger instance with context
 * 
 * @example
 * // In an API route
 * const logger = createLogger('SurveyAPI');
 * logger.info('Survey created', { surveyId: '123' });
 * 
 * @example
 * // In a utility file
 * const logger = createLogger('Database');
 * logger.error('Query failed', error, { query: 'SELECT * FROM surveys' });
 * 
 * @remarks
 * In production, this could be upgraded to use Winston/Pino without
 * changing any calling code. Just replace the Logger class implementation.
 */
export function createLogger(context: string): Logger {
  return new Logger(context);
}

// Default export for convenience
export default createLogger;

// Re-export types for use in other files
export type { LogLevel, LogContext };


