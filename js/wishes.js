/**
 * 柒柒的博客 - 许愿星空
 * 每颗星星承载一句心愿。悬停/点击查看，「放一颗星」写下自己的愿望。
 * 心愿保存在浏览器 localStorage（纯前端小仪式），并内置几颗种子星。
 */
(function wishSky() {
  const sky = document.getElementById('wishSky');
  if (!sky) return;

  const canvas = document.getElementById('wishCanvas');
  const ctx = canvas.getContext('2d');
  const bubble = document.getElementById('wishBubble');
  const wbText = document.getElementById('wbText');
  const wbMeta = document.getElementById('wbMeta');
  const modal = document.getElementById('wishModal');

  const STORE_KEY = 'qiqi-wishes';

  // 内置种子心愿
  const SEEDS = [
    { text: '愿每一个熬夜赶 ddl 的夜晚，都有星光作伴。', name: '柒柒', seed: true },
    { text: '希望明年的自己，还在为热爱的事情发光。', name: '柒柒', seed: true },
    { text: '愿路过这里的你，今天也被温柔对待。', name: '', seed: true },
    { text: '想去海边看一次完整的日落。', name: '', seed: true },
    { text: '考试顺利，代码无 bug。', name: '某位同学', seed: true }
  ];

  function loadWishes() {
    let mine = [];
    try { mine = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { /* ignore */ }
    return [...SEEDS, ...mine];
  }

  function saveWish(wish) {
    let mine = [];
    try { mine = JSON.parse(localStorage.getItem(STORE_KEY) || '[]'); } catch (e) { /* ignore */ }
    mine.push(wish);
    try { localStorage.setItem(STORE_KEY, JSON.stringify(mine)); } catch (e) { /* ignore */ }
  }

  /* ---------- 星星 ---------- */
  // 每颗星：x, y（0~1 相对坐标）、闪烁相位、大小、心愿
  let stars = [];
  let bgStars = [];   // 背景装饰小星
  let meteors = [];
  let W = 0, H = 0, dpr = 1;
  let hoverStar = null;

  function makeStar(wish) {
    return {
      x: 0.08 + Math.random() * 0.84,
      y: 0.12 + Math.random() * 0.68,
      r: 1.6 + Math.random() * 1.6,
      phase: Math.random() * Math.PI * 2,
      speed: 0.008 + Math.random() * 0.012,
      hue: 190 + Math.random() * 90,   // 青 → 紫
      wish,
      born: 0
    };
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = sky.clientWidth;
    H = sky.clientHeight;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function initSky() {
    resize();
    stars = loadWishes().map(makeStar);
    bgStars = Array.from({ length: 90 }, () => ({
      x: Math.random(), y: Math.random(),
      r: 0.4 + Math.random() * 0.9,
      phase: Math.random() * Math.PI * 2,
      speed: 0.004 + Math.random() * 0.008
    }));
  }

  function spawnMeteor() {
    meteors.push({
      x: Math.random() * W * 0.7 + W * 0.2,
      y: Math.random() * H * 0.3,
      vx: -(3 + Math.random() * 3),
      vy: 2 + Math.random() * 1.5,
      life: 1
    });
  }

  function draw(t) {
    ctx.clearRect(0, 0, W, H);

    // 背景小星
    for (const s of bgStars) {
      s.phase += s.speed;
      const a = 0.25 + Math.abs(Math.sin(s.phase)) * 0.5;
      ctx.globalAlpha = a;
      ctx.fillStyle = '#cfd8ff';
      ctx.beginPath();
      ctx.arc(s.x * W, s.y * H, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 心愿星
    for (const s of stars) {
      s.phase += s.speed;
      if (s.born > 0) s.born = Math.max(0, s.born - 0.015);
      const glow = 0.55 + Math.sin(s.phase) * 0.35;
      const r = s.r * (1 + s.born * 6);      // 诞生时放大
      const x = s.x * W, y = s.y * H;

      // 光晕
      const g = ctx.createRadialGradient(x, y, 0, x, y, r * 6);
      g.addColorStop(0, `hsla(${s.hue}, 95%, 75%, ${0.5 * glow})`);
      g.addColorStop(1, 'hsla(0, 0%, 100%, 0)');
      ctx.globalAlpha = 1;
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(x, y, r * 6, 0, Math.PI * 2);
      ctx.fill();

      // 星体
      ctx.fillStyle = `hsla(${s.hue}, 100%, ${hoverStar === s ? 92 : 82}%, ${0.7 + glow * 0.3})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();

      // 悬停高亮圈
      if (hoverStar === s) {
        ctx.strokeStyle = `hsla(${s.hue}, 100%, 85%, 0.8)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(x, y, r + 5, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 流星
    if (Math.random() < 0.003 && meteors.length < 2) spawnMeteor();
    for (let i = meteors.length - 1; i >= 0; i--) {
      const m = meteors[i];
      m.x += m.vx; m.y += m.vy; m.life -= 0.015;
      if (m.life <= 0 || m.x < -50 || m.y > H + 50) { meteors.splice(i, 1); continue; }
      const grad = ctx.createLinearGradient(m.x, m.y, m.x - m.vx * 12, m.y - m.vy * 12);
      grad.addColorStop(0, `rgba(255,255,255,${0.8 * m.life})`);
      grad.addColorStop(1, 'rgba(255,255,255,0)');
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(m.x, m.y);
      ctx.lineTo(m.x - m.vx * 12, m.y - m.vy * 12);
      ctx.stroke();
    }

    ctx.globalAlpha = 1;
    requestAnimationFrame(draw);
  }

  /* ---------- 交互：悬停/点击显示心愿 ---------- */
  function pickStar(px, py) {
    let best = null, bestD = 26;   // 命中半径
    for (const s of stars) {
      const dx = s.x * W - px, dy = s.y * H - py;
      const d = Math.hypot(dx, dy);
      if (d < bestD) { best = s; bestD = d; }
    }
    return best;
  }

  function showBubble(star, px, py) {
    wbText.textContent = star.wish.text;
    wbMeta.textContent = (star.wish.name ? '—— ' + star.wish.name : '—— 匿名') +
      (star.wish.seed ? '' : ' · 来自你的星空');
    bubble.hidden = false;
    const bw = bubble.offsetWidth, bh = bubble.offsetHeight;
    let bx = px - bw / 2, by = py - bh - 24;
    bx = Math.max(8, Math.min(bx, W - bw - 8));
    by = Math.max(8, by);
    bubble.style.left = bx + 'px';
    bubble.style.top = by + 'px';
  }

  function hideBubble() { bubble.hidden = true; }

  sky.addEventListener('mousemove', e => {
    const rect = sky.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const star = pickStar(px, py);
    hoverStar = star;
    sky.style.cursor = star ? 'pointer' : 'default';
    if (star) showBubble(star, px, py); else hideBubble();
  });
  sky.addEventListener('mouseleave', () => { hoverStar = null; hideBubble(); });
  sky.addEventListener('click', e => {
    const rect = sky.getBoundingClientRect();
    const star = pickStar(e.clientX - rect.left, e.clientY - rect.top);
    if (star) showBubble(star, e.clientX - rect.left, e.clientY - rect.top);
  });

  /* ---------- 许愿弹窗 ---------- */
  const input = document.getElementById('wishInput');
  const nameInput = document.getElementById('wishName');

  document.getElementById('wishAddBtn').addEventListener('click', () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    setTimeout(() => input.focus(), 200);
  });
  function closeModal() {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }
  document.getElementById('wishModalClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal.classList.contains('open')) closeModal();
  });

  document.getElementById('wishSubmit').addEventListener('click', () => {
    const text = input.value.trim();
    if (!text) { input.focus(); return; }
    const wish = { text, name: nameInput.value.trim() };
    saveWish(wish);
    const star = makeStar(wish);
    star.born = 1;                       // 触发生成动画
    stars.push(star);
    spawnMeteor();                       // 送一颗流星
    closeModal();
    input.value = ''; nameInput.value = '';

    const hint = document.getElementById('wishHint');
    if (hint) hint.innerHTML = '<i class="fa-solid fa-star"></i> 你的心愿已升空，找到属于你的那颗星了吗？';
  });

  /* ---------- 启动 ---------- */
  window.addEventListener('resize', resize);
  initSky();
  requestAnimationFrame(draw);
})();
