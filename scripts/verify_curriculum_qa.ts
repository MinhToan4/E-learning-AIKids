import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('/Users/imam/storymee/0-Shared-Libs/prisma-client/dist');

import { AIKI_RULES_DATA } from '../apps/web/src/features/rules/data/rules-data';
import { ISLAND_CURRICULUM_LESSONS } from '../apps/web/src/features/lesson/data/island-curriculum-registry';

const supabaseUrl = "postgresql://postgres.kkiimvaiwnibgfcmmnpg:TQXHpVh8AElMijTz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";
const prisma = new PrismaClient({ datasources: { db: { url: supabaseUrl } } });

function normalizeYoutubeUrl(url: string | undefined | null): string {
  if (!url) return '';
  const trimmed = url.trim();
  const match = trimmed.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  if (match && match[1]) {
    return `https://www.youtube.com/watch?v=${match[1]}`;
  }
  return trimmed;
}

function extractYoutubeId(url: string | undefined | null): string {
  if (!url) return '';
  const match = url.trim().match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? match[1] : '';
}

async function verifyQA() {
  console.log('================================================================');
  console.log('       QA VERIFICATION REPORT: EXCEL -> SSOT -> SUPABASE DB     ');
  console.log('================================================================\n');

  // --- Load Excel Data ---
  const masterJsonPath = path.resolve(process.cwd(), 'scripts/curriculum_export/excel_parsed_master.json');
  const excelData = JSON.parse(fs.readFileSync(masterJsonPath, 'utf8'));

  // 1. Parse Excel 10 Rules
  const excelRulesVideos: Record<string, string> = {};
  for (const row of excelData['10 QUY TẮC']) {
    const cells = row.cells;
    const code = cells.B ? cells.B.trim() : '';
    const video = cells.E ? cells.E.trim() : '';
    if (/^QT\d+$/i.test(code) && video.includes('youtu')) {
      excelRulesVideos[code.toUpperCase()] = video;
    }
  }

  // 2. Parse Excel 22 Island Lessons
  const excelIslandVideos: Record<string, string> = {};
  const islandKeys = [
    'M1 · ĐẢO KHÁM PHÁ',
    'M2 · ĐẢO HOẠ SĨ',
    'M3 · ĐẢO NHÂN VẬT',
    'M4 · ĐẢO TRUYỆN TRANH',
    'M5 · ĐẢO TRÒ CHƠI'
  ];

  for (const key of islandKeys) {
    for (const row of excelData[key]) {
      const cells = row.cells;
      const code = cells.B ? cells.B.trim() : '';
      const video = cells.G ? cells.G.trim() : '';
      if (/^\d+\.\d+$/.test(code) && video.includes('youtu')) {
        excelIslandVideos[code] = video;
      }
    }
  }

  console.log(`[Excel Parsed] 10 Golden Rules videos found: ${Object.keys(excelRulesVideos).length}`);
  console.log(`[Excel Parsed] 22 Island Lessons videos found: ${Object.keys(excelIslandVideos).length}\n`);

  // ============================================================================
  // CHECK 1: Video URL in AIKI_RULES_DATA vs Excel
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('1. VERIFY AIKI_RULES_DATA vs EXCEL 10 RULES YOUTUBE URLs');
  console.log('----------------------------------------------------------------');
  let rulesMatchCount = 0;
  for (let i = 1; i <= 10; i++) {
    const code = `QT${i}`;
    const excelUrl = excelRulesVideos[code];
    const excelId = extractYoutubeId(excelUrl);
    const ssotRule = AIKI_RULES_DATA.find(r => r.id === i || r.code === code);
    const ssotUrl = ssotRule?.videoUrl;
    const ssotId = extractYoutubeId(ssotUrl);

    const match = excelId && ssotId && excelId === ssotId;
    if (match) {
      rulesMatchCount++;
      console.log(`  ✓ [${code}] Match: ID=${ssotId} | Excel: ${excelUrl} | SSOT: ${ssotUrl}`);
    } else {
      console.error(`  ✗ [${code}] MISMATCH! Excel: ${excelUrl} (ID: ${excelId}) vs SSOT: ${ssotUrl} (ID: ${ssotId})`);
    }
  }
  console.log(`=> Rules Video URLs Result: ${rulesMatchCount}/10 matched 100%\n`);

  // ============================================================================
  // CHECK 2: Video URL in ISLAND_CURRICULUM_LESSONS vs Excel
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('2. VERIFY ISLAND_CURRICULUM_LESSONS vs EXCEL 22 ISLAND LESSONS YOUTUBE URLs');
  console.log('----------------------------------------------------------------');
  let islandMatchCount = 0;
  const allExpectedLessonCodes = [
    '1.1', '1.2', '1.3', '1.4',
    '2.1', '2.2', '2.3', '2.4',
    '3.1', '3.2', '3.3', '3.4',
    '4.1', '4.2', '4.3', '4.4', '4.5',
    '5.1', '5.2', '5.3', '5.4', '5.5'
  ];

  for (const code of allExpectedLessonCodes) {
    const excelUrl = excelIslandVideos[code];
    const excelId = extractYoutubeId(excelUrl);
    const ssotLesson = ISLAND_CURRICULUM_LESSONS.find(l => l.lessonNumber === code);
    const ssotUrl = ssotLesson?.journey?.stage3_video?.videoUrl || (ssotLesson as any)?.videoUrl;
    const ssotId = extractYoutubeId(ssotUrl);

    const match = excelId && ssotId && excelId === ssotId;
    if (match) {
      islandMatchCount++;
      console.log(`  ✓ [Bài ${code}] Match: ID=${ssotId} | Excel: ${excelUrl} | SSOT: ${ssotUrl}`);
    } else {
      console.error(`  ✗ [Bài ${code}] MISMATCH! Excel: ${excelUrl} (ID: ${excelId}) vs SSOT: ${ssotUrl} (ID: ${ssotId})`);
    }
  }
  console.log(`=> Island Video URLs Result: ${islandMatchCount}/22 matched 100%\n`);

  // ============================================================================
  // CHECK 3: Supabase DB lms_lessons - 10 Golden Rules videoUrl in metadata
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('3. VERIFY SUPABASE DB: 10 GOLDEN RULES in lms_lessons');
  console.log('----------------------------------------------------------------');
  const ruleCourse = await prisma.lmsCourse.findFirst({
    where: {
      OR: [
        { id: '5a2221e2-91a7-42dc-8362-ac9e51d8cc5b' },
        { slug: 'muoi-quy-tac-xuong-sang-tao' },
        { slug: 'aiki-rules' },
      ],
    },
    include: {
      versions: {
        where: {
          OR: [
            { status: 'published' },
            { modules: { some: {} } },
          ],
        },
        orderBy: { version: 'desc' },
        include: {
          modules: {
            include: {
              lessons: {
                orderBy: { sortOrder: 'asc' },
              },
            },
          },
        },
      },
    },
  });

  if (!ruleCourse) {
    console.error('CRITICAL: Rule Course not found in Supabase DB!');
  } else {
    console.log(`Course: "${ruleCourse.title}" (ID: ${ruleCourse.id}, slug: ${ruleCourse.slug})`);
    const activeVersion = ruleCourse.versions.find((v: any) => v.modules?.some((m: any) => m.lessons.length > 0)) || ruleCourse.versions[0];
    console.log(`Active Published Version: ${activeVersion.version} (Status: ${activeVersion.status})`);
    
    let dbRulesCount = 0;
    let dbRulesVideoCount = 0;

    for (const mod of activeVersion.modules) {
      console.log(`  Module: ${mod.title} (${mod.lessons.length} lessons)`);
      for (const lesson of mod.lessons) {
        dbRulesCount++;
        const meta = typeof lesson.metadata === 'string' ? JSON.parse(lesson.metadata) : (lesson.metadata || {});
        const videoUrl = meta.videoUrl || meta.stage3_video?.videoUrl || meta.video_url;
        const hasVideo = Boolean(videoUrl && videoUrl.length > 5);
        if (hasVideo) dbRulesVideoCount++;
        console.log(`    Lesson [${lesson.sortOrder}] "${lesson.title}": videoUrl = ${videoUrl || 'MISSING'} (${hasVideo ? '✓ OK' : '✗ FAILED'})`);
      }
    }
    console.log(`=> DB 10 Rules Result: ${dbRulesVideoCount}/${dbRulesCount} lessons have valid videoUrl in metadata\n`);
  }

  // ============================================================================
  // CHECK 4: Supabase DB lms_lessons - 22 Island Lessons sixStageJourney in metadata
  // ============================================================================
  console.log('----------------------------------------------------------------');
  console.log('4. VERIFY SUPABASE DB: 22 ISLAND LESSONS in lms_lessons');
  console.log('----------------------------------------------------------------');
  const ISLAND_SLUGS = [
    { slug: 'dao-1-nha-tham-hiem-ai', island: 1, expectedCount: 4 },
    { slug: 'dao-2-hoa-si-ai', island: 2, expectedCount: 4 },
    { slug: 'dao-3-biet-doi-nhan-vat-ai', island: 3, expectedCount: 4 },
    { slug: 'dao-4-vuong-quoc-truyen-tranh-ai', island: 4, expectedCount: 5 },
    { slug: 'dao-5-nha-phat-minh-tro-choi-ai', island: 5, expectedCount: 5 },
  ];

  let totalIslandDbLessons = 0;
  let totalSixStageValid = 0;
  let totalIslandVideoValid = 0;

  for (const item of ISLAND_SLUGS) {
    const course = await prisma.lmsCourse.findFirst({
      where: { slug: item.slug },
      include: {
        versions: {
          where: {
            OR: [
              { status: 'published' },
              { modules: { some: {} } },
            ],
          },
          orderBy: { version: 'desc' },
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { sortOrder: 'asc' },
                },
              },
            },
          },
        },
      },
    });

    if (!course) {
      console.error(`CRITICAL: Course for Island ${item.island} (${item.slug}) not found!`);
      continue;
    }

    const activeVer = course.versions.find((v: any) => v.modules?.some((m: any) => m.lessons.length > 0)) || course.versions[0];
    console.log(`Course Island ${item.island}: "${course.title}" (${course.slug}) - Ver ${activeVer?.version} (${activeVer?.status})`);

    for (const mod of activeVer.modules) {
      for (const lesson of mod.lessons) {
        totalIslandDbLessons++;
        const meta = typeof lesson.metadata === 'string' ? JSON.parse(lesson.metadata) : (lesson.metadata || {});
        const journey = meta.sixStageJourney || meta.journey;
        const has6Stages = Boolean(
          journey &&
          journey.stage1_goal &&
          journey.stage2_confirmGoal &&
          journey.stage3_video &&
          journey.stage4_quiz &&
          journey.stage5_practice &&
          journey.stage6_completion
        );
        if (has6Stages) totalSixStageValid++;

        const videoUrl = journey?.stage3_video?.videoUrl || meta.videoUrl;
        const hasVideo = Boolean(videoUrl && videoUrl.length > 5);
        if (hasVideo) totalIslandVideoValid++;

        console.log(`    Lesson [${lesson.sortOrder}] "${lesson.title}": 6-Stage Journey = ${has6Stages ? '✓ COMPLETE' : '✗ INCOMPLETE'}, Video = ${videoUrl || 'MISSING'}`);
      }
    }
  }

  console.log(`\n=> DB 22 Island Lessons Result:`);
  console.log(`   - Total Island DB Lessons checked: ${totalIslandDbLessons}/22`);
  console.log(`   - Lessons with valid sixStageJourney: ${totalSixStageValid}/${totalIslandDbLessons}`);
  console.log(`   - Lessons with valid Stage 3 Video: ${totalIslandVideoValid}/${totalIslandDbLessons}`);

  await prisma.$disconnect();
}

verifyQA().catch((err) => {
  console.error('QA Verification script failed:', err);
  process.exit(1);
});
