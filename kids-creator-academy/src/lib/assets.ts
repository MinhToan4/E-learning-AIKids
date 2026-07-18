/**
 * Public asset URLs must respect Vite `base` (GitHub Pages: /E-learning-AIKids/).
 * Never use bare `/assets/...` — that breaks on GH Pages (loads site root, not project root).
 */
export function assetUrl(path: string): string {
  const clean = path.replace(/^\/+/, '')
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${clean}`
}

/** App basename for React Router (no trailing slash) */
export function routerBasename(): string {
  const base = import.meta.env.BASE_URL || '/'
  if (base === '/') return '/'
  return base.replace(/\/+$/, '') || '/'
}
