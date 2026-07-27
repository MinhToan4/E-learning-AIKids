import { z } from 'zod'
import type {
  AssessmentQuestionType,
  AssessmentResponseValue,
  QuestionGradingKey,
} from '@aikids/domain'

export const questionTypeSchema = z.enum([
  'single_choice',
  'multiple_choice',
  'drag_drop',
  'short_text',
  'ordering',
  'artifact',
])

const idSchema = z.string().min(1).max(80).regex(/^[A-Za-z0-9._-]+$/)
const textSchema = z.string().min(1).max(2_000)
const optionSchema = z.object({ id: idSchema, text: z.string().min(1).max(500) })
const baseStemSchema = z.object({ stem: textSchema })
const choicePromptSchema = baseStemSchema.extend({
  options: z.array(optionSchema).min(2).max(20),
})
const orderingPromptSchema = baseStemSchema.extend({
  items: z.array(optionSchema).min(2).max(20),
})
const dragPromptSchema = baseStemSchema.extend({
  items: z.array(optionSchema).min(1).max(30),
  targets: z.array(optionSchema).min(1).max(20),
})
const shortPromptSchema = baseStemSchema.extend({
  minLength: z.number().int().min(0).max(5_000).default(1),
  maxLength: z.number().int().min(1).max(5_000).default(1_000),
})
const artifactPromptSchema = baseStemSchema.extend({
  allowedSources: z
    .array(z.enum(['project', 'asset', 'upload']))
    .min(1)
    .max(3),
})
const rubricSchema = z.object({
  criteria: z
    .array(
      z.object({
        id: idSchema,
        label: z.string().min(1).max(200),
        maxPoints: z.number().positive().max(100),
      }),
    )
    .max(20)
    .default([]),
})

function uniqueIds(rows: Array<{ id: string }>, label: string) {
  if (new Set(rows.map((row) => row.id)).size !== rows.length) {
    throw new Error(`${label} ids must be unique`)
  }
}

export function parseQuestionAuthoring(input: {
  type: AssessmentQuestionType
  prompt: unknown
  answerKey: unknown
  rubric: unknown
}): {
  prompt: Record<string, unknown>
  answerKey: QuestionGradingKey
  rubric: Record<string, unknown>
} {
  const rubric = rubricSchema.parse(input.rubric)
  if (input.type === 'single_choice' || input.type === 'multiple_choice') {
    const prompt = choicePromptSchema.parse(input.prompt)
    uniqueIds(prompt.options, 'Option')
    const answer = z
      .object({ correctOptionIds: z.array(idSchema).min(1).max(20) })
      .parse(input.answerKey)
    const optionIds = new Set(prompt.options.map((option) => option.id))
    if (
      new Set(answer.correctOptionIds).size !== answer.correctOptionIds.length ||
      answer.correctOptionIds.some((id) => !optionIds.has(id)) ||
      (input.type === 'single_choice' && answer.correctOptionIds.length !== 1)
    ) {
      throw new Error('Invalid answer key for published question options')
    }
    return {
      prompt,
      answerKey: { type: input.type, ...answer },
      rubric,
    }
  }
  if (input.type === 'ordering') {
    const prompt = orderingPromptSchema.parse(input.prompt)
    uniqueIds(prompt.items, 'Item')
    const answer = z.object({ correctOrder: z.array(idSchema).min(2).max(20) }).parse(input.answerKey)
    const itemIds = prompt.items.map((item) => item.id)
    if (
      answer.correctOrder.length !== itemIds.length ||
      new Set(answer.correctOrder).size !== answer.correctOrder.length ||
      answer.correctOrder.some((id) => !itemIds.includes(id))
    ) {
      throw new Error('Invalid answer key for published question items')
    }
    return { prompt, answerKey: { type: input.type, ...answer }, rubric }
  }
  if (input.type === 'drag_drop') {
    const prompt = dragPromptSchema.parse(input.prompt)
    uniqueIds(prompt.items, 'Item')
    uniqueIds(prompt.targets, 'Target')
    const answer = z.record(idSchema, idSchema).parse(input.answerKey)
    const itemIds = new Set(prompt.items.map((item) => item.id))
    const targetIds = new Set(prompt.targets.map((target) => target.id))
    if (
      Object.keys(answer).length !== itemIds.size ||
      Object.entries(answer).some(
        ([itemId, targetId]) => !itemIds.has(itemId) || !targetIds.has(targetId),
      )
    ) {
      throw new Error('Invalid answer key for published drag/drop question')
    }
    return {
      prompt,
      answerKey: { type: input.type, correctPlacements: answer },
      rubric,
    }
  }
  if (input.type === 'short_text') {
    const prompt = shortPromptSchema
      .refine((value) => value.minLength <= value.maxLength)
      .parse(input.prompt)
    if (rubric.criteria.length === 0) {
      throw new Error('Manual-review questions require a rubric')
    }
    return { prompt, answerKey: { type: input.type }, rubric }
  }
  const prompt = artifactPromptSchema.parse(input.prompt)
  if (rubric.criteria.length === 0) {
    throw new Error('Manual-review questions require a rubric')
  }
  return { prompt, answerKey: { type: input.type }, rubric }
}

