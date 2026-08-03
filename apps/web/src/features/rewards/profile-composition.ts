/** Shared geometry contract between the profile UI and reward designers. */
export const PROFILE_COMPOSITION_SPEC = {
  version: 1,
  profileBackground: {
    width: 1920,
    height: 640,
    aspectRatio: 3,
    safeArea: { x: 384, y: 64, width: 1152, height: 512 },
  },
  pageTheme: {
    width: 1440,
    height: 2160,
    aspectRatio: 2 / 3,
    centerSafeWidthRatio: 0.7,
  },
  avatarFrame: {
    width: 1024,
    height: 1024,
    avatarDiameterRatio: 0.67,
    avatarCenter: { x: 0.5, y: 0.5 },
  },
  companion: {
    width: 512,
    height: 512,
    visibleArtworkRatio: 0.82,
    anchor: { x: 0.9, y: 0.16 },
  },
} as const
