import React from 'react'
import {
  PanelLeftOpen,
  PanelLeftClose,
  Columns2,
  Image,
  BookOpen,
  ChevronDown,
  ChevronRight,
  Plus,
  Puzzle,
} from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { FeatureBlockHoverPreview } from '../FeatureBlockHoverPreview'
import type { FeatureBlockItem } from '../../types'

export const MINI_RAIL_CATEGORIES: Array<{
  name: string
  icon: typeof Columns2
  color: string
  short: string
  alias?: string
}> = [
  { name: 'Bố Cục & Cột Nội Dung', icon: Columns2, color: 'text-sky-600', short: 'Bố cục' },
  { name: 'Hình Ảnh & Đa Phương Tiện', icon: Image, color: 'text-purple-600', short: 'Media' },
  { name: 'Khối Tương Tác & Sư Phạm', icon: BookOpen, color: 'text-amber-600', short: 'Tương tác' },
]

export function getCategorySvgIcon(categoryName: string, size = 14) {
  switch (categoryName) {
    case 'Bố Cục & Cột Nội Dung':
      return <Columns2 size={size} className="text-sky-600" />
    case 'Hình Ảnh & Đa Phương Tiện':
      return <Image size={size} className="text-purple-600" />
    case 'Khối Tương Tác & Sư Phạm':
      return <BookOpen size={size} className="text-amber-600" />
    default:
      return <BookOpen size={size} className="text-brand-600" />
  }
}

export interface TeacherFocusStudioSidebarProps {
  isSidebarCollapsed: boolean
  toggleSidebarCollapsed: () => void
  setIsSidebarCollapsed: React.Dispatch<React.SetStateAction<boolean>>
  openCategories: Record<string, boolean>
  setOpenCategories: React.Dispatch<React.SetStateAction<Record<string, boolean>>>
  toggleCategory: (category: string) => void
  categories: Array<{
    category: string
    icon: string
    items: FeatureBlockItem[]
  }>
  renderIcon: (itemId: string, size?: number) => React.ReactNode
  hoveredBlock: {
    item: FeatureBlockItem
    rect: DOMRect
    category?: string
  } | null
  setHoveredBlock: React.Dispatch<
    React.SetStateAction<{
      item: FeatureBlockItem
      rect: DOMRect
      category?: string
    } | null>
  >
}

