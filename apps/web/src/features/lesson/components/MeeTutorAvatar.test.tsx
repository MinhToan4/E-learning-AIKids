import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MEE_TUTOR_POSE_LABELS, MeeTutorAvatar, type MeeTutorPose } from './MeeTutorAvatar'

describe('MeeTutorAvatar', () => {
  it.each(Object.entries(MEE_TUTOR_POSE_LABELS))('maps %s to an accessible reaction', (pose, label) => {
    const markup = renderToStaticMarkup(createElement(MeeTutorAvatar, { pose: pose as MeeTutorPose, className: 'size-16' }))

    expect(markup).toContain(`data-pose="${pose}"`)
    expect(markup).toContain(`aria-label="${label}"`)
    expect(markup).toContain(`mee-tutor-avatar--${pose}`)
  })
})
