# Storybook of Legends — Product Master

> Cập nhật: 30/07/2026
>
> Phạm vi: AIKid Web, AIKids App và StoryMee Hub
>
> Trạng thái: Web experience đã có; dữ liệu Storybook/Reward/Social vẫn cần Hub để đồng bộ xuyên thiết bị.

## 1. Tầm nhìn

Storybook of Legends là lớp metagame chung của hệ sinh thái StoryMee. Mỗi hoạt động học tập, sáng tạo và tương tác an toàn giúp trẻ hoàn thiện một cuốn sách huyền thoại cá nhân.

Storybook không thay thế khóa học và không phải mạng xã hội trẻ em. Nó có ba nhiệm vụ:

1. Biến tiến bộ dài hạn thành câu chuyện dễ hiểu.
2. Trao phần thưởng có giá trị sử dụng trên Profile.
3. Tạo tương tác tích cực mà không dựa vào so sánh gây áp lực.

## 2. Nguyên tắc sản phẩm

- Mọi trang sách đều có thể xem; sticker mới cần điều kiện để mở.
- Không bán sticker hoặc phần thưởng Chapter.
- Không mất sticker, XP hay danh hiệu khi trẻ nghỉ học.
- Không hiển thị điểm social thô, dislike hoặc comment tự do.
- Video hoàn thành Storybook không được chia sẻ ra Profile/feed.
- Ảnh thật, prompt và workspace riêng tư luôn theo quyền phụ huynh.
- Phần thưởng phải thay đổi được diện mạo Profile, không chỉ là badge trang trí.

## 3. Cấu trúc cuốn sách

Web hiện có 8 trang, mỗi trang gồm 8 sticker thường và 1 Boss sticker:

| Trang | Tên | Nhóm | Phần thưởng hoàn thành |
|---|---|---|---|
| P01 | Cánh Cổng Thế Giới AI | Learning | Background Bình Minh Cổng AI |
| P02 | Vương Quốc Ngôn Ngữ | Learning | Khung Thư Viện Cổ |
| P03 | Đại Dương Hình Ảnh | Creative | Background Đại Dương Sáng Tạo |
| P04 | Đỉnh Núi Tri Thức | Milestone | Khung Đỉnh Núi Vàng |
| P05 | Xưởng Của Paco | Creative | Theme Xưởng Paco |
| P06 | Rừng Nhân Vật | Creative | Background Rừng Hộ Vệ |
| P07 | Thiên Hà Câu Chuyện | Creative | Khung Người Kể Chuyện Thiên Hà |
| P08 | Trái Tim Kết Nối | Social | Theme Trái Tim Kết Nối |

### Quy tắc Chapter

- S1–S8 mở từ event học tập, sáng tạo hoặc social.
- Khi đủ S1–S8, trẻ được nhận S9/Boss và Chapter reward.
- Sau khi nhận, CTA đưa trẻ đến Profile → Tùy biến card.
- Reward đã nhận nằm trong inventory và có thể trang bị/gỡ.

### 3.1. Mạch truyện xuyên suốt

Tám Chapter không phải tám bộ sưu tập rời. Chúng tạo thành hành trình một năm
khám phá cùng Paco:

```text
P01 Mở cổng và học cách đặt câu hỏi
  ↓ ngôn ngữ giúp gọi tên điều con nghĩ
P02 Biến câu hỏi thành từ ngữ và câu chuyện
  ↓ câu chuyện cần hình ảnh để trở nên sống động
P03 Biến ý tưởng thành hình ảnh
  ↓ dừng lại nhìn thành quả và sức bền
P04 Chinh phục cột mốc cá nhân
  ↓ mang kỹ năng đã có vào một xưởng thực hành
P05 Ghép công cụ thành dự án
  ↓ dự án cần nhân vật có cá tính
P06 Thổi hồn cho nhân vật
  ↓ nhân vật cần một thế giới và cốt truyện
P07 Hoàn thiện câu chuyện của riêng mình
  ↓ câu chuyện có ý nghĩa hơn khi nâng đỡ người khác
P08 Trở thành một phần của cộng đồng sáng tạo an toàn
```

