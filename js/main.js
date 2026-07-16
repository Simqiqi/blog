/**
 * 柒柒的博客 - 主脚本
 * 功能：3D书架、时光隧道时间线、星光手写签名板
 *       + 入场动画、锦鲤、头像震动、滚动入场等
 */

/* ==================== 2. 3D 书架文章展示 ==================== */
(function bookshelf3D() {
  const shelf = document.getElementById('bookshelf');
  if (!shelf) return;
  const wrapper = shelf.querySelector('.bookshelf-wrapper');
  const booksContainer = shelf.querySelector('.books-list');

  const posts = [
    { title: '我的第一篇博客', date: '2026-07-01', excerpt: '你好世界，这是我的个人博客的第一篇文章，记录生活的点滴。', url: 'blog.html', color: '#6366f1' },
    { title: '关于独立开发', date: '2026-07-05', excerpt: '独立开发者的心路历程，从零到一的创造之旅。', url: 'blog.html', color: '#f59e0b' },
    { title: '旅行摄影笔记', date: '2026-07-10', excerpt: '带着相机去探索未知，每一帧都是独特的风景。', url: 'blog.html', color: '#10b981' },
    { title: 'AI 与创作', date: '2026-07-14', excerpt: '探索 AI 辅助写作的边界，人与机器的共创实验。', url: 'blog.html', color: '#ec4899' },
    { title: '跑步随想', date: '2026-07-16', excerpt: '清晨 5 公里的思绪漫游，身体与心灵的双重对话。', url: 'blog.html', color: '#8b5cf6' },
  ];

  booksContainer.innerHTML = posts.map((p, i) => `
    <div class="book-item" style="--book-color:${p.color};--book-i:${i};" data-url="${p.url}">
      <div class="book-spine"></div>
      <div class="book-cover">
        <div class="book-cover-front">
          <span class="book-icon"><i class="fa-solid fa-book-open"></i></span>
          <h4 class="book-title">${p.title}</h4>
          <span class="book-date">${p.date}</span>
        </div>
        <div class="book-cover-back">
          <p>${p.excerpt}</p>
          <span class="book-read">翻开阅读 →</span>
        </div>
      </div>
      <div class="book-pages"></div>
    </div>
  `).join('');

  // 复制一份用于无缝滚动
  booksContainer.innerHTML += booksContainer.innerHTML;

  let isDragging = false, startX = 0, scrollLeft = 0;
  let rotateY = 0;
  const maxRotate = 5;

  // Mouse events
  wrapper.addEventListener('mousedown', (e) => {
    isDragging = true; startX = e.pageX; scrollLeft = wrapper.scrollLeft;
    wrapper.style.cursor = 'grabbing';
  });
  wrapper.addEventListener('mouseleave', () => { isDragging = false; wrapper.style.cursor = 'grab'; });
  wrapper.addEventListener('mouseup', (e) => { isDragging = false; wrapper.style.cursor = 'grab';
    const book = e.target.closest('.book-item');
    if (book && Math.abs(e.pageX - startX) < 5) {
      book.classList.toggle('book-open');
    }
  });
  wrapper.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const dx = e.pageX - startX;
    wrapper.scrollLeft = scrollLeft - dx;
    rotateY = Math.max(-maxRotate, Math.min(maxRotate, dx * 0.05));
    booksContainer.style.transform = `rotateY(${rotateY}deg)`;
  });

  // Touch events
  wrapper.addEventListener('touchstart', (e) => {
    startX = e.touches[0].pageX; scrollLeft = wrapper.scrollLeft;
  }, {passive: true});
  wrapper.addEventListener('touchmove', (e) => {
    const dx = e.touches[0].pageX - startX;
    rotateY = Math.max(-maxRotate, Math.min(maxRotate, dx * 0.05));
    booksContainer.style.transform = `rotateY(${rotateY}deg)`;
  }, {passive: true});
  wrapper.addEventListener('touchend', () => {
    booksContainer.style.transform = 'rotateY(0deg)';
  });

  // Click to open book
  booksContainer.addEventListener('click', (e) => {
    const book = e.target.closest('.book-item');
    if (book && Math.abs(e.pageX - startX) < 5) {
      book.classList.toggle('book-open');
    }
  });
})();


