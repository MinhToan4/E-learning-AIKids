import { useState, useMemo, useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { usePagination } from '@/shared/hooks/usePagination'
import { Paginator } from '@/shared/components/ui/Paginator'
import {
  FileText,
  Map,
  ShieldCheck,
  BarChart3,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Clock,
  Award,
  BookOpen,
  Edit3,
  Eye,
  ToggleLeft,
  ToggleRight,
  RotateCcw,
  Sparkles,
  HelpCircle,
  X,
  ChevronRight,
  User,
  GraduationCap,
  Layers,
  Wrench,
  TrendingUp,
  Check,
  Plus,
  Trash2,
  Download,
  Upload,
  Wand2,
  Lightbulb,
} from 'lucide-react'
import { Button } from '@/shared/components/ui/Button'
import { cn } from '@/shared/lib/cn'
import type {
  AsmoExam,
  AsmoGrade,
  AsmoSubject,
  AsmoQuestion,
  AsmoCurriculumWeek,
  AsmoTemplateKey,
} from '@/features/asmo/types'
import { ASMO_SAMPLE_EXAMS } from '@/features/asmo/data/asmo-sample-exams'
import { ASMO_CURRICULUM_WEEKS } from '@/features/asmo/data/asmo-curriculum'
import {
  auditAsmoExam,
  autoRepairExam,
  type AsmoExamAuditResult,
} from '@/features/asmo/lib/asmo-audit-engine'
import { AsmoFormula } from '@/features/asmo/components/AsmoFormula'
import { AsmoExamAuditModal } from '@/features/asmo/components/AsmoExamAuditModal'

export type AsmoStudioTab = 'exams' | 'curriculum' | 'audit' | 'analytics'

export type ExamWithStatus = AsmoExam & {
  isPublished: boolean
}

type StudentSubmission = {
  id: string
  studentName: string
  studentGrade: number
  examId: string
  examTitle: string
  subject: AsmoSubject
  score: number
  totalPoints: number
  scorePct: number
  isPassed: boolean
  durationMinutes: number
  submittedAt: string
}

type CommonMistakeQuestion = {
  questionId: string
  examCode: string
  topicName: string
  questionText: string
  wrongRatePct: number
  wrongAttemptsCount: number
  commonPitfall: string
}

const INITIAL_SUBMISSIONS: StudentSubmission[] = [
  {
    id: 'sub-01',
    studentName: 'Nguyễn An Nhiên',
    studentGrade: 1,
    examId: 'asmo-math-g1-2020-r1',
    examTitle: 'Đề Thi Olympic Toán ASMO Lớp 1 (School Level - 2020)',
    subject: 'math',
    score: 92,
    totalPoints: 100,
    scorePct: 92,
    isPassed: true,
    durationMinutes: 42,
    submittedAt: '12 phút trước',
  },
  {
    id: 'sub-02',
    studentName: 'Trần Minh Khang',
    studentGrade: 2,
    examId: 'asmo-math-g2-2020-r1',
    examTitle: 'Đề Thi Olympic Toán ASMO Lớp 2 (School Level - 2020)',
    subject: 'math',
    score: 84,
    totalPoints: 100,
    scorePct: 84,
    isPassed: true,
    durationMinutes: 48,
    submittedAt: '35 phút trước',
  },
  {
    id: 'sub-03',
    studentName: 'Lê Bảo Nam',
    studentGrade: 3,
    examId: 'asmo-math-g3-2021-r1',
    examTitle: 'Đề Thi Olympic Toán ASMO Lớp 3 (School Level - 2021)',
    subject: 'math',
    score: 52,
    totalPoints: 100,
    scorePct: 52,
    isPassed: false,
    durationMinutes: 58,
    submittedAt: '1 giờ trước',
  },
  {
    id: 'sub-04',
    studentName: 'Vũ Phương Linh',
    studentGrade: 5,
    examId: 'asmo-sci-l2-2022-r1',
    examTitle: 'Đề Thi Olympic Khoa Học ASMO Cấp Độ 2 (2022)',
    subject: 'science',
    score: 76,
    totalPoints: 100,
    scorePct: 76,
    isPassed: true,
    durationMinutes: 38,
    submittedAt: '2 giờ trước',
  },
  {
    id: 'sub-05',
    studentName: 'Hoàng Đức Anh',
    studentGrade: 4,
    examId: 'asmo-eng-l2-2022-r1',
    examTitle: 'Đề Thi Olympic Tiếng Anh ASMO Cấp Độ 2 (2022)',
    subject: 'english',
    score: 88,
    totalPoints: 100,
    scorePct: 88,
    isPassed: true,
    durationMinutes: 45,
    submittedAt: '3 giờ trước',
  },
  {
    id: 'sub-06',
    studentName: 'Đỗ Quỳnh Anh',
    studentGrade: 1,
    examId: 'asmo-math-g1-2020-r1',
    examTitle: 'Đề Thi Olympic Toán ASMO Lớp 1 (School Level - 2020)',
    subject: 'math',
    score: 48,
    totalPoints: 100,
    scorePct: 48,
    isPassed: false,
    durationMinutes: 60,
    submittedAt: '5 giờ trước',
  },
]

const INITIAL_COMMON_MISTAKES: CommonMistakeQuestion[] = [
  {
    questionId: 'asmo-math-g1-2020-r1-q03',
    examCode: 'ASMO-MATH-G01-2020-R1',
    topicName: 'Đọc Mặt Đồng Hồ & Tính Góc Kim',
    questionText: 'Tính góc tạo bởi kim giờ và kim phút lúc 3 giờ 30 phút.',
    wrongRatePct: 68,
    wrongAttemptsCount: 142,
    commonPitfall: 'Học sinh thường quên kim giờ đã di chuyển được 15 độ khi kim phút chỉ số 6, dẫn đến chọn nhầm 90° thay vì 75°.',
  },
  {
    questionId: 'asmo-math-g1-2020-r1-q05',
    examCode: 'ASMO-MATH-G01-2020-R1',
    topicName: 'Đếm Khối Lập Phương 3D Bị Che Khuất',
    questionText: 'Có tất cả bao nhiêu khối lập phương đơn vị trong mô hình 3 tầng?',
    wrongRatePct: 54,
    wrongAttemptsCount: 118,
    commonPitfall: 'Bỏ sót các khối lập phương ở tầng đáy bị che khuất hoàn toàn bởi các khối ở tầng 2 và tầng 3.',
  },
  {
    questionId: 'asmo-math-g2-2020-r1-q09',
    examCode: 'ASMO-MATH-G02-2020-R1',
    topicName: 'Bài Toán Que Diêm Tư Duy',
    questionText: 'Di chuyển đúng 1 que diêm để được phép tính đúng: 6 + 4 = 4.',
    wrongRatePct: 49,
    wrongAttemptsCount: 95,
    commonPitfall: 'Di chuyển 2 que thay vì 1 que, hoặc nhầm lẫn giữa số 0, 6, 8 và số 9 trong mã hóa que diêm LED.',
  },
  {
    questionId: 'asmo-math-g3-2021-r1-q12',
    examCode: 'ASMO-MATH-G03-2021-R1',
    topicName: 'Phân Số Diện Tích Hình Tô Màu',
    questionText: 'Tính tỉ số diện tích phần tô đậm so với toàn bộ hình vuông cạnh $a$.',
    wrongRatePct: 43,
    wrongAttemptsCount: 81,
    commonPitfall: 'Cộng dồn diện tích các hình tam giác phụ nhưng không trừ diện tích phần giao nhau ở tâm.',
  },
]

const TEMPLATE_3D_LABELS: Record<string, { label: string; icon: string; desc: string }> = {
  '3D_CUBE_CLUSTER': {
    label: 'Cụm Lập Phương Không Gian',
    icon: '🧊',
    desc: 'Xoay tự do 360°, bóc tách từng tầng để đếm khối ẩn',
  },
  'GRID_PATH_MAZE': {
    label: 'Mê Cung Lưới Toạ Độ',
    icon: '🧭',
    desc: 'Mô phỏng 10 lộ trình ngắn nhất với thuật toán cộng dồn',
  },
  'INTERACTIVE_CLOCK': {
    label: 'Đồng Hồ Kim Tương Tác',
    icon: '⏰',
    desc: 'Kéo kim giờ/phút theo thời gian thực và đo góc KaTeX',
  },
  '3D_BALANCE_SCALE': {
    label: 'Cân Đĩa Thăng Bằng 3D',
    icon: '⚖️',
    desc: 'Thêm bớt quả cân trực quan để giải phương trình ẩn số',
  },
  'MATCHSTICK_FIGURE': {
    label: 'Mô Hình Que Diêm',
    icon: '🥢',
    desc: 'Kéo thả đổi vị trí que diêm để kiểm tra tính đúng sai',
  },
  'SHADED_AREA_FRACTION': {
    label: 'Phân Số & Diện Tích Tô Màu',
    icon: '📐',
    desc: 'Tô màu các phần bánh/hình tròn để hình thành phân số',
  },
  'NET_CUBE_FOLDING': {
    label: 'Trải Khối & Gấp Hình Lập Phương',
    icon: '📦',
    desc: 'Animation gấp phẳng 6 mặt thành khối lập phương 3D',
  },
}

export type AsmoCurriculumWeekItem = AsmoCurriculumWeek & {
  meeTip?: {
    quote: string
    storyAdvice: string
  }
  solutionSteps?: string[]
  commonPitfall?: string
}

export function generatePedagogicalTipsAndSolution(week: {
  topic: string
  title: string
  keyCompetencies: string[]
  grade: number
  subject: string
}) {
  const titleLower = week.title.toLowerCase()

  let quote = ''
  let storyAdvice = ''
  let formulaLatex = '$x = \\frac{a + b}{2}$'
  let pitfall = ''

  if (week.subject === 'math') {
    if (
      titleLower.includes('khối') ||
      titleLower.includes('lập phương') ||
      titleLower.includes('hình học') ||
      titleLower.includes('diện tích') ||
      titleLower.includes('chu vi')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!'
      storyAdvice = `Chiến thuật Mèo Mee: Với dạng toán hình không gian và chu vi diện tích lớp ${week.grade}, hãy phân rã hình phức tạp thành các khối đơn vị cơ bản. Đánh số từng tầng từ dưới lên để không đếm trùng!`
      formulaLatex = week.grade <= 5 ? '$S = a \\times b$' : '$V = a \\times b \\times c$'
      pitfall = 'Bỏ sót các khối hộp hoặc mặt phẳng bị che khuất ở tầng đáy và mặt sau.'
    } else if (
      titleLower.includes('đồng hồ') ||
      titleLower.includes('thời gian') ||
      titleLower.includes('góc')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Kim giờ kim phút cùng nhau xoay tròn; mỗi phút trôi qua góc lệch càng thêm ngon!'
      storyAdvice = 'Chiến thuật Mèo Mee: Trong 1 giờ (60 phút), kim phút quay $360^\\circ$ (mỗi phút $6^\\circ$), kim giờ quay $30^\\circ$ (mỗi phút $0.5^\\circ$). Đừng quên tính độ lệch kim giờ khi kim phút di chuyển!'
      formulaLatex = '$\\Delta \\theta = |30H - 5.5M|^\\circ$'
      pitfall = 'Quên cộng góc dịch chuyển của kim giờ khi kim phút đã chạy qua số 12.'
    } else if (
      titleLower.includes('phân số') ||
      titleLower.includes('tỉ số') ||
      titleLower.includes('phần trăm')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Quy đồng mẫu số nhớ kĩ không quên; tử mẫu đồng lòng, tính toán vững bền!'
      storyAdvice = 'Chiến thuật Mèo Mee: Luôn rút gọn phân số về tối giản trước khi nhân chia. Khi so sánh hai phân số, thử dùng phần bù hoặc nhân chéo thay vì quy đồng mẫu số lớn.'
      formulaLatex = '$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$'
      pitfall = 'Cộng trực tiếp cả tử với tử và mẫu với mẫu khi chưa quy đồng.'
    } else if (
      titleLower.includes('que diêm') ||
      titleLower.includes('quy luật') ||
      titleLower.includes('dãy số') ||
      titleLower.includes('logic')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Đổi chỗ que diêm, tìm ra quy luật; tư duy sáng tạo, lời giải bật ra ngay!'
      storyAdvice = 'Chiến thuật Mèo Mee: Với dãy số quy luật, tính hiệu giữa hai số liên tiếp $\\Delta = u_{n+1} - u_n$. Nếu hiệu không đổi là cấp số cộng, nếu hiệu tăng đều là dãy số cấp 2!'
      formulaLatex = '$u_n = u_1 + (n - 1)d$'
      pitfall = 'Vội vã kết luận quy luật chỉ qua 2 phần tử đầu tiên mà không thử lại với phần tử thứ 3 và 4.'
    } else {
      quote = '🐱 Mèo Mee mách bạn: Đọc kỹ đề bài, gạch chân dữ kiện; bình tĩnh tính toán, vươn tầm chuyên gia Olympic!'
      storyAdvice = `Chiến thuật Mèo Mee: Đề thi ASMO dạng "${week.title}" đòi hỏi phân loại giả thiết. Hãy lập bảng tóm tắt đại lượng đã biết và đại lượng cần tìm trước khi bắt tay làm bài.`
      formulaLatex = '$A = \\sum_{i=1}^{n} x_i$'
      pitfall = 'Nhầm lẫn giữa các đơn vị tính và không kiểm tra lại tính hợp lý của kết quả số học.'
    }
  } else if (week.subject === 'science') {
    quote = '🐱 Mèo Mee mách bạn: Quan sát thiên nhiên, đặt câu hỏi đúng; thực nghiệm chứng minh, kiến thức nở hoa!'
    storyAdvice = `Chiến thuật Mèo Mee: Trong chuyên đề Khoa học "${week.title}", hãy liên hệ hiện tượng thực tế với các định luật vật lý/sinh học cốt lõi. Chú ý các điều kiện thí nghiệm chuẩn.`
    formulaLatex = '$F = m \\times a$'
    pitfall = 'Nhầm lẫn giữa nguyên nhân và kết quả khi phân tích biểu đồ thí nghiệm sinh thái.'
  } else {
    quote = '🐱 Mèo Mee mách bạn: Bắt từ then chốt, đoán nghĩa theo câu; tự tin phản xạ, tiếng Anh cực siêu!'
    storyAdvice = `Chiến thuật Mèo Mee: Trong phần thi Tiếng Anh "${week.title}", hãy đọc lướt câu hỏi trước để xác định từ khóa (Keywords), sau đó quét nhanh bài đọc (Scanning) để tìm vị trí chứa đáp án.`
    formulaLatex = '$\\text{Subject} + \\text{Verb} + \\text{Object}$'
    pitfall = 'Dịch từng từ theo nghĩa đen (word-by-word) thay vì hiểu theo cụm thành ngữ hoặc ngữ cảnh tổng thể.'
  }

  const solutionSteps = [
    `Bước 1 (Phân tích giả thiết): Đọc kỹ yêu cầu bài toán "${week.title}". Xác định các đại lượng đã cho trong chủ đề ${week.topic} và phân tích điều kiện ràng buộc cốt lõi.`,
    `Bước 2 (Mô hình hóa & Công thức KaTeX): Thiết lập mô hình giải toán và áp dụng công thức tương thích: ${formulaLatex}. Rút gọn các biểu thức phụ để đơn giản hóa quá trình tính toán.`,
    `Bước 3 (Tính toán chi tiết & Kết luận): Thực hiện các phép tính số học cụ thể theo các năng lực trọng tâm: ${week.keyCompetencies.join(', ')}. Thử lại đáp án vào đề bài để đảm bảo độ chính xác 100%.`,
  ]

  return {
    quote,
    storyAdvice,
    solutionSteps,
    commonPitfall: pitfall,
  }
}

export function validateCurriculumJson(jsonText: string): {
  isValid: boolean
  error?: string
  data?: AsmoCurriculumWeekItem[]
} {
  try {
    const parsed = JSON.parse(jsonText)
    if (!Array.isArray(parsed)) {
      return {
        isValid: false,
        error: 'Định dạng dữ liệu không hợp lệ: JSON phải là một mảng danh sách các tuần học (Array).',
      }
    }

    if (parsed.length === 0) {
      return {
        isValid: false,
        error: 'Mảng dữ liệu JSON không được để trống.',
      }
    }

    const validatedList: AsmoCurriculumWeekItem[] = []

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i]
      const rowIdx = i + 1

      if (typeof item !== 'object' || item === null) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} không phải là một đối tượng (object) hợp lệ.`,
        }
      }

      if (typeof item.week !== 'number') {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} thiếu hoặc sai kiểu trường 'week' (bắt buộc là số nguyên, ví dụ: 1, 2, 3).`,
        }
      }

      if (!['math', 'science', 'english'].includes(item.subject)) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} trường 'subject' không hợp lệ. Phải là một trong: 'math', 'science', 'english'.`,
        }
      }

      if (typeof item.grade !== 'number' || item.grade < 1 || item.grade > 12) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} trường 'grade' không hợp lệ. Phải là số nguyên từ 1 đến 12.`,
        }
      }

      if (typeof item.title !== 'string' || item.title.trim().length === 0) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} thiếu trường 'title' (tiêu đề tuần học không được để trống).`,
        }
      }

      const keyCompetencies = Array.isArray(item.keyCompetencies)
        ? item.keyCompetencies.filter((c: unknown) => typeof c === 'string')
        : ['Tư duy logic']

      validatedList.push({
        week: item.week,
        subject: item.subject,
        grade: item.grade,
        topic: item.topic || `ASMO-${item.subject.toUpperCase()}-G${item.grade}-W${item.week}`,
        title: item.title,
        summary: item.summary || `Chuyên đề tuần ${item.week}: ${item.title}`,
        keyCompetencies: keyCompetencies.length > 0 ? keyCompetencies : ['Tư duy logic'],
        visualTemplate: item.visualTemplate,
        sampleQuestionIds: Array.isArray(item.sampleQuestionIds) ? item.sampleQuestionIds : [],
        meeTip: item.meeTip && typeof item.meeTip === 'object' ? item.meeTip : undefined,
        solutionSteps: Array.isArray(item.solutionSteps) ? item.solutionSteps : undefined,
        commonPitfall: typeof item.commonPitfall === 'string' ? item.commonPitfall : undefined,
      })
    }

    return {
      isValid: true,
      data: validatedList,
    }
  } catch (err: unknown) {
    return {
      isValid: false,
      error: `Lỗi cú pháp JSON: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}

