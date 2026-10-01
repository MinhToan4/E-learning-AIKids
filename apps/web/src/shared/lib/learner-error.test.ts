import { describe, expect, it } from 'vitest'
import { learnerFriendlyError } from './learner-error'

describe('learnerFriendlyError', () => {
  it('converts Prisma database errors into warm server rest explanation', () => {
    const prismaErr = new Error('Prisma.findUnique() invocation failed: error in connector: database server closed')
    const result = learnerFriendlyError(prismaErr)
    expect(result).toBe('Máy chủ đang nghỉ ngơi một chút. Dữ liệu và số sao của con vẫn được giữ an toàn tuyệt đối!')
  })

  it('converts UUID / P2023 errors into warm server rest explanation', () => {
    const uuidErr = 'Inconsistent column data: P2023 malformed uuid string'
    const result = learnerFriendlyError(uuidErr)
    expect(result).toBe('Máy chủ đang nghỉ ngơi một chút. Dữ liệu và số sao của con vẫn được giữ an toàn tuyệt đối!')
  })

  it('converts network and fetch failures into gentle network check message', () => {
    const netErr = new Error('TypeError: Failed to fetch')
    const result = learnerFriendlyError(netErr)
    expect(result).toBe('Chưa có kết nối mạng ổn định. Con hãy kiểm tra lại Wi-Fi hoặc nhờ Ba Mẹ hỗ trợ nhé!')
  })

  it('converts offline status into gentle network check message', () => {
    const result = learnerFriendlyError('Device is currently offline')
    expect(result).toBe('Chưa có kết nối mạng ổn định. Con hãy kiểm tra lại Wi-Fi hoặc nhờ Ba Mẹ hỗ trợ nhé!')
  })

  it('converts locked/prerequisite errors into encouragement to complete previous stations', () => {
    const lockErr = new Error('Course station is locked: prerequisites missing')
    const result = learnerFriendlyError(lockErr)
    expect(result).toBe('Trạm này đang chờ mở khóa! Con hãy hoàn thành các trạm trước trên bản đồ để tiếp tục nhé.')
  })

  it('converts 401 unauthorized errors into session refresh advice', () => {
    const authErr = new Error('401 unauthorized: jwt expired')
    const result = learnerFriendlyError(authErr)
    expect(result).toBe('Phiên học của con cần được xác nhận lại. Con thử quay về Trang Chủ nhé!')
  })

  it('preserves clean friendly Vietnamese custom messages', () => {
    const customMsg = 'Bé hãy thử chọn một đáp án khác nhé!'
    const result = learnerFriendlyError(customMsg)
    expect(result).toBe('Bé hãy thử chọn một đáp án khác nhé!')
  })

  it('returns default fallback when cause is empty or null', () => {
    expect(learnerFriendlyError(null)).toBe('Úi, có chút trục trặc nhỏ rồi. Con thử bấm Thử lại hoặc quay về Trang Chủ nhé!')
    expect(learnerFriendlyError('')).toBe('Úi, có chút trục trặc nhỏ rồi. Con thử bấm Thử lại hoặc quay về Trang Chủ nhé!')
  })
})
