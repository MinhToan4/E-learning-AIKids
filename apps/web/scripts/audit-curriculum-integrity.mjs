// Script kiểm tra đối soát dữ liệu (Data Integrity Audit) cho giáo trình AI Kids
// Đối soát giữa island-curriculum-registry.ts, aiki-islands-curriculum.ts, IdentityLockEngine.tsx, creative-blocks-dataset.ts, MagicKeysEngine.tsx

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const ROOT_WEB = path.resolve(__dirname, '..')
const ROOT_CORE = path.resolve(ROOT_WEB, '../../../../2-MCP-Core/core-lms-api')

const PATH_WEB_REGISTRY = path.join(ROOT_WEB, 'src/features/lesson/data/island-curriculum-registry.ts')
const PATH_LMS_CURRICULUM = path.join(ROOT_CORE, 'src/curricula/aiki-islands-curriculum.ts')
const PATH_IDENTITY_LOCK = path.join(ROOT_WEB, 'src/features/lesson/components/creative-engine/engines/IdentityLockEngine.tsx')
const PATH_CREATIVE_BLOCKS = path.join(ROOT_WEB, 'src/features/lesson/components/creative-engine/data/creative-blocks-dataset.ts')
const PATH_MAGIC_KEYS = path.join(ROOT_WEB, 'src/features/lesson/components/creative-engine/engines/MagicKeysEngine.tsx')

console.log('='.repeat(70))
console.log('🔍 AI KIDS CURRICULUM DATA INTEGRITY AUDIT')
console.log('='.repeat(70))

let hasFailure = false
function assert(condition, message) {
  if (!condition) {
    console.error(`❌ FAIL: ${message}`)
    hasFailure = true
  } else {
    console.log(`✅ PASS: ${message}`)
  }
}

// 1. Kiểm tra tồn tại các file nguồn
assert(fs.existsSync(PATH_WEB_REGISTRY), `File web registry tồn tại (${PATH_WEB_REGISTRY})`)
assert(fs.existsSync(PATH_LMS_CURRICULUM), `File LMS curriculum tồn tại (${PATH_LMS_CURRICULUM})`)
assert(fs.existsSync(PATH_IDENTITY_LOCK), `File IdentityLockEngine tồn tại (${PATH_IDENTITY_LOCK})`)
assert(fs.existsSync(PATH_CREATIVE_BLOCKS), `File creative-blocks-dataset tồn tại (${PATH_CREATIVE_BLOCKS})`)
assert(fs.existsSync(PATH_MAGIC_KEYS), `File MagicKeysEngine tồn tại (${PATH_MAGIC_KEYS})`)

if (hasFailure) {
  process.exit(1)
}

const webContent = fs.readFileSync(PATH_WEB_REGISTRY, 'utf-8')
const lmsContent = fs.readFileSync(PATH_LMS_CURRICULUM, 'utf-8')
const identityContent = fs.readFileSync(PATH_IDENTITY_LOCK, 'utf-8')
const creativeBlocksContent = fs.readFileSync(PATH_CREATIVE_BLOCKS, 'utf-8')
const magicKeysContent = fs.readFileSync(PATH_MAGIC_KEYS, 'utf-8')

// 2. Kiểm tra câu hỏi placeholder generic trong nội dung bài học
console.log('\n--- 1. Kiểm tra câu hỏi generic placeholder ---')
const genericPhrases = [
  'Quy tắc vàng của bài',
  'Kỹ năng quan trọng bé rèn luyện',
  'Câu hỏi ôn tập số',
  'Câu hỏi kiểm tra bài',
  'Nội dung câu hỏi',
  'Đáp án đúng của bài',
]

// Kiểm tra trong webContent
let webGenericCount = 0
for (const phrase of genericPhrases) {
  const matches = webContent.match(new RegExp(phrase, 'g'))
  if (matches) {
    webGenericCount += matches.length
    console.error(`  Phát hiện "${phrase}" trong island-curriculum-registry.ts: ${matches.length} lần`)
  }
}
assert(webGenericCount === 0, `Không còn câu hỏi placeholder generic trong web registry (Số lượng: ${webGenericCount})`)

// Kiểm tra trong các đối tượng bài học AIKI_ISLANDS_LESSONS của LMS
const lmsLessonsBlockMatch = lmsContent.match(/export const AIKI_ISLANDS_LESSONS:\s*AikiIslandLessonSeed\[\]\s*=\s*\[([\s\S]*?)\];\n/m)
const lmsLessonsBlock = lmsLessonsBlockMatch ? lmsLessonsBlockMatch[1] : ''
let lmsGenericCount = 0
for (const phrase of genericPhrases) {
  const matches = lmsLessonsBlock.match(new RegExp(phrase, 'g'))
  if (matches) {
    lmsGenericCount += matches.length
    console.error(`  Phát hiện "${phrase}" trong AIKI_ISLANDS_LESSONS: ${matches.length} lần`)
  }
}
assert(lmsGenericCount === 0, `Không còn câu hỏi placeholder generic trong AIKI_ISLANDS_LESSONS của core-lms-api (Số lượng: ${lmsGenericCount})`)

