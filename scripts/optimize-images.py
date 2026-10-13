#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
柒柒的博客 · 图片优化脚本
========================

为 images/gallery/ 下所有 jpg/png 生成同名 .webp 副本（约省 60%~85% 体积）。
gallery.js 会自动优先加载 .webp，老浏览器回退原图。

用法:
    python3 scripts/optimize-images.py

依赖: Pillow（pip install pillow）
"""

from pathlib import Path
from PIL import Image

GALLERY = Path(__file__).resolve().parent.parent / "images" / "gallery"


def main():
    count = 0
    for src in sorted(list(GALLERY.glob("*.jpg")) + list(GALLERY.glob("*.png"))):
        webp = src.with_suffix(".webp")
        if webp.exists() and webp.stat().st_mtime >= src.stat().st_mtime:
            continue  # 已是最新
        img = Image.open(src).convert("RGB")
        img.save(webp, "WEBP", quality=82, method=6)
        saved = 100 - webp.stat().st_size * 100 // max(src.stat().st_size, 1)
        print(f"✅ {src.name} -> {webp.name}（省 {saved}%）")
        count += 1
    if not count:
        print("所有图片的 WebP 副本都是最新的，无需处理。")


if __name__ == "__main__":
    main()
