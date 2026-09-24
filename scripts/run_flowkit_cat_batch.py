#!/usr/bin/env python3
"""
FlowKit Cat Batch Matrix Runner (Trạm 1: Mèo Mướp)
Tự động gửi các kịch bản tổ hợp trong batch_cat.json sang Google Flow thông qua FlowKit agent,
tải ảnh đã render, chuyển đổi sang WebP và lưu trực tiếp vào thư mục web assets.

Sử dụng:
    python3 scripts/run_flowkit_cat_batch.py --project-id <FLOW_PROJECT_UUID>
    python3 scripts/run_flowkit_cat_batch.py --dry-run
    python3 scripts/run_flowkit_cat_batch.py --limit 10
    python3 scripts/run_flowkit_cat_batch.py --level cat_level2
"""

import argparse
import asyncio
import json
import os
import subprocess
import sys
import time
from pathlib import Path
import urllib.request

FLOWKIT_BASE_URL = os.getenv("FLOWKIT_BASE_URL", "http://127.0.0.1:8100")
ROOT_DIR = Path(__file__).resolve().parent.parent
BATCH_FILE = ROOT_DIR / "data-export" / "flowkit" / "batches" / "batch_cat.json"
OUTPUT_DIR = ROOT_DIR / "apps/web/public/assets/pregenerated-combos/cat"
PROGRESS_FILE = ROOT_DIR / "data-export" / "flowkit" / "cat_batch_progress.json"
MANIFEST_FILE = ROOT_DIR / "apps/web/src/features/lesson/lib/available-combos-manifest.json"

DEFAULT_REF_IMAGE = Path.home() / ".gemini/antigravity/brain/19bbda0f-5d82-4423-a11e-44e8c5e42c75/.user_uploaded/media_1790052314111.png"


def api_get(endpoint: str, timeout: int = 10) -> dict:
    """Gọi GET request qua curl subprocess."""
    url = f"{FLOWKIT_BASE_URL}{endpoint}"
    cmd = ["curl", "-s", url, "--max-time", str(timeout)]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError(f"GET {url} thất bại: {proc.stderr}")
    return json.loads(proc.stdout)


def api_post(endpoint: str, payload: dict, timeout: int = 120) -> dict:
    """Gọi POST request qua curl subprocess."""
    url = f"{FLOWKIT_BASE_URL}{endpoint}"
    data_str = json.dumps(payload)
    cmd = [
        "curl", "-s", "-X", "POST", url,
        "-H", "Content-Type: application/json",
        "-d", data_str,
        "--max-time", str(timeout),
    ]
    proc = subprocess.run(cmd, capture_output=True, text=True)
    if proc.returncode != 0 or not proc.stdout.strip():
        raise RuntimeError(f"POST {url} thất bại: {proc.stderr}")
    return json.loads(proc.stdout)


def download_file(url: str, dest_path: Path, timeout: int = 60):
    """Tải file ảnh qua curl subprocess."""
    dest_path.parent.mkdir(parents=True, exist_ok=True)
    cmd = ["curl", "-s", url, "-o", str(dest_path), "--max-time", str(timeout)]
    subprocess.run(cmd, check=True)


def check_flowkit_connection(project_id: str | None = None) -> dict:
    """Kiểm tra trạng thái kết nối của FlowKit Agent & Extension."""
    try:
        data = api_get("/api/flow/status", timeout=5)
        return data
    except Exception as e:
        print(f"❌ Không thể kết nối tới FlowKit tại {FLOWKIT_BASE_URL}: {e}")
        print("👉 Vui lòng đảm bảo FlowKit agent đang chạy:")
        print("   cd tools/flowkit && ./venv/bin/python -m agent.main")
        sys.exit(1)


def upload_reference_image(image_path: Path, project_id: str) -> str | None:
    """Upload ảnh mẫu đất nặn làm character reference anchor cho Google Flow."""
    if not image_path.exists():
        print(f"⚠️ Không tìm thấy ảnh reference tại {image_path}, bỏ qua reference upload.")
        return None

    payload = {
        "file_path": str(image_path.resolve()),
        "project_id": project_id,
        "file_name": image_path.name,
    }
    try:
        result = api_post("/api/flow/upload-image", payload, timeout=60)
        media_id = result.get("media_id") or result.get("data", {}).get("media_id")
        print(f"🎯 Đã upload ảnh reference thành công! Media ID: {media_id}")
        return media_id
    except Exception as e:
        print(f"⚠️ Upload reference image thất bại ({e}), tiếp tục dùng prompt chuẩn text.")
        return None


