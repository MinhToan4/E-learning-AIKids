/**
 * Seed entry: demo adults + courses (DB is source of truth).
 * - Catalog upsert always runs (CMS fields preserved unless SEED_OVERWRITE_CONTENT=true)
 * - Demo users only when DB empty of adults or SEED_FORCE=true
 * - Docker SEED_ON_START=never skips this script entirely
 */
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { courseComic } from './seed/courses/comic.js'
import { courseSafety } from './seed/courses/safety.js'
import { courseVoice } from './seed/courses/voice.js'
import { courseRobot } from './seed/courses/robot.js'
import { upsertCourse } from './seed/upsert-course.js'

const prisma = new PrismaClient()

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

  const classroom = await prisma.classRoom.upsert({
    where: { code: 'STAR-8' },
    create: {
      name: 'Lớp Sao Nhí 8–11',
      code: 'STAR-8',
      teacherId: teacher.id,
    },
    update: { teacherId: teacher.id },
  })

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
        level: 1,
        xp: 0,
        onboarded: false,
        goal: 'comic',
        active: true,
      },
    })
  } else {
    await prisma.user.update({
      where: { id: existingStudent.id },
      data: { parentId: parent.id, classId: classroom.id, active: true },
    })
  }

  return admin.id
}

async function main() {
  const adultCount = await prisma.user.count({
    where: { role: { in: ['admin', 'parent', 'teacher'] } },
  })
  const force = process.env.SEED_FORCE === 'true'

  let adminId = 'n/a'
  if (adultCount === 0 || force) {
    adminId = await seedDemoUsers()
    console.log(`Demo users seeded (force=${force})`)
  } else {
    console.log(
      'Demo users skipped (adults already present; set SEED_FORCE=true to refresh)',
    )
  }

  // Always upsert catalog so new stations (e.g. style-pick) appear; CMS fields safe
  for (const course of [courseComic, courseSafety, courseVoice, courseRobot]) {
    await upsertCourse(prisma, course)
  }

  const openCount = await prisma.course.count({ where: { status: 'open' } })
  const questCount = await prisma.quest.count()
  const withVideo = await prisma.quest.count({
    where: { videoUrl: { not: null } },
  })
  const styleQuest = await prisma.quest.findUnique({
    where: { id: 'style-pick' },
  })

  console.log('Seed OK')
  console.log(`  admin id: ${adminId}`)
  console.log(
    `  open courses: ${openCount}, quests: ${questCount}, with videoUrl: ${withVideo}`,
  )
  console.log(
    `  style-pick station: ${styleQuest ? styleQuest.practiceKind : 'MISSING'}`,
  )
  console.log('  admin: admin@demo.aikids.local / AdminDemo1!')
  console.log('  parent: parent@demo.aikids.local / ParentDemo1!')
  console.log('  teacher: teacher@demo.aikids.local / TeacherDemo1!')
  console.log('  student nickname: MựcCon (avatar-robot)')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