/* ==================== 3. 时光隧道时间线 ==================== */
(function timeTunnel() {
  const tunnel = document.getElementById('timeTunnel');
  if (!tunnel) return;
  const track = tunnel.querySelector('.tunnel-track');
  const particlesCanvas = tunnel.querySelector('.tunnel-particles');
  const ctx = particlesCanvas ? particlesCanvas.getContext('2d') : null;

  const items = [
    { time: '2026.07', title: '博客诞生', desc: '从零搭建个人博客，记录生活与思考。', icon: 'fa-rocket' },
    { time: '2026.07', title: '独立开发', desc: '开始独立开发项目，享受创造的乐趣。', icon: 'fa-code' },
    { time: '2026.06', title: '摄影之旅', desc: '拿起相机，用镜头捕捉世界的美好瞬间。', icon: 'fa-camera' },
    { time: '2026.05', title: '写作之路', desc: '重新拾起笔，文字的疗愈力量让我着迷。', icon: 'fa-pen' },
    { time: '2026.04', title: 'AI 探索', desc: '深入探索 AI 技术边界，思考人与机器的关系。', icon: 'fa-robot' },
    { time: '2026.03', title: '跑步习惯', desc: '开始坚持每天 5 公里，身体是革命的本钱。', icon: 'fa-person-running' },
    { time: '2026.01', title: '新起点', desc: '新的一年，新的开始。种下一棵树最好的时间是现在。', icon: 'fa-seedling' },
  ];

  track.innerHTML = items.map((item, i) => `
    <div class="tunnel-card" style="--card-i:${i};">
      <div class="tunnel-card-inner">
        <div class="tunnel-icon"><i class="fa-solid ${item.icon}"></i></div>
        <div class="tunnel-content">
          <span class="tunnel-time">${item.time}</span>
          <h4>${item.title}</h4>
          <p>${item.desc}</p>
        </div>
      </div>
      <div class="tunnel-glow"></div>
    </div>
  `).join('');

  // Particles on tunnel wall
  if (ctx && particlesCanvas) {
    particlesCanvas.width = particlesCanvas.offsetWidth;
    particlesCanvas.height = particlesCanvas.offsetHeight;
    const particles = [];
    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * particlesCanvas.width,
        y: Math.random() * particlesCanvas.height,
        r: Math.random() * 2 + 1,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.3
      });
    }

    let animId;
    function animate() {
      ctx.clearRect(0, 0, particlesCanvas.width, particlesCanvas.height);
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = particlesCanvas.width;
        if (p.x > particlesCanvas.width) p.x = 0;
        if (p.y < 0) p.y = particlesCanvas.height;
        if (p.y > particlesCanvas.height) p.y = 0;

        const scrollPct = tunnel.scrollTop / (tunnel.scrollHeight - tunnel.clientHeight);
        const z = (p.y / particlesCanvas.height);
        const flow = scrollPct * 2;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r + flow * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(126,200,248,${p.opacity * (0.4 + scrollPct * 0.6)})`;
        ctx.fill();
      });
      animId = requestAnimationFrame(animate);
    }
    animate();

    // Resize
    window.addEventListener('resize', () => {
      particlesCanvas.width = particlesCanvas.offsetWidth;
      particlesCanvas.height = particlesCanvas.offsetHeight;
    });
  }
})();


/* ==================== 4. 星光手写签名板 ==================== */
(function starSignCanvas() {
  const canvas = document.getElementById('starCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H;
  let drawing = false;
  let points = [];
  let stars = [];
  let disperseTimer = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
  }

  resize();
  window.addEventListener('resize', resize);

  // Initialize background stars
  function initBgStars() {
    stars = [];
    for (let i = 0; i < 80; i++) {
      stars.push({
        x: Math.random() * W,
        y: Math.random() * H,
        r: Math.random() * 1.5 + 0.5,
        twinkle: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.02 + 0.01,
        opacity: Math.random() * 0.5 + 0.3
      });
    }
  }
  initBgStars();

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
      return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
    }
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Draw background stars
    stars.forEach(s => {
      s.twinkle += s.speed;
      const alpha = s.opacity * (0.5 + 0.5 * Math.sin(s.twinkle));
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.fill();
      // Glow
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(180,200,255,${alpha * 0.3})`;
      ctx.fill();
    });

    // Draw user points (star trail)
    if (points.length > 0) {
      points.forEach((pt) => {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.r + (pt.age || 0) * 0.3, 0, Math.PI * 2);
        const alpha = pt.dispersing ? Math.max(0, pt.opacity || 0) : 0.9;
        ctx.fillStyle = `rgba(255,255,200,${alpha})`;
        ctx.fill();
        ctx.shadowColor = 'rgba(200,220,255,0.8)';
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });
    }

    requestAnimationFrame(draw);
  }

  function addPoint(x, y) {
    points.push({
      x, y,
      r: Math.random() * 2.5 + 1.5,
      age: 0,
      dispersing: false,
      opacity: 1
    });
    // Cap trail length
    if (points.length > 300) points.shift();
  }

  function startDisperse() {
    points.forEach(pt => {
      pt.dispersing = true;
      pt.vx = (Math.random() - 0.5) * 2;
      pt.vy = (Math.random() - 1) * 2 - 1;
    });

    function animateDisperse() {
      let allGone = true;
      points.forEach(pt => {
        if (pt.dispersing && pt.opacity > 0) {
          pt.x += pt.vx;
          pt.y += pt.vy;
          pt.opacity -= 0.015;
          pt.vy -= 0.01; // upward bias
          if (pt.opacity > 0) allGone = false;
        }
      });
      if (!allGone) {
        requestAnimationFrame(animateDisperse);
      } else {
        points = [];
      }
    }
    animateDisperse();
  }

  // Events
  canvas.addEventListener('mousedown', (e) => {
    drawing = true;
    if (disperseTimer) { clearTimeout(disperseTimer); disperseTimer = null; }
    const pos = getPos(e);
    addPoint(pos.x, pos.y);
  });
  canvas.addEventListener('mousemove', (e) => {
    if (!drawing) return;
    const pos = getPos(e);
    addPoint(pos.x, pos.y);
  });
  canvas.addEventListener('mouseup', () => {
    drawing = false;
    disperseTimer = setTimeout(() => { startDisperse(); disperseTimer = null; }, 2000);
  });
  canvas.addEventListener('mouseleave', () => {
    if (drawing) {
      drawing = false;
      disperseTimer = setTimeout(() => { startDisperse(); disperseTimer = null; }, 2000);
    }
  });

  // Touch
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    drawing = true;
    if (disperseTimer) { clearTimeout(disperseTimer); disperseTimer = null; }
    const pos = getPos(e);
    addPoint(pos.x, pos.y);
  });
  canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!drawing) return;
    const pos = getPos(e);
    addPoint(pos.x, pos.y);
  });
  canvas.addEventListener('touchend', (e) => {
    e.preventDefault();
    drawing = false;
    disperseTimer = setTimeout(() => { startDisperse(); disperseTimer = null; }, 2000);
  });

  draw();
})();


