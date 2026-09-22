import fs from 'fs'
import path from 'path'
import {
  CERAMIC_CUP_COLOR_SHAPE_BLOCKS,
  CERAMIC_CUP_ACTION_BLOCKS,
  CERAMIC_CUP_CONTEXT_BLOCKS,
  BICYCLE_COLOR_SHAPE_BLOCKS,
  BICYCLE_ACTION_BLOCKS,
  BICYCLE_CONTEXT_BLOCKS,
  NOTEBOOK_COLOR_SHAPE_BLOCKS,
  NOTEBOOK_ACTION_BLOCKS,
  NOTEBOOK_CONTEXT_BLOCKS,
  CLOCK_COLOR_SHAPE_BLOCKS,
  CLOCK_ACTION_BLOCKS,
  CLOCK_CONTEXT_BLOCKS,
  GOLDFISH_COLOR_SHAPE_BLOCKS,
  GOLDFISH_ACTION_BLOCKS,
  GOLDFISH_CONTEXT_BLOCKS,
  DOG_COLOR_SHAPE_BLOCKS,
  DOG_ACTION_BLOCKS,
  DOG_CONTEXT_BLOCKS,
  CAT_BASE_COLOR_SHAPE_BLOCKS,
  CAT_BASE_ACTION_BLOCKS,
  CAT_BASE_CONTEXT_BLOCKS,
} from '../apps/web/src/features/lesson/components/creative-engine/data/creative-blocks-dataset'
import type { CreativeBlock } from '../apps/web/src/features/lesson/components/creative-engine/types'

export interface FlowKitJobItem {
  id: string
  batchName: string
  subjectKey: string
  subjectLabel: string
  blockIds: {
    subject: string
    colorShape: string
    action: string
    context: string
  }
  blockLabels: {
    subject: string
    colorShape: string
    action: string
    context: string
  }
  promptVi: string
  promptEn: string
  targetFilename: string
  targetAssetPath: string
  aspectRatio: '4:3' | '1:1' | '16:9'
  status: 'pending' | 'generated' | 'verified'
}

const SUBJECT_CONFIGS: Array<{
  key: string
  label: string
  enLabel: string
  subjectBlock: CreativeBlock
  colorShapeBlocks: CreativeBlock[]
  actionBlocks: CreativeBlock[]
  contextBlocks: CreativeBlock[]
}> = [
  {
    key: 'ceramic-cup',
    label: 'Cốc Sứ Trắng',
    enLabel: 'ceramic teacup',
    subjectBlock: { id: 'sub-coc-su', label: 'Cốc sứ trắng', text: 'Cái cốc sứ trắng tinh', category: 'subject' },
    colorShapeBlocks: CERAMIC_CUP_COLOR_SHAPE_BLOCKS,
    actionBlocks: CERAMIC_CUP_ACTION_BLOCKS,
    contextBlocks: CERAMIC_CUP_CONTEXT_BLOCKS,
  },
  {
    key: 'bicycle',
    label: 'Cái Xe Đạp',
    enLabel: 'mini vintage bicycle',
    subjectBlock: { id: 'sub-xe-dap', label: 'Cái xe đạp', text: 'Chiếc xe đạp mini', category: 'subject' },
    colorShapeBlocks: BICYCLE_COLOR_SHAPE_BLOCKS,
    actionBlocks: BICYCLE_ACTION_BLOCKS,
    contextBlocks: BICYCLE_CONTEXT_BLOCKS,
  },
  {
    key: 'notebook',
    label: 'Cuốn Sổ Tay',
    enLabel: 'leather notebook journal',
    subjectBlock: { id: 'sub-so-tay', label: 'Cuốn sổ tay', text: 'Cuốn sổ tay mở bìa da', category: 'subject' },
    colorShapeBlocks: NOTEBOOK_COLOR_SHAPE_BLOCKS,
    actionBlocks: NOTEBOOK_ACTION_BLOCKS,
    contextBlocks: NOTEBOOK_CONTEXT_BLOCKS,
  },
  {
    key: 'clock',
    label: 'Đồng Hồ Báo Thức',
    enLabel: 'vintage alarm clock',
    subjectBlock: { id: 'sub-dong-ho', label: 'Đồng hồ để bàn', text: 'Chiếc đồng hồ để bàn', category: 'subject' },
    colorShapeBlocks: CLOCK_COLOR_SHAPE_BLOCKS,
    actionBlocks: CLOCK_ACTION_BLOCKS,
    contextBlocks: CLOCK_CONTEXT_BLOCKS,
  },
  {
    key: 'goldfish',
    label: 'Con Cá Vàng',
    enLabel: 'chubby orange goldfish',
    subjectBlock: { id: 'sub-con-ca-vang', label: 'Con cá vàng', text: 'Con cá vàng', category: 'subject' },
    colorShapeBlocks: GOLDFISH_COLOR_SHAPE_BLOCKS,
    actionBlocks: GOLDFISH_ACTION_BLOCKS,
    contextBlocks: GOLDFISH_CONTEXT_BLOCKS,
  },
  {
    key: 'dog',
    label: 'Con Cún',
    enLabel: 'playful fluffy puppy',
    subjectBlock: { id: 'sub-con-cun', label: 'Con cún', text: 'Chú cún con', category: 'subject' },
    colorShapeBlocks: DOG_COLOR_SHAPE_BLOCKS,
    actionBlocks: DOG_ACTION_BLOCKS,
    contextBlocks: DOG_CONTEXT_BLOCKS,
  },
  {
    key: 'cat',
    label: 'Mèo Mướp',
    enLabel: 'striped ginger tabby cat',
    subjectBlock: { id: 'sub-meo-muop', label: 'Mèo Mướp', text: 'Chú mèo mướp béo tròn', category: 'subject' },
    colorShapeBlocks: CAT_BASE_COLOR_SHAPE_BLOCKS,
    actionBlocks: CAT_BASE_ACTION_BLOCKS,
    contextBlocks: CAT_BASE_CONTEXT_BLOCKS,
  },
]

