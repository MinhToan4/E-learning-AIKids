#!/usr/bin/env python3
"""Build the AI Kids Achievement V2 catalog artwork from reviewed ImageGen atlases."""

from __future__ import annotations

import json
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[3]
SOURCE = ROOT / "tmp/imagegen/achievement-v2/alpha"
OUTPUT = ROOT / "apps/web/public/assets/designer/achievements/v2"
CATALOG = ROOT / "docs/achievement-catalog-v2.generated.json"
ASSET_MAP = ROOT / "apps/web/src/features/achievements/achievement-v2-assets.generated.ts"

TIERS = [
    ("seed", "Mầm xanh"),
    ("bronze", "Đồng hành"),
    ("silver", "Bạc sáng"),
    ("gold", "Vàng rực"),
    ("crystal", "Pha lê"),
    ("cosmic", "Vũ trụ"),
    ("legendary", "Huyền thoại"),
]

# key, Vietnamese title, metric, thresholds
GROUPS = {
    "discovery": [
        ("app-first-steps", "Bước đầu khám phá", "experience.onboarding_steps", [1, 3, 5]),
        ("profile-builder", "Hồ sơ của riêng con", "profile.completed_parts", [1, 2, 3]),
        ("feature-explorer", "Nhà khám phá AI Kids", "experience.features_discovered", [2, 4, 6, 8]),
        ("world-regions", "Người mở bản đồ", "learning.regions_unlocked", [1, 3, 5, 8, 12]),
        ("storybook-explorer", "Bạn của Storybook", "storybook.chapters_read", [1, 3, 6, 12, 24]),
        ("backpack-collector", "Nhà sưu tập ba lô", "inventory.unique_items", [1, 5, 12, 25, 50]),
        ("style-explorer", "Nhà tạo phong cách", "inventory.styles_equipped", [1, 3, 6, 10]),
    ],
    "learning": [
        ("lessons", "Hành trình bài học", "learning.lessons_completed", [1, 10, 30, 75, 150, 300]),
        ("courses", "Chinh phục khóa học", "learning.courses_completed", [1, 3, 5, 8, 12, 20]),
        ("practice-rounds", "Bậc thầy luyện tập", "learning.practice_rounds_completed", [3, 10, 30, 75, 150]),
        ("knowledge-checks", "Người kiểm chứng kiến thức", "learning.checks_completed", [1, 5, 15, 40, 100]),
        ("perfect-lessons", "Bài học hoàn hảo", "learning.perfect_lessons", [1, 5, 15, 30, 75]),
        ("mistakes-fixed", "Thợ sửa lỗi tài ba", "learning.mistakes_fixed", [1, 10, 30, 75, 150]),
        ("review-master", "Người giữ trí nhớ", "learning.review_sessions_completed", [1, 5, 15, 40, 80]),
        ("skill-variety", "Nhà sưu tập kỹ năng", "learning.skill_groups_completed", [2, 4, 6, 8, 10]),
        ("independent-solve", "Tự mình giải được", "learning.independent_challenges", [1, 5, 15, 40, 100]),
        ("smart-hints", "Dùng gợi ý thông minh", "learning.successful_hint_uses", [1, 5, 15, 30, 60]),
        ("improvement", "Mỗi lần một tiến bộ", "learning.improved_attempts", [1, 3, 10, 25, 50]),
    ],
    "challenge": [
        ("quests", "Nhà chinh phục nhiệm vụ", "quests.completed", [1, 5, 15, 40, 100, 200]),
        ("daily-missions", "Nhiệm vụ hôm nay", "missions.daily_completed", [1, 5, 15, 30, 60]),
        ("weekly-goals", "Người giữ mục tiêu tuần", "goals.weekly_completed", [1, 3, 8, 16, 32]),
        ("challenge-variety", "Bộ sưu tập thử thách", "challenges.types_completed", [2, 4, 6, 8, 10]),
        ("event-journeys", "Nhà du hành sự kiện", "events.journeys_completed", [1, 2, 4, 8, 12]),
        ("boss-challenges", "Người vượt đỉnh", "challenges.boss_completed", [1, 3, 8, 20, 40]),
    ],
    "creative": [
        ("creative-projects", "Nhà sáng tạo nhỏ", "creative.projects_completed", [1, 5, 12, 30, 60, 120]),
        ("project-iterations", "Tác phẩm ngày một hay", "creative.project_iterations", [1, 5, 15, 40, 100]),
        ("creative-tools", "Hộp công cụ sáng tạo", "creative.tools_used", [2, 4, 6, 8, 10]),
        ("ai-tools", "Bạn đồng hành cùng AI", "creative.ai_activities_completed", [1, 5, 15, 40, 100]),
        ("prompt-refinement", "Người luyện ý tưởng", "creative.prompts_refined", [1, 3, 10, 25, 60]),
        ("story-creator", "Người kể chuyện", "creative.stories_completed", [1, 3, 8, 20, 50]),
        ("image-creator", "Họa sĩ hình ảnh", "creative.images_completed", [1, 5, 15, 40, 80]),
        ("code-creator", "Kiến trúc sư code", "creative.code_activities_completed", [1, 5, 15, 40, 100]),
        ("portfolio-ready", "Sẵn sàng khoe với gia đình", "portfolio.projects_submitted", [1, 3, 10, 25, 50]),
        ("portfolio-approved", "Tác phẩm được ghi nhận", "portfolio.projects_approved", [1, 3, 10, 25, 50]),
    ],
    "habit": [
        ("active-days", "Ngày học có ý nghĩa", "habit.active_learning_days", [1, 3, 7, 14, 30, 60, 120]),
        ("streak", "Ngọn lửa bền bỉ", "habit.learning_streak", [3, 7, 14, 30, 60, 100, 180]),
        ("comeback", "Trở lại thật tuyệt", "habit.successful_comebacks", [1, 3, 5, 10]),
        ("balanced-week", "Tuần học cân bằng", "habit.balanced_weeks", [1, 3, 8, 16, 32]),
        ("goal-keeper", "Người giữ lời với mục tiêu", "goals.personal_completed", [1, 5, 15, 30, 60]),
        ("healthy-session", "Phiên học khỏe khoắn", "habit.healthy_sessions", [3, 10, 30, 75]),
    ],
    "social": [
        ("collaboration", "Cùng nhau làm được", "social.collaborations_approved", [1, 3, 10, 25, 50]),
        ("helpful-feedback", "Lời góp ý tử tế", "social.feedback_approved", [1, 3, 10, 25, 50]),
        ("feedback-applied", "Biết lắng nghe và cải thiện", "social.feedback_applied", [1, 3, 10, 25, 50]),
        ("reflection", "Gương soi học tập", "learning.reflections_completed", [1, 5, 15, 40, 80]),
        ("safety-skills", "Người bảo vệ thế giới số", "safety.scenarios_completed", [1, 3, 8, 20, 40]),
        ("kind-actions", "Hành động ấm áp", "social.kind_actions_approved", [1, 5, 15, 40, 80]),
    ],
    "records": [
        ("stars", "Bầu trời sao", "economy.stars_earned", [10, 30, 75, 150, 300, 600]),
        ("xp", "Tinh thể kinh nghiệm", "economy.xp_earned", [500, 1500, 4000, 10000, 25000, 50000]),
        ("level", "Đỉnh cao mới", "profile.level", [5, 10, 20, 35, 50, 75, 100]),
        ("best-score", "Vượt qua chính mình", "records.personal_bests", [1, 3, 10, 25, 50]),
        ("perfect-streak", "Chuỗi hoàn thành xuất sắc", "records.perfect_activity_streak", [2, 5, 10, 20, 40]),
    ],
}

