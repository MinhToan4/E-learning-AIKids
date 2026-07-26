import { describe, expect, it } from 'vitest'
import {
  ageExperienceConfigurationSchema,
  parsePublishedAgePolicy,
} from './age-policy.js'

const approvedShape = {
  uiPolicy: {
    density: 'airy',
    maxChoicesPerStep: 4,
    largeControls: true,
    oneActivityPerScreen: true,
    showDetailedProgress: false,
  },
  copyPolicy: {
    instructionLength: 'short',
    readingSupport: true,
    errorTone: 'gentle',
    actionLabels: { nextQuestion: 'Tiếp theo' },
    competencyLevelLabels: {
      no_data: 'Chưa có dữ liệu',
      not_met: 'Cần thêm trải nghiệm',
      developing: 'Đang phát triển',
      achieved: 'Đã thể hiện tốt',
    },
  },
  permissionPolicy: {
    canDownloadLessons: false,
    canShareCredentials: false,
    canEditProfile: false,
    canRequestReschedule: false,
    requireParentConfirmationFor: ['credential_share'],
  },
  assessmentPolicy: {
    allowedQuestionTypes: ['single_choice', 'ordering'],
    maxShortTextLength: 200,
    preferOneQuestionPerScreen: true,
  },
} as const

describe('age experience policy', () => {
  it('accepts only the complete customer configuration contract', () => {
    expect(ageExperienceConfigurationSchema.parse(approvedShape)).toEqual(
      approvedShape,
    )
    expect(() =>
      ageExperienceConfigurationSchema.parse({
        ...approvedShape,
        permissionPolicy: {},
      }),
    ).toThrow()
  })

  it('fails closed for draft and malformed published records', () => {
    const record = {
      status: 'draft',
      uiPolicyJson: approvedShape.uiPolicy,
      copyPolicyJson: approvedShape.copyPolicy,
      permissionPolicyJson: approvedShape.permissionPolicy,
      assessmentPolicyJson: approvedShape.assessmentPolicy,
    }
    expect(parsePublishedAgePolicy(record)).toBeNull()
    expect(
      parsePublishedAgePolicy({
        ...record,
        status: 'published',
        permissionPolicyJson: {},
      }),
    ).toBeNull()
  })

  it('returns the validated policy only after publication', () => {
    expect(
      parsePublishedAgePolicy({
        status: 'published',
        uiPolicyJson: approvedShape.uiPolicy,
        copyPolicyJson: approvedShape.copyPolicy,
        permissionPolicyJson: approvedShape.permissionPolicy,
        assessmentPolicyJson: approvedShape.assessmentPolicy,
      }),
    ).toEqual(approvedShape)
  })
})
