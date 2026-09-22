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
  if (blockIds.length > 0) {
    const subjectId = blockIds.find((id) => id.startsWith('sub-'))
    const colorShapeId = blockIds.find((id) => id.startsWith('cs-'))
    const actionId = blockIds.find((id) => id.startsWith('act-'))
    const contextId = blockIds.find((id) => id.startsWith('ctx-'))

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
