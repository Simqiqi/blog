/**
 * 柒柒的博客 - 时间胶囊 · 年度回顾
 * 功能：读取 posts.json 与 gallery.json，按年份切换、按月份
 *       展示写过的文章与拍过的照片，附年度统计
 */
(function timeCapsule() {
  const timelineEl = document.getElementById('reviewTimeline');
  if (!timelineEl) return;

  const switchEl = document.getElementById('yearSwitch');
  const statsEl = document.getElementById('reviewStats');
  const emptyEl = document.getElementById('reviewEmpty');

  const MONTHS = ['一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'];

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let posts = [];
  let photos = [];
  let currentYear = null;

  /* ---------- 渲染 ---------- */
  function render() {
    const yearPosts = posts.filter(p => (p.date || '').startsWith(currentYear));
    const yearPhotos = photos.filter(p => (p.date || '').startsWith(currentYear));

    // 统计
    const tagSet = new Set();
    yearPosts.forEach(p => (p.tags || []).forEach(t => tagSet.add(t)));
    const activeMonths = new Set();
    [...yearPosts, ...yearPhotos].forEach(p => activeMonths.add((p.date || '').slice(0, 7)));

    statsEl.innerHTML = [
      ['fa-feather-pointed', yearPosts.length, '篇文章'],
      ['fa-camera-retro', yearPhotos.length, '张照片'],
      ['fa-tags', tagSet.size, '个标签'],
      ['fa-calendar-check', activeMonths.size, '个月有痕迹']
    ].map(([icon, num, label]) =>
      `<div class="rs-item"><i class="fa-solid ${icon}"></i><b>${num}</b><span>${label}</span></div>`
    ).join('');

    // 按月份归组（倒序）
    const byMonth = {};
    yearPosts.forEach(p => {
      const m = (p.date || '').slice(0, 7);
      (byMonth[m] = byMonth[m] || { posts: [], photos: [] }).posts.push(p);
    });
    yearPhotos.forEach(p => {
      const m = (p.date || '').slice(0, 7);
      (byMonth[m] = byMonth[m] || { posts: [], photos: [] }).photos.push(p);
    });

    const months = Object.keys(byMonth).sort().reverse();
    if (emptyEl) emptyEl.hidden = months.length > 0;

    timelineEl.innerHTML = months.map(m => {
      const g = byMonth[m];
      const monthNum = +m.slice(5, 7);
      const total = g.posts.length + g.photos.length;
      return `
      <section class="review-month">
        <div class="rm-head">
          <span class="rm-name">${MONTHS[monthNum - 1] || m}</span>
          <span class="rm-count">${total} 件小事</span>
        </div>
        <div class="rm-body">
          ${g.posts.map(p => `
          <a class="rm-card rm-post" href="${esc(p.url)}" style="--post-color:${esc(p.color || '')}">
            <span class="rm-kind"><i class="fa-solid fa-pen-nib"></i> 写</span>
            <span class="rm-title">${esc(p.title)}</span>
            <span class="rm-date">${esc((p.date || '').slice(5))}</span>
          </a>`).join('')}
          ${g.photos.map(p => `
          <div class="rm-card rm-photo" data-src="${esc(p.src)}">
            <img src="${esc(p.src)}" alt="${esc(p.title)}" loading="lazy">
            <span class="rm-photo-cap"><i class="fa-solid fa-camera"></i> ${esc(p.title)}</span>
          </div>`).join('')}
        </div>
      </section>`;
    }).join('');

    // 照片点击放大（复用光影集灯箱风格，简单实现）
    timelineEl.querySelectorAll('.rm-photo').forEach(card => {
      card.addEventListener('click', () => {
        const overlay = document.createElement('div');
        overlay.className = 'g-lightbox open';
        overlay.innerHTML = `<button class="g-lb-close" aria-label="关闭">&times;</button>
          <figure class="g-lb-stage"><img class="g-lb-media" src="${card.dataset.src}" alt=""></figure>`;
        overlay.addEventListener('click', e => {
          if (e.target === overlay || e.target.closest('.g-lb-close')) overlay.remove();
        });
        document.body.appendChild(overlay);
      });
    });
  }

  /* ---------- 年份切换 ---------- */
  function renderSwitch(years) {
    switchEl.innerHTML = years.map(y =>
      `<button class="filter-chip year-chip${y === currentYear ? ' active' : ''}" data-year="${y}">${y}</button>`
    ).join('');
    switchEl.addEventListener('click', e => {
      const chip = e.target.closest('.year-chip');
      if (!chip) return;
      currentYear = chip.dataset.year;
      switchEl.querySelectorAll('.year-chip').forEach(c =>
        c.classList.toggle('active', c === chip));
      render();
    });
  }

  /* ---------- 入口 ---------- */
  (async function init() {
    async function load(path) {
      try {
        const r = await fetch(path);
        return r.ok ? await r.json() : [];
      } catch (e) { return []; }
    }
    [posts, photos] = await Promise.all([load('posts.json'), load('gallery.json')]);
    posts = Array.isArray(posts) ? posts : [];
    photos = Array.isArray(photos) ? photos : [];

    const years = new Set();
    [...posts, ...photos].forEach(p => years.add((p.date || '').slice(0, 4)));
    const sorted = [...years].filter(Boolean).sort().reverse();
    if (!sorted.length) return;

    currentYear = sorted[0];
    renderSwitch(sorted);
    render();
  })();
})();
