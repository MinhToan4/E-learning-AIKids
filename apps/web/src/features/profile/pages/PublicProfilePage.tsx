import { Link, useParams } from 'react-router-dom'
import { readProfileShowcase } from '../profile-showcase'
import { readCommunitySettings } from '@/features/community/community-store'
import {
  profileCardStyle,
  readRewardEquipment,
} from '@/features/rewards/reward-equipment'

export function PublicProfilePage() {
  const { childId = '' } = useParams()
  const showcase = readProfileShowcase(childId)
  const settings = readCommunitySettings(childId)
  const equipment = readRewardEquipment(childId)

  if (!showcase) {
    return (
      <main className="mx-auto flex min-h-screen max-w-xl items-center px-5">
        <div className="ui-card w-full p-8 text-center">
          <p className="text-5xl" aria-hidden>🌱</p>
          <h1 className="mt-3 font-display text-3xl">Trang này chưa được xuất bản</h1>
          <p className="mt-2 text-muted">Nhà sáng tạo nhí đang chuẩn bị triển lãm đầu tiên.</p>
          <Link to="/" className="mt-5 inline-block font-extrabold text-brand-600">Về AIKid.vn</Link>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#e3f6ff,transparent_38%),linear-gradient(#f7f5ff,#fff)] px-4 py-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <header
          className="ui-card flex flex-col items-center gap-4 p-7 text-center sm:flex-row sm:text-left"
          style={profileCardStyle(equipment.theme)}
        >
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full border-8 border-white bg-brand-100 text-5xl shadow-clay">
            {showcase.avatar
              ? <img src={showcase.avatar.url} alt="" className="h-full w-full object-cover" />
              : '🎨'}
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[.2em] text-brand-600">Nhà sáng tạo AIKid</p>
            <h1 className="font-display text-4xl">{showcase.nickname}</h1>
            <p className="text-muted">Những tác phẩm con tự hào và đã được gia đình duyệt chia sẻ.</p>
          </div>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {settings.modules.storybook && (
            <section className="ui-card p-4">
              <p className="text-2xl" aria-hidden>📖</p>
              <h2 className="font-display text-xl">Storybook</h2>
              <p className="text-sm text-muted">Chapter gần nhất · Cánh cửa đầu tiên</p>
            </section>
          )}
          {settings.modules.progress && (
            <section className="ui-card p-4">
              <p className="text-2xl" aria-hidden>📈</p>
              <h2 className="font-display text-xl">Tiến độ học</h2>
              <p className="text-sm text-muted">4/12 trạm · 7 ngôi sao</p>
            </section>
          )}
          {settings.modules.achievements && (
            <section className="ui-card p-4">
              <p className="text-2xl" aria-hidden>🏅</p>
              <h2 className="font-display text-xl">Danh hiệu</h2>
              <p className="text-sm text-muted">Tia Sáng Đầu Tiên</p>
            </section>
          )}
        </div>

        {settings.modules.works && <section>
          <h2 className="mb-4 font-display text-3xl">Triển lãm của con</h2>
          {showcase.projects.length === 0 ? (
            <div className="ui-card p-8 text-center text-muted">
              Chưa có tác phẩm công khai. Hãy quay lại sau nhé!
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {showcase.projects.map((project) => (
                <article key={project.id} className="ui-card overflow-hidden">
                  <div className="flex aspect-[4/3] items-center justify-center overflow-hidden bg-brand-50 text-5xl">
                    {project.thumbnail
                      ? <img src={project.thumbnail} alt="" className="h-full w-full object-cover" />
                      : '🎨'}
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-black uppercase text-brand-600">{project.kind}</p>
                    <h3 className="font-display text-xl">{project.title}</h3>
                    {project.content && <p className="mt-1 line-clamp-3 text-sm text-muted">{project.content}</p>}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>}
        <footer className="text-center text-xs font-bold text-muted">
          Chỉ hiển thị nội dung đã được phụ huynh phê duyệt · AIKid.vn
        </footer>
      </div>
    </main>
  )
}
