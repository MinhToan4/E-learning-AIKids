import { useCallback, useRef, useState } from 'react'
import type { ToastItem } from '@/shared/components/ui/Toast'

let counter = 0

/**
 * Hook to manage a stack of toast notifications.
 * Usage:
 *   const { toasts, showToast, dismissToast } = useToast()
 *   showToast('Đã lưu', 'success')
 */
export function useToast() {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const setRef = useRef(setToasts)
  setRef.current = setToasts

  const showToast = useCallback(
    (message: string, type: ToastItem['type'] = 'info') => {
      const id = `toast-${++counter}`
      setRef.current((prev) => [...prev.slice(-4), { id, message, type }])
    },
    [],
  )

  const dismissToast = useCallback((id: string) => {
    setRef.current((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return { toasts, showToast, dismissToast }
}
