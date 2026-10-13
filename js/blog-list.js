/**
 * 柒柒的博客 - 博客列表页
 * 功能：从 posts.json 动态渲染文章列表、标签筛选、年份归档时间线
 */
(function blogList() {
  const listEl = document.getElementById('postList');
  if (!listEl) return;

  const filterEl = document.getElementById('tagFilter');
  const emptyTip = document.getElementById('emptyTip');
  const timelineEl = document.getElementById('archiveTimeline');

  /* ---------- 工具 ---------- */
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const byDateDesc = (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0);

  let activeTag = '全部';
  let allPosts = [];

  /* ---------- 概览统计 ---------- */
  function renderOverview(posts) {
    const tagSet = new Set();
    posts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    const since = posts.length ? posts.reduce((min, p) => (p.date < min ? p.date : min), posts[0].date).slice(0, 4) : '2026';

    const ovPosts = document.getElementById('ovPosts');
    const ovTags = document.getElementById('ovTags');
    const ovSince = document.getElementById('ovSince');
    if (ovPosts) ovPosts.textContent = posts.length;
    if (ovTags) ovTags.textContent = tagSet.size;
    if (ovSince) ovSince.textContent = since;
  }

  /* ---------- 标签筛选栏 ---------- */
  function renderFilter(posts) {
    if (!filterEl) return;
    const tagCount = {};
    posts.forEach(p => (p.tags || []).forEach(t => { tagCount[t] = (tagCount[t] || 0) + 1; }));
    const tags = Object.keys(tagCount).sort((a, b) => tagCount[b] - tagCount[a] || a.localeCompare(b, 'zh'));

    filterEl.innerHTML =
      `<button class="filter-chip active" data-tag="全部"><i class="fa-solid fa-layer-group"></i>全部 ${posts.length}</button>` +
      tags.map(t => `<button class="filter-chip" data-tag="${esc(t)}"><i class="fa-solid fa-tag"></i>${esc(t)} ${tagCount[t]}</button>`).join('');

    filterEl.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      applyFilter(chip.dataset.tag);
    });
  }

  function applyFilter(tag) {
    activeTag = tag;
    filterEl.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.tag === tag));

    let shown = 0;
    listEl.querySelectorAll('.post-card').forEach(card => {
      const tags = (card.dataset.tags || '').split(',').filter(Boolean);
      const match = tag === '全部' || tags.includes(tag);
      card.hidden = !match;
      if (match) shown++;
    });
    if (emptyTip) emptyTip.hidden = shown > 0;

    // 滚回列表顶部，方便浏览筛选结果
    const top = listEl.getBoundingClientRect().top + window.scrollY - 120;
    if (Math.abs(window.scrollY - top) > 200) window.scrollTo({ top, behavior: 'smooth' });
  }

  /* ---------- 文章卡片 ---------- */
  function renderPosts(posts) {
    listEl.innerHTML = posts.map(p => {
      const tags = p.tags || [];
      return `
      <a href="${esc(p.url)}" class="post-card" data-tags="${esc(tags.join(','))}" style="--post-color:${esc(p.color || '')}">
        <div class="post-date">${esc(p.date)}</div>
        <div class="post-title">${esc(p.title)}</div>
        <div class="post-excerpt">${esc(p.excerpt)}</div>
        ${tags.length ? `<div class="post-tags">${tags.map(t =>
          `<span class="post-tag" data-tag="${esc(t)}"># ${esc(t)}</span>`).join('')}</div>` : ''}
      </a>`;
    }).join('');

    // 点击卡片上的小标签 => 直接按该标签筛选（不跳转）
    listEl.addEventListener('click', e => {
      const tag = e.target.closest('.post-tag');
      if (!tag) return;
      e.preventDefault();
      e.stopPropagation();
      applyFilter(tag.dataset.tag);
    });
  }

  /* ---------- 归档时间线 ---------- */
  function renderArchive(posts) {
    if (!timelineEl) return;
    const years = {};
    posts.forEach(p => {
      const y = (p.date || '').slice(0, 4) || '未知';
      (years[y] = years[y] || []).push(p);
    });

    timelineEl.innerHTML = Object.keys(years).sort((a, b) => b.localeCompare(a)).map(y => `
      <div class="archive-year">
        <div class="year-node">
          <span class="year-num">${esc(y)}</span>
          <span class="year-count">${years[y].length} 篇</span>
        </div>
        <div class="year-items">
          ${years[y].map(p => `
          <a class="archive-item" href="${esc(p.url)}">
            <span class="ai-date">${esc((p.date || '').slice(5))}</span>
            <span class="ai-title">${esc(p.title)}</span>
            ${(p.tags || []).length ? `<span class="ai-tags">${p.tags.map(t => '#' + esc(t)).join(' ')}</span>` : ''}
          </a>`).join('')}
        </div>
      </div>`).join('');
  }

  /* ---------- 入口 ---------- */
  (async function init() {
    let posts = [];
    try {
      const resp = await fetch('posts.json');
      if (resp.ok) posts = await resp.json();
    } catch (e) {
      console.warn('无法加载 posts.json', e);
    }
    if (!Array.isArray(posts) || posts.length === 0) {
      listEl.innerHTML = '<p class="empty-tip"><i class="fa-regular fa-folder-open"></i> 还没有文章，快去写一篇吧~</p>';
      return;
    }
    allPosts = posts.slice().sort(byDateDesc);

    renderOverview(allPosts);
    renderFilter(allPosts);
    renderPosts(allPosts);
    renderArchive(allPosts);
  })();
})();
