/* ============================================================
   阅读尽头彩蛋 · Reading End Easter Egg
   ------------------------------------------------------------
   仅文章阅读页生效：当读者滚动到页面底部附近（读到了尽头）时，
   随机浮现一句温柔金句，停留数秒后自动隐退。
   同一页面每次加载最多出现一次，pointer-events:none 不阻断阅读。
   首页 / 列表页 / 404 页不引入本脚本，故不会触发。
   ============================================================ */
(function () {
  'use strict';

  /* 仅文章阅读页触发：没有正文容器就直接退出 */
  var articleBody = document.querySelector('.article-body');
  if (!articleBody) return;

  var QUOTES = [
    '你已经读到这里啦，今天也辛苦了。',
    '慢一点也没关系，路会自己长出来的。',
    '所有熬过去的夜晚，都会变成你的星光。',
    '不必事事圆满，你愿意继续就已经很好。',
    '生活偶尔失焦，但你一直都很清晰。',
    '风会记得每一朵花的香，也会记得你的努力。',
    '允许自己休息，这不是偷懒，是充电。',
    '你走过的每一步，都算数。',
    '世界很大，但你此刻的安静也值得被珍惜。',
    '把心事放下一点，夜色会替你收好。',
    '没关系的，天亮之前，星星都在替你守夜。',
    '愿你今天也能被温柔以待，包括被自己。',
    '答案不急着来，先把日子过得暖一点。',
    '谢谢你认真读完了，晚安，好梦。'
  ];

  var reduceMotion = false;
  try {
    reduceMotion = !!(window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  } catch (e) { /* 忽略 */ }

  var revealed = false;
  var ticking = false;

  /* ---------- 构建彩蛋节点（无需改动页面 HTML 结构） ---------- */
  var egg = document.createElement('div');
  egg.className = 'reading-egg';
  egg.setAttribute('role', 'status');
  egg.setAttribute('aria-live', 'polite');

  var quoteEl = document.createElement('p');
  quoteEl.className = 'reading-egg-quote';

  var signEl = document.createElement('span');
  signEl.className = 'reading-egg-sign';
  signEl.textContent = '—— 读到这里的你，辛苦了';

  egg.appendChild(quoteEl);
  egg.appendChild(signEl);
  document.body.appendChild(egg);

  /* ---------- 行为 ---------- */
  function randomQuote() {
    return QUOTES[Math.floor(Math.random() * QUOTES.length)];
  }

  function leave() {
    egg.classList.remove('is-visible');
    egg.classList.add('is-leaving');
    window.setTimeout(function () {
      egg.classList.remove('is-leaving');
    }, 700);
  }

  function reveal() {
    if (revealed) return;
    revealed = true;
    detach();
    quoteEl.textContent = randomQuote();
    egg.classList.add('is-visible');
    window.setTimeout(leave, reduceMotion ? 4600 : 6200);
  }

  function nearEnd() {
    var doc = document.documentElement;
    var scrollTop = window.pageYOffset || doc.scrollTop || 0;
    if (scrollTop < 360) return false;              /* 还没开始读，不打扰 */
    var total = Math.max(
      document.body.scrollHeight, doc.scrollHeight,
      document.body.offsetHeight, doc.offsetHeight
    );
    var scrollable = total - window.innerHeight;
    if (scrollable < 480) return false;             /* 内容太短，谈不上"尽头" */
    return (scrollable - scrollTop) <= 160;         /* 距底部 160px 内 */
  }

  function onScroll() {
    if (revealed || ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      ticking = false;
      if (nearEnd()) reveal();
    });
  }

  function attach() {
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
  }

  function detach() {
    window.removeEventListener('scroll', onScroll);
    window.removeEventListener('resize', onScroll);
  }

  attach();
  /* 直接访问带锚点/已停在底部的场景兜底检查一次 */
  window.setTimeout(onScroll, 600);
})();
