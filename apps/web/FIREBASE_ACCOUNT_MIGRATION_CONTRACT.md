# Firebase account migration contract

The web application uses Firebase Authentication for adult credentials. StoryMee
Hub remains the only HTTP boundary and core Account remains authoritative for
profiles, family ownership, parental consent, roles, contexts and audit data.

## Session exchange

`POST /api/v1/account/auth/firebase/session`

```json
{
  "idToken": "<firebase-id-token>",
  "role": "parent",
  "registration": true,
  "nickname": "An",
  "parentalConsentAccepted": true,
  "termsAccepted": true
}
```

Only `idToken` and `role` are sent for an existing account. Registration fields
are included only after Firebase successfully creates a new email/password user.

The server must:

1. Verify the ID token with Firebase Admin SDK, including issuer, audience and
   expiry. Never trust a UID, email or provider supplied separately by the client.
2. Link by Firebase UID. An email match may be linked only under an explicit,
   verified-email migration policy and must be recorded in the audit log.
3. Treat `role` as an onboarding request only. Existing roles and all admin or
   organization assignments come from core Account.
4. Require both consent flags when creating a parent account and persist their
   policy version and timestamp server-side.
5. Return the current compatibility payload:

```json
{
  "data": {
    "accessToken": "<short-lived-storymee-token>",
    "user": { "id": "...", "role": "parent", "email": "..." }
  }
}
```

6. Make bootstrap idempotent, rate-limit it, reject disabled/deleted accounts,
   and avoid placing family IDs, child IDs or permission lists in custom claims.

## Child sessions

Child nickname/PIN login remains under core Account. PINs are never Firebase
passwords. The server verifies the family/child relationship and rate limits PIN
attempts before issuing a child-scoped session. Switching from parent to child
must revoke or discard parent authority on the shared device.

## Firebase console configuration

- Enable Email/Password and Google providers.
- Add every production/staging hostname to Authorized domains.
- Configure the password-reset email action URL to the web `/reset-password`
  route so Firebase supplies `mode=resetPassword&oobCode=...`.
- Configure service-account credentials only in Hub/core Account; no Admin SDK
  credentials or secrets may be exposed through `VITE_*` variables.
