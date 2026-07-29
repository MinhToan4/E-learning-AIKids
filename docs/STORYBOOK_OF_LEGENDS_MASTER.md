# Storybook of Legends — Product Master

> Cập nhật: 29/07/2026
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

## 4. Mô hình tiến bộ

Ba hệ giá trị phải tách biệt:

| Hệ | Nguồn | Ý nghĩa |
|---|---|---|
| XP khám phá | Tất cả app, game, event, học tập | Cấp độ toàn hệ sinh thái |
| Tiến bộ học tập | Bài học, khóa học, sao | Năng lực và mức hoàn thành học |
| Storybook | Sticker và Chapter | Dấu mốc câu chuyện, bộ sưu tập và reward |

XP không được dùng thay thế tiến độ học. Storybook có thể nhận trigger từ cả XP, học tập và sáng tạo nhưng phải lưu nguồn event.

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
| Friend code, favorite, request UI | Local prototype |
| Activity feed/reaction | Local prototype |
| Workspace audience controls | Local prototype |
| Reward inventory/Storybook claim trên Fastify API | Đã có server source of truth |
| Đồng bộ Reward Inventory qua StoryMee Hub | Cần gateway/deploy Hub |
| Social Graph trên Fastify API | Đã có invite, duyệt phụ huynh, favorite, block |
| Activity Feed và Reaction trên Fastify API | Đã có audience filter và Paco quota |
| Public Profile projection trên Fastify API | Đã có module/visibility và safe fields |
| Workspace ACL trên Fastify API | Đã có parent approval và revoke tức thời |
| Đồng bộ Social Graph qua StoryMee Hub | Cần gateway/deploy Hub |
| Public Profile xuyên thiết bị | Cần deploy qua StoryMee Hub |
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

- `packages/domain/src/rewards.ts`
- `packages/domain/src/social-rules.ts`
- `packages/domain/src/sticker-rules.ts`
- `apps/web/src/features/storybook/`
- `apps/web/src/features/rewards/`
- `apps/web/src/features/profile/`
- `apps/web/src/features/community/`

Kế hoạch kỹ thuật và API contract nằm trong [STORYBOOK_TECHNICAL_PLAN.md](./STORYBOOK_TECHNICAL_PLAN.md).
