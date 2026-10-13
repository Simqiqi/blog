/**
 * topband.js — 首页顶部信息带
 * 模块②：实时状态(天气/时间) + 快捷入口胶囊 + 数据胶囊(运行天/文章/留言/访客)
 * 模块③：顶部动态跑马灯(最新文章 + 最新留言 + 固定通告)
 *
 * 数据来源：
 *  - 天气/状态：复用 now.js 的 [data-now] 渲染（Open-Meteo，失败静默降级）
 *  - 文章数：同域 posts.json
 *  - 留言数：Vercel 评论 API（失败回退 GitHub Issues guestbook 标签）
 *  - 访客数：不蒜子 #busuanzi_value_site_uv（异步，轮询读取）
 * 任何网络请求失败都不会让信息带空白——均有兜底展示。
 */
(function () {
  'use strict';

  var LAUNCH = new Date('2026-01-01');
  function el(id) { return document.getElementById(id); }
  function daysSince(d) { return Math.max(0, Math.floor((Date.now() - d.getTime()) / 86400000)); }

  /* 1) 实时时钟 */
  function tick() {
    var n = new Date();
    var p = function (x) { return String(x).padStart(2, '0'); };
    var c = el('topbandClock');
    if (c) c.textContent = p(n.getHours()) + ':' + p(n.getMinutes()) + ':' + p(n.getSeconds());
  }
  tick();
  setInterval(tick, 1000);

  /* 2) 运行天数（与首页 hero 的 daysCount 同一基准） */
  var dEl = el('tbDays');
  if (dEl) dEl.textContent = daysSince(LAUNCH);

  /* 3) 文章数 */
  fetch('posts.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (p) {
      var n = (p && p.posts) ? p.posts.length : 0;
      var pe = el('tbPosts');
      if (pe && n) pe.textContent = n;
    })
    .catch(function () {});

  /* 4) 留言数（Vercel API → 回退 GitHub Issues） */
  function setMsgs(n) { var e = el('tbMsgs'); if (e && n != null) e.textContent = n; }
  fetch('https://simqiqi-blog.vercel.app/api/comments?page=guestbook')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      var arr = (d && d.comments) ? d.comments : (Array.isArray(d) ? d : []);
      setMsgs(arr.length);
    })
    .catch(function () {
      fetch('https://api.github.com/repos/Simqiqi/blog/issues?labels=guestbook&state=all&per_page=100')
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (iss) { setMsgs(Array.isArray(iss) ? iss.length : 0); })
        .catch(function () { var e = el('tbMsgs'); if (e) e.textContent = '—'; });
    });

  /* 5) 访客数（不蒜子，异步轮询） */
  (function readBsz() {
    var t = el('tbVisits');
    if (!t) return;
    var uv = el('busuanzi_value_site_uv');
    var pv = el('busuanzi_value_site_pv');
    if (uv && uv.textContent && uv.textContent !== '-') t.textContent = uv.textContent;
    else if (pv && pv.textContent && pv.textContent !== '-') t.textContent = pv.textContent;
  })();
  var tries = 0;
  var iv = setInterval(function () {
    var t = el('tbVisits');
    if (t && t.textContent !== '--' && t.textContent !== '—') { clearInterval(iv); return; }
    tries++;
    if (tries > 20) clearInterval(iv);
  }, 500);

  /* 6) 顶部跑马灯内容（与状态栏的导航/数据不重复：只放动态资讯、公告、寄语，不再复述导航） */
  var items = [
    '✨ 欢迎来到柒柒的星空小屋 · 愿你在此停留片刻温柔',
    '🌙 深夜也别太累，给生活留一点浪漫与光'
  ];
  function buildMarquee() {
    var track = el('topbandMarqueeTrack');
    if (!track) return;
    var html = items.map(function (s) { return '<span class="tb-mq-item">' + s + '</span>'; }).join('');
    track.innerHTML = html + html; /* 复制一份，无缝循环 */
  }
  buildMarquee();

  /* 7) 用最新文章/留言丰富跑马灯（best effort） */
  fetch('posts.json')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (p) {
      var posts = (p && p.posts) ? p.posts : [];
      if (posts.length) {
        var recent = posts.slice().sort(function (a, b) { return new Date(b.date) - new Date(a.date); })[0];
        items.unshift('🆕 新文《' + (recent.title || '') + '》');
        buildMarquee();
      }
    })
    .catch(function () {});

  fetch('https://simqiqi-blog.vercel.app/api/comments?page=guestbook')
    .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
    .then(function (d) {
      var arr = (d && d.comments) ? d.comments : (Array.isArray(d) ? d : []);
      if (arr.length) {
        var c = arr[arr.length - 1];
        var name = (c.name || c.author || '匿名');
        var msg = (c.content || c.message || '').replace(/<[^>]+>/g, '').slice(0, 30);
        items.push('💌 ' + name + '：' + msg);
        buildMarquee();
      }
    })
    .catch(function () {});
})();
