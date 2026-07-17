/** Lightweight motion tokens — prefer CSS transform/opacity only. */
export const motion = {
  fast: 0.15,
  base: 0.2,
  slow: 0.28,
} as const

export const fadeUp = (reduced: boolean) =>
  reduced
    ? { initial: false as const, animate: { opacity: 1 } }
    : {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: motion.base, ease: 'easeOut' as const },
      }
