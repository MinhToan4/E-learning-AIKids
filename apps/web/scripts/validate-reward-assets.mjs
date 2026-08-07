import { readFile, readdir, stat } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../src/assets/rewards/', import.meta.url))
const allowedExtensions = new Set(['.avif', '.png', '.svg', '.webp'])
const allowedId = /^[a-z0-9]+(?:-[a-z0-9]+)*(?:--(?:plaque|preview|thumbnail))?$/
const maximumBytes = 4 * 1024 * 1024
const seen = new Map()
const errors = []
const sourceRoot = fileURLToPath(new URL('../src/', import.meta.url))
const forbiddenRuntimeReferences = [
  [/["'`]\/assets\/rewards\//, 'đường dẫn reward tĩnh'],
  [/storage\.storymee\.com/, 'storage origin hard-code'],
]

async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === 'README.md') continue
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      await walk(path)
      continue
    }

    const extension = extname(entry.name).toLowerCase()
    const id = entry.name.slice(0, -extension.length)
    const label = relative(root, path)
    if (!allowedExtensions.has(extension)) {
      errors.push(`${label}: chỉ nhận AVIF, PNG, SVG hoặc WebP`)
      continue
    }
    if (relative(root, directory) === 'frames' && extension === '.png') {
      errors.push(`${label}: frame raster phải dùng WebP để giảm tải bundle`)
    }
    if (!allowedId.test(id)) {
      errors.push(`${label}: filename không phải reward ID hợp lệ`)
    }
    if (seen.has(id)) {
      errors.push(`${label}: trùng ID với ${seen.get(id)}`)
    } else {
      seen.set(id, label)
    }
    if ((await stat(path)).size > maximumBytes) {
      errors.push(`${label}: vượt quá 4 MB`)
    }
  }
}

await walk(root)

async function scanSource(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      await scanSource(path)
      continue
    }
    if (
      !/\.(?:ts|tsx|js|jsx|css)$/.test(entry.name)
      || /\.test\.[^.]+$/.test(entry.name)
    ) continue
    const content = await readFile(path, 'utf8')
    for (const [pattern, label] of forbiddenRuntimeReferences) {
      if (pattern.test(content)) {
        errors.push(`${relative(sourceRoot, path)}: chứa ${label} "${pattern.source}"`)
      }
    }
  }
}

await scanSource(sourceRoot)

if (errors.length) {
  process.stderr.write(`Reward asset validation failed:\n- ${errors.join('\n- ')}\n`)
  process.exitCode = 1
} else {
  process.stdout.write(`Reward assets valid (${seen.size} files).\n`)
}
