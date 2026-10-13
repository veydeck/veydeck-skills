#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "pillow>=11,<13",
# ]
# ///

"""规范化并验证 Veydeck 应用或套件 PNG 图标。"""

from __future__ import annotations

import argparse
import re
from pathlib import Path

from PIL import Image

OUTPUT_SIZE = 256
SAFE_MARGIN = 16
ALPHA_THRESHOLD = 8
PREVIEW_SIZES = (64, 40)
FILE_NAME_PATTERN = re.compile(r"^[a-z0-9._-]+\.png$")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="将透明 PNG 规范化为 Veydeck 256x256 RGBA 应用图标。",
    )
    parser.add_argument("source", type=Path, help="透明 PNG 候选稿")
    parser.add_argument("destination", type=Path, help="最终 256x256 PNG 路径")
    parser.add_argument(
        "--preview-dir",
        type=Path,
        help="可选的 64px 和 40px 视觉检查图输出目录",
    )
    return parser.parse_args()


def content_bbox(image: Image.Image) -> tuple[int, int, int, int]:
    alpha = image.getchannel("A")
    mask = alpha.point(lambda value: 255 if value > ALPHA_THRESHOLD else 0)
    bbox = mask.getbbox()
    if bbox is None:
        raise ValueError("图标没有可见内容")
    return bbox


def validate_source(image: Image.Image) -> None:
    if image.width != image.height:
        raise ValueError(f"源图必须是正方形，当前为 {image.width}x{image.height}")
    if image.mode != "RGBA":
        raise ValueError(f"源图必须是 RGBA，当前模式为 {image.mode}")
    alpha = image.getchannel("A")
    minimum, maximum = alpha.getextrema()
    if minimum != 0:
        raise ValueError("源图必须包含完全透明像素")
    if maximum == 0:
        raise ValueError("源图完全透明")


def prepare_icon(source: Image.Image) -> Image.Image:
    bbox = content_bbox(source)
    content = source.crop(bbox)
    available = OUTPUT_SIZE - SAFE_MARGIN * 2
    scale = min(available / content.width, available / content.height)
    size = (
        max(1, round(content.width * scale)),
        max(1, round(content.height * scale)),
    )
    content = content.resize(size, Image.Resampling.LANCZOS)

    output = Image.new("RGBA", (OUTPUT_SIZE, OUTPUT_SIZE), (0, 0, 0, 0))
    position = ((OUTPUT_SIZE - size[0]) // 2, (OUTPUT_SIZE - size[1]) // 2)
    output.alpha_composite(content, position)
    return output


def validate_output(image: Image.Image, destination: Path) -> None:
    if image.size != (OUTPUT_SIZE, OUTPUT_SIZE) or image.mode != "RGBA":
        raise ValueError("输出必须是 256x256 RGBA PNG")
    if not FILE_NAME_PATTERN.fullmatch(destination.name):
        raise ValueError("文件名只能包含小写字母、数字、点、短横线和下划线")

    bbox = content_bbox(image)
    left, top, right, bottom = bbox
    margins = (left, top, OUTPUT_SIZE - right, OUTPUT_SIZE - bottom)
    if min(margins) < SAFE_MARGIN:
        raise ValueError(f"图标安全边距不足 {SAFE_MARGIN}px，当前边距为 {margins}")

    alpha = image.getchannel("A")
    corners = (
        alpha.getpixel((0, 0)),
        alpha.getpixel((OUTPUT_SIZE - 1, 0)),
        alpha.getpixel((0, OUTPUT_SIZE - 1)),
        alpha.getpixel((OUTPUT_SIZE - 1, OUTPUT_SIZE - 1)),
    )
    if any(value != 0 for value in corners):
        raise ValueError("图标四角必须完全透明")


def write_previews(image: Image.Image, destination: Path, preview_dir: Path) -> None:
    preview_dir.mkdir(parents=True, exist_ok=True)
    for size in PREVIEW_SIZES:
        preview = image.resize((size, size), Image.Resampling.LANCZOS)
        preview.save(preview_dir / f"{destination.stem}-{size}.png", optimize=True)


def main() -> None:
    args = parse_args()
    if args.source.suffix.lower() != ".png":
        raise ValueError("源文件必须是 PNG")
    if args.destination.suffix.lower() != ".png":
        raise ValueError("目标文件必须使用 .png 后缀")

    with Image.open(args.source) as opened:
        opened.load()
        source = opened.convert("RGBA") if opened.mode == "RGBA" else opened.copy()

    validate_source(source)
    output = prepare_icon(source)
    validate_output(output, args.destination)

    args.destination.parent.mkdir(parents=True, exist_ok=True)
    output.save(args.destination, optimize=True)
    if args.preview_dir:
        write_previews(output, args.destination, args.preview_dir)

    print(f"已生成 {args.destination}：256x256 RGBA，安全边距 {SAFE_MARGIN}px")


if __name__ == "__main__":
    main()