const BLOCK_ENGLISH_MAP: Record<string, string> = {
  // Cat (Mèo Mướp)
  'cs-cat-long-van-vang': 'warm golden-orange striped tabby fur',
  'cs-cat-beo-tron': 'chubby round plump body',
  'cs-cat-mat-xanh': 'sparkling emerald green eyes',
  'cs-cat-tai-venh': 'perked up playful triangular ears',
  'cs-cat-chuong-vang': 'wearing a small shiny golden bell collar',
  'act-cat-liem-chan': 'calmly sitting and licking its paw clean',
  'act-cat-vuon-vai': 'stretching front legs forward and yawning sleepily',
  'act-cat-vay-duoi': 'gently wagging its long curled tail happily',
  'act-cat-dao-buoc': 'leisurely strolling with soft gentle steps',
  'act-cat-nghieng-dau': 'tilting head curiously with wide round eyes',
  'ctx-cat-them-nha': 'basking in morning sun on a stone doorstep',
  'ctx-cat-tham-co': 'sitting on lush green grass with tiny daisies',
  'ctx-cat-hien-nha': 'resting under the shade of a rustic wooden porch',
  'ctx-cat-bau-cua': 'perched neatly on a cozy wooden window sill',
  'ctx-cat-goc-san': 'in a peaceful courtyard corner with warm red tiles',
}

function getBlockEn(block: CreativeBlock | undefined): string {
  if (!block) return ''
  return BLOCK_ENGLISH_MAP[block.id] || block.label.toLowerCase()
}

function generateEnglishPrompt(
  enSubject: string,
  details: string
): string {
  // Chuẩn hóa prompt theo phong cách polymer clay diorama trùng khớp với reference image của user
  return `In the exact same handmade polymer clay diorama style: ${enSubject} with ${details}, beside a miniature wooden chair on the wooden floor in a cozy playroom, smooth clay texture, warm pastel room background, soft clay glaze, Montessori aesthetic`
}