interface CurriculumWeekEditModalProps {
  isOpen: boolean
  onClose: () => void
  initialData: AsmoCurriculumWeekItem
  isNew?: boolean
  onSave: (week: AsmoCurriculumWeekItem) => void
}

function CurriculumWeekEditModal({
  isOpen,
  onClose,
  initialData,
  isNew = false,
  onSave,
}: CurriculumWeekEditModalProps) {
  const [title, setTitle] = useState(initialData.title)
  const [week, setWeek] = useState(initialData.week)
  const [subject, setSubject] = useState<AsmoSubject>(initialData.subject)
  const [grade, setGrade] = useState<AsmoGrade>(initialData.grade)
  const [topic, setTopic] = useState(initialData.topic)
  const [summary, setSummary] = useState(initialData.summary)
  const [keyCompetencies, setKeyCompetencies] = useState<string[]>(initialData.keyCompetencies || [])
  const [newTagInput, setNewTagInput] = useState('')
  const [visualTemplate, setVisualTemplate] = useState<AsmoTemplateKey | ''>(
    initialData.visualTemplate || '',
  )
  const [quote, setQuote] = useState(initialData.meeTip?.quote || '')
  const [storyAdvice, setStoryAdvice] = useState(initialData.meeTip?.storyAdvice || '')

  if (!isOpen || typeof document === 'undefined') return null

  const handleAddTag = () => {
    const trimmed = newTagInput.trim()
    if (trimmed && !keyCompetencies.includes(trimmed)) {
      setKeyCompetencies([...keyCompetencies, trimmed])
      setNewTagInput('')
    }
  }

  const handleRemoveTag = (indexToRemove: number) => {
    setKeyCompetencies(keyCompetencies.filter((_, idx) => idx !== indexToRemove))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...initialData,
      title,
      week,
      subject,
      grade,
      topic,
      summary,
      keyCompetencies,
      visualTemplate: visualTemplate ? (visualTemplate as AsmoTemplateKey) : undefined,
      meeTip: quote || storyAdvice ? { quote, storyAdvice } : undefined,
    })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">{isNew ? '➕' : '✏️'}</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                {isNew ? 'Thêm Tuần Học Mới' : 'Chỉnh Sửa Tuần Học'}
              </h3>
              <p className="text-xs text-muted font-bold">
                {isNew ? 'Khởi tạo cấu trúc tuần học chuẩn ASMO' : `Tuần ${week}: ${title || 'Chưa đặt tên'}`}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-black text-muted uppercase">Tiêu đề tuần học</label>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Ví dụ: Đếm Khối Lập Phương 3D & Không Gian Đa Chiều"
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Tuần số (Week)</label>
              <input
                type="number"
                min={1}
                max={100}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                required
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-black text-muted uppercase">Môn học</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value as AsmoSubject)}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
              >
                <option value="math">📐 Toán Olympic</option>
                <option value="science">🔬 Khoa Học Tự Nhiên</option>
                <option value="english">🔤 Tiếng Anh Học Thuật</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Khối lớp</label>
              <select
                value={grade}
                onChange={(e) => setGrade(Number(e.target.value) as AsmoGrade)}
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
              >
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-black text-muted uppercase">Mã chuyên đề (Topic)</label>
              <input
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                required
                placeholder="ASMO-MATH-G1-W01"
                className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black text-muted uppercase">Tóm tắt nội dung sư phạm</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Tóm tắt trọng tâm bài học và mục tiêu hình thành tư duy..."
              className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Key Competencies Chip Manager */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Năng lực trọng tâm (Key Competencies)
            </label>
            <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border-2 border-border/80 bg-white p-2.5 min-h-[44px]">
              {keyCompetencies.map((tag, idx) => (
                <span
                  key={`${tag}-${idx}`}
                  className="inline-flex items-center gap-1 rounded-xl border border-brand-200 bg-brand-50 px-2 py-1 text-xs font-bold text-brand-800 shadow-xs"
                >
                  <span>{tag}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(idx)}
                    className="text-brand-500 hover:text-red-500 ml-0.5 cursor-pointer font-black"
                    title={`Xóa "${tag}"`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  placeholder="Thêm năng lực..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="rounded-xl border border-border/80 px-2 py-1 text-xs font-medium text-text focus:border-brand-400 focus:outline-none"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  className="rounded-xl text-xs py-1 px-2.5 font-bold"
                >
                  + Thêm
                </Button>
              </div>
            </div>
          </div>

          {/* Visual Template Dropdown */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Mẫu 3D Lab tương tác (Visual Template)
            </label>
            <select
              value={visualTemplate}
              onChange={(e) => setVisualTemplate(e.target.value as AsmoTemplateKey | '')}
              className="w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none cursor-pointer"
            >
              <option value="">Không sử dụng mô hình 3D (Lý thuyết cơ bản)</option>
              {Object.entries(TEMPLATE_3D_LABELS).map(([k, meta]) => (
                <option key={k} value={k}>
                  {meta.icon} {meta.label} — {meta.desc}
                </option>
              ))}
            </select>
          </div>

          {/* Mèo Mee Tips Section */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/50 p-3.5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <span className="text-xs font-black text-amber-900 uppercase">
                Bí Kíp & Lời Khuyên Mèo Mee
              </span>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800">
                Câu khẩu hiệu Mèo Mee (Quote)
              </label>
              <input
                value={quote}
                onChange={(e) => setQuote(e.target.value)}
                placeholder="Ví dụ: Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!"
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-amber-800">
                Lời khuyên tư duy & Mẹo nhận diện bẫy (Story Advice)
              </label>
              <textarea
                rows={2}
                value={storyAdvice}
                onChange={(e) => setStoryAdvice(e.target.value)}
                placeholder="Ví dụ: Đánh số thứ tự các khối theo từng tầng từ dưới lên để không bỏ sót..."
                className="mt-1 w-full rounded-xl border border-amber-300 bg-white px-3 py-1.5 text-xs font-medium text-text focus:border-brand-400 focus:outline-none leading-relaxed"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-clay"
            >
              {isNew ? 'Tạo tuần học' : 'Lưu tuần học'}
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  )
}

interface CurriculumImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImport: (items: AsmoCurriculumWeekItem[], mode: 'replace' | 'append') => void
  onDownloadTemplate: () => void
}

function CurriculumImportModal({
  isOpen,
  onClose,
  onImport,
  onDownloadTemplate,
}: CurriculumImportModalProps) {
  const [jsonText, setJsonText] = useState('')
  const [importMode, setImportMode] = useState<'replace' | 'append'>('replace')
  const [validationError, setValidationError] = useState<string | null>(null)
  const [validData, setValidData] = useState<AsmoCurriculumWeekItem[] | null>(null)

  if (!isOpen || typeof document === 'undefined') return null

  const handleJsonChange = (text: string) => {
    setJsonText(text)
    if (!text.trim()) {
      setValidationError(null)
      setValidData(null)
      return
    }
    const res = validateCurriculumJson(text)
    if (res.isValid && res.data) {
      setValidationError(null)
      setValidData(res.data)
    } else {
      setValidationError(res.error || 'Dữ liệu JSON không hợp lệ')
      setValidData(null)
    }
  }

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        handleJsonChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const content = event.target?.result as string
        handleJsonChange(content)
      }
      reader.readAsText(file)
    }
  }

  const handleConfirm = () => {
    if (!validData || validData.length === 0) {
      const res = validateCurriculumJson(jsonText)
      if (!res.isValid || !res.data) {
        setValidationError(res.error || 'Vui lòng kiểm tra lại cấu trúc JSON!')
        return
      }
      onImport(res.data, importMode)
    } else {
      onImport(validData, importMode)
    }
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">📥</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                Nhập Lộ Trình Học ASMO (Import JSON)
              </h3>
              <p className="text-xs text-muted font-bold">
                Nạp danh sách các tuần chuyên đề tự động từ file JSON
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Drag & Drop Zone */}
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleFileDrop}
            className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-sky-300 bg-sky-50/50 p-5 text-center transition-all hover:bg-sky-50"
          >
            <Upload className="size-8 text-sky-500 mb-2" />
            <p className="text-xs font-black text-sky-900">
              Kéo thả file <code className="rounded bg-sky-200/80 px-1 py-0.5">.json</code> vào đây
            </p>
            <p className="text-[11px] text-muted font-medium mt-1">hoặc</p>
            <label className="mt-2 inline-flex items-center gap-1.5 rounded-xl border border-sky-300 bg-white px-3 py-1 text-xs font-black text-sky-700 shadow-xs cursor-pointer hover:bg-sky-50">
              <span>Chọn file từ máy</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </label>
          </div>

          {/* Paste JSON Area */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-black text-muted uppercase">
                Hoặc dán chuỗi JSON trực tiếp
              </label>
              <button
                type="button"
                onClick={onDownloadTemplate}
                className="text-xs font-bold text-brand-600 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Download className="size-3" />
                <span>Tải mẫu JSON chuẩn</span>
              </button>
            </div>
            <textarea
              rows={6}
              value={jsonText}
              onChange={(e) => handleJsonChange(e.target.value)}
              placeholder="[&#10;  {&#10;    &quot;week&quot;: 1,&#10;    &quot;subject&quot;: &quot;math&quot;,&#10;    &quot;grade&quot;: 1,&#10;    &quot;title&quot;: &quot;Đếm Khối Lập Phương 3D&quot;&#10;  }&#10;]"
              className="w-full font-mono rounded-2xl border-2 border-border/80 bg-white p-3 text-xs font-medium text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Schema Validator Status */}
          {validationError && (
            <div className="flex items-start gap-2.5 rounded-2xl border-2 border-red-200 bg-red-50 p-3 text-xs font-bold text-red-700 animate-in fade-in">
              <AlertCircle className="size-4 shrink-0 mt-0.5 text-red-600" />
              <span>{validationError}</span>
            </div>
          )}

          {validData && (
            <div className="flex items-center gap-2 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-3 text-xs font-black text-emerald-800 animate-in fade-in">
              <CheckCircle2 className="size-4 shrink-0 text-emerald-600" />
              <span>Dữ liệu hợp lệ! Đã phát hiện {validData.length} tuần học sẵn sàng nạp.</span>
            </div>
          )}

          {/* Mode Selector */}
          <div className="rounded-2xl border-2 border-border/80 bg-slate-50 p-3">
            <span className="block text-xs font-black text-muted uppercase mb-2">
              Chế độ nạp dữ liệu:
            </span>
            <div className="flex flex-col sm:flex-row gap-3">
              <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-brand-500"
                />
                <span>Ghi đè toàn bộ lộ trình</span>
              </label>
              <label className="flex items-center gap-2 text-xs font-bold text-text cursor-pointer">
                <input
                  type="radio"
                  name="importMode"
                  value="append"
                  checked={importMode === 'append'}
                  onChange={() => setImportMode('append')}
                  className="accent-brand-500"
                />
                <span>Gộp thêm vào lộ trình hiện có</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirm}
              disabled={Boolean(validationError) || !jsonText.trim()}
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-black text-xs shadow-clay cursor-pointer"
            >
              Xác nhận Nhập Lộ Trình
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

