import type { FC } from 'react'

export type FeatureBlockItem = {
  id: string
  name: string
  icon: string
  desc: string
  badge?: string
  color: string
}

export type FeatureBlockHoverPreviewProps = {
  block: FeatureBlockItem | null
  anchorRect: DOMRect | null
  categoryName?: string
}

export type PedagogyGuide = {
  useWhen: string
  studentSees: string
}

export const FEATURE_BLOCK_CATEGORY_MAP: Record<string, string> = {
  // Group 1: Bố Cục & Cột Nội Dung
  'layout-text': 'Bố Cục & Cột Nội Dung',
  'layout-split': 'Bố Cục & Cột Nội Dung',
  'layout-two-text': 'Bố Cục & Cột Nội Dung',
  'layout-grid': 'Bố Cục & Cột Nội Dung',
  'layout-four-keys': 'Bố Cục & Cột Nội Dung',
  'practice-workflow': 'Bố Cục & Cột Nội Dung',
  'course-text': 'Bố Cục & Cột Nội Dung',
  'course-four-keys': 'Bố Cục & Cột Nội Dung',

  // Group 2: Hình Ảnh & Đa Phương Tiện
  'versus-ab': 'Hình Ảnh & Đa Phương Tiện',
  images: 'Hình Ảnh & Đa Phương Tiện',
  gallery: 'Hình Ảnh & Đa Phương Tiện',
  video: 'Hình Ảnh & Đa Phương Tiện',
  voice: 'Hình Ảnh & Đa Phương Tiện',

  // Group 3: Khối Tương Tác & Sư Phạm
  'layout-callout': 'Khối Tương Tác & Sư Phạm',
  compare: 'Khối Tương Tác & Sư Phạm',
  dialogue: 'Khối Tương Tác & Sư Phạm',
  'layout-formula': 'Khối Tương Tác & Sư Phạm',
  poster: 'Khối Tương Tác & Sư Phạm',
  'layout-confirm-option': 'Khối Tương Tác & Sư Phạm',
  'layout-storyboard': 'Khối Tương Tác & Sư Phạm',

  // Legacy mappings for backward compatibility
  'practice-ai-studio': 'Engine Thực Hành Sáng Tạo',
  'practice-style-prism': 'Engine Thực Hành Sáng Tạo',
  'practice-prompt-doctor': 'Engine Thực Hành Sáng Tạo',
  'practice-layer-stacking': 'Engine Thực Hành Sáng Tạo',
  'practice-identity-lock': 'Engine Thực Hành Sáng Tạo',
  'practice-card-forge': 'Engine Thực Hành Sáng Tạo',
  'practice-brief': 'Engine Thực Hành Sáng Tạo',
  'data-runner': 'Game Engine Bài Học',
  'truth-patrol': 'Game Engine Bài Học',
  'battle-math': 'Game Engine Bài Học',
  blockly: 'Game Engine Bài Học',
  quiz: 'Luyện Tập & Đánh Giá',
  ordering: 'Luyện Tập & Đánh Giá',
  pledge: 'Luyện Tập & Đánh Giá',
}

