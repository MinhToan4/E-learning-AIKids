import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('/Users/imam/storymee/0-Shared-Libs/prisma-client/dist');
import { AIKI_RULES_DATA } from '../src/features/rules/data/rules-data';

const supabaseUrl = "postgresql://postgres.kkiimvaiwnibgfcmmnpg:TQXHpVh8AElMijTz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseUrl,
    },
  },
});

async function main() {
  console.log("=== SYNCING 10 AIKI RULES TO SUPABASE DB ===");
  console.log(`Total Rules in SSOT: ${AIKI_RULES_DATA.length}`);

  try {
    const course = await prisma.lmsCourse.findFirst({
      where: {
        OR: [
          { id: '5a2221e2-91a7-42dc-8362-ac9e51d8cc5b' },
          { slug: 'muoi-quy-tac-xuong-sang-tao' },
          { slug: 'aiki-rules' },
        ],
      },
      include: {
        versions: {
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
      console.error("Course Module 0 (muoi-quy-tac-xuong-sang-tao) not found in Supabase DB!");
      return;
    }

    console.log(`\nFound Course: ${course.title} (ID: ${course.id}, slug: ${course.slug})`);
    console.log(`Total Course Versions: ${course.versions.length}`);

    for (const version of course.versions) {
      console.log(`\n--- Processing Version ${version.version} (Status: ${version.status}, ID: ${version.id}) ---`);
      for (const module of version.modules) {
        console.log(`  Module: ${module.title} (Lessons count: ${module.lessons.length})`);

        for (let i = 0; i < module.lessons.length; i++) {
          const dbLesson = module.lessons[i];
          const rule = AIKI_RULES_DATA[i];

          if (!rule) {
            console.warn(`    ⚠️ No rule data found for lesson index ${i} [${dbLesson.id}]`);
            continue;
          }

          const targetTitle = `QT${rule.id} — ${rule.title}`;
          console.log(`    -> Syncing Lesson [${dbLesson.id}] sortOrder=${dbLesson.sortOrder}:`);
          console.log(`       Old Title: "${dbLesson.title}"`);
          console.log(`       New Title: "${targetTitle}"`);

          const existingMeta = (dbLesson.metadata && typeof dbLesson.metadata === 'object')
            ? (dbLesson.metadata as Record<string, any>)
            : {};

          const updatedMeta = {
            ...existingMeta,
            ruleId: rule.id,
            ruleCode: rule.code,
            skill: rule.skill,
            akiTip: rule.akiTip,
            goals: [rule.goal],
            duration: `${rule.durationSec} giây`,
            posterImage: rule.posterImage,
            audioVoiceText: rule.audioVoiceText,
            slides: rule.slides,
            check: rule.questions,
            lessonFormat: 'aiki-rule-3steps',
          };

          await prisma.lmsLesson.update({
            where: { id: dbLesson.id },
            data: {
              title: targetTitle,
              description: rule.akiTip,
              metadata: updatedMeta,
            },
          });

          console.log(`       ✅ Updated Lesson ${rule.code} successfully!`);
        }
      }
    }

    console.log("\n🎉 ALL 10 RULES SYNCED TO ALL VERSIONS IN SUPABASE DB SUCCESSFULLY!");
  } catch (err) {
    console.error("❌ Sync error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
