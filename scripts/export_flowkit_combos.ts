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
    enLabel: 'chubby little orange goldfish with sweet smiling face and big sparkling anime eyes, gentle glowing translucent fins',
    subjectBlock: { id: 'sub-con-ca-vang', label: 'Con cá vàng', text: 'Con cá vàng', category: 'subject' },
    colorShapeBlocks: GOLDFISH_COLOR_SHAPE_BLOCKS,
    actionBlocks: GOLDFISH_ACTION_BLOCKS,
    contextBlocks: GOLDFISH_CONTEXT_BLOCKS,
  },
  {
    key: 'dog',
    label: 'Con Cún',
    enLabel: 'playful little puppy with floppy ears and a cheerful wagging tail, sweet friendly smile with sparkling dark anime eyes',
    subjectBlock: { id: 'sub-con-cun', label: 'Con cún', text: 'Chú cún con', category: 'subject' },
    colorShapeBlocks: DOG_COLOR_SHAPE_BLOCKS,
    actionBlocks: DOG_ACTION_BLOCKS,
    contextBlocks: DOG_CONTEXT_BLOCKS,
  },
  {
    key: 'cat',
    label: 'Mèo Mướp',
    enLabel: 'ginger tabby kitten with warm soft orange stripes, white chest and white paws, sweet friendly face with big sparkling dark anime eyes and tiny pink nose',
    subjectBlock: { id: 'sub-meo-muop', label: 'Mèo Mướp', text: 'Chú mèo mướp béo tròn', category: 'subject' },
    colorShapeBlocks: CAT_BASE_COLOR_SHAPE_BLOCKS,
    actionBlocks: CAT_BASE_ACTION_BLOCKS,
    contextBlocks: CAT_BASE_CONTEXT_BLOCKS,
  },
]