/* ==================== 保留：入场动画 ==================== */
(function entranceAnimation() {
  const hero = document.querySelector('.hero');
  if (!hero) return;
  // 延迟触发入场动画
  setTimeout(() => {
    hero.classList.add('hero-entrance-active');
  }, 300);
})();


/* ==================== 保留：锦鲤 ==================== */
(function koiFish() {
  const container = document.querySelector('.koi-container');
  if (!container) return;
  // 锦鲤在 CSS 中通过动画实现，这里只需要确保容器存在
  // 动态切换方向
  const svg = container.querySelector('.koi-svg');
  if (svg) {
    svg.addEventListener('animationiteration', () => {
      // CSS animation 已处理方向切换
    });
  }
})();


/* ==================== 保留：头像震动 ==================== */
(function avatarShake() {
  const wrapper = document.getElementById('avatarWrapper');
  if (!wrapper) return;

  let clickCount = 0;
  let clickTimer = null;

  wrapper.addEventListener('click', () => {
    clickCount++;
    if (clickCount >= 5) {
      wrapper.classList.add('avatar-bounce');
      spawnBurstParticles(wrapper);
      clickCount = 0;
    } else {
      wrapper.classList.add('avatar-shaking');
    }

    if (clickTimer) clearTimeout(clickTimer);
    clickTimer = setTimeout(() => { clickCount = 0; }, 800);

    setTimeout(() => {
      wrapper.classList.remove('avatar-shaking', 'avatar-bounce');
    }, 600);
  });

  function spawnBurstParticles(el) {
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    for (let i = 0; i < 12; i++) {
      const p = document.createElement('div');
      p.className = 'avatar-burst';
      p.style.left = cx + 'px';
      p.style.top = cy + 'px';
      const angle = (Math.PI * 2 * i) / 12;
      const dist = 40 + Math.random() * 30;
      p.style.setProperty('--bx', Math.cos(angle) * dist + 'px');
      p.style.setProperty('--by', Math.sin(angle) * dist + 'px');
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 700);
    }
  }
})();