export function buildFlowKitJobMatrix(): {
  allJobs: FlowKitJobItem[]
  batches: Record<string, FlowKitJobItem[]>
  summary: { totalJobs: number; perSubject: Record<string, number> }
} {
  const allJobs: FlowKitJobItem[] = []
  const batches: Record<string, FlowKitJobItem[]> = {}
  const perSubject: Record<string, number> = {}

  for (const cfg of SUBJECT_CONFIGS) {
    const subjectJobs: FlowKitJobItem[] = []

    // ── CẤP ĐỘ 1: Chỉ 1 từ ngơ ngác ─────────────────────────────
    const level1Key = `combo__${cfg.subjectBlock.id}`
    subjectJobs.push({
      id: level1Key,
      batchName: `${cfg.key}_level1`,
      subjectKey: cfg.key,
      subjectLabel: cfg.label,
      blockIds: { subject: cfg.subjectBlock.id, colorShape: '', action: '', context: '' },
      blockLabels: { subject: cfg.subjectBlock.label, colorShape: '', action: '', context: '' },
      promptVi: `${cfg.subjectBlock.text} (1 từ thử nghiệm, chưa có chìa khóa)`,
      promptEn: `In the exact same handmade polymer clay diorama style: A plain simple clay ${cfg.enLabel} standing blankly and looking confused alone on the wooden floor, minimal texture, warm pastel room, Montessori aesthetic`,
      targetFilename: `${level1Key}.webp`,
      targetAssetPath: `/assets/pregenerated-combos/${cfg.key}/${level1Key}.webp`,
      aspectRatio: '4:3',
      status: 'pending',
    })

    // ── CẤP ĐỘ 2: 2 chìa khóa (Món đồ + Đặc điểm) ───────────────
    for (const cs of cfg.colorShapeBlocks) {
      const level2Key = `combo__${cfg.subjectBlock.id}__${cs.id}`
      subjectJobs.push({
        id: level2Key,
        batchName: `${cfg.key}_level2`,
        subjectKey: cfg.key,
        subjectLabel: cfg.label,
        blockIds: { subject: cfg.subjectBlock.id, colorShape: cs.id, action: '', context: '' },
        blockLabels: { subject: cfg.subjectBlock.label, colorShape: cs.label, action: '', context: '' },
        promptVi: `${cfg.subjectBlock.text}, ${cs.text}`,
        promptEn: generateEnglishPrompt(cfg.enLabel, getBlockEn(cs)),
        targetFilename: `${level2Key}.webp`,
        targetAssetPath: `/assets/pregenerated-combos/${cfg.key}/${level2Key}.webp`,
        aspectRatio: '4:3',
        status: 'pending',
      })
    }

    // ── CẤP ĐỘ 3: 3 chìa khóa (Món đồ + Đặc điểm + Hành động) ───
    for (const cs of cfg.colorShapeBlocks) {
      for (const act of cfg.actionBlocks) {
        const level3Key = `combo__${cfg.subjectBlock.id}__${cs.id}__${act.id}`
        subjectJobs.push({
          id: level3Key,
          batchName: `${cfg.key}_level3`,
          subjectKey: cfg.key,
          subjectLabel: cfg.label,
          blockIds: { subject: cfg.subjectBlock.id, colorShape: cs.id, action: act.id, context: '' },
          blockLabels: { subject: cfg.subjectBlock.label, colorShape: cs.label, action: act.label, context: '' },
          promptVi: `${cfg.subjectBlock.text}, ${cs.text}, ${act.text}`,
          promptEn: generateEnglishPrompt(cfg.enLabel, `${getBlockEn(cs)}, ${getBlockEn(act)}`),
          targetFilename: `${level3Key}.webp`,
          targetAssetPath: `/assets/pregenerated-combos/${cfg.key}/${level3Key}.webp`,
          aspectRatio: '4:3',
          status: 'pending',
        })
      }
    }

    // ── CẤP ĐỘ 4: Đầy đủ 4 chìa khóa ───────────────────────────
    for (const cs of cfg.colorShapeBlocks) {
      for (const act of cfg.actionBlocks) {
        for (const ctx of cfg.contextBlocks) {
          const comboKey = `combo__${cfg.subjectBlock.id}__${cs.id}__${act.id}__${ctx.id}`
          const filename = `${comboKey}.webp`
          const assetPath = `/assets/pregenerated-combos/${cfg.key}/${filename}`
          const promptVi = `${cfg.subjectBlock.text}, ${cs.text}, ${act.text}, ${ctx.text}`
          const promptEn = generateEnglishPrompt(
            cfg.enLabel,
            `${getBlockEn(cs)}, ${getBlockEn(act)}, ${getBlockEn(ctx)}`
          )

          const job: FlowKitJobItem = {
            id: comboKey,
            batchName: cfg.key,
            subjectKey: cfg.key,
            subjectLabel: cfg.label,
            blockIds: {
              subject: cfg.subjectBlock.id,
              colorShape: cs.id,
              action: act.id,
              context: ctx.id,
            },
            blockLabels: {
              subject: cfg.subjectBlock.label,
              colorShape: cs.label,
              action: act.label,
              context: ctx.label,
            },
            promptVi,
            promptEn,
            targetFilename: filename,
            targetAssetPath: assetPath,
            aspectRatio: '4:3',
            status: 'pending',
          }

          subjectJobs.push(job)
        }
      }
    }

    allJobs.push(...subjectJobs)
    batches[cfg.key] = subjectJobs
    perSubject[cfg.key] = subjectJobs.length
  }

  return {
    allJobs,
    batches,
    summary: {
      totalJobs: allJobs.length,
      perSubject,
    },
  }
}