export const FEATURE_BLOCK_PEDAGOGY_MAP: Record<string, PedagogyGuide> = {
  'course-text': {
    useWhen: 'Giới thiệu khái niệm cốt lõi, kiến thức trọng tâm hoặc đoạn văn đọc hiểu của chặng.',
    studentSees: 'Khung bài đọc trang nhã, phông chữ to rõ cùng hộp ghi nhớ nổi bật.',
  },
  'layout-text': {
    useWhen: 'Trình bày nội dung văn bản tập trung 1 cột, phù hợp cho lý thuyết hoặc lời nhắn.',
    studentSees: 'Đoạn văn bản định dạng rõ ràng ở trung tâm màn hình, dễ đọc và tập trung.',
  },
  'course-four-keys': {
    useWhen: 'Dạy kỹ năng tư duy prompt AI qua 4 thành tố: Ai/Cái gì, Đặc điểm, Hành động, Bối cảnh.',
    studentSees: 'Lưới 4 thẻ màu sắc tương tác, giúp trẻ nhớ nhanh và lắp ghép câu lệnh AI.',
  },
  'layout-four-keys': {
    useWhen: 'Template trực quan 4 chiếc chìa khóa gợi ý câu lệnh sáng tạo cho bài học.',
    studentSees: '4 ô màu sắc đại diện cho 4 bước tư duy câu lệnh AI dễ hiểu.',
  },
  'layout-confirm-option': {
    useWhen: 'Tạo các phương án lựa chọn (A, B, C...) cho câu hỏi xác nhận mục tiêu dạng ảnh đơn hoặc text + ảnh.',
    studentSees: 'Thẻ phương án trực quan với huy hiệu chữ cái, hình ảnh minh họa và nút bấm chọn nhanh.',
  },
  'versus-ab': {
    useWhen: 'So sánh đối kháng giữa 2 hình ảnh: Đúng vs Sai, Đẹp vs Lỗi, Prompt Tốt vs Prompt Kém.',
    studentSees: '2 thẻ ảnh A và B đối xứng kịch tính kèm huy hiệu VS, học sinh chạm chọn để trả lời.',
  },
  dialogue: {
    useWhen: 'Dẫn dắt tình huống thực tế hoặc giải thích khái niệm qua hội thoại truyện tranh.',
    studentSees: 'Các bong bóng lời comic so le giữa bé Zico và mèo AIKI sinh động.',
  },
  compare: {
    useWhen: 'Đối chiếu năng lực con người vs trí tuệ AI hoặc so sánh 2 quan điểm đối lập.',
    studentSees: 'Bảng 2 cột cân xứng với cán cân ở giữa, so sánh trực quan từng tiêu chí.',
  },
  poster: {
    useWhen: 'Khắc sâu quy tắc an toàn, nguyên tắc đạo đức AI hoặc thông điệp bài học quan trọng.',
    studentSees: 'Tấm áp phích banner khổ lớn phong cách cuộn giấy ấn tượng, dễ ghi nhớ.',
  },
  gallery: {
    useWhen: 'Trưng bày bộ sưu tập tranh vẽ mẫu, ảnh thực tế hoặc các tác phẩm đa dạng chủ đề.',
    studentSees: 'Lưới album ảnh nhiều khung hình bo cong có chú thích chi tiết bên dưới.',
  },
  images: {
    useWhen: 'Trưng bày bộ sưu tập tranh vẽ mẫu, ảnh thực tế hoặc các tác phẩm đa dạng chủ đề.',
    studentSees: 'Lưới album ảnh nhiều khung hình bo cong có chú thích chi tiết bên dưới.',
  },
  video: {
    useWhen: 'Phát video hướng dẫn thực hành, phóng sự khoa học hoặc phim hoạt hình giáo dục.',
    studentSees: 'Khung phát video giao diện hiện đại với nút Play lớn và thanh tiến trình trực quan.',
  },
  voice: {
    useWhen: 'Luyện kỹ năng nghe, đọc hiểu và phát âm chuẩn với giọng đọc tương tác cùng cử chỉ.',
    studentSees: 'Mèo AIKI ngộ nghĩnh cử động khẩu hình và phát sóng âm thanh lời đọc ấm áp.',
  },
  'layout-split': {
    useWhen: 'Kết hợp cân đối: 50% văn bản giải thích bên trái và 50% tranh ảnh/media bên phải.',
    studentSees: 'Giao diện 2 nửa chia đôi hài hòa, vừa đọc bài vừa quan sát hình minh họa.',
  },
  'layout-two-text': {
    useWhen: 'Trình bày 2 cột văn bản song song để so sánh ý, giải thích 2 khía cạnh hoặc đối thoại văn bản.',
    studentSees: 'Giao diện 2 cột chữ cân xứng, phông chữ trực quan dễ đọc đối chiếu hai bên.',
  },
  'layout-grid': {
    useWhen: 'Trình bày 3 ví dụ, 3 khái niệm phân loại hoặc 3 bước triển khai song song.',
    studentSees: 'Bộ ba thẻ vuông xếp ngang bắt mắt, mỗi ô chứa một ý tưởng súc tích.',
  },
  'layout-callout': {
    useWhen: 'Tạo điểm nhấn chú ý đặc biệt: mẹo làm bài, lưu ý an toàn mạng hoặc bí kíp prompt.',
    studentSees: 'Hộp viền vàng hổ phách phát sáng với biểu tượng bóng đèn thông minh.',
  },
  'layout-storyboard': {
    useWhen: 'Trình bày cốt truyện hoặc quy trình theo chuỗi 3 phân cảnh điện ảnh tuần tự.',
    studentSees: 'Dải phim 3 cảnh nối tiếp 1 ➔ 2 ➔ 3 như đang theo dõi một đoạn phim hoạt hình.',
  },
  'layout-formula': {
    useWhen: 'Giảng giải công thức toán học, cấu trúc câu lệnh prompt hoặc logic thuật toán.',
    studentSees: 'Bảng công thức KaTeX chuẩn mực, ký hiệu toán học nổi bật kèm giải nghĩa.',
  },
  'data-runner': {
    useWhen: 'Ôn luyện từ vựng và thuật ngữ AI thông qua game chạy vượt chướng ngại vật.',
    studentSees: 'Game 2D chạy đua nhặt xu từ khóa, phản xạ né chướng ngại vật đầy hứng khởi.',
  },
  'truth-patrol': {
    useWhen: 'Rèn luyện tư duy phản biện, nhận diện deepfake và phân biệt tin thật - tin giả.',
    studentSees: 'Phi thuyền không gian quét laser kiểm chứng sự thật và bắn hạ thiên thạch fake news.',
  },
  'battle-math': {
    useWhen: 'Luyện phản xạ tính toán nhanh và tư duy logic dưới hình thức đấu trí kịch tính.',
    studentSees: 'Đấu trường toán học thời gian thực với thanh sinh lực đối đầu kịch tính cùng AIKI.',
  },
  blockly: {
    useWhen: 'Dạy tư duy thuật toán, vòng lặp và điều kiện bằng khối ghép lập trình trực quan.',
    studentSees: 'Các mảnh ghép puzzle câu lệnh nhiều màu sắc lắp ráp ăn khớp mượt mà.',
  },
  'practice-brief': {
    useWhen: 'Giao đề bài thực hành sáng tạo với mục tiêu, yêu cầu và checklist tiêu chí rõ ràng.',
    studentSees: 'Bảng nhiệm vụ hồng tâm 🎯 với danh sách việc cần hoàn thành để đạt điểm tối đa.',
  },
  'practice-workflow': {
    useWhen: 'Định hướng 4 bước thực hiện dự án từ ý tưởng, phác thảo đến sản phẩm hoàn thiện.',
    studentSees: 'Cầu thang 4 bước tiến độ rõ ràng, học sinh biết chính xác việc mình cần làm.',
  },
  'practice-ai-studio': {
    useWhen: 'Ghép 4 thành phần vàng (Ai? + Trông thế nào? + Đang làm gì? + Ở đâu?) để sinh sản phẩm tranh AI chuẩn chỉnh.',
    studentSees: 'Bàn phím 4 chìa khóa màu sắc ma thuật ghép câu lệnh trực quan và sinh sản phẩm tức thì.',
  },
  'practice-style-prism': {
    useWhen: 'Khám phá và xoay chuyển 4 lăng kính phong cách nghệ thuật đa dạng: Đất nặn Claymation, Màu nước, Chibi 3D, Đông Hồ.',
    studentSees: 'Lăng kính ma thuật 4 phong cách nghệ thuật với bảng xem trước biến hóa sống động.',
  },
  'practice-prompt-doctor': {
    useWhen: 'Học cách bắt bệnh hình ảnh lỗi (thiếu ngón, lơ lửng, mất đồ) và kê đơn thuốc thẻ chữ chữa lành câu lệnh.',
    studentSees: 'Bệnh viện tranh AKI với hồ sơ bệnh án tranh lỗi và tủ thuốc thẻ chữ chữa lành.',
  },
  'practice-layer-stacking': {
    useWhen: 'Luyện tập tư duy bố cục thị giác theo quy tắc 3 tầng: Hậu cảnh - Ngôi sao 1/3 - Tiền cảnh.',
    studentSees: 'Mô hình sân khấu 3 tầng lớp lang tương tác kéo thả tách bạch không gian có chiều sâu.',
  },
  'practice-identity-lock': {
    useWhen: 'Khóa chặt 3 mật mã ADN nhân vật bất biến và linh hoạt xoay chuyển bánh xe 6 biểu cảm.',
    studentSees: '3 ổ khóa vàng ADN nhân vật cố định và bánh xe xoay biểu cảm cảm xúc độc đáo.',
  },
  'practice-card-forge': {
    useWhen: 'Đúc thẻ bài chiến tướng TCG: Chọn hệ nguyên tố, khung pha lê và cân bằng chỉ số sức mạnh HP/ATK.',
    studentSees: 'Lò đúc thẻ bài ma thuật TCG lấp lánh pha lê với chỉ số chiến đấu và nguyên tố thần bí.',
  },
  quiz: {
    useWhen: 'Kiểm tra nhanh mức độ tiếp thu bài học sau mỗi chặng lý thuyết.',
    studentSees: 'Câu đố trắc nghiệm với các phương án lựa chọn, nhận hiệu ứng chúc mừng khi đúng.',
  },
  ordering: {
    useWhen: 'Đánh giá khả năng hiểu quy trình, trật tự thời gian hoặc các bước thuật toán.',
    studentSees: 'Các thẻ bài kéo thả mượt mà để sắp xếp lại đúng thứ tự logic.',
  },
  pledge: {
    useWhen: 'Tổng kết bài học hoặc khóa học bằng lời hứa trách nhiệm khi sử dụng công nghệ AI.',
    studentSees: 'Tấm khiên danh dự Hiệp Sĩ AI trang trọng với khu vực ký tên cam kết.',
  },
}

