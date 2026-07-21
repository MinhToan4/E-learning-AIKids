/**
 * Verify Google Identity Services ID tokens (OIDC).
 * Audience must match web client id. Never trust client payload without verify.
 * @see https://developers.google.com/identity/gsi/web/guides/verify-google-id-token
 */
import { OAuth2Client } from 'google-auth-library'
import { env } from '../../config/env.js'

export type GoogleIdProfile = {
  sub: string
  email: string
  emailVerified: boolean
  name?: string
  picture?: string
}

let client: OAuth2Client | null = null

function getClient(): OAuth2Client {
  if (!client) client = new OAuth2Client()
  return client
}

export function isGoogleAuthConfigured(): boolean {
  return Boolean(env.googleClientId)
}

/**
 * Verify JWT from GIS `credential` field.
 * Throws Error with statusCode 401 on invalid token.
 */
export async function verifyGoogleIdToken(
  idToken: string,
): Promise<GoogleIdProfile> {
  if (!env.googleClientId) {
    const err = new Error(
      'Đăng nhập Google chưa được bật. Liên hệ quản trị viên nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 503
    err.logCode = 'GOOGLE_NOT_CONFIGURED'
    throw err
  }

  let ticket
  try {
    ticket = await getClient().verifyIdToken({
      idToken,
      audience: env.googleClientId,
    })
  } catch (e) {
    const err = new Error(
      'Không xác nhận được Google. Thử lại hoặc đăng nhập bằng email nhé.',
    ) as Error & { statusCode: number; logCode?: string; cause?: unknown }
    err.statusCode = 401
    err.logCode = 'GOOGLE_TOKEN_INVALID'
    err.cause = e
    throw err
  }

  const payload = ticket.getPayload()
  if (!payload?.sub || !payload.email) {
    const err = new Error(
      'Google không gửi đủ thông tin email. Chọn tài khoản khác nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 401
    err.logCode = 'GOOGLE_PAYLOAD_INCOMPLETE'
    throw err
  }

  if (payload.email_verified !== true) {
    const err = new Error(
      'Email Google chưa được xác minh. Dùng email đã xác minh nhé.',
    ) as Error & { statusCode: number; logCode?: string }
    err.statusCode = 401
    err.logCode = 'GOOGLE_EMAIL_UNVERIFIED'
    throw err
  }

  return {
    sub: payload.sub,
    email: payload.email.toLowerCase().trim(),
    emailVerified: true,
    name: payload.name,
    picture: payload.picture,
  }
}
