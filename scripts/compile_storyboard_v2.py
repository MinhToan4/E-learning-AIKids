import csv
import os
import re

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

def get_segment_asset(mod_code, lesson_num, seg_name, island_img):
    les = lesson_num.strip()
    s = seg_name.upper()
    
    # MODULE 1
    if mod_code == "M1":
        if "1.1" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.1_FrameA_MimiDaySomVeMeo.jpg", "Cô chủ nhỏ Mimi dậy sớm bên bàn làm việc ngập nắng, ngạc nhiên nhìn chú mèo đất nặn đơn điệu vì chỉ gõ 1 từ")
            elif "XEM MẪU" in s:
                return ("assets/M1_NhaThamHiemAI/M1.1_FrameB_SoSanhBenTraiBenPhai.jpg", "Tranh chia đôi: Bên trái tớ (Khung xám: Mèo đơn điệu 1 từ) vs Bên phải tớ (Khung cam ấm: Mèo mướp ngủ ghế mây 5 từ)")
            elif "KỸ NĂNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.1_FrameC_HinhTrongDau_Vs_AiTuDien.jpg", "Trực quan hoá kịch bản: Trong đầu em có hình con mèo ấm áp (Bong bóng suy nghĩ bên trái) vs AI không nhìn thấy nên tự đoán 3 ô trống (Màu xám, đứng đơ, nền xám rỗng bên phải)")
            elif "LÀM CÙNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameC_MeoMuopNguGheMay_TaDu4ChiaKhoa.jpg", "Làm cùng: Mèo mướp vàng béo ngủ cuộn tròn trên ghế mây bên cửa sổ ngập nắng khi thêm đủ 5 điều")
            elif "THỬ THÁCH" in s:
                return ("assets/M1_NhaThamHiemAI/M1.1_FrameD_BangThuThach_2BuocTao.jpg", "Bảng thử thách 2 bước: Bước 1 (1 từ/1 sao) vs Bước 2 (5 điều/5 sao) và 6 tim năng lượng tạo hình")
            else:
                return (island_img, "Đảo Nhà Thám Hiểm AI - Mở cửa xưởng sáng tạo / Chốt bài học")
        elif "1.2" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameA_MeoMoAo_TaChungChung.jpg", "Tình huống bạn Zico tả dài nhưng chung chung: Mèo mờ ảo như đám mây")
            elif "XEM MẪU" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameB_Zico_4KhoiMau_4ChiaKhoa.jpg", "Bạn Zico đất nặn bên 4 khối màu Xanh (Là gì) - Vàng (Trông thế nào) - Cam (Làm gì) - Đỏ (Ở đâu) và 4 chìa khoá")
            elif "KỸ NĂNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameB_4ChiecChiaKhoaVang.jpg", "Cận cảnh 4 chiếc chìa khoá vàng đất nặn: CÁI GÌ - TRÔNG NHƯ THẾ NÀO - ĐANG LÀM GÌ - Ở ĐÂU")
            elif "LÀM CÙNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameC_CaiCocSuMeMiengBocKhoi.jpg", "Thực hành điền đủ 4 ô: Chiếc cốc sứ trắng mẻ miệng bốc khói trên bàn gỗ cạnh cuốn sổ mở + nút Tạo sáng")
            elif "THỬ THÁCH" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_Extra_CocMeSut_DacDiemRieng.jpg", "Thử thách 4 đồ vật trong nhà: Cầm lên xoay 1 vòng nhìn kỹ đặc điểm riêng rồi mới tả")
            elif "OUTRO" in s or "CHỐT" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_FrameC_MeoMuopNguGheMay_TaDu4ChiaKhoa.jpg", "Tổng kết 4 chìa khoá vàng tạo nên bức tranh hoàn chỉnh")
            else:
                return (island_img, "Đảo Nhà Thám Hiểm AI - Mở cửa xưởng sáng tạo")
        elif "1.3" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_Extra_4PhongCachTranh.jpg", "Tình huống lạ: Cùng 1 câu lệnh nhưng ra các phong cách vẽ khác nhau")
            elif "XEM MẪU" in s:
                return ("assets/M1_NhaThamHiemAI/M1.3_FrameA_4PhongCachConTrau.jpg", "Cận cảnh 4 phong cách: Màu nước (nhoè êm), Comic (nét đậm), Đất nặn (khối bóng), Đông Hồ (mộc mạc)")
            elif "KỸ NĂNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_Extra_VoiDungYen_ThieuDongTac.jpg", "Quy tắc đạo đức AI: Gọi tên kiểu vẽ chung, không bắt chước phong cách riêng của tác giả")
            elif "LÀM CÙNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.2_Extra_ChoChay_DongTac.jpg", "Làm cùng chú cún AKI: Tạo 4 bức và chọn bức tranh màu nước êm dịu treo đầu giường")
            elif "THỬ THÁCH" in s:
                return ("assets/M1_NhaThamHiemAI/M1.3_Shot5.1_BangThuThach_4PhongCachConVat.jpg", "Thử thách 4 phong cách: Bảng chọn con vật yêu thích tạo 4 phong cách Màu nước, Comic, Đất nặn, Tranh dân gian")
            elif "OUTRO" in s or "CHỐT" in s:
                return ("assets/M1_NhaThamHiemAI/M1.1_Shot7.1_NhiemVuNgoaiManHinh_4DoVat.jpg", "Nhiệm vụ ngoài màn hình: Quan sát tranh ảnh quanh nhà chuẩn bị bài sau")
            else:
                return (island_img, "Đảo Nhà Thám Hiểm AI - Mở cửa xưởng sáng tạo")
        elif "1.4" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.4_FrameA_SoSanhTay6NgonVa5Ngon.jpg", "Tình huống bạn Bi bấm nút 5 lần đều ra bàn tay 6 ngón lỗi AI")
            elif "XEM MẪU" in s:
                return ("assets/M1_NhaThamHiemAI/M1.4_FrameB_BaoTangThatBai_5BucTranhLoi.jpg", "Bảo tàng thất bại: 5 bức tranh treo tường chỉ rõ 5 lỗi cụ thể để gọi tên sửa")
            elif "KỸ NĂNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.4_FrameC_HaiConDuong_BamNutVaSuaChu.jpg", "2 Con đường: Đường xám bấm nút vô vọng vs Đường vàng sửa chữ thành công")
            elif "LÀM CÙNG" in s:
                return ("assets/M1_NhaThamHiemAI/M1.4_Shot4.1_SuaCauLenh_BanTay5NgonCamBut.jpg", "Làm thật: Bàn tay bé 5 ngón hoàn hảo cầm bút chì màu vẽ ngôi sao khi sửa thêm chi tiết")
            elif "THỬ THÁCH" in s:
                return ("assets/M1_NhaThamHiemAI/M1.4_FrameD_NhatKyAi_BiaVaSoSuuTam.jpg", "Thử thách & Sản phẩm M1: Cuốn sổ Nhật ký học AI dán ảnh lỗi có chú thích và ảnh đúng hoàn thành")
            elif "OUTRO" in s or "CHỐT" in s:
                return ("assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg", "Teaser tốt nghiệp M1 chuẩn bị bay sang Đảo Họa Sĩ AI (M2)")
            else:
                return (island_img, "Đảo Nhà Thám Hiểm AI - Mở cửa xưởng sáng tạo")
    
    # MODULE 2
    elif mod_code == "M2":
        if "2.1" in les:
            if "INTRO" in s or "OUTRO" in s:
                return (island_img, "Đảo Họa Sĩ AI")
            else:
                return ("assets/M2_HoaSiAI/M2.1_FrameA_BucTranhBietNoi_NgayMuaBao.jpg", "Bức tranh biết nói: Cún trốn dưới ghế, dép vàng trôi ngoài hiên, áo mưa vàng trên tường")
        elif "2.2" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M2_HoaSiAI/M2.2_FrameA_TinhHuong_TiecSinhNhatHonLoan.jpg", "Bữa tiệc hỗn loạn: Bánh kem khổng lồ che lấp em bé Bống")
            else:
                return ("assets/M2_HoaSiAI/M2.2_FrameB_KetQua_BoCuc3Lop_MeoNgoiSao.jpg", "Bố cục 3 lớp: Ghế bành (tiền), Mèo ngôi sao (trung), Cây xanh đồi cỏ (hậu)")
        elif "2.3" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M2_HoaSiAI/M2.3_FrameA_TinhHuong_PosterPhimKinhDiVuiTuoi.jpg", "Poster phim kinh dị nhưng vẽ ngôi nhà cũ nắng chang chang hoa bướm vui nhộn")
            else:
                return ("assets/M2_HoaSiAI/M2.3_FrameB_KetQua_XeDapCuHoangHonAmAp.jpg", "Xe đạp cũ giỏ rau trong nắng hoàng hôn vàng cam ấm áp hoài niệm")
        elif "2.4" in les:
            if "INTRO" in s or "OUTRO" in s:
                return (island_img, "Đảo Họa Sĩ AI")
            else:
                return ("assets/M2_HoaSiAI/M2.4_FrameA_KietTac_ChiecDieuCuoiCungMuaHe.jpg", "Kiệt tác A3 đóng khung gỗ: 'Chiếc diều cuối cùng của mùa hè' đủ 4 mảnh ghép")

    # MODULE 3
    elif mod_code == "M3":
        if "3.1" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.1_Shot2.1_SieuAnhHungChuaCoTinhCach.jpg", "Siêu anh hùng nhí áo choàng đỏ trên nóc nhà ngầu nhưng vô hồn, 3 dấu hỏi lớn tính cách")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.1_FrameA_HoSoNhanVat_ChuotTepHopNapChai.jpg", "Hồ sơ 6 ô của chuột Tép tai lệch ôm hộp sưu tầm nắp chai sắc màu")
            elif "LÀM CÙNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.1_Shot4.1_TepTuotDayGiay_BayHopNapChai.jpg", "Chuột Tép bị tuột dây giày ngã vấp, hộp nắp chai tung bay về miệng cống")
            elif "THỬ THÁCH" in s:
                return ("assets/M3_BietDoiNhanVat/M3.1_Shot5.1_BangHoSoNhanVat6O.jpg", "Bảng hồ sơ nhân vật 6 ô đất nặn: Tên - Thích - Sợ - Giỏi - Dở - Ước mơ")
            else:
                return (island_img, "Đảo Biệt Đội Nhân Vật AI")
        elif "3.2" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.2_FrameA_TinhHuong_NhanVatBiTroi3Kieu.jpg", "Nhân vật bị trôi 3 kiểu: đổi mũ len, đổi màu tóc, đổi áo khoác")
            elif "KỸ NĂNG" in s or "XEM MẪU" in s:
                return ("assets/M3_BietDoiNhanVat/M3.2_Shot3.1_3MatMaNhanDien.jpg", "3 Mật mã nhận diện không đổi: Mũ len đỏ quả bông, áo xanh 2 túi, ủng vàng")
            elif "LÀM CÙNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.2_FrameB_KetQua_MatMaNhanDien360Do.jpg", "Bản xoay Turnaround 360° của Bí: Mũ len đỏ quả bông, áo xanh 2 túi, ủng vàng")
            elif "THỬ THÁCH" in s or "OUTRO" in s:
                return ("assets/M3_BietDoiNhanVat/M3.2_Shot5.1_NhanVatGiuaDamDong_3DacDiem.jpg", "Thử thách nhận diện nhân vật Bí giữa đám đông nhờ 3 mật mã")
            else:
                return (island_img, "Đảo Biệt Đội Nhân Vật AI")
        elif "3.3" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.3_Shot2.1_Tina6BieuCam6ConChoKhacNhau.jpg", "Tina làm 6 biểu cảm nhưng biến thành 6 con chó khác nhau do quên luật vẽ")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.3_FrameA_BienHoaBieuCam_DoiMatKhongDoiNguoi.jpg", "Bộ biểu cảm 'Đổi mặt - Không đổi người' của cún cưng giữ nguyên chuông vàng")
            elif "LÀM CÙNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.3_Shot4.1_KiemTraLuat_3Tren3_Duyet.jpg", "Kiểm tra luật vẽ nhân vật: Vòng cổ đỏ, chuông vàng, tai cụp — 3 trên 3: DUYỆT!")
            elif "THỬ THÁCH" in s or "OUTRO" in s:
                return ("assets/M3_BietDoiNhanVat/M3.3_Shot5.1_Bo6BieuCam_DoiMatKhongDoiNguoi.jpg", "Khay 6 biểu cảm hoàn chỉnh của cún Bông giữ nguyên chuông vàng và vòng cổ đỏ")
            else:
                return (island_img, "Đảo Biệt Đội Nhân Vật AI")
        elif "3.4" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.4_FrameA_TinhHuong_ChuotTepNgaiVangLacLong.jpg", "Chuột Tép bối rối lọt thỏm trên ngai vàng lâu đài tráng lệ lệch tính cách")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.4_Shot3.1_ThietKeCanCuDuoiCauThang.jpg", "Thiết kế căn cứ từ tính cách: Góc hốc cầu thang có võng, bản đồ, nắp chai và dây giày")
            elif "LÀM CÙNG" in s:
                return ("assets/M3_BietDoiNhanVat/M3.4_FrameB_KetQua_CanCuAmCungHocCay.jpg", "Căn cứ ấm cúng hốc cây của Tép: bản đồ vẽ tay, hộp nắp chai, cuộn dây giày")
            elif "OUTRO" in s or "THỬ THÁCH" in s or "CHỐT" in s:
                return ("assets/M3_BietDoiNhanVat/M3.4_Shot5.1_HuyHieuBietDoiNhanVat_TeaserM4.jpg", "Lễ trao Huy hiệu Biệt Đội Nhân Vật AI + Cổng Vương Quốc Truyện Tranh AI M4")
            else:
                return (island_img, "Đảo Biệt Đội Nhân Vật AI")

    # MODULE 4
    elif mod_code == "M4":
        if "4.1" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.1_FrameA_Cong2_CoChuyen_QuaBongKetHangRao.jpg", "Tình huống Cổng 2 (Có chuyện): Mèo con với tay qua rào tìm quả bóng đỏ bị kẹt")
            elif "XEM MẪU" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.1_FrameB_Cong3_GiaiQuyet_TimLaiCaBong.jpg", "Xem mẫu Cổng 3 (Giải quyết): Mèo con tìm thấy chú cá bông yêu thích dưới hiên nắng chiều")
            elif "LÀM CÙNG" in s or "KỸ NĂNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.1_Shot4.1_SoDo3CongChuyen.jpg", "Sơ đồ 3 cổng câu chuyện: Cổng 1 Bình thường ➔ Cổng 2 Có chuyện ➔ Cổng 3 Giải quyết")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.1_Shot5.1_BangThuThach_3Cong_MayGhiAm.jpg", "Bảng thử thách 3 cổng câu chuyện và máy ghi âm đất nặn để bé ghi âm kể chuyện")
            else:
                return (island_img, "Đảo Vương Quốc Truyện Tranh AI - Giới thiệu 3 Cổng của Vương Quốc")
        elif "4.2" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.2_Shot2.1_TinhHuong_HuyHieuNgoaiSamChop.jpg", "Tình huống: Chiếc huy hiệu sao vàng nằm ngoài sân cỏ giữa trời nổi sấm chớp Bơ sợ nhất")
            elif "KỸ NĂNG" in s or "XEM MẪU" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.2_Shot3.1_SoDo4CongHanhTrinhTruyen.jpg", "Sơ đồ 4 chặng khung xương: MUỐN ➔ CẢN ➔ LÀM ➔ KẾT")
            elif "LÀM CÙNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.2_FrameA_4ChangThuThach_CuuHuyHieuSao.jpg", "Làm cùng: Bạn Bơ cầm ô vàng vượt sấm cứu huy hiệu sao")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.2_Shot5.1_BangThuThach_4DongKhungXuong.jpg", "Bảng thử thách 4 dòng khung xương: Muốn - Cản - Làm - Kết bằng các dải đất nặn màu")
            else:
                return (island_img, "Đảo Vương Quốc Truyện Tranh AI - Khung xương 4 chặng thử thách")
        elif "4.3" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.3_Shot2.1_8KhungLonXon_TrungLap.jpg", "Tình huống: 8 khung tranh bị trùng lặp cảnh chạy và nhảy cóc không hiểu câu chuyện")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.3_Shot2.1_BanVeNhao8OOQue.jpg", "Bản phác thảo Storyboard 8 ô que nháp trên giấy: Một ô - Một việc")
            elif "LÀM CÙNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.3_FrameA_Storyboard8OOQue.jpg", "Làm cùng: Storyboard 8 ô hoàn chỉnh bằng đất nặn trực quan")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.3_Shot5.1_BangThuThach_SoiLoi8O.jpg", "Thử thách: Bảng kiểm tra 8 ô que không trùng lặp, có kính lúp soi chi tiết")
            else:
                return (island_img, "Đảo Vương Quốc Truyện Tranh AI - Storyboard 8 ô que")
        elif "4.4" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.4_Shot2.1_TinhHuong_NhanVatMitBiTroi.jpg", "Tình huống: Nhân vật Mít bị trôi hình đổi áo sọc tím và kiểu tóc cọc cạch")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.4_FrameA_KhoaHinh_MayBayGiayTrenCay.jpg", "Khung truyện mẫu: Bé áo cam nhìn chiếc máy bay giấy mắc trên cành cây")
            elif "LÀM CÙNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.4_Shot4.1_GiaiQuyet_CuuMayBayGiay.jpg", "Làm cùng: Bé bắc ghế cứu máy bay giấy, giữ nguyên nhân vật khóa hình")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.4_Shot5.1_BangThuThach_Soi2KhungCanhNhau.jpg", "Thử thách: Soi 2 khung cạnh nhau để khóa hình nhân vật Đúng người - Đúng việc - Đúng kiểu")
            else:
                return (island_img, "Đảo Vương Quốc Truyện Tranh AI - Khóa hình nhân vật qua 8 khung")
        elif "4.5" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.5_Shot2.1_BongBongThoaiCheKinTranh.jpg", "Tình huống: Bong bóng thoại khổng lồ che kín cả nhân vật và cảnh vật")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.5_FrameA_VuongMienHoanHao_CuonTruyen8Trang.jpg", "Cuốn truyện tranh 8 trang hoàn chỉnh mở ra trên bàn thủ công có bìa và tên truyện")
            elif "OUTRO" in s or "THỬ THÁCH" in s or "CHỐT" in s:
                return ("assets/M4_VuongQuocTruyenTranh/M4.5_Shot5.2_HuyHieuTruyenTranh_TeaserM5.jpg", "Huy hiệu Vương Quốc Truyện Tranh + Cuốn truyện thắt nơ + Rương game Teaser M5")
            else:
                return (island_img, "Đảo Vương Quốc Truyện Tranh AI - Hoàn thiện cuốn truyện tranh")

    # MODULE 5
    elif mod_code == "M5":
        if "5.1" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.1_Shot2.1_TinhHuong_DungCuBepHonLoan.jpg", "Tình huống: Dụng cụ bếp hỗn loạn chưa có bộ quy tắc")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.1_Shot3.1_BoSuuTap12MonTapHoa.jpg", "Bộ sưu tập 12 món tiệm tạp hóa gần nhà trên khay gỗ pastel")
            elif "LÀM CÙNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.1_FrameA_BoSuuTap12MonLamBep.jpg", "Bộ sưu tập 12 món làm bếp đất nặn tí hon trên bàn gỗ")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.1_Shot5.1_BangThuThach_12DongKhongTrung.jpg", "Bảng thử thách 12 ô kiểm tra không trùng và không nhạt nhẽo")
            else:
                return (island_img, "Đảo Nhà Phát Minh Trò Chơi AI - Săn lùng bộ sưu tập")
        elif "5.2" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.2_FrameA_TinhHuong_TheBaDaoMatCanBang.jpg", "Thẻ bá đạo 10-10-10 đè bẹp tất cả khiến đối thủ nản lòng bỏ về")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.2_Shot3.1_Tui12Diem_ChaoVsDua.jpg", "Túi 12 đồng điểm chia vào 3 đĩa cân: Tim (Sức) - Sét (Nhanh) - Sao (Khéo)")
            elif "LÀM CÙNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.2_FrameB_KetQua_TheChaoRanCanBang12Diem.jpg", "Thẻ chảo rán cân bằng 3 chỉ số Tim - Sét - Sao tổng 12 điểm")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.2_Shot5.1_BangThietKeBoThe12Dong.jpg", "Bảng thiết kế bộ thẻ bài 12 dòng cân bằng chỉ số")
            else:
                return (island_img, "Đảo Nhà Phát Minh Trò Chơi AI - Phù phép mặt thẻ")
        elif "5.3" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.3_FrameA_TinhHuong_BoTheLacPhongCach.jpg", "Bộ thẻ bài lạc phong cách, cọc cạch tả pí lù")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.3_Shot3.1_CongThucNen4Phan.jpg", "Sơ đồ công thức nền 4 phần: Phong cách - Nền pastel - Góc nhìn ngang - Bo viền")
            elif "LÀM CÙNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.3_FrameB_KetQua_Bo12TheKhoaPhongCach.jpg", "Bộ 12 thẻ bài cùng khuôn viền, góc nhìn ngang và nền pastel")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.3_Shot5.1_Bo12TheInA4DongBo.jpg", "Trang in A4 bộ 12 thẻ bài có đường nét đứt cắt kéo hoàn chỉnh")
            else:
                return (island_img, "Đảo Nhà Phát Minh Trò Chơi AI - Khóa thẻ")
        elif "5.4" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.4_Shot2.1_TinhHuong_GiaDinhHoiLuatChoi.jpg", "Tình huống: Cả nhà bối rối vì thẻ đẹp nhưng chưa rõ luật chơi")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.4_Shot3.1_CuonLuatChoi5CauHoi.jpg", "Cuộn giấy da 5 câu hỏi vàng của bộ luật chơi")
            elif "THỬ THÁCH" in s or "OUTRO" in s or "CHỐT" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.4_FrameA_DauTruongKhaiMo_BanCoHoanChinh.jpg", "Bàn cờ game phiêu lưu hoàn chỉnh sẵn sàng cho trận đấu")
            else:
                return (island_img, "Đảo Nhà Phát Minh Trò Chơi AI - Luật chơi")
        elif "5.5" in les:
            if "HOOK" in s or "TÌNH HUỐNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.5_Shot2.1_KhoTroChoiNguQuen.jpg", "Tình huống: Hộp trò chơi bị cất bụi trong ngăn kéo bàn (Kho trò chơi ngủ quên)")
            elif "XEM MẪU" in s or "KỸ NĂNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.5_Shot3.1_BanCoDori_4ThanhPhan.jpg", "Bàn cờ Dori 4 thành phần: Xuất phát - Đường đi - Ô mèo cướp đồ ăn - Đích đến")
            elif "LÀM CÙNG" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.4_FrameA_DauTruongKhaiMo_BanCoHoanChinh.jpg", "Làm cùng: Hoàn thiện bàn cờ game phiêu lưu, xúc xắc và quân cờ")
            elif "THỬ THÁCH" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.5_Shot5.1_GiaDinhChoiVanGameDauTien.jpg", "Thử thách: Cả gia đình quây quần ấm cúng chơi ván cờ game hoàn chỉnh đầu tiên")
            elif "OUTRO" in s or "CHỐT" in s:
                return ("assets/M5_NhaPhatMinhTroChoi/M5.5_Shot5.2_DaiLeTotNghiepToanKhoa_CupVang.jpg", "Đại lễ Tốt nghiệp Toàn Khóa AI Kids: Cúp vàng, 5 huy hiệu 5 đảo, bằng tốt nghiệp danh dự!")
            else:
                return (island_img, "Đảo Nhà Phát Minh Trò Chơi AI - Đấu trường khai mở")

    return (island_img, "Ảnh chủ đề")

