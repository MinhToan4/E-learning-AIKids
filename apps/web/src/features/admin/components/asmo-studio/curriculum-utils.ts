import type { AsmoCurriculumWeekItem } from './types'

export function generatePedagogicalTipsAndSolution(week: {
  topic: string
  title: string
  keyCompetencies: string[]
  grade: number
  subject: string
}) {
  const titleLower = week.title.toLowerCase()

  let quote = ''
  let storyAdvice = ''
  let formulaLatex = '$x = \\frac{a + b}{2}$'
  let pitfall = ''

  if (week.subject === 'math') {
    if (
      titleLower.includes('khối') ||
      titleLower.includes('lập phương') ||
      titleLower.includes('hình học') ||
      titleLower.includes('diện tích') ||
      titleLower.includes('chu vi')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Nhìn hình vẽ kỹ, chớ vội tính ngay; đếm từng góc cạnh, lời giải mở ra tay!'
      storyAdvice = `Chiến thuật Mèo Mee: Với dạng toán hình không gian và chu vi diện tích lớp ${week.grade}, hãy phân rã hình phức tạp thành các khối đơn vị cơ bản. Đánh số từng tầng từ dưới lên để không đếm trùng!`
      formulaLatex = week.grade <= 5 ? '$S = a \\times b$' : '$V = a \\times b \\times c$'
      pitfall = 'Bỏ sót các khối hộp hoặc mặt phẳng bị che khuất ở tầng đáy và mặt sau.'
    } else if (
      titleLower.includes('đồng hồ') ||
      titleLower.includes('thời gian') ||
      titleLower.includes('góc')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Kim giờ kim phút cùng nhau xoay tròn; mỗi phút trôi qua góc lệch càng thêm ngon!'
      storyAdvice = 'Chiến thuật Mèo Mee: Trong 1 giờ (60 phút), kim phút quay $360^\\circ$ (mỗi phút $6^\\circ$), kim giờ quay $30^\\circ$ (mỗi phút $0.5^\\circ$). Đừng quên tính độ lệch kim giờ khi kim phút di chuyển!'
      formulaLatex = '$\\Delta \\theta = |30H - 5.5M|^\\circ$'
      pitfall = 'Quên cộng góc dịch chuyển của kim giờ khi kim phút đã chạy qua số 12.'
    } else if (
      titleLower.includes('phân số') ||
      titleLower.includes('tỉ số') ||
      titleLower.includes('phần trăm')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Quy đồng mẫu số nhớ kĩ không quên; tử mẫu đồng lòng, tính toán vững bền!'
      storyAdvice = 'Chiến thuật Mèo Mee: Luôn rút gọn phân số về tối giản trước khi nhân chia. Khi so sánh hai phân số, thử dùng phần bù hoặc nhân chéo thay vì quy đồng mẫu số lớn.'
      formulaLatex = '$\\frac{a}{b} + \\frac{c}{d} = \\frac{ad + bc}{bd}$'
      pitfall = 'Cộng trực tiếp cả tử với tử và mẫu với mẫu khi chưa quy đồng.'
    } else if (
      titleLower.includes('que diêm') ||
      titleLower.includes('quy luật') ||
      titleLower.includes('dãy số') ||
      titleLower.includes('logic')
    ) {
      quote = '🐱 Mèo Mee mách bạn: Đổi chỗ que diêm, tìm ra quy luật; tư duy sáng tạo, lời giải bật ra ngay!'
      storyAdvice = 'Chiến thuật Mèo Mee: Với dãy số quy luật, tính hiệu giữa hai số liên tiếp $\\Delta = u_{n+1} - u_n$. Nếu hiệu không đổi là cấp số cộng, nếu hiệu tăng đều là dãy số cấp 2!'
      formulaLatex = '$u_n = u_1 + (n - 1)d$'
      pitfall = 'Vội vã kết luận quy luật chỉ qua 2 phần tử đầu tiên mà không thử lại với phần tử thứ 3 và 4.'
    } else {
      quote = '🐱 Mèo Mee mách bạn: Đọc kỹ đề bài, gạch chân dữ kiện; bình tĩnh tính toán, vươn tầm chuyên gia Olympic!'
      storyAdvice = `Chiến thuật Mèo Mee: Đề thi ASMO dạng "${week.title}" đòi hỏi phân loại giả thiết. Hãy lập bảng tóm tắt đại lượng đã biết và đại lượng cần tìm trước khi bắt tay làm bài.`
      formulaLatex = '$A = \\sum_{i=1}^{n} x_i$'
      pitfall = 'Nhầm lẫn giữa các đơn vị tính và không kiểm tra lại tính hợp lý của kết quả số học.'
    }
  } else if (week.subject === 'science') {
    quote = '🐱 Mèo Mee mách bạn: Quan sát thiên nhiên, đặt câu hỏi đúng; thực nghiệm chứng minh, kiến thức nở hoa!'
    storyAdvice = `Chiến thuật Mèo Mee: Trong chuyên đề Khoa học "${week.title}", hãy liên hệ hiện tượng thực tế với các định luật vật lý/sinh học cốt lõi. Chú ý các điều kiện thí nghiệm chuẩn.`
    formulaLatex = '$F = m \\times a$'
    pitfall = 'Nhầm lẫn giữa nguyên nhân và kết quả khi phân tích biểu đồ thí nghiệm sinh thái.'
  } else {
    quote = '🐱 Mèo Mee mách bạn: Bắt từ then chốt, đoán nghĩa theo câu; tự tin phản xạ, tiếng Anh cực siêu!'
    storyAdvice = `Chiến thuật Mèo Mee: Trong phần thi Tiếng Anh "${week.title}", hãy đọc lướt câu hỏi trước để xác định từ khóa (Keywords), sau đó quét nhanh bài đọc (Scanning) để tìm vị trí chứa đáp án.`
    formulaLatex = '$\\text{Subject} + \\text{Verb} + \\text{Object}$'
    pitfall = 'Dịch từng từ theo nghĩa đen (word-by-word) thay vì hiểu theo cụm thành ngữ hoặc ngữ cảnh tổng thể.'
  }

  const solutionSteps = [
    `Bước 1 (Phân tích giả thiết): Đọc kỹ yêu cầu bài toán "${week.title}". Xác định các đại lượng đã cho trong chủ đề ${week.topic} và phân tích điều kiện ràng buộc cốt lõi.`,
    `Bước 2 (Mô hình hóa & Công thức KaTeX): Thiết lập mô hình giải toán và áp dụng công thức tương thích: ${formulaLatex}. Rút gọn các biểu thức phụ để đơn giản hóa quá trình tính toán.`,
    `Bước 3 (Tính toán chi tiết & Kết luận): Thực hiện các phép tính số học cụ thể theo các năng lực trọng tâm: ${week.keyCompetencies.join(', ')}. Thử lại đáp án vào đề bài để đảm bảo độ chính xác 100%.`,
  ]

  return {
    quote,
    storyAdvice,
    solutionSteps,
    commonPitfall: pitfall,
  }
}

