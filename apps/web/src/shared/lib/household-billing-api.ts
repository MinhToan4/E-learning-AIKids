import { api } from './api'

type Subscription = { plan?: string; planCode?: string; status?: string }

/** Household billing is display-only here; LMS owns learner access decisions. */
export function readHouseholdSubscription() {
  return api<Subscription & { data?: Subscription; subscription?: Subscription }>(
    '/api/v1/billing/me/subscription',
  )
}