def convert_to_webp(input_path: Path, output_path: Path, quality: int = 85):
    """Chuyển đổi ảnh sang chuẩn WebP bằng cwebp hoặc sips."""
    output_path.parent.mkdir(parents=True, exist_ok=True)
    cwebp_path = "/opt/homebrew/bin/cwebp"
    if not os.path.exists(cwebp_path):
        cwebp_path = "cwebp"

    try:
        subprocess.run(
            [cwebp_path, "-q", str(quality), str(input_path), "-o", str(output_path)],
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
        )
    except Exception:
        # Fallback qua Python PIL hoặc sips nếu cwebp lỗi
        try:
            from PIL import Image
            img = Image.open(input_path)
            img.save(output_path, "WEBP", quality=quality)
        except Exception as e:
            print(f"⚠️ Lỗi convert WebP cho {output_path.name}: {e}")


def sync_manifest():
    """Đồng bộ hóa danh mục ảnh có sẵn vào available-combos-manifest.json."""
    combos_dir = ROOT_DIR / "apps/web/public/assets/pregenerated-combos"
    manifest = {}
    if combos_dir.exists():
        for p in combos_dir.rglob("*.webp"):
            id_key = p.stem
            rel_path = p.relative_to(ROOT_DIR / "apps/web/public")
            manifest[id_key] = f"/{str(rel_path).replace(chr(92), '/')}"

    with open(MANIFEST_FILE, "w", encoding="utf-8") as f:
        json.dump(manifest, f, indent=2, ensure_ascii=False)
    print(f"🔄 Đã sync {len(manifest)} ảnh vào {MANIFEST_FILE.name}")


