type ArtifactSnapshot = {
  sourceType?: unknown
  title?: unknown
  name?: unknown
  fileName?: unknown
  kind?: unknown
}

type ReviewResponseInput = {
  questionType: string
  response: Record<string, unknown>
  artifact: { snapshotJson?: unknown } | null
}

function snapshotOf(artifact: ReviewResponseInput['artifact']): ArtifactSnapshot {
  const value = artifact?.snapshotJson
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as ArtifactSnapshot)
    : {}
}

export function reviewResponseSummary({
  questionType,
  response,
  artifact,
}: ReviewResponseInput): {
  label: string
  value: string
  detail?: string
} {
  if (questionType === 'short_text' && typeof response.text === 'string') {
    return {
      label: 'Câu trả lời của học viên',
      value: response.text,
    }
  }

  if (questionType === 'artifact') {
    const snapshot = snapshotOf(artifact)
    const sourceType =
      typeof snapshot.sourceType === 'string'
        ? snapshot.sourceType
        : response.sourceType
    const value = [snapshot.title, snapshot.name, snapshot.fileName].find(
      (candidate): candidate is string =>
        typeof candidate === 'string' && candidate.trim().length > 0,
    )
    const detail =
      sourceType === 'project'
        ? 'Dự án sáng tạo'
        : sourceType === 'asset'
          ? 'Học liệu trong portfolio'
          : sourceType === 'upload'
            ? 'Tệp đã nộp'
            : 'Tác phẩm học tập'

    return {
      label: 'Tác phẩm đã nộp',
      value: value?.trim() ?? 'Không tải được tên tác phẩm',
      detail,
    }
  }

  return {
    label: 'Nội dung đã nộp',
    value: 'Không có nội dung có thể hiển thị.',
  }
}
