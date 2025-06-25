/**
 * OpenAI service constants
 */
export const OPENAI_CONSTANTS = {
  DEFAULT_MODEL: 'gpt-3.5-turbo',
  MAX_TOKENS: 1000,
  POLLING_INTERVAL_MS: 1000,
  LOG_MESSAGE_MAX_LENGTH: 100,
  MAX_POLLING_ATTEMPTS: 60, // 60 seconds max wait
} as const;

/**
 * OpenAI run statuses that indicate the run is still processing
 */
export const PROCESSING_STATUSES = ['in_progress', 'queued'] as const;

/**
 * OpenAI run status that indicates successful completion
 */
export const COMPLETED_STATUS = 'completed' as const;