export function publicQuestion(question: {
  id: string
  type: string
  promptJson: unknown
  answerKeyJson: unknown
  rubricJson: unknown
  explanation: string | null
}) {
  return {
    id: question.id,
    type: questionTypeSchema.parse(question.type),
    prompt: question.promptJson,
  }
}

export function parseStudentResponse(
  type: AssessmentQuestionType,
  promptValue: unknown,
  responseValue: unknown,
): AssessmentResponseValue {
  if (type === 'single_choice' || type === 'multiple_choice') {
    const prompt = choicePromptSchema.parse(promptValue)
    const response = z
      .object({
        selectedOptionIds: z.array(idSchema).min(1).max(20),
      })
      .parse(responseValue)
    const allowed = new Set(prompt.options.map((option) => option.id))
    if (
      response.selectedOptionIds.some((id) => !allowed.has(id)) ||
      new Set(response.selectedOptionIds).size !==
        response.selectedOptionIds.length ||
      (type === 'single_choice' && response.selectedOptionIds.length !== 1)
    ) {
      throw new Error('Response id is not part of the published question')
    }
    return response
  }
  if (type === 'ordering') {
    const prompt = orderingPromptSchema.parse(promptValue)
    const response = z
      .object({ orderedItemIds: z.array(idSchema).min(2).max(20) })
      .parse(responseValue)
    const expected = new Set(prompt.items.map((item) => item.id))
    if (
      response.orderedItemIds.length !== expected.size ||
      new Set(response.orderedItemIds).size !== expected.size ||
      response.orderedItemIds.some((id) => !expected.has(id))
    ) {
      throw new Error('Response id is not part of the published question')
    }
    return response
  }
  if (type === 'drag_drop') {
    const prompt = dragPromptSchema.parse(promptValue)
    const response = z.object({ placements: z.record(idSchema, idSchema) }).parse(responseValue)
    const itemIds = new Set(prompt.items.map((item) => item.id))
    const targetIds = new Set(prompt.targets.map((target) => target.id))
    if (
      Object.keys(response.placements).length !== itemIds.size ||
      Object.entries(response.placements).some(
        ([itemId, targetId]) => !itemIds.has(itemId) || !targetIds.has(targetId),
      )
    ) {
      throw new Error('Response id is not part of the published question')
    }
    return response
  }
  if (type === 'short_text') {
    const prompt = shortPromptSchema.parse(promptValue)
    return z
      .object({ text: z.string().min(prompt.minLength).max(prompt.maxLength) })
      .parse(responseValue)
  }
  const prompt = artifactPromptSchema.parse(promptValue)
  const response = z
    .object({
      sourceType: z.enum(['project', 'asset', 'upload']),
      sourceId: z.string().uuid(),
    })
    .parse(responseValue)
  if (!prompt.allowedSources.includes(response.sourceType)) {
    throw new Error('Artifact source is not allowed by the published question')
  }
  return response
}

export function studentTextMaxLength(
  type: AssessmentQuestionType,
  promptValue: unknown,
): number | undefined {
  if (type !== 'short_text') return undefined
  return shortPromptSchema.parse(promptValue).maxLength
}
