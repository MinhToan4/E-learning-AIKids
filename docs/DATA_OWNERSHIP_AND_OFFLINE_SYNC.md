# Data ownership and offline sync

## Purpose

This document prevents cross-profile contamination and stops browser state
from becoming a second backend. It is the review contract for learner progress,
family billing and child assets.

## Ownership matrix

| Domain | Owner key | Authoritative system | Browser persistence |
| --- | --- | --- | --- |
| Lesson phase/resume | `student_id + lesson_id` | core LMS via Hub | Scoped draft only |
| Completion/stars/XP | `student_id` | LMS/gamification via Hub | Pending optimistic display only |
| Enrollment/unlock | household entitlement + `student_id` policy | billing/LMS via Hub | Never authoritative |
| Achievements/inventory/certificates | `student_id` | gamification/rewards via Hub | Read cache or draft only |
| Creative works/portfolio | `student_id + asset_id` | owning asset service via Hub | Scoped unsynced draft only |
| Subscription/payment/invoices | `parent/household_id` | billing via Hub | UI preference only |
| Admin plan configuration | billing tenant/platform scope | billing via Hub | Never authoritative |

## Non-negotiable invariants

0. Student PIN login is temporarily disabled. Parent authentication plus an
   ownership-checked child-profile handoff is the only supported student entry
   flow; stored legacy PIN hashes are dormant and must not grant access.
1. A request for child A cannot read or mutate a row owned by child B, even
   when both belong to the same parent.
2. A parent can view only children attached to that parent's household. Parent
   payment data is never copied into a child profile.
3. Unlock state is computed by the backend from enrollment, entitlement and
   prerequisites. The frontend renders it; it does not manufacture it.
4. Offline events contain `ownerId`, resource id, payload version, occurrence
   time and a stable idempotency key. Replay requires `activeUser.id === ownerId`.
5. An unknown/legacy owner is quarantined. Never assign old device data to the
   first profile that logs in.
6. Server responses replace optimistic state. 401/403 stops replay. Validation
   errors go to a visible recovery state; retries must not duplicate rewards.

## Canonical flow

`UI draft -> owner-scoped queue -> Hub authentication -> backend ownership and
entitlement check -> idempotent transaction -> authoritative projection ->
query invalidation/refetch`.

Local storage may preserve work during a network outage, but it cannot turn a
lesson into completed, grant stars, unlock an island or confirm a payment.

## Backend and database audit required

This repository contains the frontend contract, not the Hub/core service or
database schema. The owning backend team must verify these checks against the
real schema and retain evidence:

- every progress, attempt, resume, reward, inventory, certificate and asset row
  has a non-null learner foreign key;
- every learner row resolves to exactly one household (unless an explicitly
  documented organization-owned learner model applies);
- unique/idempotency constraints prevent duplicate completion rewards;
- family endpoints join through authenticated household ownership rather than
  trusting a request `studentId`;
- student endpoints derive actor/learner from the server session and reject a
  different body/query owner;
- payment intents, subscriptions and invoices are keyed to the parent account
  or household, never whichever child profile is active;
- entitlement projections are deterministic for all siblings and cannot leak
  from one household to another;
- deleting/transferring a child has an explicit policy for progress and assets;
- audit logs record actor, owner, resource, action, idempotency key and result
  without child secrets or payment credentials.

Run a two-household/four-child isolation suite for every endpoint class:
same-child success, sibling denial where appropriate, other-household denial,
parent-owned view, expired entitlement, offline duplicate replay and concurrent
double submission.

## Frontend review gates

- Search new code for `localStorage`, `sessionStorage`, hard-coded learner ids,
  and direct service URLs.
- Any persisted learner key must visibly include the learner id or live in a
  store whose record schema includes and validates `ownerId`.
- Query keys must include identity whenever a response differs by identity.
- Profile switch tests must start with populated data for child A, switch to a
  brand-new child B, and assert zero inherited progress/assets.
- Payment UI must refetch the household subscription after login/context switch
  and must not use cached data as proof of access.

## Legacy-data policy

Do not silently delete potentially recoverable legacy records, and do not show
or replay them. Keep them quarantined until a trusted server-side migration can
map each record to an owner using audit evidence. If no reliable mapping exists,
discarding the legacy cache is safer than assigning it to a child.