Mỗi Chapter phải để lại một “vật dẫn truyện” xuất hiện thoáng qua ở Chapter
tiếp theo. Vật dẫn truyện giúp designer tạo cảm giác đây là cùng một thế giới:

| Từ | Sang | Vật dẫn truyện |
|---|---|---|
| P01 | P02 | Chìa khóa portal biến thành bookmark |
| P02 | P03 | Mực từ cuốn sách chảy thành đại dương màu |
| P03 | P04 | Vỏ sò giữ một ngôi sao dẫn đường lên núi |
| P04 | P05 | Tinh thể trên đỉnh núi trở thành lõi năng lượng của xưởng |
| P05 | P06 | Bản thiết kế tạo ra cánh cửa hình chiếc lá |
| P06 | P07 | Cú bảo hộ mang theo một trang truyện lên trời |
| P07 | P08 | Các hành tinh-câu-chuyện nối nhau thành trái tim |
| P08 | P01 | Trái tim phát sáng trở lại thành cổng cho hành trình mới |

### 3.2. Nhịp hoàn thành Chapter và video S9

Video Chapter chỉ xuất hiện sau khi backend đã xác nhận đủ S1–S8 và trẻ claim
S9/Boss thành công:

```text
S1–S8 đủ
→ CTA “Nhận phần thưởng”
→ backend claim S9 + reward
→ reveal Boss sticker
→ CTA “Xem chương truyện”
→ completion video 30–45 giây
→ reward reveal
→ teaser Chapter tiếp theo
→ “Trang trí Profile” hoặc “Đi tiếp”
```

Video là phần thưởng kể chuyện, không phải điều kiện để nhận S9. Nếu video lỗi
hoặc trẻ bỏ qua, Boss sticker và reward vẫn phải được giữ. Video:

- không autoplay có âm thanh;
- có nút bỏ qua;
- có phụ đề tiếng Việt;
- không chứa tên thật, ảnh thật, prompt hoặc tác phẩm riêng tư của trẻ;
- không xuất hiện trong Profile, Gallery hoặc activity feed;
- chỉ thẻ milestone tĩnh được phép chia sẻ;
- tôn trọng `prefers-reduced-motion`.

Hiện runtime đã có claim S9 và Chapter reward nhưng **chưa có player/contract
completion video**. Phần video dưới đây là narrative và design specification
cho phase triển khai tiếp theo, không phải chức năng đã deploy.

### 3.3. P01 — Cánh Cổng Thế Giới AI

**Vai trò trong đại truyện:** chương mở đầu. Paco tìm thấy một cánh cổng không
phản ứng với mật mã, mà chỉ mở khi trẻ biết quan sát, đặt câu hỏi và thử lại.

**Ý tưởng trung tâm:** AI không phải phép thuật trả lời mọi thứ. Nó là một công
cụ khám phá tốt hơn khi con biết hỏi, kiểm tra và học từ kết quả.

**Không gian thiết kế:**

- bình minh violet–sun;
- đường mòn bằng các ngôi sao nhỏ;
- portal bằng chất liệu clay/paper, không dùng vòng neon;
- Paco ở vai trò người bạn dẫn đường, không phải “AI toàn năng”.

**S1–S8 kể câu chuyện:** bước chân đầu tiên → đặt câu hỏi → nhận sao → giữ nhịp
học → hoàn thành chương → gom sao → tạo thói quen → tự chọn hành trình.

**S9/Boss:** `Paco’s Chosen One`. Cánh cổng mở vì trẻ đã chứng minh sự tò mò và
kiên trì, không phải vì đạt điểm cao hơn người khác.

**Video hoàn thành — “Cánh cổng thức giấc” (35 giây):**