function renderMiniWireframe(id: string, blockName: string, blockIcon: string) {
  switch (id) {
    case 'course-text':
    case 'layout-text':
      return (
        <div data-testid="wireframe-text" className="space-y-1.5 p-2 bg-white rounded-lg border border-slate-200 shadow-2xs">
          <div className="h-2.5 w-3/4 rounded-full bg-brand-500" />
          <div className="space-y-1 pt-1">
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded bg-slate-200" />
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50/90 px-2 py-1 text-[9px] font-bold text-amber-800">
            <span>💡</span>
            <span className="truncate">Ghi nhớ trọng tâm bài học</span>
          </div>
        </div>
      )

    case 'course-four-keys':
    case 'layout-four-keys':
      return (
        <div data-testid="wireframe-four-keys" className="grid grid-cols-2 gap-1.5">
          <div className="rounded-lg border border-sky-300 bg-sky-50 p-1.5 text-[9px] font-black text-sky-800 flex items-center gap-1">
            <span className="text-xs">🔑</span>
            <div>
              <div className="text-[7px] font-bold uppercase text-sky-600">Khóa 1 🔵</div>
              <div>Cái gì?</div>
            </div>
          </div>
          <div className="rounded-lg border border-amber-300 bg-amber-50 p-1.5 text-[9px] font-black text-amber-800 flex items-center gap-1">
            <span className="text-xs">🔑</span>
            <div>
              <div className="text-[7px] font-bold uppercase text-amber-600">Khóa 2 🟡</div>
              <div>Trông sao?</div>
            </div>
          </div>
          <div className="rounded-lg border border-orange-300 bg-orange-50 p-1.5 text-[9px] font-black text-orange-800 flex items-center gap-1">
            <span className="text-xs">🔑</span>
            <div>
              <div className="text-[7px] font-bold uppercase text-orange-600">Khóa 3 🟠</div>
              <div>Làm gì?</div>
            </div>
          </div>
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-1.5 text-[9px] font-black text-rose-800 flex items-center gap-1">
            <span className="text-xs">🔑</span>
            <div>
              <div className="text-[7px] font-bold uppercase text-rose-600">Khóa 4 🔴</div>
              <div>Ở đâu?</div>
            </div>
          </div>
        </div>
      )

    case 'layout-confirm-option':
      return (
        <div data-testid="wireframe-confirm-option" className="space-y-1.5 p-2 bg-white rounded-lg border border-emerald-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">Phương án A</span>
            <span className="text-[8px] font-black px-1.5 py-0.2 rounded-full bg-emerald-500 text-white">Đáp án đúng</span>
          </div>
          <div className="h-8 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-500 font-bold">
            🖼️ Ảnh / Text phương án
          </div>
        </div>
      )

    case 'versus-ab':
      return (
        <div data-testid="wireframe-versus-ab" className="flex items-center justify-between gap-1.5 relative">
          <div className="flex-1 rounded-lg border-2 border-rose-200 bg-rose-50/80 p-2 text-center shadow-2xs">
            <div className="text-sm">❌</div>
            <div className="text-[9px] font-black text-rose-700 mt-0.5">Ảnh A</div>
            <div className="h-1 w-3/4 mx-auto rounded bg-rose-200 mt-1" />
          </div>
          <div className="shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-amber-400 text-amber-950 font-black text-[9px] shadow-md border-2 border-white z-10">
            ⚡ VS
          </div>
          <div className="flex-1 rounded-lg border-2 border-emerald-200 bg-emerald-50/80 p-2 text-center shadow-2xs">
            <div className="text-sm">✅</div>
            <div className="text-[9px] font-black text-emerald-700 mt-0.5">Ảnh B</div>
            <div className="h-1 w-3/4 mx-auto rounded bg-emerald-200 mt-1" />
          </div>
        </div>
      )

    case 'dialogue':
      return (
        <div data-testid="wireframe-dialogue" className="space-y-1.5">
          <div className="flex items-start gap-1.5">
            <span className="text-base shrink-0">👦</span>
            <div className="rounded-xl rounded-tl-none border border-sky-200 bg-sky-50 px-2 py-1 text-[9px] text-sky-900 shadow-2xs">
              <span className="font-black">Zico:</span> Prompt này thiếu gì thế AIKI?
            </div>
          </div>
          <div className="flex items-start gap-1.5 flex-row-reverse">
            <span className="text-base shrink-0">🐱</span>
            <div className="rounded-xl rounded-tr-none border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] text-amber-900 shadow-2xs">
              <span className="font-black">AIKI:</span> Thiếu chìa khóa số 4 "Ở đâu" đó bé!
            </div>
          </div>
        </div>
      )

    case 'compare':
      return (
        <div data-testid="wireframe-compare" className="rounded-lg border border-purple-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center justify-center gap-1.5 mb-1 text-[10px] font-black text-purple-900">
            <span>🧠 Trí Não Người</span>
            <span className="text-base text-amber-500">⚖️</span>
            <span>🤖 Trí Tuệ AI</span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-[8px] border-t border-purple-100 pt-1.5">
            <div className="bg-purple-50/80 rounded p-1 text-purple-900 space-y-0.5">
              <div>• Cảm xúc, trái tim</div>
              <div>• Sáng tạo tự nhiên</div>
            </div>
            <div className="bg-sky-50/80 rounded p-1 text-sky-900 space-y-0.5">
              <div>• Xử lý triệu dữ liệu</div>
              <div>• Tốc độ tính toán</div>
            </div>
          </div>
        </div>
      )

    case 'poster':
      return (
        <div data-testid="wireframe-poster" className="rounded-lg border-2 border-dashed border-amber-400 bg-amber-50/90 p-2 text-center shadow-2xs">
          <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider flex items-center justify-center gap-1">
            <span>📜</span>
            <span>Quy Tắc Vàng AI</span>
            <span>📜</span>
          </div>
          <div className="my-1 rounded bg-white/90 border border-amber-200 py-1 px-2 text-[9px] font-black text-slate-800">
            "Luôn kiểm chứng trước khi chia sẻ!"
          </div>
          <div className="text-[8px] font-bold text-amber-700">
            ⭐ Cuộn giấy quy tắc lưu về máy
          </div>
        </div>
      )

    case 'gallery':
    case 'images':
      return (
        <div data-testid="wireframe-gallery" className="grid grid-cols-3 gap-1.5">
          {[1, 2, 3].map((num) => (
            <div key={num} className="rounded-lg border border-teal-200 bg-white p-1 shadow-2xs flex flex-col items-center">
              <div className="w-full h-8 rounded bg-teal-50 flex items-center justify-center text-teal-600 text-xs">
                🖼️
              </div>
              <div className="w-full mt-1 space-y-0.5 text-center">
                <div className="text-[7px] font-bold text-slate-600">Ảnh {num}</div>
                <div className="h-1 w-3/4 mx-auto rounded bg-slate-200 mt-0.5" />
              </div>
            </div>
          ))}
        </div>
      )

    case 'video':
      return (
        <div data-testid="wireframe-video" className="rounded-xl bg-slate-900 p-2 text-white shadow-inner flex flex-col justify-between h-18 relative">
          <div className="flex items-center justify-between text-[8px] text-slate-400">
            <span>🎬 Video bài giảng</span>
            <span className="text-rose-400 font-bold">● HD</span>
          </div>
          <div className="self-center flex items-center justify-center w-7 h-7 rounded-full bg-rose-600/95 text-white text-xs shadow-md">
            ▶
          </div>
          <div className="w-full space-y-0.5">
            <div className="w-full h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className="w-1/3 h-full bg-amber-400 rounded-full" />
            </div>
            <div className="flex justify-between text-[7px] text-slate-400">
              <span>01:15</span>
              <span>03:40</span>
            </div>
          </div>
        </div>
      )

    case 'voice':
      return (
        <div data-testid="wireframe-voice" className="flex items-center gap-2 p-2 rounded-xl border border-rose-200 bg-rose-50/70 shadow-2xs">
          <div className="w-8 h-8 rounded-full bg-rose-100 border border-rose-300 flex items-center justify-center text-base shrink-0">
            🐱
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1 text-[9px] font-black text-rose-900">
              <span>AIKI Đọc Bài</span>
              <span className="text-xs">🎙️ 🔊</span>
            </div>
            <div className="mt-0.5 text-[8px] text-rose-700 truncate">
              "Hãy nghe lời dặn của AIKI nhé!"
            </div>
            <div className="flex gap-0.5 mt-1 items-end h-2">
              <span className="w-1 h-1.5 bg-rose-400 rounded-full animate-pulse" />
              <span className="w-1 h-2 bg-rose-500 rounded-full" />
              <span className="w-1 h-1 bg-rose-400 rounded-full" />
              <span className="w-1 h-2 bg-rose-600 rounded-full" />
            </div>
          </div>
        </div>
      )

    case 'layout-split':
      return (
        <div data-testid="wireframe-layout-split" className="grid grid-cols-2 gap-2 rounded-lg border border-blue-200 bg-white p-2 shadow-2xs items-center">
          <div className="space-y-1">
            <div className="h-2 w-3/4 rounded bg-blue-600" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded bg-slate-200" />
          </div>
          <div className="h-13 rounded-lg border border-blue-200 bg-blue-50/80 flex flex-col items-center justify-center text-blue-500">
            <span className="text-base">🖼️</span>
            <span className="text-[7px] font-bold mt-0.5 text-blue-700">Tranh minh họa</span>
          </div>
        </div>
      )

    case 'layout-two-text':
      return (
        <div data-testid="wireframe-layout-two-text" className="grid grid-cols-2 gap-2 rounded-lg border border-sky-200 bg-white p-2 shadow-2xs items-center">
          <div className="space-y-1 border-r border-slate-100 pr-1">
            <div className="h-2 w-3/4 rounded bg-sky-600" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded bg-slate-200" />
          </div>
          <div className="space-y-1 pl-1">
            <div className="h-2 w-3/4 rounded bg-indigo-600" />
            <div className="h-1.5 w-full rounded bg-slate-200" />
            <div className="h-1.5 w-5/6 rounded bg-slate-200" />
            <div className="h-1.5 w-4/6 rounded bg-slate-200" />
          </div>
        </div>
      )

    case 'layout-grid':
      return (
        <div data-testid="wireframe-layout-grid" className="grid grid-cols-3 gap-1.5">
          <div className="rounded-lg border border-purple-200 bg-purple-50 p-1.5 text-center shadow-2xs">
            <div className="text-xs">1️⃣</div>
            <div className="text-[8px] font-black text-purple-900 mt-0.5">Thẻ 1</div>
            <div className="h-1 w-full bg-purple-200 rounded mt-1" />
          </div>
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-1.5 text-center shadow-2xs">
            <div className="text-xs">2️⃣</div>
            <div className="text-[8px] font-black text-blue-900 mt-0.5">Thẻ 2</div>
            <div className="h-1 w-full bg-blue-200 rounded mt-1" />
          </div>
          <div className="rounded-lg border border-pink-200 bg-pink-50 p-1.5 text-center shadow-2xs">
            <div className="text-xs">3️⃣</div>
            <div className="text-[8px] font-black text-pink-900 mt-0.5">Thẻ 3</div>
            <div className="h-1 w-full bg-pink-200 rounded mt-1" />
          </div>
        </div>
      )

    case 'layout-callout':
      return (
        <div data-testid="wireframe-layout-callout" className="rounded-xl border-2 border-amber-400 bg-amber-50/90 p-2 shadow-2xs flex items-start gap-2">
          <span className="text-lg shrink-0">💡</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black text-amber-900">Mẹo Hay Từ Chuyên Gia</div>
            <div className="text-[8px] text-amber-800 mt-0.5 leading-snug">
              Thêm từ khóa phong cách để hình ảnh độc đáo và sắc nét hơn!
            </div>
          </div>
        </div>
      )

    case 'layout-storyboard':
      return (
        <div data-testid="wireframe-layout-storyboard" className="rounded-lg border border-emerald-300 bg-slate-900 p-1.5 text-white shadow-2xs">
          <div className="flex justify-between items-center text-[7px] text-emerald-400 px-1 mb-1">
            <span>🎞️ DẢI PHIM STORYBOARD</span>
            <span>1 ➔ 2 ➔ 3</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[1, 2, 3].map((scene) => (
              <div key={scene} className="rounded border border-slate-700 bg-slate-800 p-1 text-center">
                <div className="text-[8px] font-black text-amber-300">Cảnh {scene}</div>
                <div className="h-5 rounded bg-slate-700 my-0.5 flex items-center justify-center text-[9px]">
                  🎬
                </div>
                <div className="text-[6px] text-slate-400 truncate">Hành động {scene}</div>
              </div>
            ))}
          </div>
        </div>
      )

    case 'layout-formula':
      return (
        <div data-testid="wireframe-layout-formula" className="rounded-lg border border-indigo-200 bg-indigo-50/80 p-2 shadow-2xs text-center">
          <div className="text-[8px] font-bold text-indigo-600 uppercase tracking-wide">Cấu Trúc KaTeX / Toán Học</div>
          <div className="my-1 rounded bg-white border border-indigo-200 py-1 px-2 text-[9px] font-black font-mono text-indigo-950">
            ∑ Prompt = [Ai] + [Ở đâu] + [Hành động]
          </div>
          <div className="text-[7px] text-slate-600">Hiển thị ký hiệu logic & toán học chuẩn xác</div>
        </div>
      )

    case 'data-runner':
      return (
        <div data-testid="wireframe-data-runner" className="rounded-lg border border-blue-300 bg-blue-950 p-2 text-white shadow-inner">
          <div className="flex justify-between text-[8px] text-blue-300 mb-1">
            <span>🏃 DATA RUNNER</span>
            <span className="text-amber-300 font-bold">🪙 120 PTS</span>
          </div>
          <div className="h-8 rounded bg-blue-900/80 border border-blue-800 flex items-center px-2 justify-between">
            <span className="text-sm">🏃</span>
            <div className="flex gap-2">
              <span className="text-xs">🪙</span>
              <span className="text-xs">🚧</span>
              <span className="text-xs">🪙</span>
            </div>
          </div>
          <div className="mt-1 flex justify-between text-[7px] text-blue-300">
            <span>Né rào cản</span>
            <span>Nhặt từ khóa AI</span>
          </div>
        </div>
      )

    case 'truth-patrol':
      return (
        <div data-testid="wireframe-truth-patrol" className="rounded-lg border border-cyan-400 bg-slate-950 p-2 text-cyan-300 shadow-inner">
          <div className="flex justify-between text-[8px] mb-1">
            <span>🚀 TRUTH PATROL</span>
            <span className="text-rose-400 font-bold">FAKE ALERT</span>
          </div>
          <div className="h-8 rounded bg-slate-900 border border-cyan-900 flex items-center justify-between px-2">
            <span className="text-sm">🚀</span>
            <span className="text-xs text-cyan-400">⚡ ⚡</span>
            <span className="text-xs">☄️ <span className="text-[6px] text-rose-400 font-black">FAKE</span></span>
          </div>
          <div className="mt-1 text-[7px] text-cyan-400 text-center">Quét laser sự thật & tiêu diệt tin giả</div>
        </div>
      )

    case 'battle-math':
      return (
        <div data-testid="wireframe-battle-math" className="rounded-lg border border-violet-300 bg-violet-950 p-2 text-white shadow-inner">
          <div className="flex justify-between items-center text-[8px] mb-1">
            <span className="text-cyan-300 font-bold">👦 Bé (HP 100)</span>
            <span className="text-amber-400 font-black">⚔️ VS</span>
            <span className="text-rose-300 font-bold">🤖 Boss (HP 80)</span>
          </div>
          <div className="my-1 rounded bg-violet-900 p-1 text-center">
            <div className="text-[9px] font-black text-amber-300">8 × 7 = ?</div>
            <div className="flex justify-center gap-2 mt-1">
              <span className="rounded bg-violet-700 px-1.5 py-0.5 text-[7px] font-bold">54</span>
              <span className="rounded bg-emerald-600 px-1.5 py-0.5 text-[7px] font-bold">56</span>
            </div>
          </div>
        </div>
      )

    case 'blockly':
      return (
        <div data-testid="wireframe-blockly" className="space-y-1 rounded-lg border border-orange-200 bg-white p-1.5 shadow-2xs">
          <div className="rounded border border-orange-300 bg-orange-100 px-2 py-0.5 text-[8px] font-black text-orange-900 flex items-center gap-1">
            <span>🧩</span> Khi Nhấn Nút Bắt Đầu
          </div>
          <div className="ml-3 rounded border border-emerald-300 bg-emerald-100 px-2 py-0.5 text-[7px] font-bold text-emerald-900 flex items-center gap-1">
            <span>↳</span> Di chuyển 10 bước
          </div>
          <div className="ml-3 rounded border border-indigo-300 bg-indigo-100 px-2 py-0.5 text-[7px] font-bold text-indigo-900 flex items-center gap-1">
            <span>↳</span> AIKI đọc câu chào
          </div>
        </div>
      )

    case 'practice-brief':
      return (
        <div data-testid="wireframe-practice-brief" className="rounded-lg border border-amber-200 bg-white p-2 shadow-2xs">
          <div className="flex items-center gap-1 text-[9px] font-black text-amber-900 mb-1">
            <span className="text-sm">🎯</span>
            <span>Mục Tiêu Thực Hành</span>
          </div>
          <div className="space-y-1 text-[7px] text-slate-700">
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <span>☑</span> Vẽ nhân vật Phi Hành Gia
            </div>
            <div className="flex items-center gap-1 text-emerald-700 font-bold">
              <span>☑</span> Áp dụng đủ 4 chìa khóa Prompt
            </div>
            <div className="flex items-center gap-1 text-slate-400">
              <span>☐</span> Nộp bài vào xưởng trưng bày
            </div>
          </div>
        </div>
      )

    case 'practice-workflow':
      return (
        <div data-testid="wireframe-practice-workflow" className="grid grid-cols-4 gap-1 rounded-lg border border-mint-200 bg-mint-50/70 p-1.5 shadow-2xs text-center">
          <div className="rounded bg-white border border-mint-200 p-0.5">
            <div className="text-[6px] font-black text-mint-700">BƯỚC 1</div>
            <div className="text-[7px] font-bold text-slate-800">Ý tưởng</div>
          </div>
          <div className="rounded bg-white border border-mint-200 p-0.5">
            <div className="text-[6px] font-black text-mint-700">BƯỚC 2</div>
            <div className="text-[7px] font-bold text-slate-800">Phác thảo</div>
          </div>
          <div className="rounded bg-white border border-mint-200 p-0.5">
            <div className="text-[6px] font-black text-mint-700">BƯỚC 3</div>
            <div className="text-[7px] font-bold text-slate-800">Prompt</div>
          </div>
          <div className="rounded bg-mint-600 text-white p-0.5">
            <div className="text-[6px] font-black text-mint-200">BƯỚC 4</div>
            <div className="text-[7px] font-black">Tạo Tranh</div>
          </div>
        </div>
      )

    case 'practice-ai-studio':
      return (
        <div data-testid="wireframe-practice-ai-studio" className="grid grid-cols-3 gap-1 rounded-lg border border-brand-200 bg-brand-50/80 p-1.5 shadow-2xs text-center">
          <div className="rounded bg-white border border-brand-200 p-1">
            <div className="text-[6px] font-black text-brand-600">1. Bé Vẽ</div>
            <div className="text-sm">🎨</div>
            <div className="text-[6px] text-slate-500">Phác họa</div>
          </div>
          <div className="rounded bg-white border border-amber-200 p-1">
            <div className="text-[6px] font-black text-amber-600">2. 4 Khóa</div>
            <div className="text-sm">🔑</div>
            <div className="text-[6px] text-slate-500">Ghép câu</div>
          </div>
          <div className="rounded bg-brand-600 text-white p-1">
            <div className="text-[6px] font-black text-brand-200">3. Tranh AI</div>
            <div className="text-sm">✨</div>
            <div className="text-[6px] text-white/90">Sản phẩm</div>
          </div>
        </div>
      )

    case 'practice-style-prism':
      return (
        <div data-testid="wireframe-practice-style-prism" className="rounded-lg border border-purple-200 bg-purple-50/80 p-1.5 shadow-2xs space-y-1 text-center">
          <div className="flex items-center justify-between text-[7px] font-black text-purple-900 px-1">
            <span>🔮 Lăng Kính Phong Cách</span>
            <span className="text-purple-600">4 Kiểu Tranh</span>
          </div>
          <div className="grid grid-cols-4 gap-1">
            <div className="rounded bg-white border border-purple-200 p-0.5">
              <div className="text-xs">🏺</div>
              <div className="text-[6px] font-bold text-purple-900">Đất nặn</div>
            </div>
            <div className="rounded bg-white border border-purple-200 p-0.5">
              <div className="text-xs">🎨</div>
              <div className="text-[6px] font-bold text-purple-900">Màu nước</div>
            </div>
            <div className="rounded bg-white border border-purple-200 p-0.5">
              <div className="text-xs">✨</div>
              <div className="text-[6px] font-bold text-purple-900">Chibi 3D</div>
            </div>
            <div className="rounded bg-purple-600 text-white p-0.5">
              <div className="text-xs">🏮</div>
              <div className="text-[6px] font-black">Dân gian</div>
            </div>
          </div>
        </div>
      )

    case 'practice-prompt-doctor':
      return (
        <div data-testid="wireframe-practice-prompt-doctor" className="rounded-lg border border-rose-200 bg-rose-50/80 p-1.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[7px] font-black text-rose-900 px-1">
            <span>🩺 Bác Sĩ AKI Bắt Bệnh</span>
            <span className="rounded bg-rose-200 text-rose-900 px-1">Đơn Thuốc</span>
          </div>
          <div className="grid grid-cols-2 gap-1 text-[6.5px]">
            <div className="rounded bg-white border border-rose-200 p-1 text-rose-800 font-bold">
              ⚠️ Tranh lỗi thiếu ngón
            </div>
            <div className="rounded bg-emerald-500 text-white p-1 font-bold text-center">
              💊 Kê đơn 5 ngón tay
            </div>
          </div>
        </div>
      )

    case 'practice-layer-stacking':
      return (
        <div data-testid="wireframe-practice-layer-stacking" className="rounded-lg border border-emerald-200 bg-emerald-50/80 p-1.5 shadow-2xs space-y-1 text-center">
          <div className="flex items-center justify-between text-[7px] font-black text-emerald-900 px-1">
            <span>🎭 Bố Cục 3 Tầng Sân Khấu</span>
            <span className="text-emerald-700">Tỷ lệ 1/3</span>
          </div>
          <div className="grid grid-cols-3 gap-1 text-[6.5px]">
            <div className="rounded bg-white border border-emerald-200 p-1 text-slate-700">
              <div className="font-bold text-emerald-700">1. Hậu cảnh</div>
              <span>Rừng thông</span>
            </div>
            <div className="rounded bg-emerald-600 text-white p-1 font-bold">
              <div>2. Ngôi sao</div>
              <span>Sóc Bông</span>
            </div>
            <div className="rounded bg-white border border-emerald-200 p-1 text-slate-700">
              <div className="font-bold text-emerald-700">3. Tiền cảnh</div>
              <span>Lá phong</span>
            </div>
          </div>
        </div>
      )

    case 'practice-identity-lock':
      return (
        <div data-testid="wireframe-practice-identity-lock" className="rounded-lg border border-cyan-200 bg-cyan-50/80 p-1.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[7px] font-black text-cyan-900 px-1">
            <span>🔒 Khóa Mật Mã ADN</span>
            <span className="text-cyan-700">6 Biểu Cảm</span>
          </div>
          <div className="grid grid-cols-3 gap-0.5 text-[6px] text-center">
            <div className="rounded bg-white border border-cyan-200 p-0.5 font-bold text-cyan-800">🔒 Mũ len đỏ</div>
            <div className="rounded bg-white border border-cyan-200 p-0.5 font-bold text-cyan-800">🔒 Đuôi xù cam</div>
            <div className="rounded bg-white border border-cyan-200 p-0.5 font-bold text-cyan-800">🔒 Túi chéo</div>
          </div>
          <div className="rounded bg-cyan-600 text-white p-0.5 text-center text-[6.5px] font-black">
            🎡 Xoay biểu cảm: Nháy mắt tinh nghịch ✨
          </div>
        </div>
      )

    case 'practice-card-forge':
      return (
        <div data-testid="wireframe-practice-card-forge" className="rounded-lg border border-amber-200 bg-amber-50/80 p-1.5 shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-[7px] font-black text-amber-900 px-1">
            <span>🃏 Thẻ Bài TCG Ma Thuật</span>
            <span className="rounded bg-amber-200 text-amber-900 px-1">Hệ Rồng</span>
          </div>
          <div className="rounded bg-white border border-amber-300 p-1 text-center space-y-0.5">
            <div className="text-[7.5px] font-black text-amber-900">Rồng Băng Pha Lê</div>
            <div className="flex justify-center gap-1.5 text-[6.5px] font-bold text-slate-700">
              <span className="text-rose-600">⚔️ ATK 8</span>
              <span className="text-sky-600">🛡️ DEF 6</span>
              <span className="text-purple-600">🔮 MP 6</span>
            </div>
          </div>
        </div>
      )

    case 'quiz':
      return (
        <div data-testid="wireframe-quiz" className="rounded-lg border border-pink-200 bg-white p-2 shadow-2xs space-y-1">
          <div className="text-[9px] font-black text-pink-950 flex items-center gap-1">
            <span>❓</span>
            <span>AI tạo tranh từ điều gì?</span>
          </div>
          <div className="space-y-1">
            <div className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[7px] text-slate-700">
              ⚪ A. Tự suy đoán
            </div>
            <div className="rounded border border-emerald-300 bg-emerald-50 px-2 py-0.5 text-[7px] font-bold text-emerald-800">
              🔘 B. Từ khóa Prompt
            </div>
            <div className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[7px] text-slate-700">
              ⚪ C. Giác quan thứ 6
            </div>
          </div>
        </div>
      )

    case 'ordering':
      return (
        <div data-testid="wireframe-ordering" className="space-y-1 rounded-lg border border-yellow-200 bg-white p-1.5 shadow-2xs">
          <div className="rounded border border-amber-200 bg-amber-50/70 px-2 py-0.5 text-[8px] font-bold text-amber-900 flex items-center justify-between">
            <span>⠿ 1. Nhập từ khóa AI</span>
            <span className="text-[7px] text-slate-400">↕ Kéo</span>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50/70 px-2 py-0.5 text-[8px] font-bold text-amber-900 flex items-center justify-between">
            <span>⠿ 2. Chọn phong cách vẽ</span>
            <span className="text-[7px] text-slate-400">↕ Kéo</span>
          </div>
          <div className="rounded border border-amber-200 bg-amber-50/70 px-2 py-0.5 text-[8px] font-bold text-amber-900 flex items-center justify-between">
            <span>⠿ 3. Bấm Tạo Tác Phẩm</span>
            <span className="text-[7px] text-slate-400">↕ Kéo</span>
          </div>
        </div>
      )

    case 'pledge':
      return (
        <div data-testid="wireframe-pledge" className="rounded-lg border-2 border-mint-300 bg-mint-50/80 p-2 text-center shadow-2xs">
          <div className="text-base">🛡️</div>
          <div className="text-[9px] font-black text-mint-900 uppercase tracking-wider">
            Lời Thề Hiệp Sĩ AI
          </div>
          <div className="text-[7px] italic text-mint-800 my-1">
            "Em cam kết dùng AI sáng tạo điều trung thực & tốt đẹp!"
          </div>
          <div className="text-[7px] font-bold text-slate-500 border-t border-mint-200 pt-1">
            ✍️ Chữ ký: ________________
          </div>
        </div>
      )

    default:
      return (
        <div data-testid="wireframe-fallback" className="rounded-lg border border-slate-200 bg-white p-2.5 text-center shadow-2xs">
          <div className="text-xl mb-1">{blockIcon}</div>
          <div className="text-[9px] font-bold text-slate-700">{blockName}</div>
          <div className="h-1.5 w-3/4 mx-auto rounded bg-slate-200 mt-1.5" />
        </div>
      )
  }
}

