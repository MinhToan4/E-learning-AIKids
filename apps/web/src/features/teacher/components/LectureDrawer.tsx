/**
 * LectureDrawer — Slide-in drawer để tạo/chỉnh sửa bài học (lecture).
 *
 * WHY slide-in drawer:
 * - Giáo viên thấy danh sách bài học bên trái trong khi chỉnh sửa bên phải
 * - Không mất context khi chỉnh sửa
 * - Light theme đồng bộ với hệ thống UI
 *
 * Sections (tab ngang):
 *   1. Cơ bản — tiêu đề, skill, hook, goals, video
 *   2. Kiến thức — concept, example
 *   3. Trò chơi — game selector + questionCount + config
 *   4. Sáng tạo — practice kind + instruction
 *   5. Thử tài — check question, options, answer
 */
import { useState, useCallback, useId } from 'react'
import { X, CheckCircle2, Circle, Youtube, BookOpen, Gamepad2, Palette, HelpCircle, BookMarked } from 'lucide-react'
import { api } from '@/shared/lib/api'
import { useToast } from '@/shared/hooks/useToast'
import {
  GAME_OPTIONS, PRACTICE_OPTIONS, GAME_DIFFICULTIES,
  buildLectureGameConfig, lectureDraftReadiness,
  serializeLectureGameConfig, slugifyAuthoringId,
  type LectureDraft,
} from '../lib/authoring'
import { GameSelector } from './GameSelector'
import { QuizQuestionBuilder, type EditableQuestion } from './QuizQuestionBuilder'
import { CatalogGameBuilder } from './CatalogGameBuilder'
import { QuestionBankPicker } from './QuestionBankPicker'
import { CheckQuestionBuilder } from './CheckQuestionBuilder'

type Props = {
  courseId: string
  lecture: LectureDraft | null      // null = create new
  onSaved: () => void
  onClose: () => void
  // WHY: inline=true → hiển thị trong main panel (không phải overlay).
  // Master-detail layout: sidebar trái, editor phải inline.
  inline?: boolean
  // WHY: archived + archive/restore callback để giáo viên ẩn/hiện bài từ trong editor.
  archived?: boolean
  onArchive?: () => void
  onRestore?: () => void
  // WHY: readOnly=true cho global system courses — chỉ xem, không được gọm PATCH/DELETE.
  // Ngăn chặn 403 bằng cách ẩn mọi nút thực hiện action.
  readOnly?: boolean
}

type Section = 'basics' | 'content' | 'game' | 'practice' | 'check'

const SECTIONS: { id: Section; label: string; icon: React.ReactNode }[] = [
  { id: 'basics', label: 'Cơ bản', icon: <BookOpen size={14} /> },
  { id: 'content', label: 'Kiến thức', icon: <BookOpen size={14} /> },
  { id: 'game', label: 'Trò chơi', icon: <Gamepad2 size={14} /> },
  { id: 'practice', label: 'Sáng tạo', icon: <Palette size={14} /> },
  { id: 'check', label: 'Thử tài', icon: <HelpCircle size={14} /> },
]

const SELF_CONTAINED_QUIZ_GAMES = ['math-kids']
const CATALOG_GAMES = ['data-runner', 'truth-patrol']

function emptyDraft(): LectureDraft {
  return {
    id: '', title: '', skill: '', hook: '',
    practiceKind: 'journal', videoUrl: '',
    concept: '', example: '',
    reward: '', duration: '',
    goalsText: '',
    gameType: 'math-kids',
    gameMode: 'required',
    gameAllowedTypes: ['math-kids'],
    gameDifficulty: 'steady',
    gameInstruction: '',
    gameOutcome: '',
    gameCardsText: '',
    gameStructuredText: '',
    // WHY: 6 là số câu hỏi mặc định hợp lý cho 1 bài học.
    // Giáo viên có thể chỉnh từ 1–30 tuỳ độ khó bài.
    questionCount: 6,
    practiceInstruction: '',
    product: '',
    checkQuestions: [],
    checkQuestion: '', checkOption1: '', checkOption2: '', checkOption3: '',
    correctIndex: '0', checkExplain: '',
  }
}