/* ==================== 保留：滚动入场 ==================== */
(function scrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed', 'visible');
        // 技能条动画
        const fills = entry.target.querySelectorAll('.skill-fill');
        fills.forEach(f => {
          const w = f.dataset.width || f.style.width;
          f.style.width = w || '0%';
        });
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal, .reveal').forEach(el => observer.observe(el));
})();


/* ==================== 保留：滚动进度条 ==================== */
(function progressBar() {
  const bar = document.getElementById('progressBar');
  if (!bar) return;
  window.addEventListener('scroll', () => {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    bar.style.width = pct + '%';
  });
})();


/* ==================== 保留：回到顶部按钮 ==================== */
(function backToTop() {
  const btn = document.getElementById('backToTop');
  const rocket = document.getElementById('rocketToTop');
  if (!btn && !rocket) return;

  window.addEventListener('scroll', () => {
    const show = window.scrollY > 400;
    if (btn) btn.classList.toggle('visible', show);
    if (rocket) rocket.classList.toggle('visible', show);
  });

  function scrollTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // 火箭粒子
    if (rocket) {
      const rect = rocket.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      for (let i = 0; i < 10; i++) {
        const p = document.createElement('div');
        p.className = 'rocket-particle';
        p.style.left = cx + 'px';
        p.style.top = cy + 'px';
        p.style.setProperty('--rx', (Math.random() - 0.5) * 60 + 'px');
        p.style.setProperty('--ry', -(20 + Math.random() * 40) + 'px');
        document.body.appendChild(p);
        setTimeout(() => p.remove(), 700);
      }
    }
  }
  if (btn) btn.addEventListener('click', scrollTop);
  if (rocket) rocket.addEventListener('click', scrollTop);
})();


/* ==================== 保留：滚动提示隐藏 ==================== */
(function scrollHint() {
  const hint = document.querySelector('.scroll-hint');
  if (!hint) return;
  window.addEventListener('scroll', () => {
    hint.classList.toggle('hidden', window.scrollY > 100);
  });
})();


/* ==================== 保留：微信二维码弹窗 ==================== */
function showWechat() {
  document.getElementById('wechatModal').classList.add('active');
}
function hideWechat() {
  document.getElementById('wechatModal').classList.remove('active');
}


/* ==================== 保留：打字机效果 ==================== */
(function typewriter() {
  const el = document.getElementById('typewriterText');
  const cursor = document.getElementById('typewriterCursor');
  if (!el || !cursor) return;
  const texts = ['全栈开发者', '摄影爱好者', '文字记录者', '终身学习者'];
  let textIdx = 0, charIdx = 0, isDeleting = false;

  function tick() {
    const current = texts[textIdx];
    if (isDeleting) {
      el.textContent = current.substring(0, charIdx - 1);
      charIdx--;
    } else {
      el.textContent = current.substring(0, charIdx + 1);
      charIdx++;
    }
    cursor.style.display = 'inline-block';

    let speed = isDeleting ? 40 : 100;
    if (!isDeleting && charIdx === current.length) {
      speed = 2000;
      isDeleting = true;
    } else if (isDeleting && charIdx === 0) {
      isDeleting = false;
      textIdx = (textIdx + 1) % texts.length;
      speed = 400;
    }
    setTimeout(tick, speed);
  }
  tick();
})();


