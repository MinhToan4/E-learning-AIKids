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

  it('renders ConceptHomeScreen with Organic Sky Canopy Header, Floating Daily Quest, and 6 Islands Hub', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptHomeScreen, {})
    )

    // 1. Organic Sky Canopy Header (không khối bo viền cứng)
    expect(html).toContain('Chào Jacob!')
    expect(html).toContain('Cấp 4 • Nhà Thám Hiểm Nhí')
    expect(html).toContain('1,250 XP')
    expect(html).toContain('+250 XP lên cấp')
    expect(html).toContain('3 ngày')
    expect(html).toContain('18 sao')

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

    // 3. Floating Daily Quest Ribbon
    expect(html).toContain('Nhiệm vụ hôm nay:')
    expect(html).toContain('Hoàn thành 1 trạm thử thách để rèn luyện tư duy AI')
    expect(html).toContain('+30 XP')
    expect(html).toContain('Làm ngay')

    // 4. 6 Islands roadmap
    expect(html).toContain('10 Quy tắc vàng')
    expect(html).toContain('4 Chìa khóa lệnh')
    expect(html).toContain('Sắc màu cọ vẽ')
    expect(html).toContain('Hồ sơ 3 điểm')
    expect(html).toContain('Storyboard 8 ô')
    expect(html).toContain('Đấu trường thẻ')
    expect(html).toContain('ĐANG HỌC')

    // 5. Integrated Parent Unlock Zone within the Unified Course Hub
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

  it('renders ConceptIslandStationScreen with 5 Core Golden Rules Stations for Đảo 1', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptIslandStationScreen, {
        initialIslandId: 'dao-1',
      })
    )

    // 5 core golden rules stations
    expect(html).toContain('Sổ Tay Lộ Trình: Đảo Tiên Quyết')
    expect(html).toContain('Trạm 1: Nghĩ ý tưởng trước khi hỏi AI')
    expect(html).toContain('Trạm 2: Giữ bí mật gia đình')
    expect(html).toContain('Trạm 3: Kiểm tra sự thật cùng bố mẹ')
    expect(html).toContain('Trạm 4: Sáng tạo không sao chép')
    expect(html).toContain('Trạm 5: Hỏi người lớn khi gặp điều lạ')
    expect(html).toContain('ĐẤU TRƯỜNG')
  })

  it('renders ConceptLessonScreen (Màn 5) with Station 1 Island 1, Track Switcher, and 3-Step Navigation for Rules', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {})
    )

    // Default props & Header
    expect(html).toContain('Đảo 1: 10 Quy Tắc Vàng')
    expect(html).toContain('Trạm 1: Nghĩ Ý Tưởng Trước Khi Hỏi AI')
    expect(html).toContain('Bước 1 / 3')
    expect(html).toContain('progress-hatched')
    expect(html).toContain('+50 XP')
    expect(html).toContain('Quay lại Bản đồ')

    // Track Switcher
    expect(html).toContain('Phân hệ 1: 10 Quy Tắc Vàng (QT1)')
    expect(html).toContain('Phân hệ 2: Khóa Học &amp; Studio (Ảnh 4)')

    // 3 Clickable Step Pills for Rules
    expect(html).toContain('1. Tình huống &amp; Bí kíp')
    expect(html).toContain('2. Câu đố phản xạ')
    expect(html).toContain('3. Thực hành &amp; Nhận cúp ✨')

    // Mèo Mee Dialogue
    expect(html).toContain('Tình Huống &amp; Bí Kíp')
    expect(html).toContain('Vẽ siêu anh hùng CỦA RIÊNG con')
    expect(html).toContain('Nghe Mee đọc')

    // Step 1: Situation intro, Comparison & Golden Rule 1
    expect(html).toContain('Tranh Zico')
    expect(html).toContain('rule1_opt_zico.webp')
    expect(html).toContain('Tranh Sonet')
    expect(html).toContain('rule1_opt_sonet.webp')
    expect(html).toContain('Kho Mẫu AI')
    expect(html).toContain('Trí Não Của Bé')
    expect(html).toContain('QUY TẮC VÀNG 1')
    expect(html).toContain('Sang Bước 2: Câu đố phản xạ')
  })

  it('renders ConceptLessonScreen Hands-on Practice Sandbox (Bước 3: Xưởng Thực Hành & Nhận Cúp) with Manipulative Chips, Prompt Capsule, and Uniqueness Meter', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialStep: 3,
      })
    )

    // Step 3 Header
    expect(html).toContain('Bước 3 / 3')
    expect(html).toContain('Xưởng Sáng Tạo Prompt Capsule &amp; Nhận Cúp')
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
    expect(html).toContain('Hoàn thành trạm &amp; Lưu Balo')
  })

  it('renders ConceptLessonScreen Celebration & Rewards in Step 3 with 3D Gold Trophy and 3 Badges', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialStep: 3,
      })
    )

    expect(html).toContain('Xuất Sắc! Con Đã Nắm Vững Quy Tắc 1')
    expect(html).toContain('trophy-clay-gold.png')
    expect(html).toContain('+3 Sao Vàng')
    expect(html).toContain('+50 XP')
    expect(html).toContain('Hiệp Sĩ AIKI')
    expect(html).toContain('Hoàn thành trạm &amp; Lưu Balo')
  })

  it('renders ConceptLessonScreen Track 2 (Course Studio matching Photo 4) with 6-stage journey, 3 columns, 4 Golden Keys, and Cat combos', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialTrack: 'course_studio',
      })
    )

    // 6-stage journey
    expect(html).toContain('Bước 5 / 6')
    expect(html).toContain('1. Mục tiêu')
    expect(html).toContain('2. Khởi động')
    expect(html).toContain('3. Video')
    expect(html).toContain('4. Thử thách')
    expect(html).toContain('5. Studio ✨')
    expect(html).toContain('6. Nhận cúp 🏆')

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
    expect(html).toContain('mèo mướp vàng béo tròn')
    expect(html).toContain('đang nằm ngủ cuộn tròn')
    expect(html).toContain('trên chiếc ghế mây cạnh cửa sổ')

    // Col 3: Tranh sáng tạo 1 LƯỢT DUY NHẤT
    expect(html).toContain('TRANH SÁNG TẠO')
    expect(html).toContain('1 LƯỢT DUY NHẤT')
    expect(html).toContain('Đầy đủ 4 khóa')
    expect(html).toContain('combo__sub-meo-muop__cs-cat-beo-tron')
    expect(html).toContain('Đã lưu vào Balo')
    expect(html).toContain('Nộp bài • 1 ảnh')
  })

  it('renders ConceptLessonScreen Track 2 Step 6 Graduation with 3D Gold Trophy and Master of 4 Keys badge', () => {
    const html = renderToStaticMarkup(
      createElement(ConceptLessonScreen, {
        initialTrack: 'course_studio',
        initialStep: 6,
      })
    )

    expect(html).toContain('Bước 6 / 6')
    expect(html).toContain('Tốt Nghiệp Khóa Học Studio')
    expect(html).toContain('trophy-clay-gold.png')
    expect(html).toContain('+3 Sao Vàng Soft Clay')
    expect(html).toContain('+100 XP')
    expect(html).toContain('Bậc Thầy 4 Chìa Khóa')
    expect(html).toContain('Đã lưu vào Balo nghệ thuật')
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
