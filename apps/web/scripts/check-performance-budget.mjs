import { readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const assetsDir = resolve(import.meta.dirname, '../dist/assets')
const files = readdirSync(assetsDir)
const budgets = [
  { pattern: /^AdminPage-.*\.js$/, maxKb: 90 },
  { pattern: /^LegendRewardStudio-.*\.js$/, maxKb: 160 },
  { pattern: /^index-.*\.js$/, maxKb: 260 },
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
