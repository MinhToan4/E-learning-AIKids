import csv
import os
import re
import json

BASE_DIR = "/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids"
CSV_DIR = os.path.join(BASE_DIR, "scripts/curriculum_export")
OUT_MD = os.path.join(BASE_DIR, "video-storyboards/STORYBOARD_MASTER_M1_M5.md")
OUT_HTML = os.path.join(BASE_DIR, "video-storyboards/index.html")
BRAIN_MD = "/Users/imam/.gemini/antigravity/brain/0a457787-0752-43e8-b7bb-4e19e5561494/storyboard_master_m1_m5.md"

CSV_CONFIG = [
    ("M1", "M1_NhaThamHiem.csv", "NHÀ THÁM HIỂM AI", "assets/MasterIslands/M1_Master_DaoNhaThamHiem.jpg"),
    ("M2", "M2_HoaSiAI.csv", "HỌA SĨ AI", "assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg"),
    ("M3", "M3_BietDoiNhanVat.csv", "BIỆT ĐỘI NHÂN VẬT AI", "assets/MasterIslands/M3_Master_DaoBietDoiNhanVat.jpg"),
    ("M4", "M4_VuongQuocTruyenTranh.csv", "VƯƠNG QUỐC TRUYỆN TRANH AI", "assets/MasterIslands/M4_Master_DaoVuongQuocTruyenTranh.jpg"),
    ("M5", "M5_NhaPhatMinhTroChoi.csv", "NHÀ PHÁT MINH TRÒ CHƠI AI", "assets/MasterIslands/M5_Master_DaoNhaPhatMinhTroChoi.jpg"),
]

