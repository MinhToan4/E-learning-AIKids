---
name: aikids-domain-curriculum
description: >-
  Domain rules and curriculum constraints for ages 8–11 AI creator courses:
  quest unlock, private portfolio, experiential stations, video lectures.
  Use when editing seed courses, progress logic, or lesson UX.
---

# Domain & curriculum

## Learning model

Stations (quests) follow **learn → practice → check**:

1. Learn — cards + optional **videoUrl** lecture
2. Practice — scaffolded chips/story/comic/… (no unbounded chatbot)
3. Check — quiz; stars from correctness; unlock next quest

Unlock rules live in `packages/domain` (`buildQuestStatuses`) — pure functions.

## Content storage

- Course/quest definitions: `apps/api/prisma/seed/courses/*` → upserted to DB
- Runtime catalog: API only; FE must not ship a second catalog of truth
- `Quest.videoUrl` — CDN/object-storage HTTPS URL

## Safety for kids

- Nicknames only (no email for students)
- Free text filtered for PII
- Projects private until parent approves
- Class tables use nicknames; no global public leaderboard

## Curriculum research

Source: `AI_Education_Research_and_36_Week_Curriculum_Ages_8-11.md`

- Seed ships **representative** open courses (comic, safety, voice, robot)
- Full 36-week authoring is content work, not code hardcoding
- Add weeks by extending seed modules + SQL, not FE constants

## Checklist for new quest

- [ ] Stable slug id
- [ ] order unique per course
- [ ] goals, learn cards, check with non-all-zero correctIndex
- [ ] optional videoUrl
- [ ] practiceKind supported by LessonPage
