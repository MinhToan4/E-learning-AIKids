import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ClassManagementConsole } from '@/features/teacher/components/ClassManagementConsole'
import {
  AdminClassesDirectory,
  type MasterClassItem,
} from './AdminClassesDirectory'
import { AdminOfficialProgramTab } from './AdminOfficialProgramTab'

export interface AdminClassesTabProps {
  initialSubTab?: 'official' | 'extended'
  initialView?: 'directory' | 'console'
}

export function AdminClassesTab({ initialSubTab, initialView }: AdminClassesTabProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams()

  // Phân hệ cấp cao: 'official' (Chương trình AIKids chính thức) vs 'extended' (Lớp học mở rộng & trường liên kết)
  const querySubTab = searchParams.get('subTab') === 'extended' ? 'extended' : 'official'
  const [subTab, setSubTab] = useState<'official' | 'extended'>(
    initialSubTab || (initialView ? 'extended' : querySubTab),
  )

  // Góc nhìn trong Phân hệ Lớp học mở rộng: 'directory' (Danh mục) vs 'console' (Điều hành chi tiết)
  const queryView = searchParams.get('view') === 'console' ? 'console' : 'directory'
  const [view, setView] = useState<'directory' | 'console'>(initialView || queryView)
  const [selectedClass, setSelectedClass] = useState<MasterClassItem | null>(null)

  const handleSwitchToOfficial = () => {
    setSubTab('official')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('subTab', 'official')
    nextParams.delete('view')
    nextParams.delete('classId')
    setSearchParams(nextParams, { replace: true })
  }

  const handleSwitchToExtended = () => {
    setSubTab('extended')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('subTab', 'extended')
    setSearchParams(nextParams, { replace: true })
  }

  const handleSelectClass = (cls: MasterClassItem) => {
    setSelectedClass(cls)
    setView('console')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('subTab', 'extended')
    nextParams.set('view', 'console')
    nextParams.set('classId', cls.id)
    setSearchParams(nextParams, { replace: true })
  }

  const handleSwitchToDirectory = () => {
    setView('directory')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.delete('view')
    nextParams.delete('classId')
    setSearchParams(nextParams, { replace: true })
  }

  const handleSwitchToConsole = () => {
    setView('console')
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('view', 'console')
    setSearchParams(nextParams, { replace: true })
  }

  return (
    <div className="space-y-4">
      {/* ── 1. Thanh Chuyển Đổi 2 Phân Hệ Cấp Cao ────────────────────── */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
          <button
            type="button"
            onClick={handleSwitchToOfficial}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              subTab === 'official'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <span>🌟 Chương Trình AIKids Chính Thức (Official Core Program)</span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToExtended}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              subTab === 'extended'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <span>🏫 Lớp Học Mở Rộng & Trường Liên Kết (Electives & Partner Schools)</span>
          </button>
        </div>
      </div>

      {/* ── 2. Nội Dung Phân Hệ Được Chọn ───────────────────────────── */}
      {subTab === 'official' ? (
        <AdminOfficialProgramTab />
      ) : (
        <div className="space-y-4">
          {/* Sub-bar điều phối góc nhìn ERP Directory vs Classroom Console */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 shadow-2xs">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white border border-slate-200/60 shadow-2xs">
              <button
                type="button"
                onClick={handleSwitchToDirectory}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  view === 'directory'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <span>🏛️ Danh mục Lớp học Toàn trường (ERP Directory)</span>
              </button>
              <button
                type="button"
                onClick={handleSwitchToConsole}
                className={cn(
                  'flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer',
                  view === 'console'
                    ? 'bg-brand-50 text-brand-700 border border-brand-200'
                    : 'text-slate-600 hover:text-slate-900',
                )}
              >
                <span>👥 Chi tiết điều hành lớp (Classroom Console)</span>
              </button>
            </div>

            {view === 'console' && (
              <div className="flex items-center gap-2 ml-auto">
                {selectedClass && (
                  <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-2xs">
                    <span>Đang điều hành:</span>
                    <strong className="text-slate-900">{selectedClass.name}</strong>
                    <span className="font-mono text-slate-500">({selectedClass.code})</span>
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSwitchToDirectory}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 bg-white text-slate-700 hover:bg-slate-100 transition-all cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>← Quay lại danh mục toàn trường</span>
                </button>
              </div>
            )}
          </div>

          {/* Render Directory hoặc Console */}
          {view === 'directory' ? (
            <AdminClassesDirectory onSelectClass={handleSelectClass} />
          ) : (
            <div className="space-y-4">
              <ClassManagementConsole canManageClass={true} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
