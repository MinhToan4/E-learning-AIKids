import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { ProgressBar } from '@/components/ui/Progress'
import { PARENT_FEEDBACK_TEMPLATES } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import {
  Check,
  Download,
  MessageSquareWarning,
  Shield,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/cn'

function PageTitle({
  title,
  subtitle,
}: {
  title: string
  subtitle: string
}) {
  return (
    <div className="mb-6 border-b border-slate-200 pb-4">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
        {title}
      </h1>
      <p className="mt-1 text-sm text-slate-500 sm:text-base">{subtitle}</p>
    </div>
  )
}

function Metric({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-2 text-lg font-semibold leading-snug text-slate-900 sm:text-xl">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-slate-400">{hint}</p> : null}
    </div>
  )
}

export function ParentOverviewPage() {
  const child = useDemoStore((s) => s.child)
  const project = useDemoStore((s) => s.currentProject)
  const skills = useDemoStore((s) => s.skills)
  const approvals = useDemoStore((s) => s.approvals)
  const privacy = useDemoStore((s) => s.privacy)
  const assets = useDemoStore((s) => s.backpackAssets)
  const stars = useDemoStore((s) => s.stars)
  const pending = approvals.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-6">
      <PageTitle
        title="Tổng quan phụ huynh"
        subtitle={`Theo dõi tiến bộ của ${child.nickname} — minh bạch, không giám sát quá mức.`}
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Metric label="Dự án đang làm" value={project.title} />
        <Metric label="Chờ duyệt" value={`${pending} yêu cầu`} hint="Chỉ gia đình / lớp" />
        <Metric label="Sản phẩm" value={`${assets.length} mục`} />
        <Metric
          label="Quyền riêng tư"
          value={privacy.allowClassGallery ? 'Gallery lớp: bật' : 'Cao (mặc định)'}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
          <h2 className="text-base font-semibold text-slate-900">Kỹ năng đã luyện</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {skills.map((s) => (
              <div key={s.skillId}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="font-medium text-slate-700">{s.label}</span>
                  <span className="text-slate-400">Lv {s.level}</span>
                </div>
                <ProgressBar value={s.confidence * 100} />
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-3 lg:col-span-2">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
            <div className="flex gap-2">
              <Shield className="mt-0.5 size-5 shrink-0 text-emerald-700" aria-hidden />
              <div>
                <p className="text-sm font-semibold text-emerald-900">An toàn</p>
                <p className="mt-1 text-sm text-emerald-800/90">
                  Không sự kiện rủi ro trong phiên demo. Sản phẩm mặc định riêng tư.
                  Không quảng cáo, không chat giữa học sinh.
                </p>
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs font-semibold uppercase text-slate-500">Sao / XP (game học)</p>
            <p className="mt-1 text-2xl font-semibold text-slate-900">{stars} sao</p>
            <p className="text-sm text-slate-500">
              {child.xp} XP · Cấp {child.level} · Phản hồi tích cực, không phạt
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ParentApprovalsPage() {
  const approvals = useDemoStore((s) => s.approvals)
  const approveShare = useDemoStore((s) => s.approveShare)
  const requestChanges = useDemoStore((s) => s.requestChanges)
  const addToast = useDemoStore((s) => s.addToast)
  const [feedbackFor, setFeedbackFor] = useState<string | null>(null)

  return (
    <div className="space-y-5">
      <PageTitle
        title="Duyệt chia sẻ"
        subtitle="Chỉ Gia đình hoặc Lớp học riêng tư — không public web."
      />

      {approvals.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-white p-8 text-center text-slate-500">
          Không có yêu cầu chờ duyệt.
        </div>
      ) : (
        <div className="space-y-3">
          {approvals.map((ap) => (
            <article
              key={ap.id}
              className="grid gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:grid-cols-[200px_1fr] md:p-5"
            >
              <img
                src={ap.thumbnail}
                alt=""
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
              <div>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {ap.projectTitle}
                  </h2>
                  <StatusPill status={ap.status} />
                </div>
                <p className="mt-1 text-sm text-slate-500">
                  Phạm vi:{' '}
                  {ap.destination === 'family'
                    ? 'Chỉ gia đình'
                    : ap.destination === 'class'
                      ? 'Lớp học riêng tư'
                      : 'Không chia sẻ'}
                  {ap.aiAssisted ? ' · Có AI hỗ trợ' : ''}
                </p>
                {ap.feedback ? (
                  <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
                    Phản hồi: {ap.feedback}
                  </p>
                ) : null}
                {ap.status === 'pending' ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button
                      onClick={() => {
                        approveShare(ap.id)
                        addToast({ type: 'success', title: 'Đã duyệt chia sẻ' })
                      }}
                    >
                      <Check className="size-4" aria-hidden />
                      Duyệt
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() =>
                        setFeedbackFor(feedbackFor === ap.id ? null : ap.id)
                      }
                    >
                      <MessageSquareWarning className="size-4" aria-hidden />
                      Yêu cầu chỉnh
                    </Button>
                  </div>
                ) : null}
                {feedbackFor === ap.id ? (
                  <div className="mt-3 space-y-2">
                    {PARENT_FEEDBACK_TEMPLATES.map((t) => (
                      <button
                        key={t}
                        type="button"
                        className="block min-h-11 w-full cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 text-left text-sm font-medium text-slate-700 hover:border-slate-400"
                        onClick={() => {
                          requestChanges(ap.id, t)
                          setFeedbackFor(null)
                          addToast({ type: 'info', title: 'Đã gửi phản hồi mẫu' })
                        }}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                ) : null}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}

function StatusPill({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2.5 py-1 text-xs font-semibold',
        status === 'pending' && 'bg-amber-100 text-amber-800',
        status === 'approved' && 'bg-emerald-100 text-emerald-800',
        status === 'changes_requested' && 'bg-slate-100 text-slate-700',
      )}
    >
      {status === 'pending'
        ? 'Chờ duyệt'
        : status === 'approved'
          ? 'Đã duyệt'
          : 'Cần chỉnh'}
    </span>
  )
}

export function ParentPrivacyPage() {
  const privacy = useDemoStore((s) => s.privacy)
  const setPrivacy = useDemoStore((s) => s.setPrivacy)
  const resetDemo = useDemoStore((s) => s.resetDemo)
  const addToast = useDemoStore((s) => s.addToast)

  const rows: {
    key: keyof typeof privacy
    label: string
    help: string
  }[] = [
    {
      key: 'allowClassGallery',
      label: 'Cho phép gallery lớp',
      help: 'Chỉ sau khi phụ huynh duyệt từng sản phẩm.',
    },
    {
      key: 'allowFreeText',
      label: 'Cho phép nhập chữ tự do ngắn',
      help: 'Vẫn có bộ lọc PII và an toàn nội dung.',
    },
    {
      key: 'allowAudioNarration',
      label: 'Cho phép giọng kể giả lập',
      help: 'Không clone giọng trẻ hoặc người thật.',
    },
  ]

  return (
    <div className="space-y-5">
      <PageTitle
        title="Quyền riêng tư"
        subtitle="High privacy mặc định · Không quảng cáo nhắm mục tiêu · Data minimization"
      />

      <div className="space-y-2">
        {rows.map((row) => (
          <div
            key={row.key}
            className="flex items-center justify-between gap-4 rounded-xl border border-slate-200 bg-white px-4 py-4 shadow-sm"
          >
            <div>
              <p className="font-medium text-slate-900">{row.label}</p>
              <p className="text-sm text-slate-500">{row.help}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacy[row.key]}
              onClick={() => setPrivacy({ [row.key]: !privacy[row.key] })}
              className={cn(
                'relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors',
                privacy[row.key] ? 'bg-slate-900' : 'bg-slate-300',
              )}
            >
              <span
                className={cn(
                  'absolute top-1 size-6 rounded-full bg-white shadow transition-transform',
                  privacy[row.key] ? 'left-7' : 'left-1',
                )}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">Dữ liệu</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              addToast({
                type: 'success',
                title: 'Tải portfolio (demo)',
                description: 'Production sẽ export JSON/PDF.',
              })
            }
          >
            <Download className="size-4" aria-hidden />
            Tải portfolio
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              resetDemo()
              addToast({ type: 'warning', title: 'Đã xóa hồ sơ demo' })
            }}
          >
            Xóa hồ sơ demo
          </Button>
        </div>
        <p className="mt-3 flex gap-2 text-sm text-slate-500">
          <AlertCircle className="mt-0.5 size-4 shrink-0" aria-hidden />
          Production cần tư vấn pháp lý (COPPA / Children’s Code). Prototype không thu
          thập email trẻ.
        </p>
      </div>
    </div>
  )
}
