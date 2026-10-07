import React, { useState, useMemo } from 'react'
import {
  X,
  Search,
  FileText,
  Lightbulb,
  MessageSquare,
  Columns2,
  Image as ImageIcon,
  Video,
  Mic,
  Key,
  Scale,
  CheckCircle2,
  Palette,
  Trophy,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'

export interface QuickBlockOption {
  id: string
  name: string
  desc: string
  badge?: string
  color: string
  icon: React.ComponentType<{ size?: number; className?: string }>
}

export interface QuickBlockCategory {
  title: string
  items: QuickBlockOption[]
}

export const QUICK_BLOCK_CATEGORIES: QuickBlockCategory[] = [
  {
    title: '📝 Nội Dung & Lời Thoại',
    items: [
      {
        id: 'layout-text',
        name: 'Đoạn Văn Bản Bài Học',
        desc: 'Tiêu đề, lời dẫn và nội dung bài học chữ lớn dễ đọc',
        badge: 'Cơ bản',
        color: 'border-sky-300 bg-sky-50 text-sky-950',
        icon: FileText,
      },
      {
        id: 'layout-callout',
        name: 'Hộp Ghi Nhớ AIKI',
        desc: 'Khung bo cong màu vàng nổi bật với lời khuyên hoặc mẹo học',
        badge: 'Mẹo hay',
        color: 'border-amber-300 bg-amber-50 text-amber-950',
        icon: Lightbulb,
      },
      {
        id: 'dialogue',
        name: 'Kịch Bản Phân Vai Nhân Vật',
        desc: 'Bong bóng hội thoại giữa bé, Mimi, Zico và mèo AIKI',
        badge: 'Tương tác',
        color: 'border-indigo-300 bg-indigo-50 text-indigo-950',
        icon: MessageSquare,
      },
    ],
  },
  {
    title: '🖼️ Hình Ảnh & Đa Phương Tiện',
    items: [
      {
        id: 'layout-split',
        name: '2 Cột: Chữ + Ảnh Minh Họa',
        desc: 'Bố cục cân đối 50/50 giữa tranh vẽ và lời giải thích',
        badge: 'Chuẩn',
        color: 'border-blue-300 bg-blue-50 text-blue-950',
        icon: Columns2,
      },
      {
        id: 'versus-ab',
        name: '2 Tranh Đối Đầu A/B',
        desc: 'So sánh chọn tranh đúng / sai hoặc phong cách A vs B',
        badge: 'Trọng tâm',
        color: 'border-orange-300 bg-orange-50 text-orange-950',
        icon: ImageIcon,
      },
      {
        id: 'video',
        name: 'Video Bài Giảng',
        desc: 'Video hoạt hình MP4 hoặc YouTube với các mốc bài học',
        color: 'border-rose-300 bg-rose-50 text-rose-950',
        icon: Video,
      },
      {
        id: 'voice',
        name: 'Giọng Đọc & Lời Thoại',
        desc: 'Phát âm mẫu câu lệnh AIKI để bé nghe và nhắc lại',
        color: 'border-teal-300 bg-teal-50 text-teal-950',
        icon: Mic,
      },
    ],
  },
  {
    title: '🎯 Tương Tác & Cốt Lõi AIKids',
    items: [
      {
        id: 'layout-four-keys',
        name: '4 Chìa Khóa Vàng (Magic Keys)',
        desc: 'Cái gì · Trông thế nào · Làm gì · Ở đâu (Cốt lõi khóa học)',
        badge: 'Đặc sắc',
        color: 'border-amber-400 bg-gradient-to-r from-amber-50 to-orange-50 text-amber-950',
        icon: Key,
      },
      {
        id: 'compare',
        name: 'Bảng So Sánh 2 Cột',
        desc: 'Đối chiếu AI vs Não bộ con người, hoặc 1 từ vs 5 điều',
        color: 'border-purple-300 bg-purple-50 text-purple-950',
        icon: Scale,
      },
      {
        id: 'layout-confirm-option',
        name: 'Câu Hỏi Trắc Nghiệm / Xác Nhận',
        desc: 'Trắc nghiệm chọn đáp án: Thẻ Card, Split ảnh/câu hỏi hoặc Danh sách dọc',
        badge: 'Trắc nghiệm',
        color: 'border-emerald-300 bg-emerald-50 text-emerald-950',
        icon: CheckCircle2,
      },
      {
        id: 'practice',
        name: 'Xưởng Thực Hành Sáng Tạo',
        desc: 'Bộ công cụ 7 Creative Engines và quy trình 4 bước vẽ tranh cùng AIKI',
        badge: 'Xưởng vẽ',
        color: 'border-pink-300 bg-pink-50 text-pink-950',
        icon: Palette,
      },
      {
        id: 'reward',
        name: 'Màn Trao Thưởng & Kết Thúc',
        desc: 'Vinh danh hoàn thành, huy hiệu sao, điểm XP và dẫn sang bài tiếp theo',
        badge: 'Về đích',
        color: 'border-amber-400 bg-amber-50 text-amber-950',
        icon: Trophy,
      },
    ],
  },
]

export interface QuickBlockPickerModalProps {
  open: boolean
  onClose: () => void
  onSelectBlock: (blockId: string) => void
  insertPositionLabel?: string
}

export function QuickBlockPickerModal({
  open,
  onClose,
  onSelectBlock,
  insertPositionLabel,
}: QuickBlockPickerModalProps) {
  const [search, setSearch] = useState('')

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return QUICK_BLOCK_CATEGORIES
    return QUICK_BLOCK_CATEGORIES.map((cat) => ({
      ...cat,
      items: cat.items.filter(
        (it) =>
          it.name.toLowerCase().includes(q) ||
          it.desc.toLowerCase().includes(q) ||
          it.id.toLowerCase().includes(q)
      ),
    })).filter((cat) => cat.items.length > 0)
  }, [search])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl max-h-[85vh] bg-white rounded-3xl border-2 border-brand-300 shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 bg-gradient-to-r from-brand-50/80 via-white to-amber-50/50 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧩</span>
              <h3 className="text-base sm:text-lg font-black text-slate-900 truncate">
                Thêm Khối Nội Dung Mới
              </h3>
            </div>
            <p className="text-xs font-semibold text-slate-500 mt-0.5">
              {insertPositionLabel
                ? `Vị trí: ${insertPositionLabel}`
                : 'Chọn một khối để chèn trực tiếp vào dòng chảy bài giảng'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition cursor-pointer shrink-0"
            title="Đóng"
          >
            <X size={16} />
          </button>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="p-3 sm:px-5 border-b border-slate-100 bg-slate-50/50">
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Tìm kiếm khối (văn bản, ảnh, chìa khóa, video...)..."
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-400 shadow-2xs"
              autoFocus
            />
          </div>
        </div>

        {/* Danh sách khối theo nhóm */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
          {filteredCategories.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-bold">
              Không tìm thấy khối nào phù hợp với &ldquo;{search}&rdquo;
            </div>
          ) : (
            filteredCategories.map((category) => (
              <div key={category.title} className="space-y-2">
                <h4 className="text-xs font-black text-slate-700 uppercase tracking-wider px-1">
                  {category.title}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {category.items.map((item) => {
                    const IconComponent = item.icon
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          onSelectBlock(item.id)
                          onClose()
                        }}
                        className={cn(
                          'p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-start gap-3 shadow-2xs hover:shadow-md hover:scale-[1.01] active:scale-[0.99] select-none',
                          item.color
                        )}
                      >
                        <div className="p-2 rounded-xl bg-white/90 shadow-2xs shrink-0 mt-0.5">
                          <IconComponent size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1.5">
                            <span className="text-xs font-black text-slate-900 truncate">
                              {item.name}
                            </span>
                            {item.badge && (
                              <span className="text-[9px] font-black px-1.5 py-0.2 rounded-md bg-white/90 text-slate-700 border border-slate-200/80 shrink-0">
                                {item.badge}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-slate-600 line-clamp-2 mt-0.5 leading-snug">
                            {item.desc}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-3 sm:px-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-[11px] text-slate-500 font-semibold">
          <span>💡 Bấm vào khối để chèn ngay lập tức</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 font-bold transition cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}
