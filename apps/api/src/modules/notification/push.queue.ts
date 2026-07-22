import { Redis } from 'ioredis'
import { Queue } from 'bullmq'
import { env } from '../../config/env.js'
import { prisma } from '../../infrastructure/database/prisma.js'

export const PUSH_QUEUE = 'aikids-notification-push'
export const PUSH_ATTEMPTS = 5
let connection: Redis | null = null
let queue: Queue | null = null

function getQueue(): Queue | null {
  if (!env.redisUrl || !env.firebaseEnabled || !env.firebasePushEnabled) return null
  if (!connection) connection = new Redis(env.redisUrl, { maxRetriesPerRequest: null })
  queue ??= new Queue(PUSH_QUEUE, { connection })
  return queue
}

export async function enqueueNotificationPush(notificationId: string): Promise<boolean> {
  const pushQueue = getQueue()
  if (!pushQueue) return false
  await pushQueue.add(
    'dispatch',
    { notificationId },
    {
      jobId: notificationId,
      attempts: PUSH_ATTEMPTS,
      backoff: { type: 'exponential', delay: 2_000 },
      removeOnComplete: 1_000,
      removeOnFail: 5_000,
    },
  )
  await prisma.notification.updateMany({
    where: { id: notificationId, pushStatus: 'not_requested' },
    data: { pushStatus: 'queued', pushNextAttemptAt: new Date() },
  })
  return true
}

export async function closePushQueue(): Promise<void> {
  await queue?.close()
  queue = null
  if (connection) await connection.quit()
  connection = null
}
