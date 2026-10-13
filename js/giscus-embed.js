/**
 * giscus-embed.js — 全站共享留言（GitHub Discussions 驱动）
 * 用法：页面中放 <div data-giscus></div>，再引入本脚本即可。
 * 说明：访客首次留言需用 GitHub 账号授权 giscus。
 */
(function () {
  'use strict';

  var CONFIG = {
    repo: 'Simqiqi/blog',
    repoId: 'R_kgDOTYjCIg',
    category: 'General',
    categoryId: 'DIC_kwDOTYjCIs4DIS8P',
    lang: 'zh-CN'
  };

  function siteTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? 'light'
      : 'transparent_dark';
  }

  function syncTheme() {
    var iframe = document.querySelector('iframe.giscus-frame');
    if (!iframe || !iframe.contentWindow) return;
    iframe.contentWindow.postMessage(
      { giscus: { setConfig: { theme: siteTheme() } } },
      'https://giscus.app'
    );
  }

  function mount(container) {
    if (container.dataset.giscusMounted) return;
    container.dataset.giscusMounted = '1';

    var s = document.createElement('script');
    s.src = 'https://giscus.app/client.js';
    s.async = true;
    s.crossOrigin = 'anonymous';
    s.setAttribute('data-repo', CONFIG.repo);
    s.setAttribute('data-repo-id', CONFIG.repoId);
    s.setAttribute('data-category', CONFIG.category);
    s.setAttribute('data-category-id', CONFIG.categoryId);
    s.setAttribute('data-mapping', 'pathname');
    s.setAttribute('data-strict', '0');
    s.setAttribute('data-reactions-enabled', '1');
    s.setAttribute('data-emit-metadata', '0');
    s.setAttribute('data-input-position', 'top');
    s.setAttribute('data-theme', siteTheme());
    s.setAttribute('data-lang', CONFIG.lang);
    s.setAttribute('data-loading', 'lazy');
    container.appendChild(s);
  }

  function init() {
    document.querySelectorAll('[data-giscus]').forEach(mount);

    // 站点明暗切换时同步 giscus 主题
    var lastTheme = siteTheme();
    new MutationObserver(function () {
      var t = siteTheme();
      if (t !== lastTheme) {
        lastTheme = t;
        syncTheme();
      }
    }).observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