export function LectureDrawer({ courseId, lecture, onSaved, onClose, inline = false, archived = false, onArchive, onRestore, readOnly = false }: Props) {
  const [draft, setDraft] = useState<LectureDraft>(() => lecture ?? emptyDraft())
  const [activeSection, setActiveSection] = useState<Section>('basics')
  const [quizQuestions, setQuizQuestions] = useState<EditableQuestion[]>([])
  const [showBankPicker, setShowBankPicker] = useState(false)
  const [saving, setSaving] = useState(false)
  const { showToast } = useToast()
  const uid = useId()

  const isEdit = !!lecture
  const readiness = lectureDraftReadiness(draft)

  const set = useCallback(<K extends keyof LectureDraft>(key: K, value: LectureDraft[K]) => {
    if (readOnly) return
    setDraft((prev) => {
      const next = { ...prev, [key]: value }
      // Auto-generate slug từ title nếu đang tạo mới và chưa có id
      if (key === 'title' && !isEdit && !prev.id.trim()) {
        next.id = slugifyAuthoringId(value as string)
      }
      return next
    })
  }, [isEdit, readOnly])

  // Xác định game hiện tại cần cấu hình gì
  const activeGameTypes = draft.gameMode === 'student_choice' ? draft.gameAllowedTypes : [draft.gameType]
  const needsQuizConfig = activeGameTypes.some((t) => SELF_CONTAINED_QUIZ_GAMES.includes(t))
  const needsCatalogConfig = activeGameTypes.some((t) => CATALOG_GAMES.includes(t))
  const catalogGameType = activeGameTypes.find((t) => CATALOG_GAMES.includes(t)) as 'data-runner' | 'truth-patrol' | undefined

  // WHY: quizQuestions được truyền vào buildLectureGameConfig để lưu DB
  // (không tách state, không share giữa các bài học)
  function buildGameConfigForSave() {
    const questionsForSave = needsQuizConfig && quizQuestions.length > 0
      ? quizQuestions.map((q) => ({
          id: q.id,
          prompt: q.prompt,
          options: q.options,
          answer: q.answer,
          why: q.explanation,
        }))
      : undefined
    return buildLectureGameConfig(draft, questionsForSave)
  }

  async function handleSave() {
    if (readOnly) return
    const missing = readiness.steps.flatMap((s) => s.missing)
    if (missing.length > 0) {
      showToast(`Còn thiếu: ${missing.slice(0, 3).join(', ')}`, 'error')
      return
    }

    setSaving(true)
    try {
      const gameConfig = buildGameConfigForSave()
      const payload = {
        courseId,
        id: draft.id,
        title: draft.title,
        skill: draft.skill,
        hook: draft.hook,
        goals: draft.goalsText.split('\n').map((s) => s.trim()).filter(Boolean),
        concept: draft.concept,
        example: draft.example,
        videoUrl: draft.videoUrl || null,
        reward: draft.reward,
        duration: draft.duration,
        practiceKind: draft.practiceKind,
        gameType: draft.gameType,
        gameConfig,
        gameInstruction: draft.gameInstruction,
        gameOutcome: draft.gameOutcome,
        gameCards: draft.gameCardsText.split('\n').map((s) => s.trim()).filter(Boolean),
        practiceInstruction: draft.practiceInstruction,
        product: draft.product,
        // WHY: checkQuestions thay thế check fields cũ — nhiều câu, nhiều đáp án
        checkQuestions: draft.checkQuestions,
        checkQuestion: draft.checkQuestions[0]?.prompt ?? draft.checkQuestion,
        checkOptions: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].options
          : [draft.checkOption1, draft.checkOption2, draft.checkOption3],
        correctIndex: draft.checkQuestions.length > 0
          ? draft.checkQuestions[0].answer
          : parseInt(draft.correctIndex) || 0,
        checkExplain: draft.checkQuestions[0]?.explain ?? draft.checkExplain,
      }

      if (isEdit) {
        await api(`/api/teacher/lectures/${lecture.id}`, {
          method: 'PATCH', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã cập nhật bài học!', 'success')
      } else {
        await api('/api/teacher/lectures', {
          method: 'POST', body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        })
        showToast('✅ Đã tạo bài học mới!', 'success')
      }
      onSaved()
      onClose()
    } catch (err) {
      showToast(`Lỗi: ${err instanceof Error ? err.message : 'Không thể lưu'}`, 'error')
    } finally {
      setSaving(false)
    }
  }

  // Sync quizQuestions từ existing gameConfig khi load lecture
  useState(() => {
    if (lecture) {
      try {
        const cfg = JSON.parse(lecture.gameStructuredText || '{}') as Record<string, unknown>
        if (Array.isArray(cfg.quizQuestions)) {
          const questions = (cfg.quizQuestions as Record<string, unknown>[]).map((q, i): EditableQuestion => ({
            id: typeof q.id === 'string' ? q.id : `q-${i}`,
            prompt: typeof q.prompt === 'string' ? q.prompt : '',
            options: Array.isArray(q.options) ? q.options as string[] : ['', ''],
            answer: typeof q.answer === 'number' ? q.answer : 0,
            explanation: typeof q.why === 'string' ? q.why : '',
            imageUrl: null,
            tags: [],
            ageMin: 6, ageMax: 11, difficulty: 'steady',
          }))
          if (questions.length > 0) setQuizQuestions(questions)
        }
      } catch {
        // Ignore parse errors — fallback về rỗng
      }
    }
  })

  const sectionStatus = (sectionId: Section) => {
    const step = readiness.steps.find((s) => {
      if (sectionId === 'basics' || sectionId === 'content') return s.id === 'learn'
      if (sectionId === 'game') return s.id === 'game'
      if (sectionId === 'practice') return s.id === 'practice'
      if (sectionId === 'check') return s.id === 'check'
      return false
    })
    return step?.complete ?? false
  }

  // WHY: inline=true → không có backdrop, không fixed position.
  // Container fill 100% chiều cao parent (main panel trong TeacherPage).
  const containerStyle: React.CSSProperties = inline ? {
    display: 'flex', flexDirection: 'column', height: '100%',
    background: '#f8fafc', overflow: 'hidden',
    borderRadius: '1rem', border: '1px solid #e2e8f0',
  } : {
    position: 'fixed', top: 0, right: 0, bottom: 0, zIndex: 401,
    width: '100%', maxWidth: '700px',
    background: '#f8fafc',
    borderLeft: '1px solid #e2e8f0',
    display: 'flex', flexDirection: 'column', overflow: 'hidden',
    boxShadow: '-20px 0 60px rgba(15,23,42,0.15)',
  }

  const body = (
    <>
      <div style={containerStyle}>
        {/* Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ fontSize: '1.0625rem', fontWeight: 700, color: '#0f172a' }}>
                {readOnly ? '👁️ Xem bài học' : isEdit ? '✏️ Chỉnh sửa bài học' : '✨ Tạo bài học mới'}
              </div>
              {readOnly && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#92400e', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Chỉ xem
                </span>
              )}
              {!readOnly && isEdit && archived && (
                <span style={{ fontSize: '0.6875rem', fontWeight: 700, color: '#ea580c', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '0.375rem', padding: '0.125rem 0.5rem' }}>
                  Đang ẩn
                </span>
              )}
            </div>
            {draft.title && (
              <div style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.125rem' }}>
                {draft.title}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            {/* Progress indicator — chỉ có nghĩa khi edit/create, ẩn khi chỉ xem */}
            {!readOnly && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b' }}>
                <span style={{ color: readiness.complete ? '#10b981' : '#f97316', fontWeight: 700 }}>
                  {readiness.completed}/{readiness.total}
                </span>
                <span>bước</span>
              </div>
            )}
            {/* WHY: Ẩn archive buttons hoàn toàn khi readOnly=true — tránh 403. */}
            {!readOnly && isEdit && (
              archived ? (
                <button
                  type="button"
                  onClick={onRestore}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #6ee7b7', background: '#ecfdf5', borderRadius: '0.5rem', color: '#059669', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  ↩ Khôi phục
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onArchive}
                  style={{ padding: '0.375rem 0.75rem', border: '1px solid #fca5a5', background: '#fff1f2', borderRadius: '0.5rem', color: '#dc2626', fontSize: '0.8125rem', fontWeight: 700, cursor: 'pointer' }}
                >
                  🗃 Ẩn bài
                </button>
              )
            )}
            <button
              type="button"
              id={`${uid}-drawer-close`}
              onClick={onClose}
              style={{ padding: '0.5rem', border: '1px solid #e2e8f0', background: '#f8fafc', borderRadius: '0.5rem', color: '#64748b', cursor: 'pointer' }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Section tabs */}
        <div style={{
          display: 'flex', overflowX: 'auto', padding: '0 1.5rem',
          borderBottom: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
          scrollbarWidth: 'none',
        }}>
          {SECTIONS.map((section) => {
            const isActive = activeSection === section.id
            const complete = sectionStatus(section.id)
            return (
              <button
                key={section.id}
                type="button"
                onClick={() => setActiveSection(section.id)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '0.375rem',
                  padding: '0.75rem 1rem', border: 'none', background: 'transparent',
                  color: isActive ? '#6366f1' : '#64748b',
                  fontSize: '0.875rem', fontWeight: isActive ? 700 : 500,
                  cursor: 'pointer', whiteSpace: 'nowrap',
                  borderBottom: isActive ? '2px solid #6366f1' : '2px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                {complete
                  ? <CheckCircle2 size={13} color="#10b981" />
                  : <Circle size={13} color={isActive ? '#6366f1' : '#cbd5e1'} />
                }
                {section.label}
              </button>
            )
          })}
        </div>

        {/* Content area — scrollable */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem 1.5rem', background: '#f8fafc' }}>

          {/* ── BASICS ── */}
          {activeSection === 'basics' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormRow label="Tên bài học *">
                <input
                  type="text" id={`${uid}-title`}
                  value={draft.title}
                  readOnly={readOnly}
                  onChange={(e) => set('title', e.target.value)}
                  placeholder="VD: AI học từ dữ liệu như thế nào?"
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Đường dẫn (slug) *" hint="Tự động từ tên, có thể chỉnh">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>/</span>
                  <input
                    type="text" id={`${uid}-slug`}
                    value={draft.id}
                    readOnly={readOnly}
                    onChange={(e) => set('id', e.target.value)}
                    placeholder="ten-bai-hoc"
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
                {draft.id && !/^[a-z0-9-]{3,64}$/.test(draft.id) && (
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', marginTop: '0.25rem' }}>
                    ⚠️ Chỉ dùng chữ thường, số và gạch ngang (3–64 ký tự)
                  </div>
                )}
              </FormRow>
              <FormRow label="Kỹ năng trọng tâm *">
                <input
                  type="text" value={draft.skill}
                  readOnly={readOnly}
                  onChange={(e) => set('skill', e.target.value)}
                  placeholder="VD: Hiểu cách AI học từ dữ liệu"
                  style={inputStyle}
                />
              </FormRow>
              <FormRow label="Câu hỏi khởi động *" hint="Hook kích thích tò mò">
                <textarea
                  value={draft.hook}
                  readOnly={readOnly}
                  onChange={(e) => set('hook', e.target.value)}
                  placeholder="VD: Làm thế nào một cỗ máy có thể nhận ra khuôn mặt bạn?"
                  rows={3} style={textareaStyle}
                />
              </FormRow>
              <FormRow label="Mục tiêu bài học *" hint="Mỗi mục tiêu 1 dòng">
                <textarea
                  value={draft.goalsText}
                  readOnly={readOnly}
                  onChange={(e) => set('goalsText', e.target.value)}
                  placeholder={"Hiểu AI học từ dữ liệu\nPhân biệt dữ liệu tốt và xấu\nBiết tại sao dữ liệu đa dạng quan trọng"}
                  rows={4} style={textareaStyle}
                />
              </FormRow>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormRow label="Thời lượng">
                  <input type="text" readOnly={readOnly} value={draft.duration} onChange={(e) => set('duration', e.target.value)} placeholder="VD: 30 phút" style={inputStyle} />
                </FormRow>
                <FormRow label="Phần thưởng">
                  <input type="text" readOnly={readOnly} value={draft.reward} onChange={(e) => set('reward', e.target.value)} placeholder="VD: Huy hiệu Nhà Khoa Học" style={inputStyle} />
                </FormRow>
              </div>
              <FormRow label="Video bài học">
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <Youtube size={16} color="#ef4444" style={{ flexShrink: 0 }} />
                  <input
                    type="url" readOnly={readOnly} value={draft.videoUrl}
                    onChange={(e) => set('videoUrl', e.target.value)}
                    placeholder="https://youtube.com/..."
                    style={{ ...inputStyle, flex: 1 }}
                  />
                </div>
              </FormRow>
            </div>
          )}

          {/* ── CONTENT ── */}
          {activeSection === 'content' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormRow label="Kiến thức cốt lõi *" hint="Giải thích ngắn gọn, phù hợp 6–11 tuổi">
                <textarea readOnly={readOnly} value={draft.concept} onChange={(e) => set('concept', e.target.value)} placeholder="AI học bằng cách nhìn vào rất nhiều ví dụ..." rows={6} style={textareaStyle} />
              </FormRow>
              <FormRow label="Ví dụ minh họa *" hint="Câu chuyện hoặc tình huống thực tế">
                <textarea readOnly={readOnly} value={draft.example} onChange={(e) => set('example', e.target.value)} placeholder="Giống như bạn học nhận ra mặt bạn bè sau khi gặp nhiều lần..." rows={5} style={textareaStyle} />
              </FormRow>
            </div>
          )}

          {/* ── GAME ── */}
          {activeSection === 'game' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Game selector */}
              <div>
                <div style={sectionLabelStyle}>Chọn trò chơi cho bài học</div>
                <GameSelector
                  disabled={readOnly}
                  gameType={draft.gameType}
                  gameMode={draft.gameMode}
                  gameAllowedTypes={draft.gameAllowedTypes}
                  onChangeGameType={(t) => set('gameType', t)}
                  onChangeGameMode={(m) => set('gameMode', m)}
                  onChangeAllowedTypes={(types) => set('gameAllowedTypes', types)}
                />
              </div>

              {/* Difficulty */}
              <FormRow label="Độ khó">
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {GAME_DIFFICULTIES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      disabled={readOnly}
                      onClick={() => set('gameDifficulty', d.id as 'gentle' | 'steady' | 'challenge')}
                      style={{
                        flex: 1, padding: '0.5rem 0.25rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', transition: 'all 0.2s',
                        background: draft.gameDifficulty === d.id ? '#ede9fe' : '#fff',
                        color: draft.gameDifficulty === d.id ? '#6d28d9' : '#64748b',
                        fontSize: '0.8125rem', fontWeight: draft.gameDifficulty === d.id ? 700 : 500,
                        border: draft.gameDifficulty === d.id ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                      }}
                    >
                      <div>{d.label}</div>
                      <div style={{ fontSize: '0.6875rem', opacity: 0.7 }}>{d.description}</div>
                    </button>
                  ))}
                </div>
              </FormRow>

              {/* Hướng dẫn và mục tiêu */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <FormRow label="Hướng dẫn chơi *">
                  <textarea readOnly={readOnly} value={draft.gameInstruction} onChange={(e) => set('gameInstruction', e.target.value)} placeholder="Học sinh cần làm gì trong game?" rows={3} style={textareaStyle} />
                </FormRow>
                <FormRow label="Mục tiêu game *">
                  <textarea readOnly={readOnly} value={draft.gameOutcome} onChange={(e) => set('gameOutcome', e.target.value)} placeholder="Học sinh đạt được gì khi chơi?" rows={3} style={textareaStyle} />
                </FormRow>
              </div>

              {/* ── Math-kids: question count + quiz builder ── */}
              {needsQuizConfig && (
                <div>
                  {/* WHY: questionCount per-bài — bài dễ dùng ít câu, bài khó dùng nhiều câu */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <div style={sectionLabelStyle}>Câu hỏi trắc nghiệm (AI Quiz)</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b', whiteSpace: 'nowrap' }}>
                        Số câu:
                        <input
                          type="number"
                          readOnly={readOnly}
                          min={1} max={30}
                          value={draft.questionCount}
                          onChange={(e) => set('questionCount', Math.max(1, Math.min(30, parseInt(e.target.value) || 6)))}
                          style={{
                            width: '4rem', padding: '0.25rem 0.5rem',
                            border: '1.5px solid #e2e8f0', borderRadius: '0.375rem',
                            fontSize: '0.875rem', textAlign: 'center',
                            background: '#fff', color: '#0f172a',
                            outline: 'none',
                          }}
                        />
                      </label>
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => setShowBankPicker(true)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                            padding: '0.375rem 0.875rem', borderRadius: '0.5rem',
                            background: '#ede9fe', color: '#6d28d9',
                            fontSize: '0.8125rem', fontWeight: 600, cursor: 'pointer',
                            border: '1px solid #c4b5fd',
                          }}
                        >
                          <BookMarked size={13} /> Chọn từ ngân hàng
                        </button>
                      )}
                    </div>
                  </div>
                  <QuizQuestionBuilder
                    readOnly={readOnly}
                    questions={quizQuestions}
                    onChange={setQuizQuestions}
                  />
                </div>
              )}

              {/* ── Catalog game config ── */}
              {needsCatalogConfig && catalogGameType && (
                <div>
                  <div style={sectionLabelStyle}>
                    Cấu hình {catalogGameType === 'data-runner' ? '🏃 Data Runner' : '🚀 Truth Patrol'}
                  </div>
                  <CatalogGameBuilder
                    readOnly={readOnly}
                    gameType={catalogGameType}
                    value={draft.gameStructuredText}
                    onChange={(raw) => set('gameStructuredText', raw)}
                  />
                </div>
              )}
            </div>
          )}

          {/* ── PRACTICE ── */}
          {activeSection === 'practice' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <FormRow label="Kiểu thực hành *">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '0.5rem' }}>
                  {PRACTICE_OPTIONS.map((opt) => {
                    const active = draft.practiceKind === opt.id
                    return (
                      <button
                        key={opt.id}
                        type="button"
                        disabled={readOnly}
                        onClick={() => set('practiceKind', opt.id)}
                        style={{
                          padding: '0.625rem 0.75rem', borderRadius: '0.625rem', cursor: readOnly ? 'default' : 'pointer', textAlign: 'left', transition: 'all 0.15s',
                          background: active ? '#ede9fe' : '#fff',
                          border: active ? '1.5px solid #8b5cf6' : '1.5px solid #e2e8f0',
                          color: active ? '#6d28d9' : '#475569',
                        }}
                      >
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600 }}>{opt.label}</div>
                        <div style={{ fontSize: '0.6875rem', opacity: 0.7, marginTop: '0.125rem' }}>{opt.description}</div>
                      </button>
                    )
                  })}
                </div>
              </FormRow>
              <FormRow label="Hướng dẫn thực hành *">
                <textarea readOnly={readOnly} value={draft.practiceInstruction} onChange={(e) => set('practiceInstruction', e.target.value)} placeholder="Mô tả nhiệm vụ học sinh cần làm..." rows={4} style={textareaStyle} />
              </FormRow>
              <FormRow label="Sản phẩm học sinh tạo ra *">
                <input type="text" readOnly={readOnly} value={draft.product} onChange={(e) => set('product', e.target.value)} placeholder="VD: Bức tranh về AI trong tương lai" style={inputStyle} />
              </FormRow>
            </div>
          )}

          {/* ── CHECK ── */}
          {activeSection === 'check' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{
                padding: '0.75rem 1rem',
                background: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '0.625rem',
                fontSize: '0.8125rem',
                color: '#0369a1',
              }}>
                💡 <strong>Thử tài</strong> — Câu hỏi cuối bài để kiểm tra học sinh đã hiểu chưa.
                Mỗi câu hỏi có thể có từ <strong>2–6 đáp án</strong>. Câu hỏi quiz trong game được cấu hình ở tab <strong>Trò chơi</strong>.
              </div>

              {/* Multi-question check builder */}
              <CheckQuestionBuilder
                readOnly={readOnly}
                questions={draft.checkQuestions}
                onChange={(qs) => set('checkQuestions', qs)}
              />
            </div>
          )}
        </div>

        {/* Footer — Save button */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1rem 1.5rem',
          borderTop: '1px solid #e2e8f0',
          background: '#fff',
          flexShrink: 0,
        }}>
          {!readOnly && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              {readiness.complete
                ? <CheckCircle2 size={14} color="#10b981" />
                : <Circle size={14} color="#f97316" />
              }
              <span style={{ fontSize: '0.8125rem', color: readiness.complete ? '#10b981' : '#f97316' }}>
                {readiness.complete ? 'Sẵn sàng lưu!' : `Còn ${readiness.total - readiness.completed} bước chưa hoàn thành`}
              </span>
            </div>
          )}
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            {/* WHY: readOnly=true — ẩn hoàn toàn footer action để tránh gọi PATCH/DELETE vào system courses. */}
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={onClose}
                  style={{ padding: '0.625rem 1.25rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
                >
                  Hủy
                </button>
                <button
                  type="button"
                  id={`${uid}-save-lecture`}
                  onClick={handleSave}
                  disabled={saving}
                  style={{
                    padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: 'none',
                    background: readiness.complete ? 'linear-gradient(135deg, #6366f1, #8b5cf6)' : '#c7d2fe',
                    color: '#fff', fontSize: '0.875rem', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
                    opacity: saving ? 0.7 : 1, transition: 'all 0.2s',
                  }}
                >
                  {saving ? '⏳ Đang lưu...' : isEdit ? '💾 Cập nhật' : '✨ Tạo bài học'}
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={onClose}
                style={{ padding: '0.625rem 1.5rem', borderRadius: '0.625rem', border: '1.5px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.875rem', cursor: 'pointer' }}
              >
                Đóng
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question bank picker modal */}
      {showBankPicker && (
        <QuestionBankPicker
          selectedIds={quizQuestions.map((q) => q.id)}
          onSelect={(newQuestions) => setQuizQuestions((prev) => [...prev, ...newQuestions])}
          onClose={() => setShowBankPicker(false)}
        />
      )}
    </>
  )

  // inline mode: render trực tiếp, không có backdrop
  if (inline) return body

  // overlay mode: thêm backdrop bên ngoài
  return (
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 400,
          background: 'rgba(15,23,42,0.45)', backdropFilter: 'blur(3px)',
        }}
      />
      {body}
    </>
  )
}

// ─── Helper components ─────────────────────────────────────────────────────────
function FormRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <span style={{ fontSize: '0.875rem', fontWeight: 600, color: '#374151' }}>{label}</span>
        {hint && <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{hint}</span>}
      </div>
      {children}
    </label>
  )
}

// ─── Styles ─ Light theme ──────────────────────────────────────────────────────
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '0.625rem 0.75rem', borderRadius: '0.625rem',
  border: '1.5px solid #e2e8f0', background: '#fff',
  color: '#0f172a', fontSize: '0.875rem', outline: 'none', boxSizing: 'border-box',
  fontFamily: 'inherit',
}
const textareaStyle: React.CSSProperties = {
  ...inputStyle, resize: 'vertical', lineHeight: 1.6,
}
const sectionLabelStyle: React.CSSProperties = {
  fontSize: '0.9375rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.75rem',
}
