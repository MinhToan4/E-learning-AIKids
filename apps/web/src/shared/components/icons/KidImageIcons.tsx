type KidImageIconProps = {
  size?: number
  className?: string
}

const ROOT = '/assets/aikid-ui/figma-icons'

function createKidImageIcon(fileName: string) {
  return function KidImageIcon({ size = 32, className = '' }: KidImageIconProps) {
    return (
      <img
        src={`${ROOT}/${fileName}.svg`}
        alt=""
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        className={`aikid-clay-icon ${className}`}
      />
    )
  }
}

const ROOT_GENERATED = '/assets/aikid-ui/generated'

function createGeneratedImageIcon(fileName: string) {
  return function KidImageIcon({ size = 32, className = '' }: KidImageIconProps) {
    return (
      <img
        src={`${ROOT_GENERATED}/${fileName}.webp`}
        alt=""
        width={size}
        height={size}
        decoding="async"
        draggable={false}
        className={`aikid-clay-icon ${className}`}
      />
    )
  }
}

export const KidHomeImageIcon = createKidImageIcon('home')
export const KidWorldImageIcon = createKidImageIcon('study')
export const KidCreativeImageIcon = createKidImageIcon('creative')
export const KidBackpackImageIcon = createKidImageIcon('backpack')
export const KidBadgeImageIcon = createKidImageIcon('badge')
export const KidLevelImageIcon = createKidImageIcon('level')
export const KidStarImageIcon = createGeneratedImageIcon('star')
export const KidLockImageIcon = createGeneratedImageIcon('lock')
export const KidProgressImageIcon = createKidImageIcon('progress')
export const KidEventImageIcon = createKidImageIcon('event')
export const KidStorybookImageIcon = createKidImageIcon('storybook')
export const KidProfileImageIcon = createKidImageIcon('profile')
export const KidTimeImageIcon = createKidImageIcon('time')

// Bộ icon riêng của thẻ hồ sơ trong frame “Icon hồ sơ (web khóa học)”.
export const KidProfileStreakImageIcon = createKidImageIcon('profile-streak')
export const KidProfileBadgeImageIcon = createKidImageIcon('profile-badge')
export const KidProfileWorkImageIcon = createKidImageIcon('profile-work')
