# Storybook Social Interaction

> Social design cho trẻ 8–15 tuổi.
>
> Mục tiêu: khuyến khích sáng tạo và ghi nhận tiến bộ trong một vòng tròn có kiểm soát.

## 1. Mô hình vòng tròn an toàn

Mỗi child có ba audience:

| Audience | Thành viên | Người phê duyệt |
|---|---|---|
| Friends | Child đã kết bạn | Phụ huynh hai phía |
| Family | Thành viên Family Space | Chủ Family Space |
| School | Giáo viên, lớp, tổ chức | Nhà trường/giáo viên |

Quyền `profile` và `workspace` được cấu hình độc lập cho từng audience.

## 2. Kết bạn

### Cách tìm và thêm bạn

Không có global search theo tên. Child kết bạn bằng:

1. mã 8 ký tự có hạn sử dụng;
2. QR chứa invite token;
3. gợi ý cùng lớp do School Space cung cấp;
4. link mời do phụ huynh gửi.

### State machine

```text
created
→ recipient_accepted
→ parent_review
→ active

parent_review → declined | expired | blocked
```

Kết nối chỉ xuất hiện trong danh sách bạn bè khi `active`.

### Favorite

- Mỗi child ghim tối đa 6 kết nối.
- Favorite chỉ thay đổi cách hiển thị, không tăng quyền truy cập.
- Bạn được ghim xuất hiện trên Profile card/trang cá nhân nếu module Friends bật.

Web hiện đã có friend code, favorite limit và request UI nhưng đang lưu local.

## 3. Activity feed

Feed không cho child viết status tự do. Activity được tạo từ domain event:

- hoàn thành Chapter;
- mở reward;
- đạt level;
- nhận danh hiệu/huy hiệu;
- hoàn thành khóa/bài học;
- streak;
- tác phẩm được duyệt chia sẻ;
- challenge/remix hoàn thành.

### Payload tối thiểu

```ts
type Activity = {
  id: string
  actorChildId: string
  type: string
  title: string
  summary: string
  coverUrl?: string
  rewardId?: string
  audience: 'friends' | 'family' | 'school'
  createdAt: string
}
```

Không đưa vào payload:

- video Storybook;
- prompt;
- ảnh thật chưa duyệt;
- nội dung workspace riêng tư;
- điểm social thô.

## 4. Reaction

Reaction dựng sẵn:

- Xuất sắc;
- Sáng tạo;
- Nóng bỏng;
- Mình thích;
- Ý tưởng hay;
- Paco Pick.

Quy tắc:

- một reaction/type/user/target;
- có thể đổi hoặc gỡ;
- không dislike;
- Paco Pick tối đa 3 lần mỗi ISO week;
- reaction score chỉ dùng nội bộ cho ranking/trigger.

## 5. Chia sẻ Profile

Child chọn module xuất hiện:

- Storybook;
- tiến độ;
- danh hiệu;
- tác phẩm;
- bạn bè;
- hoạt động.

Visibility của Profile và visibility từng tác phẩm là hai lớp khác nhau. Bật Profile cho Friends không tự động công khai mọi tác phẩm.

## 6. Chia sẻ workspace

Mỗi workspace có ACL theo audience:

```ts
type WorkspaceShare = {
  workspaceId: string
  audiences: Array<'friends' | 'family' | 'school'>
  permission: 'view' | 'remix'
}
```

Quy tắc:

- mặc định private;
- child đề xuất audience;
- nội dung cần consent sẽ chờ phụ huynh;
- video/film Storybook bị loại khỏi lựa chọn;
- thu hồi quyền phải có hiệu lực ngay;
- remix phải giữ `sourceWorkspaceId` và attribution.

Web hiện có UI audience theo từng project/workspace và lọc video bằng loại nội dung; ACL thật cần Hub.

## 7. Storybook social update

Khi hoàn thành Chapter, feed chỉ chia sẻ một milestone card:

```text
Bo hoàn thành “Cánh Cổng Thế Giới AI”
Mở khóa Background Bình Minh Cổng AI
```

Được chia sẻ:

- tên Chapter;
- cover hệ thống;
- reward;
- danh hiệu;
- ngày hoàn thành.

Không được chia sẻ:

- video Chapter;
- toàn bộ nội dung sách;
- prompt hoặc dữ liệu đầu vào;
- ảnh child không có consent.

## 8. Parent và School controls

Parent có thể:

- duyệt/từ chối lời mời;
- chặn child khác;
- tắt Profile public;
- duyệt tác phẩm;
- giới hạn audience;
- xem audit log chia sẻ.

School có thể:

- gợi ý kết nối cùng lớp;
- quản lý Class Space;
- gỡ nội dung khỏi lớp;
- không được tự mở nội dung sang Friends/Public.

## 9. Abuse prevention

- Invite token ngắn hạn, single-use hoặc rate-limited.
- Không trả child directory từ API.
- Rate limit invite, reaction, share và report.
- Block thắng mọi ACL cũ.
- Report giữ bằng chứng tối thiểu, không hiển thị cho child khác.
- Mọi public media phải qua moderation/parent approval.

## 10. Trạng thái

| Tính năng | Web | Hub |
|---|---|---|
| Friend code/QR entry | Có UI | Fastify API đã có; chờ Hub deploy |
| Parent-reviewed request | Có UI | Fastify API đã có duyệt hai phía |
| Favorite tối đa 6 | Có domain rule/UI | Fastify API đã lưu server |
| Block và thu hồi connection | Chưa nối UI đầy đủ | Fastify API đã có |
| Feed/reaction | Có prototype | Chưa có event store |
| Profile visibility | Có local settings | Chưa đồng bộ |
| Workspace audience | Có local settings | Chưa có ACL |
| Approved Media sharing | Có Media Hub flow | Có request/approval cơ bản |

Social Graph đã có source of truth trên Fastify/PostgreSQL nhưng chỉ được xem là
production sau khi migration và route được deploy qua StoryMee Hub.
