#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
柒柒的博客 · 发文章脚本
=======================

用法:
    python3 scripts/new-post.py drafts/my-post.md --slug my-post

草稿格式（Markdown + front matter）:
    ---
    title: 文章标题
    date: 2026-10-13        # 可选，默认今天
    color: "#10b981"        # 可选，书架书脊颜色，默认 #6366f1
    tags: [随笔, 感悟]       # 可选，逗号分隔或 [a, b]
    excerpt: 一句话摘要      # 可选，默认取正文第一段
    ---

    正文 Markdown……

脚本会自动完成:
  1. 生成 posts/<slug>.html（基于 scripts/post-template.html）
  2. 更新 posts.json（按日期倒序）
  3. 重建 rss.xml（包含全部文章）
之后 git add -A && git commit && git push 即可上线。
"""

import json
import re
import sys
from datetime import datetime
from pathlib import Path
from xml.sax.saxutils import escape as xml_escape

ROOT = Path(__file__).resolve().parent.parent
TEMPLATE = ROOT / "scripts" / "post-template.html"
POSTS_JSON = ROOT / "posts.json"
RSS_XML = ROOT / "rss.xml"
SITE_URL = "https://simqiqi.github.io/blog"

# ---------------- Markdown → HTML ----------------

def _inline(text: str) -> str:
    text = re.sub(r"`([^`]+)`", r"<code>\1</code>", text)
    text = re.sub(r"!\[([^\]]*)\]\(([^)]+)\)", r'<img src="\2" alt="\1">', text)
    text = re.sub(r"\[([^\]]+)\]\(([^)]+)\)", r'<a href="\2" target="_blank" rel="noopener">\1</a>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", r"<strong>\1</strong>", text)
    text = re.sub(r"(?<!\*)\*([^*]+)\*(?!\*)", r"<em>\1</em>", text)
    return text


def md_to_html(md: str) -> str:
    lines = md.replace("\r\n", "\n").split("\n")
    out, i = [], 0
    in_code = False
    code_buf: list[str] = []
    list_buf: list[str] = []
    para_buf: list[str] = []

    def flush_para():
        if para_buf:
            out.append("<p>" + _inline(" ".join(para_buf).strip()) + "</p>")
            para_buf.clear()

    def flush_list():
        if list_buf:
            out.append("<ul>" + "".join(f"<li>{_inline(x)}</li>" for x in list_buf) + "</ul>")
            list_buf.clear()

    while i < len(lines):
        line = lines[i]
        stripped = line.strip()

        if stripped.startswith("```"):
            if in_code:
                out.append("<pre><code>" + "\n".join(code_buf) + "</code></pre>")
                code_buf.clear()
                in_code = False
            else:
                flush_para(); flush_list()
                in_code = True
            i += 1
            continue
        if in_code:
            code_buf.append(line.replace("<", "&lt;").replace(">", "&gt;"))
            i += 1
            continue

        m = re.match(r"^(#{2,3})\s+(.*)$", stripped)
        if m:
            flush_para(); flush_list()
            level = len(m.group(1))
            out.append(f"<h{level}>{_inline(m.group(2).strip())}</h{level}>")
            i += 1
            continue

        if stripped.startswith("> "):
            flush_para(); flush_list()
            out.append("<blockquote><p>" + _inline(stripped[2:]) + "</p></blockquote>")
            i += 1
            continue

        if stripped.startswith("- "):
            flush_para()
            list_buf.append(stripped[2:])
            i += 1
            continue

        if stripped in ("---", "***"):
            flush_para(); flush_list()
            out.append("<hr>")
            i += 1
            continue

        if not stripped:
            flush_para(); flush_list()
            i += 1
            continue

        para_buf.append(stripped)
        i += 1

    flush_para(); flush_list()
    return "\n".join(out)


# ---------------- front matter ----------------

def parse_front_matter(text: str):
    meta: dict[str, str] = {}
    body = text
    if text.startswith("---"):
        parts = text.split("---", 2)
        if len(parts) >= 3:
            for line in parts[1].strip().splitlines():
                if ":" in line:
                    k, v = line.split(":", 1)
                    meta[k.strip()] = v.strip().strip('"').strip("'")
            body = parts[2]
    return meta, body.strip()


def parse_tags(raw: str):
    raw = raw.strip().strip("[]")
    return [t.strip().strip('"').strip("'") for t in raw.split(",") if t.strip()]


# ---------------- 站点数据更新 ----------------

def update_posts_json(entry: dict):
    posts = json.loads(POSTS_JSON.read_text(encoding="utf-8"))
    posts = [p for p in posts if p.get("url") != entry["url"]]
    posts.append(entry)
    posts.sort(key=lambda p: p.get("date", ""), reverse=True)
    POSTS_JSON.write_text(json.dumps(posts, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return posts


def rebuild_rss(posts):
    def rfc822(d: str) -> str:
        dt = datetime.strptime(d, "%Y-%m-%d")
        return dt.strftime("%a, %d %b %Y 00:00:00 +0800")

    today = datetime.now().strftime("%a, %d %b %Y 00:00:00 +0800")
    items = "\n".join(f"""  <item>
    <title>{xml_escape(p['title'])}</title>
    <link>{SITE_URL}/{p['url']}</link>
    <guid>{SITE_URL}/{p['url']}</guid>
    <pubDate>{rfc822(p['date'])}</pubDate>
    <description>{xml_escape(p['excerpt'])}</description>
  </item>""" for p in posts[:20])

    RSS_XML.write_text(f"""<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>柒柒的个人博客</title>
  <link>{SITE_URL}/</link>
  <description>一个不知天高地厚的大学生，记录生活的点滴与胡思乱想。探索 AI、独立开发、开源、写作。</description>
  <language>zh-CN</language>
  <lastBuildDate>{today}</lastBuildDate>
  <atom:link href="{SITE_URL}/rss.xml" rel="self" type="application/rss+xml"/>

