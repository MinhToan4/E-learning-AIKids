import React, { useState } from 'react'
import { Button } from '@/shared/components/ui/Button'
import {
  queueOfflineProgress,
  type OfflineManifest,
} from '../lib/offline-learning'

export interface OfflineLessonViewProps {
  manifest: OfflineManifest
}

export function OfflineLessonView({ manifest }: OfflineLessonViewProps) {
  const [completed, setCompleted] = useState(false)
  const cards = manifest.lesson.learnCards
  const stations = manifest.lesson.stations

  function stringValue(value: unknown) {
    return typeof value === 'string' ? value : ''
  }

  function complete() {
    queueOfflineProgress(manifest.questId, {
      percent: 100,
      positionSeconds: 0,
      sectionId: 'offline-complete',
    })
    setCompleted(true)
  }

  return (
    <div className="page-enter mx-auto flex max-w-4xl flex-col gap-4">
      <header className="ui-card p-5">
        <p className="text-xs font-extrabold uppercase tracking-widest text-brand-500">
          Bản học ngoại tuyến
        </p>
        <h1 className="font-display text-2xl">{manifest.lesson.title}</h1>
        <p className="mt-2 text-sm text-muted">{manifest.lesson.hook}</p>
        <p className="mt-3 rounded-xl bg-sun-50 px-3 py-2 text-sm text-warning">
          Đang mất kết nối. Nội dung đã lưu không chứa đáp án; tiến độ sẽ đồng bộ
          theo sự kiện có mã riêng khi mạng trở lại.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2">
        {cards.map((card, index) => (
          <article key={stringValue(card.id) || index} className="ui-card p-4">
            <p className="font-bold">{stringValue(card.title) || `Nội dung ${index + 1}`}</p>
            <p className="mt-2 text-sm leading-relaxed">
              {stringValue(card.body) || stringValue(card.content)}
            </p>
            {stringValue(card.tip) && (
              <p className="mt-2 text-xs text-muted">Gợi ý: {stringValue(card.tip)}</p>
            )}
          </article>
        ))}
      </section>
      <section className="ui-card p-5">
        <h2 className="font-display text-xl">Hoạt động đã lưu</h2>
        <div className="mt-3 space-y-3">
          {stations.map((station, index) => (
            <article key={stringValue(station.id) || index} className="rounded-2xl bg-sky-50 p-4">
              <p className="font-bold">
                {stringValue(station.title) || `Hoạt động ${index + 1}`}
              </p>
              <p className="mt-1 text-sm">
                {stringValue(station.instruction) || stringValue(station.content)}
              </p>
            </article>
          ))}
        </div>
        <Button className="mt-4 w-full" disabled={completed} onClick={complete}>
          {completed ? 'Đã lưu mốc hoàn thành để đồng bộ' : 'Đánh dấu đã xem xong ngoại tuyến'}
        </Button>
      </section>
    </div>
  )
}