1. 0–6s: tám sticker bay về tám vị trí quanh portal.
2. 6–14s: mỗi sticker bật một ký hiệu; Paco thử ghép chúng.
3. 14–23s: trẻ chạm biểu tượng câu hỏi, portal mở bằng ánh sáng ấm.
4. 23–30s: reveal S9 và Background Bình Minh Cổng AI.
5. 30–35s: một bookmark bay qua portal, teaser P02.

**Liên kết sang P02:** chìa khóa portal kéo dài thành bookmark; phía sau cổng là
một thư viện đang ngủ.

### 3.4. P02 — Vương Quốc Ngôn Ngữ

**Vai trò trong đại truyện:** trẻ học cách gọi tên ý tưởng. Thư viện chỉ sáng
lên khi từ, câu và câu chuyện được đặt đúng vào những trang còn trống.

**Ý tưởng trung tâm:** ngôn ngữ giúp con làm rõ suy nghĩ và chia sẻ nó với người
khác; không đánh giá trẻ bằng vốn từ hoặc khả năng viết dài.

**Không gian thiết kế:**

- thư viện cây, đèn vàng và giấy thủ công;
- chữ cái như sinh vật nhỏ có biểu cảm;
- bookmark P01 xuất hiện xuyên suốt;
- tránh hình ảnh thư viện tối, bụi hoặc đáng sợ.

**S1–S8 kể câu chuyện:** học từ → kể ngắn → đọc một unit → viết → hoàn thành
quest → song ngữ → được động viên → sưu tầm sao.

**S9/Boss:** `Paco’s Storyteller`. Trẻ hoàn thành cuộn truyện đầu tiên đủ sức
đánh thức thư viện.

**Video hoàn thành — “Dòng mực biết kể chuyện” (35 giây):**

1. 0–8s: các sticker trở thành ký tự và vật thể trong trang sách.
2. 8–16s: Paco đọc; căn phòng thư viện lần lượt sáng đèn.
3. 16–24s: dòng mực tràn khỏi trang nhưng không gây hỗn loạn.
4. 24–30s: reveal S9 và Khung Thư Viện Cổ.
5. 30–35s: mực chảy xuống sàn thành làn nước xanh, teaser P03.

**Liên kết sang P03:** câu chuyện rời trang sách và biến thành đại dương hình
ảnh; trẻ cần dùng màu sắc để nhìn thấy điều mình vừa viết.

### 3.5. P03 — Đại Dương Hình Ảnh

**Vai trò trong đại truyện:** ý tưởng đã có ngôn ngữ nay được tạo hình. Mỗi tác
phẩm là một hòn đảo khác nhau, không có “phong cách đúng”.

**Ý tưởng trung tâm:** hình ảnh AI là kết quả của lựa chọn sáng tạo, thử nghiệm
và chỉnh sửa; trẻ là người đưa ra ý tưởng và chịu trách nhiệm với sản phẩm.

**Không gian thiết kế:**

- đại dương sky–coral, sóng như nét cọ;
- đảo hình palette, khung tranh và comic panel;
- sinh vật biển bằng giấy/clay;
- không dùng ảnh photoreal hoặc biển sâu đáng sợ.

**S1–S8 kể câu chuyện:** ảnh đầu tiên → nhân vật → Mee → bộ sưu tập → nhiều
phong cách → chia sẻ được duyệt → mười tác phẩm → comic hoàn chỉnh.

**S9/Boss:** `Ocean Artist`. Một vỏ sò ngọc trai chứa toàn bộ màu sắc trẻ đã
khám phá.

**Video hoàn thành — “Hòn đảo chưa từng có” (40 giây):**

1. 0–8s: tám sticker hóa thành thuyền, buồm, màu và sinh vật.
2. 8–20s: Paco đi qua các đảo, mỗi đảo mang một phong cách khác.
3. 20–29s: vỏ sò mở, phóng một chùm màu tạo thành hòn đảo mới.
4. 29–35s: reveal S9 và Background Đại Dương Sáng Tạo.
5. 35–40s: vỏ sò giữ lại một ngôi sao, teaser con đường lên P04.