interface CurriculumGeneratorPreviewModalProps {
  isOpen: boolean
  onClose: () => void
  week: AsmoCurriculumWeekItem
  initialGenerated: {
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  }
  onApply: (data: {
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  }) => void
}

function CurriculumGeneratorPreviewModal({
  isOpen,
  onClose,
  week,
  initialGenerated,
  onApply,
}: CurriculumGeneratorPreviewModalProps) {
  const [quote, setQuote] = useState(initialGenerated.quote)
  const [storyAdvice, setStoryAdvice] = useState(initialGenerated.storyAdvice)
  const [solutionSteps, setSolutionSteps] = useState<string[]>(initialGenerated.solutionSteps)
  const [commonPitfall, setCommonPitfall] = useState(initialGenerated.commonPitfall)

  if (!isOpen || typeof document === 'undefined') return null

  const handleStepChange = (index: number, val: string) => {
    const next = [...solutionSteps]
    next[index] = val
    setSolutionSteps(next)
  }

  const handleConfirmApply = () => {
    onApply({
      quote,
      storyAdvice,
      solutionSteps,
      commonPitfall,
    })
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
    >
      <div className="w-full max-w-2xl rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <span className="text-2xl">🪄</span>
            <div>
              <h3 className="font-display text-lg font-black text-text">
                Xem Trước & Tinh Chỉnh Bí Kíp Sư Phạm (Smart Generator)
              </h3>
              <p className="text-xs text-muted font-bold">
                Tuần {week.week}: {week.title} · Lớp {week.grade} ·{' '}
                {week.subject === 'math' ? 'Toán' : week.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-4">
          {/* Quote Section */}
          <div className="rounded-2xl border-2 border-amber-200 bg-amber-50/60 p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xl">🐱</span>
              <label className="text-xs font-black text-amber-900 uppercase">
                Câu khẩu hiệu truyền cảm hứng Mèo Mee
              </label>
            </div>
            <input
              value={quote}
              onChange={(e) => setQuote(e.target.value)}
              className="w-full rounded-xl border border-amber-300 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
            />
          </div>

          {/* Story Advice Section */}
          <div>
            <label className="block text-xs font-black text-muted uppercase mb-1">
              Lời khuyên tư duy & Chiến thuật giải nhanh
            </label>
            <textarea
              rows={2}
              value={storyAdvice}
              onChange={(e) => setStoryAdvice(e.target.value)}
              className="w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* 3 Solution Steps with KaTeX Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black text-indigo-900 uppercase tracking-wider">
                Hướng dẫn giải 3 bước chuẩn ASMO (Hỗ trợ KaTeX)
              </label>
              <span className="rounded-lg bg-indigo-100 text-indigo-800 px-2 py-0.5 text-[10px] font-black">
                KaTeX Live Preview
              </span>
            </div>

            {solutionSteps.map((step, idx) => (
              <div
                key={idx}
                className="rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-3 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-800">
                    Bước {idx + 1}
                  </span>
                </div>
                <textarea
                  rows={2}
                  value={step}
                  onChange={(e) => handleStepChange(idx, e.target.value)}
                  className="w-full rounded-xl border border-indigo-200 bg-white px-3 py-1.5 text-xs font-medium text-text focus:border-brand-400 focus:outline-none"
                />
                <div className="rounded-xl border border-indigo-200/80 bg-white/90 p-2.5 text-xs">
                  <span className="text-[10px] font-bold text-indigo-500 uppercase block mb-0.5">
                    Hiển thị công thức:
                  </span>
                  <AsmoFormula text={step} />
                </div>
              </div>
            ))}
          </div>

          {/* Common Pitfall */}
          <div>
            <label className="block text-xs font-black text-amber-900 uppercase mb-1">
              Bẫy tư duy học sinh thường gặp
            </label>
            <textarea
              rows={2}
              value={commonPitfall}
              onChange={(e) => setCommonPitfall(e.target.value)}
              className="w-full rounded-2xl border-2 border-amber-200 bg-amber-50/40 px-3 py-2 text-xs font-bold text-amber-900 focus:border-brand-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-2 border-t-2 border-border/80 pt-4">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="rounded-2xl font-black text-xs"
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleConfirmApply}
              className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs shadow-clay flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="size-4" />
              <span>Áp dụng vào tuần học</span>
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  )
}

