# Reward catalog asset contract

## Deployment ownership

```text
Catalog API and reward ownership: StoryMee backend on Ubuntu
Reward image bytes: storage VPS in Germany
Frontend application: Vercel
```

The Ubuntu backend returns logical IDs. It must not make database inventory
records depend on the German storage domain or physical object paths.

## Reward catalog item

```json
{
  "code": "frame-cloud-summer",
  "kind": "frame",
  "name": "Khung Mây Mùa Hè",
  "assets": {
    "assetId": "frame-cloud-summer",
    "primary": {
      "assetId": "frame-cloud-summer",
      "variant": "primary"
    },
    "thumbnail": {
      "assetId": "frame-cloud-summer",
      "variant": "thumbnail"
    },
    "preview": {
      "assetId": "frame-cloud-summer",
      "variant": "preview"
    }
  }
}
```

`assets.assetId` is a transition-friendly shorthand. New publisher output should
provide explicit `primary`, `thumbnail` and `preview` references.

Allowed variants:

```text
primary
plaque
preview
thumbnail
```

IDs use lowercase kebab-case and are immutable after publication.

## Resolution

```text
explicit logical reference
→ primary logical reference / assetId shorthand
→ không hiển thị ảnh nếu thiếu assetId
```

Không lưu `imageUrl`, `thumbnailUrl`, CDN domain hoặc object path trong catalog,
inventory và equipment. Inventory và equipment chỉ lưu reward `code`.

For the simplest cross-route behavior, keep the primary `assetId` equal to the
reward `code`. Composite variants such as frame plaques use the same asset ID
with a different variant.

Mọi reward `kind: "frame"` phải có cả `primary` và `plaque`. `primary` là vòng
khung avatar; `plaque` là background co giãn bao toàn bộ nhãn cấp độ. Xem
`docs/REWARD_DESIGNER_UPLOAD_GUIDE.md`.
