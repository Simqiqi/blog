/**
 * 柒柒的博客 - 光影集
 * 功能：从 gallery.json 渲染瀑布流、分类筛选、灯箱预览（支持图片与视频、键盘操作）
 */
(function gallery() {
  const grid = document.getElementById('galleryGrid');
  if (!grid) return;

  const filterEl = document.getElementById('galleryFilter');
  const emptyEl = document.getElementById('galleryEmpty');

  // 灯箱元素
  const lb = document.getElementById('gLightbox');
  const lbImg = document.getElementById('gLbImg');
  const lbVideo = document.getElementById('gLbVideo');
  const lbTitle = document.getElementById('gLbTitle');
  const lbMeta = document.getElementById('gLbMeta');
  const lbNote = document.getElementById('gLbNote');
  const lbCounter = document.getElementById('gLbCounter');

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g,
    c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  let items = [];
  let visible = [];   // 当前筛选下可见的作品（灯箱按此顺序浏览）
  let current = 0;

  /* ---------- 筛选 ---------- */
  function renderFilter() {
    if (!filterEl) return;
    const count = {};
    items.forEach(it => { count[it.category] = (count[it.category] || 0) + 1; });
    const cats = Object.keys(count);

    filterEl.innerHTML =
      `<button class="filter-chip active" data-cat="全部"><i class="fa-solid fa-images"></i>全部 ${items.length}</button>` +
      cats.map(c => `<button class="filter-chip" data-cat="${esc(c)}"><i class="fa-solid fa-tag"></i>${esc(c)} ${count[c]}</button>`).join('');

    filterEl.addEventListener('click', e => {
      const chip = e.target.closest('.filter-chip');
      if (!chip) return;
      applyFilter(chip.dataset.cat);
    });
  }

  function applyFilter(cat) {
    filterEl.querySelectorAll('.filter-chip').forEach(c =>
      c.classList.toggle('active', c.dataset.cat === cat));

    visible = cat === '全部' ? items.slice() : items.filter(it => it.category === cat);
    grid.querySelectorAll('.g-card').forEach(card => {
      const it = items[+card.dataset.index];
      card.hidden = cat !== '全部' && it.category !== cat;
    });
    if (emptyEl) emptyEl.hidden = visible.length > 0;
  }

  /* ---------- 瀑布流 ---------- */
  function renderGrid() {
    grid.innerHTML = items.map((it, i) => {
      const webp = it.type !== 'video' ? it.src.replace(/\.(jpe?g|png)$/i, '.webp') : '';
      return `
      <figure class="g-card" data-index="${i}" tabindex="0" role="button" aria-label="查看 ${esc(it.title)}">
        ${it.type === 'video'
          ? `<video src="${esc(it.src)}" muted playsinline preload="metadata"></video>
             <span class="g-badge"><i class="fa-solid fa-play"></i> 影像</span>`
          : `<picture>
               <source srcset="${esc(webp)}" type="image/webp">
               <img src="${esc(it.src)}" alt="${esc(it.title)}" loading="lazy" class="g-blur-load">
             </picture>`}
        <figcaption class="g-card-cap">
          <span class="g-card-title">${esc(it.title)}</span>
          <span class="g-card-meta">${esc(it.date)} · ${esc(it.category)}</span>
        </figcaption>
      </figure>`;
    }).join('');

    // 模糊占位 → 加载完成后渐变清晰
    grid.querySelectorAll('.g-blur-load').forEach(img => {
      const reveal = () => img.classList.add('loaded');
      if (img.complete && img.naturalWidth > 0) reveal();
      else img.addEventListener('load', reveal, { once: true });
    });

    grid.addEventListener('click', e => {
      const card = e.target.closest('.g-card');
      if (card) openLightbox(+card.dataset.index);
    });
    grid.addEventListener('keydown', e => {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      const card = e.target.closest('.g-card');
      if (card) { e.preventDefault(); openLightbox(+card.dataset.index); }
    });
  }

  /* ---------- 灯箱 ---------- */
  function openLightbox(index) {
    const pos = visible.findIndex(it => items.indexOf(it) === index);
    current = pos >= 0 ? pos : 0;
    showItem();
    lb.classList.add('open');
    lb.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function showItem() {
    const it = visible[current];
    if (!it) return;
    lbImg.hidden = it.type === 'video';
    lbVideo.hidden = it.type !== 'video';

    lbVideo.pause();
    lbVideo.removeAttribute('src');
    lbVideo.load();

    if (it.type === 'video') {
      lbVideo.src = it.src;
    } else {
      // 灯箱同样 webp 优先（浏览器不支持时回退 jpg）
      const webp = it.src.replace(/\.(jpe?g|png)$/i, '.webp');
      lbImg.src = webp;
      lbImg.onerror = () => { lbImg.onerror = null; lbImg.src = it.src; };
      lbImg.alt = it.title;
    }

    lbTitle.textContent = it.title;
    lbMeta.textContent = it.date + ' · ' + it.category;
    lbNote.textContent = it.note || '';
    lbCounter.textContent = (current + 1) + ' / ' + visible.length;
  }

  function closeLightbox() {
    lb.classList.remove('open');
    lb.setAttribute('aria-hidden', 'true');
    lbVideo.pause();
    document.body.style.overflow = '';
  }

  function step(d) {
    if (!visible.length) return;
    current = (current + d + visible.length) % visible.length;
    showItem();
  }

  document.getElementById('gLbClose').addEventListener('click', closeLightbox);
  document.getElementById('gLbPrev').addEventListener('click', e => { e.stopPropagation(); step(-1); });
  document.getElementById('gLbNext').addEventListener('click', e => { e.stopPropagation(); step(1); });
  lb.addEventListener('click', e => { if (e.target === lb) closeLightbox(); });

  document.addEventListener('keydown', e => {
    if (!lb.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') step(-1);
    else if (e.key === 'ArrowRight') step(1);
  });

  /* ---------- 入口 ---------- */
  (async function init() {
    try {
      const resp = await fetch('gallery.json');
      if (resp.ok) items = await resp.json();
    } catch (e) {
      console.warn('无法加载 gallery.json', e);
    }
    if (!Array.isArray(items) || items.length === 0) {
      grid.innerHTML = '<p class="empty-tip"><i class="fa-regular fa-images"></i> 光影集还是空的，快去捕捉第一个瞬间吧~</p>';
      return;
    }
    items.sort((a, b) => (a.date < b.date ? 1 : -1));
    visible = items.slice();

    renderFilter();
    renderGrid();
  })();
})();
