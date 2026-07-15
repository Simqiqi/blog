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

// ===== 滚动进度条 + 导航栏模糊 + 提示隐藏 =====
(function() {
  var bar = document.getElementById('progressBar');
  var nav = document.querySelector('.navbar');
  var hint = document.querySelector('.scroll-hint');

  window.addEventListener('scroll', function() {
    var docH = document.documentElement.scrollHeight - window.innerHeight;
    var scrolled = window.scrollY;
    var pct = docH > 0 ? (scrolled / docH) * 100 : 0;
    if (bar) bar.style.width = Math.min(pct, 100) + '%';

    if (nav) {
      if (scrolled > 10) nav.classList.add('scrolled');
      else nav.classList.remove('scrolled');
    }

    if (hint) {
      if (scrolled > 80) hint.classList.add('hidden');
      else hint.classList.remove('hidden');
    }
  });
})();

// ===== 实时时钟 =====
(function() {
  var clock = document.getElementById('liveClock');
  var dateEl = document.getElementById('liveDate');
  var moodEl = document.getElementById('liveMood');
  var wordsEl = document.getElementById('liveWords');

  var moods = [
    { h: 0,  emoji: '🌙', words: '夜深了，该睡了' },
    { h: 6,  emoji: '🌅', words: '早安，新的一天' },
    { h: 8,  emoji: '☀️', words: '元气满满地开始吧' },
    { h: 10, emoji: '💻', words: '专注的上午最有生产力' },
    { h: 12, emoji: '🍜', words: '午饭时间，记得吃饱' },
    { h: 14, emoji: '☕', words: '午后困意来袭，来杯咖啡' },
    { h: 17, emoji: '🌆', words: '夕阳西下，一天快结束了' },
    { h: 19, emoji: '📖', words: '夜晚是最好的阅读时光' },
    { h: 21, emoji: '🎧', words: '戴上耳机，进入自己的世界' },
    { h: 23, emoji: '🌙', words: '夜深了，该睡了' }
  ];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function tick() {
    var now = new Date();
    if (clock) clock.textContent = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    if (dateEl) dateEl.textContent = now.getFullYear() + '.' + pad(now.getMonth()+1) + '.' + pad(now.getDate()) + ' ' + ['日','一','二','三','四','五','六'][now.getDay()];
    var h = now.getHours();
    for (var i = moods.length-1; i >= 0; i--) {
      if (h >= moods[i].h) {
        if (moodEl) moodEl.textContent = moods[i].emoji;
        if (wordsEl) wordsEl.textContent = moods[i].words;
        break;
      }
    }
  }

  tick();
  setInterval(tick, 1000);
})();

// ===== 1. 星空微闪：CSS星星 =====
(function() {
  var style = document.createElement('style');
  style.textContent = [
    '.star-dot { position: fixed; z-index: 0; pointer-events: none;',
    '  width: 2px; height: 2px; border-radius: 50%;',
    '  background: #fff; box-shadow: 0 0 4px #fff;',
    '  animation: twinkle var(--td) ease-in-out infinite;',
    '  animation-delay: var(--dl); }',
    '@keyframes twinkle { 0%, 100% { opacity: 0.15; } 40% { opacity: 0.9; } 60% { opacity: 0.1; } 80% { opacity: 0.7; } }'
  ].join(' ');
  document.head.appendChild(style);

  for (var i = 0; i < 9; i++) {
    var s = document.createElement('div');
    s.className = 'star-dot';
    s.style.left = (Math.random() * 94 + 3) + '%';
    s.style.top = (Math.random() * 85 + 5) + '%';
    s.style.setProperty('--td', (Math.random() * 2 + 1.5) + 's');
    s.style.setProperty('--dl', (Math.random() * 3) + 's');
    document.body.appendChild(s);
  }
})();

// ===== 2. 柒柒正在动态状态 =====
(function() {
  var el = document.getElementById('statusText');
  if (!el) return;
  var states = ['赶 ddl', '听歌', '发呆', '吃夜宵', '思考人生', '水课摸鱼', '看晚霞', '泡图书馆', '写代码', '纠结午饭吃什么'];
  var idx = 0;
  function next() {
    idx = (idx + 1) % states.length;
    el.style.opacity = '0';
    setTimeout(function() { el.textContent = states[idx]; el.style.opacity = '1'; }, 350);
  }
  setInterval(next, 5000);
})();

// ===== 3. 心情签 =====
(function() {
  var card = document.getElementById('momentCard');
  var moodEl = document.getElementById('liveMood');
  var wordsEl = document.getElementById('liveWords');
  if (!card || !wordsEl) return;
  var fortunes = [
    { emoji: '✨', text: '今天会是闪闪发光的一天' },
    { emoji: '🌈', text: '雨后会有彩虹，别急着收伞' },
    { emoji: '🌻', text: '把脸朝向太阳，影子就落在身后' },
    { emoji: '🍀', text: '好运正在路上，请保持接收' },
    { emoji: '💪', text: '你已经很棒了，别对自己太苛刻' },
    { emoji: '🎯', text: '心里有目标，脚下就有路' },
    { emoji: '🌊', text: '浪花拍岸的时候，别忘了自己是海' },
    { emoji: '🕯️', text: '小小的光也能照亮一整间屋子' },
    { emoji: '🐢', text: '走得慢没关系，不停下就行' },
    { emoji: '🎵', text: '今天适合单曲循环一首老歌' },
    { emoji: '📝', text: '把烦恼写下来，纸会帮你分担一半' },
    { emoji: '🍵', text: '累了就停下来喝杯茶吧' }
  ];
  var last = -1;
  card.addEventListener('click', function() {
    var r;
    do { r = Math.floor(Math.random() * fortunes.length); } while (r === last && fortunes.length > 1);
    last = r;
    var f = fortunes[r];
    if (moodEl) moodEl.textContent = f.emoji;
    if (wordsEl) { wordsEl.style.opacity = '0'; setTimeout(function() { wordsEl.textContent = f.text; wordsEl.style.opacity = '1'; }, 300); }
  });
})();

// ===== 4. 视差微动 =====
(function() {
  var orbs = document.querySelectorAll('.floating-orb');
  var plane = document.querySelector('.paper-plane');
  if (!orbs.length && !plane) return;
  window.addEventListener('scroll', function() {
    var s = window.scrollY;
    var factor = 0.15;
    orbs.forEach(function(orb, i) {
      orb.style.marginTop = (s * factor * (i + 1) * 0.5) + 'px';
    });
    if (plane) {
      plane.style.marginTop = (s * factor * 0.7) + 'px';
    }
  });
})();

// ===== 5. 访客足迹轮换 =====
(function() {
  var el = document.getElementById('trailText');
  if (!el) return;
  var trails = [
    '某个深夜，有人在这里看了很久',
    '一个雨天，有人把这里的文章全读了一遍',
    '有个失眠的人，凌晨三点翻到了这里',
    '来自远方的一个访客，默默点了个赞',
    '有人从这里找到了继续写下去的勇气',
    '一位陌生人说：我也是柒柒',
    '某个午后，一个大学生在宿舍里笑着读完了',
    '有个人每次更新都会悄悄来看'
  ];
  var idx = 0;
  setInterval(function() {
    idx = (idx + 1) % trails.length;
    el.style.opacity = '0';
    setTimeout(function() { el.textContent = trails[idx]; el.style.opacity = '0.55'; }, 600);
  }, 8000);
})();
