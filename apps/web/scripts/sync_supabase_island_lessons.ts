import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('/Users/imam/storymee/0-Shared-Libs/prisma-client/dist');
import { ISLAND_CURRICULUM_LESSONS } from '../src/features/lesson/data/island-curriculum-registry';

const supabaseUrl = "postgresql://postgres.kkiimvaiwnibgfcmmnpg:TQXHpVh8AElMijTz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseUrl,
    },
  },
});

const COURSE_SLUG_TO_ISLAND: Record<string, number> = {
  'dao-1-nha-tham-hiem-ai': 1,
  'dao-2-hoa-si-ai': 2,
  'dao-3-biet-doi-nhan-vat-ai': 3,
  'dao-4-vuong-quoc-truyen-tranh-ai': 4,
  'dao-5-nha-phat-minh-tro-choi-ai': 5,
};

async function main() {
  console.log("=== SYNCING 22 ISLAND LESSONS TO SUPABASE DB ===");
  console.log(`Total SSOT lessons loaded: ${ISLAND_CURRICULUM_LESSONS.length}`);

  try {
    for (const [courseSlug, islandNum] of Object.entries(COURSE_SLUG_TO_ISLAND)) {
      const course = await prisma.lmsCourse.findFirst({
        where: { slug: courseSlug },
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
        console.warn(`Course not found: ${courseSlug}`);
        continue;
      }

      console.log(`\nProcessing Course: ${course.title} (${course.slug})`);

      const islandLessons = ISLAND_CURRICULUM_LESSONS.filter(
        (l) => l.islandNumber === islandNum
      ).sort((a, b) => {
        const aNum = parseFloat(a.lessonNumber.replace(/^\d+\./, ''));
        const bNum = parseFloat(b.lessonNumber.replace(/^\d+\./, ''));
        return aNum - bNum;
      });

      console.log(`Found ${islandLessons.length} SSOT lessons for Island ${islandNum}`);

      for (const version of course.versions) {
        console.log(`  Version ${version.version} (status: ${version.status})`);
        for (const module of version.modules) {
          console.log(`    Module: ${module.title} (lessons count: ${module.lessons.length})`);

          for (let i = 0; i < module.lessons.length; i++) {
            const dbLesson = module.lessons[i];
            const ssot = islandLessons[i] || islandLessons.find(l => l.slug === dbLesson.slug || dbLesson.title.includes(l.title));

            if (!ssot) {
              console.warn(`    No SSOT match for DB lesson [${dbLesson.id}] ${dbLesson.title}`);
              continue;
            }

            console.log(`    -> Matching [${dbLesson.id}] "${dbLesson.title}" with SSOT "${ssot.title}" (slug: ${ssot.slug})`);

            const existingMeta = (dbLesson.metadata && typeof dbLesson.metadata === 'object') ? dbLesson.metadata as Record<string, any> : {};

            const updatedMeta = {
              ...existingMeta,
              slug: ssot.slug,
              skill: ssot.skillLearned,
              goals: [ssot.objective, ssot.skillLearned],
              duration: "30 phút",
              reward: `Huy hiệu ${ssot.title}`,
              lessonFormat: "aiki-island-6steps",
              sixStageJourney: ssot.journey,
            };

            await prisma.lmsLesson.update({
              where: { id: dbLesson.id },
              data: {
                slug: ssot.slug,
                title: ssot.title,
                description: ssot.subtitle, // Khẩu hiệu / Lời dẫn khởi động
                metadata: updatedMeta,
              },
            });

            console.log(`       ✅ Updated lesson ${ssot.slug} successfully!`);
          }
        }
      }
    }

    console.log("\n🎉 ALL 22 ISLAND LESSONS SYNCED SUCCESSFULLY TO SUPABASE DB!");
  } catch (err) {
    console.error("Sync error:", err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
