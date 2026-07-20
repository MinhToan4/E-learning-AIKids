import { createTransport, type Transporter } from 'nodemailer'
import { env } from '../../config/env.js'

/**
 * Email service — Gmail SMTP via App Password.
 * In dev mode (no GMAIL_APP_PASSWORD), logs to console instead of sending.
 */
class EmailService {
  private transporter: Transporter | null = null
  private readonly isDev: boolean

  constructor() {
    this.isDev = !env.gmailAppPassword || env.nodeEnv === 'test'

    if (!this.isDev) {
      this.transporter = createTransport({
        service: 'gmail',
        auth: {
          user: env.gmailUser,
          pass: env.gmailAppPassword,
        },
      })
    }
  }

  async sendMail(to: string, subject: string, html: string): Promise<void> {
    if (this.isDev || !this.transporter) {
      console.log(`[Email Dev] To: ${this.maskEmail(to)}`)
      console.log(`[Email Dev] Subject: ${subject}`)
      console.log(`[Email Dev] HTML length: ${html.length} chars`)
      return
    }

    try {
      await this.transporter.sendMail({
        from: `"AI Kids Academy" <${env.gmailUser}>`,
        to,
        subject,
        html,
      })
      console.log(`[Email] Sent to ${this.maskEmail(to)}: ${subject}`)
    } catch (err) {
      console.error(`[Email] Failed to send to ${this.maskEmail(to)}:`, (err as Error).message)
      throw err
    }
  }

  async sendWelcomeEmail(email: string, nickname: string): Promise<void> {
    const subject = 'Chào mừng bạn đến AI Kids Creator Academy! 🌟'
    const html = getWelcomeTemplate(nickname)
    await this.sendMail(email, subject, html)
  }

  async sendPasswordResetEmail(email: string, resetUrl: string): Promise<void> {
    const subject = 'Đặt lại mật khẩu — AI Kids Creator Academy'
    const html = getPasswordResetTemplate(resetUrl)
    await this.sendMail(email, subject, html)
  }

  async sendParentNotification(
    parentEmail: string,
    childNickname: string,
    event: string,
  ): Promise<void> {
    const subject = `${childNickname} ${event} — AI Kids Academy`
    const html = getParentNotifyTemplate(childNickname, event)
    await this.sendMail(parentEmail, subject, html)
  }

  /** Mask email for logging — GDPR friendly */
  private maskEmail(email: string): string {
    const [local, domain] = email.split('@')
    if (!local || !domain) return '***'
    const masked = local.length <= 2 ? '*'.repeat(local.length) : local[0] + '***' + local[local.length - 1]
    return `${masked}@${domain}`
  }
}

// Singleton
export const emailService = new EmailService()

// ─── Templates ───────────────────────────────────────────────

const BRAND_COLOR = '#6d5efc'
const BG_COLOR = '#f7f5ff'

function baseTemplate(content: string, footer: string): string {
  return `
<div style="font-family: 'Nunito', 'Segoe UI', Arial, sans-serif; background-color: ${BG_COLOR}; padding: 40px 0; width: 100%; margin: 0;">
  <table align="center" border="0" cellpadding="0" cellspacing="0" width="560" style="background-color: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 8px 24px rgba(109,94,252,0.12); border-collapse: collapse;">
    <tr>
      <td align="center" style="padding: 36px 0 16px 0;">
        <div style="font-size: 32px; font-weight: 800; color: ${BRAND_COLOR};">🌟 AI Kids Academy</div>
      </td>
    </tr>
    <tr>
      <td style="padding: 16px 40px 36px 40px;">
        ${content}
      </td>
    </tr>
    <tr>
      <td style="background-color: #f3f0ff; padding: 20px 40px; text-align: center;">
        <p style="color: #8b85ad; font-size: 12px; margin: 0;">
          © ${new Date().getFullYear()} AI Kids Creator Academy
        </p>
        <p style="color: #a8a3c2; font-size: 12px; margin: 6px 0 0 0;">
          ${footer}
        </p>
      </td>
    </tr>
  </table>
</div>`
}

function getWelcomeTemplate(nickname: string): string {
  const content = `
    <h1 style="color: #2d2548; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
      Chào mừng ${nickname}! 🎉
    </h1>
    <p style="color: #5a5478; font-size: 16px; line-height: 26px; margin: 0 0 24px 0; text-align: center;">
      Tài khoản của bạn đã được tạo thành công trên AI Kids Creator Academy. 
      Bạn có thể bắt đầu tạo tài khoản cho con và theo dõi hành trình học tập sáng tạo AI.
    </p>
    <div style="text-align: center;">
      <a href="${env.appUrl}" style="background: linear-gradient(135deg, ${BRAND_COLOR}, #8b7aff); border-radius: 12px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 700; padding: 14px 36px; text-decoration: none;">
        Bắt đầu ngay →
      </a>
    </div>`
  return baseTemplate(content, 'Email này được gửi vì bạn vừa đăng ký tài khoản.')
}

function getPasswordResetTemplate(resetUrl: string): string {
  const content = `
    <h1 style="color: #2d2548; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
      Đặt lại mật khẩu 🔑
    </h1>
    <p style="color: #5a5478; font-size: 16px; line-height: 26px; margin: 0 0 24px 0; text-align: center;">
      Bạn vừa yêu cầu đặt lại mật khẩu. Nhấn nút bên dưới để tạo mật khẩu mới. 
      Link này hết hạn sau <strong>1 giờ</strong>.
    </p>
    <div style="text-align: center;">
      <a href="${resetUrl}" style="background: linear-gradient(135deg, ${BRAND_COLOR}, #8b7aff); border-radius: 12px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 700; padding: 14px 36px; text-decoration: none;">
        Đặt lại mật khẩu
      </a>
    </div>
    <p style="color: #a8a3c2; font-size: 13px; margin: 24px 0 0 0; text-align: center; word-break: break-all;">
      Nếu nút không hoạt động: <a href="${resetUrl}" style="color: ${BRAND_COLOR};">${resetUrl}</a>
    </p>`
  return baseTemplate(content, 'Nếu bạn không yêu cầu đặt lại mật khẩu, hãy bỏ qua email này.')
}

function getParentNotifyTemplate(childNickname: string, event: string): string {
  const content = `
    <h1 style="color: #2d2548; font-size: 22px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
      Tin tức từ ${childNickname}! 🎊
    </h1>
    <p style="color: #5a5478; font-size: 16px; line-height: 26px; margin: 0 0 24px 0; text-align: center;">
      ${event}
    </p>
    <div style="text-align: center;">
      <a href="${env.appUrl}/parent" style="background: linear-gradient(135deg, ${BRAND_COLOR}, #8b7aff); border-radius: 12px; color: #ffffff; display: inline-block; font-size: 16px; font-weight: 700; padding: 14px 36px; text-decoration: none;">
        Xem chi tiết →
      </a>
    </div>`
  return baseTemplate(content, 'Email thông báo tự động từ AI Kids Creator Academy.')
}
