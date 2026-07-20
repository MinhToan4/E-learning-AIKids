# Family model (internal engineering)

Trust boundary for this product:

| Role | Responsibility |
|------|----------------|
| **Parent** | Email + password; creates children; owns household plan |
| **Child** | Profile created by parent; nickname + optional **6-digit PIN**; never parent password |
| **Billing** | Household plan Free / Plus / Family (seats + course caps) |

## Rules (non-negotiable)

1. **Parent creates child** — never public self-serve student registration in production (`STUDENT_AUTO_CREATE=false`).
2. **Child does not use parent password** — separate student session (nickname ± PIN, or “Vào học” from parent).
3. **Plan is household-level** — seats (`maxChildren`) + per-child open course cap.
4. **Enroll is entitlement-gated** — student without active parent plan / over seat limits → payment-required response.
5. **Private portfolio default** — share still needs parent approval.
6. **User-facing copy** — friendly Vietnamese only; no competitor app names; no tech stack jargon in API/UI strings.
7. **Server logs** — structured detail (`request.log`) for debug; never dump secrets/PIN.

## Data model

- `Plan` — catalog (`free` | `plus` | `family`) from `packages/domain` `PLAN_CATALOG`
- `Subscription` — `parentUserId` + `planId` + status + period
- `User` (student) — `parentId` required for enroll; optional `pinHash`

## API surface

| Method | Path | Who |
|--------|------|-----|
| GET | `/api/parent/plans` | parent |
| GET/POST | `/api/parent/subscription` | parent |
| POST | `/api/parent/children` | parent (+ seat check, optional PIN) |
| POST | `/api/parent/children/:id/enter` | parent → switches cookie to child |
| POST | `/api/auth/login/student` | child (no auto-create by default; 6-digit PIN if set) |
| POST | `/api/enrollments` | student (plan gate) |

## FE kid picker

| Route | Who | UX |
|-------|-----|-----|
| `/kids` | Parent session required | Full-screen “Con là ai hôm nay?” — large avatars, 6-digit PIN pad, then student session |

## Production env

```env
STUDENT_AUTO_CREATE=false
COOKIE_SECURE=true
```

## Future (not in v1)

- Stripe / Apple / Google IAP on `Subscription.provider`
- Class code invite QR for classroom tablets
- Multi-parent household (co-parents)

