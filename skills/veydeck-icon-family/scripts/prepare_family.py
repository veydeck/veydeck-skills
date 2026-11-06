#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=11,<13"]
# ///
"""导出透明 PNG 图标家族、原生尺寸预览与可验证归档。"""
import argparse
import hashlib
import io
import json
import re
import zipfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


def digest(data: bytes) -> str:
    """返回内容的 SHA-256。"""
    return hashlib.sha256(data).hexdigest()


def png(image: Image.Image) -> bytes:
    """将图像编码为 PNG，不更改透明通道。"""
    buffer = io.BytesIO()
    image.save(buffer, format="PNG")
    return buffer.getvalue()


def prepare(catalog: Path, output: Path, size: int, content: int) -> None:
    """先完整校验来源与冲突，再写入整套资产；已有同名内容不覆盖。"""
    if not 0 < content < size:
        raise ValueError("主体尺寸必须小于画布尺寸且大于零")
    items = json.loads(catalog.read_text())
    if not isinstance(items, list) or not items:
        raise ValueError("清单必须为非空数组")
    files, ids, records, icons = {}, set(), [], []
    for item in items:
        name = item['id']
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', name) or name in ids:
            raise ValueError(f"重复或不安全的 id：{name}")
        ids.add(name)
        source = Path(item['source'])
        if not source.is_absolute():
            source = catalog.parent / source
        data = source.read_bytes()
        with Image.open(io.BytesIO(data)) as original:
            if original.format != 'PNG' or original.mode != 'RGBA':
                raise ValueError(f"原图必须为 RGBA PNG：{source}")
            alpha = original.getchannel('A')
            if alpha.getextrema() != (0, 255):
                raise ValueError(f"原图缺少完整透明与不透明像素：{source}")
            box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
            icon = original.crop(box)
            icon.thumbnail((content, content), Image.Resampling.LANCZOS)
            canvas = Image.new('RGBA', (size, size))
            canvas.alpha_composite(icon, ((size-icon.width)//2, (size-icon.height)//2))
            if any(canvas.getpixel(point)[3] for point in [(0, 0), (size-1, 0), (0, size-1), (size-1, size-1)]):
                raise ValueError(f"导出四角必须透明：{name}")
        icons.append(canvas)
        files[f'originals/{name}.png'] = data
        files[f'exports/{name}.png'] = png(canvas)
        files[f'prompts/{name}.txt'] = (item['prompt']+'\n').encode()
        for preview_size in (20, 32, 48, 64):
            files[f'previews/{name}-{preview_size}.png'] = png(canvas.resize((preview_size, preview_size), Image.Resampling.LANCZOS))
        records.append({**item, 'status': item.get('status', '待确认'), 'size': [size, size], 'source': str(source.resolve())})
    font = ImageFont.load_default(size=13)
    for theme, bg, fg in [('light', '#f8fafc', '#22324b'), ('dark', '#162033', '#e3ecfa')]:
        sheet = Image.new('RGB', (820, 48+len(items)*76), bg)
        draw = ImageDraw.Draw(sheet)
        draw.text((20, 12), 'Native 20 / 32 / 48 / 64 px', font=font, fill=fg)
        for row, (item, icon) in enumerate(zip(items, icons)):
            y = 48+row*76
            draw.text((20, y+24), item['id'], font=font, fill=fg)
            for col, preview_size in enumerate((20, 32, 48, 64)):
                preview = icon.resize((preview_size, preview_size), Image.Resampling.LANCZOS)
                sheet.paste(preview, (315+col*130-preview_size//2, y+32-preview_size//2), preview)
        files[f'previews/overview-{theme}.png'] = png(sheet)
    files['catalog.json'] = (json.dumps(items, ensure_ascii=False, indent=2)+'\n').encode()
    manifest = {'assetCount': len(items), 'assets': records, 'files': [{'path': path, 'sha256': digest(data)} for path, data in sorted(files.items())]}
    files['manifest.json'] = (json.dumps(manifest, ensure_ascii=False, indent=2)+'\n').encode()
    for name, data in files.items():
        path = output / name
        if path.exists() and path.read_bytes() != data:
            raise FileExistsError(f"拒绝覆盖不同内容：{path}；请使用新版本或输出目录")
    for name, data in files.items():
        path = output / name
        path.parent.mkdir(parents=True, exist_ok=True)
        if not path.exists():
            with path.open('xb') as stream:
                stream.write(data)
    print(f"已校验导出 {len(items)} 个图标：{output}")


def pack(root: Path, target: Path) -> None:
    """验证清单后新增 ZIP，完成 CRC 与逐文件校验并输出包校验值。"""
    if target.exists() or target.with_suffix(target.suffix+'.sha256').exists():
        raise FileExistsError(f"拒绝覆盖已有归档或校验文件：{target}")
    root = root.resolve()
    if target.resolve().is_relative_to(root):
        raise ValueError("归档须位于资料目录之外")
    manifest = json.loads((root/'manifest.json').read_text())
    for item in manifest['files']:
        path = (root/item['path']).resolve()
        if not path.is_relative_to(root) or digest(path.read_bytes()) != item['sha256']:
            raise ValueError(f"清单校验失败：{item['path']}")
    files = sorted(p for p in root.rglob('*') if p.is_file())
    if any(p.is_symlink() for p in root.rglob('*')):
        raise ValueError("归档目录不能包含符号链接")
    payload = {f'{root.name}/{p.relative_to(root).as_posix()}': p.read_bytes() for p in files}
    target.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(target, 'x', zipfile.ZIP_DEFLATED) as archive:
        for name, data in payload.items():
            archive.writestr(name, data)
    with zipfile.ZipFile(target) as archive:
        if archive.testzip() or len(archive.namelist()) != len(payload):
            raise ValueError("ZIP 完整性校验失败")
        for name, data in payload.items():
            if archive.read(name) != data:
                raise ValueError(f"ZIP 内容校验失败：{name}")
    target.with_suffix(target.suffix+'.sha256').write_text(digest(target.read_bytes())+'  '+target.name+'\n')
    print(f"已打包并校验：{target}")


def main() -> None:
    """解析导出或归档模式的参数。"""
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('catalog', type=Path, nargs='?')
    parser.add_argument('output', type=Path, nargs='?')
    parser.add_argument('--size', type=int, default=240)
    parser.add_argument('--content', type=int, default=200)
    parser.add_argument('--pack', type=Path)
    parser.add_argument('--zip', type=Path)
    args = parser.parse_args()
    if args.pack and args.zip and not args.catalog and not args.output:
        pack(args.pack, args.zip)
    elif args.catalog and args.output and not args.pack and not args.zip:
        prepare(args.catalog, args.output, args.size, args.content)
    else:
        parser.error('提供 catalog output，或 --pack 资料目录 --zip 归档路径')


if __name__ == '__main__':
    main()
