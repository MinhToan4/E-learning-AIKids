import { getMessaging } from 'firebase-admin/messaging'
import { prisma } from '../../infrastructure/database/prisma.js'
import { requireFirebaseAdminApp } from '../../infrastructure/firebase/firebase-admin.js'
import { classifyFcmDelivery } from './fcm-delivery-policy.js'

function safeData(raw: string | null): Record<string, string> | undefined {
  if (!raw) return undefined
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>
    return Object.fromEntries(
      Object.entries(parsed)
        .filter(([, value]) => ['string', 'number', 'boolean'].includes(typeof value))
        .map(([key, value]) => [key.slice(0, 100), String(value).slice(0, 1000)]),
    )
  } catch {
    return undefined
  }
}

export async function dispatchNotificationPush(notificationId: string): Promise<void> {
  const notification = await prisma.notification.findUnique({
    where: { id: notificationId },
    include: {
      user: {
        select: {
          pushDevices: { where: { enabled: true }, select: { id: true, token: true } },
        },
      },
    },
  })
  if (!notification || notification.pushStatus === 'sent') return
  const devices = notification.user.pushDevices
  if (devices.length === 0) {
    await prisma.notification.update({
      where: { id: notificationId },
      data: { pushStatus: 'not_requested', pushLastError: null },
    })
    return
  }

  await prisma.notification.update({
    where: { id: notificationId },
    data: { pushStatus: 'processing', pushAttempts: { increment: 1 }, pushLastError: null },
  })

  let successes = 0
  let invalidTokens = 0
  let retryableFailures = 0
  let permanentFailures = 0
  for (let offset = 0; offset < devices.length; offset += 500) {
    const batch = devices.slice(offset, offset + 500)
    const messageData = {
      ...safeData(notification.data),
      notificationId: notification.id,
    }
    const result = await getMessaging(requireFirebaseAdminApp()).sendEachForMulticast({
      tokens: batch.map((device) => device.token),
      notification: { title: notification.title, body: notification.body },
      data: messageData,
      webpush: {
        notification: { tag: notification.id, renotify: false },
        fcmOptions: { link: '/' },
      },
    })
    successes += result.successCount
    const invalidIds = result.responses.flatMap((response, index) => {
      if (response.success) return []
      const decision = classifyFcmDelivery(response.error?.code)
      if (decision === 'invalid-token') {
        invalidTokens += 1
        return [batch[index]!.id]
      }
      if (decision === 'retry') retryableFailures += 1
      else permanentFailures += 1
      return []
    })
    if (invalidIds.length > 0) {
      await prisma.pushDevice.updateMany({
        where: { id: { in: invalidIds } },
        data: { enabled: false },
      })
    }
  }

  if (retryableFailures > 0) {
    throw Object.assign(
      new Error(`${retryableFailures} FCM deliveries require retry`),
      { logCode: 'FCM_RETRYABLE_DELIVERY_FAILURE' },
    )
  }

  const noReachableDevices = successes === 0 && invalidTokens === devices.length

  await prisma.notification.update({
    where: { id: notificationId },
    data: {
      pushStatus: noReachableDevices
        ? 'not_requested'
        : successes > 0
          ? 'sent'
          : 'failed',
      pushDispatchedAt: successes > 0 ? new Date() : null,
      pushLastError: permanentFailures > 0
        ? `${permanentFailures} permanent device deliveries failed`
        : null,
    },
  })
}
