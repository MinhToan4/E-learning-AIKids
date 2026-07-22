import { PrismaClient } from '../src/generated/prisma/index.js'

const prisma = new PrismaClient()

try {
  const rows = await prisma.$queryRaw<
    Array<{ conname: string; definition: string }>
  >`
    SELECT conname, pg_get_constraintdef(oid) AS definition
    FROM pg_constraint
    WHERE connamespace = 'public'::regnamespace
      AND contype = 'c'
    ORDER BY conname
  `
  console.log(JSON.stringify(rows, null, 2))
} finally {
  await prisma.$disconnect()
}
