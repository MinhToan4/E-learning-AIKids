import { useState } from 'react'
import { useSearchParams } from 'react-router'
import { ArrowLeft } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { ClassManagementConsole } from '@/features/teacher/components/ClassManagementConsole'
import {
  AdminClassesDirectory,
  type MasterClassItem,
} from './AdminClassesDirectory'

export interface AdminClassesTabProps {
  initialView?: 'directory' | 'console'
}

export function AdminClassesTab({ initialView }: AdminClassesTabProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams()
  const queryView = searchParams.get('view') === 'console' ? 'console' : 'directory'
  const [view, setView] = useState<'directory' | 'console'>(initialView || queryView)
  const [selectedClass, setSelectedClass] = useState<MasterClassItem | null>(null)

  const handleSelectClass = (cls: MasterClassItem) => {
    setSelectedClass(cls)
    setView('console')
    const nextParams = new URLSearchParams(searchParams)
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
      {/* Switcher 2 góc nhìn linh hoạt cho Admin */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-2.5 shadow-sm">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200/60">
          <button
            type="button"
            onClick={handleSwitchToDirectory}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              view === 'directory'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <span>🏛️ Danh mục Lớp học Toàn trường (ERP Directory)</span>
          </button>
          <button
            type="button"
            onClick={handleSwitchToConsole}
            className={cn(
              'flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
              view === 'console'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-600 hover:text-slate-900',
            )}
          >
            <span>👥 Chi tiết điều hành lớp (Classroom Console)</span>
          </button>
        </div>

        {view === 'console' && (
          <div className="flex items-center gap-2 ml-auto">
            {selectedClass && (
              <span className="hidden md:inline-flex items-center gap-1.5 text-xs text-slate-600 font-medium bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                <span>Đang điều hành:</span>
                <strong className="text-slate-900">{selectedClass.name}</strong>
                <span className="font-mono text-slate-500">({selectedClass.code})</span>
              </span>
            )}
            <button
              type="button"
              onClick={handleSwitchToDirectory}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 transition-all cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>← Quay lại danh mục toàn trường</span>
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      {view === 'directory' ? (
        <AdminClassesDirectory onSelectClass={handleSelectClass} />
      ) : (
        <div className="space-y-4">
          <ClassManagementConsole canManageClass={true} />
        </div>
      )}
    </div>
  )
}
