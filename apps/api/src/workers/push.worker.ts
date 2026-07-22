import { Redis } from 'ioredis'
import { Worker } from 'bullmq'
import { env } from '../config/env.js'
import { prisma } from '../infrastructure/database/prisma.js'
import { dispatchNotificationPush } from '../modules/notification/fcm.service.js'
import { PUSH_ATTEMPTS, PUSH_QUEUE } from '../modules/notification/push.queue.js'

if (!env.redisUrl || !env.firebaseEnabled || !env.firebasePushEnabled) {
  throw new Error(
    'Push worker requires REDIS_URL, FIREBASE_ENABLED=true and FIREBASE_PUSH_ENABLED=true',
  )
}

const connection = new Redis(env.redisUrl, { maxRetriesPerRequest: null })
const worker = new Worker<{ notificationId: string }>(
  PUSH_QUEUE,
  async (job) => dispatchNotificationPush(job.data.notificationId),
  { connection, concurrency: Number(process.env.PUSH_WORKER_CONCURRENCY ?? 20) },
)

worker.on('failed', (job, error) => {
  if (!job) return
  void prisma.notification.updateMany({
    where: { id: job.data.notificationId },
    data: {
      pushStatus: job.attemptsMade >= PUSH_ATTEMPTS ? 'failed' : 'queued',
      pushLastError: error.message.slice(0, 500),
      pushNextAttemptAt: new Date(Date.now() + 60_000),
    },
  })
})

async function shutdown() {
  await worker.close()
  await connection.quit()
  await prisma.$disconnect()
}
process.once('SIGTERM', () => void shutdown().then(() => process.exit(0)))
process.once('SIGINT', () => void shutdown().then(() => process.exit(0)))
