import { createRequire } from 'node:module'
import PDFDocument from 'pdfkit'

const require = createRequire(import.meta.url)
const regularFont = require.resolve(
  '@expo-google-fonts/nunito/400Regular/Nunito_400Regular.ttf',
)
const boldFont = require.resolve(
  '@expo-google-fonts/nunito/700Bold/Nunito_700Bold.ttf',
)

type ReportLayout = {
  title: string
  issuerName: string
  accentColor: string
  footerText: string
  showScores: boolean
  sectionLabels?: Record<string, string>
}

type Snapshot = Record<string, unknown>

function list(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value)
    ? value.filter(
        (item): item is Record<string, unknown> =>
          Boolean(item) && typeof item === 'object' && !Array.isArray(item),
      )
    : []
}

function strings(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : []
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function text(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback
}

function number(value: unknown): number | null {
  return typeof value === 'number' && Number.isFinite(value) ? value : null
}

export async function generateLearningReportPdf(
  snapshot: Snapshot,
  layout: ReportLayout,
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const document = new PDFDocument({
      size: 'A4',
      margins: { top: 54, right: 50, bottom: 58, left: 50 },
      bufferPages: true,
      info: {
        Title: layout.title,
        Author: layout.issuerName,
        Subject: 'Learning progress report',
      },
    })
    const chunks: Buffer[] = []
    document.on('data', (chunk: Buffer) => chunks.push(chunk))
    document.on('error', reject)
    document.on('end', () => resolve(Buffer.concat(chunks)))
    document.registerFont('ReportRegular', regularFont)
    document.registerFont('ReportBold', boldFont)
    document.font('ReportRegular')

    const contentWidth =
      document.page.width -
      document.page.margins.left -
      document.page.margins.right
    const labels = {
      overview: 'Tổng quan tiến độ',
      assessments: 'Kết quả bài đánh giá',
      competency: 'Bản đồ năng lực',
      portfolio: 'Tác phẩm nổi bật',
      feedback: 'Nhận xét của giáo viên',
      strengths: 'Điểm mạnh',
      development: 'Nội dung cần phát triển',
      nextSteps: 'Bước học tiếp theo',
      credentials: 'Chứng nhận và huy hiệu mới',
      ...layout.sectionLabels,
    }

    const ensureSpace = (height: number) => {
      if (
        document.y + height >
        document.page.height - document.page.margins.bottom
      ) {
        document.addPage()
      }
    }
    const section = (title: string) => {
      ensureSpace(52)
      document
        .moveDown(0.7)
        .font('ReportBold')
        .fontSize(15)
        .fillColor(layout.accentColor)
        .text(title)
      document
        .moveTo(document.x, document.y + 4)
        .lineTo(document.x + contentWidth, document.y + 4)
        .lineWidth(1)
        .strokeColor('#e9e5f5')
        .stroke()
        .moveDown(0.8)
        .font('ReportRegular')
        .fillColor('#3f3a56')
    }
    const bullet = (value: string) => {
      ensureSpace(32)
      document
        .font('ReportRegular')
        .fontSize(10.5)
        .fillColor('#3f3a56')
        .text(`• ${value}`, {
          indent: 10,
          paragraphGap: 5,
          lineGap: 2,
        })
    }
    const empty = () => {
      document
        .font('ReportRegular')
        .fontSize(10)
        .fillColor('#817b99')
        .text('Chưa có dữ liệu trong kỳ báo cáo này.', {
          paragraphGap: 6,
        })
    }

    const student = record(snapshot.student)
    const period = record(snapshot.period)
    document
      .roundedRect(
        document.page.margins.left,
        42,
        contentWidth,
        112,
        18,
      )
      .fill(layout.accentColor)
    document
      .font('ReportBold')
      .fontSize(21)
      .fillColor('#ffffff')
      .text(layout.title, document.page.margins.left + 24, 64, {
        width: contentWidth - 48,
      })
      .font('ReportRegular')
      .fontSize(11)
      .text(layout.issuerName, { width: contentWidth - 48 })
      .moveDown(0.65)
      .font('ReportBold')
      .text(text(student.nickname, 'Học viên'), {
        width: contentWidth - 48,
      })
      .font('ReportRegular')
      .fontSize(9.5)
      .text(`${text(period.start).slice(0, 10)} - ${text(period.end).slice(0, 10)}`, {
        width: contentWidth - 48,
      })
    document.y = 174

    const courses = list(snapshot.courses)
    section(labels.overview)
    if (courses.length === 0) empty()
    courses.forEach((course) => {
      ensureSpace(55)
      const completion = number(course.completionPercent) ?? 0
      document
        .font('ReportBold')
        .fontSize(11)
        .fillColor('#332d49')
        .text(text(course.title, 'Khóa học'))
      document
        .font('ReportRegular')
        .fontSize(10)
        .fillColor('#5d5772')
        .text(
          `${number(course.completedLessons) ?? 0}/${number(course.totalLessons) ?? 0} bài - ${completion}% hoàn thành`,
          { paragraphGap: 8 },
        )
    })

    const assessments = list(snapshot.assessments)
    section(labels.assessments)
    if (assessments.length === 0) empty()
    assessments.forEach((attempt) => {
      const assessment = record(attempt.assessment)
      const score = number(attempt.scorePercent)
      bullet(
        `${text(assessment.title, 'Bài đánh giá')} - ${
          score !== null && layout.showScores
            ? `${score}%`
            : text(attempt.status, 'đang xử lý')
        }`,
      )
    })

    const competency = list(snapshot.competency)
    section(labels.competency)
    if (competency.length === 0) empty()
    competency.forEach((item) => {
      const domain = record(item.domain)
      const skill = record(item.skill)
      const score = number(item.scorePercent)
      bullet(
        `${text(domain.name)} / ${text(skill.name)}: ${text(
          item.level,
          'no_data',
        )}${score !== null && layout.showScores ? ` (${score}%)` : ''} - ${
          number(item.evidenceCount) ?? 0
        } bằng chứng`,
      )
    })

    const portfolio = list(snapshot.portfolio)
    section(labels.portfolio)
    if (portfolio.length === 0) empty()
    portfolio.forEach((project) =>
      bullet(`${text(project.title, 'Tác phẩm')} - ${text(project.kind)}`),
    )

    const feedback = list(snapshot.teacherFeedback)
    section(labels.feedback)
    if (feedback.length === 0) empty()
    feedback.forEach((item) => {
      ensureSpace(48)
      const teacher = record(item.teacher)
      document
        .font('ReportRegular')
        .fontSize(10.5)
        .fillColor('#3f3a56')
        .text(text(item.body), { paragraphGap: 3, lineGap: 2 })
        .font('ReportBold')
        .fontSize(9.5)
        .fillColor('#746d8c')
        .text(`- ${text(teacher.nickname, 'Giáo viên')}`, {
          paragraphGap: 9,
        })
    })

    const renderStringSection = (title: string, values: string[]) => {
      section(title)
      if (values.length === 0) empty()
      values.forEach(bullet)
    }
    renderStringSection(labels.strengths, strings(snapshot.strengths))
    renderStringSection(labels.development, strings(snapshot.development))
    renderStringSection(labels.nextSteps, strings(snapshot.nextSteps))

    const credentials = list(snapshot.credentials)
    section(labels.credentials)
    if (credentials.length === 0) empty()
    credentials.forEach((credential) => {
      const course = record(credential.course)
      bullet(
        `${text(credential.name)} - ${text(course.title)} - mã ${text(
          credential.verificationCode,
        )}`,
      )
    })

    const range = document.bufferedPageRange()
    for (let index = range.start; index < range.start + range.count; index += 1) {
      document.switchToPage(index)
      // PDFKit otherwise treats the footer as overflowing the normal content
      // area and silently creates an extra page for each page number.
      const bottomMargin = document.page.margins.bottom
      document.page.margins.bottom = 0
      document
        .font('ReportRegular')
        .fontSize(8.5)
        .fillColor('#8b849f')
        .text(
          `${layout.footerText}  |  ${index + 1}/${range.count}`,
          document.page.margins.left,
          document.page.height - 38,
          { width: contentWidth, align: 'center', lineBreak: false },
        )
      document.page.margins.bottom = bottomMargin
    }
    document.end()
  })
}
