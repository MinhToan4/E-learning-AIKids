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
    enLabel: 'ginger tabby cat mascot with warm soft orange and cream markings, sweet friendly face with black bead eyes and tiny pink nose',
    subjectBlock: { id: 'sub-meo-muop', label: 'Mèo Mướp', text: 'Chú mèo mướp béo tròn', category: 'subject' },
    colorShapeBlocks: CAT_BASE_COLOR_SHAPE_BLOCKS,
    actionBlocks: CAT_BASE_ACTION_BLOCKS,
    contextBlocks: CAT_BASE_CONTEXT_BLOCKS,
  },
]

const BLOCK_ENGLISH_MAP: Record<string, string> = {
  // Cat (Mèo Mướp) - Đặc điểm (Color / Shape)
  'cs-cat-long-van-vang': 'with warm golden-orange striped tabby clay markings on its soft coat',
  'cs-cat-beo-tron': 'with an extra chubby and plump squishy round belly and happy round cheeks',
  'cs-cat-mat-xanh': 'with big sparkling bright emerald-green clay round eyes looking curious and adorable',
  'cs-cat-tai-venh': 'with perked-up playful triangular clay ears and soft pink inner clay',
  'cs-cat-chuong-vang': 'wearing a shiny round golden clay bell collar with a cute red ribbon around its neck',

  // Cat (Mèo Mướp) - Hành động (Action)
  'act-cat-liem-chan': 'sitting peacefully and calmly lifting one front paw to gently lick it clean',
  'act-cat-vuon-vai': 'stretching its two front paws forward in a long cozy stretch and yawning cutely with eyes closed',
  'act-cat-vay-duoi': 'standing happily with its long curled orange and white clay tail cheerfully swishing in the air',
  'act-cat-dao-buoc': 'cheerfully walking forward with gentle bouncy steps',
  'act-cat-nghieng-dau': 'tilting its head curiously to the side with wide round eyes, wondering happily',

  // Cat (Mèo Mướp) - Bối cảnh vi mô trên cùng sân khấu hiên nhà / sân vườn (Context)
  'ctx-cat-them-nha': 'sitting on the warm smooth clay front porch steps in gentle morning sunbeams',
  'ctx-cat-tham-co': 'on the soft green clay lawn patch beside the porch, surrounded by tiny yellow and white clay daisies',
  'ctx-cat-hien-nha': 'under the cozy clay wooden veranda post near the house entrance under the gentle shade',
  'ctx-cat-bau-cua': 'perched near the cozy clay window sill beside the porch path',
  'ctx-cat-goc-san': 'in the sunny corner of the courtyard surrounded by rounded clay cobblestones and pots',
}

function getBlockEn(block: CreativeBlock | undefined): string {
  if (!block) return ''
  return BLOCK_ENGLISH_MAP[block.id] || block.label.toLowerCase()
}

function generateEnglishPrompt(
  enSubject: string,
  colorShapeEn: string,
  actionEn?: string,
  contextEn?: string
): string {
  const parts = [
    `An adorable chubby soft clay ${enSubject}`,
    colorShapeEn,
    actionEn,
  ].filter(Boolean).join(', ')

  const sceneContext = contextEn
    ? `in the exact same cozy soft clay garden porch setting, ${contextEn}, with smooth rounded clay paving stones, gentle clay grass, and a soft clay wooden veranda post under warm sunny morning light.`
    : `in the exact same cozy soft clay garden porch setting with smooth rounded clay paving stones, gentle clay grass, and a soft clay wooden veranda post under warm sunny morning light.`

  return `2.5D cute soft clay illustration style, Hallmark craft aesthetic, smooth matte plasticine clay, rounded soft bevels, pastel warm color palette, gentle soft ambient studio lighting, Montessori children storybook art: ${parts}, ${sceneContext}`
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
      promptEn: `2.5D cute soft clay illustration style, Hallmark craft aesthetic, smooth matte plasticine clay, rounded soft bevels, pastel warm color palette, gentle soft ambient studio lighting, Montessori children storybook art: An adorable chubby soft clay ${cfg.enLabel}, standing centered looking friendly and curious, in the exact same cozy soft clay garden porch setting with smooth rounded clay paving stones, gentle clay grass, and a soft clay wooden veranda post under warm sunny morning light.`,
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
          promptEn: generateEnglishPrompt(cfg.enLabel, getBlockEn(cs), getBlockEn(act)),
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
            getBlockEn(cs),
            getBlockEn(act),
            getBlockEn(ctx)
          )

          const job: FlowKitJobItem = {
            id: comboKey,
            batchName: `${cfg.key}_level4`,
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
