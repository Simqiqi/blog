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

// ===== 统计数字动画 =====
(function() {
  const nums = document.querySelectorAll('.stat-num');
  if (!nums.length) return;

  const observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.textContent);
      if (isNaN(target)) return;
      const duration = 1200;
      const start = performance.now();

      function tick(now) {
        const elapsed = now - start;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(target * eased);
        if (progress < 1) requestAnimationFrame(tick);
        else el.textContent = target;
      }

      requestAnimationFrame(tick);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });

  nums.forEach(function(el) { observer.observe(el); });
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

// ===== 鼠标跟随光晕 =====
(function() {
  var spotlight = document.getElementById('spotlight');
  if (!spotlight) return;

  document.addEventListener('mousemove', function(e) {
    spotlight.style.left = e.clientX + 'px';
    spotlight.style.top = e.clientY + 'px';
    spotlight.style.opacity = '1';
  });
})();

// ===== Hero Card 3D 倾斜 =====
(function() {
  var hero = document.querySelector('.hero');
  var card = document.querySelector('.hero-card');
  if (!hero || !card) return;

  hero.addEventListener('mousemove', function(e) {
    var rect = hero.getBoundingClientRect();
    var x = e.clientX - rect.left;
    var y = e.clientY - rect.top;

    var centerX = rect.width / 2;
    var centerY = rect.height / 2;

    var rotateY = ((x - centerX) / centerX) * 5;
    var rotateX = -((y - centerY) / centerY) * 5;

    card.style.transform = 'rotateY(' + rotateY + 'deg) rotateX(' + rotateX + 'deg)';
  });

  hero.addEventListener('mouseleave', function() {
    card.style.transform = 'rotateY(0deg) rotateX(0deg)';
  });
})();

// ===== 回到顶部 =====
(function() {
  var btn = document.getElementById('backToTop');
  if (!btn) return;

  window.addEventListener('scroll', function() {
    if (window.scrollY > 400) {
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  });

  btn.addEventListener('click', function() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