**Liên kết sang P04:** sao trong vỏ sò trở thành đèn dẫn đường trên sườn núi.

### 3.6. P04 — Đỉnh Núi Tri Thức

**Vai trò trong đại truyện:** midpoint của cuốn sách. Trẻ dừng lại để nhận ra
mình đã đi xa nhờ nỗ lực, không phải để so hạng với bạn khác.

**Ý tưởng trung tâm:** milestone ghi nhận sự bền bỉ và tiến bộ cá nhân. Visual
không được biến Chapter thành bảng xếp hạng cạnh tranh.

**Không gian thiết kế:**

- núi amber–sun, đá như giấy xếp;
- cờ hành trình có ký hiệu của P01–P03;
- đường leo có trạm nghỉ;
- tránh podium, số hạng lớn hoặc nhân vật khác đứng thấp hơn.

**S1–S8 kể câu chuyện:** streak → hoàn thành khóa → gom sao → cột mốc tuần →
chuỗi bài chất lượng → dẫn đường → truyền cảm hứng → streak dài.

**S9/Boss:** `The Summit`. Trẻ cắm lá cờ mang biểu tượng riêng trên đỉnh núi.

**Video hoàn thành — “Nhìn lại con đường” (40 giây):**

1. 0–10s: Paco và trẻ nhìn lại các vùng P01–P03 phía dưới.
2. 10–20s: sticker tạo thành bậc đá cuối cùng.
3. 20–29s: cắm cờ; không có đám đông hoặc huy chương xếp hạng.
4. 29–35s: reveal S9 và Khung Đỉnh Núi Vàng.
5. 35–40s: tinh thể trên đỉnh phát sáng như một lõi máy, teaser P05.

**Liên kết sang P05:** năng lượng từ cột mốc không kết thúc hành trình; nó trở
thành nhiên liệu để trẻ bắt tay làm dự án thật.

### 3.7. P05 — Xưởng Của Paco

**Vai trò trong đại truyện:** chuyển từ kỹ năng riêng lẻ sang thực hành dự án.
Paco không giao đáp án mà mở xưởng, đưa công cụ và để trẻ tự thử.

**Ý tưởng trung tâm:** bản nháp, sai sót và thử lại là một phần bình thường của
quá trình sáng tạo.

**Không gian thiết kế:**

- xưởng orange–sun, gỗ sáng và clay;
- blueprint, bánh răng, hộp công cụ;
- lõi tinh thể P04 cung cấp năng lượng;
- không dùng nhà máy kim loại nặng hoặc giao diện kỹ thuật phức tạp.

**S1–S8 kể câu chuyện:** mở xưởng → bản vẽ → thử công cụ → nhận động viên →
milestone lớp → Paco Pick → nhiều dự án → dùng trọn bộ công cụ.

**S9/Boss:** `Master Inventor`. Một máy nhỏ do trẻ tự ghép hoạt động theo cách
không ai dự đoán nhưng vẫn an toàn.

**Video hoàn thành — “Phát minh không giống bản vẽ” (40 giây):**

1. 0–9s: sticker biến thành linh kiện và dụng cụ.
2. 9–20s: Paco lắp sai một chi tiết; máy không chạy.
3. 20–29s: trẻ đổi cách ghép; máy tạo ra một cánh cửa hình lá.
4. 29–35s: reveal S9 và Theme Xưởng Paco.
5. 35–40s: cánh cửa mở ra khu rừng P06.

**Liên kết sang P06:** sản phẩm quan trọng nhất của xưởng không phải một máy,
mà là cánh cửa dẫn tới những nhân vật đang chờ có câu chuyện.

### 3.8. P06 — Rừng Nhân Vật

**Vai trò trong đại truyện:** trẻ học rằng nhân vật không chỉ là diện mạo; mỗi
nhân vật cần cảm xúc, động cơ, tiểu sử và quan hệ.

