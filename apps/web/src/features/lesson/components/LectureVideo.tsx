import { useMemo } from 'react'
import { resolveLectureVideo } from '@/features/lesson/lib/lecture-video'

type Props = {
  title: string
  url: string
}

export function LectureVideo({ title, url }: Props) {
  const source = useMemo(() => resolveLectureVideo(url), [url])

  if (!source) {
    return (
      <p className="rounded-2xl border-2 border-coral-100 bg-coral-100/40 p-4 text-sm font-bold text-danger" role="alert">
        Video bài giảng chưa có đường dẫn HTTPS hợp lệ.
      </p>
    )
  }

  return (
    <div className="overflow-hidden rounded-2xl border-2 border-border bg-black/5">
      <p className="bg-brand-50 px-3 py-2 text-xs font-extrabold uppercase text-brand-600">
        Video bài giảng
      </p>
      {source.kind === 'youtube' ? (
        <iframe
          className="aspect-video w-full bg-black"
          src={source.src}
          title={`Video bài giảng: ${title}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
        />
      ) : (
        <video
          className="aspect-video w-full bg-black"
          controls
          playsInline
          preload="metadata"
          src={source.src}
        >
          Trình duyệt không hỗ trợ video.
        </video>
      )}
      {source.kind === 'youtube' && (
        <p className="bg-white px-3 py-2 text-xs text-muted">
          Video được phát bằng chế độ tăng cường riêng tư của YouTube.
        </p>
      )}
    </div>
  )
}
