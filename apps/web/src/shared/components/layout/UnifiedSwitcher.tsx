import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/shared/store/auth'
import { useWorkspace } from '@/shared/store/workspace'
import { api } from '@/shared/lib/api'

type WorkspaceData = {
  workspaces: Array<{ipId:string; name:string; type:string; isDefault:boolean}>
  defaultIpId: string | null  
  childWorkspaces: Array<{
    childProfileId: string
    childName: string
    avatarUrl: string | null
    workspaces: Array<{ipId:string; name:string; type:string}>
  }>
}

export function UnifiedSwitcher({ variant = 'sidebar' }: { variant?: 'sidebar' | 'mobile-header' }) {
  const user = useAuth(s => s.user)
  const access = useAuth(s => s.access)
  const activeContext = useAuth(s => s.activeContext)
  const selectContext = useAuth(s => s.selectContext)
  const { activeIpId, setActiveIpId } = useWorkspace()
  const [open, setOpen] = useState(false)
  const [wsData, setWsData] = useState<WorkspaceData | null>(null)
  const ref = useRef<HTMLDivElement>(null)

  // Load workspace data cho parent
  useEffect(() => {
    if (user?.role !== 'parent') return
    api<WorkspaceData>('/api/v1/account/workspaces')
      .then(d => {
        setWsData(d)
        // Auto-set activeIpId nếu chưa có
        if (!activeIpId && d.defaultIpId) setActiveIpId(d.defaultIpId)
      })
      .catch(() => undefined)
  }, [user?.role]) // activeIpId omitted intentionally to avoid loops, activeIpId is a state in zustand but doesn't affect fetch

  // Close khi click outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  if (!user) return null

  const contexts = access?.contexts ?? []
  const managementContexts = contexts.filter(c => c.type === 'family' || c.type === 'organization')
  const hasChildren = wsData?.childWorkspaces?.some(c => c.workspaces.length > 0)

  // Active workspace label để show trên trigger button
  const activeWsName = (() => {
    if (activeIpId && wsData) {
      const myWs = wsData.workspaces.find(w => w.ipId === activeIpId)
      if (myWs) return myWs.name
      for (const child of wsData.childWorkspaces ?? []) {
        const cws = child.workspaces.find(w => w.ipId === activeIpId)
        if (cws) return `${child.childName}: ${cws.name}`
      }
    }
    return activeContext?.label ?? 'Tài khoản'
  })()

  const isSidebar = variant === 'sidebar'

  return (
    <div ref={ref} className={isSidebar ? "relative mx-3 mt-auto mb-3" : "relative shrink-0"}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={`flex items-center gap-2 rounded-xl border border-border bg-white/80 transition-all shadow-sm hover:bg-brand-50 hover:border-brand-300 ${
          isSidebar ? "w-full px-3 py-2.5 text-sm font-medium" : "px-2.5 py-1.5 text-xs font-semibold max-w-[150px]"
        }`}
      >
        {/* Avatar */}
        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
          {user.name?.charAt(0)?.toUpperCase() ?? '?'}
        </span>
        <span className="flex-1 truncate text-left">{activeWsName}</span>
        <span className="text-muted text-xs">{open ? '▴' : '▾'}</span>
      </button>

      {/* Dropdown Panel */}
      {open && (
        <div className={`absolute border border-border bg-white shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150 rounded-2xl ${
          isSidebar
            ? "bottom-full left-0 right-0 mb-2 slide-in-from-bottom-2"
            : "top-full right-0 mt-2 w-72 slide-in-from-top-2"
        }`}>
          {/* Header */}
          <div className="px-4 py-3 bg-gradient-to-r from-brand-50 to-white border-b border-border">
            <p className="font-semibold text-text text-sm">{user.name}</p>
            <p className="text-xs text-muted">{user.role === 'parent' ? 'Tài khoản Phụ huynh' : user.role}</p>
          </div>

          <div className="max-h-80 overflow-y-auto">
            {/* Quản trị section */}
            {managementContexts.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">Quản trị</p>
                {managementContexts.map(ctx => (
                  <button
                    key={ctx.id}
                    onClick={() => { void selectContext(ctx.id); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-brand-50 ${
                      activeContext?.id === ctx.id ? 'bg-brand-50 font-semibold text-brand-600' : 'text-text'
                    }`}
                  >
                    <span>{ctx.type === 'family' ? '⚙️' : '🏫'}</span>
                    <span className="flex-1">{ctx.type === 'family' ? 'Quản lý Gia đình' : ctx.label}</span>
                    {activeContext?.id === ctx.id && <span className="text-brand-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Workspace của Ba/Mẹ */}
            {wsData && wsData.workspaces.length > 0 && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">Không gian của tôi</p>
                {wsData.workspaces.map(ws => (
                  <button
                    key={ws.ipId}
                    onClick={() => { setActiveIpId(ws.ipId); setOpen(false) }}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm text-left transition-colors hover:bg-brand-50 ${
                      activeIpId === ws.ipId ? 'bg-brand-50 font-semibold text-brand-600' : 'text-text'
                    }`}
                  >
                    <span>{ws.type === 'family' ? '🏠' : ws.type === 'school' ? '🏫' : '📁'}</span>
                    <span className="flex-1">{ws.name}</span>
                    {activeIpId === ws.ipId && <span className="text-brand-500 text-xs">✓</span>}
                  </button>
                ))}
              </div>
            )}

            {/* Workspaces của các con */}
            {hasChildren && (
              <div>
                <p className="px-4 pt-3 pb-1 text-[10px] font-extrabold uppercase tracking-wider text-muted">Các con</p>
                {(wsData?.childWorkspaces ?? []).filter(c => c.workspaces.length > 0).map(child => (
                  <div key={child.childProfileId}>
                    <p className="px-4 py-1.5 text-xs font-bold text-text/70 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-brand-100 flex items-center justify-center text-[10px]">👶</span>
                      {child.childName}
                    </p>
                    {child.workspaces.map(ws => (
                      <button
                        key={ws.ipId}
                        onClick={() => { setActiveIpId(ws.ipId); setOpen(false) }}
                        className={`w-full flex items-center gap-3 pl-8 pr-4 py-2 text-sm text-left transition-colors hover:bg-brand-50 ${
                          activeIpId === ws.ipId ? 'bg-brand-50 font-semibold text-brand-600' : 'text-text'
                        }`}
                      >
                        <span>{ws.type === 'school' ? '🏫' : '📖'}</span>
                        <span className="flex-1">{ws.name}</span>
                        {activeIpId === ws.ipId && <span className="text-brand-500 text-xs">✓</span>}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {user.role === 'parent' && (
            <div className="border-t border-border px-4 py-2.5">
              <a href="/parent/kids" className="text-xs text-brand-500 hover:text-brand-700 font-medium">+ Thêm tài khoản con</a>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