def get_shot_breakdown(mod_code, lesson_num, seg_name, original_dir):
    les = lesson_num.strip()
    s = seg_name.upper()
    if mod_code == "M1":
        if "1.1" in les and "KỸ NĂNG" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 2:00–4:00):</strong><br>
            • <strong>Shot 1 (2:00–2:40) [Bên Trái]:</strong> Camera zoom vào bạn nhỏ ngồi vẽ, trên đầu bung bong bóng suy nghĩ (Thought Bubble) hiện con mèo mướp ngủ ấm áp. Mèo AKI đứng ngoài gãi đầu: <em>"Trong đầu các cậu lúc nào cũng có hình... Nhưng tớ không nhìn được vào đầu các cậu."</em><br>
            • <strong>Shot 2 (2:40–3:25) [Bên Phải]:</strong> Camera trượt sang vùng xám: 3 dấu hỏi chấm lơ lửng rơi xuống tương ứng 3 câu hỏi bỏ trống (Màu gì? Làm gì? Ở đâu?). Chú mèo xám 4 chân đứng đơ xuất hiện trên nền xám rỗng. AKI thở dài: <em>"Y hệt con mèo lúc nãy đấy."</em><br>
            • <strong>Shot 3 (3:25–4:00) [Kinetic Pop-up]:</strong> Màn hình hiện chữ nổi: <strong>CHỖ BỎ TRỐNG → ÂY AI TỰ ĐIỀN VÀO</strong>. Mèo AKI giơ tay bắt nhịp, chữ nhấp nháy theo tiếng đọc đồng thanh."""
        elif "1.1" in les and "XEM MẪU" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 0:50–2:00):</strong><br>
            • <strong>Shot 1 (0:50–1:20):</strong> Màn hình chia đôi 2 khung: Khung xám bên trái (mèo 1 từ đơn điệu) vs Khung cam bên phải (mèo mướp 5 từ ngủ ghế mây). AKI trỏ tay so sánh.<br>
            • <strong>Shot 2 (1:20–1:45):</strong> Zoom khung cam, 5 huy hiệu số lần lượt nhảy ra: 1. Mèo mướp -> 2. Béo -> 3. Đang ngủ -> 4. Ghế mây -> 5. Cửa sổ.<br>
            • <strong>Shot 3 (1:45–2:00):</strong> Khung trái hiện dấu hỏi (AI đoán 4 phần), khung phải hiện dấu tick xanh (AI không phải đoán gì)."""
        elif "1.1" in les and "HOOK" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 0:15–0:50):</strong><br>
            • <strong>Shot 1 (0:15–0:35):</strong> Bé Mimi dậy sớm trong nắng mai, ngồi bên bàn nặn đất sét háo hức.<br>
            • <strong>Shot 2 (0:35–0:50):</strong> Cận cảnh vẻ mặt Mimi ngơ ngác khi nhìn tượng mèo xám: <em>"Ơ... đây đúng là con mèo rồi đấy. Nhưng con mèo trong đầu bạn ấy không phải con này!"</em>"""
        elif "1.2" in les and "XEM MẪU" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 0:50–2:00):</strong><br>
            • <strong>Shot 1 (0:50–1:30):</strong> Bạn nhỏ Zico đất nặn xuất hiện cùng 4 khối màu Xanh - Vàng - Cam - Đỏ. 4 chiếc chìa khoá lần lượt cắm vào 4 khối.<br>
            • <strong>Shot 2 (1:30–2:00):</strong> Soi lỗi thiếu chìa khoá: Chó xù chạy giữa nền trắng (thiếu Ở ĐÂU) và Voi đứng đơ (thiếu TRÔNG THẾ NÀO & ĐANG LÀM GÌ)."""
        elif "1.2" in les and "LÀM CÙNG" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 4:00–5:30):</strong><br>
            • <strong>Shot 1 (4:00–4:50):</strong> Chiếc cốc sứ trắng mẻ miệng bốc khói xuất hiện trên bàn gỗ cạnh cuốn sổ mở.<br>
            • <strong>Shot 2 (4:50–5:30):</strong> Điền đủ 4 ô -> Nút Tạo màu xanh tròn phát sáng lên! AKI reo mừng: <em>"Bốn trên bốn. Tớ làm đúng vì các cậu đã nói đủ!"</em>"""
        elif "1.4" in les and "XEM MẪU" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 0:50–2:00):</strong><br>
            • Mèo AKI dẫn đi xem Bảo tàng thất bại. Camera lia qua 5 bức tranh treo tường: 1. Tay 6 ngón -> 2. Sai chính tả -> 3. Mất mũ -> 4. Thừa 3 con chim -> 5. Nhìn lệch bánh."""
        elif "1.4" in les and "KỸ NĂNG" in s:
            return """🎬 <strong>HƯỚNG DẪN DỰNG SHOT-BY-SHOT (Timeline 2:00–4:00):</strong><br>
            • <strong>Shot 1 (2:00–2:50):</strong> Quy trình 3 bước sửa câu lệnh (1. Gọi tên lỗi -> 2. Tìm chỗ thiếu -> 3. Viết thêm).<br>
            • <strong>Shot 2 (2:50–4:00):</strong> Sơ đồ 2 con đường: Đường xám bấm nút vô vọng dẫn đến hộp rỗng vs Đường vàng sửa chữ dẫn đến cúp vàng. Pop-up: <strong>SỬA CHỮ, ĐỪNG BẤM NÚT</strong>."""
    return original_dir if original_dir else "Mèo AKI chỉ tay vào màn hình bên cạnh, diễn hoạt theo nhịp thoại."

