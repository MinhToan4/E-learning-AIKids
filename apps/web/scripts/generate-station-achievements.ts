import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { ISLAND_CURRICULUM_LESSONS } from '../src/features/lesson/data/island-curriculum-registry'
import { AIKI_RULES_DATA } from '../src/features/rules/data/rules-data'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export interface StationAchievement {
  runtimeKey: string
  code: string
  name: string
  description: string
  assets: {
    icon: string
    thumbnail: string
  }
  displayConfig: {
    category: 'station_completion'
    badgeTier: 'bronze'
    stars: number
    xp: number
    islandNumber: number
    lessonNumber: string
  }
  unlockRule: {
    type: 'action'
    metric: 'lesson.completed'
    stationSlug: string
    lessonId: string
  }
  content: {
    migratedFrom: 'station_curriculum'
    stationId: string
    slug: string
    xpReward: number
    stars: number
  }
}

export function generateStationAchievements(): StationAchievement[] {
  const achievements: StationAchievement[] = []

  // 1. 22 Island Curriculum Lessons
  for (const lesson of ISLAND_CURRICULUM_LESSONS) {
    const slug = lesson.slug
    const id = lesson.id
    const badgeName =
      lesson.journey?.stage6_completion?.rewardBadge?.name?.trim() ||
      `Huy hiệu ${lesson.title}`
    const congrats =
      lesson.journey?.stage6_completion?.congratsMessage?.trim() ||
      `Chúc mừng bạn đã hoàn thành xuất sắc ${lesson.title}!`
    const iconUrl =
      lesson.journey?.stage6_completion?.rewardBadge?.iconUrl ||
      lesson.imageUrl ||
      ''

    achievements.push({
      runtimeKey: `achievement.station.${slug}`,
      code: `station-${slug}`,
      name: badgeName,
      description: congrats,
      assets: {
        icon: iconUrl,
        thumbnail: iconUrl,
      },
      displayConfig: {
        category: 'station_completion',
        badgeTier: 'bronze',
        stars: 3,
        xp: 50,
        islandNumber: lesson.islandNumber,
        lessonNumber: lesson.lessonNumber,
      },
      unlockRule: {
        type: 'action',
        metric: 'lesson.completed',
        stationSlug: slug,
        lessonId: id,
      },
      content: {
        migratedFrom: 'station_curriculum',
        stationId: id,
        slug,
        xpReward: 50,
        stars: 3,
      },
    })
  }

  // 2. 10 AIKI Golden Rules
  for (const rule of AIKI_RULES_DATA) {
    const id = `rule-${rule.id}`
    const slug = `rule-${rule.id}`
    const badgeName = `Huy hiệu Quy tắc ${rule.id} — ${rule.shortTitle}`
    const congrats = `Chúc mừng bạn đã hoàn thành xuất sắc Quy tắc ${rule.id}: ${rule.shortTitle}!`
    const iconUrl = rule.posterImage || ''

    achievements.push({
      runtimeKey: `achievement.station.${slug}`,
      code: `station-${slug}`,
      name: badgeName,
      description: congrats,
      assets: {
        icon: iconUrl,
        thumbnail: iconUrl,
      },
      displayConfig: {
        category: 'station_completion',
        badgeTier: 'bronze',
        stars: 3,
        xp: 50,
        islandNumber: 0,
        lessonNumber: String(rule.id),
      },
      unlockRule: {
        type: 'action',
        metric: 'lesson.completed',
        stationSlug: slug,
        lessonId: id,
      },
      content: {
        migratedFrom: 'station_curriculum',
        stationId: id,
        slug,
        xpReward: 50,
        stars: 3,
      },
    })
  }

  return achievements
}

export function generateSqlInsert(achievements: StationAchievement[]): string {
  const escapeSql = (str: string) => str.replace(/'/g, "''")

  const valuesRows = achievements.map((item) => {
    const code = escapeSql(item.code)
    const name = escapeSql(item.name)
    const description = escapeSql(item.description)
    const assets = escapeSql(JSON.stringify(item.assets))
    const displayConfig = escapeSql(JSON.stringify(item.displayConfig))
    const unlockRule = escapeSql(JSON.stringify(item.unlockRule))
    const content = escapeSql(JSON.stringify({ ...item.content, runtimeKey: item.runtimeKey }))

    return `  ('achievement', '${code}', 1, 'draft', '${name}', '${description}', NULL, 'common', '${assets}'::jsonb, '${displayConfig}'::jsonb, '${unlockRule}'::jsonb, '${content}'::jsonb, now(), now())`
  })

  return `-- Generated station completion achievements migration
-- Target: gamification_studio_items
-- Total: ${achievements.length} achievements (${ISLAND_CURRICULUM_LESSONS.length} Island Lessons + ${AIKI_RULES_DATA.length} Golden Rules)

INSERT INTO gamification_studio_items (
  content_type,
  code,
  version,
  status,
  name,
  description,
  kind,
  rarity,
  assets,
  display_config,
  unlock_rule,
  content,
  created_at,
  updated_at
) VALUES
${valuesRows.join(',\n')}
ON CONFLICT (code, version) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  assets = EXCLUDED.assets,
  display_config = EXCLUDED.display_config,
  unlock_rule = EXCLUDED.unlock_rule,
  content = EXCLUDED.content,
  updated_at = now();
`
}

export function main() {
  const achievements = generateStationAchievements()
  const outDir = path.resolve(__dirname, '../data-export')

  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  const jsonPayload = {
    items: achievements,
  }

  const jsonPath = path.join(outDir, 'station-achievements.json')
  fs.writeFileSync(jsonPath, JSON.stringify(jsonPayload, null, 2), 'utf-8')
  console.log(`[Achievement Generator] Wrote ${achievements.length} achievements to ${jsonPath}`)

  const sqlContent = generateSqlInsert(achievements)
  const sqlPath = path.join(outDir, 'station-achievements.sql')
  fs.writeFileSync(sqlPath, sqlContent, 'utf-8')
  console.log(`[Achievement Generator] Wrote SQL INSERT to ${sqlPath}`)
}

// Only execute when run directly
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main()
}
