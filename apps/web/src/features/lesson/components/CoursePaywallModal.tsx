import { Sparkles, Palette, Users, Award, Zap, Paintbrush, ArrowRight } from 'lucide-react'
import { AdventureModal } from '@/shared/components/ui/AdventureModal'
import { Button } from '@/shared/components/ui/Button'

export interface CoursePaywallModalProps {
  open: boolean
  onClose: () => void
  onUpgrade: () => void
  onContinueFree: () => void
  mode?: 'course' | 'credits'
  courseTitle?: string
}

export function CoursePaywallModal({
  open,
  onClose,
  onUpgrade,
  onContinueFree,
  mode = 'course',
  courseTitle,
}: CoursePaywallModalProps) {
  if (!open) return null

  const isCreditsMode = mode === 'credits'

  const eyebrow = isCreditsMode ? '🎨 Lượt Tạo Ảnh Sáng Tạo' : '🌟 Khám Phá Thế Giới AI'
  const title = isCreditsMode
    ? 'Bé Đã Dùng Hết Lượt Tạo Ảnh Tháng Này'
    : 'Con Đã Sẵn Sàng Cho Hành Trình Mới?'

  const description = isCreditsMode
    ? 'Bé đã dùng hết 50 lượt tạo ảnh AI rồi! Ba mẹ có thể nạp thêm 25 lượt (50.000đ) để bé tiếp tục sáng tạo, hoặc bé có thể tự do vẽ tranh trên bảng vẽ nhé!'
    : 'Chúc mừng con đã hoàn thành 10 Quy tắc của Xưởng sáng tạo! Để mở khóa các chặng học tiếp theo và nhận 50 lượt tạo ảnh AI mỗi tháng, ba mẹ hãy mở khóa Gói AI Kid cho con nhé!'

  return (
    <AdventureModal
      open={open}
      tone={isCreditsMode ? 'guidance' : 'celebration'}
      eyebrow={eyebrow}
      title={title}
      description={description}
      onClose={onClose}
      showMascot={true}
      className="course-paywall-modal"
    >
      {isCreditsMode ? (
        <div className="w-full max-w-xl mx-auto space-y-3">
          {/* Card nạp thêm lượt */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-sky-50/70 via-cream-50/60 to-white p-3.5 sm:p-5 shadow-soft text-left">
            <div className="flex items-center justify-between gap-3 border-b border-cream-300/70 pb-3">
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-sky-100 border border-sky-200 px-2.5 py-0.5 text-xs font-black text-sky-800">
                  ⚡ GÓI NẠP NHANH
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-display text-text font-black">
                  Gói Bổ Sung 25 Lượt Tạo Ảnh AI
                </h3>
              </div>
              <div className="text-right shrink-0">
                <span className="block text-lg sm:text-xl font-black text-brand-600 font-display">
                  50.000đ
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted">2.000đ / lượt</span>
              </div>
            </div>

            <ul className="mt-3 space-y-2 text-xs sm:text-sm font-bold text-text">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700" aria-hidden="true">
                  <Palette size={13} strokeWidth={2.5} />
                </span>
                <span>🎨 25 lượt tạo ảnh AI kỳ diệu bổ sung</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-700" aria-hidden="true">
                  <Zap size={13} strokeWidth={2.5} />
                </span>
                <span>⚡ Kích hoạt ngay lập tức, không hết hạn trong tháng</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700" aria-hidden="true">
                  <Paintbrush size={13} strokeWidth={2.5} />
                </span>
                <span>🖌️ Bảng vẽ tay tự do không giới hạn luôn miễn phí</span>
              </li>
            </ul>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black shadow-clay active:shadow-press"
              onClick={onUpgrade}
            >
              <Zap size={16} aria-hidden="true" />
              Nạp Thêm 25 Lượt (50K)
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold"
              onClick={onContinueFree}
            >
              <Paintbrush size={16} aria-hidden="true" />
              Tiếp Tục Vẽ Tay Miễn Phí
            </Button>
          </div>
        </div>
      ) : (
        <div className="w-full max-w-xl mx-auto space-y-3">
          {/* Card quyền lợi Gói 129k */}
          <div className="rounded-2xl sm:rounded-3xl border-2 border-cream-300 bg-gradient-to-b from-cream-50 via-sun-50/50 to-white p-3.5 sm:p-5 shadow-soft text-left">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-cream-300/70 pb-3">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 border border-amber-200 px-2.5 py-0.5 text-xs font-black text-amber-800">
                  🌟 GÓI AI KID CHÍNH THỨC
                </span>
                <h3 className="mt-1 text-base sm:text-lg font-display text-text font-black">
                  {courseTitle ? `Mở Khóa ${courseTitle}` : 'Trọn Gói Hành Trình Sáng Tạo'}
                </h3>
              </div>
              <div className="text-right">
                <span className="block text-lg sm:text-xl font-black text-brand-600 font-display">
                  129.000đ / tháng
                </span>
                <span className="text-[10px] sm:text-[11px] font-bold text-muted">(Chưa tới 4.500đ/ngày)</span>
              </div>
            </div>

            <ul className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5 text-xs sm:text-sm font-bold text-text">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sun-100 text-sun-800" aria-hidden="true">
                  <Sparkles size={13} strokeWidth={2.5} />
                </span>
                <span>🌟 Trọn bộ Khóa học AI Kid chính thức (Lộ trình 6 chặng chuẩn Quốc tế)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-coral-100 text-coral-700" aria-hidden="true">
                  <Palette size={13} strokeWidth={2.5} />
                </span>
                <span>🎨 50 lượt tạo ảnh AI sáng tạo mỗi tháng (2.000đ/lượt)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-sky-100 text-sky-700" aria-hidden="true">
                  <Users size={13} strokeWidth={2.5} />
                </span>
                <span>👫 2 hồ sơ trẻ em trong gia đình cùng học</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700" aria-hidden="true">
                  <Award size={13} strokeWidth={2.5} />
                </span>
                <span>🏆 Chứng chỉ hoàn thành & 500 MB lưu trữ tranh truyện AI</span>
              </li>
            </ul>
          </div>

          {/* 2 nút hành động */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
            <Button
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-black shadow-clay active:shadow-press"
              onClick={onUpgrade}
            >
              <Sparkles size={16} aria-hidden="true" />
              Ba Mẹ Ơi, Mở Khóa Cho Con!
            </Button>
            <Button
              variant="secondary"
              className="w-full sm:w-auto px-5 py-2.5 sm:py-3 text-xs sm:text-sm font-bold"
              onClick={onContinueFree}
            >
              <ArrowRight size={16} aria-hidden="true" />
              Tiếp Tục Trải Nghiệm Miễn Phí
            </Button>
          </div>
        </div>
      )}
    </AdventureModal>
  )
}
