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
- **光影集**：照片/影像瀑布流相册（灯箱预览、分类筛选），内容登记在 `gallery.json`
- **留言墙 / 友链 / 致谢 / 关于**
- 暗夜模式、阅读进度条、读到底彩蛋、迷你音乐播放器、太空 404 页

## 发布新文章

1. 在 `posts/` 下新建文章 HTML（可参考现有文章）
2. 在 `posts.json` 里追加一条记录（标题、日期、摘要、路径、主题色、标签）
3. 书架、博客列表、归档会自动更新

## 收录新照片

1. 把照片丢进 `images/gallery/`（影像丢进 `assets/videos/`）
2. 在 `gallery.json` 里追加一条记录（标题、路径、日期、分类、一句话注释）

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
