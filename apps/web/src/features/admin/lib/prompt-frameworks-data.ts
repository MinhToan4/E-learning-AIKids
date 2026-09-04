/**
 * Trung Tâm Quản Trị Khung Prompt (Prompt Studio) - SSOT Data & Helpers
 * Quản trị toàn bộ 8 khung prompt chuẩn mực cho hệ sinh thái AI Kids:
 * 1. Sketch-to-Art (Phác thảo sang tranh vẽ)
 * 2. Character Mascot (Xưởng tạo nhân vật)
 * 3. 4-Panel Comic Script (Kịch bản truyện tranh 4 khung)
 * 4. Story Narrative (Sáng tác truyện chữ thiếu nhi)
 * 5. Scaffolded Chip Prompt (Ghép thẻ bài học Montessori)
 * 6. ASMO Math Visualizer (Trực quan hóa đề toán Olympic ASMO)
 * 7. Mee Tutor LLM (System prompt trợ giảng Mèo Mee)
 * 8. Video Motion (Video hoạt cảnh thiếu nhi)
 */

export type PromptFrameworkId =
  | 'sketch_to_art'
  | 'character_mascot'
  | 'comic_script'
  | 'story_narrative'
  | 'scaffolded_chips'
  | 'asmo_math_visual'
  | 'mee_tutor_llm'
  | 'video_motion'

export type PromptFrameworkCategory =
  | 'art'
  | 'story'
  | 'lesson'
  | 'asmo'
  | 'video'

export interface PromptFrameworkVariable {
  name: string // vd: 'styleDescriptor'
  label: string // vd: 'Mô tả phong cách'
  sampleValue: string // vd: 'handmade claymation, matte plasticine'
  description?: string
}

export interface PromptFrameworkItem {
  id: PromptFrameworkId
  title: string
  category: PromptFrameworkCategory
  appScope: string // vd: 'play.aikid.vn (Xưởng vẽ phác thảo)'
  description: string
  enabled: boolean
  prefix: string
  suffix: string
  variables: PromptFrameworkVariable[]
  qualityKeywords?: string
  safetyNote?: string
}

export const PROMPT_FRAMEWORK_CATEGORIES: Array<{
  id: 'all' | PromptFrameworkCategory
  label: string
  icon: string
  countHint: number
}> = [
  { id: 'all', label: 'Tất cả', icon: '✨', countHint: 8 },
  { id: 'art', label: 'Tranh vẽ & Mỹ thuật', icon: '🎨', countHint: 2 },
  { id: 'story', label: 'Truyện & Kịch bản', icon: '📖', countHint: 2 },
  { id: 'lesson', label: 'Ghép thẻ bài học', icon: '🧩', countHint: 1 },
  { id: 'asmo', label: 'ASMO & Trợ giảng', icon: '📐', countHint: 2 },
  { id: 'video', label: 'Video hoạt cảnh', icon: '🎬', countHint: 1 },
]

