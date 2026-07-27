import { create } from 'zustand'

interface WorkspaceStore {
  activeIpId: string | null
  setActiveIpId: (id: string) => void
  clearActiveIpId: () => void
}

export const useWorkspace = create<WorkspaceStore>((set) => ({
  activeIpId: typeof window !== 'undefined'
    ? localStorage.getItem('storymee_active_ip_id')
    : null,
  setActiveIpId: (id) => {
    localStorage.setItem('storymee_active_ip_id', id)
    set({ activeIpId: id })
  },
  clearActiveIpId: () => {
    localStorage.removeItem('storymee_active_ip_id')
    set({ activeIpId: null })
  },
}))
