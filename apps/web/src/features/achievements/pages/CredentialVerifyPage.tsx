import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router'
import { BadgeCheck, BadgeX } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { PageSkeleton } from '@/shared/components/ui/Skeleton'

type Verification = {
  valid: boolean
  status: string
  credential?: {
    kind: string
    templateName: string
    learnerNickname: string | null
    courseTitle: string
    issuedAt: string
    revokedAt: string | null
  }
}

export function CredentialVerifyPage() {
  const { code = '' } = useParams()
  const [result, setResult] = useState<Verification | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!/^[a-f0-9]{32}$/.test(code)) {
      setResult({ valid: false, status: 'invalid_code' })
      setLoading(false)
      return
    }
    void api<Verification>(`/api/public/credentials/${code}`)
      .then(setResult)
      .catch(() => setResult({ valid: false, status: 'not_found' }))
      .finally(() => setLoading(false))
  }, [code])

  if (loading) return <PageSkeleton rows={3} />
  const valid = result?.valid === true && result.credential

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl items-center px-4 py-10">
      <section className="ui-card w-full p-6 text-center sm:p-8">
        {valid ? (
          <>
            <BadgeCheck className="mx-auto text-success" size={64} aria-hidden="true" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-success">
              Chứng nhận hợp lệ
            </p>
            <h1 className="mt-2 font-display text-3xl">{result.credential!.templateName}</h1>
            <dl className="mx-auto mt-6 grid max-w-md gap-3 rounded-2xl bg-mint-50 p-5 text-left">
              <Row label="Học viên" value={result.credential!.learnerNickname ?? 'Không công bố'} />
              <Row label="Khóa học" value={result.credential!.courseTitle} />
              <Row
                label="Ngày cấp"
                value={new Intl.DateTimeFormat('vi-VN', { dateStyle: 'long' }).format(
                  new Date(result.credential!.issuedAt),
                )}
              />
              <Row label="Mã xác minh" value={code} mono />
            </dl>
          </>
        ) : (
          <>
            <BadgeX className="mx-auto text-danger" size={64} aria-hidden="true" />
            <p className="mt-4 text-xs font-extrabold uppercase tracking-widest text-danger">
              Không xác minh được
            </p>
            <h1 className="mt-2 font-display text-3xl">Chứng nhận không hợp lệ</h1>
            <p className="mt-3 text-sm text-muted">
              Mã không tồn tại, sai định dạng hoặc chứng nhận đã bị thu hồi.
            </p>
          </>
        )}
        <Link to="/" className="ui-btn ui-btn-secondary mt-6">
          Về AI Kids Creator Academy
        </Link>
      </section>
    </main>
  )
}

function Row({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs font-bold uppercase text-muted">{label}</dt>
      <dd className={mono ? 'mt-1 break-all font-mono text-xs' : 'mt-1 font-bold'}>{value}</dd>
    </div>
  )
}
