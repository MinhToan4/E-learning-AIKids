import { z } from 'zod'

export const ageUiPolicySchema = z
  .object({
    density: z.enum(['airy', 'balanced', 'detailed']),
    maxChoicesPerStep: z.number().int().min(2).max(20),
    largeControls: z.boolean(),
    oneActivityPerScreen: z.boolean(),
    showDetailedProgress: z.boolean(),
  })
  .strict()

export const ageCopyPolicySchema = z
  .object({
    instructionLength: z.enum(['short', 'balanced', 'detailed']),
    readingSupport: z.boolean(),
    errorTone: z.enum(['gentle', 'neutral']),
    actionLabels: z.record(z.string().min(1).max(80)),
    competencyLevelLabels: z.object({
      no_data: z.string().min(1).max(120),
      not_met: z.string().min(1).max(120),
      developing: z.string().min(1).max(120),
      achieved: z.string().min(1).max(120),
    }),
  })
  .strict()

export const agePermissionPolicySchema = z
  .object({
    canDownloadLessons: z.boolean(),
    canShareCredentials: z.boolean(),
    canEditProfile: z.boolean(),
    canRequestReschedule: z.boolean(),
    requireParentConfirmationFor: z.array(z.string().min(1).max(80)).max(30),
  })
  .strict()

export const ageAssessmentPolicySchema = z
  .object({
    allowedQuestionTypes: z
      .array(
        z.enum([
          'single_choice',
          'multiple_choice',
          'drag_drop',
          'short_text',
          'ordering',
          'artifact',
        ]),
      )
      .min(1)
      .max(6)
      .transform((types) => [...new Set(types)]),
    maxShortTextLength: z.number().int().min(1).max(5_000),
    preferOneQuestionPerScreen: z.boolean(),
  })
  .strict()

export const ageExperienceConfigurationSchema = z.object({
  uiPolicy: ageUiPolicySchema,
  copyPolicy: ageCopyPolicySchema,
  permissionPolicy: agePermissionPolicySchema,
  assessmentPolicy: ageAssessmentPolicySchema,
})

export type AgeExperienceConfiguration = z.infer<
  typeof ageExperienceConfigurationSchema
>

export function parsePublishedAgePolicy(policy: {
  status: string
  uiPolicyJson: unknown
  copyPolicyJson: unknown
  permissionPolicyJson: unknown
  assessmentPolicyJson: unknown
}) {
  if (policy.status !== 'published') return null
  const parsed = ageExperienceConfigurationSchema.safeParse({
    uiPolicy: policy.uiPolicyJson,
    copyPolicy: policy.copyPolicyJson,
    permissionPolicy: policy.permissionPolicyJson,
    assessmentPolicy: policy.assessmentPolicyJson,
  })
  return parsed.success ? parsed.data : null
}
