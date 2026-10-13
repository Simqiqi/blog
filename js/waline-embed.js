/**
 * waline-embed.js — 匿名共享留言（Waline 驱动，访客无需登录）
 * 用法：页面中放 <div data-waline></div>，再引入本脚本即可。
 *
 * 部署步骤见 README「匿名留言（Waline）」一节。
 * 部署完成后，把 Vercel 给你的服务地址填到下面 CONFIG.serverURL 即可启用；
 * serverURL 为空时本脚本自动跳过（页面只显示 giscus 或什么都不显示）。
 */
(function () {
  'use strict';

  var CONFIG = {
    serverURL: '', // ← 部署后填写，例如 'https://blog-waline.vercel.app'
    lang: 'zh-CN',
    // 访客只需填昵称即可留言；邮箱选填（用于接收回复通知）
    meta: ['nick', 'mail'],
    requiredMeta: ['nick'],
    pageSize: 10,
    wordLimit: [3, 500],
    login: 'disable', // 彻底关闭登录，纯匿名
    commentSorting: 'latest',
    reaction: true
  };

  var WALINE_CSS = 'https://unpkg.com/@waline/client@v3/dist/waline.css';
  var WALINE_JS = 'https://unpkg.com/@waline/client@v3/dist/waline.js';

  function mount(container) {
    if (!CONFIG.serverURL || container.dataset.walineMounted) return;
    container.dataset.walineMounted = '1';

    if (!document.querySelector('link[href*="waline.css"]')) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = WALINE_CSS;
      document.head.appendChild(link);
    }

    // 与站点主题联动：data-theme="dark" 时 Waline 自动切暗色
    import(WALINE_JS).then(function (m) {
      m.init({
        el: container,
        serverURL: CONFIG.serverURL,
        lang: CONFIG.lang,
        meta: CONFIG.meta,
        requiredMeta: CONFIG.requiredMeta,
        pageSize: CONFIG.pageSize,
        wordLimit: CONFIG.wordLimit,
        login: CONFIG.login,
        commentSorting: CONFIG.commentSorting,
        reaction: CONFIG.reaction,
        pageview: false,
        imageUploader: false,
        search: false,
        dark: 'html[data-theme="dark"]',
        emoji: ['https://unpkg.com/@waline/emojis@1.2.0/weibo']
      });
    }).catch(function () {
      container.innerHTML = '<p style="text-align:center;color:var(--text-dim);font-size:.8rem">留言加载失败，刷新试试</p>';
    });
  }

  function init() {
    document.querySelectorAll('[data-waline]').forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
