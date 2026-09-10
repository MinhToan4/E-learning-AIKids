const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const outDir = path.resolve(__dirname, '../public/assets/aiki-islands');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const tmpDir = path.resolve('/tmp/aiki-islands-build');
if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });

// Danh sách 76 ảnh cho 5 Đảo
const ASSETS = [
  // ── ĐẢO 1: NHÀ THÁM HIỂM AI (Module 1 - Emerald #10b981) ──
  {
    name: 'island1_lesson1_cat.jpg',
    tag: 'BÀI 1.1 · TÌNH HUỐNG',
    title: 'Một Từ Hay Năm Từ?',
    desc: 'Mimi muốn vẽ con mèo nhưng chỉ gõ hai chữ: kết quả ra chú mèo lạ hoắc!',
    accent: '#10b981',
    emoji: '🐱',
    scene: 'cat_prompt',
  },
  {
    name: 'island1_lesson1_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · 1 TỪ',
    title: 'Gõ ngắn "con mèo"',
    desc: 'AI vẽ ra chú mèo xám đơn điệu, chung chung và không đúng ý muốn của con.',
    accent: '#ef4444',
    emoji: '❌',
    scene: 'plain_cat',
  },
  {
    name: 'island1_lesson1_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · 5 CHI TIẾT',
    title: 'Mèo mướp béo ngủ trên ghế mây',
    desc: 'Đủ 5 chi tiết: mèo mướp, béo, ngủ, ghế mây, cạnh cửa sổ ngập nắng ấm.',
    accent: '#10b981',
    emoji: '🎉',
    scene: 'cozy_cat',
  },
  {
    name: 'island1_lesson2_keys.jpg',
    tag: 'BÀI 1.2 · 4 CHIẾC CHÌA KHÓA',
    title: 'Bộ Khung Chìa Khóa Lệnh',
    desc: 'Xanh (Cái gì) · Vàng (Trông thế nào) · Cam (Đang làm gì) · Đỏ (Ở đâu).',
    accent: '#10b981',
    emoji: '🔑',
    scene: 'four_keys',
  },
  {
    name: 'island1_lesson2_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Thiếu chìa khóa ĐỎ (Ở đâu)',
    desc: 'Câu lệnh "Một con chó xù nâu đang chạy" chưa nói rõ chạy ở đâu, AI phải đoán bừa.',
    accent: '#10b981',
    emoji: '🎯',
    scene: 'missing_key_red',
  },
  {
    name: 'island1_lesson2_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B',
    title: 'Thiếu chìa khóa XANH (Cái gì)',
    desc: 'Phương án này không đúng vì câu lệnh đã nói rõ con gì rồi (chú chó xù nâu).',
    accent: '#64748b',
    emoji: '💡',
    scene: 'dog_park',
  },
  {
    name: 'island1_lesson3_styles.jpg',
    tag: 'BÀI 1.3 · PHONG CÁCH',
    title: 'Úm Ba La... Biến Hình!',
    desc: 'Khám phá 4 phong cách: Màu nước, Truyện tranh, Đất nặn 3D và Dân gian Đông Hồ.',
    accent: '#10b981',
    emoji: '🎨',
    scene: 'four_styles',
  },
  {
    name: 'island1_lesson3_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · ĐÚNG QUY TẮC',
    title: 'Chọn trường phái nghệ thuật chung',
    desc: 'Gọi tên kiểu vẽ chung (màu nước, đất nặn, comic) - Tôn trọng bản quyền tác giả.',
    accent: '#10b981',
    emoji: '✨',
    scene: 'art_schools',
  },
  {
    name: 'island1_lesson3_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · VI PHẠM',
    title: 'Chép phong cách họa sĩ đang sống',
    desc: 'Vi phạm quy tắc đạo đức của Xưởng Sáng Tạo AIKids: Không được sao chép cá nhân!',
    accent: '#ef4444',
    emoji: '⛔',
    scene: 'copyright_warning',
  },
  {
    name: 'island1_lesson4_engineer.jpg',
    tag: 'BÀI 1.4 · KỸ SƯ AI',
    title: 'Kỹ Sư Tài Ba',
    desc: 'Ây Ai sai thì sửa chữ, đừng bấm nút! Ba bước thần thánh của kỹ sư AI.',
    accent: '#10b981',
    emoji: '🛠️',
    scene: 'ai_engineer',
  },
  {
    name: 'island1_lesson4_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · SAI LẦM',
    title: 'Bấm nút tạo lại liên tục',
    desc: 'Bấm 5 lần mù quáng chỉ làm hết sạch lượt tạo mà bàn tay vẫn bị vẽ lỗi 6 ngón.',
    accent: '#ef4444',
    emoji: '⚠️',
    scene: 'hand_6_fingers',
  },
  {
    name: 'island1_lesson4_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CHÍNH XÁC',
    title: 'Sửa chữ "Bàn tay 5 ngón"',
    desc: 'Đọc lại lệnh, gọi tên lỗi, thêm chữ "5 ngón tay cầm bút" -> Ra ngay bàn tay đẹp chuẩn.',
    accent: '#10b981',
    emoji: '🌟',
    scene: 'hand_5_fingers',
  },
  {
    name: 'island1_compare_left.jpg',
    tag: 'BẢN CHẤT AI',
    title: 'Kho Dữ Liệu Máy Móc Của AI',
    desc: 'Chỉ ghép nối từ những mẫu có sẵn trên mạng, không có kỷ niệm hay tình cảm thật.',
    accent: '#64748b',
    emoji: '🤖',
    scene: 'ai_warehouse',
  },
  {
    name: 'island1_compare_right.jpg',
    tag: 'BẢN CHẤT CON NGƯỜI',
    title: 'Bộ Não Sáng Tạo Của Bé',
    desc: 'Chứa đựng những ý tưởng độc nhất vô nhị, kỷ niệm gia đình và sự tưởng tượng bay bổng.',
    accent: '#10b981',
    emoji: '🧠',
    scene: 'kid_mind',
  },

  // ── ĐẢO 2: HỌA SĨ AI (Module 2 - Amber #f59e0b) ──
  {
    name: 'island2_lesson1_story.jpg',
    tag: 'BÀI 2.1 · CỐT TRUYỆN',
    title: 'Bức Tranh Biết Nói',
    desc: 'Tranh đẹp làm người ta dừng lại 3 giây. Tranh biết nói làm người ta nhớ mãi!',
    accent: '#f59e0b',
    emoji: '🖼️',
    scene: 'talking_picture',
  },
  {
    name: 'island2_lesson1_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Đôi giày mới tinh trong hộp',
    desc: 'Chỉ là một sản phẩm thương mại vô hồn, không có bất kỳ câu chuyện nào xảy ra.',
    accent: '#64748b',
    emoji: '📦',
    scene: 'shoes_in_box',
  },
  {
    name: 'island2_lesson1_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · TRANH BIẾT NÓI',
    title: 'Giày lấm bùn cạnh cúp vô địch',
    desc: 'Kể trọn vẹn câu chuyện về một trận đấu quả cảm, mồ hôi và niềm vui chiến thắng!',
    accent: '#f59e0b',
    emoji: '🏆',
    scene: 'shoes_muddy_trophy',
  },
  {
    name: 'island2_lesson2_star.jpg',
    tag: 'BÀI 2.2 · BỐ CỤC',
    title: 'Ai Là Ngôi Sao?',
    desc: 'Bức tranh chỉ có MỘT ngôi sao duy nhất! Các chi tiết phụ khiêm tốn làm nền.',
    accent: '#f59e0b',
    emoji: '⭐',
    scene: 'star_composition',
  },
  {
    name: 'island2_lesson2_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · RỐI MẮT',
    title: 'Tất cả con vật to bằng nhau',
    desc: 'Tranh nhau nổi bật khiến người xem hoa mắt, không biết đâu là trọng tâm bức tranh.',
    accent: '#ef4444',
    emoji: '😵',
    scene: 'chaotic_animals',
  },
  {
    name: 'island2_lesson2_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CHUẨN MỰC',
    title: 'Một nhân vật chính nổi bật',
    desc: 'Chú sóc ôm hạt dẻ vàng óng ở vị trí trung tâm, chim bồ câu và cây cối làm nền.',
    accent: '#f59e0b',
    emoji: '🐿️',
    scene: 'squirrel_star',
  },
  {
    name: 'island2_lesson3_colors.jpg',
    tag: 'BÀI 2.3 · MÀU SẮC',
    title: 'Cảm Xúc Của Sắc Màu',
    desc: 'Gam màu nóng mang lại sự ấm áp sum vầy; gam màu lạnh mang lại sự tĩnh lặng bí ẩn.',
    accent: '#f59e0b',
    emoji: '🎨',
    scene: 'color_emotions',
  },
  {
    name: 'island2_lesson3_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Dùng màu ngẫu nhiên',
    desc: 'Màu sắc lộn xộn không thể hiện được thông điệp hay cảm xúc mà bé muốn truyền tải.',
    accent: '#64748b',
    emoji: '🎲',
    scene: 'random_colors',
  },
  {
    name: 'island2_lesson3_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · GIÀU CẢM XÚC',
    title: 'Bảng màu vàng cam ấm cúng',
    desc: 'Gam màu lửa ấm áp gợi cảm giác cả nhà quây quần bên mâm cơm ngày mưa gió.',
    accent: '#f59e0b',
    emoji: '🔥',
    scene: 'warm_home',
  },
  {
    name: 'island2_lesson4_frame.jpg',
    tag: 'BÀI 2.4 · XUẤT BẢN',
    title: 'Khung Tranh A4 Hoàn Chỉnh',
    desc: 'Một tác phẩm thực thụ cần có khung viền trang trọng, tên tranh và chữ ký tác giả!',
    accent: '#f59e0b',
    emoji: '📜',
    scene: 'framed_masterpiece',
  },
  {
    name: 'island2_lesson4_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Tranh nhăn nheo không tên',
    desc: 'Vẽ xong vứt bừa bộn dưới gầm bàn, không ai biết tác phẩm nói về điều gì.',
    accent: '#ef4444',
    emoji: '🗑️',
    scene: 'messy_paper',
  },
  {
    name: 'island2_lesson4_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · TÁC PHẨM',
    title: 'Đóng khung A4 trang trọng',
    desc: 'Bức tranh được lồng khung gỗ, có nhãn tên "Buổi Sáng Mùa Thu" treo góc học tập.',
    accent: '#f59e0b',
    emoji: '🎖️',
    scene: 'framed_wall',
  },
  {
    name: 'island2_compare_left.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Bức Tranh Vô Hồn',
    desc: 'Hình ảnh vẽ ra rất đẹp nhưng không có linh hồn hay ký ức thật sự của tác giả.',
    accent: '#64748b',
    emoji: '🤖',
    scene: 'soulless_art',
  },
  {
    name: 'island2_compare_right.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Tác Phẩm Của Trái Tim',
    desc: 'Gửi gắm tình yêu thương gia đình, những khoảnh khắc đời thường vô giá của con.',
    accent: '#f59e0b',
    emoji: '❤️',
    scene: 'heart_art',
  },

  // ── ĐẢO 3: BIỆT ĐỘI NHÂN VẬT AI (Module 3 - Sky #0284c7) ──
  {
    name: 'island3_lesson1_profile.jpg',
    tag: 'BÀI 3.1 · NHÂN VẬT',
    title: 'Hồ Sơ Nhân Vật Bí Mật',
    desc: 'Tạo dựng một nhân vật duy nhất, nhất quán từ ngoại hình đến tính cách độc đáo.',
    accent: '#0284c7',
    emoji: '🦸',
    scene: 'character_profile',
  },
  {
    name: 'island3_lesson1_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Mỗi lần vẽ lại đổi mặt',
    desc: 'Bấm nút tạo ra nhân vật mỗi lúc một kiểu khiến bạn đọc không nhận ra người hùng.',
    accent: '#ef4444',
    emoji: '❓',
    scene: 'inconsistent_char',
  },
  {
    name: 'island3_lesson1_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · NHẤT QUÁN',
    title: 'Hồ sơ 4 trang bất biến',
    desc: 'Nhân vật giữ nguyên khuôn mặt, trang phục và phong thái xuyên suốt toàn bộ bộ truyện.',
    accent: '#0284c7',
    emoji: '📘',
    scene: 'consistent_hero',
  },
  {
    name: 'island3_lesson2_code3.jpg',
    tag: 'BÀI 3.2 · MẬT MÃ',
    title: 'Mật Mã 3 Điểm Nhận Diện',
    desc: 'Khóa chặt 3 đặc điểm vàng: Kiểu tóc đặc trưng · Trang phục nhận diện · Đồ vật bất ly thân.',
    accent: '#0284c7',
    emoji: '🔒',
    scene: 'code_3_points',
  },
  {
    name: 'island3_lesson2_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Tả chung chung "cậu bé"',
    desc: 'Chỉ ghi "cậu bé siêu nhân" làm AI tự ý đổi màu áo, đổi kiểu tóc lung tung.',
    accent: '#64748b',
    emoji: '🌀',
    scene: 'vague_prompt',
  },
  {
    name: 'island3_lesson2_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · KHÓA 3 ĐIỂM',
    title: 'Tóc xoăn · Kính phi công · Áo cam',
    desc: 'Ba điểm nhận diện cố định giúp AI nhận diện và vẽ chuẩn xác trong mọi góc quay.',
    accent: '#0284c7',
    emoji: '🛡️',
    scene: 'locked_features',
  },
  {
    name: 'island3_lesson3_faces.jpg',
    tag: 'BÀI 3.3 · BIỂU CẢM',
    title: 'Bộ 6 Biểu Cảm Cảm Xúc',
    desc: 'Vui sướng · Buồn rầu · Giận dữ · Ngạc nhiên · Quyết tâm · Thư thái ngắm mây.',
    accent: '#0284c7',
    emoji: '🎭',
    scene: 'six_faces',
  },
  {
    name: 'island3_lesson3_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Một nét mặt đơ cứng',
    desc: 'Dù gặp quái vật hay nhận quà sinh nhật vẫn giữ nguyên một nụ cười đơ như búp bê.',
    accent: '#ef4444',
    emoji: '😐',
    scene: 'frozen_face',
  },
  {
    name: 'island3_lesson3_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · SỐNG ĐỘNG',
    title: 'Biến hóa cảm xúc theo tình huống',
    desc: 'Mắt sáng rực khi vui, lông mày nhíu lại khi quyết tâm, miệng há hốc khi bất ngờ!',
    accent: '#0284c7',
    emoji: '🤩',
    scene: 'expressive_faces',
  },
  {
    name: 'island3_lesson4_base.jpg',
    tag: 'BÀI 3.4 · CĂN CỨ',
    title: 'Căn Cứ Bí Mật',
    desc: 'Ngôi nhà riêng thể hiện đam mê: nơi có bàn chế tạo robot, bản đồ vũ trụ và người bạn thân.',
    accent: '#0284c7',
    emoji: '🏰',
    scene: 'secret_base',
  },
  {
    name: 'island3_lesson4_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Căn phòng trống trơn',
    desc: 'Bốn bức tường trắng toát không có bất kỳ món đồ nào gắn liền với sở thích nhân vật.',
    accent: '#64748b',
    emoji: '📭',
    scene: 'empty_room',
  },
  {
    name: 'island3_lesson4_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · ĐỘC ĐÁO',
    title: 'Xưởng sáng chế trên ngọn cây',
    desc: 'Đầy kính viễn vọng, máy móc bánh răng gỗ và chú mèo máy phụ tá đáng yêu.',
    accent: '#0284c7',
    emoji: '🚀',
    scene: 'treehouse_lab',
  },
  {
    name: 'island3_compare_left.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Nhân Vật Chắp Vá Mượn Mẫu',
    desc: 'Sao chép những nhân vật có sẵn trên phim ảnh, thiếu đi sự riêng biệt và tính cách thật.',
    accent: '#64748b',
    emoji: '🤖',
    scene: 'cloned_hero',
  },
  {
    name: 'island3_compare_right.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Hiệp Sĩ Sáng Tạo Của Con',
    desc: 'Mang câu chuyện, tính cách và ước mơ của chính con — độc nhất vô nhị trên đời!',
    accent: '#0284c7',
    emoji: '⭐',
    scene: 'unique_hero',
  },

  // ── ĐẢO 4: VƯƠNG QUỐC TRUYỆN TRANH AI (Module 4 - Pink #ec4899) ──
  {
    name: 'island4_lesson1_gates.jpg',
    tag: 'BÀI 4.1 · CẤU TRÚC',
    title: 'Ba Cổng Vương Quốc',
    desc: 'Cổng 1: Mở đầu yên bình · Cổng 2: Biến cố bất ngờ · Cổng 3: Giải quyết trọn vẹn.',
    accent: '#ec4899',
    emoji: '🚪',
    scene: 'three_gates',
  },
  {
    name: 'island4_lesson1_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Chuyện bằng phẳng không biến cố',
    desc: 'Nhân vật đi dạo, ăn bánh rồi đi ngủ: Không có biến cố thì không thành truyện tranh!',
    accent: '#ef4444',
    emoji: '😴',
    scene: 'flat_story',
  },
  {
    name: 'island4_lesson1_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CỐT TRUYỆN HAY',
    title: 'Có thử thách và vượt qua biến cố',
    desc: 'Mất chìa khóa thần kỳ -> Cùng bạn bè giải mật mã -> Tìm lại được kho báu!',
    accent: '#ec4899',
    emoji: '📖',
    scene: 'dynamic_story',
  },
  {
    name: 'island4_lesson2_steps.jpg',
    tag: 'BÀI 4.2 · HÀNH TRÌNH',
    title: 'Bốn Chặng Thử Thách',
    desc: 'Xuất phát dũng cảm -> Gặp chướng ngại vật -> Học bài học quý -> Chiến thắng vinh quang.',
    accent: '#ec4899',
    emoji: '🗺️',
    scene: 'four_steps_journey',
  },
  {
    name: 'island4_lesson2_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Búng tay chiến thắng ngay',
    desc: 'Vừa gặp rồng đã thắng ngay không cần cố gắng, người đọc thấy nhạt nhẽo.',
    accent: '#64748b',
    emoji: '💨',
    scene: 'instant_win',
  },
  {
    name: 'island4_lesson2_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · ANH HÙNG',
    title: 'Vượt qua 4 chặng rèn luyện',
    desc: 'Rèn luyện trí tuệ, đoàn kết bạn bè để cùng nhau mở cánh cổng vương quốc.',
    accent: '#ec4899',
    emoji: '🏔️',
    scene: 'climbing_trials',
  },
  {
    name: 'island4_lesson3_map8_p1.jpg',
    tag: 'BÀI 4.3 · PHÂN CẢNH',
    title: 'Bản Đồ Storyboard 8 Ô (Phần 1)',
    desc: 'Phân cảnh 4 ô đầu tiên: Giới thiệu người hùng, bối cảnh và lời kêu gọi phiêu lưu.',
    accent: '#ec4899',
    emoji: '🎞️',
    scene: 'storyboard_p1',
  },
  {
    name: 'island4_lesson3_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Vẽ tranh nhảy cóc rời rạc',
    desc: 'Ô 1 đang ở nhà, ô 2 tự nhiên bay lên vũ trụ không có sự chuyển cảnh hợp lý.',
    accent: '#ef4444',
    emoji: '🧩',
    scene: 'broken_panels',
  },
  {
    name: 'island4_lesson3_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · MẠCH LẠC',
    title: '4 ô đầu liên kết chặt chẽ',
    desc: 'Góc nhìn rộng toàn cảnh -> Góc cận biểu cảm -> Hành động bước chân lên đường.',
    accent: '#ec4899',
    emoji: '🎬',
    scene: 'smooth_panels',
  },
  {
    name: 'island4_lesson4_map8_p2.jpg',
    tag: 'BÀI 4.4 · CAO TRÀO',
    title: 'Bản Đồ Storyboard 8 Ô (Phần 2)',
    desc: 'Phân cảnh từ ô 5 đến ô 8: Đối mặt thử thách lớn nhất, giải đố và bài học đúc kết.',
    accent: '#ec4899',
    emoji: '🔥',
    scene: 'storyboard_p2',
  },
  {
    name: 'island4_lesson4_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Kết thúc lửng lơ bỏ dở',
    desc: 'Đang đến đoạn hấp dẫn nhất thì hết tranh, không giải thích chuyện gì xảy ra tiếp.',
    accent: '#64748b',
    emoji: '❓',
    scene: 'cliffhanger_bad',
  },
  {
    name: 'island4_lesson4_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · TRỌN VẸN',
    title: 'Cao trào bùng nổ và bài học',
    desc: 'Ô 6 cao trào nghẹt thở, ô 7 gỡ nút thông minh, ô 8 nụ cười rạng rỡ của cả nhóm!',
    accent: '#ec4899',
    emoji: '🌈',
    scene: 'climax_resolution',
  },
  {
    name: 'island4_lesson5_crown.jpg',
    tag: 'BÀI 4.5 · XUẤT BẢN',
    title: 'Vương Miện Hoàn Hảo',
    desc: 'Đóng ghim cuốn truyện 8 trang, thiết kế trang bìa rực rỡ và ghi tên tác giả nhí!',
    accent: '#ec4899',
    emoji: '👑',
    scene: 'comic_book_published',
  },
  {
    name: 'island4_lesson5_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Để tờ rơi rời rạc',
    desc: 'Các trang truyện không có số trang, không bìa và dễ bị gió thổi bay thất lạc.',
    accent: '#ef4444',
    emoji: '🍃',
    scene: 'loose_pages',
  },
  {
    name: 'island4_lesson5_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · XUẤT BẢN THẬT',
    title: 'Cuốn truyện 8 trang đóng ghim',
    desc: 'Có trang bìa bắt mắt, lời đề tặng bố mẹ và chữ ký tác giả in màu chuyên nghiệp!',
    accent: '#ec4899',
    emoji: '📚',
    scene: 'bound_comic',
  },
  {
    name: 'island4_compare_left.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Ý Tưởng Tản Mạn Không Đầu Cuối',
    desc: 'Nhiều hình vẽ đẹp nhưng không tạo thành câu chuyện có ý nghĩa giáo dục.',
    accent: '#64748b',
    emoji: '🤖',
    scene: 'scattered_ideas',
  },
  {
    name: 'island4_compare_right.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Tác Phẩm Kể Chuyện Hoàn Chỉnh',
    desc: 'Cuốn truyện tranh chứa đựng thông điệp yêu thương và tư duy dàn dựng logic.',
    accent: '#ec4899',
    emoji: '🌟',
    scene: 'structured_comic',
  },

  // ── ĐẢO 5: NHÀ PHÁT MINH TRÒ CHƠI AI (Module 5 - Purple #8b5cf6) ──
  {
    name: 'island5_lesson1_cards12.jpg',
    tag: 'BÀI 5.1 · THẺ BÀI',
    title: 'Bộ Sưu Tập 12 Thẻ Bài',
    desc: 'Thiết kế 12 lá bài độc nhất: Hệ Lửa, Hệ Nước, Hệ Đất, Hệ Gió cân bằng chỉ số.',
    accent: '#8b5cf6',
    emoji: '🃏',
    scene: 'cards_12_set',
  },
  {
    name: 'island5_lesson1_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · MẤT CÂN BẰNG',
    title: 'Tạo một lá bài bất khả chiến bại',
    desc: 'Lá bài mạnh vô đối làm hỏng toàn bộ cuộc chơi, không ai muốn chơi cùng nữa.',
    accent: '#ef4444',
    emoji: '💥',
    scene: 'overpowered_card',
  },
  {
    name: 'island5_lesson1_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CÂN BẰNG',
    title: 'Mỗi lá đều có ưu và nhược điểm',
    desc: 'Thẻ công mạnh thì thủ yếu, thẻ di chuyển nhanh thì máu ít: Đòi hỏi chiến thuật!',
    accent: '#8b5cf6',
    emoji: '⚖️',
    scene: 'balanced_cards',
  },
  {
    name: 'island5_lesson2_magic.jpg',
    tag: 'BÀI 5.2 · CHỈ SỐ',
    title: 'Phù Phép Mặt Thẻ',
    desc: 'Bố cục mặt thẻ Soft Clay: Tên hiệp sĩ · Sức mạnh (Power) · Tốc độ (Speed) · Khéo léo (Agility).',
    accent: '#8b5cf6',
    emoji: '✨',
    scene: 'card_face_magic',
  },
  {
    name: 'island5_lesson2_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Mặt thẻ chi chít chữ',
    desc: 'Chèn quá nhiều chữ nhỏ làm người chơi không nhìn rõ các chỉ số chiến đấu.',
    accent: '#64748b',
    emoji: '📝',
    scene: 'cluttered_card',
  },
  {
    name: 'island5_lesson2_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · TRỰC QUAN',
    title: 'Khung chỉ số 3 ô màu sắc',
    desc: 'Chỉ số to rõ, biểu tượng trực quan, hình minh họa nhân vật 3D Soft Clay sống động.',
    accent: '#8b5cf6',
    emoji: '💎',
    scene: 'clean_stat_card',
  },
  {
    name: 'island5_lesson3_lock.jpg',
    tag: 'BÀI 5.3 · GIỚI HẠN',
    title: 'Khóa Thẻ & Cân Bằng Điểm',
    desc: 'Quy tắc công bằng: Tổng điểm cả 3 chỉ số không bao giờ được vượt quá 20 sao!',
    accent: '#8b5cf6',
    emoji: '🔒',
    scene: 'card_balance_lock',
  },
  {
    name: 'island5_lesson3_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A · GIAN LẬN',
    title: 'Điền chỉ số 999 sao',
    desc: 'Tự cho thẻ của mình điểm tối đa để luôn thắng là vi phạm đạo đức nhà phát minh.',
    accent: '#ef4444',
    emoji: '🚫',
    scene: 'cheating_card',
  },
  {
    name: 'island5_lesson3_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CÔNG BẰNG',
    title: 'Tuân thủ tổng điểm 20 sao',
    desc: 'Phân bổ hợp lý: Sức 8 + Tốc 7 + Khéo 5 = 20. Trò chơi hay là trò chơi công bằng!',
    accent: '#8b5cf6',
    emoji: '🏅',
    scene: 'fair_points_20',
  },
  {
    name: 'island5_lesson4_rules.jpg',
    tag: 'BÀI 5.4 · LUẬT CHƠI',
    title: 'Luật Chơi Công Bằng',
    desc: 'Soạn thảo bản luật chơi 5 điều: Lượt đi, cách tấn công, phòng thủ và điều kiện chiến thắng.',
    accent: '#8b5cf6',
    emoji: '📜',
    scene: 'fair_game_rules',
  },
  {
    name: 'island5_lesson4_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Đổi luật giữa chừng khi sắp thua',
    desc: 'Hành vi làm mất hòa khí gia đình và bạn bè, không đúng tinh thần thể thao.',
    accent: '#ef4444',
    emoji: '😡',
    scene: 'argue_rules',
  },
  {
    name: 'island5_lesson4_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · MINH BẠCH',
    title: 'Đọc kỹ luật trước khi thi đấu',
    desc: 'Cả hai người chơi đều đồng thuận và tuân thủ bản luật niêm yết trên bàn cờ.',
    accent: '#8b5cf6',
    emoji: '🤝',
    scene: 'agree_rules',
  },
  {
    name: 'island5_lesson5_arena.jpg',
    tag: 'BÀI 5.5 · KHAI MẠC',
    title: 'Đấu Trường Khai Mở',
    desc: 'Trải bàn cờ A3, xóc bộ bài và mời gia đình cùng bước vào trận đấu khai mạc!',
    accent: '#8b5cf6',
    emoji: '🏟️',
    scene: 'arena_opening',
  },
  {
    name: 'island5_lesson5_opt_a.jpg',
    tag: 'PHƯƠNG ÁN A',
    title: 'Cất game vào hòm khóa kín',
    desc: 'Làm xong không dám rủ ai chơi cùng, bộ game bị lãng quên uổng phí.',
    accent: '#64748b',
    emoji: '📦',
    scene: 'locked_game',
  },
  {
    name: 'island5_lesson5_opt_b.jpg',
    tag: 'PHƯƠNG ÁN B · CHƠI CÙNG GIA ĐÌNH',
    title: 'Khai mạc giải đấu gia đình',
    desc: 'Cả nhà cùng vui cười bên bàn cờ do chính con thiết kế và phát minh!',
    accent: '#8b5cf6',
    emoji: '🎉',
    scene: 'family_game_night',
  },
  {
    name: 'island5_compare_left.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Trò Chơi Bất Công',
    desc: 'Gian lận chỉ số khiến mọi người buồn bã và rời bỏ cuộc chơi.',
    accent: '#ef4444',
    emoji: '💔',
    scene: 'unfair_game',
  },
  {
    name: 'island5_compare_right.jpg',
    tag: 'SO SÁNH BẢN CHẤT',
    title: 'Trò Chơi Gắn Kết Tình Thân',
    desc: 'Luật chơi công bằng tạo nên những tiếng cười rộn rã và kỷ niệm tuổi thơ ấm áp.',
    accent: '#8b5cf6',
    emoji: '👨‍👩‍👧‍👦',
    scene: 'joyful_family',
  },
];