export const FeatureBlockHoverPreview: FC<FeatureBlockHoverPreviewProps> = ({
  block,
  anchorRect,
  categoryName,
}) => {
  if (!block || !anchorRect) {
    return null
  }

  const windowHeight = typeof window !== 'undefined' && window.innerHeight ? window.innerHeight : 800
  const top = Math.min(windowHeight - 380, Math.max(16, anchorRect.top - 20))
  const left = anchorRect.right + 12

  const resolvedCategory = categoryName || FEATURE_BLOCK_CATEGORY_MAP[block.id] || 'Khối Tính Năng'
  const pedagogy = FEATURE_BLOCK_PEDAGOGY_MAP[block.id] || {
    useWhen: block.desc || 'Chèn thành phần này vào chặng để tăng tính tương tác trực quan.',
    studentSees: 'Giao diện trực quan trên màn hình bài học của học sinh.',
  }

  return (
    <div
      data-testid="feature-block-hover-preview"
      style={{ top: `${top}px`, left: `${left}px` }}
      className="fixed z-50 w-76 sm:w-80 rounded-2xl border-2 border-brand-200 bg-white/98 p-3.5 shadow-clay-lg backdrop-blur-md pointer-events-none animate-in fade-in zoom-in-95 duration-150 text-left"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <span className="text-2xl shrink-0 p-1.5 rounded-xl bg-slate-100 border border-slate-200/80 shadow-2xs leading-none">
            {block.icon}
          </span>
          <div className="min-w-0 flex-1">
            <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400 truncate">
              {resolvedCategory}
            </div>
            <h4 className="font-black text-sm text-slate-800 leading-snug truncate">
              {block.name}
            </h4>
          </div>
        </div>

        {block.badge && (
          <span className="shrink-0 rounded-full bg-brand-100 border border-brand-300 px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-brand-700 shadow-2xs">
            {block.badge}
          </span>
        )}
      </div>

      {/* Mini Layout Wireframe */}
      <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 my-2.5 shadow-inner">
        <div className="text-[8px] font-black uppercase tracking-wider text-slate-400 mb-1.5 flex items-center justify-between">
          <span>📐 Mô Phỏng Bố Cục Học Sinh Thấy</span>
          <span className="text-[7px] font-bold text-brand-600 bg-brand-50 border border-brand-200 rounded px-1">Mini Wireframe</span>
        </div>
        {renderMiniWireframe(block.id, block.name, block.icon)}
      </div>

      {/* Thông Tin Hướng Dẫn Sư Phạm */}
      <div className="space-y-1.5 text-[10px] leading-relaxed border-t border-slate-100 pt-2 text-slate-600">
        <div className="flex items-start gap-1.5">
          <span className="shrink-0 font-bold text-amber-600">💡 Dùng khi nào:</span>
          <span className="text-slate-700 font-medium leading-snug">{pedagogy.useWhen}</span>
        </div>
        <div className="flex items-start gap-1.5">
          <span className="shrink-0 font-bold text-brand-600">🎯 Trải nghiệm học sinh:</span>
          <span className="text-slate-700 font-medium leading-snug">{pedagogy.studentSees}</span>
        </div>
      </div>
    </div>
  )
}