// 3. Kiểm tra đủ 22 bài học (1.1 đến 5.5) có stage2_confirmGoal và 3 câu quiz P4
console.log('\n--- 2. Kiểm tra đủ 22 bài học (1.1 đến 5.5) ---')
const EXPECTED_LESSON_NUMBERS = [
  '1.1', '1.2', '1.3', '1.4',
  '2.1', '2.2', '2.3', '2.4',
  '3.1', '3.2', '3.3', '3.4',
  '4.1', '4.2', '4.3', '4.4', '4.5',
  '5.1', '5.2', '5.3', '5.4', '5.5',
]

const webLessons = [...webContent.matchAll(/"lessonNumber":\s*"([^"]+)"/g)].map(m => m[1])
assert(webLessons.length === 22, `Web registry có đúng 22 bài học (Hiện có: ${webLessons.length})`)

const lmsLessons = [...lmsLessonsBlock.matchAll(/"lessonNumber":\s*"([^"]+)"/g)].map(m => m[1])
assert(lmsLessons.length === 22, `LMS curriculum có đúng 22 bài học (Hiện có: ${lmsLessons.length})`)

for (const num of EXPECTED_LESSON_NUMBERS) {
  assert(webLessons.includes(num), `Web registry chứa bài ${num}`)
  assert(lmsLessons.includes(num), `LMS curriculum chứa bài ${num}`)
}