/* ==================== 保留：状态文本 ==================== */
(function statusText() {
  const el = document.getElementById('statusText');
  if (!el) return;
  const statuses = ['赶 ddl', '写代码', '喝咖啡', '在发呆', '拍照片', '看星星', '跑步中', '看书', '思考人生'];
  let idx = 0;
  setInterval(() => {
    idx = (idx + 1) % statuses.length;
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = statuses[idx]; el.style.opacity = '1'; }, 350);
  }, 4000);
})();


/* ==================== 保留：实时时钟 ==================== */
(function liveClock() {
  const clockEl = document.getElementById('liveClock');
  const dateEl = document.getElementById('liveDate');
  const navClockEl = document.getElementById('navClock');
  if (!clockEl && !navClockEl) return;

  function update() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0');
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    const timeStr = `${h}:${m}:${s}`;
    if (clockEl) clockEl.textContent = timeStr;
    if (navClockEl) navClockEl.textContent = `${h}:${m}`;

    if (dateEl) {
      const days = ['日','一','二','三','四','五','六'];
      dateEl.textContent = `${now.getFullYear()}.${String(now.getMonth()+1).padStart(2,'0')}.${String(now.getDate()).padStart(2,'0')} 星期${days[now.getDay()]}`;
    }

    // 心情图标
    const mood = document.getElementById('liveMood');
    if (mood) {
      const moods = ['🌙','🌅','☀️','☁️','⛅','🌧️','🌈','✨','🌙'];
      mood.textContent = moods[now.getHours() % 9];
    }
  }
  update();
  setInterval(update, 1000);
})();


/* ==================== 保留：此刻换签 ==================== */
(function momentCard() {
  const card = document.getElementById('momentCard');
  if (!card) return;
  const words = document.getElementById('liveWords');
  if (!words) return;

  const quotes = [
    '正在安静的角落里认真生活',
    '今天也是被代码治愈的一天',
    '咖啡是成年人白天的酒',
    '在努力成为一个温柔的人',
    '记录是抵抗遗忘的最好方式',
    '做自己喜欢的事，就不算浪费时间',
    '保持好奇心，世界会更大',
    '每一个平凡的日子都值得被记录',
    '星光不负赶路人',
  ];

  card.addEventListener('click', () => {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    words.style.opacity = '0';
    setTimeout(() => { words.textContent = q; words.style.opacity = '1'; }, 300);
  });
})();


/* ==================== 保留：在线天数 ==================== */
(function daysCount() {
  const el = document.getElementById('daysCount');
  if (!el) return;
  const start = new Date('2026-01-01');
  const days = Math.floor((Date.now() - start) / 86400000);
  el.textContent = days;
})();


/* ==================== 保留：网站运行时间 ==================== */
(function siteRuntime() {
  const el = document.getElementById('siteRuntime');
  if (!el) return;
  const start = new Date('2026-07-01');
  function update() {
    const diff = Date.now() - start;
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    el.textContent = `本站已运行 ${days} 天 ${hours} 小时 ${mins} 分钟`;
  }
  update();
  setInterval(update, 60000);
})();


/* ==================== 保留：访客足迹 ==================== */
(function visitorTrail() {
  const el = document.getElementById('trailText');
  if (!el) return;
  const trails = [
    '某个深夜，有人在这里看了很久',
    '一位远方而来的旅人刚刚到访',
    '有位程序员在这里找到了共鸣',
    '来自另一个城市的读者留下足迹',
    '安静的访客默默浏览了所有文章',
  ];
  setInterval(() => {
    const t = trails[Math.floor(Math.random() * trails.length)];
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = t; el.style.opacity = '0.55'; }, 500);
  }, 8000);
})();


/* ==================== 保留：搜索 ==================== */
(function searchUI() {
  const toggle = document.getElementById('searchToggle');
  const dropdown = document.getElementById('searchDropdown');
  const input = document.getElementById('searchInput');
  if (!toggle || !dropdown) return;

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) input.focus();
  });

  document.addEventListener('click', (e) => {
    if (!dropdown.contains(e.target) && !toggle.contains(e.target)) {
      dropdown.classList.remove('active');
    }
  });
})();


