import { describe, expect, it } from 'vitest'
import {
  parseServiceAccountJsonBase64,
  validateServiceAccountProject,
} from './firebase-admin.js'

describe('Firebase service account configuration', () => {
  it('rejects a credential from a different Firebase project', () => {
    expect(() => validateServiceAccountProject({
      configuredProjectId: 'storymee-35093',
      credentialProjectId: 'another-project',
    })).toThrow('does not match FIREBASE_PROJECT_ID')
  })

  it('accepts the configured project credential', () => {
    expect(validateServiceAccountProject({
      configuredProjectId: 'storymee-35093',
      credentialProjectId: 'storymee-35093',
    })).toBe('storymee-35093')
  })

  it('reads a service account from a portable base64 environment value', () => {
    const encoded = Buffer.from(JSON.stringify({
      project_id: 'storymee-35093',
      client_email: 'firebase@example.test',
      private_key: 'test-private-key',
    }), 'utf8').toString('base64')

    expect(parseServiceAccountJsonBase64(encoded)).toEqual({
      project_id: 'storymee-35093',
      client_email: 'firebase@example.test',
      private_key: 'test-private-key',
    })
  })

  it('rejects malformed base64 service-account values without leaking content', () => {
    expect(() => parseServiceAccountJsonBase64('not-valid-json'))
      .toThrow('FIREBASE_SERVICE_ACCOUNT_JSON_BASE64 is invalid')
  })
})