**Ý tưởng trung tâm:** sáng tạo nhân vật nuôi dưỡng đồng cảm. Không đánh giá
ngoại hình hoặc ép nhân vật theo khuôn mẫu giới tính.

**Không gian thiết kế:**

- rừng forest–lime, lá lớn và ánh sáng đốm;
- gương biểu cảm, tủ trang phục, sổ tiểu sử;
- cú bảo hộ làm guide phụ;
- nhân vật đa dạng hình dáng, khả năng và cách thể hiện.

**S1–S8 kể câu chuyện:** nhân vật đầu → diện mạo → biểu cảm → nhóm phiêu lưu →
tiểu sử → được yêu thích → vào truyện → dàn nhân vật.

**S9/Boss:** `Forest Guardian`. Cú bảo hộ trao một chiếc lông vũ ghi lại “tiếng
nói riêng” của nhân vật.

**Video hoàn thành — “Khu rừng lên tiếng” (40 giây):**

1. 0–10s: các nhân vật im lặng xuất hiện như silhouette.
2. 10–22s: sticker lần lượt trao trang phục, biểu cảm và tiểu sử.
3. 22–30s: khu rừng sáng lên khi các nhân vật tự giới thiệu.
4. 30–35s: reveal S9 và Background Rừng Hộ Vệ.
5. 35–40s: cú bay lên trời cùng một trang giấy, teaser P07.

**Liên kết sang P07:** nhân vật đã có tiếng nói cần một thế giới, xung đột và
kết thúc để trở thành câu chuyện hoàn chỉnh.

### 3.9. P07 — Thiên Hà Câu Chuyện

**Vai trò trong đại truyện:** kết hợp ngôn ngữ P02, hình ảnh P03, công cụ P05 và
nhân vật P06 thành tác phẩm có mở đầu, phát triển và kết thúc.

**Ý tưởng trung tâm:** câu chuyện là hệ thống kết nối nhiều lựa chọn; plot twist
không quan trọng bằng việc câu chuyện mang dấu ấn của trẻ.

**Không gian thiết kế:**

- thiên hà indigo–lavender;
- hành tinh là trang sách, sao chổi là nét bút;
- mỗi hành tinh có visual echo từ Chapter trước;
- tránh không gian đen đặc, chiến tranh vũ trụ hoặc hiệu ứng neon.

**S1–S8 kể câu chuyện:** trang đầu → hoàn thành truyện → plot twist → ba chương
→ lời kể → được chia sẻ → nhiều truyện → nhận động viên.

**S9/Boss:** `Galaxy Storyteller`. Hành tinh-câu-chuyện của trẻ tìm được quỹ đạo
riêng trong thiên hà.

**Video hoàn thành — “Hành tinh mang tên câu chuyện” (45 giây):**

1. 0–10s: tám sticker trở thành tám mảnh của một hành tinh.
2. 10–24s: nhân vật đi qua mở đầu, thử thách và đoạn kết.
3. 24–34s: hành tinh tìm được quỹ đạo, không va vào câu chuyện của người khác.
4. 34–40s: reveal S9 và Khung Người Kể Chuyện Thiên Hà.
5. 40–45s: các đường quỹ đạo ghép thành trái tim, teaser P08.

**Liên kết sang P08:** câu chuyện không kết thúc khi được tạo xong; nó có thể
trở thành nguồn cảm hứng an toàn cho bạn bè và gia đình.

### 3.10. P08 — Trái Tim Kết Nối

**Vai trò trong đại truyện:** kết chương của mùa đầu. Trẻ học cách cho và nhận
sự động viên, chia sẻ có consent và tôn trọng nguồn cảm hứng.

**Ý tưởng trung tâm:** cộng đồng tốt không được xây bằng độ nổi tiếng mà bằng
những hành động nâng đỡ sự sáng tạo của nhau.

**Không gian thiết kế:**

- pink–coral với mint/sun hỗ trợ;
- đường kết nối mềm, bàn tay và reaction tích cực;
- motif từ P01–P07 tụ lại nhưng không tạo cảm giác quá tải;
- không dùng follower count, like storm, podium hoặc đám đông reo hò.