const BLOCK_ENGLISH_MAP: Record<string, string> = {
  // Cat (Mèo Mướp) - Đặc điểm (Color / Shape)
  'cs-cat-long-van-vang': 'with warm golden-orange striped tabby markings on its soft coat',
  'cs-cat-beo-tron': 'with an extra chubby squishy round belly and happy round cheeks',
  'cs-cat-mat-xanh': 'with sparkling bright emerald-green round anime eyes looking curious and adorable',
  'cs-cat-tai-venh': 'with perked-up alert triangular ears and soft pink inner ears',
  'cs-cat-chuong-vang': 'wearing a shiny round golden bell collar with a cute red ribbon around its neck',

  // Cat (Mèo Mướp) - Hành động (Action)
  'act-cat-liem-chan': 'sitting peacefully and calmly lifting one front paw to gently lick it clean',
  'act-cat-vuon-vai': 'stretching its two front paws forward in a cozy long stretch with a cute little yawn and eyes gently closed',
  'act-cat-vay-duoi': 'standing happily with its long striped tail cheerfully swishing in the air',
  'act-cat-dao-buoc': 'cheerfully walking forward with gentle bouncy steps',
  'act-cat-nghieng-dau': 'tilting its head curiously to the side with big round eyes, wondering happily',

  // Cat (Mèo Mướp) - Bối cảnh vi mô trên cùng sân khấu (Context)
  'ctx-cat-them-nha': 'sitting on the warm sunlit wooden front porch steps with gentle morning sunbeams',
  'ctx-cat-tham-co': 'in a lovely garden on a soft green lawn scattered with tiny yellow and white daisies, near a wooden fence',
  'ctx-cat-hien-nha': 'under the cozy sheltered wooden veranda near the front door',
  'ctx-cat-bau-cua': 'perched cutely near a sunny wooden window sill overlooking the garden',
  'ctx-cat-goc-san': 'in the peaceful sunny courtyard corner surrounded by rustic clay pots and cobblestones',

  // Goldfish (Con Cá Vàng) - Đặc điểm
  'cs-fish-duoi-voan': 'with an elegant long flowing translucent veil tail waving gently like silk',
  'cs-fish-than-tron': 'with an adorably round chubby plump belly and cute big bubbly anime eyes',
  'cs-fish-vay-anh-bac': 'with shimmering sparkling silver-tipped scales glowing on its bright golden-orange body',

  // Goldfish (Con Cá Vàng) - Hành động
  'act-fish-dop-bot': 'happily swimming up to the water surface to playfully blow tiny little bubbles',
  'act-fish-nap-da': 'playfully peeking and hiding behind a smooth rounded pebble stone',
  'act-fish-ria-rong': 'gently nibbling on a tender green waterweed sprig with curious cheerful expression',

  // Goldfish (Con Cá Vàng) - Bối cảnh
  'ctx-fish-binh-thuy-tinh': 'inside a clear round glass fishbowl with sparkling crystal clear water placed on a warm wooden table',
  'ctx-fish-be-ca-soi': 'inside a bright cozy home aquarium with clean white gravel pebbles and gentle sparkling water ripples',
  'ctx-fish-chum-sanh': 'in a traditional rustic glazed ceramic water basin with floating green water plants in gentle morning sunlight',

  // Dog (Con Cún) - Đặc điểm
  'cs-dog-long-vang': 'with soft warm golden-honey fur and cute floppy golden ears',
  'cs-dog-trang-dom': 'with lovely white coat and playful chocolate-brown patches around its eye and back',
  'cs-dog-long-xu': 'with a super fluffy curly woolly teddy-bear coat of soft fur',

  // Dog (Con Cún) - Hành động
  'act-dog-duoi-bong': 'playfully bouncing and chasing a small bright colorful toy rubber ball',
  'act-dog-ngoi-cho': 'sitting down patiently and obediently with front paws together and tail wagging eagerly',
  'act-dog-tha-dep': 'playfully holding a soft cozy house slipper in its mouth with a proud happy grin',

  // Dog (Con Cún) - Bối cảnh
  'ctx-dog-san-gach': 'on a warm sunny red-brick courtyard patio with soft morning sunbeams',
  'ctx-dog-cay-bang': 'under the cool gentle shade of a leafy green tree on a grassy garden lawn',
  'ctx-dog-tham-phong': 'on a cozy soft woven rug in a warm and bright sunlit living room',

  // ── BÀI 1.2: CỐC SỨ TRẮNG (CERAMIC CUP) ─────────────────────────
  'cs-su-trang-men-bong': 'made of smooth glossy milk-white porcelain ceramic with soft clean shine',
  'cs-me-mieng-goc': 'with a charming tiny chip on its rim showing rustic handcrafted pottery character',
  'cs-quai-cam-tron': 'with an adorable chubby round curved ceramic handle on the side',
  'act-khoi-nghi-ngut': 'with gentle cozy swirls of warm fragrant steam rising softly from inside',
  'act-toa-huong-thom': 'diffusing sweet delicate herbal tea fragrance softly into the air',
  'act-chua-tra-nong': 'filled to the brim with warm soothing golden honey tea',
  'ctx-ban-go-soi': 'resting comfortably on a rustic warm oak wood tabletop with soft morning sunbeams',
  'ctx-canh-so-tay': 'placed neatly beside an open vintage notebook showing playful pencil doodles',
  'ctx-bau-cua-so': 'perched by a cozy sunny wooden windowsill overlooking a peaceful green garden',

  // ── BÀI 1.2: CÁI XE ĐẠP (BICYCLE) ──────────────────────────────
  'cs-bike-khung-xanh': 'with a glossy pastel sky-blue vintage steel frame and shiny chrome accents',
  'cs-bike-banh-nan-hoa': 'with two round spoked wheels and cream-colored retro rubber tires',
  'cs-bike-gio-may': 'with a rustic woven wicker basket attached to the front handlebars',
  'act-bike-lan-banh': 'breezily rolling forward smoothly along the path with gentle breeze',
  'act-bike-dung-chan-chong': 'parked peacefully resting on its cute side kickstand',
  'act-bike-cho-gio-hoa': 'carrying a front wicker basket overflowing with fresh colorful wild daisies and roses',
  'ctx-bike-bo-ho': 'by a breezy tranquil sparkling blue lakeside under clear skies',
  'ctx-bike-bong-cay': 'under the dappled cool shade of a lush green storybook tree',
  'ctx-bike-duong-lang': 'on a winding country path paved with smooth white pebbles and wildflowers',

  // ── BÀI 1.2: CUỐN SỔ TAY (NOTEBOOK) ────────────────────────────
  'cs-note-bia-da': 'with a rustic stitched brown leather cover and embossed vintage patterns',
  'cs-note-trang-giay': 'with thick textured warm cream deckle-edge parchment pages',
  'cs-note-day-do': 'with a slender crimson silk ribbon bookmark draped elegantly between the pages',
  'act-note-mo-trang': 'lying open showing whimsical hand-drawn pencil doodles and colored sketches',
  'act-note-lap-lanh': 'glowing softly under the warm cozy amber light of a desk lamp',
  'act-note-luu-net-ve': 'filled with charming creative watercolor sketches and cute cartoon notes',
  'ctx-note-ban-hoc': 'on a tidy cozy wooden study desk surrounded by art pens and books',
  'ctx-note-tach-tra': 'resting beside a warm steaming ceramic teacup and honey biscuits',
  'ctx-note-tan-cay': 'resting on a picnic blanket under the sunny green foliage of a storybook tree',

  // ── BÀI 1.2: CÁI ĐỒNG HỒ CỔ (CLOCK) ────────────────────────────
  'cs-clk-vo-go': 'with an intricately carved antique dark mahogany wooden casing',
  'cs-clk-mat-so': 'with a polished golden clock face adorned with delicate Roman numerals',
  'cs-clk-kim-dong-ho': 'with ornate filigree vintage clock hands gracefully pointing the time',
  'act-clk-diem-chuong': 'chiming merrily with musical sparkling golden notes floating around',
  'act-clk-tich-tac': 'ticking rhythmically with a steady peaceful heartbeat rhythm',
  'act-clk-phan-chieu': 'catching the warm golden sunset glow through its polished glass face',
  'ctx-clk-tuong-gach': 'mounted charmingly against a cozy rustic exposed red-brick wall',
  'ctx-clk-lo-suoi': 'perched proudly on the stone mantelpiece above a warm crackling fireplace',
  'ctx-clk-ke-sach': 'nestled neatly between classic storybooks on a cozy living room wooden bookshelf',
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
    `An adorable cute ${enSubject}`,
    colorShapeEn,
    actionEn,
  ].filter(Boolean).join(', ')

  const sceneContext = contextEn
    ? `in a charming setting, ${contextEn}`
    : `centered on a clean soft warm studio background matching the AIKid video lesson illustration style`

  return `Cute children storybook cartoon illustration, modern 2.5D anime picture book aesthetic, clean soft outlines, warm pastel colors, gentle soft studio lighting: ${parts}, ${sceneContext}, high quality educational children book digital art.`
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
      promptEn: `Cute children storybook cartoon illustration, modern 2.5D anime picture book aesthetic, clean soft outlines, warm pastel colors, gentle soft studio lighting: An adorable cute ${cfg.enLabel}, standing centered cheerfully looking friendly and curious, on a clean soft warm studio background matching the AIKid video lesson illustration style, high quality educational children book digital art.`,
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
