import { config } from 'dotenv'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  // Prisma does not manage PostgreSQL CHECK constraints. This static DDL keeps
  // the database aligned with the six onboarding paths without interpolating
  // any request or environment value into SQL.
  await prisma.$executeRawUnsafe(`
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_goal_check;
`)
  await prisma.$executeRawUnsafe(`
ALTER TABLE public.users ADD CONSTRAINT users_goal_check CHECK (
  goal IS NULL OR goal = ANY (ARRAY[
    'world','character','story','comic','motion','film','video'
  ]::text[])
);
`)
  console.log('users_goal_check updated')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
