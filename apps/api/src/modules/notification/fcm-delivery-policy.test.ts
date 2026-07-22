import { describe, expect, it } from 'vitest'
import { classifyFcmDelivery } from './fcm-delivery-policy.js'

describe('FCM delivery policy', () => {
  it('disables tokens that Firebase says can never be used again', () => {
    expect(classifyFcmDelivery('messaging/registration-token-not-registered'))
      .toBe('invalid-token')
  })

  it('retries transient FCM failures', () => {
    expect(classifyFcmDelivery('messaging/server-unavailable')).toBe('retry')
    expect(classifyFcmDelivery('messaging/internal-error')).toBe('retry')
  })

  it('does not retry malformed messages or credential failures', () => {
    expect(classifyFcmDelivery('messaging/invalid-payload')).toBe('permanent')
    expect(classifyFcmDelivery('messaging/mismatched-credential')).toBe('permanent')
  })
})
