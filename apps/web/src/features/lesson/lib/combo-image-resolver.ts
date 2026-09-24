import { getNonRepeatingFallbackImage } from '../components/creative-engine/data/pregenerated-fallback-registry'
import availableCombosManifest from './available-combos-manifest.json'

/**
 * Danh mục các file ảnh tổ hợp (Combos) đã được sinh và sẵn sàng trong hệ thống.
 * Tự động đồng bộ hóa từ available-combos-manifest.json (được sinh bởi sync_combo_registry).
 */
export const AVAILABLE_PREGENERATED_COMBOS: Record<string, string> = {
  ...availableCombosManifest,
}

export interface ResolveComboParams {
  blockIds?: string[]
  prompt?: string
  lastImageUrl?: string
  engineMode?: string
}

/**
 * Tra cứu ảnh ma trận tổ hợp (Combo Matcher):
 * 1. Khớp chính xác 4 chìa khóa nếu có.
 * 2. Nếu chưa có ảnh 4 chìa, lùi về cấp độ 3 chìa (Subject + ColorShape + Action).
 * 3. Nếu chưa có, lùi về cấp độ 2 chìa (Subject + ColorShape).
 * 4. Nếu chưa có, lùi về cấp độ 1 chìa (Subject).
 * 5. Nếu hoàn toàn chưa có trong kho combo, fallback mượt mà về getNonRepeatingFallbackImage.
 */
export function resolveExactComboImage({
  blockIds = [],
  prompt = '',
  lastImageUrl,
  engineMode,
}: ResolveComboParams): string {
  const effectiveBlockIds = [...blockIds]

  // Trích xuất từ khóa từ prompt nếu thiếu bất kỳ khóa nào
  if (prompt) {
    const p = prompt.toLowerCase()
    const hasSubject = effectiveBlockIds.some((id) => (id.startsWith('sub-') && !id.startsWith('custom-sub-')) || id.includes('meo'))
    const hasColor = effectiveBlockIds.some((id) => id.startsWith('cs-'))
    const hasAction = effectiveBlockIds.some((id) => id.startsWith('act-'))
    const hasContext = effectiveBlockIds.some((id) => id.startsWith('ctx-'))

    if (!hasSubject) {
      if (p.includes('mèo') || p.includes('cat')) effectiveBlockIds.push('sub-meo-muop')
      else if (p.includes('xe đạp') || p.includes('bicycle')) effectiveBlockIds.push('sub-xe-dap')
      else if (p.includes('sổ') || p.includes('notebook')) effectiveBlockIds.push('sub-so-tay')
      else if (p.includes('đồng hồ') || p.includes('clock')) effectiveBlockIds.push('sub-dong-ho')
      else if (p.includes('cốc') || p.includes('cup') || p.includes('ly')) effectiveBlockIds.push('sub-coc-su')
      else if (p.includes('cún') || p.includes('chó') || p.includes('dog')) effectiveBlockIds.push('sub-con-cun')
      else if (p.includes('cá') || p.includes('goldfish')) effectiveBlockIds.push('sub-ca-vang')
    }

    if (!hasColor) {
      if (p.includes('béo tròn') || p.includes('tròn') || p.includes('mập')) effectiveBlockIds.push('cs-cat-beo-tron')
      else if (p.includes('chuông vàng') || p.includes('chuông') || p.includes('lục lạc')) effectiveBlockIds.push('cs-cat-chuong-vang')
      else if (p.includes('lông vằn vàng') || p.includes('vằn vàng') || p.includes('vằn')) effectiveBlockIds.push('cs-cat-long-van-vang')
      else if (p.includes('mắt xanh')) effectiveBlockIds.push('cs-cat-mat-xanh')
      else if (p.includes('tai vểnh')) effectiveBlockIds.push('cs-cat-tai-venh')
    }

    if (!hasAction) {
      if (p.includes('dạo bước') || p.includes('bước đi') || p.includes('đi bộ')) effectiveBlockIds.push('act-cat-dao-buoc')
      else if (p.includes('liếm chân') || p.includes('liếm')) effectiveBlockIds.push('act-cat-liem-chan')
      else if (p.includes('vươn vai') || p.includes('ngáp')) effectiveBlockIds.push('act-cat-vuon-vai')
      else if (p.includes('nghiêng đầu')) effectiveBlockIds.push('act-cat-nghieng-dau')
      else if (p.includes('vẫy đuôi')) effectiveBlockIds.push('act-cat-vay-duoi')
    }

    if (!hasContext) {
      if (p.includes('hiên nhà') || p.includes('mái hiên')) effectiveBlockIds.push('ctx-cat-hien-nha')
      else if (p.includes('thảm cỏ') || p.includes('bãi cỏ') || p.includes('cỏ')) effectiveBlockIds.push('ctx-cat-tham-co')
      else if (p.includes('thềm nhà') || p.includes('bậc thềm')) effectiveBlockIds.push('ctx-cat-them-nha')
    }
  }

  if (effectiveBlockIds.length > 0) {
    const subjectId = effectiveBlockIds.find((id) => (id.startsWith('sub-') && !id.startsWith('custom-sub-')) || id === 'sub-meo-muop')
      || (effectiveBlockIds.some((id) => id.toLowerCase().includes('meo')) ? 'sub-meo-muop' : undefined)
    const colorShapeId = effectiveBlockIds.find((id) => id.startsWith('cs-'))
    const actionId = effectiveBlockIds.find((id) => id.startsWith('act-'))
    const contextId = effectiveBlockIds.find((id) => id.startsWith('ctx-'))

    if (subjectId) {
      // 1. Thử cấp độ 4 (Đủ 4 khóa)
      if (colorShapeId && actionId && contextId) {
        const key4 = `combo__${subjectId}__${colorShapeId}__${actionId}__${contextId}`
        if (AVAILABLE_PREGENERATED_COMBOS[key4]) {
          return AVAILABLE_PREGENERATED_COMBOS[key4]
        }
      }

      // 2. Thử cấp độ 3 (3 khóa)
      if (colorShapeId && actionId) {
        const key3 = `combo__${subjectId}__${colorShapeId}__${actionId}`
        if (AVAILABLE_PREGENERATED_COMBOS[key3]) {
          return AVAILABLE_PREGENERATED_COMBOS[key3]
        }
      }

      // 3. Thử cấp độ 2 (2 khóa)
      if (colorShapeId) {
        const key2 = `combo__${subjectId}__${colorShapeId}`
        if (AVAILABLE_PREGENERATED_COMBOS[key2]) {
          return AVAILABLE_PREGENERATED_COMBOS[key2]
        }
      }

      // 4. Thử cấp độ 1 (1 từ ngơ ngác)
      const key1 = `combo__${subjectId}`
      if (AVAILABLE_PREGENERATED_COMBOS[key1]) {
        return AVAILABLE_PREGENERATED_COMBOS[key1]
      }
    }
  }

  // 5. Fallback về hệ thống non-repeating fallback registry
  return getNonRepeatingFallbackImage(prompt, lastImageUrl, engineMode)
}
