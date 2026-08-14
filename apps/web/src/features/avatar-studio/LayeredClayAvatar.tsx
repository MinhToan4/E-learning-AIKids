import type { AvatarSelection } from './avatar-options'

const ROOT = '/assets/mee/avatar-v2'

export const CLAY_ASSETS = {
  hair: [`${ROOT}/baseline-bob.png`, `${ROOT}/baseline-pigtails-v2.png`],
  eyes: [null, `${ROOT}/eyes-sky.png`],
  outfit: [null, `${ROOT}/outfit-explorer.png`],
  shoes: [null, `${ROOT}/shoes-coral.png`],
  hat: [null, `${ROOT}/hat-beanie.png`],
} as const

export const CLAY_READY_CATEGORIES = ['hair', 'eyes', 'outfit', 'shoes', 'hat'] as const

const layers = [
  { key: 'outfit', clipPath: 'inset(31% 12% 11% 12%)' },
  { key: 'shoes', clipPath: 'inset(81% 18% 0 18%)' },
  { key: 'hat', clipPath: 'inset(0 20% 66% 20%)' },
] as const

export function LayeredClayAvatar({
  selection,
  className = '',
}: {
  selection: AvatarSelection
  className?: string
}) {
  return (
    <span className={`relative block aspect-[3/4] overflow-hidden ${className}`} role="img" aria-label="Avatar Mee Clay đang thiết kế">
      <img src={CLAY_ASSETS.hair[selection.hair] ?? CLAY_ASSETS.hair[0]} alt="" className="avatar-clay-base absolute inset-0 h-full w-full object-contain" />
      {CLAY_ASSETS.eyes[selection.eyes as 0 | 1] && (
        <>
          <img src={CLAY_ASSETS.eyes[selection.eyes as 0 | 1] ?? ''} alt="" className="avatar-clay-layer absolute inset-0 h-full w-full object-contain" style={{ clipPath: 'circle(5.2% at 42% 24.5%)' }} />
          <img src={CLAY_ASSETS.eyes[selection.eyes as 0 | 1] ?? ''} alt="" className="avatar-clay-layer absolute inset-0 h-full w-full object-contain" style={{ clipPath: 'circle(5.2% at 58% 24.5%)' }} />
        </>
      )}
      {layers.map(({ key, clipPath }) => {
        const src = CLAY_ASSETS[key][selection[key] as 0 | 1]
        return src ? <img key={`${key}-${src}`} src={src} alt="" className="avatar-clay-layer absolute inset-0 h-full w-full object-contain" style={{ clipPath }} /> : null
      })}
    </span>
  )
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Không tải được lớp avatar.'))
    image.src = src
  })
}

export async function renderLayeredClayAvatar(selection: AvatarSelection): Promise<File> {
  const canvas = document.createElement('canvas')
  canvas.width = 1086
  canvas.height = 1448
  const context = canvas.getContext('2d')
  if (!context) throw new Error('Thiết bị chưa hỗ trợ tạo avatar.')

  const drawRegion = async (src: string | null, x: number, y: number, width: number, height: number) => {
    if (!src) return
    const image = await loadImage(src)
    context.drawImage(image, x, y, width, height, x, y, width, height)
  }

  await drawRegion(CLAY_ASSETS.hair[selection.hair] ?? CLAY_ASSETS.hair[0], 0, 0, 1086, 1448)
  const eyesSource = CLAY_ASSETS.eyes[selection.eyes as 0 | 1]
  if (eyesSource) {
    const eyesImage = await loadImage(eyesSource)
    context.save()
    context.beginPath()
    context.arc(456, 355, 57, 0, Math.PI * 2)
    context.arc(630, 355, 57, 0, Math.PI * 2)
    context.clip()
    context.drawImage(eyesImage, 0, 0, 1086, 1448)
    context.restore()
  }
  await drawRegion(CLAY_ASSETS.outfit[selection.outfit as 0 | 1], 130, 449, 826, 840)
  await drawRegion(CLAY_ASSETS.shoes[selection.shoes as 0 | 1], 195, 1173, 696, 275)
  await drawRegion(CLAY_ASSETS.hat[selection.hat as 0 | 1], 217, 0, 652, 492)

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png', 0.92))
  if (!blob) throw new Error('Không tạo được avatar.')
  return new File([blob], 'mee-avatar-clay.png', { type: 'image/png' })
}
