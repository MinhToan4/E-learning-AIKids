# Architecture — AI Kids Frontend

```text
Browser
  └─ apps/web (React + Vite)
       └─ /api/* → StoryMee Hub :5100
                    ├─ account
                    ├─ lms
                    ├─ billing
                    ├─ notifications
                    ├─ gamification
                    ├─ media
                    └─ jobs/system
```

## Ownership

- `apps/web/src/shared/lib/api.ts` là ranh giới HTTP duy nhất của FE.
- Core services sở hữu auth, RBAC, dữ liệu, validation và business rules.
- FE route guards chỉ điều hướng UX; backend vẫn phải xác thực và phân quyền.
- Firebase SDK chỉ được tải động khi người dùng thực sự dùng Google/Push.
- Helper trong `shared/lib/creation` là logic trình bày thuần client, không phải
  contract dùng chung với backend.

## Runtime

- Route pages được lazy-load trong `App.tsx`.
- Mỗi route chỉ mount màn hình đang hoạt động để effect/listener được cleanup.
- Docker image chỉ build static assets rồi phục vụ bằng nginx.
- Development proxy và nginx đều đi qua StoryMee Hub, không gọi thẳng port của
  microservice.
