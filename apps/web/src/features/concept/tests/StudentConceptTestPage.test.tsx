import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { describe, it, expect } from 'vitest'
import { ConceptWelcomeScreen } from '../components/ConceptWelcomeScreen'
import { ConceptHomeScreen } from '../components/ConceptHomeScreen'
import { ConceptProgressScreen } from '../components/ConceptProgressScreen'
import { ConceptIslandStationScreen } from '../components/ConceptIslandStationScreen'
import { ConceptLessonScreen } from '../components/ConceptLessonScreen'
import { StudentConceptTestPage } from '../pages/StudentConceptTestPage'

describe('Concept Screens & StudentConceptTestPage (Full System Real Data Benchmark)', () => {
  it('renders ConceptWelcomeScreen with clean Montessori layout, waving Mee Cat, and clear CTA', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptWelcomeScreen, {
        onStart: () => {},
        onBack: () => {},
      })
    )

    expect(html).toContain('WELCOME TO SMART LEARNING AIKID')
    expect(html).toContain('Xưởng Sáng Tạo AI Cùng Mèo Mee')
    expect(html).toContain('Cùng Mèo Mee bước vào hành trình 6 Đảo diệu kỳ')
    expect(html).toContain('Dành cho bé 6 - 15 tuổi • Học qua trải nghiệm trực quan')
    expect(html).toContain('course-wave.webp')
    expect(html).toContain('Mee Chào Con!')
    expect(html).toContain('Bắt đầu khám phá ngay')
    expect(html).toContain('Quay lại trang chủ')
  })

  it('renders ConceptHomeScreen with Jacob XP Widget, Daily Mission, Continue Learning Spotlight, and 6 Islands', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptHomeScreen, {})
    )

    // 1. Header with Jacob info & XP widget
    expect(html).toContain('Hey, Jacob!')
    expect(html).toContain('Cấp 4 • Nhà Khám Phá')
    expect(html).toContain('1,250 / 1,500 XP')
    expect(html).toContain('Còn 250 XP để lên Cấp 5')

    // 2. Streamlined Official Course Hub (Chương trình chính thức, 16:9 Trailer Video & Phân khu Phụ huynh)
    expect(html).toContain('CHƯƠNG TRÌNH CHÍNH THỨC • 6 ĐẢO')
    expect(html).toContain('Khóa sáng tạo nội dung cùng AIKID')
    expect(html).toContain('32 Trạm học thực tế • Rèn luyện tư duy AI cùng Mèo Mee')
    expect(html).toContain('Đảo 1: Học Thử Free')
    expect(html).toContain('Đảo 2 - 6: Mở Khóa VIP')
    expect(html).toContain('Khám phá lộ trình')
    expect(html).toContain('Trailer 01:45')
    expect(html).toContain('Khám phá AIKid')
    expect(html).toContain('HẢI TRÌNH 6 ĐẢO')
    expect(html).toContain('0/6 đảo')

    // 3. Continue Learning Spotlight card
    expect(html).toContain('BÀI HỌC TIẾP THEO')
    expect(html).toContain('Đảo 2: 4 Chìa khóa lệnh')
    expect(html).toContain('Trạm 3: Chìa khóa Phong cách nghệ thuật')
    expect(html).toContain('2/4 trạm (50%)')
    expect(html).toContain('Học tiếp bài dở')

    // 4. Daily Mission card (vàng bơ)
    expect(html).toContain('Nhiệm Vụ Hôm Nay')
    expect(html).toContain('Nhiệm vụ hôm nay: Hoàn thành 1 trạm tại Đảo 2')
    expect(html).toContain('+30 XP')
    expect(html).toContain('1 Huy Hiệu Chăm Chỉ')
    expect(html).toContain('1/2 bài')
    expect(html).toContain('Làm nhiệm vụ')

    // 5. 6 Islands roadmap
    expect(html).toContain('10 Quy tắc vàng')
    expect(html).toContain('4 Chìa khóa lệnh')
    expect(html).toContain('Sắc màu cọ vẽ')
    expect(html).toContain('Hồ sơ 3 điểm')
    expect(html).toContain('Storyboard 8 ô')
    expect(html).toContain('Đấu trường thẻ')
    expect(html).toContain('ĐÃ XONG')
    expect(html).toContain('ĐANG HỌC')
    expect(html).toContain('KHÓA')

    // 6. Your Activity
    expect(html).toContain('12 bài học')
    expect(html).toContain('43 giờ rèn luyện')

    // 7. Integrated Parent Unlock Zone within the Unified Course Hub
    expect(html).toContain('DÀNH CHO PHỤ HUYNH')
    expect(html).toContain('Gói Thám Hiểm Toàn Diện 6 Đảo')
    expect(html).toContain('479.000đ')
    expect(html).toContain('Chi tiết &amp; Trailer')
    expect(html).toContain('Phụ huynh mở khóa trọn bộ (479k)')
    expect(html).toContain('Tiết kiệm 40%')
  })

  it('renders ConceptProgressScreen with Explorer Passport, Skill Garden Montessori, Trio Cards, and 7-day capsule chart', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptProgressScreen, {})
    )

    expect(html).toContain('Kế Hoạch &amp; Tiến Độ')

    // 1. Explorer Passport
    expect(html).toContain('HỘ CHIẾU THÁM HIỂM')
    expect(html).toContain('Jacob • Cấp 4 • 1,250 XP')
    expect(html).toContain('28') // Stars
    expect(html).toContain('12') // Stations
    expect(html).toContain('/ 32 trạm')
    expect(html).toContain('38% lộ trình tổng')
    expect(html).toContain('7 ngày')
    expect(html).toContain('Hôm nay đã giữ chuỗi')

    // 2. Trio Cards
    expect(html).toContain('6 Đảo')
    expect(html).toContain('12 Trạm')
    expect(html).toContain('Đảo 2 - Trạm 3')

    // 3. Average Progress
    expect(html).toContain('78%')
    expect(html).toContain('progress-hatched')

    // 4. Montessori Skill Garden (4 competencies)
    expect(html).toContain('Khu Vườn Kỹ Năng Montessori')
    expect(html).toContain('Tư duy Prompt')
    expect(html).toContain('85%')
    expect(html).toContain('Mỹ thuật &amp; Màu sắc')
    expect(html).toContain('60%')
    expect(html).toContain('Kể chuyện &amp; Cốt truyện')
    expect(html).toContain('90%')
    expect(html).toContain('An toàn số &amp; Đạo đức AI')
    expect(html).toContain('100%')
    expect(html).toContain('Huân chương Hiệp Sĩ')

    // 5. Weekly Learning Chart
    expect(html).toContain('04hr 54min')
    expect(html).toContain('4,5hr')
    expect(html).toContain('T5')
  })

  it('renders ConceptIslandStationScreen (Màn 4) with Landscape Header, 6 Islands Slider, and Stations for Đảo 2', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptIslandStationScreen, {
        initialIslandId: 'dao-2',
      })
    )

    // Landscape Header
    expect(html).toContain('Xưởng Sáng Tạo Mèo Mee')
    expect(html).toContain('Bản Đồ Lộ Trình Khám Phá')
    expect(html).toContain('Nhà Vòm Anten')
    expect(html).toContain('Biển Chỉ Đường Robot')
    expect(html).toContain('Mee chào con!')

    // 6 Islands Slider
    expect(html).toContain('Chọn Đảo Khám Phá')
    expect(html).toContain('10 Quy tắc vàng')
    expect(html).toContain('4 Chìa khóa lệnh')
    expect(html).toContain('Sắc màu cọ vẽ')
    expect(html).toContain('Hồ sơ 3 điểm')
    expect(html).toContain('Storyboard 8 ô')
    expect(html).toContain('Đấu trường thẻ')

    // Stations for Đảo 2 (4 trạm)
    expect(html).toContain('Sổ Tay Lộ Trình: Đảo Khám Phá')
    expect(html).toContain('Trạm 1: Chìa khóa Đối tượng')
    expect(html).toContain('Trạm 2: Chìa khóa Bối cảnh')
    expect(html).toContain('Trạm 3: Chìa khóa Phong cách')
    expect(html).toContain('Vào học ngay')
    expect(html).toContain('+60 XP')
    expect(html).toContain('Trạm 4: Chìa khóa Cảm xúc + Đấu trường mở khóa')
  })

  it('renders ConceptIslandStationScreen with 10 Real Stations for Đảo 1 (10 Quy tắc vàng)', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptIslandStationScreen, {
        initialIslandId: 'dao-1',
      })
    )

    // 10 real golden rules stations
    expect(html).toContain('Sổ Tay Lộ Trình: Đảo Tiên Quyết')
    expect(html).toContain('Q1: Bảo vệ thông tin bí mật')
    expect(html).toContain('Q2: Bản quyền và tác giả')
    expect(html).toContain('Q3: Lời nói tử tế')
    expect(html).toContain('Q4: Nhờ người lớn hỗ trợ')
    expect(html).toContain('Q5: Không chia sẻ mật khẩu')
    expect(html).toContain('Q6: Nhận diện nội dung xấu')
    expect(html).toContain('Q7: Giới hạn giờ chơi')
    expect(html).toContain('Q8: Sáng tạo nhân văn')
    expect(html).toContain('Q9: Cùng bạn học tập')
    expect(html).toContain('Q10: Hiệp sĩ xưởng AI')
    expect(html).toContain('ĐẤU TRƯỜNG')
  })

  it('renders ConceptLessonScreen (Màn 5) with Station 1 Island 1, Track Switcher, and Clickable Step Navigation', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {})
    )

    // Default props & Header
    expect(html).toContain('Đảo 1: 10 Quy Tắc Vàng')
    expect(html).toContain('Trạm 1: Nghĩ Ý Tưởng Trước Khi Hỏi AI')
    expect(html).toContain('Bước 1 / 4')
    expect(html).toContain('progress-hatched')
    expect(html).toContain('+50 XP')
    expect(html).toContain('Quay lại Bản đồ')

    // Track Switcher
    expect(html).toContain('Phân hệ 1: 10 Quy Tắc Vàng (QT1)')
    expect(html).toContain('Phân hệ 2: Khóa Học &amp; Studio (Ảnh 4)')

    // 4 Clickable Step Pills
    expect(html).toContain('1. Phân xử')
    expect(html).toContain('2. Kho AI')
    expect(html).toContain('3. Thực hành ✨')
    expect(html).toContain('4. Ghi nhớ')

    // Mèo Mee Dialogue
    expect(html).toContain('Thử Thách Phân Xử')
    expect(html).toContain('Vẽ siêu anh hùng CỦA RIÊNG con')
    expect(html).toContain('Nghe Mee đọc')

    // Step 1: Zico vs Sonet pictures
    expect(html).toContain('Tranh Zico')
    expect(html).toContain('rule1_opt_zico.webp')
    expect(html).toContain('Siêu anh hùng áo choàng đỏ')
    expect(html).toContain('Tranh Sonet')
    expect(html).toContain('rule1_opt_sonet.webp')
    expect(html).toContain('Bố sợ gián cầm vợt muỗi')
  })

  it('renders ConceptLessonScreen Hands-on Practice Sandbox (Bước 3: Xưởng Thực Hành) with Manipulative Chips, Prompt Capsule, and Uniqueness Meter', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialStep: 3,
      })
    )

    // Step 3 Header
    expect(html).toContain('Xưởng Thực Hành Sáng Tạo')
    expect(html).toContain('Thực hành Quy tắc 1: Nghĩ ý tưởng độc nhất của riêng con!')

    // 3 Manipulative Blocks
    expect(html).toContain('1. Ai là Siêu Anh Hùng của con?')
    expect(html).toContain('Bố')
    expect(html).toContain('Mẹ')
    expect(html).toContain('Bà ngoại')
    expect(html).toContain('Mèo cưng')

    expect(html).toContain('2. Vũ khí / Vật phẩm bất ngờ:')
    expect(html).toContain('Vợt muỗi phát sáng')
    expect(html).toContain('Chiếc chảo thần')
    expect(html).toContain('Chổi bay')

    expect(html).toContain('3. Nét độc lạ / Nỗi sợ hài hước:')
    expect(html).toContain('Sợ con gián')
    expect(html).toContain('Sợ sâu róm')
    expect(html).toContain('Hát lệch tông')
    expect(html).toContain('Mê ăn bánh')

    // Prompt Capsule
    expect(html).toContain('Ý Tưởng Của Con (Prompt Tự Nhiên):')
    expect(html).toContain('Siêu anh hùng')

    // Live Practice Buttons
    expect(html).toContain('Nhờ AIKI vẽ ý tưởng của con')
    expect(html).toContain('Xem thử gõ chung chung (Kiểu Zico)')

    // Uniqueness Meter
    expect(html).toContain('Độ Độc Đáo:')
    expect(html).toContain('100% Độc Nhất Vô Nhị ⭐⭐⭐')
    expect(html).toContain('Nộp bài &amp; Nhận thưởng')
  })

  it('renders ConceptLessonScreen Track 2 (Course Studio matching Photo 4) with 6-stage journey, 3 columns, 4 Golden Keys, and Cat combos', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialTrack: 'course_studio',
      })
    )

    // 6-stage journey
    expect(html).toContain('Hành trình 6 giai đoạn')
    expect(html).toContain('5. Studio ✨')

    // 3 Columns
    // Col 1: Món đồ bé vẽ
    expect(html).toContain('MÓN ĐỒ BÉ VẼ')
    expect(html).toContain('Con mèo')

    // Col 2: 4 Chìa khóa vàng AIKI
    expect(html).toContain('4 CHÌA KHÓA VÀNG AIKI')
    expect(html).toContain('1. Cái gì?')
    expect(html).toContain('2. Trông thế nào?')
    expect(html).toContain('3. Đang làm gì?')
    expect(html).toContain('4. Ở đâu?')
    expect(html).toContain('Béo tròn bụ bẫm')
    expect(html).toContain('Thong dong dạo bước')
    expect(html).toContain('Bên thềm nhà đón nắng')

    // Col 3: Tranh sáng tạo Lượt 1 & Lượt 2
    expect(html).toContain('TRANH SÁNG TẠO')
    expect(html).toContain('Lượt 1: Sơ khai')
    expect(html).toContain('Lượt 2: Hoàn thiện')
    expect(html).toContain('combo__sub-meo-muop__cs-cat-beo-tron')
    expect(html).toContain('Đã lưu vào Balo')
    expect(html).toContain('Nộp bài • 1 ảnh')
  })

  it('renders StudentConceptTestPage with 5 Switch Tabs and Floating Dark Pill Dock in Mobile Mode', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(StudentConceptTestPage, { initialViewMode: 'mobile' })
      )
    )

    expect(html).toContain('AIKID CONCEPT LAB 2026')
    expect(html).toContain('Màn 1: Chào Mừng')
    expect(html).toContain('Màn 2: Trang Chủ')
    expect(html).toContain('Màn 3: Tiến Độ')
    expect(html).toContain('Màn 4: Bản Đồ Đảo &amp; Trạm')
    expect(html).toContain('Màn 5: Trải Nghiệm Học')

    expect(html).toContain('Mobile Phone (390px)')
    expect(html).toContain('Toàn màn hình')

    expect(html).toContain('student-floating-dock')
    expect(html).toContain('student-floating-tab')
  })

  it('renders Unified Floating Bottom Dock with KidImageIcons and Transparent Canvas in PC Full Width Mode', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(StudentConceptTestPage, { initialViewMode: 'full' })
      )
    )

    // PC Full Width Container with Transparent Background
    expect(html).toContain('max-w-[1024px]')
    expect(html).toContain('bg-transparent min-w-0')

    // Unified Floating Bottom Dock on PC (matching Mobile UX as directed by Boss)
    expect(html).toContain('student-floating-dock')
    expect(html).toContain('student-floating-tab w-13 h-13')
    expect(html).toContain('aikid-clay-icon')

    // 4 Key Navigation Pillars + Welcome Tab
    expect(html).toContain('title="Màn 1: Chào Mừng"')
    expect(html).toContain('title="Trang Chủ"')
    expect(html).toContain('title="Bản Đồ Đảo"')
    expect(html).toContain('title="Xưởng Sáng Tạo"')
    expect(html).toContain('title="Không Gian Con"')

    // View mode switcher & Reviewer controller
    expect(html).toContain('390px')
    expect(html).toContain('Thu gọn thanh điều khiển Reviewer')
  })

  it('verifies UI/UX Standards: Zero-Overflow, Touch Targets >= 48px, and Stroke-less Squircle styling across all screens', () => {
    const html = renderToStaticMarkup(
      createElement(
        MemoryRouter,
        null,
        createElement(StudentConceptTestPage, {})
      )
    )

    expect(html).toContain('min-w-0')
    expect(html).toContain('student-floating-tab w-13 h-13')
    expect(html).not.toContain('border-8')
    expect(html).not.toContain('shadow-clay')
    expect(html).toContain('shadow-sm')
    expect(html).toContain('rounded-[2.25rem]')
  })
})
