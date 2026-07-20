import { config } from 'dotenv'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '../src/generated/prisma/index.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
config({ path: resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  await prisma.$executeRawUnsafe(`
ALTER TABLE public.quests DROP CONSTRAINT IF EXISTS quests_practice_kind_check;
`)
  await prisma.$executeRawUnsafe(`
ALTER TABLE public.quests ADD CONSTRAINT quests_practice_kind_check CHECK (
  practice_kind = ANY (ARRAY[
    'chips','story','comic','detective','character','video','intro','style',
    'journal','palette','match','drag','spin','sketch','ai_pick','reflect'
  ]::text[])
);
`)
  console.log('practice_kind CHECK updated')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
