import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { ProgressBar } from '@/components/ui/Progress'
import { PARENT_FEEDBACK_TEMPLATES } from '@/data/mock'
import { useDemoStore } from '@/store/demo-store'
import { useState } from 'react'
import { Check, MessageSquareWarning, Shield } from 'lucide-react'

export function ParentOverviewPage() {
  const child = useDemoStore((s) => s.child)
  const project = useDemoStore((s) => s.currentProject)
  const skills = useDemoStore((s) => s.skills)
  const approvals = useDemoStore((s) => s.approvals)
  const privacy = useDemoStore((s) => s.privacy)
  const assets = useDemoStore((s) => s.backpackAssets)
  const pending = approvals.filter((a) => a.status === 'pending').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl font-semibold">Tổng quan phụ huynh</h1>
        <p className="text-muted">
          Theo dõi sản phẩm của {child.nickname} — không giám sát quá mức.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          { label: 'Dự án đang làm', value: project.title },
          { label: 'Chờ duyệt', value: `${pending} yêu cầu` },
          { label: 'Sản phẩm mới', value: `${assets.length} mục` },
          { label: 'Quyền riêng tư', value: privacy.allowClassGallery ? 'Gallery lớp: bật' : 'Cao (mặc định)' },
        ].map((m) => (
          <Card key={m.label}>
            <p className="text-sm font-bold text-muted">{m.label}</p>
            <p className="mt-2 font-display text-xl font-semibold leading-snug">{m.value}</p>
          </Card>
        ))}
      </div>

      <Card>
        <h2 className="font-display text-xl font-semibold">Kỹ năng đã luyện</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {skills.map((s) => (
            <div key={s.skillId}>
              <div className="mb-1 flex justify-between text-sm font-semibold">
                <span>{s.label}</span>
                <span className="text-muted">Lv {s.level}</span>
              </div>
              <ProgressBar value={s.confidence * 100} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="border-mint-400/30 bg-mint-100/30">
        <div className="flex items-start gap-3">
          <Shield className="mt-1 size-5 text-success" aria-hidden />
          <div>
            <p className="font-semibold">Tóm tắt an toàn</p>
            <p className="mt-1 text-sm text-muted">
              Không sự kiện rủi ro trong phiên demo. Sản phẩm mặc định riêng tư. Không
              quảng cáo, không chat giữa học sinh.
            </p>
          </div>
        </div>
      </Card>
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
      <div>
        <h1 className="font-display text-3xl font-semibold">Duyệt chia sẻ</h1>
        <p className="text-muted">Chỉ gia đình hoặc lớp học riêng tư — không public web.</p>
      </div>

      {approvals.length === 0 ? (
        <Card>
          <p>Không có yêu cầu chờ duyệt.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {approvals.map((ap) => (
            <Card key={ap.id} className="grid gap-4 md:grid-cols-[200px_1fr]">
              <img
                src={ap.thumbnail}
                alt=""
                className="aspect-[4/3] w-full rounded-2xl object-cover"
              />
              <div>
                <p className="font-display text-xl font-semibold">{ap.projectTitle}</p>
                <p className="text-sm text-muted">
                  Phạm vi:{' '}
                  {ap.destination === 'family'
                    ? 'Chỉ gia đình'
                    : ap.destination === 'class'
                      ? 'Lớp học riêng tư'
                      : 'Không chia sẻ'}{' '}
                  · {ap.aiAssisted ? 'Có AI hỗ trợ' : 'Không AI'} ·{' '}
                  <strong>
                    {ap.status === 'pending'
                      ? 'Chờ duyệt'
                      : ap.status === 'approved'
                        ? 'Đã duyệt'
                        : 'Cần chỉnh'}
                  </strong>
                </p>
                {ap.feedback ? (
                  <p className="mt-2 rounded-xl bg-sun-100 px-3 py-2 text-sm font-semibold">
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
                        className="block min-h-11 w-full cursor-pointer rounded-xl border border-border bg-white px-3 text-left text-sm font-semibold hover:border-brand-500"
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
            </Card>
          ))}
        </div>
      )}
    </div>
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
      <div>
        <h1 className="font-display text-3xl font-semibold">Quyền riêng tư</h1>
        <p className="text-muted">
          High privacy mặc định · Không quảng cáo nhắm mục tiêu · Data minimization
        </p>
      </div>

      <div className="space-y-3">
        {rows.map((row) => (
          <Card key={row.key} className="flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold">{row.label}</p>
              <p className="text-sm text-muted">{row.help}</p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={privacy[row.key]}
              onClick={() => setPrivacy({ [row.key]: !privacy[row.key] })}
              className={`relative h-8 w-14 shrink-0 cursor-pointer rounded-full transition-colors ${
                privacy[row.key] ? 'bg-brand-500' : 'bg-border'
              }`}
            >
              <span
                className={`absolute top-1 size-6 rounded-full bg-white shadow transition-transform ${
                  privacy[row.key] ? 'left-7' : 'left-1'
                }`}
              />
            </button>
          </Card>
        ))}
      </div>

      <Card className="space-y-3">
        <h2 className="font-display text-xl font-semibold">Dữ liệu</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="secondary"
            onClick={() =>
              addToast({
                type: 'success',
                title: 'Tải portfolio (demo)',
                description: 'Trong production sẽ export JSON/PDF.',
              })
            }
          >
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
        <p className="text-sm text-muted">
          Production cần tư vấn pháp lý (COPPA / Children’s Code / luật địa phương).
          Prototype không thu thập email trẻ.
        </p>
      </Card>
    </div>
  )
}
