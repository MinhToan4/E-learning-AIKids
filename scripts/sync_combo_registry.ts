import fs from 'node:fs'
import path from 'node:path'

/**
 * Script quét toàn bộ ảnh WebP trong thư mục public/assets/pregenerated-combos/
 * và tự động đồng bộ hóa vào available-combos-manifest.json cho frontend.
 */
function syncComboRegistry() {
  const rootDir = process.cwd()
  const combosDir = path.resolve(rootDir, 'apps/web/public/assets/pregenerated-combos')
  const manifestPath = path.resolve(
    rootDir,
    'apps/web/src/features/lesson/lib/available-combos-manifest.json'
  )

  if (!fs.existsSync(combosDir)) {
    console.error(`❌ Thư mục không tồn tại: ${combosDir}`)
    return
  }

  const manifest: Record<string, string> = {}

  function walk(currentDir: string) {
    const entries = fs.readdirSync(currentDir, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(currentDir, entry.name)
      if (entry.isDirectory()) {
        walk(fullPath)
      } else if (entry.isFile() && entry.name.endsWith('.webp')) {
        const id = entry.name.replace(/\.webp$/u, '')
        const relativeToPublic = path.relative(path.resolve(rootDir, 'apps/web/public'), fullPath)
        manifest[id] = `/${relativeToPublic.replace(/\\/gu, '/')}`
      }
    }
  }

  walk(combosDir)

  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`✅ Đã đồng bộ ${Object.keys(manifest).length} tổ hợp ảnh vào: ${manifestPath}`)
}

syncComboRegistry()
