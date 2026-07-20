import { createHash, randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { env } from '../../config/env.js'

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12)
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

/** Opaque session token; store only hash-like form via signed token id. */
export function createSessionToken(): string {
  const raw = randomBytes(32).toString('base64url')
  // Bind to secret so tokens from other envs don't validate if leaked raw-only
  const sig = createHash('sha256')
    .update(raw + env.jwtSecret)
    .digest('base64url')
    .slice(0, 16)
  return `${raw}.${sig}`
}

export function isSessionTokenFormat(token: string): boolean {
  const [raw, sig] = token.split('.')
  if (!raw || !sig) return false
  const expected = createHash('sha256')
    .update(raw + env.jwtSecret)
    .digest('base64url')
    .slice(0, 16)
  return sig === expected
}