// Kiểm tra chi tiết từng bài học trong webContent
console.log('\n--- 3. Kiểm tra stage2_confirmGoal và stage4_quiz chi tiết (Web Registry) ---')
const webLessonBlocks = webContent.split(/\{\s*"id":\s*"bai-[0-9]-[0-9]"/).slice(1)
assert(webLessonBlocks.length === 22, `Tách được 22 khối bài học từ web registry`)

let allStage2Valid = true
let allStage4Valid = true

webLessonBlocks.forEach((block, idx) => {
  const numMatch = block.match(/"lessonNumber":\s*"([^"]+)"/)
  const num = numMatch ? numMatch[1] : `Index ${idx}`

  // Stage 2
  const hasStage2 = block.includes('"stage2_confirmGoal":')
  const stage2QuestionMatch = block.match(/"stage2_confirmGoal":\s*\{[\s\S]*?"question":\s*"([^"]+)"/)
  const stage2Question = stage2QuestionMatch ? stage2QuestionMatch[1].trim() : ''
  const stage2OptionsMatch = block.match(/"stage2_confirmGoal":\s*\{[\s\S]*?"options":\s*\[([\s\S]*?)\]/)
  const stage2OptionsCount = stage2OptionsMatch ? (stage2OptionsMatch[1].match(/"text":/g) || []).length : 0

  if (!hasStage2 || stage2Question.length < 10 || stage2OptionsCount < 2) {
    console.error(`  Bài ${num} thiếu hoặc không hợp lệ stage2_confirmGoal (question: "${stage2Question}", options: ${stage2OptionsCount})`)
    allStage2Valid = false
  }

  // Stage 4 quiz
  const stage4QuizMatch = block.match(/"stage4_quiz":\s*\{[\s\S]*?"questions":\s*\[([\s\S]*?)\]\s*\}/)
  const stage4QuestionsText = stage4QuizMatch ? stage4QuizMatch[1] : ''
  const quizPromptCount = (stage4QuestionsText.match(/"prompt":/g) || []).length

  if (quizPromptCount !== 3) {
    console.error(`  Bài ${num} không có đúng 3 câu quiz trong stage4_quiz (Hiện có: ${quizPromptCount})`)
    allStage4Valid = false
  }
})

assert(allStage2Valid, 'Tất cả 22 bài trong Web Registry có stage2_confirmGoal đầy đủ câu hỏi và lựa chọn thực tế')
assert(allStage4Valid, 'Tất cả 22 bài trong Web Registry có đúng 3 câu quiz chi tiết trong stage4_quiz')

// Kiểm tra chi tiết từng bài trong core-lms-api
console.log('\n--- 4. Kiểm tra confirmGoal và quizQuestions chi tiết (LMS Curriculum) ---')
const lmsLessonBlocks = lmsLessonsBlock.split(/\{\s*"slug":\s*"bai-[0-9]-[0-9]/).slice(1)
assert(lmsLessonBlocks.length === 22, `Tách được 22 khối bài học từ LMS AIKI_ISLANDS_LESSONS`)

let allLmsConfirmValid = true
let allLmsQuizValid = true

lmsLessonBlocks.forEach((block, idx) => {
  const numMatch = block.match(/"lessonNumber":\s*"([^"]+)"/)
  const num = numMatch ? numMatch[1] : `Index ${idx}`

  const hasConfirm = block.includes('"confirmGoal":')
  const confirmQuestionMatch = block.match(/"confirmGoal":\s*\{[\s\S]*?"question":\s*"([^"]+)"/)
  const confirmQuestion = confirmQuestionMatch ? confirmQuestionMatch[1].trim() : ''

  if (!hasConfirm || confirmQuestion.length < 10) {
    console.error(`  LMS bài ${num} thiếu hoặc không hợp lệ confirmGoal`)
    allLmsConfirmValid = false
  }

  const quizMatch = block.match(/"quizQuestions":\s*\[([\s\S]*?)\]\s*,\s*"situation":/)
  const quizText = quizMatch ? quizMatch[1] : ''
  const quizCount = (quizText.match(/"prompt":/g) || []).length

  if (quizCount !== 3) {
    console.error(`  LMS bài ${num} không có đúng 3 quizQuestions (Hiện có: ${quizCount})`)
    allLmsQuizValid = false
  }
})

assert(allLmsConfirmValid, 'Tất cả 22 bài trong LMS Curriculum có confirmGoal với câu hỏi trắc nghiệm thực tế')
assert(allLmsQuizValid, 'Tất cả 22 bài trong LMS Curriculum có đúng 3 quizQuestions chi tiết')

// 4. Kiểm tra 4 nhân vật chuẩn Bí, Tép, Bông, Rô trong IdentityLockEngine.tsx
console.log('\n--- 5. Kiểm tra 4 nhân vật chuẩn trong IdentityLockEngine.tsx ---')
const expectedCharacters = [
  { name: 'Bí', id: 'char-bi' },
  { name: 'Tép', id: 'char-tep' },
  { name: 'Bông', id: 'char-bong' },
  { name: 'Rô', id: 'char-ro' },
]

for (const char of expectedCharacters) {
  const hasChar = identityContent.includes(`id: '${char.id}'`) && identityContent.includes(`name: '${char.name}'`)
  assert(hasChar, `Nhân vật ${char.name} (${char.id}) có mặt trong IdentityLockEngine.tsx`)
}

// Kiểm tra 3 đặc điểm nhận diện mỗi nhân vật
const charBlocks = identityContent.match(/\{\s*id:\s*'char-[a-z]+'[\s\S]*?lockedFeatures:\s*\[([\s\S]*?)\]/g) || []
assert(charBlocks.length === 4, `Tìm thấy 4 định nghĩa nhân vật có lockedFeatures trong IdentityLockEngine.tsx`)

charBlocks.forEach((block) => {
  const nameMatch = block.match(/name:\s*'([^']+)'/)
  const name = nameMatch ? nameMatch[1] : 'Unknown'
  const featuresMatch = block.match(/lockedFeatures:\s*\[([\s\S]*?)\]/)
  const featuresCount = featuresMatch ? (featuresMatch[1].match(/'[^']+'/g) || []).length : 0
  assert(featuresCount === 3, `Nhân vật ${name} có đúng 3 đặc điểm nhận diện lockedFeatures (Hiện có: ${featuresCount})`)
})

// 5. Kiểm tra món đồ mới: Con cá vàng, Con cún
console.log('\n--- 6. Kiểm tra món đồ mới (Con cá vàng, Con cún) ---')
// Kiểm tra trong creative-blocks-dataset.ts
const hasGoldfishDataset = creativeBlocksContent.includes('Con cá vàng') && creativeBlocksContent.includes('CON CÁ VÀNG')
const hasDogDataset = creativeBlocksContent.includes('Con cún') && creativeBlocksContent.includes('CON CÚN')
assert(hasGoldfishDataset, 'Món "Con cá vàng" đã tích hợp đầy đủ bộ từ vựng trong creative-blocks-dataset.ts')
assert(hasDogDataset, 'Món "Con cún" đã tích hợp đầy đủ bộ từ vựng trong creative-blocks-dataset.ts')

// Kiểm tra trong MagicKeysEngine.tsx
const hasGoldfishMagicKeys = magicKeysContent.includes('cá vàng') && magicKeysContent.includes('GOLDFISH_BLOCKS')
const hasDogMagicKeys = (magicKeysContent.includes('cún') || magicKeysContent.includes('chó')) && magicKeysContent.includes('DOG_BLOCKS')
assert(hasGoldfishMagicKeys, 'Món "Con cá vàng" đã tích hợp bộ khối và phân giải hình ảnh trong MagicKeysEngine.tsx')
assert(hasDogMagicKeys, 'Món "Con cún" đã tích hợp bộ khối và phân giải hình ảnh trong MagicKeysEngine.tsx')

console.log('\n' + '='.repeat(70))
if (hasFailure) {
  console.error('❌ TỔNG KẾT AUDIT: CÓ LỖI VI PHẠM TÍNH TOÀN VẸN DỮ LIỆU!')
  process.exit(1)
} else {
  console.log('🎉 TỔNG KẾT AUDIT: TOÀN BỘ DỮ LIỆU ĐỒNG BỘ 100% ĐẠT CHUẨN CHẤT LƯỢNG!')
  process.exit(0)
}