**S1–S8 kể câu chuyện:** reaction đầu → động viên nhiều lần → Gallery → chia sẻ
được duyệt → Paco Pick → truyền cảm hứng → trái tim vàng → được cộng đồng yêu.

**S9/Boss:** `Community Legend`. Huy hiệu không nói “nổi tiếng nhất”; nó ghi
nhận trẻ đã giúp người khác muốn tiếp tục sáng tạo.

**Video hoàn thành — “Cuốn sách tiếp tục được viết” (45 giây):**

1. 0–12s: reaction từ nhiều vòng tròn an toàn bay tới dưới dạng ánh sáng.
2. 12–25s: các vật dẫn truyện P01–P07 xuất hiện quanh cuốn sách.
3. 25–34s: trẻ và Paco đóng bìa mùa đầu; tên thật không xuất hiện.
4. 34–40s: reveal S9 và Theme Trái Tim Kết Nối.
5. 40–45s: trái tim trên bìa mở thành portal mới, loop về P01/P09.

**Liên kết trở lại:** hành trình là vòng xoắn, không phải đường thẳng. Trẻ có
thể quay lại Chapter cũ, còn mùa sau có thể bắt đầu ở P09 mà không làm mất
thành tích đã có.

### 3.11. Hệ thống completion video cho designer

Mọi video dùng cùng grammar để trẻ nhận ra đây là phần thưởng Storybook:

| Beat | Thời lượng | Chức năng |
|---|---:|---|
| Gather | 5–10s | S1–S8 tụ lại |
| Problem | 6–10s | Nhắc thử thách của Chapter |
| Transformation | 8–14s | Sticker giúp thế giới thay đổi |
| Boss reveal | 5–7s | S9 xuất hiện |
| Reward reveal | 4–6s | Reward Profile |
| Bridge | 4–6s | Vật dẫn truyện sang Chapter sau |

Thông số đề xuất:

| Thuộc tính | Giá trị |
|---|---|
| Master | 1920×1080, 16:9 |
| Mobile-safe crop | 1080×1350, 4:5 |
| Frame rate | 24 hoặc 30 fps |
| Duration | 30–45 giây |
| Delivery | MP4 H.264 + WebM fallback |
| Audio | AAC, loudness khoảng −16 LUFS |
| Subtitle | WebVTT tiếng Việt; không bake text |
| Poster | WebP 1600×900 |
| Max target | 12 MB/video sau tối ưu |

Safe area:

- giữ nhân vật/Boss trong 60% giữa;
- không đặt nội dung quan trọng ở 12% mép;
- subtitle nằm trong vùng dưới nhưng không che reward;
- thiết kế được cả khi mute.

Naming:

```text
storybook/{slug}/video/{slug}-completion-v01.mp4
storybook/{slug}/video/{slug}-completion-v01.webm
storybook/{slug}/video/{slug}-completion-poster.webp
storybook/{slug}/video/{slug}-completion-vi.vtt
```

Contract đề xuất cho Chapter Studio:

```ts
type ChapterCompletionMedia = {
  videoUrl: string
  webmUrl?: string
  posterUrl: string
  captionsUrl?: string
  durationSeconds: number
  nextChapterSlug?: string
  bridgeObject?: string
}
```

Field nên nằm trong `assets.completionMedia` của version Chapter đã publish.
Client chỉ đọc media sau khi API trả Boss sticker đã claim. Signed/private media
URL phải được ưu tiên nếu video chưa được phép public.

## 4. Mô hình tiến bộ

Ba hệ giá trị phải tách biệt:

| Hệ | Nguồn | Ý nghĩa |
|---|---|---|
| XP khám phá | Tất cả app, game, event, học tập | Cấp độ toàn hệ sinh thái |
| Tiến bộ học tập | Bài học, khóa học, sao | Năng lực và mức hoàn thành học |
| Storybook | Sticker và Chapter | Dấu mốc câu chuyện, bộ sưu tập và reward |

