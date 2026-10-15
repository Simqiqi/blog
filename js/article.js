/**
 * 柒柒的博客 - 文章阅读页增强
 * 功能：阅读时长/字数统计、h2/h3 自动生成目录（滚动高亮）、
 *       上一篇/下一篇动态导航、相关阅读推荐（按标签匹配）
 * 数据：../posts.json
 */
(function articleEnhance() {
  const article = document.querySelector('.article-page');
  if (!article) return;

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  /* ---------- 阅读时长 / 字数 ---------- */
  (function readingTime() {
    const el = document.getElementById('articleReading');
    const body = article.querySelector('.article-body');
    if (!el || !body) return;
    const text = (body.textContent || '').replace(/\s+/g, '');
    const chars = text.length;
    const minutes = Math.max(1, Math.round(chars / 400)); // 中文约 400 字/分钟
    el.innerHTML = `<i class="fa-regular fa-clock"></i> 约 ${minutes} 分钟读完 · 共 ${chars} 字`;
  })();

  /* ---------- 目录 TOC ---------- */
  (function buildToc() {
    const toc = document.getElementById('articleToc');
    const tocList = document.getElementById('tocList');
    const body = article.querySelector('.article-body');
    if (!toc || !tocList || !body) return;

    const heads = Array.from(body.querySelectorAll('h2, h3'));
    if (heads.length < 2) return;

    heads.forEach((h, i) => {
      h.id = h.id || `sec-${i}`;
      const a = document.createElement('a');
      a.href = `#${h.id}`;
      a.textContent = h.textContent;
      a.className = 'toc-item toc-' + h.tagName.toLowerCase();
      tocList.appendChild(a);
    });
    toc.hidden = false;

    // 点击平滑滚动（留出导航栏高度）
    tocList.addEventListener('click', e => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      const target = document.getElementById(a.getAttribute('href').slice(1));
      if (target) window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - 90, behavior: 'smooth' });
    });

    // 滚动高亮
    const links = tocList.querySelectorAll('a');
    const spy = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + en.target.id));
      });
    }, { rootMargin: '-80px 0px -70% 0px' });
    heads.forEach(h => spy.observe(h));
  })();

  /* ---------- 上下篇 + 相关阅读（需要 posts.json） ---------- */
  (async function navAndRelated() {
    const navEl = document.getElementById('articleNav');
    const relatedBox = document.getElementById('relatedPosts');
    const relatedList = document.getElementById('relatedList');

    let posts = [];
    try {
      const resp = await fetch('../posts.json');
      if (resp.ok) posts = await resp.json();
    } catch (e) {
      console.warn('无法加载 posts.json', e);
    }
    if (!Array.isArray(posts) || posts.length < 2) return;

    posts.sort((a, b) => (a.date < b.date ? 1 : -1)); // 新 → 旧

    // 定位当前文章
    const currentFile = location.pathname.split('/').pop();
    const idx = posts.findIndex(p => (p.url || '').endsWith('/' + currentFile));
    if (idx === -1) return;

    // posts 按新→旧排列：idx-1 是更新的「下一篇」，idx+1 是更旧的「上一篇」
    const newer = posts[idx - 1];
    const older = posts[idx + 1];

    if (navEl) {
      const item = (p, dir) => {
        if (!p) return `<span class="nav-side nav-empty"></span>`;
        const isPrev = dir === 'prev';
        return `
        <a href="${esc((p.url || '').split('/').pop())}" class="nav-${dir}">
          ${isPrev ? '<i class="fa-solid fa-chevron-left nav-icon"></i>' : ''}
          <div class="nav-info">
            <span class="nav-label">${isPrev ? '上一篇' : '下一篇'}</span>
            <span class="nav-title">${esc(p.title)}</span>
          </div>
          ${isPrev ? '' : '<i class="fa-solid fa-chevron-right nav-icon"></i>'}
        </a>`;
      };
      // 上一篇 = 更早发布的（older），下一篇 = 更新的（newer）
      navEl.innerHTML = item(older, 'prev') + item(newer, 'next');
    }

    // 相关阅读：共享标签数排序，取前 3
    if (relatedBox && relatedList) {
      const me = posts[idx];
      const myTags = new Set(me.tags || []);
      const related = posts
        .filter((p, i) => i !== idx)
        .map(p => ({ p, score: (p.tags || []).filter(t => myTags.has(t)).length }))
        .filter(x => x.score > 0)
        .sort((a, b) => b.score - a.score || (a.p.date < b.p.date ? 1 : -1))
        .slice(0, 3)
        .map(x => x.p);

      if (related.length) {
        relatedList.innerHTML = related.map(p => `
          <a href="${esc((p.url || '').split('/').pop())}" class="related-card" style="--post-color:${esc(p.color || '')}">
            <span class="related-card-title">${esc(p.title)}</span>
            <span class="related-card-date">${esc(p.date)}</span>
          </a>`).join('');
        relatedBox.hidden = false;
      }
    }
  })();
})();