export const DEFAULT_PROMPT_FRAMEWORKS: PromptFrameworkItem[] = [
  {
    id: 'sketch_to_art',
    title: 'Phác Thảo Sang Tranh Vẽ (Sketch to Art)',
    category: 'art',
    appScope: 'play.aikid.vn (Xưởng vẽ Canvas)',
    description:
      'Chuyển đổi nét vẽ nguệch ngoạc của bé thành tranh minh họa hoàn chỉnh theo 14 phong cách nghệ thuật SSOT.',
    enabled: true,
    prefix:
      'Study the child-provided reference sketch and identify its main subjects, approximate composition, colors and story. Recreate that same idea as a polished {styleDescriptor}. Keep the subjects and composition recognizable while improving clarity, detail and finish like a skilled children’s-book illustrator. Sketch details: {childSketch}.',
    suffix:
      'Child-safe and wholesome for ages 6-15; friendly mood; no violence, frightening imagery, adult content, text, watermark or border.',
    variables: [
      {
        name: 'styleDescriptor',
        label: 'Mô tả phong cách',
        sampleValue:
          'handmade claymation, matte plasticine, subtle fingerprints and tool marks, warm diorama lighting and rounded forms',
        description: 'Đặc tả chi tiết phong cách nghệ thuật được chọn từ 14 phong cách chuẩn SSOT',
      },
      {
        name: 'childSketch',
        label: 'Ý tưởng phác thảo của bé',
        sampleValue: 'a happy flying cat with tiny wings above pastel clouds',
        description: 'Mô tả tóm tắt nét vẽ phác thảo hoặc ý tưởng từ canvas của học sinh',
      },
    ],
    qualityKeywords:
      'masterpiece, child illustration, soft warm lighting, 8k resolution, whimsical storybook style',
    safetyNote:
      'Quy chuẩn COPPA / An toàn trẻ em: Tự động chặn nội dung kinh dị, vũ khí và chữ/watermark.',
  },
  {
    id: 'character_mascot',
    title: 'Xưởng Tạo Nhân Vật & Linh Vật (Character Studio)',
    category: 'art',
    appScope: 'play.aikid.vn (Xưởng nhân vật)',
    description:
      'Thiết kế nhân vật hoạt hình và linh vật độc bản dựa trên bảng câu hỏi tương tác hình dáng, tính cách, trang phục.',
    enabled: true,
    prefix:
      'Create a full-body original character illustration for a child. Core concept: {idea}. Physical appearance & form: {shape}. Personality and mood: {vibe}. Color palette: {color}. Clothing and accessories: {costume}. Friendly expressive pose, centered composition, polished children’s animation concept art.',
    suffix:
      'Child-safe and wholesome for ages 6-15; simple pastel background, no violence, no frightening elements, no adult content, no watermark, no text.',
    variables: [
      {
        name: 'idea',
        label: 'Ý tưởng cốt lõi',
        sampleValue: 'Chú mèo máy du hành thời gian với đôi mắt to tròn lấp lánh',
        description: 'Ý tưởng gốc do bé tự nhập hoặc chọn gợi ý',
      },
      {
        name: 'shape',
        label: 'Hình dáng & Chất liệu',
        sampleValue: 'dáng người tròn trịa mũm mĩm, chất liệu đất sét mềm mịn cam pastel',
        description: 'Form dáng và bề mặt của nhân vật',
      },
      {
        name: 'vibe',
        label: 'Tính cách & Cảm xúc',
        sampleValue: 'tinh nghịch, vui vẻ, thân thiện, tràn đầy tò mò',
        description: 'Thần thái và biểu cảm trên gương mặt',
      },
      {
        name: 'color',
        label: 'Màu sắc chủ đạo',
        sampleValue: 'cam sữa ấm áp, phối xanh ngọc mint tươi sáng',
        description: 'Tông màu chính cho nhân vật',
      },
      {
        name: 'costume',
        label: 'Trang phục & Phụ kiện',
        sampleValue: 'áo hoodie khủng long nhỏ xíu, đeo ba lô phi hành gia',
        description: 'Quần áo hoặc món đồ bé muốn nhân vật mang theo',
      },
    ],
    qualityKeywords:
      '3D claymation finish, character turnaround, vibrant soft diffuse lighting, studio render',
    safetyNote:
      'Đảm bảo nhân vật luôn có nét mặt vui tươi, dáng điệu thân thiện, phù hợp làm bạn đồng hành cùng bé.',
  },
  {
    id: 'comic_script',
    title: 'Kịch Bản Truyện Tranh 4 Khung (4-Panel Comic)',
    category: 'story',
    appScope: 'play.aikid.vn (Xưởng truyện tranh)',
    description:
      'Soạn kịch bản truyện tranh 4 khung chuẩn sư phạm (Mở đầu, Phát triển, Cao trào, Kết thúc ấm áp) kèm lời thoại ngắn vui nhộn.',
    enabled: true,
    prefix:
      'Viết kịch bản truyện tranh thiếu nhi an toàn bằng tiếng Việt gồm đúng 4 khung hình tuần tự theo cấu trúc: Khung 1 (Khởi đầu) - Khung 2 (Phát triển) - Khung 3 (Bất ngờ / Cao trào) - Khung 4 (Kết thúc ấm áp & bài học nhỏ). Thể loại: {genre}. Ý tưởng: {idea}. Tuyến nhân vật: {characters}. Bối cảnh: {setting}.',
    suffix:
      'Mỗi khung ghi rõ: [Khung X] - Mô tả hình ảnh, hành động nhân vật, biểu cảm khuôn mặt và Lời thoại (hoặc bong bóng suy nghĩ) ngắn gọn dưới 15 từ. Giọng văn hóm hỉnh, ấm áp, giáo dục nhẹ nhàng, 100% phù hợp trẻ em lứa tuổi 6-12.',
    variables: [
      {
        name: 'genre',
        label: 'Thể loại truyện',
        sampleValue: 'Hài hước vui nhộn',
        description: 'Thể loại bé lựa chọn (Hài hước, Phiêu lưu, Trường học, v.v.)',
      },
      {
        name: 'idea',
        label: 'Ý tưởng câu chuyện',
        sampleValue: 'Mèo Miu học cách làm bánh kếp bất ngờ tặng sinh nhật Gấu Béo',
        description: 'Tình huống khởi nguồn cho câu chuyện',
      },
      {
        name: 'characters',
        label: 'Nhân vật chính',
        sampleValue: 'Mèo Miu đầu bếp tí hon và Gấu Béo hiền lành',
        description: 'Các nhân vật tham gia vào kịch bản 4 khung',
      },
      {
        name: 'setting',
        label: 'Bối cảnh diễn ra',
        sampleValue: 'Căn bếp ấm cúng ngập tràn bột mì và hũ mật ong',
        description: 'Địa điểm xảy ra câu chuyện',
      },
    ],
    qualityKeywords:
      '4-panel layout, expressive manga/comic style, clear visual storytelling, wholesome humor',
    safetyNote:
      'Không chứa hành vi nguy hiểm, bạo lực hay ngôn từ tiêu cực; luôn hướng tới tình bạn và sự sẻ chia.',
  },
  {
    id: 'story_narrative',
    title: 'Sáng Tác Truyện Chữ Thiếu Nhi (Story Narrative)',
    category: 'story',
    appScope: 'play.aikid.vn (Xưởng truyện chữ)',
    description:
      'Tạo truyện đọc thiếu nhi với ngôn ngữ giàu hình ảnh, nhịp điệu êm dịu, giúp bé phát triển trí tưởng tượng và vốn từ vựng.',
    enabled: true,
    prefix:
      'Viết một câu chuyện thiếu nhi giàu tính giáo dục và cảm xúc bằng tiếng Việt trong sáng. Thể loại: {genre}. Ý tưởng cốt lõi: {idea}. Tuyến nhân vật: {characters}. Không gian & bối cảnh: {setting}.',
    suffix:
      'Câu chuyện có mở đầu lôi cuốn, diễn biến giàu trí tưởng tượng, cao trào hồi hộp vừa phải và kết thúc viên mãn, mang thông điệp nhân văn về lòng dũng cảm, tình bạn và sự quan sát thế giới tự nhiên. Giọng kể truyền cảm, câu từ trau chuốt, độ dài khoảng 300-500 từ.',
    variables: [
      {
        name: 'genre',
        label: 'Thể loại truyện',
        sampleValue: 'Phiêu lưu kỳ thú',
        description: 'Thể loại truyện đọc (Phiêu lưu, Cổ tích, Khoa học viễn tưởng)',
      },
      {
        name: 'idea',
        label: 'Ý tưởng câu chuyện',
        sampleValue: 'Chuyến thám hiểm khu rừng đom đóm phát sáng để tìm chiếc chìa khóa cầu vồng',
        description: 'Ý tưởng chính của tác phẩm',
      },
      {
        name: 'characters',
        label: 'Nhân vật',
        sampleValue: 'Bé An dũng cảm và Thỏ Trắng bông xù',
        description: 'Tên và đặc điểm các bạn trong truyện',
      },
      {
        name: 'setting',
        label: 'Bối cảnh',
        sampleValue: 'Khu rừng đêm thần tiên với những cây nấm phát quang lung linh',
        description: 'Không gian mở ra thế giới thần tiên',
      },
    ],
    qualityKeywords:
      'rich descriptive vocabulary, melodic bedtime story tone, positive reinforcement, imaginative worldbuilding',
    safetyNote:
      'Nội dung tích cực, an toàn tâm lý cho bé, không gây ám ảnh hay lo âu trước giờ ngủ.',
  },
  {
    id: 'scaffolded_chips',
    title: 'Ghép Thẻ Tạo Ảnh Bài Học (Scaffolded Chip Prompt)',
    category: 'lesson',
    appScope: 'app.aikid.vn (Lesson Creative Canvas)',
    description:
      'Khung chuẩn ghép 5 thẻ Montessori của bài học (Nhân vật + Hành động + Bối cảnh + Cảm xúc + Phong cách) thành prompt minh họa chất lượng cao.',
    enabled: true,
    prefix:
      'A charming children’s book illustration depicting {character}, actively {action}, {environment}, evoking an atmosphere of {mood}. Rendered in the distinct artistic style of {style}.',
    suffix:
      'Composition must be clean and well-balanced, centered subject, gentle soft studio illumination, warm color harmony, highly engaging for early childhood learners. Child-safe, no text, no captions, no watermark.',
    variables: [
      {
        name: 'character',
        label: 'Thẻ Nhân vật',
        sampleValue: 'chú sóc nâu đuôi xù tinh nghịch',
        description: 'Thẻ lựa chọn đối tượng chính trong bài học',
      },
      {
        name: 'action',
        label: 'Thẻ Hành động',
        sampleValue: 'đang ôm hạt dẻ nhảy qua cành thông đón bình minh',
        description: 'Thẻ hành động của nhân vật',
      },
      {
        name: 'environment',
        label: 'Thẻ Bối cảnh',
        sampleValue: 'ở khu rừng mùa thu lá vàng rơi ngập tràn ánh nắng sớm',
        description: 'Thẻ không gian bối cảnh xung quanh',
      },
      {
        name: 'mood',
        label: 'Thẻ Cảm xúc',
        sampleValue: 'cảm giác hân hoan vui sướng và ấm áp',
        description: 'Thẻ sắc thái cảm xúc truyền tải',
      },
      {
        name: 'style',
        label: 'Thẻ Phong cách',
        sampleValue: 'phong cách màu nước loang mềm mại ấm cúng',
        description: 'Thẻ mỹ thuật chỉ định phong cách hiển thị',
      },
    ],
    qualityKeywords:
      'storybook masterpiece, crisp details, expressive character design, premium picture-book finish',
    safetyNote:
      'Đảm bảo hình ảnh đồng bộ trực tiếp với nội dung bài học đang học, không sinh yếu tố gây xao nhãng.',
  },
  {
    id: 'asmo_math_visual',
    title: 'Minh Họa Toán & Khoa Học ASMO (ASMO Visualizer)',
    category: 'asmo',
    appScope: 'asmo.aikid.vn (Đấu trường & LMS ASMO)',
    description:
      'Chuyển đề bài toán Olympic ASMO thành sơ đồ minh họa trực quan sinh động (cân đĩa thăng bằng, phân số bánh pizza, xếp que tính).',
    enabled: true,
    prefix:
      'Create a clear, pedagogical mathematical diagram and educational visual representation for an ASMO Math Olympiad problem. Grade level: {grade}. Mathematical concept: {problemConcept}. Visual objects and layout: {elements}. Topic context: {topic}.',
    suffix:
      'The visual must be mathematically accurate, instantly intuitive for elementary students, featuring high contrast, clean vector-like isometric 3D clay aesthetic, soft pastel colors, no misleading proportions, no extraneous clutter. Child-friendly, no handwritten mathematical formulas, no illegible text.',
    variables: [
      {
        name: 'topic',
        label: 'Chủ đề bài toán',
        sampleValue: 'Tư duy logic & Cân thăng bằng',
        description: 'Lĩnh vực kiến thức toán Olympic ASMO',
      },
      {
        name: 'grade',
        label: 'Khối lớp',
        sampleValue: 'Lớp 3 Olympic Toán Quốc tế ASMO',
        description: 'Lứa tuổi và cấp độ tư duy phù hợp',
      },
      {
        name: 'problemConcept',
        label: 'Khái niệm toán học',
        sampleValue:
          '1 quả dưa hấu nặng bằng 2 quả dứa cộng 3 quả táo; đĩa cân thứ hai đang ở trạng thái thăng bằng hoàn hảo',
        description: 'Mối quan hệ toán học cần được mô hình hóa',
      },
      {
        name: 'elements',
        label: 'Các phần tử trực quan',
        sampleValue:
          'cân đĩa thăng bằng cổ điển bằng đồng, quả dưa hấu xanh sọc, dứa vàng tươi, táo đỏ bóng',
        description: 'Vật thể cụ thể giúp bé dễ đếm và so sánh',
      },
    ],
    qualityKeywords:
      'isometric 3D infographic, high pedagogical clarity, balanced visual scale, educational textbook illustration',
    safetyNote:
      'Trực quan hóa chuẩn xác tỉ lệ toán học, tránh gây hiểu lầm trong quá trình giải đề thi ASMO.',
  },
  {
    id: 'mee_tutor_llm',
    title: 'Trợ Giảng Sư Phạm Mèo Mee (Mee Tutor System Prompt)',
    category: 'asmo',
    appScope: 'app.aikid.vn / asmo (Chatbot AI Gia sư Mèo Mee)',
    description:
      'System prompt LLM quy định nguyên tắc sư phạm Socrates 3 bước của Mèo Mee: gợi ý từng nấc, khen ngợi nỗ lực, không giải hộ bài.',
    enabled: true,
    prefix:
      'Bạn là Mèo Mee - trợ giảng AI thông thái, dễ thương và kiên nhẫn của hệ sinh thái AI Kids. Bạn đang đồng hành cùng {studentName} ({grade}) trong chủ đề: {topic}. Mức độ gợi ý hiện tại: {hintLevel}.',
    suffix:
      'Nguyên tắc sư phạm vàng: 1. Tuyệt đối KHÔNG đưa ra đáp án cuối cùng ngay lập tức. 2. Áp dụng phương pháp gợi mở Socrates qua 3 câu hỏi dẫn dắt từng bước. 3. Luôn động viên bằng giọng điệu ấm áp kèm emoji mèo (🐾, 🐱, ✨). 4. Khi bé trả lời đúng, hãy khen ngợi quá trình tư duy thay vì chỉ khen thông minh. 5. Luôn nói tiếng Việt chuẩn mực, ngắn gọn dưới 3 đoạn văn, an toàn thiếu nhi tuyệt đối.',
    variables: [
      {
        name: 'studentName',
        label: 'Tên học sinh',
        sampleValue: 'Bé Minh Triết',
        description: 'Tên của bạn nhỏ đang đối thoại cùng Mèo Mee',
      },
      {
        name: 'grade',
        label: 'Khối lớp',
        sampleValue: 'Lớp 4',
        description: 'Cấp độ học tập của bé',
      },
      {
        name: 'topic',
        label: 'Bài học đang tương tác',
        sampleValue: 'Dãy số có quy luật cách đều và bài toán tìm số hạng thứ n',
        description: 'Nội dung kiến thức đang cần trợ giúp',
      },
      {
        name: 'hintLevel',
        label: 'Cấp độ gợi ý',
        sampleValue: 'Mức 1: Đặt câu hỏi kích thích quan sát quy luật khoảng cách giữa 2 số liền kề',
        description: 'Nấc thang hỗ trợ sư phạm (Mức 1 -> Mức 2 -> Mức 3)',
      },
    ],
    qualityKeywords:
      'Socratic tutoring, growth mindset encouragement, pedagogical scaffolding, warm kid-centric persona',
    safetyNote:
      'Luôn bảo vệ dữ liệu cá nhân của học sinh, ngăn chặn mọi nỗ lực prompt injection hoặc nội dung không phù hợp lứa tuổi.',
  },
  {
    id: 'video_motion',
    title: 'Video Hoạt Cảnh Thiếu Nhi (Video Motion Prompt)',
    category: 'video',
    appScope: 'play.aikid.vn (Video Animation Engine)',
    description:
      'Khung mô tả chuyển động camera điện ảnh nhẹ nhàng, nhân vật cử động tự nhiên không biến dạng cho Veo & Video SDK.',
    enabled: true,
    prefix:
      'Cinematic animated short clip for children. Subject action: {characterAction}. Camera direction: {cameraMovement}. Smooth natural physics, continuous character silhouette consistency without morphing or distortion.',
    suffix:
      'Gentle 24fps motion, warm golden hour ambient lighting, whimsical storybook atmosphere, cozy pacing. Wholesome and calming for young viewers aged 6-12, no abrupt flashes, no rapid strobe lights, no violent actions.',
    variables: [
      {
        name: 'characterAction',
        label: 'Hành động nhân vật',
        sampleValue:
          'chú gấu trúc con đang từ từ nhấm nháp lá tre non và mỉm cười chớp mắt nhẹ nhàng',
        description: 'Cử động chính của nhân vật trong clip ngắn',
      },
      {
        name: 'cameraMovement',
        label: 'Chuyển động máy quay',
        sampleValue:
          'slow gentle dolly-in zoom, smooth cinematic pan from left to right at eye level',
        description: 'Góc lia máy và tốc độ chuyển cảnh máy quay',
      },
    ],
    qualityKeywords:
      'seamless animation loop, 4k ultra-smooth render, pixar-inspired soft textures, serene storybook motion',
    safetyNote:
      'Tránh hoàn toàn các chuyển động giật lắc, ánh sáng nhấp nháy tần số cao gây hại thị giác trẻ em.',
  },
]