XP không được dùng thay thế tiến độ học. Storybook có thể nhận trigger từ cả XP, học tập và sáng tạo nhưng phải lưu nguồn event.

### 4.1. Nhịp XP và level cho trẻ 8–11 tuổi

Hub là nguồn sự thật duy nhất cho XP ledger, level và inventory. Client không tự
cộng XP hoặc hạ ngưỡng hiển thị riêng. Nhịp mục tiêu:

- 1 phiên học 10–15 phút luôn có phản hồi tiến bộ nhìn thấy được.
- Cứ đủ thêm 100 lifetime XP thì tăng một level.
- Công thức duy nhất ở backend: `level = floor(totalXp / 100) + 1`.
- API phải trả `totalXp`, `level`, `xpIntoLevel`, `xpToNextLevel` và reward của
  level kế tiếp; client không tự tính lại level.
- Mỗi level có ít nhất một reward; có thể nhận đồng thời một vật phẩm và một
  danh hiệu.
- Không thưởng XP cho thao tác lặp vô nghĩa; game và social cần giới hạn theo
  ngày hoặc theo activity id để tránh farm.

Curve chính thức để Hub và các app đồng bộ:

| Level | XP tích lũy | Khoảng XP |
|---:|---:|---:|
| 1 | 0 | — |
| 2 | 100 | 100 |
| 3 | 200 | 100 |
| 4 | 300 | 100 |
| 5 | 400 | 100 |
| 6 | 500 | 100 |
| 7 | 600 | 100 |
| 8 | 700 | 100 |
| 9 | 800 | 100 |
| 10 | 900 | 100 |

Mọi thay đổi curve phải migrate level từ lifetime XP và chạy lại unlock reward
idempotently. Không giảm XP đã có, không thu hồi reward đã nhận.

### 4.2. Cadence reward kiểu bản đồ hành trình

Reward không dồn toàn bộ vào 10 level đầu. Backend dàn reward theo nhịp lặp:

| Nhịp | Reward |
|---|---|
| Mỗi level | Tiến thêm một ô trên bản đồ và nhận phản hồi ăn mừng ngắn |
| Level chẵn | Một danh hiệu hoặc sticker thường |
| Mỗi 3 level | Một cosmetic nhỏ: avatar, effect hoặc background thẻ |
| Mỗi 5 level | Rương lớn: frame, theme, companion hoặc sticker hiếm |
| Mỗi 10 level | Mốc chương: reward nổi bật và mở một nhánh Storybook |

Không dùng random reward có xác suất hoặc cơ chế loot box. Reward của từng level
phải thấy trước để trẻ biết mình đang tiến tới đâu. Reward đã claim nằm trong
inventory vĩnh viễn; việc đổi curve không được thu hồi reward.

## 5. Reward và Profile

Profile được ghép từ các lớp độc lập:

```text
Background
→ Theme
→ Frame
→ Avatar do trẻ chọn
→ Paco companion
→ Glow/effect
→ Danh hiệu
→ Chapter badge
```

Avatar không phải phần thưởng. Trẻ chọn avatar từ:

- camera thiết bị;
- ảnh upload;
- ảnh generate từ AIKids;
- Media Gallery/Ba lô.

Reward gồm:

- `background`: nền Profile card;
- `theme`: phong cách trang cá nhân;
- `frame`: khung avatar;
- `companion`: Paco đồng hành;
- `effect`: glow/sparkle;
- `title`: danh hiệu;
- `perk` và `event_ticket`: quyền lợi khác.

## 6. Trang cá nhân

Trang cá nhân public có URL `/u/:childId` và chỉ hiển thị module được bật:

- Storybook/Chapter gần nhất;
- tiến độ học;
- danh hiệu;
- tác phẩm đã được phụ huynh duyệt;
- bạn bè ghim;
- activity feed an toàn.

