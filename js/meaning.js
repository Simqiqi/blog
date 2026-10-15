/**
 * 人生意义页 · 苹果式滚动叙事
 * 滚动进度驱动 sticky 舞台内各场景的连续淡入/位移/缩放，
 * 实现「滑动页面后新内容才出现」的效果。
 */
(function meaningScroll() {
  const stage = document.getElementById('scrollStage');
  const sticky = stage && stage.querySelector('.scroll-sticky');
  const scenes = stage ? Array.from(stage.querySelectorAll('.scene')) : [];
  const dotsWrap = document.getElementById('stageDots');
  const hint = document.getElementById('scrollHint');
  const outro = document.getElementById('meaningOutro');
  if (!stage || !scenes.length) return;

  const N = scenes.length;

  /* 生成进度圆点 */
  let dots = [];
  if (dotsWrap) {
    dotsWrap.innerHTML = scenes.map(() => '<span class="dot"></span>').join('');
    dots = Array.from(dotsWrap.querySelectorAll('.dot'));
  }

  /* 星点背景（一次性生成，避免重排） */
  const stars = document.querySelector('.meaning-stars');
  if (stars && !stars.dataset.filled) {
    const count = 60;
    let shadow = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 100);
      const y = Math.floor(Math.random() * 100);
      const o = (Math.random() * 0.5 + 0.2).toFixed(2);
      shadow.push(`${x}vw ${y}vh 0 rgba(255,255,255,${o})`);
    }
    stars.style.boxShadow = shadow.join(',');
    stars.style.width = '2px';
    stars.style.height = '2px';
    stars.style.borderRadius = '50%';
    stars.dataset.filled = '1';
  }

  let ticking = false;
  function update() {
    ticking = false;
    const rect = stage.getBoundingClientRect();
    const total = stage.offsetHeight - window.innerHeight;
    let p = total > 0 ? (-rect.top) / total : 0;
    p = Math.min(1, Math.max(0, p));

    const fade = 0.32; // 每幕进出淡入淡出占比
    scenes.forEach((sc, i) => {
      const segStart = i / N;
      const segEnd = (i + 1) / N;
      let local = (p - segStart) / (segEnd - segStart);
      local = Math.min(1, Math.max(0, local));

      let op;
      if (local < fade) op = local / fade;
      else if (local > 1 - fade && i < N - 1) op = (1 - local) / fade;
      else op = 1;

      const ty = (1 - op) * 46;          // 进入时从下方 46px 上浮
      const scale = 0.95 + op * 0.05;
      sc.style.opacity = op.toFixed(3);
      sc.style.transform = `translate(-50%, calc(-50% + ${ty.toFixed(1)}px)) scale(${scale.toFixed(3)})`;
    });

    const active = Math.min(N - 1, Math.floor(p * N + 0.0001));
    dots.forEach((d, i) => d.classList.toggle('on', i === active));

    // 滚动提示：离开首屏后淡出
    if (hint) hint.style.opacity = (window.scrollY > window.innerHeight * 0.4) ? '0' : '';
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  update();

  /* 收尾段进场 */
  if (outro) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          outro.classList.add('in');
          io.unobserve(outro);
        }
      });
    }, { threshold: 0.25 });
    io.observe(outro);
  }
})();