ASSET_MAP = {
    # M1
    ("1.1", "2. TÌNH HUỐNG"): ("assets/M1_NhaThamHiemAI/M1.1_FrameA_MeoDonDieu_1Tu.jpg", "Chú mèo xám đơn điệu giữa nền trống (chỉ gõ 1 từ 'con mèo')"),
    ("1.1", "4. LÀM CÙNG"): ("assets/M1_NhaThamHiemAI/M1.2_FrameC_MeoMuopNguGheMay_TaDu4ChiaKhoa.jpg", "Mèo mướp vàng béo ngủ cuộn tròn trên ghế mây bên cửa sổ ngập nắng khi tả đủ chi tiết"),
    ("1.2", "2. TÌNH HUỐNG"): ("assets/M1_NhaThamHiemAI/M1.2_FrameA_MeoMoAo_TaChungChung.jpg", "Mèo mờ ảo như đám mây khi chỉ tả từ cảm xúc chung chung 'rất đẹp, đáng yêu'"),
    ("1.2", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M1_NhaThamHiemAI/M1.2_FrameB_4ChiecChiaKhoaVang.jpg", "Bốn chiếc chìa khoá vàng đất nặn sáng rực tương ứng 4 màu sắc câu hỏi"),
    ("1.2", "4. LÀM CÙNG"): ("assets/M1_NhaThamHiemAI/M1.2_FrameC_MeoMuopNguGheMay_TaDu4ChiaKhoa.jpg", "Tác phẩm chuẩn: Mèo mướp béo ngủ ghế mây khi tra đủ 4 chìa khoá"),
    ("1.3", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M1_NhaThamHiemAI/M1.3_FrameA_4PhongCachConTrau.jpg", "4 Khung tranh con trâu qua 4 phong cách: Màu nước, Comic, Đất nặn 3D, Tranh Đông Hồ"),
    ("1.4", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M1_NhaThamHiemAI/M1.4_FrameA_SoSanhTay6NgonVa5Ngon.jpg", "So sánh đối chiếu: Bàn tay 6 ngón lỗi AI do bấm nút bừa bãi vs Bàn tay 5 ngón cầm bút hoàn chỉnh"),
    # M2
    ("2.1", "2. TÌNH HUỐNG"): ("assets/M2_HoaSiAI/M2.1_FrameA_BucTranhBietNoi_NgayMuaBao.jpg", "Tấm ảnh cũ ngày mưa: Chú cún trốn dưới ghế, dép vàng trôi ngoài hiên, áo mưa vàng trên tường"),
    ("2.1", "4. LÀM CÙNG"): ("assets/M2_HoaSiAI/M2.1_FrameA_BucTranhBietNoi_NgayMuaBao.jpg", "Bức tranh biết nói: 3 manh mối Đang làm gì? Có gì lạ? Rồi sao?"),
    ("2.2", "2. TÌNH HUỐNG"): ("assets/M2_HoaSiAI/M2.2_FrameA_TinhHuong_TiecSinhNhatHonLoan.jpg", "Bữa tiệc sinh nhật hỗn loạn, 20 thứ chen chúc, bánh kem to khổng lồ che lấp em Bống"),
    ("2.2", "4. LÀM CÙNG"): ("assets/M2_HoaSiAI/M2.2_FrameB_KetQua_BoCuc3Lop_MeoNgoiSao.jpg", "Bố cục 3 lớp hoàn hảo: Ghế bành gỗ (tiền cảnh), Mèo ngôi sao ở giữa (trung cảnh), Cây xanh đồi cỏ (hậu cảnh)"),
    ("2.3", "2. TÌNH HUỐNG"): ("assets/M2_HoaSiAI/M2.3_FrameA_TinhHuong_PosterPhimKinhDiVuiTuoi.jpg", "Poster phim kinh dị nhưng vẽ ngôi nhà cũ trời nắng chang chang, bướm hoa vui tươi như quảng cáo dã ngoại"),
    ("2.3", "4. LÀM CÙNG"): ("assets/M2_HoaSiAI/M2.3_FrameB_KetQua_XeDapCuHoangHonAmAp.jpg", "Chiếc xe đạp cũ chở giỏ rau góc sân trong ánh hoàng hôn vàng cam ấm áp hoài niệm"),
    ("2.4", "2. TÌNH HUỐNG"): ("assets/M2_HoaSiAI/M2.4_FrameA_KietTac_ChiecDieuCuoiCungMuaHe.jpg", "Bức tranh cậu bé thả diều nhưng thiếu tên gợi mở hoặc tên nhàm chán"),
    ("2.4", "4. LÀM CÙNG"): ("assets/M2_HoaSiAI/M2.4_FrameA_KietTac_ChiecDieuCuoiCungMuaHe.jpg", "Kiệt tác A3 đóng khung gỗ: 'Chiếc diều cuối cùng của mùa hè' đủ 4 mảnh ghép"),
    # M3
    ("3.1", "2. TÌNH HUỐNG"): ("assets/M3_BietDoiNhanVat/M3.1_FrameA_HoSoNhanVat_ChuotTepHopNapChai.jpg", "So sánh siêu anh hùng rỗng tuếch vs chú chuột Tép tai lệch có tính cách cụ thể"),
    ("3.1", "4. LÀM CÙNG"): ("assets/M3_BietDoiNhanVat/M3.1_FrameA_HoSoNhanVat_ChuotTepHopNapChai.jpg", "Hồ sơ 6 ô của Tép: thích nắp chai, dở buộc dây giày, sợ cái cống, mơ đi hết con đường mới"),
    ("3.2", "2. TÌNH HUỐNG"): ("assets/M3_BietDoiNhanVat/M3.2_FrameA_TinhHuong_NhanVatBiTroi3Kieu.jpg", "3 Bức tranh cùng tả nhân vật nhưng bị trôi: đổi mũ, đổi tóc xoăn, đổi áo khoác"),
    ("3.2", "4. LÀM CÙNG"): ("assets/M3_BietDoiNhanVat/M3.2_FrameB_KetQua_MatMaNhanDien360Do.jpg", "Bản xoay Turnaround 360° của Bí: Mũ len đỏ quả bông, áo xanh 2 túi, ủng vàng"),
    ("3.3", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M3_BietDoiNhanVat/M3.3_FrameA_BienHoaBieuCam_DoiMatKhongDoiNguoi.jpg", "Bộ biểu cảm: 'Đổi mặt - Không đổi người' của chú cún cưng đeo chuông vàng"),
    ("3.3", "4. LÀM CÙNG"): ("assets/M3_BietDoiNhanVat/M3.3_FrameA_BienHoaBieuCam_DoiMatKhongDoiNguoi.jpg", "4 Sắc thái vui vẻ, kinh ngạc, hờn dỗi, ngáp ngủ nhưng giữ nguyên đặc điểm nhận diện"),
    ("3.4", "2. TÌNH HUỐNG"): ("assets/M3_BietDoiNhanVat/M3.4_FrameA_TinhHuong_ChuotTepNgaiVangLacLong.jpg", "Chú chuột Tép bối rối lọt thỏm trên ngai vàng lâu đài nguy nga lệch với tính cách"),
    ("3.4", "4. LÀM CÙNG"): ("assets/M3_BietDoiNhanVat/M3.4_FrameB_KetQua_CanCuAmCungHocCay.jpg", "Căn cứ ấm cúng đúng chất Tép trong hốc cây: hộp nắp chai xếp màu, bản đồ vẽ tay, cuộn dây giày"),
    # M4
    ("4.1", "2. TÌNH HUỐNG"): ("assets/M4_VuongQuocTruyenTranh/M4.1_FrameA_Cong2_CoChuyen_QuaBongKetHangRao.jpg", "Cổng 2 (Có chuyện): Mèo con với tay qua rào tìm quả bóng đỏ bị kẹt"),
    ("4.1", "4. LÀM CÙNG"): ("assets/M4_VuongQuocTruyenTranh/M4.1_FrameB_Cong3_GiaiQuyet_TimLaiCaBong.jpg", "Cổng 3 (Giải quyết): Mèo con tìm thấy chú cá bông yêu thích dưới hiên nắng chiều"),
    ("4.2", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M4_VuongQuocTruyenTranh/M4.2_FrameA_4ChangThuThach_CuuHuyHieuSao.jpg", "4 Chặng thử thách Muốn - Cản - Làm - Kết: Bé che ô vượt sấm sét cứu huy hiệu sao"),
    ("4.2", "4. LÀM CÙNG"): ("assets/M4_VuongQuocTruyenTranh/M4.2_FrameA_4ChangThuThach_CuuHuyHieuSao.jpg", "Chiến thắng thử thách: Huy hiệu sao vàng cầm trong tay an toàn"),
    ("4.3", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M4_VuongQuocTruyenTranh/M4.3_FrameA_Storyboard8OOQue.jpg", "Bàn phác thảo Storyboard 8 ô que nháp trên giấy: Một ô - Một việc"),
    ("4.3", "4. LÀM CÙNG"): ("assets/M4_VuongQuocTruyenTranh/M4.3_FrameA_Storyboard8OOQue.jpg", "Bản đồ 8 ô storyboard hoàn thiện trước khi bấm nút tạo hình"),
    ("4.4", "4. LÀM CÙNG"): ("assets/M4_VuongQuocTruyenTranh/M4.4_FrameA_KhoaHinh_MayBayGiayTrenCay.jpg", "Khung truyện mẫu đúng người đúng việc đúng kiểu: Bé áo cam nhìn máy bay giấy trên cây"),
    ("4.5", "4. LÀM CÙNG"): ("assets/M4_VuongQuocTruyenTranh/M4.5_FrameA_VuongMienHoanHao_CuonTruyen8Trang.jpg", "Sản phẩm M4: Cuốn truyện tranh 8 trang hoàn chỉnh đóng gáy thủ công mở trên bàn"),
    # M5
    ("5.1", "3. XEM MẪU + DẠY 1 KỸ NĂNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.1_FrameA_BoSuuTap12MonLamBep.jpg", "Bộ sưu tập 12 món đồ làm bếp đất nặn tí hon sắp xếp ngăn nắp trên bàn gỗ"),
    ("5.1", "4. LÀM CÙNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.1_FrameA_BoSuuTap12MonLamBep.jpg", "12 Món đồ cùng 1 chủ đề gần gũi không bị trùng, không nhạt nhẽo"),
    ("5.2", "2. TÌNH HUỐNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.2_FrameA_TinhHuong_TheBaDaoMatCanBang.jpg", "Thẻ bá đạo 10-10-10 đè bẹp tất cả thẻ khác làm đối thủ nản lòng bỏ về"),
    ("5.2", "4. LÀM CÙNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.2_FrameB_KetQua_TheChaoRanCanBang12Diem.jpg", "Thẻ chảo rán cân bằng chỉ số Tim (Sức 8) - Sét (Nhanh 2) - Sao (Khéo 2) tổng 12 điểm"),
    ("5.3", "2. TÌNH HUỐNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.3_FrameA_TinhHuong_BoTheLacPhongCach.jpg", "12 Thẻ bài mỗi thẻ vẽ một kiểu tả pí lù (pixel, màu nước, đen trắng, nhìn trên xuống)"),
    ("5.3", "4. LÀM CÙNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.3_FrameB_KetQua_Bo12TheKhoaPhongCach.jpg", "Bộ 12 thẻ khóa công thức nền: đồng nhất góc nhìn ngang, viền bo tròn, nền pastel"),
    ("5.4", "4. LÀM CÙNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.4_FrameA_DauTruongKhaiMo_BanCoHoanChinh.jpg", "Bàn cờ game phiêu lưu hoàn chỉnh: đường đi ô cờ, xúc xắc, quân cờ và cổng thành vinh quang"),
    ("5.5", "4. LÀM CÙNG"): ("assets/M5_NhaPhatMinhTroChoi/M5.4_FrameA_DauTruongKhaiMo_BanCoHoanChinh.jpg", "Đấu trường khai mở: Ván đấu boardgame thật chơi cùng cả nhà"),
}

all_modules = []

for mod_code, csv_filename, mod_title, island_img in CSV_CONFIG:
    csv_path = os.path.join(CSV_DIR, csv_filename)
    if not os.path.exists(csv_path):
        continue
    
    current_module = {
        "code": mod_code,
        "title": mod_title,
        "island_img": island_img,
        "lessons": []
    }
    
    with open(csv_path, "r", encoding="utf-8", errors="ignore") as fp:
        reader = csv.reader(fp)
        in_p2 = False
        cur_lesson = None
        
        for row in reader:
            if not row: continue
            col0 = row[0].strip()
            if "PHẦN 2" in col0:
                in_p2 = True
                continue
            if not in_p2:
                continue
            
            # Check lesson header
            if col0.startswith("Bài ") or "Bài " in col0:
                # e.g. "Bài 2.1 — Bức tranh biết nói"
                lesson_title = col0
                match = re.search(r"(\d+\.\d+)", lesson_title)
                num = match.group(1) if match else "1.1"
                cur_lesson = {
                    "num": num,
                    "title": lesson_title,
                    "segments": []
                }
                current_module["lessons"].append(cur_lesson)
            elif cur_lesson is not None and len(row) >= 4:
                seg_name = row[1].strip() if len(row) > 1 else ""
                timing = row[2].strip() if len(row) > 2 else ""
                dialogue = row[3].strip() if len(row) > 3 else ""
                voice_gen = row[4].strip() if len(row) > 4 else ""
                visual_dir = row[5].strip() if len(row) > 5 else ""
                notes = row[6].strip() if len(row) > 6 else ""
                
                if seg_name and timing:
                    # Find asset
                    key = (cur_lesson["num"], seg_name)
                    asset_info = ASSET_MAP.get(key, (None, ""))
                    
                    cur_lesson["segments"].append({
                        "seg_name": seg_name,
                        "timing": timing,
                        "dialogue": dialogue,
                        "voice_gen": voice_gen if voice_gen else dialogue,
                        "visual_dir": visual_dir,
                        "notes": notes,
                        "asset_file": asset_info[0],
                        "asset_desc": asset_info[1]
                    })
    all_modules.append(current_module)

print("Parsed", len(all_modules), "modules.")

# Generate Master Markdown
md_lines = []
md_lines.append("# 🎬 TỔNG HỢP STORYBOARD TOÀN DIỆN CHI TIẾT (M1 — M5)")
md_lines.append("> **Bản kịch bản sản xuất chuẩn hoá bao gồm toàn bộ LỜI THOẠI, VOICE GEN (CÓ TAG CẢM XÚC), TIMELINE, HÌNH ẢNH TRÊN MÀN HÌNH và FILE ASSET ĐẤT NẶN 2D FLAT SOFT CLAY.**\n")
md_lines.append("## 🌟 DANH MỤC 5 ĐẢO LỚN (MASTER ISLANDS)\n")

for m in all_modules:
    md_lines.append(f"### {m['code']} — {m['title']}")
    md_lines.append(f"![{m['title']}](/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/video-storyboards/{m['island_img']})")
    md_lines.append(f"*File asset:* `{m['island_img']}`\n")

md_lines.append("---\n")

for m in all_modules:
    md_lines.append(f"# 🏝️ {m['code']} — {m['title']}\n")
    for les in m["lessons"]:
        md_lines.append(f"## 📚 {les['title']}\n")
        
        for seg in les["segments"]:
            md_lines.append(f"### ⏱️ Phân đoạn: {seg['seg_name']} ({seg['timing']})")
            
            # Voice Gen Box
            md_lines.append("#### 🎙️ Lời thoại Voice Gen (kèm Tag cảm xúc):")
            md_lines.append(f"> {seg['voice_gen'].replace(chr(10), chr(10) + '> ')}\n")
            
            # On Screen Visuals Box
            md_lines.append("#### 📺 Hình ảnh hiển thị trên màn hình (On-Screen Visuals & Editor Notes):")
            if seg["asset_file"]:
                img_path = f"/Users/imam/storymee/1-Harness-Apps/E-learning-AIKids/video-storyboards/{seg['asset_file']}"
                md_lines.append(f"![{seg['asset_desc']}]({img_path})")
                md_lines.append(f"* **Asset File:** `{seg['asset_file']}`")
                md_lines.append(f"* **Nội dung vẽ đất nặn:** {seg['asset_desc']}")
            
            dir_text = seg["visual_dir"] if seg["visual_dir"] else "Diễn hoạt bảng trắng hoặc hiệu ứng minh hoạ"
            md_lines.append(f"* **Chỉ đạo hình ảnh / Cần tạo:** {dir_text}")
            if seg["notes"]:
                md_lines.append(f"* **Ghi chú đội dựng:** {seg['notes']}")
            md_lines.append("\n---\n")

full_md = "\n".join(md_lines)

with open(OUT_MD, "w", encoding="utf-8") as fp:
    fp.write(full_md)

with open(BRAIN_MD, "w", encoding="utf-8") as fp:
    fp.write(full_md)

print("Generated MD successfully. Length:", len(full_md))

# Now generate a rich HTML viewer
html_template = """<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>AI Kids — Storyboard Chi Tiết (Text + Voice + Screen Visuals)</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <style>
    body { font-family: 'Plus Jakarta Sans', sans-serif; background-color: #FBF8F3; color: #1E293B; }
    .clay-card {
      background: #FFFFFF;
      border: 2px solid #EFE4D8;
      border-radius: 20px;
      box-shadow: 0 10px 25px -5px rgba(214, 169, 137, 0.12);
      transition: all 0.25s ease;
    }
    .clay-card:hover {
      box-shadow: 0 15px 30px -5px rgba(214, 169, 137, 0.22);
    }
    .voice-tag {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 700;
      margin-right: 4px;
      margin-bottom: 2px;
      background-color: #FEF3C7;
      color: #92400E;
      border: 1px solid #FDE68A;
    }
    .timing-badge {
      background: #EEF2FF;
      color: #4338CA;
      border: 1px solid #C7D2FE;
    }
  </style>
</head>
<body class="p-4 md:p-8 max-w-7xl mx-auto">
  <header class="mb-10 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
      🎬 BẢN DỰNG VIDEO CHUẨN: TEXT + VOICE GEN + SCREEN ASSETS
    </div>
    <h1 class="text-3xl md:text-5xl font-extrabold text-amber-950 mb-2">
      AI Kids — Kịch Bản Phân Cảnh Chi Tiết (M1 — M5)
    </h1>
    <p class="text-slate-600 max-w-2xl mx-auto text-sm md:text-base">
      Tích hợp đầy đủ lời thoại voice gen kèm emotion tag, mô tả hình ảnh hiển thị trên màn hình và kho hình ảnh 2D Flat Soft Clay tương ứng.
    </p>
  </header>

  <!-- Navigation Tabs -->
  <div class="flex flex-wrap items-center justify-center gap-2 mb-10 sticky top-2 z-50 bg-[#FBF8F3]/90 backdrop-blur-md p-2 rounded-2xl border border-amber-200/60 shadow-sm">
    <a href="#islands" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 transition">🏝️ 5 Đảo Lớn</a>
    <a href="#M1" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 transition">M1 Thám Hiểm</a>
    <a href="#M2" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 transition">M2 Họa Sĩ AI</a>
    <a href="#M3" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-900 border border-slate-200 transition">M3 Biệt Đội</a>
    <a href="#M4" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-blue-100 hover:text-blue-900 border border-slate-200 transition">M4 Truyện Tranh</a>
    <a href="#M5" class="px-4 py-2 rounded-xl text-xs md:text-sm font-bold bg-white text-slate-700 hover:bg-purple-100 hover:text-purple-900 border border-slate-200 transition">M5 Trò Chơi</a>
  </div>

  <!-- Master Islands Section -->
  <section id="islands" class="mb-16">
    <div class="flex items-center gap-2 mb-6">
      <span class="text-2xl">🏝️</span>
      <h2 class="text-2xl font-black text-amber-950">Bộ 5 Hòn Đảo Lớn (Master Overviews)</h2>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-5 gap-4">
"""

for m in all_modules:
    html_template += f"""
      <div class="clay-card overflow-hidden">
        <img src="{m['island_img']}" class="w-full aspect-video object-cover" alt="{m['title']}">
        <div class="p-3">
          <span class="text-xs font-bold text-amber-700 uppercase tracking-wider">{m['code']}</span>
          <h4 class="font-bold text-sm text-slate-900 mt-1">{m['title']}</h4>
        </div>
      </div>
    """

html_template += """
    </div>
  </section>
"""

# Modules details
for m in all_modules:
    html_template += f"""
  <!-- {m['code']} Section -->
  <section id="{m['code']}" class="mb-20">
    <div class="flex items-center justify-between pb-4 mb-8 border-b-2 border-amber-200">
      <div class="flex items-center gap-3">
        <span class="text-3xl">🎯</span>
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-600">Module {m['code']}</span>
          <h2 class="text-2xl md:text-3xl font-black text-amber-950">{m['title']}</h2>
        </div>
      </div>
      <img src="{m['island_img']}" class="w-24 h-14 rounded-lg object-cover border border-amber-200 shadow-sm hidden md:block" alt="Island thumbnail">
    </div>
"""
    for les in m["lessons"]:
        html_template += f"""
    <!-- Lesson {les['num']} -->
    <div class="mb-12">
      <div class="bg-amber-50/80 border border-amber-200/80 rounded-xl px-4 py-2.5 mb-4 flex items-center justify-between">
        <h3 class="text-base md:text-lg font-black text-amber-950 flex items-center gap-2">
          <span>📖</span> {les['title']}
        </h3>
        <span class="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border border-amber-200 text-amber-800">7 Phút / Tập</span>
      </div>

      <div class="space-y-4">
"""
        for seg in les["segments"]:
            # Format voice gen tags
            highlighted_voice = seg["voice_gen"]
            # Highlight tags like [excited], [calm], etc.
            highlighted_voice = re.sub(r'(\[[a-zA-Z_\-]+\])', r'<span class="voice-tag">\1</span>', highlighted_voice)
            highlighted_voice = highlighted_voice.replace("\n", "<br>")
            
            asset_col = ""
            if seg["asset_file"]:
                asset_col = f"""
                <div class="w-full md:w-5/12 flex-shrink-0">
                  <div class="rounded-xl overflow-hidden border-2 border-amber-100 shadow-sm mb-2">
                    <img src="{seg['asset_file']}" class="w-full aspect-video object-cover" alt="Frame Asset">
                  </div>
                  <div class="text-[11px] text-slate-500 bg-amber-50/50 p-2 rounded-lg border border-amber-100">
                    <strong class="text-amber-900">Asset File:</strong> <code>{seg['asset_file']}</code><br>
                    <span class="text-slate-700">{seg['asset_desc']}</span>
                  </div>
                </div>
                """
            else:
                asset_col = f"""
                <div class="w-full md:w-5/12 flex-shrink-0 flex flex-col justify-center items-center bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-6 text-center">
                  <span class="text-2xl mb-1">🎬</span>
                  <p class="text-xs font-bold text-slate-700 mb-1">Diễn hoạt Mèo AKI & Bảng Trắng</p>
                  <p class="text-[11px] text-slate-500">{seg['visual_dir'] or 'Motion Graphics / Pop-up Text'}</p>
                </div>
                """

            html_template += f"""
        <div class="clay-card p-5 md:p-6">
          <div class="flex items-center justify-between mb-4">
            <span class="font-bold text-sm text-slate-900 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              {seg['seg_name']}
            </span>
            <span class="timing-badge text-xs font-extrabold px-3 py-1 rounded-full">{seg['timing']}</span>
          </div>

          <div class="flex flex-col md:flex-row gap-6">
            <!-- Left: Voice & Dialogue -->
            <div class="flex-1">
              <span class="text-[11px] uppercase tracking-wider font-extrabold text-amber-800/80 block mb-1.5">🎙️ Lời Thoại AKI & Voice Gen:</span>
              <div class="bg-[#FFFDF9] border border-amber-100/90 rounded-xl p-4 text-xs md:text-sm text-slate-700 leading-relaxed max-h-64 overflow-y-auto mb-3 shadow-inner">
                {highlighted_voice}
              </div>
              <div class="text-xs text-slate-500 flex items-start gap-2">
                <span class="text-amber-600 font-bold">📺 Chỉ đạo màn hình:</span>
                <span>{seg['visual_dir'] or 'Cắt cảnh theo nhịp thoại'}</span>
              </div>
            </div>

            <!-- Right: Screen Asset Preview -->
            {asset_col}
          </div>
        </div>
            """
        html_template += """
      </div>
    </div>
        """
    html_template += """
  </section>
    """

html_template += """
  <footer class="text-center py-8 text-xs text-slate-400 border-t border-slate-200 mt-16">
    AI Kids E-Learning · Production Storyboard System · StoryMee 2026
  </footer>
</body>
</html>
"""

with open(OUT_HTML, "w", encoding="utf-8") as fp:
    fp.write(html_template)

print("Generated HTML successfully. Length:", len(html_template))