export function validateCurriculumJson(jsonText: string): {
  isValid: boolean
  error?: string
  data?: AsmoCurriculumWeekItem[]
} {
  try {
    const parsed = JSON.parse(jsonText)
    if (!Array.isArray(parsed)) {
      return {
        isValid: false,
        error: 'Định dạng dữ liệu không hợp lệ: JSON phải là một mảng danh sách các tuần học (Array).',
      }
    }

    if (parsed.length === 0) {
      return {
        isValid: false,
        error: 'Mảng dữ liệu JSON không được để trống.',
      }
    }

    const validatedList: AsmoCurriculumWeekItem[] = []

    for (let i = 0; i < parsed.length; i++) {
      const item = parsed[i]
      const rowIdx = i + 1

      if (typeof item !== 'object' || item === null) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} không phải là một đối tượng (object) hợp lệ.`,
        }
      }

      if (typeof item.week !== 'number') {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} thiếu hoặc sai kiểu trường 'week' (bắt buộc là số nguyên, ví dụ: 1, 2, 3).`,
        }
      }

      if (!['math', 'science', 'english'].includes(item.subject)) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} trường 'subject' không hợp lệ. Phải là một trong: 'math', 'science', 'english'.`,
        }
      }

      if (typeof item.grade !== 'number' || item.grade < 1 || item.grade > 12) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} trường 'grade' không hợp lệ. Phải là số nguyên từ 1 đến 12.`,
        }
      }

      if (typeof item.title !== 'string' || item.title.trim().length === 0) {
        return {
          isValid: false,
          error: `Mục thứ #${rowIdx} thiếu trường 'title' (tiêu đề tuần học không được để trống).`,
        }
      }

      const keyCompetencies = Array.isArray(item.keyCompetencies)
        ? item.keyCompetencies.filter((c: unknown) => typeof c === 'string')
        : ['Tư duy logic']

      validatedList.push({
        week: item.week,
        subject: item.subject,
        grade: item.grade,
        topic: item.topic || `ASMO-${item.subject.toUpperCase()}-G${item.grade}-W${item.week}`,
        title: item.title,
        summary: item.summary || `Chuyên đề tuần ${item.week}: ${item.title}`,
        keyCompetencies: keyCompetencies.length > 0 ? keyCompetencies : ['Tư duy logic'],
        visualTemplate: item.visualTemplate,
        sampleQuestionIds: Array.isArray(item.sampleQuestionIds) ? item.sampleQuestionIds : [],
        meeTip: item.meeTip && typeof item.meeTip === 'object' ? item.meeTip : undefined,
        solutionSteps: Array.isArray(item.solutionSteps) ? item.solutionSteps : undefined,
        commonPitfall: typeof item.commonPitfall === 'string' ? item.commonPitfall : undefined,
      })
    }

    return {
      isValid: true,
      data: validatedList,
    }
  } catch (err: unknown) {
    return {
      isValid: false,
      error: `Lỗi cú pháp JSON: ${err instanceof Error ? err.message : String(err)}`,
    }
  }
}
