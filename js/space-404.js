/* ============================================================
   太空漂流 404（space-404.js）
   - 星海 Canvas：漂浮星点 + 流星；启程时星流加速形成「穿越星海」
   - 随机漂流一句站点文章金句 / 文艺语录（优先 fetch posts.json）
   - 输入任意字或点击「启程返航」：小飞船飞向星海深处并返回首页
   纯 IIFE 追加式脚本，暗夜/浅色自适应，无外部依赖
   ============================================================ */
(function () {
  'use strict';

  var drift = document.getElementById('spaceDrift');
  var canvas = document.getElementById('spaceCanvas404');
  var ship = document.getElementById('sdShip');
  var inputEl = document.getElementById('sdInput');
  var goBtn = document.getElementById('sdGo');
  var msgEl = document.getElementById('sdMessage');
  var srcEl = document.getElementById('sdSource');
  var tipEl = document.getElementById('sdTip');
  if (!drift || !canvas || !msgEl) return;

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);

  /* ============ 星海 ============ */
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var stars = [], meteors = [], mTimer = 0;
  var flying = false, burstT0 = 0, t0 = 0;

  function isDark() { return document.documentElement.getAttribute('data-theme') !== 'light'; }

  function palettes() {
    return isDark()
      ? { star: ['#ffffff', '#e6f7ff', '#c7d2fe', '#a5f3fc'], meteor: 'rgba(186,230,253,0.8)' }
      : { star: ['#6366f1', '#818cf8', '#4c1d95', '#a5b4fc'], meteor: 'rgba(129,140,248,0.8)' };
  }
  function buildStars() {
    stars = [];
    var area = W * H;
    var n = Math.min(560, Math.max(90, Math.round(area / 2400)));
    for (var i = 0; i < n; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.7 + 0.4,
        sx: 0.2 + Math.random() * 0.8,
        dx: (Math.random() - 0.5) * 0.16,
        dy: (Math.random() - 0.5) * 0.16,
        ph: Math.random() * Math.PI * 2,
        tw: 0.6 + Math.random() * 1.4,
        big: Math.random() < 0.06
      });
    }
    applyTheme();
  }
  function applyTheme() {
    var pal = palettes();
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      s.color = pal.star[(Math.random() * pal.star.length) | 0];
      s.size = s.big ? s.r * 1.9 : s.r;
    }
  }
  function resize() {
    W = drift.clientWidth || window.innerWidth;
    H = drift.clientHeight || window.innerHeight;
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    buildStars();
  }

  /* ============ 漂流金句 ============ */
  var FALLBACK = [
    { text: '我全部的好脾气，因为我爱你。愿世间万家灯火，有一盏灯独为你而亮。', src: '来自文章《我在等、等风、等你来。》' },
    { text: '那句话就卡在喉咙里，像一颗没熟透的果子。真正重要的从来不是话本身。', src: '来自文章《话没说完，也没关系》' },
    { text: '一个不知天高地厚的大学生，终于有了属于自己的小角落。', src: '来自文章《你好，世界》' },
    { text: '星星在很远的地方亮着，说明方向还在。', src: '漂流瓶寄语' },
    { text: '迷路也没关系，宇宙本来就允许慢慢走。', src: '漂流瓶寄语' },
    { text: '风会记住每一封信，海会送还每一个梦。', src: '漂流瓶寄语' },
    { text: '如果你也抬头看月亮，那我们就不算走散。', src: '漂流瓶寄语' }
  ];
  var quoteList = null, typingTimer = null;

  function pickRandom(arr) { return arr[(Math.random() * arr.length) | 0]; }

  function showQuote(q) {
    if (typingTimer) { clearInterval(typingTimer); typingTimer = null; }
    var i = 0, text = q.text || '', src = q.src || '';
    msgEl.textContent = '';
    msgEl.classList.remove('typed-done');
    msgEl.classList.add('typing');
    if (srcEl) srcEl.textContent = '';
    typingTimer = setInterval(function () {
      i++;
      msgEl.textContent = text.slice(0, i);
      if (i >= text.length) {
        clearInterval(typingTimer);
        typingTimer = null;
        msgEl.classList.remove('typing');
        msgEl.classList.add('typed-done');
        if (srcEl) srcEl.textContent = '—— ' + src;
      }
    }, reduceMotion ? 0 : 30);
  }

  function loadQuotes() {
    if (reduceMotion || !window.fetch) { showQuote(pickRandom(FALLBACK)); return; }
    var done = false;
    var timeout = setTimeout(function () {
      if (!done) { done = true; if (!quoteList) showQuote(pickRandom(FALLBACK)); }
    }, 1300);
    fetch('posts.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : Promise.reject(new Error('bad')); })
      .then(function (list) {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        var arr = [];
        (list || []).forEach(function (p) {
          if (p && p.title) arr.push({ text: String(p.title), src: '来自文章《' + p.title + '》' });
          if (p && p.excerpt && p.excerpt.length > 6) arr.push({ text: String(p.excerpt), src: '来自文章《' + p.title + '》' });
        });
        quoteList = arr.length ? arr : FALLBACK;
        showQuote(pickRandom(quoteList));
      })
      .catch(function () {
        if (done) return;
        done = true;
        clearTimeout(timeout);
        quoteList = FALLBACK;
        showQuote(pickRandom(FALLBACK));
      });
  }

  /* ============ 启程 ============ */
  function go() {
    if (flying) return;
    flying = true;
    burstT0 = performance.now();
    var val = inputEl ? String(inputEl.value || '').trim() : '';
    if (tipEl) {
      tipEl.textContent = val
        ? '已把「' + val.slice(0, 16) + '」封入漂流瓶 · 小飞船这就启程'
        : '小飞船这就启程，穿过星海回家';
    }
    if (ship) ship.classList.add('fly');
    if (reduceMotion) { window.location.href = 'index.html'; return; }
    setTimeout(function () { window.location.href = 'index.html'; }, 1080);
  }
  if (goBtn) goBtn.addEventListener('click', go);
  if (inputEl) inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });

  /* ============ 帧循环 ============ */
  function spawnMeteor() {
    if (meteors.length < 2 && !reduceMotion) {
      meteors.push({
        x: Math.random() * W * 0.85,
        y: Math.random() * H * 0.35,
        vx: 3.5 + Math.random() * 4,
        vy: 1.2 + Math.random() * 1.8,
        life: 70 + Math.random() * 40
      });
    }
  }

  function tick(now) {
    requestAnimationFrame(tick);
    if (!t0) t0 = now;
    var t = (now - t0) * 0.001;

    /* 星流加速（穿越星海） */
    var boost = 0;
    if (flying) {
      var p = Math.min(1, (now - burstT0) / 900);
      boost = p * p * 16;
    }

    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);

    /* 流星 */
    mTimer -= 16;
    if (mTimer <= 0) { spawnMeteor(); mTimer = 2600 + Math.random() * 5000; }
    var alive = [];
    for (var mi = 0; mi < meteors.length; mi++) {
      var m = meteors[mi];
      m.x += (m.vx + boost * 0.5) * 1.6;
      m.y += m.vy * 1.6 + boost * 0.12;
      m.life--;
      if (m.life > 0 && m.x < W + 60 && m.y < H + 60) {
        alive.push(m);
        var gA = Math.max(0, Math.min(0.8, m.life / 50));
        ctx.strokeStyle = palettes().meteor.replace('0.8)', gA.toFixed(3) + ')');
        ctx.lineWidth = 1.4;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(m.x - m.vx * (5 + boost * 0.4), m.y - m.vy * (5 + boost * 0.4));
        ctx.stroke();
      }
    }
    meteors = alive;

    /* 星点 */
    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var fx = s.dx + boost * s.sx * 0.62;
      var fy = s.dy + boost * s.sx * 0.18;
      s.x += fx;
      s.y += fy;
      if (s.x > W + 20) s.x = -20;
      if (s.y > H + 20) s.y = -20;
      if (s.x < -20) s.x = W + 20;
      if (s.y < -20) s.y = H + 20;
      var a = 0.3 + 0.65 * (0.5 + 0.5 * Math.sin(t * s.tw + s.ph));
      if (boost > 0.5) {
        /* 星流拖尾 */
        ctx.strokeStyle = s.color;
        ctx.globalAlpha = a * 0.5;
        ctx.lineWidth = s.size * 0.6;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(s.x - fx * 9, s.y - fy * 9);
        ctx.stroke();
      }
      ctx.globalAlpha = a;
      ctx.fillStyle = s.color;
      ctx.fillRect(s.x, s.y, s.size, s.size);
    }
    ctx.globalAlpha = 1;
  }

  /* ============ 事件 ============ */
  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(resize, 150);
  });
  if (window.MutationObserver) {
    new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  resize();
  requestAnimationFrame(function frame(now) { tick(now); });
  loadQuotes();
})();
