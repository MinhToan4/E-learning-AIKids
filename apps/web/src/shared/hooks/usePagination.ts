import { useState, useMemo, useEffect } from 'react'

/**
 * Generic client-side pagination hook.
 * Slices any array and exposes page navigation controls.
 * Automatically resets to page 1 when `items` length changes
 * (e.g. after a role filter or search changes the list).
 */
export function usePagination<T>(items: T[], pageSize = 15) {
  const [page, setPage] = useState(1)

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize))

  // Reset to page 1 when list length changes (filter / data reload)
  useEffect(() => {
    setPage(1)
  }, [items.length])

  const slice = useMemo(
    () => items.slice((page - 1) * pageSize, page * pageSize),
    [items, page, pageSize],
  )

  function prev() {
    setPage((p) => Math.max(1, p - 1))
  }

  function next() {
    setPage((p) => Math.min(totalPages, p + 1))
  }

  function goTo(p: number) {
    setPage(Math.max(1, Math.min(totalPages, p)))
  }

  return { slice, page, totalPages, prev, next, goTo, setPage }
}
