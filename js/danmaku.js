/* ============================================================
   danmaku.js — 留言飘浮弹幕墙引擎
   - 自动抓取博客留言（GitHub Issues「guestbook」标签 + Vercel 评论 API）
   - 分轨道、防重叠的飘浮弹幕（requestAnimationFrame 驱动）
   - 玻璃拟态胶囊 + 头像 + 昵称，悬停高亮暂停
   - 控制条：播放/暂停、速度、密度、透明度、列表抽屉
   用法：
     独立页 danmaku.html 引入本脚本即可自动挂载。
     其它页调用  DanmakuWall.openOverlay()  以全屏浮层弹出。
   ============================================================ */
(function () {
  'use strict';

  var REPO = 'Simqiqi/blog';
  var GH_LABEL = 'guestbook';
  var PALETTE = ['#00e5ff', '#b44aff', '#ff7eb6', '#ffb86c', '#a0e7a0',
                 '#c792ea', '#ff5e7e', '#5ef0c0', '#ffd166', '#6ea8fe'];

  /* ---------- 工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }
  function hash(str) {
    var h = 0;
    for (var i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
    return h;
  }
  function colorOf(nick) { return PALETTE[hash(nick || '路人') % PALETTE.length]; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ---------- 数据抓取 ---------- */
  function ghIssues() {
    var url = 'https://api.github.com/repos/' + REPO +
      '/issues?labels=' + encodeURIComponent(GH_LABEL) +
      '&state=all&per_page=100&sort=created&direction=asc';
    return fetch(url, { headers: { 'Accept': 'application/vnd.github+json' } })
      .then(function (r) { return r.json(); })
      .then(function (issues) {
        return (Array.isArray(issues) ? issues : [])
          .filter(function (i) { return !i.pull_request; })
          .map(function (i) {
            var name = (i.title || '').replace(/^\[留言\]\s*/, '').replace(/^💬\s*/, '') || '路人';
            return { nick: name, text: (i.body || '').replace(/\n/g, ' ').trim(), created_at: i.created_at };
          });
      });
  }
  function vercelComments() {
    var m = document.querySelector('meta[name="comments-server"]');
    var base = m ? m.getAttribute('content').replace(/\/+$/, '') : 'https://simqiqi-blog.vercel.app';
    return fetch(base + '/api/comments?page=guestbook', { headers: { 'Accept': 'application/json' } })
      .then(function (r) { return r.json(); })
      .then(function (data) {
        return (data.comments || [])
          .filter(function (c) { return c.state !== 'closed'; })
          .map(function (c) {
            return { nick: c.nick || '路人', text: (c.text || '').replace(/\n/g, ' ').trim(), created_at: c.created_at };
          });
      });
  }
  // 兜底样例：离线/接口不可达时也能看到效果
  var FALLBACK = [
    { nick: '小满', text: '第一次来柒柒的博客，被这片星空治愈了 ✨' },
    { nick: '阿哲', text: '那篇雨中骑行的文章我看哭了，共情太强' },
    { nick: 'Luna', text: '许愿星空页面好浪漫，已经偷偷许了三个愿' },
    { nick: '柚子', text: '更新的频率刚好，每次来都有新惊喜' },
    { nick: '老周', text: '拍照的色调是真的舒服，怎么调的呀' },
    { nick: 'momo', text: '留言墙的设计好可爱，漂流瓶哈哈哈' },
    { nick: '晴子', text: '时间胶囊那个创意绝了，明年再来看' },
    { nick: 'K', text: 'bgm 一响，整个人都松弛下来了' },
    { nick: '小鹿', text: '柒柒加油，你的文字值得被更多人看到' },
    { nick: '阿may', text: '今晚的月色和你的博客一样温柔' }
  ];

  function fetchComments() {
    return Promise.allSettled([ghIssues(), vercelComments()]).then(function (res) {
      var out = [];
      res.forEach(function (r) { if (r.status === 'fulfilled') out = out.concat(r.value); });
      // 去重（昵称+内容）
      var seen = {}, uniq = [];
      out.forEach(function (c) {
        if (!c.text) return;
        var k = (c.nick || '') + '|' + c.text;
        if (seen[k]) return;
        seen[k] = 1; uniq.push(c);
      });
      if (!uniq.length) uniq = FALLBACK.slice();
      // 取较新的一部分，避免首屏过密
      uniq.sort(function (a, b) { return new Date(b.created_at || 0) - new Date(a.created_at || 0); });
      return uniq.slice(0, 220);
    });
  }

  /* ---------- 星空背景 ---------- */
  function mountStars(canvas) {
    var ctx = canvas.getContext('2d');
    var stars = [], shooters = [], w, h, dpr = Math.min(window.devicePixelRatio || 1, 2);
    function resize() {
      w = canvas.width = window.innerWidth * dpr;
      h = canvas.height = window.innerHeight * dpr;
      canvas.style.width = window.innerWidth + 'px';
      canvas.style.height = window.innerHeight + 'px';
      stars = [];
      var n = Math.floor((window.innerWidth * window.innerHeight) / 6000);
      for (var i = 0; i < n; i++) {
        stars.push({
          x: Math.random() * w, y: Math.random() * h,
          r: (Math.random() * 1.3 + 0.3) * dpr,
          a: Math.random(), tw: Math.random() * 0.02 + 0.004,
          c: Math.random() > 0.5 ? 'rgba(0,229,255,' : 'rgba(180,74,255,'
        });
      }
    }
    resize();
    window.addEventListener('resize', resize);
    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        s.a += s.tw; if (s.a > 1 || s.a < 0.15) s.tw *= -1;
        ctx.beginPath();
        ctx.fillStyle = s.c + s.a.toFixed(2) + ')';
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      // 偶发流星
      if (Math.random() < 0.004 && shooters.length < 2) {
        shooters.push({ x: Math.random() * w, y: Math.random() * h * 0.4, vx: -6 * dpr, vy: 3 * dpr, life: 1 });
      }
      for (var j = shooters.length - 1; j >= 0; j--) {
        var sh = shooters[j];
        sh.x += sh.vx; sh.y += sh.vy; sh.life -= 0.012;
        var grad = ctx.createLinearGradient(sh.x, sh.y, sh.x - sh.vx * 8, sh.y - sh.vy * 8);
        grad.addColorStop(0, 'rgba(255,255,255,' + sh.life + ')');
        grad.addColorStop(1, 'rgba(255,255,255,0)');
        ctx.strokeStyle = grad; ctx.lineWidth = 2 * dpr;
        ctx.beginPath(); ctx.moveTo(sh.x, sh.y);
        ctx.lineTo(sh.x - sh.vx * 8, sh.y - sh.vy * 8); ctx.stroke();
        if (sh.life <= 0 || sh.x < 0 || sh.y > h) shooters.splice(j, 1);
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  /* ---------- 弹幕墙 ---------- */
  function Wall(root, opts) {
    opts = opts || {};
    this.root = root;
    this.stage = null;
    this.track = null;
    this.comments = [];
    this.danmakus = [];
    this.lanes = [];
    this.running = true;
    this.speed = 1;
    this.density = 1;     // 越大越密
    this.opacity = 1;
    this.last = 0;
    this.lastSpawn = 0;
    this.LANE_H = 66;
    this.GAP = 36;
  }

  Wall.prototype.build = function () {
    var stage = document.createElement('div');
    stage.className = 'dm-stage';
    stage.innerHTML =
      '<canvas class="dm-stars"></canvas>' +
      '<div class="dm-track"></div>' +
      '<div class="dm-title"><h1>✨ 留言弹幕墙</h1><p id="dmSub">正在收集星光…</p></div>' +
      '<div class="dm-loading"><div class="dm-spinner"></div><span>正在加载留言…</span></div>' +
      '<div class="dm-controls">' +
        '<button class="dm-btn dm-play" title="播放/暂停"><i class="fa-solid fa-pause"></i></button>' +
        '<div class="dm-slider">🐢<input type="range" class="dm-speed" min="0.4" max="2.2" step="0.1" value="1"><span class="dm-speed-v">1.0×</span></div>' +
        '<div class="dm-slider">💬<input type="range" class="dm-density" min="0.4" max="2.5" step="0.1" value="1"></div>' +
        '<div class="dm-slider">🌫<input type="range" class="dm-opacity" min="0.3" max="1" step="0.05" value="1"></div>' +
        '<button class="dm-btn dm-list-btn" title="留言列表"><i class="fa-solid fa-list"></i></button>' +
      '</div>' +
      '<div class="dm-list-panel"><div class="dm-list-head"><span>全部留言</span>' +
        '<button class="dm-list-close"><i class="fa-solid fa-xmark"></i></button></div>' +
        '<div class="dm-list-scroll"></div></div>';
    this.root.appendChild(stage);
    this.stage = stage;
    this.track = stage.querySelector('.dm-track');
    this.loading = stage.querySelector('.dm-loading');
    this.sub = stage.querySelector('#dmSub');
    this.title = stage.querySelector('.dm-title');
    mountStars(stage.querySelector('.dm-stars'));
    this.bindControls();
    var self = this;
    requestAnimationFrame(function () { stage.classList.add('dm-open'); });
    setTimeout(function () { self.title.classList.add('dm-faded'); }, 4200);
  };

  Wall.prototype.bindControls = function () {
    var self = this, s = this.stage;
    var playBtn = s.querySelector('.dm-play');
    playBtn.addEventListener('click', function () {
      self.running = !self.running;
      playBtn.querySelector('i').className = self.running ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    });
    var speed = s.querySelector('.dm-speed'), speedV = s.querySelector('.dm-speed-v');
    speed.addEventListener('input', function () {
      self.speed = parseFloat(speed.value);
      speedV.textContent = self.speed.toFixed(1) + '×';
    });
    s.querySelector('.dm-density').addEventListener('input', function () {
      self.density = parseFloat(this.value);
    });
    s.querySelector('.dm-opacity').addEventListener('input', function () {
      self.opacity = parseFloat(this.value);
      self.track.style.setProperty('--dm-opacity', self.opacity);
    });
    var panel = s.querySelector('.dm-list-panel');
    s.querySelector('.dm-list-btn').addEventListener('click', function () {
      panel.classList.toggle('dm-show');
      if (panel.classList.contains('dm-show')) self.renderList();
    });
    s.querySelector('.dm-list-close').addEventListener('click', function () {
      panel.classList.remove('dm-show');
    });
  };

  Wall.prototype.renderList = function () {
    var box = this.stage.querySelector('.dm-list-scroll');
    box.innerHTML = this.comments.map(function (c) {
      var col = colorOf(c.nick);
      var t = c.created_at ? new Date(c.created_at).toLocaleDateString('zh-CN') : '';
      return '<div class="dm-list-item" style="--c:' + col + '">' +
        '<span class="dm-avatar">' + esc((c.nick || '路')[0]) + '</span>' +
        '<div class="dm-li-body"><div class="dm-li-nick">' + esc(c.nick || '路人') + '</div>' +
        '<div class="dm-li-text">' + esc(c.text) + '</div>' +
        (t ? '<div class="dm-li-time">' + t + '</div>' : '') + '</div></div>';
    }).join('');
  };

  Wall.prototype.start = function () {
    var self = this;
    this.build();
    this.loading.style.display = 'flex';
    fetchComments().then(function (list) {
      self.comments = list.length ? list : FALLBACK.slice();
      self.loading.style.display = 'none';
      self.sub.textContent = '共 ' + self.comments.length + ' 条留言正在飘浮 ✦';
      self.loop = self.loop.bind(self);
      requestAnimationFrame(self.loop);
    });
  };

  Wall.prototype.computeLanes = function () {
    var h = this.stage.clientHeight;
    var n = Math.max(4, Math.floor((h - 60) / this.LANE_H));
    this.laneCount = n;
  };

  Wall.prototype.pickLane = function () {
    this.computeLanes();
    var W = this.stage.clientWidth;
    var safe = [];
    for (var i = 0; i < this.laneCount; i++) {
      var laneD = this.danmakus.filter(function (d) { return d.lane === i; });
      // 该轨道最右（最新）的弹幕右边缘必须已离开右侧足够距离
      var ok = true;
      for (var j = 0; j < laneD.length; j++) {
        if (laneD[j].x + laneD[j].width > W - this.GAP) { ok = false; break; }
      }
      if (ok) safe.push(i);
    }
    if (!safe.length) return -1;
    return pick(safe);
  };

  Wall.prototype.spawn = function () {
    if (!this.comments.length) return;
    var lane = this.pickLane();
    if (lane === -1) return;
    var c = pick(this.comments);
    var col = colorOf(c.nick);
    var el = document.createElement('div');
    el.className = 'dm-pill';
    el.style.setProperty('--c', col);
    el.innerHTML = '<span class="dm-avatar">' + esc((c.nick || '路')[0]) + '</span>' +
      '<span class="dm-nick">' + esc(c.nick || '路人') + '</span>' +
      '<span class="dm-text">' + esc(c.text) + '</span>';
    this.track.appendChild(el);
    var width = el.offsetWidth;
    var base = 70 + Math.random() * 70;          // px/s
    var x = this.stage.clientWidth + 10;
    el.style.transform = 'translate3d(' + x + 'px,' + (lane * this.LANE_H + 14) + 'px,0)';
    var d = { el: el, lane: lane, x: x, width: width, base: base };
    this.danmakus.push(d);
    var self = this;
    el.addEventListener('mouseenter', function () { d.paused = true; });
    el.addEventListener('mouseleave', function () { d.paused = false; });
  };

  Wall.prototype.loop = function (ts) {
    if (!this.last) this.last = ts;
    var dt = Math.min((ts - this.last) / 1000, 0.05);
    this.last = ts;

    if (this.running) {
      for (var i = this.danmakus.length - 1; i >= 0; i--) {
        var d = this.danmakus[i];
        if (!d.paused) d.x -= d.base * this.speed * dt;
        d.el.style.transform = 'translate3d(' + d.x + 'px,' + (d.lane * this.LANE_H + 14) + 'px,0)';
        if (d.x + d.width < -20) {
          if (d.el.parentNode) d.el.parentNode.removeChild(d.el);
          this.danmakus.splice(i, 1);
        }
      }
      // 生成节奏：密度越高间隔越短
      var interval = 1400 / this.density;
      if (ts - this.lastSpawn > interval) {
        this.spawn();
        this.lastSpawn = ts;
      }
    }
    requestAnimationFrame(this.loop);
  };

  /* ---------- 对外接口 ---------- */
  var DanmakuWall = {
    _overlay: null,
    mountStandalone: function () {
      var root = document.getElementById('dm-root');
      if (!root) { root = document.createElement('div'); document.body.appendChild(root); }
      var w = new Wall(root);
      w.start();
      return w;
    },
    openOverlay: function () {
      if (this._overlay) return;
      var root = document.createElement('div');
      document.body.appendChild(root);
      var w = new Wall(root);
      w.start();
      w.stage.classList.add('dm-open');
      // 关闭按钮
      var close = document.createElement('button');
      close.className = 'dm-close';
      close.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      close.addEventListener('click', function () {
        if (w.stage) w.stage.remove();
        root.remove();
        DanmakuWall._overlay = null;
      });
      w.stage.appendChild(close);
      this._overlay = w;
      return w;
    }
  };

  window.DanmakuWall = DanmakuWall;

  // 独立页自动挂载
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      if (document.getElementById('dm-root') || document.querySelector('.dm-auto')) DanmakuWall.mountStandalone();
    });
  } else {
    if (document.getElementById('dm-root') || document.querySelector('.dm-auto')) DanmakuWall.mountStandalone();
  }
})();
