import { createRequire } from 'node:module'
import PDFDocument from 'pdfkit'

const require = createRequire(import.meta.url)
const regularFont = require.resolve(
  '@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf',
)
const boldFont = require.resolve(
  '@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf',
)

type CredentialLayout = {
  title: string
  issuerName: string
  accentColor: string
  bodyTemplate: string
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown, fallback = '') {
  return typeof value === 'string' ? value : fallback
}

function number(value: unknown, fallback = 0) {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function interpolate(template: string, values: Record<string, string>) {
  return template.replace(/\{\{([a-zA-Z]+)\}\}/g, (match, key: string) =>
    Object.hasOwn(values, key) ? values[key]! : match,
  )
}

export async function generateCredentialPdf(
  payload: Record<string, unknown>,
  verificationCode: string,
  layout: CredentialLayout,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: 'A4',
      layout: 'landscape',
      margins: { top: 48, right: 56, bottom: 48, left: 56 },
      info: {
        Title: layout.title,
        Author: layout.issuerName,
        Subject: 'Learning credential',
      },
    })
    const chunks: Buffer[] = []
    document.on('data', (chunk: Buffer) => chunks.push(chunk))
    document.on('error', reject)
    document.on('end', () => resolve(Buffer.concat(chunks)))
    document.registerFont('CredentialRegular', regularFont)
    document.registerFont('CredentialBold', boldFont)

    const learner = record(payload.learner)
    const course = record(payload.course)
    const eligibility = record(payload.eligibility)
    const issuedAt = text(payload.issuedAt)
    const completedAt = text(eligibility.completedAt)
    const pageWidth = document.page.width
    const pageHeight = document.page.height

    document
      .lineWidth(6)
      .strokeColor(layout.accentColor)
      .roundedRect(28, 28, pageWidth - 56, pageHeight - 56, 24)
      .stroke()
      .lineWidth(1)
      .roundedRect(40, 40, pageWidth - 80, pageHeight - 80, 18)
      .strokeColor('#ded8ef')
      .stroke()

    document
      .font('CredentialBold')
      .fillColor(layout.accentColor)
      .fontSize(13)
      .text(layout.issuerName, 70, 82, { align: 'center', width: pageWidth - 140 })
      .moveDown(1.1)
      .fontSize(30)
      .text(layout.title, { align: 'center', width: pageWidth - 140 })
      .moveDown(0.7)
      .font('CredentialRegular')
      .fillColor('#6d6680')
      .fontSize(12)
      .text('Trao cho', { align: 'center', width: pageWidth - 140 })
      .moveDown(0.25)
      .font('CredentialBold')
      .fillColor('#2f2940')
      .fontSize(25)
      .text(text(learner.nickname, 'Học viên'), {
        align: 'center',
        width: pageWidth - 140,
      })
      .moveDown(0.45)
      .font('CredentialRegular')
      .fillColor('#4c465c')
      .fontSize(13)
      .text(
        interpolate(layout.bodyTemplate, {
          learnerName: text(learner.nickname, 'Học viên'),
          courseName: text(course.title, 'Khóa học'),
          level: String(number(learner.level, 1)),
          completionDate: completedAt.slice(0, 10),
          issueDate: issuedAt.slice(0, 10),
        }),
        { align: 'center', width: pageWidth - 140, lineGap: 4 },
      )

    document
      .font('CredentialRegular')
      .fontSize(9.5)
      .fillColor('#756e89')
      .text(
        `Cấp độ: ${number(learner.level, 1)}   ·   Hoàn thành: ${
          completedAt.slice(0, 10) || '—'
        }   ·   Ngày cấp: ${issuedAt.slice(0, 10)}`,
        70,
        pageHeight - 116,
        { align: 'center', width: pageWidth - 140 },
      )
      .font('CredentialBold')
      .fillColor('#40394f')
      .text(`Mã chứng nhận: ${verificationCode}`, {
        align: 'center',
        width: pageWidth - 140,
      })
    document.end()
  })
}