function main() {
  const outDir = path.resolve(__dirname, '../data-export/flowkit')
  const batchDir = path.join(outDir, 'batches')

  if (!fs.existsSync(batchDir)) {
    fs.mkdirSync(batchDir, { recursive: true })
  }

  const { allJobs, batches, summary } = buildFlowKitJobMatrix()

  // 1. Ghi toàn bộ manifest tổng
  fs.writeFileSync(
    path.join(outDir, 'flowkit_manifest_all.json'),
    JSON.stringify(allJobs, null, 2),
    'utf-8'
  )

  // 2. Ghi từng batch theo Subject
  for (const [key, jobs] of Object.entries(batches)) {
    fs.writeFileSync(
      path.join(batchDir, `batch_${key}.json`),
      JSON.stringify(jobs, null, 2),
      'utf-8'
    )
  }

  // 3. Ghi file CSV tổng quan
  const csvHeaders = [
    'Job ID',
    'Batch',
    'Subject',
    'Color/Shape',
    'Action',
    'Context',
    'Prompt VI',
    'Target File',
    'Status',
  ]
  const csvRows = allJobs.map((j) =>
    [
      `"${j.id}"`,
      `"${j.batchName}"`,
      `"${j.blockLabels.subject}"`,
      `"${j.blockLabels.colorShape}"`,
      `"${j.blockLabels.action}"`,
      `"${j.blockLabels.context}"`,
      `"${j.promptVi.replace(/"/g, '""')}"`,
      `"${j.targetFilename}"`,
      `"${j.status}"`,
    ].join(',')
  )

  fs.writeFileSync(
    path.join(outDir, 'flowkit_matrix_summary.csv'),
    [csvHeaders.join(','), ...csvRows].join('\n'),
    'utf-8'
  )

  console.log('================================================================')
  console.log('🎉 FLOWKIT BATCH MATRIX EXPORT THÀNH CÔNG!')
  console.log('================================================================')
  console.log(`Tổng số kịch bản tổ hợp (Combinations): ${summary.totalJobs}`)
  console.log('Phân bổ chi tiết từng nhóm đối tượng:')
  for (const [k, count] of Object.entries(summary.perSubject)) {
    console.log(` - ${k}: ${count} ảnh tổ hợp`)
  }
  console.log(`Đã xuất manifest tại: ${outDir}/flowkit_manifest_all.json`)
  console.log(`Đã xuất CSV tổng quan tại: ${outDir}/flowkit_matrix_summary.csv`)
  console.log('================================================================')
}

if (require.main === module) {
  main()
}
