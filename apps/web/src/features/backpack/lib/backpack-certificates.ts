export interface BackpackCertificate {
  id: string
  courseId: string
  courseTitle: string
  islandTitle: string
  studentName: string
  issuedDate: string
  stars: number
  xp: number
  claimedAt: number
}

export const OFFICIAL_COURSE_CERTIFICATE_ID = 'cert-course-aikid-official'

const STORAGE_KEY = 'aiki_backpack_certificates'

export function getBackpackCertificates(studentId?: string): BackpackCertificate[] {
  if (typeof window === 'undefined' || !window.localStorage) return []
  try {
    const key = studentId ? `${STORAGE_KEY}_${studentId}` : STORAGE_KEY
    const raw = localStorage.getItem(key)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveCertificateToBackpack(
  cert: Omit<BackpackCertificate, 'claimedAt'>,
  studentId?: string,
): BackpackCertificate {
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...cert, claimedAt: Date.now() }
  }
  const key = studentId ? `${STORAGE_KEY}_${studentId}` : STORAGE_KEY
  const current = getBackpackCertificates(studentId)
  const existingIdx = current.findIndex((c) => c.id === cert.id || c.courseId === cert.courseId)
  const entry: BackpackCertificate = {
    ...cert,
    claimedAt: Date.now(),
  }
  let next: BackpackCertificate[]
  if (existingIdx >= 0) {
    next = [...current]
    next[existingIdx] = entry
  } else {
    next = [entry, ...current]
  }
  try {
    localStorage.setItem(key, JSON.stringify(next))
    window.dispatchEvent(new CustomEvent('aikids:certificate-claimed', { detail: entry }))
  } catch {}
  return entry
}

export function isCertificateClaimed(courseId: string, studentId?: string): boolean {
  const current = getBackpackCertificates(studentId)
  return current.some((c) => c.courseId === courseId || c.id === courseId)
}