{items}
</channel>
</rss>
""", encoding="utf-8")


# ---------------- 主流程 ----------------

def main():
    if len(sys.argv) < 2:
        print(__doc__)
        sys.exit(1)

    md_path = Path(sys.argv[1])
    if not md_path.exists():
        print(f"找不到草稿文件: {md_path}")
        sys.exit(1)

    slug = None
    if "--slug" in sys.argv:
        slug = sys.argv[sys.argv.index("--slug") + 1]
    if not slug or not re.fullmatch(r"[a-z0-9-]+", slug):
        print("请提供 --slug（小写字母/数字/连字符），如 --slug my-first-post")
        sys.exit(1)

    meta, body_md = parse_front_matter(md_path.read_text(encoding="utf-8"))

    title = meta.get("title")
    if not title:
        print("front matter 缺少 title")
        sys.exit(1)
    date = meta.get("date") or datetime.now().strftime("%Y-%m-%d")
    color = meta.get("color") or "#6366f1"
    tags = parse_tags(meta.get("tags", ""))
    body_html = md_to_html(body_md)
    excerpt = meta.get("excerpt") or re.sub(r"<[^>]+>", "", body_html.split("\n")[0])[:80]

    out_path = ROOT / "posts" / f"{slug}.html"
    if out_path.exists():
        print(f"posts/{slug}.html 已存在，将覆盖。")

    html = (TEMPLATE.read_text(encoding="utf-8")
            .replace("{{TITLE}}", title)
            .replace("{{DATE}}", date)
            .replace("{{TAGS_TEXT}}", " · ".join(tags) if tags else "随笔")
            .replace("{{SLUG}}", slug)
            .replace("{{BODY}}", body_html))
    out_path.write_text(html, encoding="utf-8")

    entry = {"title": title, "date": date, "excerpt": excerpt,
             "url": f"posts/{slug}.html", "color": color, "tags": tags}
    posts = update_posts_json(entry)
    rebuild_rss(posts)

    print("✅ 完成：")
    print(f"  - 生成 posts/{slug}.html")
    print(f"  - posts.json 已更新（共 {len(posts)} 篇）")
    print("  - rss.xml 已重建")
    print("\n下一步：")
    print("  git add -A && git commit -m 'feat: 新文章《" + title + "》' && git push")


if __name__ == "__main__":
    main()
