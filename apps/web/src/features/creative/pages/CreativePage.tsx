import { useNavigate } from 'react-router'
import { PageMotion } from '@/shared/components/ui/PageMotion'
import { KidCreativeImageIcon } from '@/shared/components/icons/KidImageIcons'
import { ConsentGate } from '@/shared/components/ConsentGate'
import { WorkshopCanvas } from '../components/WorkshopCanvas'
// Retained reference for subcomponents: WorkshopCharacter

export function CreativePage() {
  const navigate = useNavigate()

  return (
    <ConsentGate cap="allowAiCreate">
      <PageMotion
        aria-label="AI Studio · Xưởng Vẽ Sáng Tạo"
        className="mx-auto flex min-h-[calc(100vh-2.5rem)] max-w-[1024px] w-full px-3 sm:px-4 md:px-6 py-4 sm:py-6 pb-32 sm:pb-36 flex-col gap-4 sm:gap-6"
      >
        {/* ── Thẻ Header Soft Clay ── */}
        <header className="aikid-flat-panel p-4 sm:p-5 rounded-3xl shadow-clay flex items-center justify-between gap-3 border border-orange-200/80 bg-white/95 backdrop-blur-md">
          <div className="flex items-center gap-2.5 sm:gap-3.5">
            <span className="flex items-center justify-center w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-100 to-orange-100 border border-orange-200/90 shadow-2xs shrink-0">
              <KidCreativeImageIcon size={28} />
            </span>
            <div>
              <h1 className="text-base sm:text-lg font-black text-slate-900 leading-tight">
                AI Studio · Xưởng Vẽ Sáng Tạo
              </h1>
              <p className="hidden sm:block text-[11px] font-bold text-slate-500 mt-0.5">
                Phác họa nét vẽ, chọn phong cách &amp; biến hóa tác phẩm cùng AI
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/home')}
            className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200/90 shadow-2xs text-xs font-black transition-all cursor-pointer active:scale-95 shrink-0"
            aria-label="Quay lại Trang chủ"
          >
            <span>← Trang chủ</span>
          </button>
        </header>

        {/* ── Khung Box Canvas chuẩn 1024px ── */}
        <main className="aikid-flat-panel p-3 sm:p-5 md:p-6 rounded-3xl shadow-clay border border-orange-200/80 bg-white/95 backdrop-blur-md overflow-hidden">
          <WorkshopCanvas onSaved={() => navigate('/profile')} />
        </main>
      </PageMotion>
    </ConsentGate>
  )
}

export default CreativePage