/* ===== 以下为文章页强化功能（点赞 / 结构化数据 / 独立评论） ===== */

/* ---------- 点赞 / 喜欢（本地存储，无需后端） ---------- */
(function likePost() {
  var btn = document.getElementById('likeBtn');
  var countEl = document.getElementById('likeCount');
  if (!btn || !countEl) return;
  var article = document.querySelector('.article-page');
  var slug = (article && article.getAttribute('data-slug')) || location.pathname;
  var keyLiked = 'like:' + slug + ':liked';
  var keyCount = 'like:' + slug + ':count';
  var liked = localStorage.getItem(keyLiked) === '1';
  var count = parseInt(localStorage.getItem(keyCount) || '0', 10);

  function render() {
    countEl.textContent = count;
    btn.classList.toggle('liked', liked);
    var span = btn.querySelector('span');
    if (span) span.textContent = liked ? '已喜欢' : '喜欢';
  }
  render();

  btn.addEventListener('click', function () {
    if (liked) { liked = false; count = Math.max(0, count - 1); }
    else { liked = true; count += 1; }
    localStorage.setItem(keyLiked, liked ? '1' : '0');
    localStorage.setItem(keyCount, String(count));
    render();
  });
})();

/* ---------- 文章级结构化数据（JSON-LD） ---------- */
(function articleJsonLd() {
  var article = document.querySelector('.article-page');
  if (!article) return;
  var h1 = document.querySelector('.article-page h1');
  var dateEl = document.querySelector('.article-date');
  var descEl = document.querySelector('meta[name="description"]');
  var data = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': h1 ? h1.textContent.trim() : document.title,
    'datePublished': dateEl ? dateEl.textContent.trim() : '',
    'dateModified': dateEl ? dateEl.textContent.trim() : '',
    'author': { '@type': 'Person', 'name': '柒柒' },
    'description': descEl ? (descEl.getAttribute('content') || '') : '',
    'url': location.href,
    'publisher': { '@type': 'Organization', 'name': '柒柒的个人博客' }
  };
  var s = document.createElement('script');
  s.type = 'application/ld+json';
  s.textContent = JSON.stringify(data);
  document.head.appendChild(s);
})();

/* ---------- 每篇文章独立评论区（复用 GitHub Issues 后端） ---------- */
(function injectComments() {
  var article = document.querySelector('.article-page');
  if (!article) return;
  if (document.querySelector('.comments')) return; // 已存在则不重复

  var slug = (article.getAttribute('data-slug')) ||
             location.pathname.split('/').pop().replace(/\.html$/, '');

  // 文章页可能缺失 comments-server meta，补上（指向 Vercel 后端）
  if (!document.querySelector('meta[name="comments-server"]')) {
    var meta = document.createElement('meta');
    meta.name = 'comments-server';
    meta.content = 'https://simqiqi-blog.vercel.app';
    document.head.appendChild(meta);
  }

  // 评论区容器：插在「相关阅读」之后
  var box = document.createElement('section');
  box.className = 'comments-section';
  box.innerHTML = '<h3 class="comments-title"><i class="fa-regular fa-comments"></i> 这篇文章的留言</h3>' +
                  '<div class="comments" data-page="post:' + slug + '"></div>';
  var related = document.getElementById('relatedPosts');
  if (related && related.parentNode) {
    related.parentNode.insertBefore(box, related.nextSibling);
  } else {
    article.parentNode.insertBefore(box, article.nextSibling);
  }

  // 懒加载评论脚本（文章页默认未引入 comments.js）
  if (!document.querySelector('script[src*="comments.js"]')) {
    var sc = document.createElement('script');
    sc.src = '../js/comments.js';
    document.body.appendChild(sc);
  }
})();