/* ==================== 保留：主题切换 ==================== */
(function themeToggle() {
  const btn = document.getElementById('themeToggle');
  if (!btn) return;

  btn.addEventListener('click', () => {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';
    document.documentElement.setAttribute('data-theme', isLight ? 'dark' : 'light');
    localStorage.setItem('theme', isLight ? 'dark' : 'light');
  });

  // 读取本地存储
  const saved = localStorage.getItem('theme');
  if (saved) document.documentElement.setAttribute('data-theme', saved);
})();


/* ==================== 保留：滚动弹性回弹 ==================== */
(function scrollBounce() {
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(() => {
        const nearBottom = window.innerHeight + window.scrollY >= document.body.offsetHeight - 120;
        if (nearBottom) {
          document.body.classList.add('bounce-end');
          setTimeout(() => document.body.classList.remove('bounce-end'), 500);
        }
        ticking = false;
      });
      ticking = true;
    }
  });
})();


/* ==================== 保留：标签云呼吸 ==================== */
(function tagCloud() {
  const tags = document.querySelectorAll('.tag-cloud .tag');
  if (!tags.length) return;
  let idx = 0;
  setInterval(() => {
    tags.forEach(t => t.classList.remove('breathing'));
    tags[idx].classList.add('breathing');
    idx = (idx + 1) % tags.length;
  }, 1500);
})();


/* ==================== 保留：导航栏 ==================== */
(function navbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
})();


/* ==================== 保留：音乐播放器 ==================== */
(function musicPlayer() {
  var toggle = document.getElementById('musicToggle');
  var panel = document.getElementById('musicPanel');
  var playBtn = document.getElementById('musicPlay');
  var prevBtn = document.getElementById('musicPrev');
  var nextBtn = document.getElementById('musicNext');
  var volSlider = document.getElementById('volumeSlider');
  var trackName = document.getElementById('trackName');
  var trackMood = document.getElementById('trackMood');
  if (!toggle || !panel) return;

  // ============================================================
  // 用 Web Audio API 生成环境氛围音乐（无需外部音频文件）
  // ============================================================
  var ctx = null, masterGain = null, oscillators = [], playing = false;
  var trackIdx = 0;

  // 氛围音乐预设：音阶、情绪
  var tracks = [
    { name: '星空漫步', mood: '安静 · 治愈', freqs: [261.6, 329.6, 392.0, 523.2], delay: 2.2 },
    { name: '雨后清晨', mood: '清新 · 放松', freqs: [293.7, 349.2, 440.0, 587.3], delay: 1.8 },
    { name: '海浪低语', mood: '温柔 · 冥想', freqs: [196.0, 246.9, 329.6, 392.0], delay: 2.8 },
    { name: '萤火之森', mood: '梦幻 · 自然', freqs: [349.2, 440.0, 523.2, 659.3], delay: 1.5 },
    { name: '月光独白', mood: '沉静 · 舒缓', freqs: [220.0, 277.2, 329.6, 440.0], delay: 3.0 },
  ];

  function stopAllNotes() {
    oscillators.forEach(function(o) {
      try { o.osc.stop(); o.osc.disconnect(); } catch(e) {}
      if (o.timer) clearTimeout(o.timer);
    });
    oscillators = [];
  }

  function startAmbient() {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      masterGain = ctx.createGain();
      masterGain.gain.value = parseFloat(volSlider ? volSlider.value : 0.15);
      masterGain.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();

    stopAllNotes();
    var t = tracks[trackIdx];
    var baseTime = ctx.currentTime;

    t.freqs.forEach(function(freq, i) {
      var osc = ctx.createOscillator();
      var gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.value = 0;

      // 淡入
      gain.gain.linearRampToValueAtTime(0.06, baseTime + i * 0.5 + 0.3);
      // 持续
      gain.gain.setValueAtTime(0.06, baseTime + i * 0.5 + 0.3 + t.delay);
      // 循环淡出淡入
      scheduleLoop(gain, baseTime + i * 0.5 + 0.3 + t.delay, t.delay);

      osc.connect(gain);
      gain.connect(masterGain);
      osc.start(baseTime + i * 0.5);
      oscillators.push({ osc: osc, gain: gain, timer: null });
    });
  }

  function scheduleLoop(gainNode, startTime, period) {
    function loop() {
      var now = ctx.currentTime;
      if (now < startTime) {
        oscillators.forEach(function(o) {
          if (o.gain === gainNode && !o.timer) {
            o.timer = setTimeout(loop, (startTime - now) * 1000);
          }
        });
        return;
      }
      gainNode.gain.linearRampToValueAtTime(0.02, now + period * 0.3);
      gainNode.gain.linearRampToValueAtTime(0.06, now + period);
      oscillators.forEach(function(o) {
        if (o.gain === gainNode) o.timer = setTimeout(loop, period * 1000);
      });
    }
    loop();
  }

  function play() {
    if (playing) return;
    playing = true;
    startAmbient();
    playBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    toggle.classList.add('playing');
  }

  function pause() {
    if (!playing) return;
    playing = false;
    stopAllNotes();
    playBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    toggle.classList.remove('playing');
  }

  // 播放/暂停
  playBtn.addEventListener('click', function() {
    if (playing) pause(); else play();
  });

  // 上一首
  prevBtn.addEventListener('click', function() {
    trackIdx = (trackIdx - 1 + tracks.length) % tracks.length;
    trackName.textContent = tracks[trackIdx].name;
    trackMood.textContent = tracks[trackIdx].mood;
    if (playing) { stopAllNotes(); startAmbient(); }
  });

  // 下一首
  nextBtn.addEventListener('click', function() {
    trackIdx = (trackIdx + 1) % tracks.length;
    trackName.textContent = tracks[trackIdx].name;
    trackMood.textContent = tracks[trackIdx].mood;
    if (playing) { stopAllNotes(); startAmbient(); }
  });

  // 音量
  volSlider.addEventListener('input', function() {
    if (masterGain) masterGain.gain.value = parseFloat(volSlider.value);
  });

  // 面板开关
  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    panel.classList.toggle('open');
  });
  document.addEventListener('click', function(e) {
    if (!panel.contains(e.target) && !toggle.contains(e.target)) {
      panel.classList.remove('open');
    }
  });
})();


