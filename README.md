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
- **我的作品**：作品集页面（`works.html`），读取 `works.json` 渲染卡片，支持分类筛选、关键词搜索、一键复制链接；`works.html?edit=1` 可可视化录入并导出 JSON
- **阅读页**：目录 TOC、阅读时长/字数、动态上下篇、相关阅读推荐
- **光影集**：照片/影像瀑布流相册（灯箱预览、分类筛选、WebP 加速、模糊加载）
- **时间胶囊**：年度回顾页，按月份回看写过的字和拍过的光
- **许愿星空**：每颗星星一句心愿，可以放一颗属于自己的星（存于浏览器）；底部星语墙为全访客共享
- **留言墙**：上方为只读的时光留言，下方共享留言区支持所有访客留言
- **共享留言**：由 [giscus](https://giscus.app/zh-CN) 驱动（GitHub Discussions 当数据库，免服务器），配置在 `js/giscus-embed.js`
- 暗夜模式、阅读进度条、读到底彩蛋、迷你音乐播放器、太空 404 页、不蒜子访客统计
- 页脚「此刻」状态条：按访问者公网 IP 自动定位城市（ipwho.is，备用 ipapi.co）+ Open-Meteo 实时天气，中文城市名由 Open-Meteo 地理编码转换；定位失败只显示状态文案，不会显示错误城市。配置在 `js/now.js`
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

## 新增 / 管理作品

作品页 `works.html` 的数据全部来自根目录的 `works.json`，改数据不用碰 HTML。

**方式一：可视化录入（推荐）**

1. 本地起服务后打开 `works.html?edit=1`，会多出一个编辑面板（访客正常访问看不到）
2. 填表点「加入草稿」，上方卡片即时预览；草稿存在浏览器 localStorage，可删可改
3. 点「复制 works.json」或「下载 works.json」，用导出的内容覆盖根目录的 `works.json`
4. `git add -A && git commit && git push` 上线

初次使用点「载入线上数据」把现有条目拿进草稿，再增删改。

**方式二：直接改 `works.json`**

每条作品是一个对象：

```json
{
  "name": "Echo云音乐",
  "desc": "macOS 上原生的网易云音乐桌面客户端，Go 绘制界面、不用 WebView",
  "url": "https://simqiqiecho.dpdns.org",
  "source": "https://github.com/Simqiqi/simqiqi-music",
  "icon": "fa-solid fa-compact-disc",
  "color": "#ff5a7a",
  "tags": ["Go", "macOS", "桌面客户端"],
  "category": "桌面应用",
  "status": "online",
  "year": "2026",
  "featured": true
}
```

| 字段 | 说明 |
| --- | --- |
| `name` / `desc` | 名称与一句话简介（必填） |
| `url` | 作品网址，可省略 `https://`（必填） |
| `source` | 源码地址，可选，填了卡片右下角出现 GitHub 按钮 |
| `icon` | Font Awesome 类名，如 `fa-solid fa-rocket`，默认 `fa-solid fa-cube` |
| `color` | 卡片主题色（十六进制），默认青色 `#00e5ff` |
| `tags` | 技术标签数组 |
| `category` | 分类，用于页面顶部筛选栏，会自动去重生成分类按钮 |
| `status` | `online` 在线 / `wip` 开发中 / `archived` 已归档 |
| `year` | 年份，用于卡片编号旁与顶部「最近更新」统计 |
| `featured` | 可选，`true` 时显示「★ 精选」角标 |

页面样式在 `css/works.css`，逻辑在 `js/works.js`，两者都不依赖框架；亮色/暗色主题、移动端布局已适配。

## 匿名留言（免登录）

留言墙与星语墙（`guestbook.html`、`wishes.html`）的留言**不需要任何账号**，
访客填个昵称（可不填，默认「路人」）即可发表。

实现方式：前端 `js/comments.js` + 一个部署在 [Vercel](https://vercel.com) 的
无服务器函数 `api/comments.js`，留言以 Issue 形式存进本仓库
（标签 `comment:<页面>`），站长可在 GitHub → Issues 里直接删广告。

**首次部署（一次性，约 5 分钟）：**

1. 打开 [vercel.com](https://vercel.com) → 点 **Continue with GitHub**，授权登录（无需新密码/绑卡）
2. **Add New → Project** → 导入本仓库 `Simqiqi/blog` → 直接 Deploy（会自动识别 `api/` 函数）
3. 进入项目 **Settings → Environment Variables**，新增：
   - `GH_TOKEN` = 一个具备 `public_repo` 权限的 GitHub Token（在 GitHub → Settings → Developer settings → PAT 生成）
   - `GH_REPO` = `Simqiqi/blog`（默认值，可省略）
   保存后 **Redeploy**
4. 部署完成得到地址，例如 `https://blog-comments-xxx.vercel.app`
5. 把该地址填进 `guestbook.html` 与 `wishes.html` 里的
   `<meta name="comments-server" content="这里">`，提交推送即可生效

**管理留言**：在仓库的 **Issues** 标签页关闭/删除对应 Issue 即可。

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