export function AsmoAdminStudio() {
  const [activeTab, setActiveTab] = useState<AsmoStudioTab>('exams')

  // Data state
  const [exams, setExams] = useState<ExamWithStatus[]>(() => {
    return ASMO_SAMPLE_EXAMS.map((exam, index) => ({
      ...exam,
      // Mặc định công bố đa số đề, giữ một số làm bản nháp để minh họa
      isPublished: index % 5 !== 3,
    }))
  })

  // Filters for Exams
  const [filterSubject, setFilterSubject] = useState<'all' | AsmoSubject>('all')
  const [filterGrade, setFilterGrade] = useState<'all' | number>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft'>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Filters for Curriculum
  const [curriculumSubject, setCurriculumSubject] = useState<'all' | AsmoSubject>('all')
  const [curriculumGrade, setCurriculumGrade] = useState<'all' | number>('all')

  // Curriculum Data State
  const [curriculumWeeks, setCurriculumWeeks] = useState<AsmoCurriculumWeekItem[]>(() =>
    ASMO_CURRICULUM_WEEKS.map((w) => ({
      ...w,
      keyCompetencies: [...w.keyCompetencies],
      sampleQuestionIds: [...w.sampleQuestionIds],
    })),
  )
  const [editingWeek, setEditingWeek] = useState<AsmoCurriculumWeekItem | null>(null)
  const [isCreatingWeek, setIsCreatingWeek] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [previewGenWeek, setPreviewGenWeek] = useState<{
    week: AsmoCurriculumWeekItem
    quote: string
    storyAdvice: string
    solutionSteps: string[]
    commonPitfall: string
  } | null>(null)

  // Modals & Drawers state
  const [editingExam, setEditingExam] = useState<ExamWithStatus | null>(null)
  const [viewingQuestionsExam, setViewingQuestionsExam] = useState<ExamWithStatus | null>(null)
  const [auditingExamModal, setAuditingExamModal] = useState<AsmoExam | null>(null)

  // Audit state
  const [isAuditingAll, setIsAuditingAll] = useState(false)
  const [auditTimestamp, setAuditTimestamp] = useState<string>(() => new Date().toLocaleTimeString('vi-VN'))
  const [toastNotification, setToastNotification] = useState<string | null>(null)

  // Repair state
  const [repairingExamId, setRepairingExamId] = useState<string | null>(null)
  const [repairedExamIds, setRepairedExamIds] = useState<Set<string>>(new Set())
  const [isRepairingAll, setIsRepairingAll] = useState(false)

  // Lock background scroll when any modal is open
  useEffect(() => {
    const isAnyModalOpen = Boolean(
      editingExam ||
        viewingQuestionsExam ||
        auditingExamModal ||
        editingWeek ||
        isCreatingWeek ||
        isImportModalOpen ||
        previewGenWeek,
    )
    if (isAnyModalOpen) {
      const prevOverflow = document.body.style.overflow
      const didChange = prevOverflow !== 'hidden'
      if (didChange) {
        document.body.style.overflow = 'hidden'
      }
      return () => {
        if (didChange) {
          document.body.style.overflow = prevOverflow
        }
      }
    }
  }, [
    editingExam,
    viewingQuestionsExam,
    auditingExamModal,
    editingWeek,
    isCreatingWeek,
    isImportModalOpen,
    previewGenWeek,
  ])

  // Trigger temporary toast
  const showToast = useCallback((msg: string) => {
    setToastNotification(msg)
    const timer = setTimeout(() => {
      setToastNotification(null)
    }, 3500)
    return () => clearTimeout(timer)
  }, [])

  // Toggle publish state
  const handleTogglePublish = useCallback((examId: string) => {
    setExams((prev) =>
      prev.map((e) => {
        if (e.id === examId) {
          const nextState = !e.isPublished
          showToast(`Đã ${nextState ? 'kích hoạt mở phòng thi' : 'chuyển về bản nháp'}: ${e.title}`)
          return { ...e, isPublished: nextState }
        }
        return e
      }),
    )
  }, [showToast])

  // Save Regulation Edit
  const handleSaveRegulation = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editingExam) return

    const formData = new FormData(e.currentTarget)
    const title = String(formData.get('title') || editingExam.title)
    const round = String(formData.get('round') || editingExam.round)
    const year = Number(formData.get('year') || editingExam.year)
    const durationMinutes = Number(formData.get('durationMinutes') || editingExam.durationMinutes)
    const passScore = Number(formData.get('passScore') || editingExam.passScore)
    const totalPoints = Number(formData.get('totalPoints') || editingExam.totalPoints)
    const description = String(formData.get('description') || editingExam.description)

    setExams((prev) =>
      prev.map((item) =>
        item.id === editingExam.id
          ? {
              ...item,
              title,
              round,
              year,
              durationMinutes,
              passScore,
              totalPoints,
              description,
            }
          : item,
      ),
    )

    showToast(`Đã lưu quy chế đề thi "${title}" thành công!`)
    setEditingExam(null)
  }, [editingExam, showToast])

  // Auto Repair Exam in Audit Tab
  const handleQuickRepair = useCallback((exam: AsmoExam) => {
    setRepairingExamId(exam.id)
    setTimeout(() => {
      const repaired = autoRepairExam(exam)
      setExams((prev) =>
        prev.map((item) => (item.id === exam.id ? { ...repaired, isPublished: item.isPublished } : item)),
      )
      setRepairedExamIds((prev) => new Set(prev).add(exam.id))
      setRepairingExamId(null)
      showToast(`⚡ Đã chuẩn hóa KaTeX và lời giải 3 bước thành công cho đề ${exam.title || exam.code}!`)
    }, 400)
  }, [showToast])

  // Batch quick repair for top 20 exams in Audit Tab
  const handleRepairAllExams = useCallback(() => {
    setIsRepairingAll(true)
    setTimeout(() => {
      const targetCount = Math.min(exams.length, 20)
      const newlyRepairedIds = new Set<string>()

      setExams((prev) =>
        prev.map((item, idx) => {
          if (idx < 20) {
            const repaired = autoRepairExam(item)
            newlyRepairedIds.add(item.id)
            return { ...repaired, isPublished: item.isPublished }
          }
          return item
        }),
      )

      setRepairedExamIds((prev) => new Set([...prev, ...newlyRepairedIds]))
      setIsRepairingAll(false)
      setAuditTimestamp(new Date().toLocaleTimeString('vi-VN'))
      showToast(`⚡ Đã chuẩn hóa KaTeX và lời giải 3 bước thành công cho toàn bộ ${targetCount} đề thi!`)
    }, 500)
  }, [exams, showToast])

  // Run full audit
  const handleRunFullAudit = useCallback(() => {
    setIsAuditingAll(true)
    setTimeout(() => {
      setIsAuditingAll(false)
      setAuditTimestamp(new Date().toLocaleTimeString('vi-VN'))
      showToast('Đã quét kiểm định toàn bộ ngân hàng đề thi ASMO thành công!')
    }, 600)
  }, [showToast])

  // Filtered Exams
  const filteredExams = useMemo(() => {
    return exams.filter((exam) => {
      if (filterSubject !== 'all' && exam.subject !== filterSubject) return false
      if (filterGrade !== 'all' && exam.grade !== filterGrade) return false
      if (filterStatus === 'published' && !exam.isPublished) return false
      if (filterStatus === 'draft' && exam.isPublished) return false
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim()
        const matchTitle = exam.title.toLowerCase().includes(query)
        const matchCode = exam.code.toLowerCase().includes(query)
        if (!matchTitle && !matchCode) return false
      }
      return true
    })
  }, [exams, filterSubject, filterGrade, filterStatus, searchQuery])

  // Pagination for exams list: 12 items/page
  const {
    slice: paginatedExams,
    page: examPage,
    totalPages: examTotalPages,
    prev: prevExamPage,
    next: nextExamPage,
    goTo: goToExamPage,
  } = usePagination(filteredExams, 12)

  // Metrics calculation
  const metrics = useMemo(() => {
    const totalExams = exams.length
    const publishedCount = exams.filter((e) => e.isPublished).length
    const draftCount = exams.filter((e) => !e.isPublished).length
    const avgPassScore = totalExams > 0
      ? (exams.reduce((sum, e) => sum + e.passScore, 0) / totalExams).toFixed(1)
      : '0'

    return { totalExams, publishedCount, draftCount, avgPassScore }
  }, [exams])

  // Audit results for Audit tab
  const auditResults = useMemo(() => {
    return exams.slice(0, 20).map((exam) => {
      const res: AsmoExamAuditResult = auditAsmoExam(exam)
      return {
        exam,
        result: res,
      }
    })
  }, [exams])

  // Health Score calculation
  const healthScore = useMemo(() => {
    if (auditResults.length === 0) return 100
    const totalScore = auditResults.reduce((acc, curr) => acc + curr.result.qualityScore, 0)
    return Math.round(totalScore / auditResults.length)
  }, [auditResults])

  // Audit breakdown counts
  const auditBreakdown = useMemo(() => {
    let katexErrors = 0
    let mathInconsistencies = 0
    let pedagogicalWarnings = 0
    let taxonomyIssues = 0

    auditResults.forEach(({ result }) => {
      katexErrors += result.categoryBreakdown.formula_syntax.errors
      mathInconsistencies +=
        result.categoryBreakdown.math_consistency.errors +
        result.categoryBreakdown.options_distractors.errors
      pedagogicalWarnings += result.categoryBreakdown.pedagogical_solution.warnings
      taxonomyIssues += result.categoryBreakdown.taxonomy_domain.warnings
    })

    return { katexErrors, mathInconsistencies, pedagogicalWarnings, taxonomyIssues }
  }, [auditResults])

  // Curriculum Handlers
  const handleDeleteWeek = useCallback(
    (weekToDelete: AsmoCurriculumWeekItem) => {
      setCurriculumWeeks((prev) =>
        prev.filter(
          (w) =>
            !(
              w.week === weekToDelete.week &&
              w.subject === weekToDelete.subject &&
              w.grade === weekToDelete.grade
            ),
        ),
      )
      showToast(`Đã xóa tuần ${weekToDelete.week}: ${weekToDelete.title}`)
    },
    [showToast],
  )

  const handleResetCurriculum = useCallback(() => {
    setCurriculumWeeks(
      ASMO_CURRICULUM_WEEKS.map((w) => ({
        ...w,
        keyCompetencies: [...w.keyCompetencies],
        sampleQuestionIds: [...w.sampleQuestionIds],
      })),
    )
    showToast('Đã khôi phục lộ trình học về mặc định!')
  }, [showToast])

  const handleExportCurriculum = useCallback(() => {
    const blob = new Blob([JSON.stringify(curriculumWeeks, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asmo_curriculum_export.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast(`Đã xuất ${curriculumWeeks.length} tuần học ra file asmo_curriculum_export.json thành công!`)
  }, [curriculumWeeks, showToast])

  const handleDownloadTemplate = useCallback(() => {
    const sampleTemplate = [
      {
        week: 1,
        subject: 'math',
        grade: 1,
        topic: 'ASMO-MATH-G1-W01',
        title: 'Đếm Khối Lập Phương & Không Gian Đa Chiều',
        summary: 'Làm quen với góc nhìn 3D, đếm số khối bị che khuất và xoay hình trong không gian.',
        keyCompetencies: ['Tư duy không gian', 'Đếm hình khối', 'Bóc tách tầng'],
        visualTemplate: '3D_CUBE_CLUSTER',
        sampleQuestionIds: ['asmo-math-g1-2020-r1-q05'],
        meeTip: {
          quote: 'Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!',
          storyAdvice: 'Đánh số từng tầng từ dưới lên trên để tránh bỏ sót khối bị che khuất.',
        },
        solutionSteps: [
          'Bước 1: Phân tích số tầng của mô hình từ thấp đến cao.',
          'Bước 2: Áp dụng công thức đếm theo cột $N = \\sum h_i$.',
          'Bước 3: Tổng hợp số lượng khối lập phương.',
        ],
        commonPitfall: 'Bỏ sót các khối ở tầng 1 bị che khuất hoàn toàn.',
      },
    ]
    const blob = new Blob([JSON.stringify(sampleTemplate, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'asmo_curriculum_template.json'
    a.click()
    URL.revokeObjectURL(url)
    showToast('Đã tải xuống file JSON mẫu chuẩn hóa!')
  }, [showToast])

  const handleGenerateAllTips = useCallback(() => {
    setCurriculumWeeks((prev) =>
      prev.map((w) => {
        const gen = generatePedagogicalTipsAndSolution(w)
        return {
          ...w,
          meeTip: {
            quote: gen.quote,
            storyAdvice: gen.storyAdvice,
          },
          solutionSteps: gen.solutionSteps,
          commonPitfall: gen.commonPitfall,
        }
      }),
    )
    showToast(
      `⚡ Đã tự động sinh Bí kíp Mèo Mee và Lời giải 3 bước cho toàn bộ ${curriculumWeeks.length} tuần học!`,
    )
  }, [curriculumWeeks.length, showToast])

  const handleOpenPreviewGen = useCallback((weekItem: AsmoCurriculumWeekItem) => {
    const gen = generatePedagogicalTipsAndSolution(weekItem)
    setPreviewGenWeek({
      week: weekItem,
      quote: gen.quote,
      storyAdvice: gen.storyAdvice,
      solutionSteps: gen.solutionSteps,
      commonPitfall: gen.commonPitfall,
    })
  }, [])

  // Filtered Curriculum Weeks
  const filteredWeeks = useMemo(() => {
    return curriculumWeeks.filter((w) => {
      if (curriculumSubject !== 'all' && w.subject !== curriculumSubject) return false
      if (curriculumGrade !== 'all' && w.grade !== curriculumGrade) return false
      return true
    })
  }, [curriculumWeeks, curriculumSubject, curriculumGrade])

  return (
    <div className="flex flex-col gap-6">
      {/* Toast popup via Portal to escape transform page-enter stacking context */}
      {toastNotification &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="alert"
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 rounded-2xl border-2 border-emerald-300 bg-emerald-500 px-5 py-3.5 text-sm font-black text-white shadow-clay animate-in fade-in slide-in-from-bottom-3"
          >
            <Sparkles className="size-5 shrink-0 animate-spin" />
            <span>{toastNotification}</span>
            <button
              type="button"
              onClick={() => setToastNotification(null)}
              className="ml-2 rounded-lg p-1 hover:bg-emerald-600 cursor-pointer"
            >
              <X className="size-4" />
            </button>
          </div>,
          document.body,
        )}

      {/* Header Banner — Soft Clay Hallmark */}
      <div className="relative overflow-hidden rounded-3xl border-2 border-border/80 bg-gradient-to-r from-amber-50 via-orange-50 to-brand-50 p-6 sm:p-8 shadow-clay">
        <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex size-14 sm:size-16 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-400 text-3xl shadow-clay">
              🏆
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-xl border border-amber-300 bg-amber-100 px-2.5 py-0.5 text-xs font-black text-amber-800">
                  ASMO OLYMPIAD STUDIO
                </span>
                <span className="rounded-xl border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                  Live Engine
                </span>
              </div>
              <h1 className="mt-1 font-display text-2xl sm:text-3xl font-black text-text">
                Học & Thi ASMO Quốc Tế
              </h1>
              <p className="mt-0.5 text-sm text-muted">
                Quản trị đề thi Olympic, phòng thi trực tuyến, lộ trình 16 tuần và kiểm định KaTeX sư phạm.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Button
              type="button"
              variant="secondary"
              onClick={handleRunFullAudit}
              disabled={isAuditingAll}
              className="gap-2 rounded-2xl border-2 border-border/80 bg-white font-black shadow-clay hover:bg-amber-50"
            >
              <RotateCcw className={cn('size-4 text-brand-600', isAuditingAll && 'animate-spin')} />
              {isAuditingAll ? 'Đang kiểm định…' : 'Quét kiểm định KaTeX'}
            </Button>
          </div>
        </div>
      </div>

      {/* Navigation Clay Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border-2 border-border/80 bg-surface p-2 shadow-clay">
        <button
          type="button"
          onClick={() => setActiveTab('exams')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'exams'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <FileText className="size-4" />
          <span>Đề thi & Phòng thi</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs',
              activeTab === 'exams' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700',
            )}
          >
            {exams.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('curriculum')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'curriculum'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <Map className="size-4" />
          <span>Lộ trình học</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs',
              activeTab === 'curriculum' ? 'bg-white/20 text-white' : 'bg-brand-100 text-brand-700',
            )}
          >
            16 tuần
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('audit')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'audit'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <ShieldCheck className="size-4" />
          <span>Kiểm định chất lượng</span>
          <span
            className={cn(
              'ml-1.5 rounded-full px-2 py-0.5 text-xs font-black',
              healthScore >= 80 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800',
            )}
          >
            {healthScore}%
          </span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('analytics')}
          className={cn(
            'flex items-center gap-2 rounded-2xl px-5 py-2.5 text-sm font-black transition-all cursor-pointer select-none',
            activeTab === 'analytics'
              ? 'bg-brand-500 text-white shadow-clay scale-[1.02]'
              : 'text-muted hover:bg-brand-50 hover:text-text',
          )}
        >
          <BarChart3 className="size-4" />
          <span>Báo cáo & Lịch sử</span>
        </button>
      </div>

      {/* ── TAB 1: EXAMS & ARENA ── */}
      {activeTab === 'exams' && (
        <div className="flex flex-col gap-6">
          {/* 4 Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-brand-50 to-white p-5 shadow-clay">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-100 text-brand-600 text-2xl shadow-clay">
                📚
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Tổng số đề</p>
                <p className="font-display text-2xl font-black text-text">{metrics.totalExams}</p>
                <p className="text-[11px] text-brand-700 font-medium">Toán · Khoa học · Tiếng Anh</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-clay">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-100 text-emerald-600 text-2xl shadow-clay">
                🟢
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Đang mở</p>
                <p className="font-display text-2xl font-black text-emerald-600">{metrics.publishedCount}</p>
                <p className="text-[11px] text-emerald-700 font-medium">Sẵn sàng cho học sinh thi</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-amber-50 to-white p-5 shadow-clay">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-100 text-amber-600 text-2xl shadow-clay">
                📝
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Bản nháp</p>
                <p className="font-display text-2xl font-black text-amber-600">{metrics.draftCount}</p>
                <p className="text-[11px] text-amber-700 font-medium">Đang hiệu đính & chuẩn hóa</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-sky-50 to-white p-5 shadow-clay">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-100 text-sky-600 text-2xl shadow-clay">
                🎯
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase tracking-wider">Điểm trung bình</p>
                <p className="font-display text-2xl font-black text-sky-600">{metrics.avgPassScore} <span className="text-sm font-bold text-muted">/100</span></p>
                <p className="text-[11px] text-sky-700 font-medium">Quy chuẩn điểm đỗ ASMO</p>
              </div>
            </div>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center justify-between gap-3 rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative min-w-[200px] flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo tên hoặc mã đề…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-2xl border-2 border-border/80 bg-white py-2 pl-9 pr-3 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                />
              </div>

              {/* Subject Filter */}
              <select
                aria-label="Lọc theo môn học"
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value as 'all' | AsmoSubject)}
                className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Tất cả môn học</option>
                <option value="math">📐 Toán Olympic</option>
                <option value="science">🔬 Khoa Học</option>
                <option value="english">🔤 Tiếng Anh</option>
              </select>

              {/* Grade Filter */}
              <select
                aria-label="Lọc theo khối lớp"
                value={filterGrade}
                onChange={(e) =>
                  setFilterGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))
                }
                className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Tất cả khối lớp</option>
                {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                  <option key={g} value={g}>
                    Lớp {g}
                  </option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                aria-label="Lọc theo trạng thái"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'all' | 'published' | 'draft')}
                className="rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-black text-text focus:border-brand-400 focus:outline-none"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="published">🟢 Đang mở (Published)</option>
                <option value="draft">🟡 Bản nháp (Draft)</option>
              </select>
            </div>

            <div className="text-xs font-bold text-muted self-end sm:self-center">
              Hiển thị <span className="text-text font-black">{paginatedExams.length}</span> / {filteredExams.length} đề thi (Tổng {exams.length})
            </div>
          </div>

          {/* Exams List */}
          <div className="grid grid-cols-1 gap-4">
            {filteredExams.length === 0 ? (
              <div className="rounded-3xl border-2 border-dashed border-border/80 p-12 text-center text-muted">
                <p className="text-base font-bold">Không tìm thấy đề thi phù hợp với bộ lọc.</p>
                <Button
                  variant="secondary"
                  onClick={() => {
                    setFilterSubject('all')
                    setFilterGrade('all')
                    setFilterStatus('all')
                    setSearchQuery('')
                  }}
                  className="mt-3 rounded-2xl font-bold text-xs"
                >
                  Đặt lại bộ lọc
                </Button>
              </div>
            ) : (
              paginatedExams.map((exam) => (
                <div
                  key={exam.id}
                  className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay transition-all hover:border-brand-200"
                >
                  <div className="flex items-start gap-4 flex-1">
                    <div
                      className={cn(
                        'flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 text-xl shadow-clay font-black',
                        exam.subject === 'math'
                          ? 'border-indigo-200 bg-indigo-50 text-indigo-700'
                          : exam.subject === 'science'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-orange-200 bg-orange-50 text-orange-700',
                      )}
                    >
                      {exam.subject === 'math' ? '📐' : exam.subject === 'science' ? '🔬' : '🔤'}
                    </div>

                    <div className="flex flex-col gap-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-xl border border-border/80 bg-white px-2.5 py-0.5 text-[11px] font-black text-muted">
                          {exam.code}
                        </span>
                        <span
                          className={cn(
                            'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                            exam.subject === 'math'
                              ? 'border-indigo-200 bg-indigo-100 text-indigo-800'
                              : exam.subject === 'science'
                                ? 'border-emerald-200 bg-emerald-100 text-emerald-800'
                                : 'border-orange-200 bg-orange-100 text-orange-800',
                          )}
                        >
                          {exam.subject === 'math' ? 'Toán' : exam.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'} · Lớp {exam.grade}
                        </span>
                        <span className="rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-800">
                          {exam.round} · {exam.year}
                        </span>
                        <span
                          className={cn(
                            'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                            exam.isPublished
                              ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                              : 'border-slate-300 bg-slate-100 text-slate-600',
                          )}
                        >
                          {exam.isPublished ? '● Đang mở' : '○ Bản nháp'}
                        </span>
                      </div>

                      <h3 className="text-base font-black text-text line-clamp-1">{exam.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-muted">
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="size-3.5 text-brand-500" />
                          Thời lượng: <strong className="text-text">{exam.durationMinutes} phút</strong>
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <Award className="size-3.5 text-amber-500" />
                          Điểm đạt: <strong className="text-text">{exam.passScore}</strong> / {exam.totalPoints}
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <BookOpen className="size-3.5 text-indigo-500" />
                          Số câu hỏi: <strong className="text-text">{exam.questions?.length ?? 0} câu</strong>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end lg:self-center">
                    {/* Toggle publish button */}
                    <button
                      type="button"
                      onClick={() => handleTogglePublish(exam.id)}
                      className={cn(
                        'flex items-center gap-1.5 rounded-2xl border-2 px-3 py-2 text-xs font-black transition-all shadow-clay cursor-pointer',
                        exam.isPublished
                          ? 'border-emerald-300 bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                          : 'border-slate-300 bg-slate-100 text-slate-700 hover:bg-slate-200',
                      )}
                      title={exam.isPublished ? 'Chuyển sang bản nháp' : 'Kích hoạt mở đề thi'}
                    >
                      {exam.isPublished ? (
                        <>
                          <ToggleRight className="size-4 text-emerald-600" />
                          <span>Đang mở</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="size-4 text-slate-500" />
                          <span>Bản nháp</span>
                        </>
                      )}
                    </button>

                    {/* Regulation Modal button */}
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setEditingExam(exam)}
                      className="gap-1.5 rounded-2xl border-2 border-border/80 bg-white font-black shadow-clay hover:bg-amber-50 text-xs"
                    >
                      <Edit3 className="size-3.5 text-amber-600" />
                      <span>Chỉnh quy chế</span>
                    </Button>

                    {/* Question details drawer/modal */}
                    <Button
                      type="button"
                      onClick={() => setViewingQuestionsExam(exam)}
                      className="gap-1.5 rounded-2xl border-2 border-brand-600 bg-brand-500 font-black text-white shadow-clay hover:bg-brand-600 text-xs"
                    >
                      <Eye className="size-3.5" />
                      <span>Chi tiết câu hỏi ({exam.questions?.length ?? 0})</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination Controls */}
          {filteredExams.length > 0 && (
            <Paginator
              page={examPage}
              totalPages={examTotalPages}
              totalItems={filteredExams.length}
              pageSize={12}
              onPrev={prevExamPage}
              onNext={nextExamPage}
              onGoTo={goToExamPage}
              className="rounded-3xl border-2 border-border/80 bg-surface shadow-clay"
            />
          )}
        </div>
      )}

      {/* ── TAB 2: CURRICULUM ROADMAP ── */}
      {activeTab === 'curriculum' && (
        <div className="flex flex-col gap-6">
          {/* Toolbar */}
          <div className="flex flex-col gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-xs font-black uppercase text-brand-600 tracking-wider">
                  Lộ Trình Học Chuẩn ASMO
                </span>
                {/* Subject Filter */}
                <select
                  aria-label="Lọc lộ trình theo môn"
                  value={curriculumSubject}
                  onChange={(e) => setCurriculumSubject(e.target.value as 'all' | AsmoSubject)}
                  className="rounded-2xl border-2 border-border/80 bg-white px-3 py-1.5 text-xs font-black text-text focus:border-brand-400 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả môn</option>
                  <option value="math">📐 Toán Olympic</option>
                  <option value="science">🔬 Khoa Học Tự Nhiên</option>
                  <option value="english">🔤 Tiếng Anh Học Thuật</option>
                </select>

                {/* Grade Filter */}
                <select
                  aria-label="Lọc lộ trình theo lớp"
                  value={curriculumGrade}
                  onChange={(e) =>
                    setCurriculumGrade(e.target.value === 'all' ? 'all' : Number(e.target.value))
                  }
                  className="rounded-2xl border-2 border-border/80 bg-white px-3 py-1.5 text-xs font-black text-text focus:border-brand-400 focus:outline-none cursor-pointer"
                >
                  <option value="all">Tất cả khối lớp</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((g) => (
                    <option key={g} value={g}>
                      Lớp {g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Data & Generator Action Buttons */}
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={() => setIsCreatingWeek(true)}
                  className="rounded-2xl bg-brand-500 hover:bg-brand-600 text-white font-black text-xs px-3.5 py-2 shadow-clay flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="size-4" />
                  <span>+ Thêm tuần mới</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleGenerateAllTips}
                  className="rounded-2xl border-2 border-purple-200 bg-purple-50 hover:bg-purple-100 text-purple-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="size-4 text-purple-600" />
                  <span>⚡ Sinh Tips toàn bộ lộ trình</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setIsImportModalOpen(true)}
                  className="rounded-2xl border-2 border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="size-4 text-sky-600" />
                  <span>📥 Nhập Lộ trình (Import JSON)</span>
                </Button>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleExportCurriculum}
                  className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black text-xs px-3 py-2 shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="size-4 text-emerald-600" />
                  <span>📤 Xuất Lộ trình (Export JSON)</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleResetCurriculum}
                  className="rounded-2xl text-muted hover:bg-slate-100 hover:text-text font-black text-xs px-2.5 py-2 flex items-center gap-1 cursor-pointer"
                  title="Khôi phục về danh sách lộ trình gốc"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Khôi phục mặc định</span>
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs">
              <div className="text-muted font-bold">
                Đang hiển thị <strong className="text-text">{filteredWeeks.length}</strong> / {curriculumWeeks.length} tuần chuyên đề
              </div>
            </div>
          </div>

          {/* Curriculum Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredWeeks.map((weekItem) => {
              const templateInfo = weekItem.visualTemplate
                ? TEMPLATE_3D_LABELS[weekItem.visualTemplate]
                : null

              return (
                <div
                  key={`${weekItem.subject}-${weekItem.grade}-${weekItem.week}-${weekItem.topic}`}
                  className="flex flex-col justify-between gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay hover:border-brand-200 transition-all"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="flex size-9 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-500 font-display text-xs font-black text-white shadow-clay">
                          T{weekItem.week}
                        </span>
                        <span
                          className={cn(
                            'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                            weekItem.subject === 'math'
                              ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                              : weekItem.subject === 'science'
                                ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
                                : 'border-orange-200 bg-orange-50 text-orange-800',
                          )}
                        >
                          {weekItem.subject === 'math'
                            ? 'Toán'
                            : weekItem.subject === 'science'
                              ? 'Khoa Học'
                              : 'Tiếng Anh'}{' '}
                          · Lớp {weekItem.grade}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-muted">
                        Mã: {weekItem.topic}
                      </span>
                    </div>

                    <h3 className="font-display text-base font-black text-text">
                      {weekItem.title}
                    </h3>
                    <p className="text-xs text-muted leading-relaxed">
                      {weekItem.summary}
                    </p>

                    {/* Key Competencies Chips */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] font-bold text-muted uppercase">Trọng tâm:</span>
                      {weekItem.keyCompetencies.map((comp) => (
                        <span
                          key={comp}
                          className="rounded-xl border border-brand-200 bg-brand-50/70 px-2 py-0.5 text-[11px] font-bold text-brand-800 shadow-sm"
                        >
                          {comp}
                        </span>
                      ))}
                    </div>

                    {/* 3D Template Badge */}
                    {templateInfo ? (
                      <div className="flex items-center gap-3 rounded-2xl border-2 border-amber-200 bg-amber-50/80 p-3 shadow-sm">
                        <span className="text-2xl">{templateInfo.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black text-amber-900">
                              {templateInfo.label}
                            </span>
                            <span className="rounded-lg bg-amber-200 px-1.5 py-0.2 text-[10px] font-black text-amber-900">
                              3D LAB
                            </span>
                          </div>
                          <p className="text-[11px] text-amber-800 font-medium">
                            {templateInfo.desc}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-xs text-muted italic">
                        <BookOpen className="size-3.5" />
                        <span>Bài học lý thuyết & giải bài tập Olympic tổng hợp</span>
                      </div>
                    )}

                    {/* Mèo Mee Tips Box (nếu có) */}
                    {weekItem.meeTip && (
                      <div className="flex items-start gap-2.5 rounded-2xl border-2 border-amber-300 bg-amber-50/90 p-3 shadow-xs">
                        <span className="text-xl shrink-0">🐱</span>
                        <div className="flex-1 text-xs">
                          <p className="font-black text-amber-900 italic">
                            "{weekItem.meeTip.quote}"
                          </p>
                          <p className="mt-1 text-amber-800 font-medium leading-relaxed">
                            {weekItem.meeTip.storyAdvice}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Lời giải 3 bước ASMO (nếu có) */}
                    {weekItem.solutionSteps && weekItem.solutionSteps.length > 0 && (
                      <div className="space-y-1.5 rounded-2xl border border-indigo-200 bg-indigo-50/50 p-2.5 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-black text-indigo-900 text-[11px] uppercase tracking-wider">
                            💡 Khung giải 3 bước ASMO:
                          </span>
                          <span className="rounded-md bg-indigo-200 px-1.5 py-0.2 text-[10px] font-black text-indigo-900">
                            KaTeX
                          </span>
                        </div>
                        <p className="text-[11px] text-indigo-800 font-bold truncate">
                          {weekItem.solutionSteps[0]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions Toolbar on each card */}
                  <div className="flex items-center justify-between border-t border-border/70 pt-3 mt-1">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setEditingWeek(weekItem)}
                        className="rounded-xl border-2 border-brand-200 text-brand-700 hover:bg-brand-50 font-bold text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                      >
                        <Edit3 className="size-3.5" />
                        <span>Sửa tuần học</span>
                      </Button>
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => handleOpenPreviewGen(weekItem)}
                        className="rounded-xl border-2 border-purple-200 bg-purple-50/60 text-purple-700 hover:bg-purple-100 font-bold text-xs px-2.5 py-1 flex items-center gap-1 cursor-pointer"
                      >
                        <Wand2 className="size-3.5 text-purple-600" />
                        <span>🪄 Sinh Tips & Lời giải</span>
                      </Button>
                    </div>

                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => handleDeleteWeek(weekItem)}
                      className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-700 font-bold text-xs px-2 py-1 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="size-3.5" />
                      <span>Xóa tuần</span>
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── TAB 3: QUALITY AUDIT ENGINE ── */}
      {activeTab === 'audit' && (
        <div className="flex flex-col gap-6">
          {/* Health Score & Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Main Health Card */}
            <div className="flex flex-col justify-between gap-4 rounded-3xl border-2 border-border/80 bg-gradient-to-br from-emerald-50 via-teal-50 to-white p-6 shadow-clay md:col-span-1">
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-xl border border-emerald-300 bg-emerald-100 px-2.5 py-0.5 text-xs font-black text-emerald-800">
                    HỆ THỐNG KIỂM ĐỊNH
                  </span>
                  <span className="text-xs text-muted font-bold">Lần quét: {auditTimestamp}</span>
                </div>
                <h3 className="mt-3 font-display text-lg font-black text-text">
                  Chỉ số sức khỏe KaTeX & Sư phạm
                </h3>
              </div>

              <div className="flex items-end gap-3 my-2">
                <span className="font-display text-5xl font-black text-emerald-600">
                  {healthScore}
                </span>
                <span className="text-lg font-black text-muted pb-1">/ 100</span>
                <span
                  className={cn(
                    'mb-1 ml-auto rounded-xl px-3 py-1 text-xs font-black border',
                    healthScore >= 90
                      ? 'border-emerald-300 bg-emerald-500 text-white shadow-clay'
                      : healthScore >= 75
                        ? 'border-amber-300 bg-amber-500 text-white shadow-clay'
                        : 'border-rose-300 bg-rose-500 text-white shadow-clay',
                  )}
                >
                  {healthScore >= 90 ? 'Xuất sắc' : healthScore >= 75 ? 'Đạt chuẩn' : 'Cần tối ưu'}
                </span>
              </div>

              <div className="w-full bg-emerald-100 rounded-full h-3 overflow-hidden border border-emerald-200">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${healthScore}%` }}
                />
              </div>

              <div className="flex flex-col gap-2 w-full">
                <Button
                  type="button"
                  onClick={handleRunFullAudit}
                  disabled={isAuditingAll || isRepairingAll}
                  className="w-full gap-2 rounded-2xl border-2 border-emerald-600 bg-emerald-600 font-black text-white shadow-clay hover:bg-emerald-700"
                >
                  <RotateCcw className={cn('size-4', isAuditingAll && 'animate-spin')} />
                  {isAuditingAll ? 'Đang phân tích cú pháp…' : 'Quét lại toàn bộ ngân hàng đề'}
                </Button>

                <Button
                  type="button"
                  onClick={handleRepairAllExams}
                  disabled={isRepairingAll || isAuditingAll}
                  className="w-full gap-2 rounded-2xl border-2 border-amber-500 bg-gradient-to-r from-amber-500 to-orange-500 font-black text-white shadow-clay hover:from-amber-600 hover:to-orange-600 cursor-pointer"
                  title="Tự động chuẩn hóa KaTeX và bổ sung 3 bước sư phạm cho toàn bộ 20 đề tiêu biểu"
                >
                  <Sparkles className={cn('size-4', isRepairingAll && 'animate-spin')} />
                  {isRepairingAll ? 'Đang chuẩn hóa…' : `⚡ Sửa nhanh tất cả (${Math.min(exams.length, 20)} đề)`}
                </Button>
              </div>
            </div>

            {/* Breakdown Categories */}
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
                <div className="flex items-center gap-2 text-indigo-600">
                  <span className="text-xl">📐</span>
                  <p className="text-xs font-black uppercase tracking-wider">Cú pháp KaTeX</p>
                </div>
                <div className="my-2">
                  <p className="font-display text-2xl font-black text-text">
                    {auditBreakdown.katexErrors === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xl">
                        <CheckCircle2 className="size-5" /> Chuẩn 100%
                      </span>
                    ) : (
                      <span className="text-rose-600">{auditBreakdown.katexErrors} lỗi</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted">Dấu ngoặc, \\frac, inline $...$</p>
                </div>
                <span className="text-[10px] font-bold text-indigo-700">Strict mode compliant</span>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
                <div className="flex items-center gap-2 text-amber-600">
                  <span className="text-xl">🔢</span>
                  <p className="text-xs font-black uppercase tracking-wider">Tính nhất quán</p>
                </div>
                <div className="my-2">
                  <p className="font-display text-2xl font-black text-text">
                    {auditBreakdown.mathInconsistencies === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xl">
                        <CheckCircle2 className="size-5" /> Hoàn hảo
                      </span>
                    ) : (
                      <span className="text-amber-600">{auditBreakdown.mathInconsistencies} cảnh báo</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted">Không trùng đáp án, distractor chuẩn</p>
                </div>
                <span className="text-[10px] font-bold text-amber-700">Không có đáp án rác/dummy</span>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
                <div className="flex items-center gap-2 text-emerald-600">
                  <span className="text-xl">🐾</span>
                  <p className="text-xs font-black uppercase tracking-wider">Cấu trúc sư phạm</p>
                </div>
                <div className="my-2">
                  <p className="font-display text-2xl font-black text-text">
                    {auditBreakdown.pedagogicalWarnings === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xl">
                        <CheckCircle2 className="size-5" /> Đủ 3 bước
                      </span>
                    ) : (
                      <span className="text-amber-600">{auditBreakdown.pedagogicalWarnings} thiếu bước</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted">Phân tích · Công thức · Kết luận</p>
                </div>
                <span className="text-[10px] font-bold text-emerald-700">Mèo Mee hint định hướng</span>
              </div>

              <div className="flex flex-col justify-between rounded-3xl border-2 border-border/80 bg-surface p-4 shadow-clay">
                <div className="flex items-center gap-2 text-sky-600">
                  <span className="text-xl">🏷️</span>
                  <p className="text-xs font-black uppercase tracking-wider">Domain & 3D Spec</p>
                </div>
                <div className="my-2">
                  <p className="font-display text-2xl font-black text-text">
                    {auditBreakdown.taxonomyIssues === 0 ? (
                      <span className="text-emerald-600 flex items-center gap-1 text-xl">
                        <CheckCircle2 className="size-5" /> Chuẩn hoá
                      </span>
                    ) : (
                      <span className="text-amber-600">{auditBreakdown.taxonomyIssues} vấn đề</span>
                    )}
                  </p>
                  <p className="text-[11px] text-muted">Khớp topicCode & VisualSpec</p>
                </div>
                <span className="text-[10px] font-bold text-sky-700">5 Phân loại Olympic</span>
              </div>
            </div>
          </div>

          {/* Audit Exams Table */}
          <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
            <h3 className="font-display text-base font-black text-text mb-4">
              Kết Quả Kiểm Định Từng Đề Thi ({auditResults.length} đề tiêu biểu)
            </h3>

            <div className="space-y-3">
              {auditResults.map(({ exam, result }) => (
                <div
                  key={exam.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 rounded-2xl border-2 border-border/80 bg-white p-4 shadow-sm hover:shadow-clay transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'flex size-11 shrink-0 items-center justify-center rounded-2xl font-black text-sm border shadow-sm',
                        result.qualityScore >= 90
                          ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                          : result.qualityScore >= 75
                            ? 'border-amber-300 bg-amber-100 text-amber-800'
                            : 'border-rose-300 bg-rose-100 text-rose-800',
                      )}
                    >
                      {result.qualityScore}%
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-muted">{exam.code}</span>
                        <span className="rounded-lg bg-brand-50 px-2 py-0.2 text-[10px] font-black text-brand-700">
                          {exam.questions.length} câu hỏi
                        </span>
                        <span className="text-[11px] text-muted">
                          {result.formulasChecked} công thức KaTeX
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-text line-clamp-1">{exam.title}</h4>
                    </div>
                  </div>

                  {/* Badges & Actions */}
                  <div className="flex flex-wrap items-center gap-2 self-end md:self-center">
                    {result.errorCount > 0 && (
                      <span className="flex items-center gap-1 rounded-xl border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-black text-rose-700">
                        <AlertCircle className="size-3.5" />
                        {result.errorCount} lỗi
                      </span>
                    )}
                    {result.warningCount > 0 && (
                      <span className="flex items-center gap-1 rounded-xl border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs font-black text-amber-700">
                        <AlertTriangle className="size-3.5" />
                        {result.warningCount} cảnh báo
                      </span>
                    )}
                    {result.errorCount === 0 && result.warningCount === 0 && (
                      <span className="flex items-center gap-1 rounded-xl border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-xs font-black text-emerald-700">
                        <CheckCircle2 className="size-3.5" />
                        Hoàn hảo
                      </span>
                    )}

                    {/* Quick Repair Button */}
                    {repairedExamIds.has(exam.id) ? (
                      <button
                        type="button"
                        onClick={() => handleQuickRepair(exam)}
                        disabled={repairingExamId === exam.id}
                        className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-black text-emerald-800 shadow-sm transition-all hover:bg-emerald-100 cursor-pointer disabled:opacity-60"
                        title="Đề thi đã được chuẩn hóa KaTeX và lời giải 3 bước. Nhấp để chuẩn hóa lại nếu cần."
                      >
                        {repairingExamId === exam.id ? (
                          <>
                            <RotateCcw className="size-3 animate-spin text-emerald-700" />
                            <span>Đang chuẩn hóa...</span>
                          </>
                        ) : (
                          <>
                            <span>✅ Đã chuẩn hóa</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <Button
                        type="button"
                        variant="secondary"
                        disabled={repairingExamId === exam.id}
                        onClick={() => handleQuickRepair(exam)}
                        className={cn(
                          'gap-1.5 rounded-xl border text-xs font-black shadow-sm transition-all cursor-pointer',
                          repairingExamId === exam.id
                            ? 'border-amber-400 bg-amber-100 text-amber-900 opacity-80'
                            : 'border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100',
                        )}
                        title="Tự động chuẩn hóa KaTeX và bổ sung 3 bước sư phạm"
                      >
                        {repairingExamId === exam.id ? (
                          <>
                            <RotateCcw className="size-3 animate-spin text-amber-700" />
                            <span>Đang chuẩn hóa...</span>
                          </>
                        ) : (
                          <>
                            <Wrench className="size-3" />
                            <span>Sửa nhanh KaTeX</span>
                          </>
                        )}
                      </Button>
                    )}

                    {/* Audit Details Modal Trigger */}
                    <Button
                      type="button"
                      onClick={() => setAuditingExamModal(exam)}
                      className="gap-1 rounded-xl border-2 border-brand-600 bg-brand-500 text-xs font-black text-white hover:bg-brand-600 shadow-clay"
                    >
                      <Eye className="size-3" />
                      <span>Xem lỗi chi tiết</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── TAB 4: ANALYTICS & RECENT SUBMISSIONS ── */}
      {activeTab === 'analytics' && (
        <div className="flex flex-col gap-6">
          {/* Quick Analytics Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-brand-200 bg-brand-50 text-brand-600 text-2xl shadow-clay">
                📝
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase">Tổng lượt nộp bài</p>
                <p className="font-display text-2xl font-black text-text">1,428</p>
                <p className="text-[11px] text-emerald-600 font-bold">+18.5% tuần qua</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-emerald-200 bg-emerald-50 text-emerald-600 text-2xl shadow-clay">
                🏆
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase">Tỷ lệ đạt chuẩn</p>
                <p className="font-display text-2xl font-black text-emerald-600">78.4%</p>
                <p className="text-[11px] text-muted font-bold">1,120 học sinh đậu</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-sky-200 bg-sky-50 text-sky-600 text-2xl shadow-clay">
                📊
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase">Điểm TB toàn sàn</p>
                <p className="font-display text-2xl font-black text-sky-600">76.2 / 100</p>
                <p className="text-[11px] text-muted font-bold">Điểm cao nhất: 100</p>
              </div>
            </div>

            <div className="flex items-center gap-4 rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
              <div className="flex size-13 shrink-0 items-center justify-center rounded-2xl border-2 border-amber-200 bg-amber-50 text-amber-600 text-2xl shadow-clay">
                ⏱️
              </div>
              <div>
                <p className="text-xs font-bold text-muted uppercase">Thời gian làm bài TB</p>
                <p className="font-display text-2xl font-black text-amber-600">38.5 phút</p>
                <p className="text-[11px] text-muted font-bold">Quy định: 60 phút</p>
              </div>
            </div>
          </div>

          {/* Recent Submissions Table */}
          <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">📋</span>
                <h3 className="font-display text-base font-black text-text">
                  Lượt Nộp Bài Gần Đây Của Học Sinh
                </h3>
              </div>
              <span className="text-xs text-muted font-bold">Cập nhật thời gian thực</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b-2 border-border/80 text-muted font-black uppercase tracking-wider text-[10px]">
                    <th className="pb-3 pl-2">Học sinh</th>
                    <th className="pb-3">Đề thi</th>
                    <th className="pb-3">Điểm số</th>
                    <th className="pb-3">Tỷ lệ đúng</th>
                    <th className="pb-3">Kết quả</th>
                    <th className="pb-3">Thời gian</th>
                    <th className="pb-3 pr-2 text-right">Thời điểm nộp</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40 font-medium">
                  {INITIAL_SUBMISSIONS.map((sub) => (
                    <tr key={sub.id} className="hover:bg-brand-50/40 transition-colors">
                      <td className="py-3.5 pl-2">
                        <div className="flex items-center gap-2">
                          <div className="flex size-7 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-black text-[11px]">
                            {sub.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-black text-text">{sub.studentName}</p>
                            <p className="text-[10px] text-muted">Lớp {sub.studentGrade}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5">
                        <p className="font-bold text-text line-clamp-1 max-w-[280px]">
                          {sub.examTitle}
                        </p>
                        <span className="text-[10px] text-muted">
                          {sub.subject === 'math' ? 'Toán' : sub.subject === 'science' ? 'Khoa Học' : 'Tiếng Anh'}
                        </span>
                      </td>
                      <td className="py-3.5">
                        <span className="font-black text-text text-sm">{sub.score}</span>
                        <span className="text-muted"> / {sub.totalPoints}</span>
                      </td>
                      <td className="py-3.5 font-black text-brand-600">
                        {sub.scorePct}%
                      </td>
                      <td className="py-3.5">
                        <span
                          className={cn(
                            'rounded-xl px-2.5 py-0.5 text-[11px] font-black border',
                            sub.isPassed
                              ? 'border-emerald-300 bg-emerald-100 text-emerald-800'
                              : 'border-rose-300 bg-rose-100 text-rose-800',
                          )}
                        >
                          {sub.isPassed ? '✓ Đạt chuẩn' : '✗ Chưa đạt'}
                        </span>
                      </td>
                      <td className="py-3.5 font-bold text-muted">
                        {sub.durationMinutes} phút
                      </td>
                      <td className="py-3.5 pr-2 text-right font-bold text-muted">
                        {sub.submittedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Top Common Mistakes */}
          <div className="rounded-3xl border-2 border-border/80 bg-surface p-5 shadow-clay">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚠️</span>
                <div>
                  <h3 className="font-display text-base font-black text-text">
                    Top Câu Hỏi Học Sinh Hay Làm Sai (Bẫy Toán Học)
                  </h3>
                  <p className="text-xs text-muted">Phân tích để giáo viên điều chỉnh bài giảng ôn tập</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {INITIAL_COMMON_MISTAKES.map((mistake) => (
                <div
                  key={mistake.questionId}
                  className="flex flex-col justify-between gap-3 rounded-2xl border-2 border-border/80 bg-white p-4 shadow-sm"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-rose-100 border border-rose-200 px-2 py-0.5 text-[10px] font-black text-rose-800">
                        Tỷ lệ sai: {mistake.wrongRatePct}% ({mistake.wrongAttemptsCount} lượt)
                      </span>
                      <span className="text-[10px] font-bold text-muted">{mistake.examCode}</span>
                    </div>

                    <h4 className="mt-2 text-xs font-black text-brand-700">
                      Chuyên đề: {mistake.topicName}
                    </h4>

                    <div className="mt-1 rounded-xl bg-slate-50 p-2.5 text-xs text-text border border-border/40 font-medium">
                      <AsmoFormula text={mistake.questionText} />
                    </div>
                  </div>

                  <div className="rounded-xl border border-amber-200 bg-amber-50/80 p-2.5">
                    <p className="text-[11px] font-bold text-amber-900 leading-snug">
                      💡 <strong>Phân tích bẫy tư duy:</strong> {mistake.commonPitfall}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── MODAL: EDIT REGULATION ── */}
      {editingExam &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-in fade-in"
          >
            <div className="w-full max-w-lg rounded-3xl border-2 border-border/80 bg-surface p-6 shadow-clay animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b-2 border-border/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">⚙️</span>
                  <h3 className="font-display text-lg font-black text-text">
                    Chỉnh Quy Chế Phòng Thi
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingExam(null)}
                  className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              <form onSubmit={handleSaveRegulation} className="mt-4 flex flex-col gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted uppercase">Tên đề thi</label>
                  <input
                    name="title"
                    defaultValue={editingExam.title}
                    required
                    className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase">Vòng thi (Round)</label>
                    <input
                      name="round"
                      defaultValue={editingExam.round}
                      required
                      className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase">Năm tổ chức</label>
                    <input
                      type="number"
                      name="year"
                      defaultValue={editingExam.year}
                      required
                      className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase">Thời lượng (phút)</label>
                    <input
                      type="number"
                      name="durationMinutes"
                      defaultValue={editingExam.durationMinutes}
                      required
                      min={10}
                      max={180}
                      className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase">Điểm đỗ (Pass)</label>
                    <input
                      type="number"
                      name="passScore"
                      defaultValue={editingExam.passScore}
                      required
                      min={1}
                      className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted uppercase">Tổng điểm</label>
                    <input
                      type="number"
                      name="totalPoints"
                      defaultValue={editingExam.totalPoints}
                      required
                      min={10}
                      className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted uppercase">Mô tả đề thi</label>
                  <textarea
                    name="description"
                    defaultValue={editingExam.description}
                    rows={3}
                    className="mt-1 w-full rounded-2xl border-2 border-border/80 bg-white px-3 py-2 text-xs font-bold text-text focus:border-brand-400 focus:outline-none"
                  />
                </div>

                <div className="mt-2 flex items-center justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setEditingExam(null)}
                    className="rounded-2xl font-bold"
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    className="rounded-2xl border-2 border-brand-600 bg-brand-500 font-black text-white shadow-clay hover:bg-brand-600"
                  >
                    Lưu quy chế
                  </Button>
                </div>
              </form>
            </div>
          </div>,
          document.body,
        )}

      {/* ── MODAL: VIEW QUESTIONS DETAILS WITH KATEX & MEE HINT ── */}
      {viewingQuestionsExam &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in"
          >
            <div className="flex h-full max-h-[90vh] w-full max-w-4xl flex-col rounded-3xl border-2 border-border/80 bg-surface shadow-clay animate-in zoom-in-95 overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between border-b-2 border-border/80 bg-gradient-to-r from-brand-50 to-white px-6 py-4">
                <div>
                  <span className="rounded-xl border border-brand-200 bg-brand-100 px-2.5 py-0.5 text-xs font-black text-brand-800">
                    {viewingQuestionsExam.code}
                  </span>
                  <h3 className="mt-1 font-display text-lg font-black text-text">
                    Chi Tiết Câu Hỏi & Đáp Án KaTeX ({viewingQuestionsExam.questions.length} câu)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setViewingQuestionsExam(null)}
                  className="rounded-xl p-1.5 text-muted hover:bg-slate-100 hover:text-text cursor-pointer"
                >
                  <X className="size-5" />
                </button>
              </div>

              {/* Questions Scrollable Content */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {viewingQuestionsExam.questions.map((q, idx) => (
                  <div
                    key={q.id || idx}
                    className="rounded-3xl border-2 border-border/80 bg-white p-5 shadow-sm space-y-4"
                  >
                    {/* Question Title & Meta */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/60 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="flex size-8 items-center justify-center rounded-xl bg-brand-500 font-black text-xs text-white shadow-sm">
                          {idx + 1}
                        </span>
                        <span className="font-display font-black text-sm text-text">
                          {q.title || `Câu hỏi ${idx + 1}`}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="rounded-lg bg-indigo-50 border border-indigo-200 px-2 py-0.5 text-[10px] font-bold text-indigo-700">
                          {q.topicName || q.topicCode}
                        </span>
                        <span className="rounded-lg bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-black text-amber-700">
                          {q.points} điểm
                        </span>
                      </div>
                    </div>

                    {/* Question Text with KaTeX */}
                    <div className="rounded-2xl border-2 border-slate-100 bg-slate-50/70 p-4 text-sm text-text leading-relaxed">
                      <AsmoFormula text={q.text} />
                    </div>

                    {/* Options List */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt) => {
                          const isCorrect =
                            opt.id.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase() ||
                            opt.label.trim().toUpperCase() === q.correctAnswer?.trim().toUpperCase()

                          return (
                            <div
                              key={opt.id}
                              className={cn(
                                'flex items-center gap-3 rounded-2xl border-2 p-3 text-xs font-bold transition-all',
                                isCorrect
                                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900 shadow-sm'
                                  : 'border-border/60 bg-white text-text',
                              )}
                            >
                              <span
                                className={cn(
                                  'flex size-7 shrink-0 items-center justify-center rounded-xl text-xs font-black border',
                                  isCorrect
                                    ? 'border-emerald-400 bg-emerald-500 text-white'
                                    : 'border-slate-300 bg-slate-100 text-slate-700',
                                )}
                              >
                                {opt.label}
                              </span>
                              <div className="flex-1">
                                <AsmoFormula text={opt.text} />
                              </div>
                              {isCorrect && (
                                <span className="rounded-lg bg-emerald-200 px-2 py-0.5 text-[10px] font-black text-emerald-900">
                                  Đáp án đúng
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Mèo Mee Hint */}
                    {q.meeHint && (
                      <div className="flex items-start gap-3 rounded-2xl border-2 border-amber-300 bg-amber-50 p-3.5 shadow-sm">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-xl shadow-clay">
                          🐱
                        </div>
                        <div className="flex-1 text-xs">
                          <span className="font-black text-amber-900">Mèo Mee Định Hướng:</span>
                          <p className="mt-0.5 font-bold text-amber-800 leading-relaxed">
                            {typeof q.meeHint === 'string'
                              ? q.meeHint
                              : (q.meeHint as { text?: string })?.text}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Pedagogical Explanation Steps (KaTeX) */}
                    {q.explanationSteps && q.explanationSteps.length > 0 ? (
                      <div className="space-y-2 rounded-2xl border-2 border-indigo-100 bg-indigo-50/40 p-4">
                        <p className="text-xs font-black uppercase text-indigo-900 tracking-wider">
                          Lời giải sư phạm 3 bước (KaTeX chuẩn hóa):
                        </p>
                        <div className="space-y-2 text-xs">
                          {q.explanationSteps.map((step) => (
                            <div
                              key={step.stepIndex}
                              className="rounded-xl border border-indigo-200 bg-white p-3 shadow-xs"
                            >
                              <p className="font-black text-indigo-700">{step.title}</p>
                              <div className="mt-1 text-text leading-relaxed">
                                <AsmoFormula text={step.description} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : q.explanation ? (
                      <div className="rounded-2xl border-2 border-border/80 bg-slate-50 p-4 text-xs">
                        <p className="font-black text-brand-700">Lời giải chi tiết:</p>
                        <div className="mt-1 text-text leading-relaxed">
                          <AsmoFormula text={q.explanation} />
                        </div>
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end border-t-2 border-border/80 bg-white px-6 py-3">
                <Button
                  type="button"
                  onClick={() => setViewingQuestionsExam(null)}
                  className="rounded-2xl font-black"
                >
                  Đóng
                </Button>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* ── AUDIT EXAM MODAL (Integration with existing AsmoExamAuditModal) ── */}
      {auditingExamModal && (
        <AsmoExamAuditModal
          isOpen={Boolean(auditingExamModal)}
          onClose={() => setAuditingExamModal(null)}
          exam={auditingExamModal}
          onExamUpdated={(updated) => {
            setExams((prev) =>
              prev.map((e) => (e.id === updated.id ? { ...updated, isPublished: e.isPublished } : e)),
            )
            setAuditingExamModal(updated)
            showToast(`Đã lưu cập nhật kiểm định cho đề ${updated.code}!`)
          }}
        />
      )}

      {/* ── MODAL: EDIT CURRICULUM WEEK ── */}
      {editingWeek && (
        <CurriculumWeekEditModal
          isOpen={Boolean(editingWeek)}
          initialData={editingWeek}
          isNew={false}
          onClose={() => setEditingWeek(null)}
          onSave={(updatedWeek) => {
            setCurriculumWeeks((prev) =>
              prev.map((w) =>
                w.week === editingWeek.week &&
                w.subject === editingWeek.subject &&
                w.grade === editingWeek.grade
                  ? updatedWeek
                  : w,
              ),
            )
            showToast(`Đã lưu thay đổi tuần ${updatedWeek.week}: "${updatedWeek.title}"!`)
            setEditingWeek(null)
          }}
        />
      )}

      {/* ── MODAL: CREATE NEW CURRICULUM WEEK ── */}
      {isCreatingWeek && (
        <CurriculumWeekEditModal
          isOpen={isCreatingWeek}
          initialData={{
            week:
              curriculumWeeks.length > 0
                ? Math.max(...curriculumWeeks.map((w) => w.week)) + 1
                : 1,
            subject: curriculumSubject === 'all' ? 'math' : curriculumSubject,
            grade: (curriculumGrade === 'all' ? 1 : curriculumGrade) as AsmoGrade,
            topic: `ASMO-TOPIC-W${curriculumWeeks.length + 1}`,
            title: '',
            summary: '',
            keyCompetencies: ['Tư duy logic', 'Phương pháp ASMO'],
            visualTemplate: '3D_CUBE_CLUSTER',
            sampleQuestionIds: [],
            meeTip: {
              quote: 'Mèo Mee luôn đồng hành cùng bạn!',
              storyAdvice: 'Quan sát kỹ và suy luận từng bước một nhé!',
            },
            solutionSteps: [],
            commonPitfall: '',
          }}
          isNew={true}
          onClose={() => setIsCreatingWeek(false)}
          onSave={(newWeek) => {
            setCurriculumWeeks((prev) => [...prev, newWeek])
            showToast(`Đã thêm tuần học mới: "${newWeek.title}"!`)
            setIsCreatingWeek(false)
          }}
        />
      )}

      {/* ── MODAL: IMPORT JSON ── */}
      {isImportModalOpen && (
        <CurriculumImportModal
          isOpen={isImportModalOpen}
          onClose={() => setIsImportModalOpen(false)}
          onDownloadTemplate={handleDownloadTemplate}
          onImport={(items, mode) => {
            if (mode === 'replace') {
              setCurriculumWeeks(items)
              showToast(`Đã ghi đè toàn bộ ${items.length} tuần học vào lộ trình!`)
            } else {
              setCurriculumWeeks((prev) => [...prev, ...items])
              showToast(`Đã gộp thêm ${items.length} tuần học vào lộ trình!`)
            }
            setIsImportModalOpen(false)
          }}
        />
      )}

      {/* ── MODAL: PREVIEW & APPLY SMART GENERATOR ── */}
      {previewGenWeek && (
        <CurriculumGeneratorPreviewModal
          isOpen={Boolean(previewGenWeek)}
          week={previewGenWeek.week}
          initialGenerated={{
            quote: previewGenWeek.quote,
            storyAdvice: previewGenWeek.storyAdvice,
            solutionSteps: previewGenWeek.solutionSteps,
            commonPitfall: previewGenWeek.commonPitfall,
          }}
          onClose={() => setPreviewGenWeek(null)}
          onApply={(data) => {
            setCurriculumWeeks((prev) =>
              prev.map((w) =>
                w.week === previewGenWeek.week.week &&
                w.subject === previewGenWeek.week.subject &&
                w.grade === previewGenWeek.week.grade
                  ? {
                      ...w,
                      meeTip: {
                        quote: data.quote,
                        storyAdvice: data.storyAdvice,
                      },
                      solutionSteps: data.solutionSteps,
                      commonPitfall: data.commonPitfall,
                    }
                  : w,
              ),
            )
            showToast(
              `Đã áp dụng Bí kíp & Lời giải chuẩn hóa vào tuần ${previewGenWeek.week.week}: ${previewGenWeek.week.title}!`,
            )
            setPreviewGenWeek(null)
          }}
        />
      )}
    </div>
  )
}
