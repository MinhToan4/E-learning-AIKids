import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const assetsDir = resolve(import.meta.dirname, '../dist/assets')
const files = readdirSync(assetsDir)
const budgets = [
  { pattern: /^AdminPage-.*\.js$/, maxKb: 90 },
  { pattern: /^LegendRewardStudio-.*\.js$/, maxKb: 160 },
  { pattern: /^HomePage-.*\.js$/, maxKb: 40 },
  { pattern: /^WorldPage-.*\.js$/, maxKb: 75 },
  { pattern: /^LessonPage-.*\.js$/, maxKb: 130 },
  // The profile route now owns the six-tab profile experience. Keep the
  // route-level raw chunk capped while its compressed payload remains small.
  { pattern: /^ProfilePage-.*\.js$/, maxKb: 85 },
  { pattern: /^BackpackPage-.*\.js$/, maxKb: 32 },
  { pattern: /^data-island-curriculum-.*\.js$/, maxKb: 275 },
  { pattern: /^AsmoHubPage-.*\.js$/, maxKb: 20 },
  { pattern: /^asmo-api-.*\.js$/, maxKb: 15 },
  { pattern: /^index-.*\.js$/, maxKb: 260 },
  { pattern: /^index-.*\.css$/, maxKb: 615 },
]

const failures = []
for (const budget of budgets) {
  const file = files.find((candidate) => budget.pattern.test(candidate))
  if (!file) {
    failures.push(`Missing chunk matching ${budget.pattern}`)
    continue
  }
  const sizeKb = statSync(resolve(assetsDir, file)).size / 1024
  if (sizeKb > budget.maxKb) failures.push(`${file}: ${sizeKb.toFixed(1)} KB > ${budget.maxKb} KB`)
  else console.log(`Performance budget OK: ${file} ${sizeKb.toFixed(1)}/${budget.maxKb} KB`)
}

if (failures.length) {
  console.error(failures.join('\n'))
  process.exitCode = 1
}