export const STORAGE_KEY_PROMPT_FRAMEWORKS = 'aikids_prompt_frameworks_config_v1'

/**
 * Ghép chuỗi prompt hoàn chỉnh từ Framework Item và giá trị biến (sample hoặc overrides)
 */
export function renderPromptFramework(
  item: PromptFrameworkItem,
  sampleOverrides?: Record<string, string>,
): string {
  let prefixText = item.prefix.trim()
  let suffixText = item.suffix.trim()

  for (const variable of item.variables) {
    const rawVal = sampleOverrides?.[variable.name] ?? variable.sampleValue
    const val = rawVal.trim()
    const regex = new RegExp(`\\{${variable.name}\\}`, 'g')
    prefixText = prefixText.replace(regex, val)
    suffixText = suffixText.replace(regex, val)
  }

  const parts: string[] = []
  if (prefixText) parts.push(prefixText)
  if (suffixText) parts.push(suffixText)
  if (item.qualityKeywords?.trim()) parts.push(item.qualityKeywords.trim())

  return parts.join(' ')
}

/**
 * Tải danh sách khung prompt từ LocalStorage hoặc trả về mặc định
 */
export function loadPromptFrameworks(): PromptFrameworkItem[] {
  if (typeof window === 'undefined') return DEFAULT_PROMPT_FRAMEWORKS
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROMPT_FRAMEWORKS)
    if (!raw) return DEFAULT_PROMPT_FRAMEWORKS
    const parsed = JSON.parse(raw) as PromptFrameworkItem[]
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Merge với default để đảm bảo nếu có framework mới bổ sung vẫn đủ
      return DEFAULT_PROMPT_FRAMEWORKS.map((defItem) => {
        const saved = parsed.find((p) => p.id === defItem.id)
        return saved ? { ...defItem, ...saved } : defItem
      })
    }
  } catch {
    // ignore json error
  }
  return DEFAULT_PROMPT_FRAMEWORKS
}

/**
 * Lưu danh sách khung prompt vào LocalStorage
 */
export function savePromptFrameworks(items: PromptFrameworkItem[]): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY_PROMPT_FRAMEWORKS, JSON.stringify(items, null, 2))
  } catch {
    // ignore
  }
}