Trang public phải có nút quay lại Profile của trẻ và về sảnh AIKid. Với người xem ngoài phiên đăng nhập, nút quay lại Profile sẽ đi qua login/guard.

Backend hiện yêu cầu người xem đăng nhập và thuộc audience đã cấp quyền. Link công
khai ngoài hệ sinh thái chưa được bật cho tới khi có signed share token và consent
riêng của phụ huynh.

## 7. Social layer

Social phục vụ ba vòng tròn:

- Bạn bè đã được duyệt;
- Family Space;
- School/Class Space.

Tương tác cho phép:

- reaction dựng sẵn;
- Paco Pick có quota;
- xem Profile theo quyền;
- chia sẻ workspace theo audience;
- challenge/remix có nguồn gốc rõ ràng.

Không cho phép:

- tìm kiếm trẻ toàn hệ thống bằng tên/email/số điện thoại;
- direct message tự do;
- comment tự do;
- chia sẻ video Storybook;
- tự động công khai workspace/tác phẩm.

Chi tiết nằm trong [STORYBOOK_SOCIAL_INTERACTION.md](./STORYBOOK_SOCIAL_INTERACTION.md).

## 8. Trạng thái triển khai

| Hạng mục | Trạng thái |
|---|---|
| Book reader 8 trang, 72 sticker | Đã có trên Web |
| Gallery, leaderboard, interaction tabs | Đã có UI |
| Chapter reward card | Đã có |
| Reward wardrobe/Profile layers | Đã có |
| Avatar modal camera/upload/gallery | Đã có |
| Public Profile và module settings | Đã có |
| Friend code, favorite, request UI | Đã nối Core Gamification |
| Activity feed/reaction | Đã nối Core Gamification |
| Workspace audience controls | Đã nối Core Account |
| Reward inventory/Storybook claim trên Fastify API | Đã có server source of truth |
| Đồng bộ Reward Inventory qua StoryMee Hub | Đã triển khai |
| Social Graph trên Fastify API | Đã có invite, duyệt phụ huynh, favorite, block |
| Activity Feed và Reaction trên Fastify API | Đã có audience filter và Paco quota |
| Public Profile projection trên StoryMee Core | Đã có visibility và safe fields qua Hub |
| Workspace ACL trên StoryMee Core | Đã có parent approval và revoke tức thời |
| Đồng bộ Social Graph qua StoryMee Hub | Đã triển khai |
| Public Profile xuyên thiết bị | Đã triển khai |
| Chapter → Activity event | Đã có trong transaction claim |
| Event pipeline từ LMS/Media khác | Cần StoryMee Hub/outbox |

## 9. Chỉ số thành công

- Tỷ lệ trẻ quay lại Storybook sau khi nhận sticker.
- Tỷ lệ nhận Chapter reward và trang bị lên Profile.
- Số workspace được chia sẻ sau phê duyệt.
- Reaction tích cực trên mỗi tác phẩm.
- Tỷ lệ phụ huynh duyệt lời mời/tác phẩm.
- Không có nội dung riêng tư xuất hiện ngoài audience được cấp quyền.

Không tối ưu cho thời gian sử dụng vô hạn hoặc số lượt reaction bằng mọi giá.

## 10. Nguồn mã chính

- `apps/web/src/shared/lib/creation/rewards.ts`
- `apps/web/src/shared/lib/creation/social-rules.ts`
- `apps/web/src/shared/lib/creation/sticker-rules.ts`
- `apps/web/src/features/storybook/`
- `apps/web/src/features/rewards/`
- `apps/web/src/features/profile/`
- `apps/web/src/features/community/`

Contract UI–Hub nằm trong `apps/web/src/shared/lib/api.ts`; backend ownership
thuộc `core-gamification-api`, `core-account-api` và các service StoryMee liên
quan.

Handoff dành cho thiết kế visual, kích thước asset, state và naming convention
nằm trong [STORYBOOK_DESIGN_ELEMENTS.md](./STORYBOOK_DESIGN_ELEMENTS.md).
