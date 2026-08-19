# Runtime Achievement → Legend Studio import contract

The web app must not disguise achievements as rewards or events. StoryMee Hub owns this write contract.

## Required backend changes

1. Extend `StudioContentType` with `achievement`.
2. Migrate `gamification_studio_items.content_type` CHECK constraint to accept `achievement`.
3. Extend the list/create request schemas from `reward | chapter | event` to include `achievement`.
4. Add a bulk endpoint:

   `POST /internal/v1/gamification/admin/studio/import-runtime-achievements`

   Request:

   ```json
   {
     "items": [
       {
         "runtimeKey": "achievement.weekly-goals",
         "code": "weekly-goals",
         "name": "Người giữ mục tiêu tuần",
         "description": "...",
         "assets": {},
         "displayConfig": {},
         "unlockRule": {
           "type": "action",
           "metric": "weekly-goals",
           "value": "weekly-goals"
         },
         "content": {
           "migratedFrom": "runtime_achievement"
         }
       }
     ]
   }
   ```

   Response:

   ```json
   {
     "created": 51,
     "skipped": 0,
     "failed": [],
     "items": []
   }
   ```

## Authorization

- Listing Studio items: `legend_studio:read`.
- Creating or importing drafts: `legend_studio:draft:create`.
- Updating drafts: `legend_studio:draft:update`.
- Publishing: `legend_studio:publish`.
- Retiring: `legend_studio:retire`.
- Deleting drafts: `legend_studio:draft:delete`.
- The backend must enforce scopes; frontend route guards are only UX.
- Return `401` for missing/invalid identity and `403` for a valid actor without the required scope.

## Import safety

- Require an `Idempotency-Key` header for bulk import.
- Use normalized Studio `code` as the uniqueness key while retaining `runtimeKey` in `content`.
- Skip a runtime achievement when any Studio version already has the normalized code.
- Run the import in one transaction, or return an explicit per-item result if partial success is supported.
- Create drafts only. Never publish as part of import.
- Record one audit entry per created draft plus a bulk-operation summary.
- Do not accept actor IDs from the request body; derive the actor from the authenticated request.

## Frontend behavior

- Send requests only through StoryMee Hub and `shared/lib/api.ts`.
- Disable repeated submission while a request is pending.
- On `403`, show a permission-specific message and create nothing.
- On validation failure, show the first actionable field error instead of the generic `ZodError` label.
- Reload the Studio catalog after success and hide runtime entries whose normalized codes now exist in Studio.