export function TeacherFocusStudioSidebar({
  isSidebarCollapsed,
  toggleSidebarCollapsed,
  setIsSidebarCollapsed,
  openCategories,
  setOpenCategories,
  toggleCategory,
  categories,
  renderIcon,
  hoveredBlock,
  setHoveredBlock,
}: TeacherFocusStudioSidebarProps) {
  return (
    <aside
      className={cn(
        "shrink-0 sticky top-20 h-[calc(100vh-6rem)] flex flex-col rounded-3xl border-2 border-brand-200/80 bg-white/95 shadow-clay-xs backdrop-blur-xs overflow-hidden transition-all duration-300",
        isSidebarCollapsed
          ? "w-14 min-w-[56px] max-w-[56px]"
          : "w-72 min-w-[280px] max-w-[280px] xl:w-[300px] xl:max-w-[300px]"
      )}
      aria-label="Thanh công cụ Focus Studio"
    >
      {isSidebarCollapsed ? (
        <div className="flex flex-col items-center py-3 gap-2.5 h-full bg-brand-50/50">
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="p-2 rounded-xl bg-white border border-brand-200 text-brand-700 hover:bg-brand-50 shadow-2xs transition cursor-pointer"
            title="Mở rộng menu Khối Tính Năng"
            aria-label="Mở rộng menu Khối Tính Năng"
          >
            <PanelLeftOpen size={16} />
          </button>
          <div className="w-8 h-px bg-border/80 my-0.5" />
          <div className="flex flex-col items-center gap-2 w-full px-1">
            {MINI_RAIL_CATEGORIES.map((cat) => {
              const Icon = cat.icon
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => {
                    setOpenCategories((prev) => ({
                      ...prev,
                      [cat.name]: true,
                      ...(cat.alias ? { [cat.alias]: true } : {}),
                    }))
                    setIsSidebarCollapsed(false)
                  }}
                  className="group relative flex size-9 items-center justify-center rounded-xl bg-white border border-border/80 shadow-2xs hover:border-brand-300 hover:bg-brand-50/80 hover:scale-105 transition cursor-pointer"
                  title={`${cat.name} (Click để mở rộng)`}
                  aria-label={cat.name}
                >
                  <Icon size={16} className={cn(cat.color, "transition group-hover:scale-110")} />
                </button>
              )
            })}
          </div>
        </div>
      ) : (
        <>
          <div className="border-b border-border bg-brand-50/60 px-3.5 py-2.5 shrink-0 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="grid size-7 place-items-center rounded-lg bg-brand-600 text-white shadow-2xs shrink-0">
                <Puzzle size={15} />
              </span>
              <h3 className="font-extrabold text-xs text-brand-950 truncate tracking-wide">
                Khối nội dung
              </h3>
            </div>
            <button
              type="button"
              onClick={toggleSidebarCollapsed}
              className="p-1.5 rounded-xl text-slate-500 hover:text-brand-800 hover:bg-white border border-transparent hover:border-border transition cursor-pointer shrink-0 shadow-2xs"
              title="Thu gọn menu khối tính năng"
              aria-label="Thu gọn menu khối tính năng"
            >
              <PanelLeftClose size={16} />
            </button>
          </div>

          {/* Thư viện khối tính năng kéo thả */}
          <div className="flex-1 min-h-0 overflow-y-auto pr-1.5 space-y-2.5 p-2 custom-scrollbar" aria-label="Thư viện khối tính năng">
            <div className="rounded-lg border border-brand-200 bg-brand-50/70 p-2 text-xs text-brand-900 shadow-2xs shrink-0">
              <p className="font-extrabold flex items-center gap-1 text-[10px] uppercase tracking-wider text-brand-900">
                Kéo thả khối nội dung
              </p>
              <p className="mt-0.5 text-[10px] leading-tight text-brand-800">
                Kéo thẻ hoặc click <strong>+ Thêm</strong> để chèn vào chặng.
              </p>
            </div>

            {categories.map((category) => {
              const isOpen = openCategories[category.category] ?? true
              const visibleItems = category.items
              return (
                <div key={category.category} className="rounded-xl border border-border/80 bg-white/80 overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => toggleCategory(category.category)}
                    className="w-full flex items-center justify-between gap-1.5 px-2.5 py-1.5 text-left bg-slate-50 hover:bg-slate-100/90 transition cursor-pointer border-b border-border/40"
                  >
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="shrink-0">{getCategorySvgIcon(category.category, 14)}</span>
                      <span className="text-[10px] font-black text-slate-800 uppercase tracking-wide truncate">
                        {category.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 text-muted">
                      <span className="text-[9px] font-bold px-1.5 py-0.2 bg-white rounded-full border border-border/70 text-slate-600">
                        {visibleItems.length}
                      </span>
                      {isOpen ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="p-1.5 flex flex-col gap-1.5 bg-slate-50/40">
                      {visibleItems.map((item) => (
                        <div
                          key={item.id}
                          draggable
                          onDragStart={(e) => {
                            setHoveredBlock(null)
                            e.dataTransfer.setData('text/plain', item.id)
                            e.dataTransfer.effectAllowed = 'copy'
                          }}
                          onMouseEnter={(e) => {
                            setHoveredBlock({
                              item,
                              rect: e.currentTarget.getBoundingClientRect(),
                              category: category.category,
                            })
                          }}
                          onMouseLeave={() => setHoveredBlock(null)}
                          className={cn(
                            "group min-h-[46px] py-1.5 px-2.5 rounded-xl border flex items-center justify-between gap-2 hover:shadow-xs transition cursor-grab active:cursor-grabbing hover:scale-[1.01]",
                            item.color
                          )}
                          title={`Kéo thả hoặc click + Thêm: ${item.name} (${item.desc})`}
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1">
                            <span className="text-base shrink-0">{renderIcon(item.id, 16)}</span>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span className="text-xs font-black leading-snug break-words line-clamp-2">
                                {item.name}
                              </span>
                              {item.badge && (
                                <span className="w-fit mt-0.5 rounded bg-white/90 border border-current px-1 py-0 text-[8px] font-black uppercase tracking-wider">
                                  {item.badge}
                                </span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              window.dispatchEvent(
                                new CustomEvent('aikids:add-feature-block', { detail: { blockId: item.id } })
                              )
                            }}
                            className="shrink-0 flex items-center gap-0.5 rounded-lg bg-white/90 hover:bg-white border border-current px-2 py-1 text-[10px] font-black shadow-2xs transition active:scale-95 cursor-pointer"
                            title={`Thêm ${item.name} vào chặng`}
                          >
                            <Plus size={11} />
                            <span>Thêm</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Card xem trước bố cục mini và hướng dẫn sư phạm khi hover vào khối tính năng */}
          <FeatureBlockHoverPreview
            block={hoveredBlock?.item ?? null}
            anchorRect={hoveredBlock?.rect ?? null}
            categoryName={hoveredBlock?.category}
          />
        </>
      )}
    </aside>
  )
}
