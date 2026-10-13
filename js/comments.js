/**
 * comments.js — 匿名留言组件（不登录也能留）
 * 后端：Vercel 无服务器函数 + GitHub Issues 存储（见 api/comments.js）
 * 用法：页面放 <div class="comments" data-page="页面标识"></div>，
 *       并在 <head> 放 <meta name="comments-server" content="https://你的vercel地址">
 *       再引入本脚本即可。
 */
(function () {
  'use strict';

  var SERVER = (function () {
    var m = document.querySelector('meta[name="comments-server"]');
    return m ? m.getAttribute('content').replace(/\/+$/, '') : '';
  })();

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function timeAgo(iso) {
    var d = new Date(iso), now = new Date();
    var s = Math.floor((now - d) / 1000);
    if (s < 60) return '刚刚';
    if (s < 3600) return Math.floor(s / 60) + ' 分钟前';
    if (s < 86400) return Math.floor(s / 3600) + ' 小时前';
    if (s < 2592000) return Math.floor(s / 86400) + ' 天前';
    return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate();
  }

  function avatarColor(nick) {
    var colors = ['#00e5ff', '#7c83ff', '#ff7eb6', '#ffb86c', '#a0e7a0', '#c792ea'];
    var h = 0;
    for (var i = 0; i < nick.length; i++) h = (h * 31 + nick.charCodeAt(i)) >>> 0;
    return colors[h % colors.length];
  }

  function renderList(box, list) {
    var ul = box.querySelector('.cm-list');
    if (!list.length) {
      ul.innerHTML = '<li class="cm-empty">还没有留言，来当第一个吧 ✨</li>';
      return;
    }
    ul.innerHTML = list.map(function (c) {
      var color = avatarColor(c.nick);
      var initial = esc((c.nick || '路')[0]);
      return '<li class="cm-item">' +
        '<span class="cm-avatar" style="background:' + color + '">' + initial + '</span>' +
        '<div class="cm-body">' +
          '<div class="cm-head"><span class="cm-nick">' + esc(c.nick) + '</span>' +
          '<span class="cm-time">' + timeAgo(c.created_at) + '</span></div>' +
          '<div class="cm-text">' + esc(c.text).replace(/\n/g, '<br>') + '</div>' +
        '</div></li>';
    }).join('');
  }

  function status(box, msg, type) {
    var el = box.querySelector('.cm-status');
    if (!el) return;
    el.textContent = msg || '';
    el.className = 'cm-status' + (type ? ' ' + type : '');
  }

  async function load(box, page) {
    if (!SERVER) { status(box, '留言服务未配置', 'err'); return; }
    try {
      var r = await fetch(SERVER + '/api/comments?page=' + encodeURIComponent(page), { headers: { 'Accept': 'application/json' } });
      var data = await r.json();
      renderList(box, (data.comments || []).filter(function (c) { return c.state !== 'closed'; }));
      var cnt = box.querySelector('.cm-count');
      if (cnt) cnt.textContent = (data.comments || []).filter(function (c) { return c.state !== 'closed'; }).length + ' 条留言';
    } catch (e) {
      status(box, '加载失败，稍后再试', 'err');
    }
  }

  async function submit(box, page) {
    if (!SERVER) { status(box, '留言服务未配置', 'err'); return; }
    var nick = box.querySelector('.cm-nick-input').value.trim();
    var text = box.querySelector('.cm-text-input').value.trim();
    var hp = box.querySelector('.cm-hp').value;
    if (!text) { status(box, '写点什么再发吧~', 'err'); return; }
    var btn = box.querySelector('.cm-send');
    btn.disabled = true;
    status(box, '发送中…');
    try {
      var r = await fetch(SERVER + '/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ page: page, nick: nick, text: text, hp: hp, ua: navigator.userAgent })
      });
      var data = await r.json();
      if (data.error) { status(box, '发送失败：' + data.error, 'err'); }
      else {
        box.querySelector('.cm-text-input').value = '';
        status(box, '已送达 ✨', 'ok');
        load(box, page);
      }
    } catch (e) {
      status(box, '网络错误，稍后再试', 'err');
    }
    btn.disabled = false;
  }

  function build(box) {
    var page = box.getAttribute('data-page') || location.pathname;
    box.innerHTML =
      '<div class="cm-form">' +
        '<input class="cm-nick-input" type="text" maxlength="24" placeholder="昵称（可不填，默认「路人」）">' +
        '<textarea class="cm-text-input" maxlength="800" placeholder="写下你的心里话…友善交流哦~"></textarea>' +
        '<input class="cm-hp" type="text" tabindex="-1" autocomplete="off" aria-hidden="true" style="position:absolute;left:-9999px">' +
        '<div class="cm-actions">' +
          '<span class="cm-count">0 条留言</span>' +
          '<button class="cm-send" type="button">放出去 <i class="fa-solid fa-paper-plane"></i></button>' +
        '</div>' +
        '<div class="cm-status"></div>' +
      '</div>' +
      '<ul class="cm-list"></ul>';

    box.querySelector('.cm-send').addEventListener('click', function () { submit(box, page); });
    box.querySelector('.cm-text-input').addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') submit(box, page);
    });
    load(box, page);
  }

  function init() {
    document.querySelectorAll('.comments').forEach(build);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
