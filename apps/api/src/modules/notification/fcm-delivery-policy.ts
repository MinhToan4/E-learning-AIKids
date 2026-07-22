export type FcmDeliveryDecision = 'invalid-token' | 'retry' | 'permanent'

const INVALID_TOKEN_CODES = new Set([
  'messaging/invalid-registration-token',
  'messaging/registration-token-not-registered',
])

const RETRYABLE_CODES = new Set([
  'messaging/internal-error',
  'messaging/server-unavailable',
  'messaging/unknown-error',
  'messaging/quota-exceeded',
  'messaging/message-rate-exceeded',
  'messaging/device-message-rate-exceeded',
  'messaging/topics-message-rate-exceeded',
])

/** Only retry errors Firebase documents as transient or quota-related. */
export function classifyFcmDelivery(code: string | undefined): FcmDeliveryDecision {
  if (code && INVALID_TOKEN_CODES.has(code)) return 'invalid-token'
  if (code && RETRYABLE_CODES.has(code)) return 'retry'
  return 'permanent'
}
