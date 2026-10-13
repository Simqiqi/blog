# 柒柒的个人博客

> 一个不知天高地厚的大学生，记录生活的点滴与胡思乱想。

## 关于我

我叫柒柒，普通大学生一枚。这个博客是我在互联网上的小角落，写些生活随笔、日常感悟。

## 技术栈

这是纯静态页面，极简到没有框架：

- HTML5
- CSS3
- 原生 JavaScript（粒子背景动画）
- GitHub Pages 部署

## 功能速览

- **首页**：粒子背景、打字机、3D 书架、时光隧道、星光签名板
- **博客**：文章列表动态读取 `posts.json`，支持标签筛选与年份归档时间线
- **阅读页**：目录 TOC、阅读时长/字数、动态上下篇、相关阅读推荐
- **光影集**：照片/影像瀑布流相册（灯箱预览、分类筛选、WebP 加速、模糊加载）
- **时间胶囊**：年度回顾页，按月份回看写过的字和拍过的光
- **许愿星空**：每颗星星一句心愿，可以放一颗属于自己的星（存于浏览器）；底部星语墙为全访客共享
- **留言墙**：上方为只读的时光留言，下方共享留言区支持所有访客留言
- **共享留言**：由 [giscus](https://giscus.app/zh-CN) 驱动（GitHub Discussions 当数据库，免服务器），配置在 `js/giscus-embed.js`
- 暗夜模式、阅读进度条、读到底彩蛋、迷你音乐播放器、太空 404 页、不蒜子访客统计
- 页脚「此刻」状态条：城市实时天气（Open-Meteo 免费 API）+ 状态文案，配置在 `js/now.js`
- 全站 SEO/分享卡片（Open Graph + Twitter Card），链接分享自带预览图

## 发布新文章

只需写一篇 Markdown 草稿，其余交给脚本：

```bash
python3 scripts/new-post.py drafts/my-post.md --slug my-post
```

草稿格式（支持 front matter）：

```markdown
---
title: 文章标题
date: 2026-10-13        # 可选，默认今天
color: "#10b981"        # 可选，书架书脊颜色
tags: [随笔, 感悟]       # 可选
excerpt: 一句话摘要      # 可选，默认取第一段
---

正文 Markdown……
```

脚本会自动生成文章页、更新 `posts.json`、重建 `rss.xml`（含上下篇导航与相关阅读），
最后 `git add -A && git commit && git push` 即可上线。

## 收录新照片

1. 把照片丢进 `images/gallery/`（影像丢进 `assets/videos/`）
2. 在 `gallery.json` 里追加一条记录（标题、路径、日期、分类、一句话注释）
3. 可选：运行 `python3 scripts/optimize-images.py` 生成 WebP 副本（需 Pillow，约省 60%~85% 体积；不跑也能正常显示）
4. 删除照片只需删掉对应文件并从 `gallery.json` 移除该条记录

## 匿名留言（Waline）

留言墙与星语墙使用 [Waline](https://waline.js.org/)：访客只需昵称即可留言，无需任何账号。

**首次部署（约 10 分钟，一次性）：**

1. 注册 [LeanCloud 国际版](https://console.leancloud.app/) → 创建应用（开发版免费）
   → 进入 设置 → 应用凭证，记下 `App ID`、`App Key`、`Master Key`
2. 打开 [Vercel 一键部署](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fwalinejs%2Fwaline%2Ftree%2Fmain%2Fexample)，
   环境变量填：`LEAN_ID`=App ID、`LEAN_KEY`=App Key、`LEAN_MASTER_KEY`=Master Key
3. 部署完成得到 `https://xxx.vercel.app` 地址
4. 把该地址填入 `js/waline-embed.js` 顶部的 `CONFIG.serverURL`，提交推送即可

**管理留言**：浏览器打开 `https://xxx.vercel.app/ui` 注册管理员（首个注册者即管理员）。

## 本地预览

```bash
git clone https://github.com/Simqiqi/blog.git
cd blog
# 建议起个本地服务（动态列表依赖 fetch，直接双击打开会拿不到数据）
python3 -m http.server 8000
# 浏览器打开 http://localhost:8000
```

## 链接

- 博客地址：[simqiqi.github.io/blog](https://simqiqi.github.io/blog)
- GitHub：[Simqiqi/blog](https://github.com/Simqiqi/blog)

## License

MIT
