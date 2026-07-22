import { getFirestore, Timestamp } from 'firebase-admin/firestore'
import { requireFirebaseAdminApp } from '../../infrastructure/firebase/firebase-admin.js'

export type ClassroomRealtimeEvent = {
  classId: string
  teacherId: string
  type: string
  payload: Record<string, string | number | boolean | null>
}

export async function publishClassroomEvent(event: ClassroomRealtimeEvent): Promise<string> {
  const firestore = getFirestore(requireFirebaseAdminApp())
  const classroom = firestore.collection('classrooms').doc(event.classId)
  const eventRef = classroom.collection('events').doc()
  const batch = firestore.batch()
  batch.set(classroom, {
    teacherId: event.teacherId,
    active: true,
    updatedAt: Timestamp.now(),
  }, { merge: true })
  batch.create(eventRef, {
    type: event.type,
    payload: event.payload,
    teacherId: event.teacherId,
    createdAt: Timestamp.now(),
    expiresAt: Timestamp.fromMillis(Date.now() + 24 * 60 * 60 * 1000),
  })
  await batch.commit()
  return eventRef.id
}