GRANULAR_SHOTS = {
    "1.1": [
        {
            "seg_parent": "1. INTRO",
            "shot_code": "Shot 1.1",
            "timing": "0:00–0:15",
            "voice_gen": "[excited] Xưởng sáng tạo Ây ai Kít mở cửa rồi! [giggles] Xin chào các cậu, tớ là AKI, chú mèo máy thông minh nhì quả đất này. [cheerful] Cùng đến với bài học đầu tiên của chủ đề NHÀ THÁM HIỂM ÂY AI: [curious] Một từ hay năm từ?",
            "visual_dir": "Mèo AKI mở cổng xưởng sáng tạo trên Đảo Nhà Thám Hiểm AI, vẫy tay chào các bạn nhỏ. Pop-up text 3D giới thiệu bài học.",
            "asset_file": "assets/MasterIslands/M1_Master_DaoNhaThamHiem.jpg",
            "asset_desc": "Đảo Nhà Thám Hiểm AI - Mở cửa xưởng sáng tạo bài 1.1"
        },
        {
            "seg_parent": "2. HOOK",
            "shot_code": "Shot 2.1",
            "timing": "0:15–0:35",
            "voice_gen": "[cheerful] Sáng nay cô chủ nhỏ Mimi của tớ dậy sớm lắm. [playful] Vì bạn ý muốn vẽ một con mèo. [deliberate] Con... mèo. [excited] Xong!",
            "visual_dir": "Toàn cảnh phòng thủ công: Bé Mimi dậy sớm trong nắng mai ấm áp, ngồi bên bàn gỗ nặn đất sét háo hức.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_FrameA_MimiDaySomVeMeo.jpg",
            "asset_desc": "Bé Mimi dậy sớm bên bàn làm việc ngập nắng muốn nặn một chú mèo"
        },
        {
            "seg_parent": "2. HOOK",
            "shot_code": "Shot 2.2",
            "timing": "0:35–0:50",
            "voice_gen": "[surprised] Ơ. [thoughtful] Đây là con mèo. Đúng là con mèo rồi đấy. [confused] Nhưng mà... con mèo trong đầu bạn ấy không phải con này. [gentle] Các cậu ơi. [curious] Các cậu nghĩ bạn ấy làm sai ở chỗ nào nhỉ?",
            "visual_dir": "Cận cảnh bàn làm việc: Bức tượng mèo xám đơn điệu ngơ ngác đặt trơ trọi. Mèo AKI nhăn mặt gãi đầu hỏi các bạn nhỏ vì sao lại thế.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_FrameA_MeoDonDieu_1Tu.jpg",
            "asset_desc": "Bức tượng mèo xám 1 từ trơ trọi: Đúng là mèo rồi nhưng không phải con mèo trong đầu bạn ấy!"
        },
        {
            "seg_parent": "3. XEM MẪU",
            "shot_code": "Shot 3.1",
            "timing": "0:50–1:20",
            "voice_gen": "[excited] AKI cho các cậu xem cái này nhé. [calm] Bên trái là con mèo tớ vừa làm ra, vì MIMI chỉ gõ đúng hai chữ thôi: con mèo. [curious] Còn bên phải này. [cheerful] Cùng một buổi sáng, cũng là MIMI. [deliberate] Bạn ý gõ: con mèo mướp béo đang ngủ trên ghế mây cạnh cửa sổ. [curious] Các cậu thấy khác nhau chưa? [thoughtful] Hai bức đều là mèo cả. [amazed] Nhưng rõ ràng bức bên phải đẹp hơn và đúng con mèo mà MIMI nghĩ luôn.",
            "visual_dir": "Màn hình chia đôi 2 khung tranh: Khung xám bên trái (mèo 1 từ đơn điệu) vs Khung cam bên phải (mèo mướp 5 từ ngủ ghế mây). AKI trỏ tay so sánh sự khác biệt.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_FrameB_SoSanhBenTraiBenPhai.jpg",
            "asset_desc": "Bức tranh chia đôi đối chiếu: Bên trái (1 từ - Khung xám) vs Bên phải (5 điều - Khung cam)"
        },
        {
            "seg_parent": "3. XEM MẪU",
            "shot_code": "Shot 3.2",
            "timing": "1:20–2:00",
            "voice_gen": "[playful] Mình đếm thử xem có mấy điều nhé. [deliberate] Mèo mướp, một. Béo, hai. Đang ngủ, ba. Trên ghế mây, bốn. Cạnh cửa sổ, năm. [emphasized] Năm điều. [calm] Còn bên trái thì chỉ có một. [thoughtful] MIMI một điều thì tớ phải đoán bốn phần còn lại. [proud] Nói năm điều thì tớ chẳng phải đoán gì cả.",
            "visual_dir": "Cận cảnh bức tranh bên phải: 5 chiếc huy hiệu đất nặn xinh xắn lần lượt phát sáng theo nhịp đếm: 1. Mèo mướp -> 2. Béo -> 3. Đang ngủ -> 4. Ghế mây -> 5. Cửa sổ.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_Shot3.2_Dem5Dieu_MeoMuop.jpg",
            "asset_desc": "Đếm 5 điều trên bức tranh: 5 huy hiệu đất nặn chi tiết (tai mướp, bụng béo, ngủ zzz, nan ghế mây, cửa sổ nắng)"
        },
        {
            "seg_parent": "4. DẠY 1 KỸ NĂNG",
            "shot_code": "Shot 4.1",
            "timing": "2:00–2:45",
            "voice_gen": "[calm] Hôm nay mình học đúng một thứ thôi nhé. [emphasized] Nó tên là LỜI TẢ, hay còn gọi là CÂU LỆNH. [warm] Trong đầu các cậu lúc nào cũng có hình. [playful] Các cậu vừa nghĩ tới con mèo là trong đầu hiện ra ngay một con mèo. [warm] Con mèo của riêng các cậu, không giống của ai. [whispers] Nhưng mà... tớ không nhìn được vào trong đầu các cậu. [calm] Tớ chỉ đọc được chữ các cậu viết ra thôi.",
            "visual_dir": "Cận cảnh bạn nhỏ ngồi bàn vẽ: Phía trên bung bong bóng suy nghĩ (Thought Bubble) ấm áp hiện chú mèo mướp ngủ say trên ghế. AKI đứng cạnh gãi đầu: 'Tớ không nhìn thấy được suy nghĩ này đâu!'",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_Shot4.1_HinhTrongDau_ChuMeoAmAp.jpg",
            "asset_desc": "Bong bóng suy nghĩ: Trong đầu em có hình con mèo ấm áp, nhưng AI chỉ đọc được chữ"
        },
        {
            "seg_parent": "4. DẠY 1 KỸ NĂNG",
            "shot_code": "Shot 4.2",
            "timing": "2:45–3:25",
            "voice_gen": "[serious] Cho nên chỗ nào các cậu không tả, tớ sẽ tự điền vào. [deliberate] Các cậu không nói con mèo màu gì, tớ tự chọn màu. Các cậu không nói nó đang làm gì, tớ cho nó đứng. [slowly] Các cậu không nói nó ở đâu, tớ cho nó đứng giữa nền xám. [sighs] Ừm... y hệt con mèo lúc nãy đấy.",
            "visual_dir": "Màn hình chuyển sang căn phòng xám trơ trọi: 3 dấu hỏi chấm lơ lửng lần lượt rơi xuống tương ứng 3 câu hỏi (Màu gì? Làm gì? Ở đâu?). Chú mèo đất xám 4 chân đứng đơ xuất hiện cô đơn. AKI thở dài.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_Shot4.2_AiTuDoan_MeoXam3DauHoi.jpg",
            "asset_desc": "AI tự đoán 3 chỗ trống: Tự chọn màu xám, tự cho đứng đơ, tự đặt giữa nền xám trống trơn"
        },
        {
            "seg_parent": "4. DẠY 1 KỸ NĂNG",
            "shot_code": "Shot 4.3",
            "timing": "3:25–4:00",
            "voice_gen": "[deliberate] Nhớ câu này giúp tớ nhé: [emphasized] chỗ nào các cậu bỏ trống, thì Ây ai như tớ sẽ tự điền vào. [encouraging] Hãy đọc lại cùng tớ nào. [emphasized] Chỗ nào các cậu bỏ trống..Ây ai sẽ điền vào. [curious] Vậy muốn tớ vẽ đúng ý các cậu thì các cậu phải làm gì nhỉ? [proud] Đúng rồi. [encouraging] Tả cho rõ. Đừng bỏ trống chỗ nào cả nha.",
            "visual_dir": "Khay câu lệnh đất nặn với các ô ghép màu, ô bỏ trống phát sáng để AI tự điền đất sét vào. Pop-up chữ Kinetic lớn: CHỖ BỎ TRỐNG → ÂY AI TỰ ĐIỀN VÀO. AKI giơ tay bắt nhịp.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_FrameC_QuyTacOTrong_TuDienVao.jpg",
            "asset_desc": "Quy tắc vàng: Khay câu lệnh có ô bỏ trống và AI tự điền đất sét vào chỗ trống"
        },
        {
            "seg_parent": "5. LÀM CÙNG",
            "shot_code": "Shot 5.1",
            "timing": "4:00–4:45",
            "voice_gen": "[excited] Giờ mình làm cùng nhau nhé. [calm] Tớ sửa lại con mèo lúc nãy, sửa từng chút một thôi. [deliberate] Bắt đầu: con mèo. [playful] Thêm một điều nhé. Con mèo MƯỚP. [curious] Thấy vằn hiện ra chưa? [cheerful] Thêm nữa. Con mèo mướp BÉO. [curious] Nó đang làm gì? Đang NGỦ. [surprised] Ồ, nó nằm xuống rồi!",
            "visual_dir": "Tiến trình nặn đất sét biến đổi qua 3 giai đoạn: Mèo xám nhỏ -> Thêm vằn mướp cam tròn trịa -> Chuyển sang tư thế nằm cuộn tròn chuẩn bị ngủ.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_Shot5.1_TungBuocThemTu_MeoMuop.jpg",
            "asset_desc": "Quá trình biến đổi từng bước: Con mèo -> Mèo mướp -> Béo -> Đang nằm ngủ"
        },
        {
            "seg_parent": "5. LÀM CÙNG",
            "shot_code": "Shot 5.2",
            "timing": "4:45–5:30",
            "voice_gen": "[curious] Ngủ ở đâu? Trên GHẾ MÂY. [deliberate] Cái ghế đặt ở đâu? CẠNH CỬA SỔ. [proud] Xong. [warm] Đây mới đúng là con mèo trong đầu tớ. [curious] Các cậu để ý chưa, nãy giờ tớ có bấm lại lần nào đâu nhỉ? [emphasized] Tớ chỉ thêm chữ thôi.",
            "visual_dir": "Bức tranh hoàn thiện xuất sắc: Chú mèo mướp vàng béo cuộn tròn ngủ say sưa trên chiếc ghế mây êm ái cạnh cửa sổ nắng vàng. AKI nhảy cẫng lên ăn mừng: 'Tớ chỉ thêm chữ thôi!'",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.2_FrameC_MeoMuopNguGheMay_TaDu4ChiaKhoa.jpg",
            "asset_desc": "Tác phẩm hoàn chỉnh: Mèo mướp vàng béo ngủ ghế mây cạnh cửa sổ ngập nắng khi thêm đủ 5 điều"
        },
        {
            "seg_parent": "6. THỬ THÁCH",
            "shot_code": "Shot 6.1",
            "timing": "5:30–6:30",
            "voice_gen": "[excited] Đến lượt các cậu rồi. [cheerful] Việc hôm nay thế này nhé. [calm] Chọn một con vật các cậu thích, con nào cũng được. [deliberate] Lần một: viết đúng MỘT TỪ rồi tạo. [deliberate] Lần hai: viết cho đủ NĂM điều rồi tạo. [gentle] Sau đó, hãy lưu cả 2 hình về. [encouraging] Rồi khoe với bố mẹ và chia sẻ được: các cậu thích bức nào hơn, và vì sao. [serious] Với lại mỗi dự án các cậu có sáu lượt tạo. [emphasized] Sáu thôi đấy. [thoughtful] Ít thế thì phải tả cho khéo vào. [playful] Mà tả khéo thì đúng là cái mình vừa học rồi còn gì, đúng không nào? [excited] Hãy bấm dừng và cùng tạo luôn nhé!",
            "visual_dir": "Bảng thử thách đất nặn: Thẻ Bước 1 (1 sao), Thẻ Bước 2 (5 sao màu sắc + huy hiệu mèo), khay dưới có đúng 6 quả tim năng lượng tạo hình. AKI chỉ bảng hướng dẫn các bạn nhỏ thực hành.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_FrameD_BangThuThach_2BuocTao.jpg",
            "asset_desc": "Bảng thử thách 2 bước: Lần 1 (1 từ/1 sao) vs Lần 2 (5 điều/5 sao) và 6 tim năng lượng tạo hình"
        },
        {
            "seg_parent": "7. CHỐT + OUTRO",
            "shot_code": "Shot 7.1",
            "timing": "6:30–7:00",
            "voice_gen": "[calm] Và cuối cùng, trước khi kết thúc Video này, các cậu nhớ câu này nhé: [emphasized] miêu tả càng rõ, tớ vẽ càng đúng. [deliberate] Việc ngoài màn hình hôm nay: đi một vòng quanh nhà, chọn lấy bốn đồ vật. [encouraging] Nhìn cho thật kỹ vào nhé, buổi sau chúng mình cần đến chúng đấy. [warm] Cùng với tớ bay vèo sang bài học sau nhaaa...",
            "visual_dir": "Khung cảnh ngoài màn hình: Bạn nhỏ cầm kính lúp đất nặn vui vẻ đi dạo quanh phòng khách, 4 đồ vật (cốc, đồng hồ, đèn bàn, chậu cây) phát vòng sáng mời gọi khám phá. AKI vẫy tay chào tạm biệt.",
            "asset_file": "assets/M1_NhaThamHiemAI/M1.1_Shot7.1_NhiemVuNgoaiManHinh_4DoVat.jpg",
            "asset_desc": "Nhiệm vụ ngoài màn hình: Cầm kính lúp đi quanh nhà quan sát kỹ 4 đồ vật chuẩn bị cho bài học sau"
        }
    ],
    "2.1": [
        {
            "seg_parent": "1. INTRO",
            "shot_code": "Shot 1.1",
            "timing": "0:00–0:15",
            "voice_gen": "[excited] Xưởng sáng tạo AKID mở cửa rồi! [giggles] Xin chào các cậu, tớ là AKI, chú mèo máy thông minh nhì quả đất này. [cheerful] Chào mừng các cậu đến với chặng 2: TỚ LÀ HOẠ SĨ ÂY AI. Bài học đầu tiên: BỨC TRANH BIẾT NÓI.",
            "visual_dir": "Mèo AKI mở cổng xưởng vẽ rực rỡ sắc màu của Đảo Họa Sĩ AI, vẫy tay chào các bạn nhỏ. Pop-up 3D: BỨC TRANH BIẾT NÓI.",
            "asset_file": "assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg",
            "asset_desc": "Đảo Họa Sĩ AI - Mở cửa xưởng sáng tạo bài 2.1: Bức tranh biết nói"
        },
        {
            "seg_parent": "2. TÌNH HUỐNG",
            "shot_code": "Shot 2.1",
            "timing": "0:15–0:45",
            "voice_gen": "[cheerful] Hôm nọ bạn Nabi khoe với tớ một đống tranh vừa tạo bằng AI. [playful] Tranh nào cũng bóng bẩy, màu sắc rực rỡ, nhìn qua thì đẹp mê ly. [curious] Nhưng tớ hỏi: Bức này vẽ gì thế? Bạn ấy bảo: Thì con mèo chứ gì nữa. [thoughtful] Bức này? Cái cây. Bức này? Ngôi nhà. [disappointed] Xem xong mười bức, tớ chẳng nhớ nổi bức nào.",
            "visual_dir": "Màn hình triển lãm 3 khung tranh đất nặn đứng đơ, bóng bẩy nhưng vô hồn: Một con mèo xám nhìn thẳng đơ, một cái cây đối xứng cứng nhắc, một ngôi nhà vuông vức đóng kín cửa. Tranh đẹp nhưng không có câu chuyện, xem xong không nhớ nổi.",
            "asset_file": "assets/M2_HoaSiAI/M2.1_Shot2.1_TranhVoHon_MeoCayNha.jpg",
            "asset_desc": "3 Khung tranh vô hồn: Con mèo, Cái cây, Ngôi nhà bóng bẩy nhưng cứng đơ, không có câu chuyện"
        },
        {
            "seg_parent": "2. TÌNH HUỐNG",
            "shot_code": "Shot 2.2",
            "timing": "0:45–1:15",
            "voice_gen": "[thoughtful] Ấy thế mà bên nhà bà ngoại của cậu ấy, có một tấm ảnh cũ trên tường. [calm] Ảnh hơi mờ, màu đã ngả vàng, một góc còn bị gấp. [curious] Nabi hỏi: “Ảnh này chụp gì thế ạ?” [cheerful] Thế là cả nhà bắt đầu kể. [dramatic] Hôm ấy trời mưa rất to. Bố đang chạy đi lấy áo mưa. [surprised] Một chiếc dép bị nước cuốn mất. [playful] Còn chú chó thì trốn dưới gầm ghế vì sợ sấm. [amazed] Nabi ngồi nghe mãi mà câu chuyện vẫn chưa hết. [warm] Tấm ảnh ấy chẳng đẹp bằng những bức tranh Nabi vừa xem, nhưng nó làm người ta muốn nhìn lâu hơn, vì trong đó có một câu chuyện.",
            "visual_dir": "Tấm ảnh cũ ngả vàng treo trên tường: Ngày mưa bão, chiếc dép vàng trôi ngoài hiên, áo mưa vàng trên móc, và chú cún trốn run rẩy dưới ghế sofa vì sợ sấm. Bức tranh chứa đựng cả một câu chuyện gia đình ấm áp.",
            "asset_file": "assets/M2_HoaSiAI/M2.1_FrameA_BucTranhBietNoi_NgayMuaBao.jpg",
            "asset_desc": "Tấm ảnh cũ ngày mưa bão: Chú chó trốn gầm ghế, dép vàng trôi ngoài hiên, áo mưa trên tường — Bức tranh biết nói!"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.1",
            "timing": "1:15–2:10",
            "voice_gen": "[curious] Vậy làm thế nào để nhìn một bức tranh mà tìm ra được chuyện? [mischievous] Tớ có một mẹo rất dễ nhớ. [deliberate] Chỉ cần hỏi ba câu thôi: [emphasized] ĐANG LÀM GÌ? — CÓ GÌ LẠ? — RỒI SAO? [deliberate] Câu thứ nhất: ĐANG LÀM GÌ? [curious] Hãy tìm xem nhân vật trong tranh đang làm gì. [playful] Không phải chỉ đứng cười hay nhìn vào máy ảnh đâu nhé. [excited] Có thể bạn ấy đang trèo lên ghế, đang chạy, đang với tay lấy một món đồ, hay đang giấu thứ gì đó sau lưng. [thoughtful] Khi nhân vật đang làm một việc, câu chuyện bắt đầu chuyển động.",
            "visual_dir": "Bảng trinh thám Montessori: Bạn nhỏ đất nặn kiễng chân trên ghế với tay lấy hũ bánh trên kệ cao; 3 chiếc huy hiệu kính lúp trinh thám phát sáng. Minh họa trực quan câu hỏi 1: ĐANG LÀM GÌ? Khi nhân vật hành động, câu chuyện bắt đầu chuyển động.",
            "asset_file": "assets/M2_HoaSiAI/M2.1_Shot3.1_CauHoi1_DangLamGi.jpg",
            "asset_desc": "Câu hỏi 1 (ĐANG LÀM GÌ?): Bạn nhỏ kiễng chân với tay lấy đồ — Khi nhân vật hành động, câu chuyện chuyển động"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.2",
            "timing": "2:10–3:00",
            "voice_gen": "[deliberate] Câu thứ hai: CÓ GÌ LẠ? [curious] Hãy nhìn quanh xem có chi tiết nào khiến các cậu phải thắc mắc không. [surprised] Một cái ghế bị đổ. Dấu chân bùn chạy vào trong nhà. Cốc nước bị đổ. Một chiếc dép nằm giữa phòng. [gasps] Cánh cửa mở nhưng chẳng thấy ai. [thoughtful] Những chi tiết lạ ấy chính là manh mối để mình đoán chuyện gì vừa xảy ra. [deliberate] Câu cuối cùng: RỒI SAO? [curious] Hãy thử đoán xem chuyện gì sẽ xảy ra tiếp theo. [encouraging] Nếu nhìn một bức tranh mà trong đầu các cậu tự bật ra câu “Rồi sao nữa?”, thì bức tranh ấy đã bắt đầu biết kể chuyện rồi đấy. [excited] Nào, đọc lại cùng tớ nhé: [emphasized] Đang làm gì? Có gì lạ? Rồi sao?",
            "visual_dir": "Căn phòng ngập tràn manh mối trinh thám: Ghế gỗ bị đổ, cốc nước đổ lênh láng trên thảm, vệt chân bùn chạy ra cánh cửa đang mở toang, chiếc dép nằm lẻ loi. Người xem tò mò tự hỏi: Chuyện gì vừa xảy ra? Rồi sao nữa?",
            "asset_file": "assets/M2_HoaSiAI/M2.1_Shot3.2_CauHoi23_CoGiLa_RoiSao.jpg",
            "asset_desc": "Câu hỏi 2 & 3 (CÓ GÌ LẠ? RỒI SAO?): Ghế đổ, vết chân bùn ra cửa mở, cốc nước đổ — Manh mối mở ra câu chuyện"
        },
        {
            "seg_parent": "4. LÀM CÙNG",
            "shot_code": "Shot 4.1",
            "timing": "3:00–4:00",
            "voice_gen": "[excited] Bây giờ đến lượt các cậu rồi nhaa. [cheerful] Trong Xưởng hôm nay có 1 bức tranh. [encouraging] Các cậu hãy nhìn thật kỹ rồi kể bằng miệng câu chuyện mình nhìn thấy, cho bố mẹ nghe nhé. [gentle] Nếu chưa biết bắt đầu từ đâu thì nhớ ba câu hỏi của Hoạ sĩ nhé: [emphasized] Đang làm gì? Có gì lạ? Rồi sao? [serious] Nhớ này, đừng chỉ kể: “Có cái cây, có cái bàn, có một bạn nhỏ...” nhé. [giggles] Như thế là đang đọc danh sách giống tớ lúc nãy đấy.",
            "visual_dir": "Bức tranh thử thách kể chuyện sống động: Mèo con tinh nghịch nhảy từ ghế đẩu vồ chim giấy origami trên kệ sách, cuộn len xanh lăn dài, chú cún ngủ liếc mắt hé nhìn. Bé quan sát và kể câu chuyện hoàn chỉnh cho bố mẹ.",
            "asset_file": "assets/M2_HoaSiAI/M2.1_Shot4.1_ThucHanhKeChuyen_MeoVaChuChimGiay.jpg",
            "asset_desc": "Bức tranh thực hành: Mèo vồ chim giấy, cuộn len lăn dài, chú cún hé mắt — Bé kể chuyện bằng 3 câu hỏi trinh thám"
        },
        {
            "seg_parent": "5. THỬ THÁCH + CHỐT + OUTRO",
            "shot_code": "Shot 5.1",
            "timing": "4:00–5:30",
            "voice_gen": "[calm] Hôm nay chúng mình chưa cần tạo ra một bức tranh nào cả. [proud] Nhưng chúng mình đã học một việc rất quan trọng của Hoạ sĩ: biết nhìn ra câu chuyện trong tranh. [deliberate] Nhớ ba câu hỏi nhé: [emphasized] ĐANG LÀM GÌ? - CÓ GÌ LẠ? - RỒI SAO? [thoughtful] Một bức tranh không chỉ cần đẹp. [curious] Một bức tranh hay còn phải khiến người xem muốn hỏi: “Chuyện gì đang xảy ra ở đây nhỉ?” [cheerful] Nhiệm vụ cuối cùng hôm nay rất đơn giản. [gentle] Hãy tìm trong nhà một tấm ảnh cũ của gia đình. [playful] Cầm tấm ảnh đến hỏi bố mẹ hoặc ông bà: “Hôm chụp tấm này có chuyện gì xảy ra thế ạ?” [softly] Rồi ngồi nghe nhé. [warm] Có khi chỉ từ một tấm ảnh nhỏ thôi mà các cậu sẽ nghe được cả một câu chuyện rất dài đấy. [excited] Buổi sau chúng mình sẽ học bài AI LÀ NGÔI SAO? [cheerful] Hẹn gặp lại các cậu trong Xưởng sáng tạo AIKID!",
            "visual_dir": "Cuốn album ảnh gia đình vintage mở ra trên bàn gỗ ngập nắng ấm: Các bức ảnh chụp kỷ niệm ngày mưa, dã ngoại gia đình, tách cacao bốc khói và chiếc kính lúp soi ảnh. Mèo AKI vẫy tay chào hẹn gặp lại ở bài 2.2: AI LÀ NGÔI SAO.",
            "asset_file": "assets/M2_HoaSiAI/M2.1_Shot5.1_NhiemVuGiaDinh_AlbumAnhCu.jpg",
            "asset_desc": "Nhiệm vụ ngoài đời: Mở album ảnh gia đình cũ, hỏi ông bà bố mẹ câu chuyện kỷ niệm sau từng bức ảnh"
        }
    ],
    "2.2": [
        {
            "seg_parent": "1. INTRO",
            "shot_code": "Shot 1.1",
            "timing": "0:00–0:15",
            "voice_gen": "[excited] Xưởng sáng tạo AKID mở cửa rồi! [giggles] Xin chào các cậu, tớ là AKI, chú mèo máy thông minh nhì quả đất này. [cheerful] Hôm nay mình đến với bài học số hai của chủ đề Tớ là Hoạ sĩ Ây Ai: Ai là ngôi sao?",
            "visual_dir": "Mèo AKI mở cánh cửa xưởng vẽ của Đảo Họa Sĩ AI, vẫy tay chào các bạn nhỏ. Pop-up text 3D giới thiệu bài 2.2: AI LÀ NGÔI SAO?",
            "asset_file": "assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg",
            "asset_desc": "Đảo Họa Sĩ AI - Mở cửa xưởng sáng tạo bài 2.2: Ai là ngôi sao?"
        },
        {
            "seg_parent": "2. HOOK / TÌNH HUỐNG",
            "shot_code": "Shot 2.1",
            "timing": "0:15–0:35",
            "voice_gen": "[cheerful] Hôm qua cô chủ nhỏ Mimi của tớ làm một bức tranh tặng em Bống nhân dịp sinh nhật. [playful] Bạn ấy muốn vẽ thật nhiều thứ: cái bánh kem ba tầng, bóng bay đủ màu, hộp quà, hoa, bàn tiệc, rồi cả bà và mẹ đứng chung quanh nữa. [gasps] Ối giời. [dramatic] Thứ nào cũng to, thứ nào cũng rõ, thứ nào cũng chen lên phía trước. [disappointed] Em Bống là nhân vật quan trọng nhất thì lại bị cái bánh che gần mất nửa người. [confused] Bạn ấy hỏi: “AKI ơi, thế em đứng ở đâu trong bức tranh này ạ?”",
            "visual_dir": "Toàn cảnh bàn tiệc sinh nhật hỗn loạn: Hơn 20 món đồ chen chúc cùng kích cỡ, chiếc bánh kem khổng lồ vô duyên che mất nửa người em bé Bống. AKI nhăn mặt hoang mang.",
            "asset_file": "assets/M2_HoaSiAI/M2.2_FrameA_TinhHuong_TiecSinhNhatHonLoan.jpg",
            "asset_desc": "Bữa tiệc sinh nhật hỗn loạn: 20 thứ chen chúc cùng cỡ, bánh khổng lồ che lấp em bé Bống"
        },
        {
            "seg_parent": "2. HOOK / TÌNH HUỐNG",
            "shot_code": "Shot 2.2",
            "timing": "0:35–0:50",
            "voice_gen": "[thoughtful] Ừ nhỉ. [serious] Nếu thứ nào cũng muốn làm ngôi sao thì cuối cùng chẳng biết nhìn vào đâu trước. [determined] Thế là chúng tớ làm lại. [cheerful] Vẫn từng ấy thứ, nhưng lần này em Bống đứng nổi bật ở giữa. [deliberate] Cái bánh ở phía trước nên to hơn. Bà với mẹ ở phía sau nên nhỏ hơn. Bóng bay nép sang một bên. [proud] Vừa nhìn vào là thấy em Bống ngay. [calm] Tớ không bỏ thứ gì cả. [emphasized] Tớ chỉ xếp lại chỗ.",
            "visual_dir": "Bức tranh sinh nhật sau khi xếp lại: Em Bống đứng tươi cười ở giữa (ngôi sao chính), bánh kem ở phía trước, bà và mẹ ở phía sau, bóng bay nép sang bên. AKI cười tự hào.",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot2.2_SinhNhatEmBong_XepDungBoCuc.jpg",
            "asset_desc": "Bữa tiệc sinh nhật xếp lại chuẩn bố cục: Em Bống nổi bật ở giữa, bánh phía trước, mẹ và bà phía sau"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.1",
            "timing": "0:50–1:30",
            "voice_gen": "[cheerful] Kỹ năng hôm nay có tên là bố cục. [playful] Nghe hơi oai, nhưng hiểu đơn giản thôi: [emphasized] bố cục là xếp chỗ cho mọi thứ trong tranh. [deliberate] Các cậu chỉ cần nhớ ba chỗ. [calm] Phía trước là những thứ gần người xem hơn, thường trông to hơn. [thoughtful] Ở giữa thường là chỗ của ngôi sao, tức là thứ cậu muốn mọi người nhìn thấy đầu tiên. [gentle] Phía sau là những thứ ở xa hơn, thường nhỏ hơn và bớt nổi bật hơn.",
            "visual_dir": "Mô hình giáo dục Montessori 3 tầng bậc trực quan: Tầng 1 Phía trước (bàn trà hoa quả gần, to), Tầng 2 Ở giữa (bục vàng chú thỏ ngôi sao cầm đũa thần nổi bật nhất), Tầng 3 Phía sau (đồi cỏ xa, cây pastel nhỏ dịu).",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot3.1_SoDoBoCuc3Lop.jpg",
            "asset_desc": "Sơ đồ bố cục 3 lớp trực quan: Phía trước (to, gần) - Ở giữa (Ngôi sao nổi bật) - Phía sau (nhỏ, xa)"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.2",
            "timing": "1:30–2:00",
            "voice_gen": "[serious] Và nhớ một luật quan trọng: [emphasized] một bức tranh nên có một ngôi sao chính. [calm] Không có nghĩa là tranh chỉ được có một nhân vật. [curious] Cậu chỉ cần biết rõ: “Tớ muốn người xem nhìn vào ai trước?”",
            "visual_dir": "Chiếc đèn rọi Spotlight đất nặn chiếu ánh sáng vàng ấm vào chú thỏ ngôi sao ở giữa, các nhân vật phụ đứng xung quanh vỗ tay tôn vinh ngôi sao chính. Pop-up text: MỘT BỨC TRANH — MỘT NGÔI SAO.",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot3.2_QuyTac1NgoiSao_Spotlight.jpg",
            "asset_desc": "Quy tắc vàng: 1 Bức tranh chỉ có 1 Ngôi sao chính để người xem nhìn vào đầu tiên"
        },
        {
            "seg_parent": "4. LÀM CÙNG",
            "shot_code": "Shot 4.1",
            "timing": "2:00–2:50",
            "voice_gen": "[playful] Giờ tớ làm thử nhé. [deliberate] Tớ vẽ nhanh ba thứ: một con mèo, một cái ghế và một cái cây. [giggles] Xấu cũng được, hôm nay mình học xếp chỗ chứ không thi vẽ đẹp. [cheerful] Tớ chọn con mèo làm ngôi sao, nên mèo ở giữa. Cái ghế ở phía trước. Cái cây ở phía sau. [curious] Tớ thử miêu tả: “Một con mèo mướp ngồi ở giữa, phía sau có một cái cây.” [surprised] Nhưng khi tạo ra, cái cây lại to gần bằng mèo, còn cái ghế biến mất.",
            "visual_dir": "Lỗi bố cục hài hước khi bỏ quên mô tả: Chú mèo mướp ngồi bơ vơ giữa sàn gỗ, chiếc ghế biến mất hoàn toàn, một thân cây khổng lồ sừng sững ngay sau lưng to ngang con mèo tranh giành sự chú ý!",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot4.1_LoiBoCuc_CayToBangMeoMatGhe.jpg",
            "asset_desc": "Lỗi bố cục khi thiếu mô tả: Quên tả ghế nên mất ghế, chưa nói cây ở xa nên cây to ngang bằng mèo"
        },
        {
            "seg_parent": "4. LÀM CÙNG",
            "shot_code": "Shot 4.2",
            "timing": "2:50–4:00",
            "voice_gen": "[thoughtful] À, vì tớ quên nói đến cái ghế. [calm] Còn cái cây, tớ chưa nói nó ở xa và nhỏ hơn. [determined] Tớ sửa lại: “Ở phía trước có một chiếc ghế. Ở giữa là một con mèo mướp, đây là nhân vật chính. Ở xa phía sau có một cái cây nhỏ hơn con mèo.” [proud] Lần này thì rõ hơn hẳn rồi.",
            "visual_dir": "Bức tranh hoàn hảo sau khi sửa lại: Chiếc ghế bành gỗ êm ái ở phía trước, chú mèo mướp vàng béo nổi bật kiêu hãnh ở giữa, và cây xanh tí hon dịu dàng ở xa phía sau trên đồi cỏ. Bố cục 3 lớp chuẩn chỉ!",
            "asset_file": "assets/M2_HoaSiAI/M2.2_FrameB_KetQua_BoCuc3Lop_MeoNgoiSao.jpg",
            "asset_desc": "Bố cục 3 lớp hoàn hảo: Ghế bành (tiền cảnh) - Mèo mướp ngôi sao (trung cảnh) - Cây nhỏ ở xa (hậu cảnh)"
        },
        {
            "seg_parent": "5. THỬ THÁCH + CHỐT",
            "shot_code": "Shot 5.1",
            "timing": "4:00–4:45",
            "voice_gen": "[excited] Bây giờ đến lượt các cậu. [cheerful] Lấy một tờ giấy và vẽ nhanh ba thứ mình thích. [playful] Không cần đẹp. [curious] Vẽ xong, hãy tự hỏi: Ai là ngôi sao? Cái gì ở phía trước? Cái gì ở phía sau? [deliberate] Sau đó miêu tả cho tớ thật đơn giản: “Ở phía trước có... Ở giữa là... Đây là ngôi sao. Ở phía sau có...” [encouraging] rồi để tớ tạo lại bức tranh của cậu. [curious] Khi tớ tạo xong, hãy đặt hai bức cạnh nhau và soi thử. [deliberate] Ngôi sao có đúng không? Thứ phía trước có đúng không? Thứ phía sau có chạy nhầm chỗ không? [gentle] Nếu sai, đừng vội tạo lại. [encouraging] Hãy xem câu miêu tả của mình còn thiếu gì rồi sửa trước.",
            "visual_dir": "Bàn thực hành đối chiếu: Bên trái là tờ giấy vẽ chì màu phác thảo 3 thứ của bé (ghế, mèo, cây), bên phải là khung tranh đất nặn 3D tương ứng. Chiếc kính lúp và bút chì màu đặt cạnh để soi lỗi bố cục.",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot5.1_ThuThach_SoiLoiBoCuc.jpg",
            "asset_desc": "Bàn thực hành đối chiếu: Bản phác thảo 3 thứ trên giấy đặt cạnh tranh đất nặn 3D + Kính lúp soi lỗi bố cục"
        },
        {
            "seg_parent": "5. THỬ THÁCH + CHỐT",
            "shot_code": "Shot 5.2",
            "timing": "4:45–5:30",
            "voice_gen": "[serious] Hôm nay chỉ cần nhớ hai điều: [emphasized] Một bức tranh — một ngôi sao. [deliberate] Xếp chỗ trước, miêu tả cho tớ sau. [curious] Trước khi tạo tranh, hãy tự hỏi ba câu: [emphasized] Ai là ngôi sao? Ai ở trước? Ai ở sau? [excited] Buổi sau, chúng mình đến với Cảm xúc của Sắc màu. [mischievous] Cùng một cảnh thôi, nhưng tớ sẽ làm nó lúc vui, lúc buồn, lúc hơi đáng sợ chỉ bằng cách đổi ánh sáng. [warm] Tớ chờ các cậu!",
            "visual_dir": "Bàn tổng kết xưởng vẽ: Cúp Ngôi Sao vàng óng phát sáng ở trung tâm, 3 huy hiệu dấu hỏi thần chú (Ai là ngôi sao? Ai ở trước? Ai ở sau?). Chiếc lồng đèn đổi màu pastel kỳ diệu báo hiệu bài học sau về ánh sáng và cảm xúc.",
            "asset_file": "assets/M2_HoaSiAI/M2.2_Shot5.2_QuyTacNgoiSao_Teaser23.jpg",
            "asset_desc": "Tổng kết 2 quy tắc vàng: 1 Tranh 1 Ngôi sao + 3 câu thần chú xếp chỗ + Đèn đổi màu báo hiệu bài 2.3"
        }
    ],
    "2.3": [
        {
            "seg_parent": "1. INTRO",
            "shot_code": "Shot 1.1",
            "timing": "0:00–0:15",
            "voice_gen": "[excited] Xưởng sáng tạo AKID mở cửa rồi! [giggles] Xin chào các cậu, tớ là AKI, chú mèo máy thông minh nhì quả đất này. [cheerful] Hôm nay mình đến với bài học số 3, của chủ đề Tớ là Hoạ sĩ Ây Ai: Cảm xúc của Sắc màu.",
            "visual_dir": "Mèo AKI mở cánh cửa xưởng vẽ của Đảo Họa Sĩ AI, trên tay cầm lồng đèn ánh sáng đổi màu. Pop-up 3D: CẢM XÚC CỦA SẮC MÀU.",
            "asset_file": "assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg",
            "asset_desc": "Đảo Họa Sĩ AI - Mở cửa xưởng sáng tạo bài 2.3: Cảm xúc của sắc màu"
        },
        {
            "seg_parent": "2. HOOK / TÌNH HUỐNG",
            "shot_code": "Shot 2.1",
            "timing": "0:15–0:50",
            "voice_gen": "[cheerful] Hôm nọ bạn nhỏ trong xưởng muốn làm một tấm poster phim kinh dị. [mischievous] Bạn ấy tả: Một ngôi nhà gỗ cũ kỹ trong rừng. [surprised] Nhưng khi tạo ra, bức tranh lại ngập tràn nắng vàng rực rỡ, hoa bướm dập dờn chung quanh, chim hót líu lo. [giggles] Nhìn vào chẳng ai thấy sợ cả, mà chỉ muốn đến đó cắm trại thôi! [curious] Vì sao vậy nhỉ? Vì bạn ấy quên mất ánh sáng!",
            "visual_dir": "Poster phim kinh dị nhưng vẽ sai ánh sáng: Ngôi nhà gỗ cũ kỹ giữa bãi cỏ nở đầy hoa bướm rực rỡ dưới nắng chang chang, trông như khu nghỉ dưỡng vui nhộn khiến khán giả phì cười.",
            "asset_file": "assets/M2_HoaSiAI/M2.3_FrameA_TinhHuong_PosterPhimKinhDiVuiTuoi.jpg",
            "asset_desc": "Poster phim kinh dị bị hỏng: Vẽ ngôi nhà cũ nhưng ngập nắng chang chang và hoa bướm vui nhộn"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.1",
            "timing": "0:50–2:00",
            "voice_gen": "[proud] Đó là kỹ năng hôm nay: [emphasized] ÁNH SÁNG TẠO CẢM XÚC. [calm] Cùng một cảnh, ánh sáng khác nhau sẽ tạo cảm giác khác nhau. [serious] Nhưng đừng chọn ánh sáng trước. [curious] Hãy hỏi: “Mình muốn người xem thấy gì?” Vui? Buồn? Nhớ? Sợ? [deliberate] Chọn cảm xúc xong mới chọn ánh sáng. [warm] Câu để nhớ là: [emphasized] Chọn cảm xúc trước, chọn ánh sáng sau.",
            "visual_dir": "Ngôi nhà gỗ cũ lúc này chuyển sang ánh sáng u tối: Bầu trời đêm tím thẫm, vầng trăng khuyết chiếu luồng sáng lạnh lẽo, bóng cây ma mị, ô cửa sổ hắt ánh đèn leo lét. Cùng 1 ngôi nhà, chỉ đổi ánh sáng là biến thành poster rùng rợn ngay!",
            "asset_file": "assets/M2_HoaSiAI/M2.3_Shot3.1_NgoiNhaHoang_AnhSangKinhDi.jpg",
            "asset_desc": "Cùng ngôi nhà đổi ánh sáng u tối đêm trăng: Trở thành poster kinh dị đúng nghĩa — Ánh sáng tạo cảm xúc!"
        },
        {
            "seg_parent": "4. LÀM CÙNG",
            "shot_code": "Shot 4.1",
            "timing": "2:00–3:00",
            "voice_gen": "[playful] Giờ tớ làm thử. [calm] Cảnh của tớ là một chiếc xe đạp cũ dựng ở góc sân, trong giỏ có một bó rau. [thoughtful] Tớ muốn người xem cảm thấy nhớ. [curious] Tớ thử nắng buổi sáng. [confused] Bức tranh sáng, sạch, rất đẹp, nhưng lại giống ảnh quảng cáo xe đạp. [disappointed] Nó vui quá, không giống cảm giác nhớ.",
            "visual_dir": "Chiếc xe đạp cũ với nắng sớm: Nắng mai trong veo rực rỡ, hoa leo nở hồng rực, bầu trời xanh ngắt. Bức tranh quá tươi vui và sáng sạch, trông giống ảnh quảng cáo xe đạp hơn là cảm giác nhớ nhung hoài niệm.",
            "asset_file": "assets/M2_HoaSiAI/M2.3_Shot4.1_XeDapNangSang_GiongQuangCao.jpg",
            "asset_desc": "Chiếc xe đạp cũ dưới nắng sáng trong veo: Quá vui tươi như quảng cáo, không đúng cảm xúc hoài niệm"
        },
        {
            "seg_parent": "4. LÀM CÙNG",
            "shot_code": "Shot 4.2",
            "timing": "3:00–4:00",
            "voice_gen": "[determined] Tớ đổi sang chiều muộn. [softly] Nắng vàng cam hắt xiên, bóng chiếc xe kéo dài, bó rau trông cũ hơn một chút. [warm] Lần này nhìn vào là thấy như chiếc xe ấy đã đứng ở đó rất lâu, và từng có ai đó dùng nó mỗi ngày. [proud] Thấy chưa? [thoughtful] Bức đầu có thể đẹp hơn, nhưng bức sau lại đúng cảm xúc hơn. [emphasized] Không phải lúc nào đẹp nhất cũng là đúng nhất.",
            "visual_dir": "Chiếc xe đạp cũ đổi sang hoàng hôn chiều muộn: Nắng vàng cam hắt xiên qua góc sân, bóng đổ dài, gam màu ấm áp trầm lắng gợi nhớ bao kỷ niệm thân thương. Tác phẩm đúng chuẩn cảm xúc!",
            "asset_file": "assets/M2_HoaSiAI/M2.3_FrameB_KetQua_XeDapCuHoangHonAmAp.jpg",
            "asset_desc": "Chiếc xe đạp cũ dưới nắng chiều hoàng hôn ấm áp: Bóng dài, màu vàng cam hoài niệm — Đẹp nhất chưa chắc bằng Đúng nhất!"
        },
        {
            "seg_parent": "5. THỬ THÁCH + CHỐT + OUTRO",
            "shot_code": "Shot 5.1",
            "timing": "4:00–5:30",
            "voice_gen": "[excited] Bây giờ đến lượt các cậu. [cheerful] Chọn một cảnh đơn giản như bàn học, góc bếp, cái sân hay một con ngõ. [deliberate] Đầu tiên, chọn một cảm xúc. [encouraging] Sau đó thử tạo cùng cảnh ấy với vài kiểu ánh sáng khác nhau. [curious] Nhìn từng bức và hỏi: “Bức này làm mình thấy gì?” [serious] Cuối cùng, chọn một bức đúng nhất với cảm xúc ban đầu, chứ đừng chỉ chọn bức đẹp nhất. [warm] Và nhớ nhé: [emphasized] Chọn cảm xúc trước, chọn ánh sáng sau. [curious] Ngoài màn hình, các cậu thử nhìn cùng một góc trong nhà vào buổi chiều và buổi tối xem cảm giác có khác nhau không. [excited] Buổi sau là bài cuối của chương: Mảnh ghép hoàn hảo. [cheerful] Chúng mình sẽ ghép những kỹ năng đã học để làm một bức tranh hoàn chỉnh. [warm] Tớ chờ các cậu!",
            "visual_dir": "Bàn thực hành Vòng Xoay Ánh Sáng Cảm Xúc: Đĩa quay 3 cung ánh sáng (Nắng sớm rực rỡ, Hoàng hôn ấm áp, Đêm trăng huyền bí) kèm 3 huy hiệu cảm xúc và chiếc đèn lồng đất nặn. Pop-up thần chú: CHỌN CẢM XÚC TRƯỚC, CHỌN ÁNH SÁNG SAU.",
            "asset_file": "assets/M2_HoaSiAI/M2.3_Shot5.1_BangThuThach_VongXoayAnhSangCamXuc.jpg",
            "asset_desc": "Vòng xoay ánh sáng cảm xúc: 3 vùng sáng (Nắng sáng, Hoàng hôn, Đêm trăng) + Thần chú: Chọn cảm xúc trước, ánh sáng sau"
        }
    ],
    "2.4": [
        {
            "seg_parent": "1. INTRO",
            "shot_code": "Shot 1.1",
            "timing": "0:00–0:15",
            "voice_gen": "[excited] Xưởng sáng tạo AKID mở cửa rồi! [giggles] Xin chào các cậu, tớ là AKI, chú mèo máy thông minh nhì quả đất này. [cheerful] Hôm nay mình đến với bài cuối của chủ đề Tớ là Hoạ sĩ Ây Ai: Mảnh ghép hoàn hảo. [proud] Ba bài vừa rồi, các cậu đã có ba mảnh ghép rồi nhé: [deliberate] biết tranh đang kể chuyện gì, biết ai là ngôi sao, và biết dùng ánh sáng để tạo cảm xúc. [excited] Hôm nay, chúng mình sẽ ghép cả ba lại để làm một bức tranh hoàn chỉnh. [mischievous] Và trong lúc làm, tớ sẽ đưa cho các cậu mảnh ghép cuối cùng còn thiếu.",
            "visual_dir": "Mèo AKI đứng trên Đảo Họa Sĩ AI, cầm chiếc hộp báu vật chứa 4 mảnh ghép nghệ thuật. Pop-up 3D: MẢNH GHÉP HOÀN HẢO.",
            "asset_file": "assets/MasterIslands/M2_Master_DaoHoaSiAI.jpg",
            "asset_desc": "Đảo Họa Sĩ AI - Bài 2.4: Mảnh ghép hoàn hảo"
        },
        {
            "seg_parent": "2. HOOK / TÌNH HUỐNG",
            "shot_code": "Shot 2.1",
            "timing": "0:15–0:50",
            "voice_gen": "[cheerful] Hôm qua Zico làm một bức tranh về một cậu bé đứng trên sân thượng, tay cầm cuộn dây, nhìn chiếc diều đang bay rất xa trên bầu trời chiều. [proud] Zico làm khá kỹ nhé. [calm] Cậu bé là nhân vật chính nên đứng nổi bật. [softly] Ánh sáng chiều muộn làm bức tranh hơi buồn, hơi tiếc nuối. [cheerful] Zico đem khoe cả lớp. [curious] MIMI nhìn một lúc rồi hỏi: “Bức này tên gì?” [thoughtful] Zico nghĩ mãi rồi viết: CẬU BÉ THẢ DIỀU. [serious] MIMI bảo: “Nhưng cái đó nhìn tranh là thấy mà.” [surprised] Ơ, đúng thật. [confused] Vậy ra bức tranh đã có chuyện, có ngôi sao, có cảm xúc rồi... [emphasized] nhưng vẫn còn thiếu mảnh ghép thứ tư.",
            "visual_dir": "Zico khoe bức tranh cậu bé thả diều trong ráng chiều vàng cam. Mimi đứng cạnh gãi đầu thắc mắc: Tên tranh 'Cậu bé thả diều' chỉ nói lại cái mắt thấy, chưa có hồn! Bức tranh vẫn thiếu mảnh ghép thứ 4.",
            "asset_file": "assets/M2_HoaSiAI/M2.4_Shot2.1_ZicoBucTranhThieuManhGhep4.jpg",
            "asset_desc": "Zico khoe tranh cậu bé thả diều nhưng bị Mimi chê tên tranh đơn điệu: Thiếu mảnh ghép thứ 4!"
        },
        {
            "seg_parent": "3. XEM MẪU + KỸ NĂNG",
            "shot_code": "Shot 3.1",
            "timing": "0:50–2:00",
            "voice_gen": "[calm] Mảnh ghép thứ nhất là CÂU CHUYỆN. Mảnh ghép thứ hai là NGÔI SAO. Mảnh ghép thứ ba là ÁNH SÁNG CẢM XÚC. [excited] Và mảnh ghép thứ tư chính là: TÊN BỨC TRANH! [deliberate] Đừng đặt tên chỉ để tả lại thứ mắt thấy. Hãy đặt cái tên mở ra một câu chuyện trong lòng người xem.",
            "visual_dir": "Mô hình 4 mảnh ghép đất nặn ăn khớp vào nhau hoàn hảo: 1. Cánh cửa mở (Có chuyện) - 2. Cúp ngôi sao (Nhân vật chính) - 3. Đèn lồng (Ánh sáng cảm xúc) - 4. Huy hiệu ruy băng vàng (Tên bức tranh có hồn).",
            "asset_file": "assets/M2_HoaSiAI/M2.4_Shot3.1_SoDo4ManhGhepKietTac.jpg",
            "asset_desc": "Sơ đồ 4 mảnh ghép kiệt tác: 1. Có chuyện + 2. Ngôi sao + 3. Ánh sáng cảm xúc + 4. Tên bức tranh có hồn"
        },
        {
            "seg_parent": "4. LÀM CÙNG & KIỆT TÁC",
            "shot_code": "Shot 4.1",
            "timing": "2:00–4:30",
            "voice_gen": "[excited] Zico đổi tên bức tranh lại thành: [emphasized] “CHIẾC DIỀU CUỐI CÙNG CỦA MÙA HÈ”. [amazed] Oa! Chỉ đổi tên thôi mà cảm xúc ùa về! [warm] Nhìn vào bức tranh, ai cũng thấy mùa hè sắp trôi qua, ngày mai phải đi học lại, và chiếc diều bay cao mang theo bao tiếc nuối tuổi thơ. [proud] Đây chính là một kiệt tác hoàn chỉnh!",
            "visual_dir": "Bức tranh khổ A3 đóng khung gỗ trang trọng: Cậu bé đứng trên sân cỏ ngước nhìn cánh diều đỏ bay vút giữa trời chiều hoàng hôn vàng cam ấm áp, tấm bảng tên khắc chữ 'Chiếc diều cuối cùng của mùa hè'. Cả lớp trầm trồ khen ngợi.",
            "asset_file": "assets/M2_HoaSiAI/M2.4_FrameA_KietTac_ChiecDieuCuoiCungMuaHe.jpg",
            "asset_desc": "Kiệt tác A3 đóng khung gỗ: 'Chiếc diều cuối cùng của mùa hè' hội tụ trọn vẹn 4 mảnh ghép hoàn hảo"
        },
        {
            "seg_parent": "5. TỔNG KẾT & OUTRO",
            "shot_code": "Shot 5.2",
            "timing": "4:30–5:30",
            "voice_gen": "[excited] Chúc mừng các cậu đã hoàn thành trọn vẹn 4 bài học của chặng HỌA SĨ ÂY AI! [proud] Các cậu đã nhận được HUY HIỆU HOẠ SĨ ĐẤT NẶN VÀNG DANH GIÁ! [cheerful] Buổi sau, khinh khí cầu của xưởng sẽ đưa chúng mình bay sang Đảo BIỆT ĐỘI NHÂN VẬT ÂY AI. [mischievous] Ở đó, chúng mình sẽ học cách tạo ra những nhân vật hoạt hình của riêng mình và giữ cho bạn ấy không bao giờ bị biến đổi. Tớ chờ các cậu!",
            "visual_dir": "Bàn lễ tốt nghiệp Đảo Họa Sĩ AI: Huy hiệu bảng màu vàng ruy băng rực rỡ, bản đồ kho báu và chiếc khinh khí cầu đất nặn chỉ đường bay sang Đảo Biệt Đội Nhân Vật AI trong mây. AKI reo vui chúc mừng.",
            "asset_file": "assets/M2_HoaSiAI/M2.4_Shot5.2_HuyHieuHoaSiAI_TeaserM3.jpg",
            "asset_desc": "Lễ trao Huy hiệu Họa Sĩ AI danh giá + Bản đồ & Khinh khí cầu chuẩn bị bay sang Đảo Biệt Đội Nhân Vật AI (M3)"
        }
    ]
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
            if not in_p2: continue
            
            if col0.startswith("Bài ") or "Bài " in col0:
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
                    asset_file, asset_desc = get_segment_asset(mod_code, cur_lesson["num"], seg_name, island_img)
                    detailed_dir = get_shot_breakdown(mod_code, cur_lesson["num"], seg_name, visual_dir)
                    
                    cur_lesson["segments"].append({
                        "seg_name": seg_name,
                        "timing": timing,
                        "dialogue": dialogue,
                        "voice_gen": voice_gen if voice_gen else dialogue,
                        "visual_dir": detailed_dir,
                        "notes": notes,
                        "asset_file": asset_file,
                        "asset_desc": asset_desc
                    })
    
    # Check for Granular Shot replacements
    for les in current_module["lessons"]:
        if les["num"] in GRANULAR_SHOTS:
            les["segments"] = []
            for s in GRANULAR_SHOTS[les["num"]]:
                les["segments"].append({
                    "seg_name": f"{s['seg_parent']} ➔ {s['shot_code']}",
                    "timing": s["timing"],
                    "dialogue": s["voice_gen"],
                    "voice_gen": s["voice_gen"],
                    "visual_dir": s["visual_dir"],
                    "notes": s.get("notes", ""),
                    "asset_file": s["asset_file"],
                    "asset_desc": s["asset_desc"]
                })

    all_modules.append(current_module)

# Generate Master Markdown
md_lines = []
md_lines.append("# 🎬 TỔNG HỢP STORYBOARD TOÀN DIỆN CHI TIẾT (M1 — M5)")
md_lines.append("> **Bản kịch bản sản xuất chuẩn hoá bao gồm toàn bộ LỜI THOẠI, VOICE GEN (CÓ TAG CẢM XÚC), TIMELINE, HÌNH ẢNH TRÊN MÀN HÌNH và FILE ASSET ĐẤT NẶN 2D FLAT SOFT CLAY.**\n")
md_lines.append("## 📐 BỐ CỤC KHUNG HÌNH VIDEO CHUẨN (16:9 STUDIO SETUP)")
md_lines.append("- **Bên Trái (25% khung hình):** Mèo AKI (Host Diễn Hoạt) cử động theo tag cảm xúc thoại, trỏ tay hướng dẫn.")
md_lines.append("- **Bên Phải (75% khung hình):** MÀN HÌNH NỘI DUNG CHÍNH (Smart Display) chiếu các asset tranh đất nặn và infographic.")
md_lines.append("- **Lớp Đồ Họa (Overlay):** Kinetic Typography, Pop-up từ khóa và khung viền tương tác.\n")
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
            md_lines.append("#### 📺 Nội Dung Chiếu Trong Màn Hình (On-Screen Display):")
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

# Generate HTML viewer with Video Studio Layout Mockup
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
    .img-preview {
      transition: transform 0.2s ease;
      cursor: pointer;
    }
    .img-preview:hover {
      transform: scale(1.02);
    }
    .studio-screen {
      background: #18181B;
      border: 8px solid #27272A;
      border-radius: 16px;
      position: relative;
    }
    .studio-screen::after {
      content: "📺 MÀN HÌNH NỘI DUNG (CHIẾU CẠNH MÈO AKI)";
      position: absolute;
      bottom: 8px;
      right: 12px;
      font-size: 9px;
      font-weight: 800;
      color: #F4F4F5;
      background: rgba(0,0,0,0.6);
      padding: 2px 8px;
      border-radius: 4px;
      letter-spacing: 0.05em;
    }
  </style>
</head>
<body class="p-4 md:p-8 max-w-7xl mx-auto">
  <header class="mb-8 text-center">
    <div class="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 text-amber-900 text-xs font-bold uppercase tracking-wider mb-3">
      🎬 BẢN DỰNG VIDEO CHUẨN: STUDIO SETUP + VOICE GEN + 100% SCREEN ASSETS
    </div>
    <h1 class="text-3xl md:text-5xl font-extrabold text-amber-950 mb-3">
      AI Kids — Kịch Bản Phân Cảnh Chi Tiết (M1 — M5)
    </h1>
    <p class="text-slate-600 max-w-3xl mx-auto text-sm md:text-base leading-relaxed">
      Sản phẩm giải quyết triệt để vấn đề dựng video: Mèo AKI đứng host bên ngoài, toàn bộ tranh vẽ, câu lệnh phân tích (Zico, Mimi, Bảo tàng, Thử thách) hiển thị trực quan trong màn hình bên cạnh theo từng câu thoại.
    </p>
  </header>

  <!-- Visual Studio Setup Blueprint Card -->
  <div class="mb-10 clay-card p-6 border-2 border-amber-300 bg-gradient-to-br from-amber-50/60 to-orange-50/40">
    <div class="flex items-center gap-2 mb-3">
      <span class="text-2xl">📐</span>
      <h3 class="text-lg font-black text-amber-950">SƠ ĐỒ BỐ CỤC KHUNG HÌNH VIDEO 16:9 (STUDIO DIRECTING BLUEPRINT)</h3>
    </div>
    <div class="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-white p-4 rounded-xl border border-amber-200">
      <!-- Left 3 cols: Aki Mascot Host -->
      <div class="md:col-span-4 bg-amber-100/70 border-2 border-dashed border-amber-400 rounded-xl p-4 text-center">
        <div class="text-3xl mb-1">🐱</div>
        <h4 class="font-black text-amber-900 text-sm">MÈO AKI (HOST / MC)</h4>
        <p class="text-xs text-amber-800 mt-1">Đứng góc trái (chiếm ~25–30%), diễn hoạt cử động theo các thẻ <code class="bg-amber-200 px-1 rounded">[cảm xúc]</code>, trỏ tay hoặc trò chuyện tương tác với màn hình bên cạnh.</p>
      </div>

      <!-- Right 8 cols: Smart Screen -->
      <div class="md:col-span-8 bg-slate-900 text-white rounded-xl p-4 border-2 border-slate-700 relative">
        <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-700">
          <span class="text-xs font-bold text-amber-400">📺 MÀN HÌNH HIỂN THỊ CHÍNH (Chiếm ~70–75% khung hình)</span>
          <span class="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-300">Tỉ lệ 16:9</span>
        </div>
        <div class="grid grid-cols-3 gap-2 text-center text-xs">
          <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span class="font-bold text-amber-300 block mb-1">1. Thế giới kể chuyện</span>
            <span class="text-[11px] text-slate-300">Bé Mimi vẽ mèo, Bạn Zico 4 khối màu, Bi bấm 5 lần lỗi.</span>
          </div>
          <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span class="font-bold text-emerald-300 block mb-1">2. Thẻ lệnh & Tranh AI</span>
            <span class="text-[11px] text-slate-300">Tranh chia đôi Trái vs Phải, 4 chìa khoá, Cốc sứ mẻ miệng.</span>
          </div>
          <div class="bg-slate-800/80 p-2.5 rounded border border-slate-700">
            <span class="font-bold text-blue-300 block mb-1">3. Bảng thử thách</span>
            <span class="text-[11px] text-slate-300">Nhiệm vụ 2 bước, 6 tim lượt tạo, Sổ tay Nhật ký AI.</span>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Navigation & Layout Switcher Tabs -->
  <div class="flex flex-wrap items-center justify-between gap-3 mb-10 sticky top-2 z-50 bg-[#FBF8F3]/95 backdrop-blur-md p-2.5 rounded-2xl border border-amber-200/80 shadow-md">
    <div class="flex flex-wrap items-center gap-1.5">
      <a href="#islands" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 transition">🏝️ 5 Đảo</a>
      <a href="#M1" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-emerald-100 hover:text-emerald-900 border border-slate-200 transition">M1 Thám Hiểm</a>
      <a href="#M2" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-amber-100 hover:text-amber-900 border border-slate-200 transition">M2 Họa Sĩ</a>
      <a href="#M3" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-orange-100 hover:text-orange-900 border border-slate-200 transition">M3 Biệt Đội</a>
      <a href="#M4" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-blue-100 hover:text-blue-900 border border-slate-200 transition">M4 Truyện Tranh</a>
      <a href="#M5" class="px-3 py-1.5 rounded-xl text-xs font-bold bg-white text-slate-700 hover:bg-purple-100 hover:text-purple-900 border border-slate-200 transition">M5 Trò Chơi</a>
    </div>

    <!-- Layout Switcher Buttons -->
    <div class="flex items-center gap-1 bg-amber-100/70 p-1 rounded-xl border border-amber-200 text-xs font-bold text-slate-700">
      <span class="px-2 text-[11px] text-amber-900 font-extrabold uppercase hidden sm:inline">Bố cục:</span>
      <button onclick="setLayout(3)" id="btn-col-3" class="px-2.5 py-1 rounded-lg bg-amber-600 text-white shadow-xs transition">🔲 3 Cột (Lưới)</button>
      <button onclick="setLayout(2)" id="btn-col-2" class="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 transition">📑 2 Cột</button>
      <button onclick="setLayout(1)" id="btn-col-1" class="px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 transition">📄 1 Cột</button>
    </div>
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
        <img src="{m['island_img']}" class="w-full aspect-video object-cover img-preview" alt="{m['title']}">
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
    <div class="mb-14">
      <div class="bg-gradient-to-r from-amber-100/90 via-amber-50 to-orange-50 border border-amber-200/90 rounded-2xl px-5 py-3.5 mb-6 flex flex-wrap items-center justify-between shadow-sm">
        <div>
          <span class="text-xs font-bold uppercase tracking-wider text-amber-700">Chương trình 7 Phút / Bài</span>
          <h3 class="text-lg md:text-xl font-black text-amber-950 flex items-center gap-2 mt-0.5">
            <span>📖</span> {les['title']}
          </h3>
        </div>
        <div class="flex items-center gap-2 mt-2 md:mt-0">
          <span class="text-xs font-bold px-3 py-1 bg-white/90 rounded-xl border border-amber-300/80 text-amber-900 shadow-xs">
            {len(les['segments'])} Phân cảnh (Shots)
          </span>
        </div>
      </div>

      <!-- Storyboard Side-by-Side Grid -->
      <div class="storyboard-container grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
"""
        for seg in les["segments"]:
            highlighted_voice = seg["voice_gen"]
            highlighted_voice = re.sub(r'(\[[a-zA-Z_\-]+\])', r'<span class="voice-tag">\1</span>', highlighted_voice)
            highlighted_voice = highlighted_voice.replace("\n", "<br>")
            
            html_template += f"""
        <!-- Shot Card -->
        <div class="storyboard-card bg-white rounded-2xl border-2 border-[#EFE4D8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
          <!-- Top: 16:9 Screen Frame with Floating Badges -->
          <div>
            <div class="relative bg-slate-950 aspect-video overflow-hidden group">
              <img src="{seg['asset_file']}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer" alt="{seg['asset_desc']}" onclick="window.open(this.src)">
              
              <!-- Floating Top Badges -->
              <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10 max-w-[70%]">
                <span class="px-2.5 py-1 rounded-lg text-[11px] font-black bg-amber-500 text-white shadow-md uppercase tracking-wider truncate">
                  {seg['seg_name']}
                </span>
              </div>
              <div class="absolute top-2.5 right-2.5 z-10">
                <span class="px-2 py-1 rounded-lg text-[11px] font-black bg-slate-900/85 text-white backdrop-blur-md shadow-md border border-white/20">
                  ⏱️ {seg['timing']}
                </span>
              </div>
              
              <!-- Bottom overlay badge -->
              <div class="absolute bottom-2 right-2.5 z-10 text-[9px] font-extrabold text-slate-200 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                📺 Màn hình Studio
              </div>
            </div>

            <!-- Content Body -->
            <div class="p-4">
              <!-- Voice Dialogue -->
              <div class="mb-3">
                <div class="text-[11px] font-extrabold uppercase tracking-wider text-amber-800 mb-1 flex items-center gap-1">
                  <span>🎙️</span> Lời thoại Voice Gen:
                </div>
                <div class="bg-[#FFFDF9] border border-amber-100/90 rounded-xl p-3 text-xs text-slate-700 leading-relaxed max-h-36 overflow-y-auto shadow-inner">
                  {highlighted_voice}
                </div>
              </div>

              <!-- Visual / Mascot Directions -->
              <div class="bg-amber-50/70 border border-amber-200/60 rounded-xl p-3 text-xs text-slate-700">
                <div class="text-[10px] font-black uppercase text-amber-900 mb-1 flex items-center gap-1">
                  <span>🎬</span> Diễn hoạt AKI & Màn hình:
                </div>
                <div class="text-[11px] text-slate-600 leading-snug">
                  {seg['visual_dir'] or 'Mèo AKI chỉ tay vào màn hình bên cạnh, diễn hoạt theo nhịp thoại.'}
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer: Asset Link -->
          <div class="px-4 py-2.5 bg-[#FAF7F2] border-t border-[#EFE4D8] flex items-center justify-between text-[11px]">
            <span class="font-mono text-amber-900 font-semibold truncate max-w-[190px]" title="{seg['asset_file']}">
              📄 {os.path.basename(seg['asset_file'])}
            </span>
            <button onclick="window.open('{seg['asset_file']}')" class="text-amber-700 font-bold hover:text-amber-900 hover:underline flex items-center gap-0.5">
              <span>Phóng to</span> ↗
            </button>
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

  <script>
    function setLayout(cols) {
      const containers = document.querySelectorAll('.storyboard-container');
      const b1 = document.getElementById('btn-col-1');
      const b2 = document.getElementById('btn-col-2');
      const b3 = document.getElementById('btn-col-3');
      
      const inactiveClass = 'px-2.5 py-1 rounded-lg bg-white hover:bg-amber-50 text-slate-700 transition';
      const activeClass = 'px-2.5 py-1 rounded-lg bg-amber-600 text-white shadow-xs transition';
      
      [b1, b2, b3].forEach(b => { if(b) b.className = inactiveClass; });

      containers.forEach(el => {
        el.classList.remove('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
        if (cols === 3) {
          el.classList.add('grid-cols-1', 'md:grid-cols-2', 'lg:grid-cols-3');
          if (b3) b3.className = activeClass;
        } else if (cols === 2) {
          el.classList.add('grid-cols-1', 'lg:grid-cols-2');
          if (b2) b2.className = activeClass;
        } else {
          el.classList.add('grid-cols-1');
          if (b1) b1.className = activeClass;
        }
      });
    }
  </script>
</body>
</html>
"""

with open(OUT_HTML, "w", encoding="utf-8") as fp:
    fp.write(html_template)

print("Recompiled Storyboard v2 with Studio Setup & 100% Unique Assets successfully!")
