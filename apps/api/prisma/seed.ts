/**
 * Seed entry: demo adults + L1/L2 curriculum (DB is source of truth).
 * - Catalog upsert always runs (CMS fields preserved unless SEED_OVERWRITE_CONTENT=true)
 * - Demo users only when DB empty of adults or SEED_FORCE=true
 */
import { PrismaClient } from '../src/generated/prisma/index.js'
import bcrypt from 'bcryptjs'
import { PLAN_CATALOG } from '@aikids/domain'
import { curriculumCourses } from './seed/courses/curriculum.js'
import { upsertCourse } from './seed/upsert-course.js'

const prisma = new PrismaClient()

async function seedPlansAndDemoSubscription(parentUserId: string) {
  for (const p of PLAN_CATALOG) {
    await prisma.plan.upsert({
      where: { id: p.code },
      create: {
        id: p.code,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        featuresJson: JSON.stringify(p.features),
        sortOrder: p.sortOrder,
        active: true,
      },
      update: {
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        featuresJson: JSON.stringify(p.features),
        sortOrder: p.sortOrder,
      },
    })
  }

  const active = await prisma.subscription.findFirst({
    where: { parentUserId, status: { in: ['active', 'trialing'] } },
  })
  if (!active) {
    // Demo household on Plus (3 seats) for 1 year — family app standard
    await prisma.subscription.create({
      data: {
        parentUserId,
        planId: 'plus',
        status: 'active',
        seats: 3,
        provider: 'manual',
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      },
    })
    await prisma.parentProfile.updateMany({
      where: { userId: parentUserId },
      data: { maxChildren: 3 },
    })
  }
}

async function seedDemoUsers() {
  const parentPass = await bcrypt.hash('ParentDemo1!', 10)
  const teacherPass = await bcrypt.hash('TeacherDemo1!', 10)
  const adminPass = await bcrypt.hash('AdminDemo1!', 10)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@demo.aikids.local' },
    create: {
      role: 'admin',
      email: 'admin@demo.aikids.local',
      passwordHash: adminPass,
      nickname: 'Quản trị Demo',
      onboarded: true,
      active: true,
    },
    update: { passwordHash: adminPass, role: 'admin', active: true },
  })

  const parent = await prisma.user.upsert({
    where: { email: 'parent@demo.aikids.local' },
    create: {
      role: 'parent',
      email: 'parent@demo.aikids.local',
      passwordHash: parentPass,
      nickname: 'Ba/Mẹ Demo',
      onboarded: true,
      active: true,
    },
    update: { passwordHash: parentPass, active: true },
  })

  const teacher = await prisma.user.upsert({
    where: { email: 'teacher@demo.aikids.local' },
    create: {
      role: 'teacher',
      email: 'teacher@demo.aikids.local',
      passwordHash: teacherPass,
      nickname: 'Cô Giáo Demo',
      onboarded: true,
      active: true,
    },
    update: { passwordHash: teacherPass, active: true },
  })

  await prisma.parentProfile.upsert({
    where: { userId: parent.id },
    create: { userId: parent.id },
    update: {},
  })
  await prisma.teacherProfile.upsert({
    where: { userId: teacher.id },
    create: { userId: teacher.id, displayName: 'Cô Giáo Demo' },
    update: {},
  })

  const classroom = await prisma.classRoom.upsert({
    where: { code: 'STAR-8' },
    create: {
      name: 'Lớp Sao Nhí 6–11',
      code: 'STAR-8',
      teacherId: teacher.id,
    },
    update: { teacherId: teacher.id },
  })

  await seedPlansAndDemoSubscription(parent.id)

  const existingStudent = await prisma.user.findFirst({
    where: { nickname: 'MựcCon', role: 'student' },
  })
  if (!existingStudent) {
    await prisma.user.create({
      data: {
        role: 'student',
        nickname: 'MựcCon',
        avatarId: 'avatar-robot',
        parentId: parent.id,
        classId: classroom.id,
        onboarded: true,
        goal: 'comic',
        level: 1,
        xp: 0,
        active: true,
      },
    })
  } else if (!existingStudent.parentId) {
    await prisma.user.update({
      where: { id: existingStudent.id },
      data: { parentId: parent.id, classId: classroom.id },
    })
  }

  console.log(
    `Demo users: admin=${admin.email}, parent=${parent.email}, teacher=${teacher.email}, class=${classroom.code}, family=plus`,
  )
}

async function main() {
  // Always ensure plan catalog exists (idempotent)
  for (const p of PLAN_CATALOG) {
    await prisma.plan.upsert({
      where: { id: p.code },
      create: {
        id: p.code,
        code: p.code,
        name: p.name,
        tagline: p.tagline,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        priceMonthly: p.priceMonthly,
        currency: p.currency,
        featuresJson: JSON.stringify(p.features),
        sortOrder: p.sortOrder,
        active: true,
      },
      update: {
        name: p.name,
        maxChildren: p.maxChildren,
        maxOpenCoursesPerChild: p.maxOpenCoursesPerChild,
        featuresJson: JSON.stringify(p.features),
      },
    })
  }

  const force = process.env.SEED_FORCE === 'true'
  const adultCount = await prisma.user.count({
    where: { role: { in: ['admin', 'parent', 'teacher'] } },
  })
  if (force || adultCount === 0) {
    await seedDemoUsers()
  } else {
    console.log('Skip demo users (adults exist; set SEED_FORCE=true to refresh)')
    const demoParent = await prisma.user.findFirst({
      where: { email: 'parent@demo.aikids.local' },
    })
    if (demoParent) await seedPlansAndDemoSubscription(demoParent.id)
  }

  // Soft-retire legacy 8–11 blob courses (keep rows for old enrollments)
  await prisma.course.updateMany({
    where: {
      id: {
        in: ['course-comic', 'course-robot', 'course-safety', 'course-voice'],
      },
    },
    data: {
      status: 'soon',
      recognitionJson: JSON.stringify({
        issuer: 'AI Kids Creator Academy',
        credential: 'Huy hiệu hoàn thành khóa trải nghiệm AI',
        finalAssessment:
          'Con hoàn thành sản phẩm cuối khóa, giải thích lựa chọn và sửa ít nhất một điểm sau khi tự kiểm tra.',
        frameworks: [
          {
            code: 'AI4K12',
            title: 'Tham chiếu Five Big Ideas in AI và tiến trình năng lực theo lứa tuổi',
          },
        ],
        disclaimer:
          'Đây là ghi nhận hoàn thành nội bộ của AI Kids Creator Academy. Việc tham chiếu khung năng lực không đồng nghĩa AI4K12 bảo trợ hay cấp chứng chỉ.',
      }),
    },
  })

  for (const course of curriculumCourses) {
    await upsertCourse(prisma, course)
  }

  const l1 = curriculumCourses.filter((c) => c.ageTrack === 'L1').length
  const l2 = curriculumCourses.filter((c) => c.ageTrack === 'L2').length
  const quests = curriculumCourses.reduce((n, c) => n + c.quests.length, 0)
  console.log(
    `Curriculum seeded: L1 courses=${l1}, L2 courses=${l2}, quests=${quests}`,
  )
  const styleQuest = await prisma.quest.findFirst({
    where: { practiceKind: 'style' },
  })
  console.log(
    `  style-pick station: ${styleQuest ? styleQuest.practiceKind : 'MISSING'}`,
  )
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