def main():
    parser = argparse.ArgumentParser(description="Chạy tự động batch 156 ảnh Trạm 1 Mèo Mướp qua FlowKit")
    parser.add_argument("--project-id", help="UUID của Project trên flow.google.com", default=os.getenv("FLOW_PROJECT_ID"))
    parser.add_argument("--model", help="Flow Image Model", default="GEM_PIX_2")
    parser.add_argument("--ref-media-id", help="Media ID của ảnh reference trên Flow")
    parser.add_argument("--dry-run", action="store_true", help="Chỉ quét danh sách cần làm, không gọi API")
    parser.add_argument("--use-ref", action="store_true", help="Upload và đính kèm ảnh reference vào request")
    parser.add_argument("--limit", type=int, default=0, help="Giới hạn số ảnh cần sinh trong đợt này")
    parser.add_argument("--level", help="Lọc theo level (cat_level1, cat_level2, cat_level3, cat_level4)")
    parser.add_argument("--overwrite", action="store_true", help="Ghi đè lại ảnh cũ kể cả khi file đã tồn tại")
    parser.add_argument("--delay", type=float, default=3.0, help="Số giây nghỉ giữa mỗi request (mặc định 3s)")

    args = parser.parse_args()

    if not BATCH_FILE.exists():
        print(f"❌ Không tìm thấy file batch tại: {BATCH_FILE}")
        sys.exit(1)

    with open(BATCH_FILE, "r", encoding="utf-8") as f:
        all_jobs = json.load(f)

    # Lọc theo level nếu có
    if args.level:
        all_jobs = [j for j in all_jobs if j.get("batchName") == args.level]

    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Kiểm tra những ảnh đã có sẵn trong folder
    pending_jobs = []
    already_done = 0
    for job in all_jobs:
        target_path = OUTPUT_DIR / job["targetFilename"]
        if target_path.exists() and not args.overwrite:
            already_done += 1
        else:
            pending_jobs.append(job)

    print("=" * 65)
    print("🐱 FLOWKIT BATCH RUNNER - TRẠM 1: MÈO MƯỚP")
    print("=" * 65)
    print(f"📊 Tổng số tổ hợp trong batch: {len(all_jobs)}")
    print(f"✅ Đã có sẵn trên ổ đĩa:      {already_done}")
    print(f"⏳ Cần sinh tiếp:              {len(pending_jobs)}")
    print("=" * 65)

    if args.limit > 0:
        pending_jobs = pending_jobs[:args.limit]
        print(f"⚠️ Giới hạn đợt này: {len(pending_jobs)} ảnh")

    if args.dry_run:
        print("\n📋 DANH SÁCH CÁC ẢNH SẼ ĐƯỢC SINH:")
        for idx, job in enumerate(pending_jobs, 1):
            print(f" {idx:3d}. [{job['batchName']}] {job['id']}")
            print(f"      Prompt: {job['promptEn'][:90]}...")
        return

    if not pending_jobs:
        print("🎉 Toàn bộ ảnh của Trạm 1 Mèo Mướp đã được sinh đầy đủ 100%!")
        sync_manifest()
        return

    # Kiểm tra kết nối FlowKit
    status = check_flowkit_connection(args.project_id)
    if not status.get("connected"):
        print("❌ FlowKit Chrome Extension chưa kết nối!")
        print("👉 Hướng dẫn khắc phục:")
        print("   1. Mở Chrome, vào chrome://extensions -> Bật Developer Mode -> Load Unpacked -> thư mục tools/flowkit/extension")
        print("   2. Mở tab https://flow.google.com/ và đăng nhập Google Flow")
        print("   3. Đảm bảo FlowKit Extension hiển thị trạng thái 'Connected'")
        sys.exit(1)

    project_id = args.project_id or status.get("flow_project_id")
    if not project_id:
        print("❌ Thiếu Project ID! Hãy tạo 1 project trên flow.google.com và truyền:")
        print("   python3 scripts/run_flowkit_cat_batch.py --project-id <UUID>")
        sys.exit(1)

    ref_media_id = args.ref_media_id
    if args.use_ref and not ref_media_id and DEFAULT_REF_IMAGE.exists():
        print(f"📤 Đang tự động upload ảnh reference: {DEFAULT_REF_IMAGE.name}...")
        ref_media_id = upload_reference_image(DEFAULT_REF_IMAGE, project_id)

    # Chạy lần lượt từng tổ hợp
    print(f"\n🚀 Bắt đầu sinh {len(pending_jobs)} ảnh qua Google Flow...")
    success_count = 0
    temp_dir = ROOT_DIR / "tmp" / "flowkit_downloads"
    temp_dir.mkdir(parents=True, exist_ok=True)

    for idx, job in enumerate(pending_jobs, 1):
        combo_id = job["id"]
        prompt = job["promptEn"]
        target_filename = job["targetFilename"]
        final_webp_path = OUTPUT_DIR / target_filename

        print(f"\n[{idx}/{len(pending_jobs)}] Đang sinh: {combo_id}")
        print(f"   Prompt: {prompt[:80]}...")

        payload = {
            "prompt": prompt,
            "project_id": project_id,
            "aspect_ratio": "IMAGE_ASPECT_RATIO_LANDSCAPE_FOUR_THREE",
            "image_model": args.model,
            "count": 1,
        }
        if ref_media_id:
            payload["character_media_ids"] = [ref_media_id]

        try:
            resp_data = api_post("/api/flow/generate-image", payload, timeout=120)

            # FlowKit response trả về media record chứa fifeUrl
            image_url = None
            if isinstance(resp_data, dict):
                media = resp_data.get("media", [])
                if media and isinstance(media[0], dict):
                    gen_img = media[0].get("image", {}).get("generatedImage", {})
                    image_url = gen_img.get("fifeUrl") or media[0].get("url")
                elif resp_data.get("images") and isinstance(resp_data["images"], list):
                    image_url = resp_data["images"][0].get("url") or resp_data["images"][0].get("fifeUrl")
                elif resp_data.get("url"):
                    image_url = resp_data["url"]

            if not image_url:
                print(f"   ⚠️ Không lấy được URL ảnh từ phản hồi: {resp_data}")
                continue

            # Tải ảnh về temp
            temp_img_path = temp_dir / f"{combo_id}.jpg"
            download_file(image_url, temp_img_path, timeout=60)

            # Chuyển đổi sang WebP lưu vào web assets
            convert_to_webp(temp_img_path, final_webp_path, quality=85)
            temp_img_path.unlink(missing_ok=True)

            print(f"   ✨ Đã lưu WebP: {target_filename} ({final_webp_path.stat().st_size // 1024} KB)")
            success_count += 1

            # Tự động đồng bộ manifest ngay lập tức
            sync_manifest()

        except Exception as e:
            print(f"   ❌ Lỗi khi sinh {combo_id}: {e}")

        # Nghỉ giữa các request
        if idx < len(pending_jobs):
            time.sleep(args.delay)

    print("\n" + "=" * 65)
    print(f"🎉 HOÀN TẤT ĐỢT BATCH! Thành công: {success_count}/{len(pending_jobs)} ảnh.")
    print("=" * 65)
    sync_manifest()


if __name__ == "__main__":
    main()
