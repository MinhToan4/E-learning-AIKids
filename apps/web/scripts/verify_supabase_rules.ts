import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PrismaClient } = require('/Users/imam/storymee/0-Shared-Libs/prisma-client/dist');

const supabaseUrl = "postgresql://postgres.kkiimvaiwnibgfcmmnpg:TQXHpVh8AElMijTz@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: supabaseUrl,
    },
  },
});

async function main() {
  console.log("=== VERIFYING SUPABASE RULES IN DB ===");

  // 1. Check specific lesson 0da9d441-43a0-4d00-84d7-e8f8958e2aad
  const targetId = '0da9d441-43a0-4d00-84d7-e8f8958e2aad';
  const targetLesson = await prisma.lmsLesson.findUnique({
    where: { id: targetId },
  });

  console.log(`\n1. Target Lesson [${targetId}]:`);
  if (!targetLesson) {
    console.error(`❌ Lesson ${targetId} not found!`);
  } else {
    console.log(`   Title: "${targetLesson.title}"`);
    console.log(`   Metadata:`, JSON.stringify(targetLesson.metadata, null, 2));
  }

  // 2. Check all lessons in course 5a2221e2-91a7-42dc-8362-ac9e51d8cc5b
  const courseId = '5a2221e2-91a7-42dc-8362-ac9e51d8cc5b';
  const course = await prisma.lmsCourse.findUnique({
    where: { id: courseId },
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
    console.error(`❌ Course ${courseId} not found!`);
    return;
  }

  console.log(`\n2. Course ${course.title} (ID: ${course.id}):`);
  for (const v of course.versions) {
    console.log(`\n--- Version: ${v.version} (status: ${v.status}) ---`);
    for (const m of v.modules) {
      console.log(`  Module: ${m.title} (${m.lessons.length} lessons)`);
      for (const l of m.lessons) {
        const meta = (l.metadata as any) || {};
        const goals = meta.goals || [];
        const lessonFormat = meta.lessonFormat;
        const hasTreHieu = JSON.stringify(goals).includes('Trẻ hiểu') || JSON.stringify(l.title).includes('Trẻ hiểu');
        const hasCon = l.title.includes('con') || l.title.includes('Con') || l.title.includes('QT');
        console.log(`    Lesson [${l.id}] sortOrder=${l.sortOrder}:`);
        console.log(`      Title: "${l.title}"`);
        console.log(`      Format: ${lessonFormat}`);
        console.log(`      Goals: ${JSON.stringify(goals)}`);
        console.log(`      Check "Trẻ hiểu" absent: ${!hasTreHieu}`);
        console.log(`      Check "con" 1:1 tone: ${hasCon}`);
      }
    }
  }

  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