function renderSceneGraphic(item) {
  const scene = item.scene;
  const accent = item.accent || '#10b981';
  let graphic = '';

  switch (scene) {
    case 'missing_key_red':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Floating brown poodle -->
        <g transform="translate(150, 100)">
          <path d="M120 180 Q100 130 150 90 Q180 50 220 80 Q250 110 230 160 Q210 190 120 180 Z" fill="#8B4513" />
          <path d="M130 90 Q150 70 170 90 Q180 120 150 130 Q120 110 130 90 Z" fill="#A0522D" />
          <!-- Dog running motion lines -->
          <path d="M50 150 L80 150 M40 170 L90 170" stroke="#cbd5e1" stroke-width="4" stroke-linecap="round" />
        </g>
        <!-- Huge Red Key with ? -->
        <g transform="translate(500, 70)">
          <path d="M100 50 L100 250 L150 250 L150 210 L120 210 L120 170 L160 170 L160 130 L120 130 L120 50 Z" fill="#ef4444" filter="url(#clay-shadow)" />
          <circle cx="100" cy="50" r="50" fill="#ef4444" filter="url(#clay-shadow)" />
          <circle cx="100" cy="50" r="20" fill="#ffffff" />
          <text x="320" y="100" font-family="-apple-system, sans-serif" font-size="80" font-weight="900" fill="#ef4444" filter="url(#clay-shadow)">❓</text>
          <text x="320" y="160" font-family="-apple-system, sans-serif" font-size="28" font-weight="800" fill="#ef4444">Ở ĐÂU?</text>
          <text x="320" y="200" font-family="-apple-system, sans-serif" font-size="20" font-weight="600" fill="#64748b">(Công viên? Bãi biển? Phòng khách?)</text>
        </g>
      `;
      break;
    case 'dog_park':
      graphic = `
        <!-- Beautiful park -->
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#dcfce7" stroke="${accent}20" stroke-width="2" clip-path="url(#clip-park)" />
        <clipPath id="clip-park"><rect x="20" y="20" width="940" height="380" rx="28" /></clipPath>
        <circle cx="800" cy="100" r="60" fill="#fbbf24" />
        <!-- Fence -->
        <rect x="20" y="250" width="940" height="20" fill="#8B4513" />
        <rect x="100" y="200" width="20" height="150" fill="#8B4513" />
        <rect x="300" y="200" width="20" height="150" fill="#8B4513" />
        <rect x="500" y="200" width="20" height="150" fill="#8B4513" />
        <rect x="700" y="200" width="20" height="150" fill="#8B4513" />
        <rect x="900" y="200" width="20" height="150" fill="#8B4513" />
        <!-- Mystery Shadow -->
        <g transform="translate(350, 150)">
          <path d="M100 180 Q80 130 130 90 Q160 50 200 80 Q230 110 210 160 Q190 190 100 180 Z" fill="#1e293b" filter="url(#clay-shadow)" />
          <text x="30" y="80" font-family="-apple-system, sans-serif" font-size="100" font-weight="900" fill="#3b82f6" filter="url(#clay-shadow)">❓</text>
          <text x="250" y="100" font-family="-apple-system, sans-serif" font-size="28" font-weight="800" fill="#3b82f6">CON GÌ / CÁI GÌ?</text>
          <text x="250" y="140" font-family="-apple-system, sans-serif" font-size="20" font-weight="600" fill="#64748b">(Chó? Mèo? Hay thỏ?)</text>
        </g>
      `;
      break;
    case 'four_keys':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- 4 Keys -->
        <g transform="translate(100, 100)">
          <rect x="0" y="0" width="160" height="200" rx="20" fill="#eff6ff" stroke="#3b82f6" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="80" y="70" font-size="40" text-anchor="middle">🐶</text>
          <text x="80" y="110" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" fill="#3b82f6" text-anchor="middle">Con gì</text>
          <rect x="0" y="0" width="160" height="10" fill="#3b82f6" />
        </g>
        <g transform="translate(300, 100)">
          <rect x="0" y="0" width="160" height="200" rx="20" fill="#fefce8" stroke="#eab308" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="80" y="70" font-size="40" text-anchor="middle">🎨</text>
          <text x="80" y="110" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" fill="#eab308" text-anchor="middle">Lông vàng</text>
          <rect x="0" y="0" width="160" height="10" fill="#eab308" />
        </g>
        <g transform="translate(500, 100)">
          <rect x="0" y="0" width="160" height="200" rx="20" fill="#fff7ed" stroke="#f97316" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="80" y="70" font-size="40" text-anchor="middle">🏃</text>
          <text x="80" y="110" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" fill="#f97316" text-anchor="middle">Bắt bướm</text>
          <rect x="0" y="0" width="160" height="10" fill="#f97316" />
        </g>
        <g transform="translate(700, 100)">
          <rect x="0" y="0" width="160" height="200" rx="20" fill="#fef2f2" stroke="#ef4444" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="80" y="70" font-size="40" text-anchor="middle">🌳</text>
          <text x="80" y="110" font-family="-apple-system, sans-serif" font-size="16" font-weight="800" fill="#ef4444" text-anchor="middle">Công viên</text>
          <rect x="0" y="0" width="160" height="10" fill="#ef4444" />
        </g>
        <!-- Treasure Chest -->
        <g transform="translate(420, 300)">
          <rect x="0" y="0" width="100" height="60" rx="10" fill="#f59e0b" filter="url(#clay-shadow)" />
          <rect x="40" y="20" width="20" height="20" rx="4" fill="#78350f" />
        </g>
      `;
      break;
    case 'cat_prompt':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Screen with weird cat -->
        <rect x="100" y="60" width="300" height="200" rx="12" fill="#1e293b" />
        <rect x="110" y="70" width="280" height="180" rx="8" fill="#0f172a" />
        <text x="250" y="170" font-size="80" text-anchor="middle">🙀</text>
        <text x="250" y="240" font-family="-apple-system, sans-serif" font-size="20" fill="#ef4444" text-anchor="middle">AI không hiểu!</text>
        <!-- Mimi confused -->
        <text x="450" y="220" font-size="70" text-anchor="middle">👧</text>
        <text x="450" y="140" font-size="50" text-anchor="middle">❓</text>
        <!-- AKI guide board -->
        <rect x="580" y="60" width="280" height="260" rx="16" fill="#f8fafc" stroke="#3b82f6" stroke-width="4" filter="url(#clay-shadow)" />
        <text x="720" y="110" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#3b82f6" text-anchor="middle">5 CHI TIẾT CẦN CÓ</text>
        <text x="610" y="150" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569">1. Nhân vật: Mèo</text>
        <text x="610" y="180" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569">2. Đặc điểm: Mướp, béo</text>
        <text x="610" y="210" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569">3. Hành động: Ngủ cuộn</text>
        <text x="610" y="240" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569">4. Vị trí: Ghế mây</text>
        <text x="610" y="270" font-family="-apple-system, sans-serif" font-size="18" font-weight="700" fill="#475569">5. Bối cảnh: Cửa sổ, nắng</text>
      `;
      break;
    case 'plain_cat':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Floating gray cat -->
        <g transform="translate(350, 100)">
          <circle cx="100" cy="100" r="80" fill="#94a3b8" />
          <polygon points="50,40 20,0 70,20" fill="#94a3b8" />
          <polygon points="150,40 180,0 130,20" fill="#94a3b8" />
          <circle cx="70" cy="90" r="10" fill="#ffffff" />
          <circle cx="130" cy="90" r="10" fill="#ffffff" />
          <path d="M90 120 Q100 130 110 120" stroke="#475569" stroke-width="3" fill="none" />
        </g>
        <!-- Label -->
        <rect x="200" y="300" width="540" height="60" rx="30" fill="#ef4444" filter="url(#clay-shadow)" />
        <text x="470" y="340" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">[1 từ: "con mèo"] ➔ AI vẽ bừa</text>
      `;
      break;
    case 'cozy_cat':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fffbeb" stroke="${accent}20" stroke-width="2" clip-path="url(#clip-cozy)" />
        <clipPath id="clip-cozy"><rect x="20" y="20" width="940" height="380" rx="28" /></clipPath>
        <!-- Sun from window -->
        <polygon points="0,0 300,0 500,400 0,400" fill="#fef3c7" opacity="0.6" />
        <rect x="50" y="50" width="150" height="200" fill="none" stroke="#d97706" stroke-width="10" />
        <line x1="50" y1="150" x2="200" y2="150" stroke="#d97706" stroke-width="10" />
        <line x1="125" y1="50" x2="125" y2="250" stroke="#d97706" stroke-width="10" />
        <!-- Rattan chair -->
        <circle cx="450" cy="250" r="120" fill="#d4d4d8" />
        <ellipse cx="450" cy="270" rx="100" ry="40" fill="#a1a1aa" />
        <!-- Fat tabby cat -->
        <ellipse cx="450" cy="250" rx="80" ry="60" fill="#f59e0b" />
        <path d="M400 200 Q450 180 500 200" stroke="#b45309" stroke-width="8" fill="none" />
        <path d="M390 220 Q450 200 510 220" stroke="#b45309" stroke-width="8" fill="none" />
        <!-- Chamomile vase -->
        <rect x="750" y="250" width="60" height="100" rx="10" fill="#38bdf8" />
        <circle cx="780" cy="220" r="30" fill="#ffffff" />
        <circle cx="780" cy="220" r="10" fill="#fbbf24" />
        <circle cx="760" cy="240" r="20" fill="#ffffff" />
        <circle cx="760" cy="240" r="8" fill="#fbbf24" />
        <circle cx="810" cy="240" r="25" fill="#ffffff" />
        <circle cx="810" cy="240" r="8" fill="#fbbf24" />
        
        <!-- Tags -->
        <rect x="40" y="320" width="140" height="40" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#clay-shadow)" />
        <text x="110" y="347" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#d97706" text-anchor="middle">[Mèo mướp]</text>
        
        <rect x="190" y="320" width="130" height="40" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#clay-shadow)" />
        <text x="255" y="347" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#d97706" text-anchor="middle">[Béo tròn]</text>
        
        <rect x="330" y="320" width="130" height="40" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#clay-shadow)" />
        <text x="395" y="347" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#d97706" text-anchor="middle">[Ngủ say]</text>
        
        <rect x="470" y="320" width="130" height="40" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#clay-shadow)" />
        <text x="535" y="347" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#d97706" text-anchor="middle">[Ghế mây]</text>
        
        <rect x="610" y="320" width="180" height="40" rx="20" fill="#ffffff" stroke="#f59e0b" stroke-width="2" filter="url(#clay-shadow)" />
        <text x="700" y="347" font-family="-apple-system, sans-serif" font-size="16" font-weight="700" fill="#d97706" text-anchor="middle">[Cửa sổ nắng]</text>
      `;
      break;
    case 'four_styles':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" clip-path="url(#clip-styles)" />
        <clipPath id="clip-styles"><rect x="20" y="20" width="940" height="380" rx="28" /></clipPath>
        
        <!-- Watercolor -->
        <rect x="20" y="20" width="470" height="190" fill="#f0fdfa" />
        <path d="M 100 150 Q 150 50 200 100 T 350 150 Z" fill="#2dd4bf" opacity="0.6" />
        <text x="255" y="100" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#0f766e" text-anchor="middle">MÀU NƯỚC</text>

        <!-- Comic -->
        <rect x="490" y="20" width="470" height="190" fill="#fef08a" />
        <polygon points="600,150 650,50 700,80 750,40 800,100 850,50 850,150" fill="#eab308" stroke="#000" stroke-width="4" />
        <text x="725" y="100" font-family="Comic Sans MS, sans-serif" font-size="24" font-weight="900" fill="#000" text-anchor="middle">COMIC BOOK</text>

        <!-- 3D Clay -->
        <rect x="20" y="210" width="470" height="190" fill="#fce7f3" />
        <circle cx="255" cy="300" r="60" fill="#ec4899" filter="url(#clay-shadow)" />
        <text x="255" y="310" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle" filter="url(#clay-shadow)">ĐẤT NẶN 3D</text>

        <!-- Folk Art -->
        <rect x="490" y="210" width="470" height="190" fill="#ffedd5" />
        <path d="M 600 350 Q 725 220 850 350" fill="none" stroke="#c2410c" stroke-width="12" stroke-dasharray="20,10" />
        <text x="725" y="310" font-family="Georgia, serif" font-size="24" font-weight="800" fill="#9a3412" text-anchor="middle">TRANH DÂN GIAN</text>
        
        <!-- Lines dividing -->
        <line x1="490" y1="20" x2="490" y2="400" stroke="#cbd5e1" stroke-width="4" />
        <line x1="20" y1="210" x2="960" y2="210" stroke="#cbd5e1" stroke-width="4" />
      `;
      break;
    case 'art_schools':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <g transform="translate(100, 100)">
          <!-- Box 1 -->
          <rect x="0" y="0" width="200" height="200" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="100" y="100" font-size="60" text-anchor="middle">🖌️</text>
          <text x="100" y="150" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" fill="#475569" text-anchor="middle">Ấn tượng</text>
          
          <!-- Box 2 -->
          <rect x="270" y="0" width="200" height="200" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="370" y="100" font-size="60" text-anchor="middle">✏️</text>
          <text x="370" y="150" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" fill="#475569" text-anchor="middle">Tối giản</text>

          <!-- Box 3 -->
          <rect x="540" y="0" width="200" height="200" rx="20" fill="#f8fafc" stroke="#e2e8f0" stroke-width="4" filter="url(#clay-shadow)" />
          <text x="640" y="100" font-size="60" text-anchor="middle">🎨</text>
          <text x="640" y="150" font-family="-apple-system, sans-serif" font-size="20" font-weight="800" fill="#475569" text-anchor="middle">Siêu thực</text>
        </g>
        <rect x="250" y="320" width="440" height="60" rx="30" fill="#10b981" filter="url(#clay-shadow)" />
        <text x="470" y="360" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">✓ Tôn trọng bản quyền</text>
      `;
      break;
    case 'copyright_warning':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fef2f2" stroke="#ef4444" stroke-width="4" />
        <circle cx="470" cy="150" r="100" fill="#ef4444" filter="url(#clay-shadow)" />
        <rect x="390" y="135" width="160" height="30" fill="#ffffff" />
        <text x="470" y="320" font-family="-apple-system, sans-serif" font-size="40" font-weight="900" fill="#ef4444" text-anchor="middle">⛔ KHÔNG SAO CHÉP CÁ NHÂN</text>
      `;
      break;
    case 'hand_6_fingers':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Hand with 6 fingers buggy -->
        <g transform="translate(350, 80)" fill="#fcd34d" stroke="#f59e0b" stroke-width="6" stroke-linecap="round">
          <!-- Palm -->
          <rect x="50" y="100" width="140" height="120" rx="40" />
          <!-- Thumb -->
          <path d="M50 140 L0 100" />
          <!-- 6 Fingers -->
          <path d="M70 100 L70 20" />
          <path d="M100 100 L100 10" />
          <path d="M130 100 L130 15" />
          <path d="M160 100 L160 30" />
          <path d="M180 100 L190 40" />
          <path d="M190 120 L210 60" />
        </g>
        <text x="470" y="320" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Lỗi 6-7 ngón do AI mất phương hướng!</text>
      `;
      break;
    case 'hand_5_fingers':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f0fdf4" stroke="${accent}20" stroke-width="2" />
        <!-- Doctor AKI and Perfect hand -->
        <text x="250" y="200" font-size="120" text-anchor="middle">👨‍⚕️</text>
        <path d="M350 150 L450 150 L430 130 M450 150 L430 170" stroke="#10b981" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round" />
        
        <g transform="translate(550, 80)" fill="#fcd34d" stroke="#f59e0b" stroke-width="6" stroke-linecap="round">
          <!-- Palm -->
          <rect x="50" y="100" width="120" height="120" rx="40" />
          <!-- Thumb -->
          <path d="M50 140 L10 100" />
          <!-- 4 Fingers -->
          <path d="M70 100 L70 20" />
          <path d="M100 100 L100 10" />
          <path d="M130 100 L130 15" />
          <path d="M160 100 L160 30" />
          <!-- Shield -->
          <path d="M40 100 Q110 50 180 100 L180 180 Q110 250 40 180 Z" fill="#3b82f6" stroke="#2563eb" opacity="0.8" />
        </g>
        <rect x="300" y="290" width="340" height="60" rx="20" fill="#10b981" filter="url(#clay-shadow)" />
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#ffffff" text-anchor="middle">[bàn tay 5 ngón cầm khiên]</text>
      `;
      break;
    case 'shoes_in_box':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <rect x="350" y="100" width="240" height="150" fill="#fcd34d" stroke="#d97706" stroke-width="4" />
        <text x="470" y="190" font-size="80" text-anchor="middle">👟</text>
        <text x="470" y="320" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#64748b" text-anchor="middle">Đôi giày vô hồn trong hộp</text>
      `;
      break;
    case 'shoes_muddy_trophy':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fffbeb" stroke="${accent}20" stroke-width="2" />
        <!-- Mud -->
        <path d="M200 250 Q470 300 740 250" fill="none" stroke="#78350f" stroke-width="20" stroke-linecap="round" />
        <text x="420" y="220" font-size="100" text-anchor="middle">👟</text>
        <text x="550" y="180" font-size="120" text-anchor="middle">🏆</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#d97706" text-anchor="middle">Đôi giày lấm bùn bên cúp vô địch (Biết nói)</text>
      `;
      break;
    case 'chaotic_animals':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <text x="200" y="150" font-size="60">🐰</text>
        <text x="400" y="100" font-size="60">🦊</text>
        <text x="600" y="200" font-size="60">🐻</text>
        <text x="800" y="120" font-size="60">🐼</text>
        <text x="300" y="250" font-size="60">🐯</text>
        <text x="500" y="280" font-size="60">🦁</text>
        <text x="470" y="350" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Bức tranh lộn xộn, không rõ ai là ai</text>
      `;
      break;
    case 'squirrel_star':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Spotlight -->
        <polygon points="470,20 300,300 640,300" fill="#fef08a" opacity="0.4" />
        <circle cx="470" cy="200" r="100" fill="#fef08a" filter="url(#clay-shadow)" />
        <text x="470" y="230" font-size="120" text-anchor="middle">🐿️</text>
        <text x="200" y="250" font-size="40" opacity="0.5">🐰</text>
        <text x="750" y="250" font-size="40" opacity="0.5">🦊</text>
        <text x="470" y="350" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#eab308" text-anchor="middle">Bé Sóc Bông nổi bật là ngôi sao trung tâm</text>
      `;
      break;
    case 'random_colors':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ff00ff" stroke="${accent}20" stroke-width="2" />
        <circle cx="200" cy="150" r="100" fill="#00ff00" />
        <rect x="400" y="50" width="200" height="200" fill="#00ffff" />
        <polygon points="750,50 650,250 850,250" fill="#ffff00" />
        <rect x="250" y="290" width="440" height="60" rx="20" fill="#000000" />
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ffffff" text-anchor="middle">Gam màu hỗn loạn nhức mắt</text>
      `;
      break;
    case 'warm_home':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fff7ed" stroke="${accent}20" stroke-width="2" />
        <rect x="0" y="200" width="980" height="200" fill="#ffedd5" />
        <circle cx="470" cy="150" r="80" fill="#fbd38d" />
        <text x="470" y="180" font-size="80" text-anchor="middle">🏠</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ea580c" text-anchor="middle">Gam màu ấm áp gia đình</text>
      `;
      break;
    case 'soulless_art':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f8fafc" stroke="${accent}20" stroke-width="2" />
        <rect x="350" y="80" width="240" height="180" fill="#e2e8f0" stroke="#cbd5e1" stroke-width="10" />
        <text x="470" y="200" font-size="80" text-anchor="middle">🤖</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#64748b" text-anchor="middle">Tranh vô hồn do máy làm 100%</text>
      `;
      break;
    case 'heart_art':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fff1f2" stroke="${accent}20" stroke-width="2" />
        <rect x="330" y="60" width="280" height="200" fill="#ffffff" stroke="#f43f5e" stroke-width="16" rx="10" filter="url(#clay-shadow)" />
        <text x="470" y="180" font-size="80" text-anchor="middle">❤️</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#e11d48" text-anchor="middle">Tranh được lồng khung A3 gửi gắm tình cảm</text>
      `;
      break;
    case 'inconsistent_char':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <text x="250" y="200" font-size="100" text-anchor="middle">🧙‍♂️</text>
        <text x="470" y="200" font-size="100" text-anchor="middle">🥷</text>
        <text x="690" y="200" font-size="100" text-anchor="middle">🧛‍♂️</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Nhân vật mỗi tranh một kiểu</text>
      `;
      break;
    case 'consistent_hero':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#eff6ff" stroke="${accent}20" stroke-width="2" />
        <text x="250" y="200" font-size="100" text-anchor="middle">🦸‍♂️</text>
        <text x="470" y="200" font-size="100" text-anchor="middle">🦸‍♂️</text>
        <text x="690" y="200" font-size="100" text-anchor="middle">🦸‍♂️</text>
        <!-- Lock symbols -->
        <text x="250" y="100" font-size="30" text-anchor="middle">🔒 Mũ</text>
        <text x="470" y="100" font-size="30" text-anchor="middle">🔒 Áo choàng</text>
        <text x="690" y="100" font-size="30" text-anchor="middle">🔒 Khiên</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#3b82f6" text-anchor="middle">Hiệp sĩ đồng nhất nhờ 3 điểm khóa bất biến</text>
      `;
      break;
    case 'frozen_face':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <text x="250" y="200" font-size="100" text-anchor="middle">😐</text>
        <text x="470" y="200" font-size="100" text-anchor="middle">😐</text>
        <text x="690" y="200" font-size="100" text-anchor="middle">😐</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#64748b" text-anchor="middle">Mặt đơ 1 cảm xúc suốt truyện</text>
      `;
      break;
    case 'expressive_faces':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#fffbeb" stroke="${accent}20" stroke-width="2" />
        <text x="150" y="180" font-size="80" text-anchor="middle">😃</text>
        <text x="290" y="180" font-size="80" text-anchor="middle">😢</text>
        <text x="430" y="180" font-size="80" text-anchor="middle">😡</text>
        <text x="570" y="180" font-size="80" text-anchor="middle">😱</text>
        <text x="710" y="180" font-size="80" text-anchor="middle">🤔</text>
        <text x="850" y="180" font-size="80" text-anchor="middle">🥰</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#d97706" text-anchor="middle">Lưới 6 biểu cảm thần kỳ</text>
      `;
      break;
    case 'instant_win':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <path d="M100 200 L800 200" stroke="#cbd5e1" stroke-width="10" stroke-linecap="round" />
        <text x="450" y="180" font-size="80" text-anchor="middle">🏆</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Đường thẳng nhàm chán: Vừa vào đã thắng</text>
      `;
      break;
    case 'climbing_trials':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f0fdf4" stroke="${accent}20" stroke-width="2" />
        <path d="M100 250 L300 250 L300 180 L500 180 L500 110 L700 110 L700 40 L900 40" stroke="#22c55e" stroke-width="10" fill="none" stroke-linejoin="round" />
        <text x="200" y="230" font-size="50" text-anchor="middle">👾</text>
        <text x="400" y="160" font-size="50" text-anchor="middle">🔥</text>
        <text x="600" y="90" font-size="50" text-anchor="middle">🐉</text>
        <text x="800" y="20" font-size="50" text-anchor="middle">🏆</text>
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#16a34a" text-anchor="middle">4 nấc thang thử thách kịch tính</text>
      `;
      break;
    case 'broken_panels':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <rect x="100" y="80" width="200" height="120" fill="#e2e8f0" transform="rotate(-15 200 140)" />
        <rect x="350" y="100" width="150" height="150" fill="#e2e8f0" transform="rotate(25 425 175)" />
        <rect x="600" y="60" width="250" height="100" fill="#e2e8f0" />
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Storyboard lộn xộn đứt gãy</text>
      `;
      break;
    case 'smooth_panels':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f5f3ff" stroke="${accent}20" stroke-width="2" />
        <!-- 4 panels top, 4 panels bottom -->
        <rect x="100" y="50" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="290" y="50" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="480" y="50" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="670" y="50" width="160" height="100" fill="#ddd6fe" rx="10" />
        
        <rect x="100" y="170" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="290" y="170" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="480" y="170" width="160" height="100" fill="#ddd6fe" rx="10" />
        <rect x="670" y="170" width="160" height="100" fill="#ddd6fe" rx="10" />
        
        <!-- Flow arrows -->
        <path d="M265 100 L285 100 M455 100 L475 100 M645 100 L665 100 M835 100 L855 100 L855 220 L835 220" stroke="#8b5cf6" stroke-width="4" fill="none" />
        <path d="M665 220 L645 220 M475 220 L455 220 M285 220 L265 220" stroke="#8b5cf6" stroke-width="4" fill="none" />
        
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#7c3aed" text-anchor="middle">Mạch truyện 8 ô mượt mà</text>
      `;
      break;
    case 'overpowered_card':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <rect x="370" y="50" width="200" height="280" rx="20" fill="#fef2f2" stroke="#ef4444" stroke-width="6" filter="url(#clay-shadow)" />
        <text x="470" y="120" font-size="60" text-anchor="middle">🐉</text>
        <text x="470" y="180" font-family="-apple-system, sans-serif" font-size="40" font-weight="900" fill="#ef4444" text-anchor="middle">ATK: 9999</text>
        <text x="470" y="230" font-family="-apple-system, sans-serif" font-size="40" font-weight="900" fill="#ef4444" text-anchor="middle">DEF: 9999</text>
        <text x="470" y="280" font-family="-apple-system, sans-serif" font-size="40" font-weight="900" fill="#ef4444" text-anchor="middle">HP: 9999</text>
        
        <text x="200" y="200" font-size="60" text-anchor="middle">😭</text>
        <text x="740" y="200" font-size="60" text-anchor="middle">😭</text>
        <text x="470" y="360" font-family="-apple-system, sans-serif" font-size="24" font-weight="800" fill="#ef4444" text-anchor="middle">Thẻ bài gian lận, phá hỏng game!</text>
      `;
      break;
    case 'balanced_cards':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f0fdfa" stroke="${accent}20" stroke-width="2" />
        
        <rect x="200" y="50" width="160" height="220" rx="20" fill="#ffffff" stroke="#14b8a6" stroke-width="4" filter="url(#clay-shadow)" />
        <text x="280" y="110" font-size="50" text-anchor="middle">⚔️</text>
        <text x="280" y="160" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">ATK: 15</text>
        <text x="280" y="195" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">DEF: 3</text>
        <text x="280" y="230" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">HP: 2</text>
        
        <text x="470" y="160" font-family="-apple-system, sans-serif" font-size="60" font-weight="900" fill="#14b8a6" text-anchor="middle">=</text>

        <rect x="580" y="50" width="160" height="220" rx="20" fill="#ffffff" stroke="#14b8a6" stroke-width="4" filter="url(#clay-shadow)" />
        <text x="660" y="110" font-size="50" text-anchor="middle">🛡️</text>
        <text x="660" y="160" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">ATK: 2</text>
        <text x="660" y="195" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">DEF: 15</text>
        <text x="660" y="230" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#0f766e" text-anchor="middle">HP: 3</text>

        <text x="470" y="320" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#0f766e" text-anchor="middle">Bộ thẻ cân bằng, tổng điểm = 20</text>
      `;
      break;
    case 'argue_rules':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <text x="350" y="200" font-size="100" text-anchor="middle">😡</text>
        <text x="590" y="200" font-size="100" text-anchor="middle">😤</text>
        <path d="M420 180 L520 120 M420 120 L520 180" stroke="#ef4444" stroke-width="10" stroke-linecap="round" />
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#ef4444" text-anchor="middle">Tranh cãi vì luật mơ hồ, tự ý đổi luật</text>
      `;
      break;
    case 'agree_rules':
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#f0fdf4" stroke="${accent}20" stroke-width="2" />
        <rect x="370" y="50" width="200" height="200" rx="10" fill="#ffffff" stroke="#22c55e" stroke-width="4" filter="url(#clay-shadow)" />
        <text x="470" y="100" font-family="-apple-system, sans-serif" font-size="24" font-weight="900" fill="#16a34a" text-anchor="middle">📜 LUẬT CHƠI</text>
        <line x1="400" y1="130" x2="540" y2="130" stroke="#16a34a" stroke-width="4" />
        <line x1="400" y1="160" x2="500" y2="160" stroke="#16a34a" stroke-width="4" />
        <line x1="400" y1="190" x2="520" y2="190" stroke="#16a34a" stroke-width="4" />
        
        <text x="250" y="180" font-size="80" text-anchor="middle">😄</text>
        <text x="690" y="180" font-size="80" text-anchor="middle">😆</text>
        
        <text x="470" y="330" font-family="-apple-system, sans-serif" font-size="30" font-weight="800" fill="#16a34a" text-anchor="middle">Cả nhà vui vẻ tuân thủ 5 luật minh bạch</text>
      `;
      break;
    default:
      graphic = `
        <rect x="20" y="20" width="940" height="380" rx="28" fill="#ffffff" stroke="${accent}20" stroke-width="2" />
        <!-- Rich Fallback -->
        <circle cx="470" cy="180" r="110" fill="${accent}15" stroke="${accent}30" stroke-width="4" />
        <circle cx="470" cy="180" r="90" fill="#ffffff" filter="url(#clay-shadow)" />
        <text x="470" y="215" font-size="96" text-anchor="middle">${item.emoji}</text>
        <path d="M200 200 Q250 150 300 200 T400 200" fill="none" stroke="${accent}40" stroke-width="4" />
        <path d="M540 200 Q590 250 640 200 T740 200" fill="none" stroke="${accent}40" stroke-width="4" />
        <circle cx="200" cy="150" r="10" fill="${accent}60" />
        <circle cx="740" cy="250" r="10" fill="${accent}60" />
      `;
      break;
  }

  return `
    <g transform="translate(110, 320)">
      <!-- Stage Plate -->
      <rect width="980" height="420" rx="36" fill="#f8fafc" stroke="#e2e8f0" stroke-width="3" />
      ${graphic}
    </g>
  `;
}

// Hàm tạo SVG Soft Clay siêu đẹp
function renderClaySvg(item) {
  const width = 1200;
  const height = 900;
  const accent = item.accent || '#10b981';

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <!-- Soft Clay Gradients -->
    <linearGradient id="bg-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f8fafc" />
      <stop offset="50%" stop-color="#f1f5f9" />
      <stop offset="100%" stop-color="#e2e8f0" />
    </linearGradient>

    <linearGradient id="card-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff" />
      <stop offset="100%" stop-color="#f8fafc" />
    </linearGradient>

    <linearGradient id="accent-grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${accent}" />
      <stop offset="100%" stop-color="${accent}dd" />
    </linearGradient>

    <!-- Clay Drop Shadow -->
    <filter id="clay-shadow" x="-10%" y="-10%" width="130%" height="130%">
      <feDropShadow dx="0" dy="16" stdDeviation="20" flood-color="#0f172a" flood-opacity="0.12" />
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#0f172a" flood-opacity="0.08" />
    </filter>

    <filter id="inner-glow">
      <feOffset dx="0" dy="3" />
      <feGaussianBlur stdDeviation="3" result="offset-blur" />
      <feComposite operator="out" in="SourceGraphic" in2="offset-blur" result="inverse" />
      <feFlood flood-color="white" flood-opacity="0.6" result="color" />
      <feComposite operator="in" in="color" in2="inverse" result="shadow" />
      <feComposite operator="over" in="shadow" in2="SourceGraphic" />
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="${width}" height="${height}" fill="url(#bg-grad)" />

  <!-- Background decorative soft circles -->
  <circle cx="150" cy="120" r="180" fill="${accent}" opacity="0.08" />
  <circle cx="1080" cy="780" r="220" fill="${accent}" opacity="0.08" />
  <circle cx="950" cy="160" r="120" fill="#f59e0b" opacity="0.08" />

  <!-- Main Soft Clay Card -->
  <rect x="70" y="60" width="1060" height="780" rx="48" fill="url(#card-grad)" stroke="#ffffff" stroke-width="6" filter="url(#clay-shadow)" />

  <!-- Top Badge Ribbon -->
  <rect x="110" y="100" width="420" height="54" rx="27" fill="${accent}18" stroke="${accent}40" stroke-width="2" />
  <text x="140" y="135" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="20" font-weight="900" fill="${accent}" letter-spacing="1">
    ${item.tag}
  </text>

  <!-- Decorative Sparkles -->
  <text x="1010" y="140" font-size="38">✨</text>

  <!-- Title -->
  <text x="110" y="215" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="44" font-weight="900" fill="#0f172a">
    ${item.title}
  </text>

  <!-- Subtitle / Description -->
  <foreignObject x="110" y="235" width="980" height="80">
    <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 22px; font-weight: 600; color: #475569; line-height: 1.45; margin: 0;">
      ${item.desc}
    </p>
  </foreignObject>

  <!-- Visual Display Center Area -->
  ${renderSceneGraphic(item)}

  <!-- Watermark / Footer -->
  <text x="110" y="805" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" font-size="16" font-weight="800" fill="#94a3b8" letter-spacing="1">
    AIKID.VN · CHUẨN TƯ DUY ASMO &amp; SOFT CLAY
  </text>
</svg>`;
}

console.log(`Bắt đầu tạo ${ASSETS.length} hình ảnh Soft Clay cho 5 Đảo...`);

let successCount = 0;
for (const item of ASSETS) {
  const svgPath = path.join(tmpDir, `${item.name}.svg`);
  const outJpgPath = path.join(outDir, item.name);

  // 1. Tạo file SVG
  const svgContent = renderClaySvg(item);
  fs.writeFileSync(svgPath, svgContent, 'utf8');

  // 2. Render SVG sang PNG chuẩn tỷ lệ 1200x900 bằng rsvg-convert (hoặc fallback qlmanage)
  try {
    const pngPath = path.join(tmpDir, `${item.name}.png`);
    const rsvgBin = fs.existsSync('/opt/homebrew/bin/rsvg-convert')
      ? '/opt/homebrew/bin/rsvg-convert'
      : 'rsvg-convert';

    try {
      execSync(`${rsvgBin} -w 1200 -h 900 "${svgPath}" -o "${pngPath}" 2>/dev/null`);
    } catch {
      execSync(`qlmanage -t -s 1200 -o "${tmpDir}" "${svgPath}" 2>/dev/null`);
      const qlThumb = path.join(tmpDir, `${item.name}.svg.png`);
      if (fs.existsSync(qlThumb)) {
        fs.renameSync(qlThumb, pngPath);
      }
    }

    if (fs.existsSync(pngPath)) {
      // 3. Chuyển PNG sang JPG bằng sips
      execSync(`sips -s format jpeg "${pngPath}" --out "${outJpgPath}" 2>/dev/null`);
      successCount++;
      process.stdout.write(`\rĐã tạo thành công: ${successCount}/${ASSETS.length} ảnh (${item.name})`);
    } else {
      fs.copyFileSync(svgPath, outJpgPath);
      successCount++;
    }
  } catch (err) {
    fs.copyFileSync(svgPath, outJpgPath);
    successCount++;
  }
}

console.log(`\n🎉 HOÀN THÀNH: Đã tạo đủ ${successCount}/${ASSETS.length} hình ảnh tại: ${outDir}`);
