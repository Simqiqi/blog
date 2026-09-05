/* ============================================================
   首页文字粒子魔法 particle-magic.js
   - 将首页 hero 品牌大字（#magicNameText，如「柒柒」）粒子化：
     Canvas 采样文字像素生成星点粒子，初始由散落幻化成字；
     鼠标 / 手指划过时粒子被打散飘散，离开后自动重组。
   - 纯 IIFE 追加式脚本，无外部依赖；
   - 自动跟随暗夜 / 浅色主题（监听 html[data-theme]）；
   - 尊重 prefers-reduced-motion：系统要求减少动效时保持原文，不做粒子化。
   ============================================================ */
(function () {
  'use strict';

  var canvas = document.getElementById('magicNameCanvas');
  var textEl = document.getElementById('magicNameText');
  if (!canvas || !textEl) return;
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var DPR = Math.min(window.devicePixelRatio || 1, 2);
  var W = 0, H = 0;
  var particles = [];
  var pointer = { x: -9999, y: -9999, on: false };
  var raf = null;
  var started = false;

  /* ---------- 颜色工具 ---------- */
  function cssVar(name, fb) {
    try {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim() || fb;
    } catch (e) { return fb; }
  }
  function isDarkTheme() {
    return document.documentElement.getAttribute('data-theme') !== 'light';
  }
  function hexToRgb(h) {
    h = (h || '').trim();
    if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(h)) {
      var s = h.slice(1);
      if (s.length === 3) s = s.replace(/./g, function (c) { return c + c; });
      var n = parseInt(s, 16);
      return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    }
    var m = /rgba?\(([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(h);
    if (m) return { r: +m[1], g: +m[2], b: +m[3] };
    return null;
  }
  function mix(c1, c2, t) {
    return {
      r: Math.round(c1.r + (c2.r - c1.r) * t),
      g: Math.round(c1.g + (c2.g - c1.g) * t),
      b: Math.round(c1.b + (c2.b - c1.b) * t)
    };
  }
  function rgba(c, a) { return 'rgba(' + c.r + ',' + c.g + ',' + c.b + ',' + a + ')'; }

  var stops = [null, null];      /* accent -> 亮色，双向往返模拟 200% 渐变 */
  var glowC = null;
  function buildPalette() {
    var dark = isDarkTheme();
    var accent = hexToRgb(cssVar('--accent', dark ? '#00e5ff' : '#6366f1'));
    if (!accent) accent = dark ? { r: 0, g: 229, b: 255 } : { r: 99, g: 102, b: 241 };
    var textC = hexToRgb(cssVar('--text', dark ? '#d4d4dc' : '#1a1a2e')) || { r: 212, g: 212, b: 220 };
    glowC = dark ? { r: 255, g: 255, b: 255 } : mix(textC, { r: 255, g: 255, b: 255 }, 0.32);
    stops = [accent, glowC];
    for (var i = 0; i < particles.length; i++) particles[i].color = colorFor(particles[i].u);
  }
  function colorFor(u) {
    var t = ((u % 1) + 1) % 1;
    t = t < 0.5 ? t * 2 : (1 - t) * 2;
    return rgba(mix(stops[0], stops[1], t), 1);
  }

  /* ---------- 采样文字 -> 粒子 ---------- */
  function rebuild() {
    var label = (textEl.textContent || '').trim();
    if (!label) return;
    var rect = textEl.getBoundingClientRect();
    W = Math.max(10, Math.round(rect.width));
    H = Math.max(10, Math.round(rect.height));
    canvas.width = Math.round(W * DPR);
    canvas.height = Math.round(H * DPR);
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';

    /* 离屏绘制纯白文字并采样 alpha */
    var off = document.createElement('canvas');
    off.width = canvas.width;
    off.height = canvas.height;
    var octx = off.getContext('2d');
    var fs = textEl.ownerDocument.defaultView.getComputedStyle(textEl);
    octx.setTransform(DPR, 0, 0, DPR, 0, 0);
    octx.font = fs.fontWeight + ' ' + fs.fontSize + ' ' + fs.fontFamily;
    octx.textAlign = 'center';
    octx.textBaseline = 'middle';
    octx.fillStyle = '#fff';
    octx.fillText(label, W / 2, H / 2);
    var img = octx.getImageData(0, 0, off.width, off.height).data;

    var fontSize = parseFloat(fs.fontSize) || 32;
    var step = Math.max(1.6, Math.min(2.8, fontSize / 13));
    var list = [];
    var minX = Infinity, maxX = -Infinity;
    for (var y = step / 2; y < H; y += step) {
      for (var x = step / 2; x < W; x += step) {
        var px = Math.max(0, Math.min(off.width - 1, Math.round(x * DPR)));
        var py = Math.max(0, Math.min(off.height - 1, Math.round(y * DPR)));
        if (img[(py * off.width + px) * 4 + 3] > 130) {
          list.push({ tx: x, ty: y });
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
        }
      }
    }
    if (list.length < 10) return; /* 采样异常：保留原文字 */

    textEl.classList.add('magic-active');
    var span = Math.max(1, maxX - minX);
    particles = [];
    for (var i = 0; i < list.length; i++) {
      var a = Math.random() * Math.PI * 2;
      var r = 60 + Math.random() * 220;
      particles.push({
        x: list[i].tx + Math.cos(a) * r,
        y: list[i].ty + Math.sin(a) * r * 0.7,
        vx: (Math.random() - 0.5) * 1.6,
        vy: (Math.random() - 0.5) * 1.6,
        tx: list[i].tx,
        ty: list[i].ty,
        u: (list[i].tx - minX) / span,
        r: (Math.random() < 0.1 ? 1.6 : 1.0) + Math.random() * 0.7,
        ph: Math.random() * Math.PI * 2,
        spark: Math.random() < 0.06,
        color: '#fff'
      });
    }
    buildPalette();
    start();
  }

  /* ---------- 帧循环 ---------- */
  var K = 0.09, DAMP = 0.84, PUSH = 3.4, RADIUS = 74, MAXSPD = 4.2;

  function tick(now) {
    raf = requestAnimationFrame(tick);
    var t = now * 0.001;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];
      /* 目标位置轻微呼吸 */
      var hx = p.tx + Math.sin(t * 1.2 + p.ph) * 0.7;
      var hy = p.ty + Math.cos(t * 0.9 + p.ph * 1.7) * 0.5;
      /* 弹簧归位 */
      p.vx += (hx - p.x) * K;
      p.vy += (hy - p.y) * K;
      /* 指针斥力 -> 打散 */
      if (pointer.on) {
        var dx = p.x - pointer.x;
        var dy = p.y - pointer.y;
        var d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS && d2 > 0.01) {
          var d = Math.sqrt(d2);
          var f = (1 - d / RADIUS) * PUSH;
          p.vx += (dx / d) * f;
          p.vy += (dy / d) * f;
          p.vx += (Math.random() - 0.5) * 0.8;
          p.vy += (Math.random() - 0.5) * 0.8;
        }
      }
      var sp = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (sp > MAXSPD) { p.vx = p.vx / sp * MAXSPD; p.vy = p.vy / sp * MAXSPD; }
      p.vx *= DAMP;
      p.vy *= DAMP;
      p.x += p.vx;
      p.y += p.vy;
      /* 渲染 */
      var tw = 0.62 + 0.38 * Math.sin(t * 3 + p.ph * 3);
      var a = 0.5 + 0.42 * tw;
      if (p.spark) a *= 1.15;
      ctx.fillStyle = p.color.replace(',1)', ',' + a.toFixed(3) + ')');
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r * (0.9 + 0.2 * tw), 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function start() {
    if (started || !particles.length) return;
    started = true;
    raf = requestAnimationFrame(tick);
  }
  if (particles.length) start();

  /* ---------- 指针 / 触摸交互 ---------- */
  function onMove(e) {
    var r = canvas.getBoundingClientRect();
    pointer.x = e.clientX - r.left;
    pointer.y = e.clientY - r.top;
    pointer.on = true;
  }
  function off() {
    pointer.on = false;
    pointer.x = pointer.y = -9999;
  }
  window.addEventListener('pointermove', onMove, { passive: true });
  window.addEventListener('pointerdown', onMove, { passive: true });
  window.addEventListener('pointerup', off, { passive: true });
  window.addEventListener('pointercancel', off, { passive: true });
  document.addEventListener('mouseleave', off, { passive: true });

  /* ---------- resize / 主题切换 ---------- */
  var rt = null;
  window.addEventListener('resize', function () {
    clearTimeout(rt);
    rt = setTimeout(function () {
      var active = textEl.classList.contains('magic-active');
      textEl.classList.remove('magic-active');
      started = false;
      if (raf) cancelAnimationFrame(raf);
      raf = null;
      rebuild();
    }, 200);
  });

  var mo = null;
  if (window.MutationObserver) {
    mo = new MutationObserver(buildPalette);
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
  }

  /* 首帧初始化 */
  rebuild();
})();