/* ==================== 保留：鼠标光晕 ==================== */
(function spotlight() {
  const el = document.getElementById('spotlight');
  if (!el) return;
  document.addEventListener('mousemove', (e) => {
    el.style.opacity = '1';
    el.style.left = e.clientX + 'px';
    el.style.top = e.clientY + 'px';
  });
})();


/* ==================== 保留：3D 卡片倾斜 ==================== */
(function cardTilt() {
  document.querySelectorAll('.hero-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const cx = rect.width / 2, cy = rect.height / 2;
      const rotateX = ((y - cy) / cy) * -6;
      const rotateY = ((x - cx) / cx) * 6;
      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0)';
    });
  });
})();


/* ==================== 保留：粒子背景 ==================== */
(function bgParticles() {
  const canvas = document.getElementById('particles');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];

  function resize() {
    W = canvas.width = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  for (let i = 0; i < 50; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.5 + 0.5,
      opacity: Math.random() * 0.4 + 0.1
    });
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0,229,255,${p.opacity})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();


/* ==================== 保留：头条跑马灯 ==================== */
(function marquee() {
  const track = document.querySelector('.marquee-track');
  if (!track) return;
  const items = [
    '欢迎来到柒柒的个人博客', '保持好奇心', '探索世界',
    '记录生活', '代码改变世界', 'Stay hungry, stay foolish'
  ];
  const html = items.map(t => `<span>${t}</span><span class="marquee-sep">✦</span>`).join('');
  track.innerHTML = html + html;
})();


/* ==================== 保留：导航一言 ==================== */
(function navMotto() {
  const el = document.getElementById('navMotto');
  if (!el) return;
  const mottos = ['今天也是元气满满', '星光不负赶路人', '活得像个孩子', '慢慢来，比较快', '保持热爱'];
  let i = 0;
  setInterval(() => {
    i = (i + 1) % mottos.length;
    el.style.opacity = '0';
    setTimeout(() => { el.textContent = mottos[i]; el.style.opacity = '0.55'; }, 500);
  }, 6000);
  el.textContent = mottos[0];
})();

/* ==================== 页面淡入 ==================== */
document.documentElement.style.opacity = '1';
