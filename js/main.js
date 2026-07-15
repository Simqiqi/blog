// ===== 全局粒子颜色（由昼夜模块更新） =====
window._particleColor = { r: 0, g: 229, b: 255 };

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

  function getColor() {
    const c = window._particleColor || { r: 0, g: 229, b: 255 };
    return c.r + ',' + c.g + ',' + c.b;
  }

  function draw() {
    ctx.clearRect(0, 0, w, h);
    const rgb = getColor();

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
      ctx.fillStyle = 'rgba(' + rgb + ',0.35)';
      ctx.fill();
    }

    for (let i = 0; i < count; i++) {
      for (let j = i + 1; j < count; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < connectionDist) {
          ctx.beginPath();
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.strokeStyle = 'rgba(' + rgb + ',' + (0.06 * (1 - dist / connectionDist)) + ')';
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

// ===== 6. 点击涟漪 =====
(function() {
  var style = document.createElement('style');
  style.textContent = '.ripple { position: fixed; z-index: 9999; pointer-events: none; border-radius: 50%; border: 1px solid rgba(99,102,241,0.5); animation: rippleOut 0.9s ease-out forwards; } @keyframes rippleOut { 0% { width: 0; height: 0; opacity: 0.8; } 100% { width: 120px; height: 120px; opacity: 0; margin-left: -60px; margin-top: -60px; } }';
  document.head.appendChild(style);
  document.addEventListener('click', function(e) {
    var r = document.createElement('div');
    r.className = 'ripple';
    r.style.left = e.clientX + 'px';
    r.style.top = e.clientY + 'px';
    document.body.appendChild(r);
    setTimeout(function() { r.remove(); }, 900);
  });
})();

// ===== 7. 粒子昼夜变色 =====
(function() {
  var schedule = [
    { h: 0,  r: 20,  g: 50,  b: 120  },
    { h: 5,  r: 80,  g: 100, b: 200  },
    { h: 7,  r: 140, g: 160, b: 240  },
    { h: 10, r: 0,   g: 229, b: 255  },
    { h: 14, r: 100, g: 220, b: 200  },
    { h: 17, r: 255, g: 170, b: 100  },
    { h: 19, r: 200, g: 120, b: 220  },
    { h: 21, r: 60,  g: 80,  b: 180  },
    { h: 23, r: 20,  g: 50,  b: 120  }
  ];
  function lerp(a,b,t){ return Math.round(a+(b-a)*t); }
  function update() {
    var h = new Date().getHours() + new Date().getMinutes()/60;
    for (var i=schedule.length-2; i>=0; i--) {
      var A=schedule[i], B=schedule[i+1];
      if (h >= A.h) {
        var t = Math.min(1, (h - A.h) / (B.h - A.h));
        window._particleColor.r = lerp(A.r, B.r, t);
        window._particleColor.g = lerp(A.g, B.g, t);
        window._particleColor.b = lerp(A.b, B.b, t);
        break;
      }
    }
  }
  update();
  setInterval(update, 60000);
})();

// ===== 8. 灵感气泡 =====
(function() {
  var style = document.createElement('style');
  style.textContent = '.idea-bubble { position: fixed; z-index: 1; pointer-events: none; left: 50%; transform: translateX(-50%); bottom: -60px; padding: 10px 22px; background: rgba(99,102,241,0.1); backdrop-filter: blur(8px); border: 1px solid rgba(99,102,241,0.18); border-radius: 24px; color: rgba(255,255,255,0.7); font-size: 0.78rem; font-style: italic; white-space: nowrap; animation: bubbleUp 8s ease-in forwards; } @keyframes bubbleUp { 0% { bottom: -60px; opacity: 0; } 15% { opacity: 0.7; } 85% { opacity: 0.5; } 100% { bottom: 105%; opacity: 0; } }';
  document.head.appendChild(style);
  var poems = [
    '再小的念头也值得被看见',
    '风吹过的时候，记得呼吸',
    '你不需要成为别人眼中的样子',
    '没关系，慢慢来',
    '有些话不说出口也是诗',
    '今天的云特别好看',
    '换个角度看看这个世界',
    '耐心是一种很酷的品质',
    '别怕犯错，怕的是不敢开始',
    '深夜最适合和自己聊天',
    '偶尔摆烂也没关系',
    '世界上所有的美好都是免费的'
  ];
  var idx = 0;
  function spawn() {
    var b = document.createElement('div');
    b.className = 'idea-bubble';
    b.textContent = poems[idx];
    idx = (idx + 1) % poems.length;
    document.body.appendChild(b);
    setTimeout(function() { b.remove(); }, 8000);
  }
  spawn();
  setInterval(spawn, 15000);
})();

// ===== 9. 页面载入淡入 =====
(function() {
  document.documentElement.style.opacity = '0';
  document.documentElement.style.transition = 'opacity 0.7s ease-out';
  window.addEventListener('load', function() {
    requestAnimationFrame(function() {
      document.documentElement.style.opacity = '1';
    });
  });
})();

// ===== 10. 头像彩蛋 =====
(function() {
  var avatar = document.querySelector('.avatar');
  if (!avatar) return;
  var clicks = 0, timer = null;
  var emojis = ['✨','🌟','💫','🎉','🎊','💖','🔥','⚡'];
  avatar.addEventListener('click', function(e) {
    clicks++;
    if (clicks === 1) timer = setTimeout(function() { clicks = 0; }, 800);
    if (clicks >= 3) {
      clearTimeout(timer);
      clicks = 0;
      var rect = avatar.getBoundingClientRect();
      var cx = rect.left + rect.width/2;
      var cy = rect.top + rect.height/2;
      var style = document.createElement('style');
      var css = '@keyframes burst { 0% { transform: translate(0,0) scale(0); opacity: 1; } 100% { opacity: 0; } }';
      for (var i = 0; i < emojis.length; i++) {
        var angle = (i / emojis.length) * Math.PI * 2;
        var dist = 60 + Math.random() * 40;
        var tx = Math.cos(angle)*dist, ty = Math.sin(angle)*dist;
        css += '@keyframes b' + i + ' { 0% { transform: translate(0,0) scale(0); opacity: 1; } 100% { transform: translate(' + tx + 'px,' + ty + 'px) scale(1); opacity: 0; } }';
      }
      style.textContent = css;
      document.head.appendChild(style);
      for (var j = 0; j < emojis.length; j++) {
        var el = document.createElement('span');
        el.textContent = emojis[j];
        el.style.cssText = 'position:fixed;z-index:99999;pointer-events:none;font-size:1.6rem;left:'+(cx-12)+'px;top:'+(cy-12)+'px;animation:b'+j+' 0.7s ease-out forwards;';
        document.body.appendChild(el);
        setTimeout(function(span){ span.remove(); }, 700, el);
      }
      setTimeout(function() { style.remove(); }, 1000);
    }
  });
})();

// ===== 标签云呼吸 =====
(function() {
  var tags = document.querySelectorAll('.tag-cloud .tag');
  if (!tags.length) return;
  var idx = 0;
  function breathe() {
    tags.forEach(function(t) { t.classList.remove('breathing'); });
    tags[idx].classList.add('breathing');
    idx = (idx + 1) % tags.length;
  }
  breathe();
  setInterval(breathe, 2800);
})();

// ===== 滚动弹性回弹 =====
(function() {
  var bouncing = false;
  function isAtBottom() {
    var scrollBottom = window.innerHeight + window.pageYOffset;
    return scrollBottom >= document.body.offsetHeight - 5;
  }
  function bounce() {
    if (bouncing) return;
    bouncing = true;
    document.body.classList.add('bounce-end');
    setTimeout(function() {
      document.body.classList.remove('bounce-end');
      bouncing = false;
    }, 500);
  }
  window.addEventListener('wheel', function(e) {
    if (e.deltaY > 0 && isAtBottom()) {
      bounce();
    }
  }, { passive: true });
  window.addEventListener('touchmove', function(e) {
    if (isAtBottom()) {
      var touch = e.touches[0];
      if (touch && touch.clientY > window.innerHeight - 100) {
        bounce();
      }
    }
  }, { passive: true });
})();

// ===== 深夜彩蛋（22:00 后） =====
(function() {
  var h = new Date().getHours();
  if (h < 22 && h >= 5) return;
  var nightWords = ['熬夜冠军', '灵感迸发', '深夜放空', '星空守望', '晚安未眠'];
  var statusEl = document.getElementById('statusText');
  if (!statusEl) return;
  var nightStatuses = ['深夜放空', '熬夜赶工', '独自听歌', '仰望星空', '想喝热可可'];
  var si = 0;
  setInterval(function() {
    if (statusEl && statusEl.textContent) {
      si = (si + 1) % nightStatuses.length;
      if (statusEl.textContent.indexOf('深夜') !== -1 || statusEl.textContent.indexOf('熬夜') !== -1) {
        statusEl.textContent = nightStatuses[si];
      }
    }
  }, 8000);
  var dots = document.querySelectorAll('.status-dot');
  if (dots.length) {
    dots.forEach(function(d) { d.style.background = '#fbbf24'; });
  }
  var moodEl = document.getElementById('liveMood');
  if (moodEl) moodEl.textContent = '🌙';
  var wordsEl = document.getElementById('liveWords');
  if (wordsEl) wordsEl.textContent = '夜深了，柒柒还在';
})();

// ===== 悄悄话选中浮现 =====
(function() {
  var whisper = document.getElementById('whisperText');
  if (!whisper) return;
  var whispers = [
    '有些话，只给愿意停留的人看。',
    '你发现了我藏起来的小秘密～',
    '晚风会记住每一份温柔。',
    '世界很大，谢谢你停在这里。',
    '嘘——这是只属于你的彩蛋。',
    '今天的柒柒也很喜欢你。',
    '没有人是一座孤岛。',
    '愿你被这世界温柔以待。'
  ];
  var used = 0;
  function reveal() {
    var w = whispers[used % whispers.length];
    used++;
    whisper.textContent = w;
    whisper.classList.add('revealed');
    setTimeout(function() {
      whisper.classList.remove('revealed');
    }, 4000);
  }
  whisper.addEventListener('dblclick', reveal);
  whisper.addEventListener('contextmenu', function(e) { e.preventDefault(); reveal(); });
  var longPressTimer;
  whisper.addEventListener('touchstart', function(e) {
    longPressTimer = setTimeout(reveal, 600);
  }, { passive: true });
  whisper.addEventListener('touchend', function() { clearTimeout(longPressTimer); });
  whisper.addEventListener('touchmove', function() { clearTimeout(longPressTimer); });
})();

// ===== 11. 暗黑模式切换 =====
(function() {
  var saved = localStorage.getItem('theme');
  if (saved === 'light') {
    document.documentElement.setAttribute('data-theme', 'light');
    window._particleColor = { r: 99, g: 102, b: 241 };
  }

  var toggle = document.getElementById('themeToggle');
  if (!toggle) return;

  toggle.addEventListener('click', function() {
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    if (isLight) {
      document.documentElement.removeAttribute('data-theme');
      window._particleColor = { r: 0, g: 229, b: 255 };
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.setAttribute('data-theme', 'light');
      window._particleColor = { r: 99, g: 102, b: 241 };
      localStorage.setItem('theme', 'light');
    }
  });
})();

// ===== 12. 回到顶部火箭 =====
(function() {
  var rocket = document.getElementById('rocketToTop');
  if (!rocket) return;

  var ticking = false;

  function updateVisibility() {
    if (window.pageYOffset > 400) {
      rocket.classList.add('visible');
    } else {
      rocket.classList.remove('visible');
    }
    ticking = false;
  }

  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateVisibility);
      ticking = true;
    }
  }, { passive: true });

  rocket.addEventListener('click', function() {
    // 发射粒子
    var rect = rocket.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;
    var count = 12;

    for (var i = 0; i < count; i++) {
      var particle = document.createElement('div');
      particle.className = 'rocket-particle';
      var angle = Math.random() * Math.PI * 2;
      var dist = 30 + Math.random() * 50;
      particle.style.left = cx + 'px';
      particle.style.top = cy + 'px';
      particle.style.setProperty('--rx', Math.cos(angle) * dist + 'px');
      particle.style.setProperty('--ry', Math.sin(angle) * dist + 'px');
      document.body.appendChild(particle);
      setTimeout(function(p) { p.remove(); }, 700, particle);
    }

    // 尾迹
    for (var j = 0; j < 3; j++) {
      var trail = document.createElement('div');
      trail.className = 'rocket-trail';
      trail.style.left = (cx + (Math.random() - 0.5) * 4) + 'px';
      trail.style.top = (cy + j * 16) + 'px';
      document.body.appendChild(trail);
      setTimeout(function(t) { t.remove(); }, 600, trail);
    }

    // 平滑滚动到顶部
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