GRIDS = {
    "discovery": (7, 1),
    "learning": (6, 2),
    "challenge": (6, 1),
    "creative": (5, 2),
    "habit": (6, 1),
    "social": (6, 1),
    "records": (5, 1),
}


def trim(image: Image.Image, padding: int = 8) -> Image.Image:
    alpha = image.getchannel("A")
    bbox = alpha.getbbox()
    if not bbox:
        raise RuntimeError("Atlas cell has no visible pixels")
    left, top, right, bottom = bbox
    return image.crop((max(0, left - padding), max(0, top - padding), min(image.width, right + padding), min(image.height, bottom + padding)))


def clean_key_fringe(image: Image.Image) -> Image.Image:
    pixels = image.load()
    for y in range(image.height):
        for x in range(image.width):
            red, green, blue, alpha = pixels[x, y]
            distance = (red - 245) ** 2 + (green - 5) ** 2 + (blue - 243) ** 2
            if alpha and distance < 65 ** 2:
                pixels[x, y] = (red, green, blue, 0)
    return image


def contain(image: Image.Image, size: int, max_subject: int) -> Image.Image:
    image = image.copy()
    image.thumbnail((max_subject, max_subject), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    canvas.alpha_composite(image, ((size - image.width) // 2, (size - image.height) // 2))
    return canvas


def projection_runs(image: Image.Image, expected: int) -> list[tuple[int, int]]:
    alpha = image.getchannel("A")
    occupied = []
    for x in range(image.width):
        column = alpha.crop((x, 0, x + 1, image.height))
        occupied.append(column.getbbox() is not None)

    runs = []
    start = None
    for x, value in enumerate(occupied + [False]):
        if value and start is None:
            start = x
        elif not value and start is not None:
            runs.append((start, x))
            start = None

    # Detached rays/leaves can create tiny runs. Merge the closest pair until
    # the requested atlas object count is reached.
    while len(runs) > expected:
        gaps = [runs[index + 1][0] - runs[index][1] for index in range(len(runs) - 1)]
        merge_at = min(range(len(gaps)), key=gaps.__getitem__)
        runs[merge_at:merge_at + 2] = [(runs[merge_at][0], runs[merge_at + 1][1])]
    return runs


def crop_grid(image: Image.Image, columns: int, rows: int, count: int) -> list[Image.Image]:
    per_row = [columns] * rows
    per_row[-1] = count - columns * (rows - 1)
    cells = []
    cell_h = image.height / rows
    for row, expected in enumerate(per_row):
        top = round(row * cell_h)
        bottom = round((row + 1) * cell_h)
        strip = image.crop((0, top, image.width, bottom))
        runs = projection_runs(strip, expected)
        if len(runs) != expected:
            raise RuntimeError(f"Expected {expected} objects in atlas row, found {len(runs)}")
        for left, right in runs:
            cells.append(trim(strip.crop((max(0, left - 10), 0, min(strip.width, right + 10), strip.height))))
    return cells


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    frames = crop_grid(clean_key_fringe(Image.open(SOURCE / "tiers.png").convert("RGBA")), 7, 1, 7)
    frames = [contain(frame, 512, 474) for frame in frames]

    catalog = {
        "schemaVersion": 2,
        "catalogId": "aikids-achievements-v2",
        "release": "2026.08.0-draft",
        "status": "draft_for_gamification_admin",
        "tierPolicy": [
            {"index": index + 1, "key": key, "label": label}
            for index, (key, label) in enumerate(TIERS)
        ],
        "series": [],
    }

    for group, specs in GROUPS.items():
        columns, rows = GRIDS[group]
        symbols = crop_grid(clean_key_fringe(Image.open(SOURCE / f"{group}.png").convert("RGBA")), columns, rows, len(specs))
        for symbol, (key, title, metric, thresholds) in zip(symbols, specs, strict=True):
            symbol_layer = contain(symbol, 512, 218)
            milestone_rows = []
            series_dir = OUTPUT / key
            series_dir.mkdir(parents=True, exist_ok=True)
            for index, threshold in enumerate(thresholds):
                tier_key, tier_label = TIERS[min(index, len(TIERS) - 1)]
                icon = frames[min(index, len(frames) - 1)].copy()
                icon.alpha_composite(symbol_layer)
                clean_key_fringe(icon)
                filename = f"level-{index + 1}.png"
                icon.save(series_dir / filename, optimize=True)
                milestone_rows.append({
                    "level": index + 1,
                    "tier": tier_key,
                    "threshold": threshold,
                    "label": f"{tier_label} · {title}",
                    "points": (index + 1) * 10,
                    "assetId": f"achievement-{key}-level-{index + 1}",
                    "iconPath": f"/assets/designer/achievements/v2/{key}/{filename}",
                })
            catalog["series"].append({
                "key": f"achievement.{key}",
                "seriesKey": key,
                "category": group,
                "title": title,
                "description": f"Tiến hoá huy hiệu {title} qua các hoạt động có ý nghĩa.",
                "metric": metric,
                "aggregation": "lifetime",
                "hidden": False,
                "milestones": milestone_rows,
            })

    CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    series_keys = [series["seriesKey"] for series in catalog["series"]]
    ASSET_MAP.write_text(
        "// Generated by apps/web/scripts/build-achievement-v2-assets.py\n"
        "const achievementV2Series = new Set([\n"
        + "".join(f"  {json.dumps(key)},\n" for key in series_keys)
        + "])\n\n"
        + "export function achievementV2AssetPath(assetId?: string): string | undefined {\n"
        + "  const match = assetId?.match(/^achievement-([a-z0-9-]+)-level-([1-7])$/)\n"
        + "  if (!match || !achievementV2Series.has(match[1])) return undefined\n"
        + "  return `/assets/designer/achievements/v2/${match[1]}/level-${match[2]}.png`\n"
        + "}\n",
        encoding="utf-8",
    )
    total_icons = sum(len(series[3]) for specs in GROUPS.values() for series in specs)
    print(f"Built {len(catalog['series'])} series and {total_icons} milestone icons")
    print(CATALOG)
    print(ASSET_MAP)
    print(OUTPUT)


if __name__ == "__main__":
    main()
