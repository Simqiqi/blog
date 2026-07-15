// ===== 粒子背景 =====
(function() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let w, h;
  const particles = [];
  const count = 60;
  const connectionDist = 120;

  function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = window.innerHeight;
  }

  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 1.2 + 0.4,
    });
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);

    for (let i = 0; i < count; i++) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = w;
      if (p.x > w) p.x = 0;
      if (p.y < 0) p.y = h;
      if (p.y > h) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 255, 0.35)';
      ctx.fill();
    }

    // 连线
    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = `rgba(0, 229, 255, ${0.06 * (1 - dist / connectionDist)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  draw();
})();

// 微信二维码弹窗
function showWechat() {
  document.getElementById('wechatModal').classList.add('active');
}
function hideWechat() {
  document.getElementById('wechatModal').classList.remove('active');
}

// ===== 打字机效果语录 =====
(function() {
  const quotes = [
    '保持好奇，保持愚蠢。',
    '生活不是竞速，偶尔迷路也没关系。',
    '种一棵树最好的时间是十年前，其次是现在。',
    '世界是自己的，与他人毫无关系。',
    '所有的为时已晚，其实都是恰逢其时。',
    '与其互为人间，不如自成宇宙。',
    '慢慢来，会更快。',
    '山海自有归期，风雨自有相逢。',
  ];

  const el = document.getElementById('heroQuote');
  if (!el) return;

  const quote = quotes[Math.floor(Math.random() * quotes.length)];
  let i = 0;

  function type() {
    if (i < quote.length) {
      el.innerHTML = quote.slice(0, i + 1) + '<span class="cursor"></span>';
      i++;
      const delay = 60 + Math.random() * 80;
      setTimeout(type, delay);
    }
  }

  type();
})();

// ===== 在线天数 =====
(function() {
  const el = document.getElementById('daysCount');
  if (!el) return;
  const start = new Date('2026-07-15');
  const now = new Date();
  const days = Math.max(1, Math.floor((now - start) / (1000 * 60 * 60 * 24)));
  el.textContent = days;
})();

// ===== 滚动渐显 =====
(function() {
  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.recent-posts, .interests, .say-hi').forEach(function(el) {
    el.classList.add('reveal');
    observer.observe(el);
  });
})();
