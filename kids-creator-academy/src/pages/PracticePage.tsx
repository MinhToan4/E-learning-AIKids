import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { LoadingCreature } from '@/components/feedback/States'
import { useDemoStore } from '@/store/demo-store'

/**
 * Global /practice redirects into the selected course’s Bài tập tab.
 * Practice content is course-scoped (WorldPage CoursePracticeTab).
 */
export function PracticePage() {
  const navigate = useNavigate()
  const selectedCourseId = useDemoStore((s) => s.selectedCourseId)

  useEffect(() => {
    navigate(`/world?view=practice&course=${selectedCourseId}`, { replace: true })
  }, [navigate, selectedCourseId])

  return (
    <div className="mx-auto max-w-md p-8">
      <LoadingCreature stage="Mở bài tập của khóa học…" />
    </div>
  )
}
