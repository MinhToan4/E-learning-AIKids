import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const trackedFiles = execFileSync('git', ['ls-files', '-z'], { encoding: 'utf8' })
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.endsWith('package-lock.json'))

const rules = [
  {
    name: 'database URL containing inline credentials',
    pattern: /postgres(?:ql)?:\/\/[^\s:'"]+:[^\s@'"]+@/i,
  },
  {
    name: 'hard-coded database password',
    pattern: /(?:SUPABASE_(?:DB_)?PASSWORD|DATABASE_PASSWORD)\s*[:=]\s*['"][^'"]+['"]/i,
  },
]

const findings = []
for (const file of trackedFiles) {
  let source
  try {
    source = readFileSync(file, 'utf8')
  } catch {
    continue
  }
  for (const rule of rules) {
    if (rule.pattern.test(source)) findings.push(`${file}: ${rule.name}`)
  }
}

if (findings.length > 0) {
  console.error('Potential committed secrets detected:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log('No tracked plaintext database credentials detected.')
