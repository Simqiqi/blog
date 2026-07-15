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

// ===== 13. 随机一言弹幕墙 =====
(function() {
  if (window.innerWidth < 768) return; // 移动端不显示弹幕

  var container = document.createElement('div');
  container.className = 'barrage-container';
  document.body.appendChild(container);

  var quotes = [
    '种一棵树最好的时间是十年前，其次是现在',
    '生活不是竞速，偶尔迷路也没关系',
    '保持好奇，保持愚蠢',
    '世界是自己的，与他人毫无关系',
    '所有的为时已晚，其实都是恰逢其时',
    '与其互为人间，不如自成宇宙',
    '慢慢来，会更快',
    '山海自有归期，风雨自有相逢',
    '耐心是一种很酷的品质',
    '别怕犯错，怕的是不敢开始',
    '换个角度看看这个世界',
    '偶尔摆烂也没关系',
    '再小的念头也值得被看见',
    '风吹过的时候，记得呼吸',
    '愿你被这世界温柔以待',
    '今天的云特别好看',
    '深夜最适合和自己聊天',
    '世界上所有的美好都是免费的',
    '你不需要成为别人眼中的样子',
    '有些话不说出口也是诗'
  ];

  var colors = [
    'rgba(99,102,241,0.14)', 'rgba(168,85,247,0.14)',
    'rgba(236,72,153,0.12)', 'rgba(34,211,238,0.14)',
    'rgba(251,191,36,0.12)', 'rgba(52,211,153,0.12)'
  ];

  var used = [];

  function getTheme() {
    return document.documentElement.getAttribute('data-theme') === 'light' ? 'light' : 'dark';
  }

  function spawn() {
    if (used.length >= quotes.length) used = [];
    var pool = quotes.filter(function(_, i) { return used.indexOf(i) === -1; });
    var idx = quotes.indexOf(pool[Math.floor(Math.random() * pool.length)]);
    used.push(idx);

    var item = document.createElement('div');
    item.className = 'barrage-item theme-' + getTheme() + '-barrage';
    item.textContent = quotes[idx];
    item.style.top = (8 + Math.random() * 24) + 'px';
    item.style.background = colors[Math.floor(Math.random() * colors.length)];

    container.appendChild(item);

    setTimeout(function() { item.remove(); }, 15000);
  }

  // 初始弹幕
  setTimeout(spawn, 2000);
  setTimeout(spawn, 4500);

  // 每 8-15 秒随机出现
  function schedule() {
    spawn();
    setTimeout(schedule, 8000 + Math.random() * 14000);
  }
  setTimeout(schedule, 9000);

  // 主题切换时更新弹幕样式
  var observer = new MutationObserver(function() {
    var theme = getTheme();
    document.querySelectorAll('.barrage-item').forEach(function(el) {
      el.className = 'barrage-item theme-' + theme + '-barrage';
    });
  });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
})();

// ===== 14. 迷你音乐播放器 (Web Audio API) =====
(function() {
  var AudioContext = window.AudioContext || window.webkitAudioContext;
  if (!AudioContext) return;

  var ctx = null;
  var playing = false;
  var currentTrack = 0;
  var gainNode = null;
  var timerId = null;
  var noteIndex = 0;

  var tracks = [
    {
      name: '星空漫步',
      mood: '安静 · 治愈',
      scale: [262, 294, 330, 349, 392, 440, 494, 523], // C D E F G A B C
      tempo: 1200,
      pattern: [0, 2, 4, 7, 4, 2, 0, 2, 4, 5, 4, 2, 7, 8, 7, 5]
    },
    {
      name: '午后阳光',
      mood: '温暖 · 悠闲',
      scale: [330, 349, 392, 440, 494, 523, 587, 659], // E F G A B C D E
      tempo: 1000,
      pattern: [0, 3, 5, 7, 3, 0, 5, 3, 2, 0, 7, 5, 3, 2, 0, 3]
    },
    {
      name: '午夜思绪',
      mood: '深沉 · 内省',
      scale: [220, 247, 262, 294, 330, 349, 392, 440], // A B C D E F G A
      tempo: 1500,
      pattern: [0, 2, 4, 7, 4, 2, 7, 8, 7, 5, 3, 0, 2, 4, 7, 5]
    },
    {
      name: '晨露',
      mood: '清新 · 灵动',
      scale: [294, 330, 349, 392, 440, 494, 523, 587], // D E F G A B C D
      tempo: 900,
      pattern: [7, 5, 4, 2, 0, 7, 5, 4, 7, 5, 3, 2, 0, 5, 7, 8]
    }
  ];

  function initCtx() {
    if (!ctx) {
      ctx = new AudioContext();
      gainNode = ctx.createGain();
      gainNode.gain.value = 0.15;
      gainNode.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
  }

  function playNote() {
    if (!playing || !ctx) return;
    var track = tracks[currentTrack];
    var freq = track.scale[track.pattern[noteIndex % track.pattern.length]];
    var osc = ctx.createOscillator();
    var noteGain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.value = freq;

    noteGain.gain.setValueAtTime(0, ctx.currentTime);
    noteGain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.08);
    noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);

    osc.connect(noteGain);
    noteGain.connect(gainNode);

    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 1.2);

    noteIndex++;
    timerId = setTimeout(playNote, track.tempo);
  }

  function startMusic() {
    initCtx();
    playing = true;
    noteIndex = 0;
    playNote();
  }

  function stopMusic() {
    playing = false;
    if (timerId) { clearTimeout(timerId); timerId = null; }
  }

  function nextTrack() {
    currentTrack = (currentTrack + 1) % tracks.length;
    if (playing) {
      stopMusic();
      noteIndex = 0;
      playNote();
    }
    updatePanel();
  }

  function prevTrack() {
    currentTrack = (currentTrack - 1 + tracks.length) % tracks.length;
    if (playing) {
      stopMusic();
      noteIndex = 0;
      playNote();
    }
    updatePanel();
  }

  function updatePanel() {
    var nameEl = document.getElementById('trackName');
    var moodEl = document.getElementById('trackMood');
    if (nameEl) nameEl.textContent = tracks[currentTrack].name;
    if (moodEl) moodEl.textContent = tracks[currentTrack].mood;
  }

  function togglePlay() {
    if (playing) {
      stopMusic();
      document.getElementById('musicToggle').classList.remove('playing');
    } else {
      startMusic();
      document.getElementById('musicToggle').classList.add('playing');
    }
  }

  // 音量滑条
  var volSlider = document.getElementById('volumeSlider');
  if (volSlider) {
    volSlider.addEventListener('input', function() {
      if (gainNode) gainNode.gain.value = parseFloat(this.value);
    });
  }

  // 绑定事件
  var toggle = document.getElementById('musicToggle');
  var panel = document.getElementById('musicPanel');

  if (toggle) {
    toggle.addEventListener('click', function(e) {
      e.stopPropagation();
      if (panel && !panel.classList.contains('open')) {
        panel.classList.add('open');
        setTimeout(function() {
          document.addEventListener('click', closePanel);
        }, 100);
      } else if (panel) {
        panel.classList.remove('open');
        document.removeEventListener('click', closePanel);
      }
    });
  }

  function closePanel(e) {
    if (panel && !panel.contains(e.target) && e.target !== toggle) {
      panel.classList.remove('open');
      document.removeEventListener('click', closePanel);
    }
  }

  // 播放/暂停
  var playBtn = document.getElementById('musicPlay');
  if (playBtn) {
    playBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      togglePlay();
    });
  }

  // 上一首
  var prevBtn = document.getElementById('musicPrev');
  if (prevBtn) {
    prevBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      prevTrack();
    });
  }

  // 下一首
  var nextBtn = document.getElementById('musicNext');
  if (nextBtn) {
    nextBtn.addEventListener('click', function(e) {
      e.stopPropagation();
      nextTrack();
    });
  }

  updatePanel();
})();

// ===== 15. 3D 旋转地球仪 =====
(function() {
  if (typeof THREE === 'undefined') {
    // 动态加载 Three.js
    var script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
    script.onload = initGlobe;
    document.head.appendChild(script);
  } else {
    initGlobe();
  }

  function initGlobe() {
    var container = document.getElementById('globeContainer');
    if (!container) return;

    var width = container.clientWidth;
    var height = container.clientHeight;

    var scene = new THREE.Scene();
    var camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.z = 4.2;

    var renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 地球
    var globeGeom = new THREE.SphereGeometry(1.5, 64, 64);

    // 生成程序化纹理
    var canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    var ctx2d = canvas.getContext('2d');

    // 海洋底色
    var isLight = document.documentElement.getAttribute('data-theme') === 'light';
    ctx2d.fillStyle = isLight ? '#e8edf2' : '#0a0a1a';
    ctx2d.fillRect(0, 0, 512, 256);

    // 绘制伪大陆
    ctx2d.fillStyle = isLight ? '#c8d6e5' : '#1a1a3a';
    // 简化的大陆形状
    var continents = [
      { x: 80, y: 60, rx: 70, ry: 50 },   // 北美
      { x: 90, y: 130, rx: 45, ry: 35 },  // 南美
      { x: 240, y: 50, rx: 60, ry: 55 },  // 欧洲
      { x: 250, y: 120, rx: 50, ry: 70 }, // 非洲
      { x: 350, y: 40, rx: 80, ry: 60 },  // 亚洲
      { x: 370, y: 130, rx: 40, ry: 30 }, // 东南亚
      { x: 400, y: 160, rx: 35, ry: 25 }, // 澳洲
      { x: 160, y: 200, rx: 80, ry: 40 }, // 南极洲
    ];

    continents.forEach(function(c) {
      ctx2d.beginPath();
      ctx2d.ellipse(c.x, c.y, c.rx, c.ry, Math.random() * 0.3, 0, Math.PI * 2);
      ctx2d.fill();
    });

    // 添加一些岛屿和细节
    ctx2d.fillStyle = isLight ? '#d1dce8' : '#252550';
    for (var i = 0; i < 40; i++) {
      ctx2d.beginPath();
      ctx2d.arc(Math.random() * 512, Math.random() * 256, 2 + Math.random() * 8, 0, Math.PI * 2);
      ctx2d.fill();
    }

    var texture = new THREE.CanvasTexture(canvas);
    var globeMat = new THREE.MeshPhongMaterial({
      map: texture,
      specular: 0x333333,
      shininess: 8,
      emissive: isLight ? 0x111122 : 0x000011,
      emissiveIntensity: 0.3
    });

    var globe = new THREE.Mesh(globeGeom, globeMat);
    scene.add(globe);

    // 大气层光环
    var atmosGeom = new THREE.SphereGeometry(1.55, 64, 64);
    var atmosMat = new THREE.MeshPhongMaterial({
      color: isLight ? 0x6366f1 : 0x00e5ff,
      transparent: true,
      opacity: 0.06,
      side: THREE.FrontSide
    });
    var atmosphere = new THREE.Mesh(atmosGeom, atmosMat);
    scene.add(atmosphere);

    // 光点（访客标记）
    var dotsGroup = new THREE.Group();
    var dotGeom = new THREE.SphereGeometry(0.03, 8, 8);
    var dotMat = new THREE.MeshBasicMaterial({ color: 0x00e5ff });

    var cityCoords = [
      { lat: 40, lon: -74 },  // 纽约
      { lat: 51, lon: -0.1 }, // 伦敦
      { lat: 35, lon: 139 },  // 东京
      { lat: -34, lon: 151 }, // 悉尼
      { lat: 39, lon: 116 },  // 北京
      { lat: 30, lon: 31 },   // 开罗
      { lat: -23, lon: -46 }, // 圣保罗
      { lat: 55, lon: 37 },   // 莫斯科
      { lat: 19, lon: 72 },   // 孟买
      { lat: 48, lon: 2 },    // 巴黎
      { lat: -1, lon: 36 },   // 内罗毕
      { lat: 37, lon: 127 },  // 首尔
    ];

    cityCoords.forEach(function(c) {
      var phi = (90 - c.lat) * (Math.PI / 180);
      var theta = (c.lon + 180) * (Math.PI / 180);
      var x = -(1.52) * Math.sin(phi) * Math.cos(theta);
      var y = 1.52 * Math.cos(phi);
      var z = 1.52 * Math.sin(phi) * Math.sin(theta);

      var dot = new THREE.Mesh(dotGeom, dotMat);
      dot.position.set(x, y, z);
      dotsGroup.add(dot);

      // 光柱
      var pillarGeom = new THREE.CylinderGeometry(0.005, 0.005, 0.15, 6);
      var pillarMat = new THREE.MeshBasicMaterial({
        color: isLight ? 0x6366f1 : 0x00e5ff,
        transparent: true,
        opacity: 0.5
      });
      var pillar = new THREE.Mesh(pillarGeom, pillarMat);
      pillar.position.set(x, y + 0.08, z);
      dotsGroup.add(pillar);
    });

    globe.add(dotsGroup);

    // 光照
    var ambientLight = new THREE.AmbientLight(0x444466, 0.6);
    scene.add(ambientLight);

    var directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(5, 3, 5);
    scene.add(directionalLight);

    // 鼠标交互
    var isDragging = false;
    var prevMouse = { x: 0, y: 0 };
    var rotationVelocity = { x: 0, y: 0 };
    var autoRotate = true;
    var autoSpeed = 0.003;

    renderer.domElement.addEventListener('mousedown', function(e) {
      isDragging = true;
      autoRotate = false;
      prevMouse.x = e.clientX;
      prevMouse.y = e.clientY;
    });

    window.addEventListener('mousemove', function(e) {
      if (!isDragging) return;
      var dx = e.clientX - prevMouse.x;
      var dy = e.clientY - prevMouse.y;
      rotationVelocity.y = dx * 0.005;
      rotationVelocity.x = dy * 0.003;
      prevMouse.x = e.clientX;
      prevMouse.y = e.clientY;
    });

    window.addEventListener('mouseup', function() {
      isDragging = false;
      setTimeout(function() { autoRotate = true; }, 2000);
    });

    // 触摸支持
    renderer.domElement.addEventListener('touchstart', function(e) {
      isDragging = true;
      autoRotate = false;
      prevMouse.x = e.touches[0].clientX;
      prevMouse.y = e.touches[0].clientY;
    });

    window.addEventListener('touchmove', function(e) {
      if (!isDragging) return;
      var dx = e.touches[0].clientX - prevMouse.x;
      var dy = e.touches[0].clientY - prevMouse.y;
      rotationVelocity.y = dx * 0.005;
      rotationVelocity.x = dy * 0.003;
      prevMouse.x = e.touches[0].clientX;
      prevMouse.y = e.touches[0].clientY;
    });

    window.addEventListener('touchend', function() {
      isDragging = false;
      setTimeout(function() { autoRotate = true; }, 2000);
    });

    // 响应式
    window.addEventListener('resize', function() {
      width = container.clientWidth;
      height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    });

    // 动画循环
    function animate() {
      requestAnimationFrame(animate);

      if (autoRotate) {
        globe.rotation.y += autoSpeed;
        // 减速拖动惯性
        rotationVelocity.y *= 0.95;
        rotationVelocity.x *= 0.95;
      } else {
        globe.rotation.y += rotationVelocity.y;
        globe.rotation.x += rotationVelocity.x;
        rotationVelocity.y *= 0.95;
        rotationVelocity.x *= 0.95;
      }

      // 光点脉动
      var time = Date.now() * 0.001;
      dotMat.color.setHSL(0.55 + Math.sin(time) * 0.05, 0.9, 0.55 + Math.sin(time * 1.7) * 0.1);

      renderer.render(scene, camera);
    }

    animate();

    // 更新访问计数显示
    var visitorsEl = document.getElementById('globeVisitors');
    if (visitorsEl) {
      var count = Math.floor(Math.random() * 50) + 80;
      visitorsEl.textContent = '来自 ' + count + ' 个城市的足迹';
    }
  }
})();

// ===== 16. 底部跑马灯 =====
(function() {
  var bar = document.getElementById('marqueeBar');
  if (!bar) return;

  var messages = [
    '欢迎来到柒柒的小角落',
    '种一棵树最好的时间是十年前，其次是现在',
    '保持好奇，保持愚蠢',
    '慢慢来，会更快',
    '愿你被这世界温柔以待',
    '所有的为时已晚，都是恰逢其时',
    '世界是自己的，与他人毫无关系'
  ];

  // 构建重复两次以保证无缝滚动
  var track = bar.querySelector('.marquee-track');
  if (!track) return;

  var html = '';
  for (var r = 0; r < 2; r++) {
    for (var i = 0; i < messages.length; i++) {
      html += '<span>' + messages[i] + '</span>';
      if (i < messages.length - 1 || r < 1) {
        html += '<span class="marquee-sep">·</span>';
      }
    }
    if (r === 0) html += '<span class="marquee-sep">·</span>';
  }
  track.innerHTML = html;
})();

// ===== 17. 文章点赞飘心 =====
(function() {
  var btn = document.getElementById('likeBtn');
  if (!btn) return;

  var countEl = document.getElementById('likeCount');
  var count = parseInt(localStorage.getItem('blog_like_count') || '0');
  var liked = localStorage.getItem('blog_liked') === 'true';

  if (countEl) countEl.textContent = count;
  if (liked) btn.classList.add('liked');

  var hearts = ['❤️', '💕', '💖', '💗', '💝', '💘', '✨', '💫'];

  btn.addEventListener('click', function(e) {
    if (btn.classList.contains('liked')) return;

    liked = true;
    count++;
    localStorage.setItem('blog_liked', 'true');
    localStorage.setItem('blog_like_count', count);
    btn.classList.add('liked');
    if (countEl) countEl.textContent = count;

    // 产生飘心粒子
    var rect = btn.getBoundingClientRect();
    var cx = rect.left + rect.width / 2;
    var cy = rect.top + rect.height / 2;

    for (var i = 0; i < 8; i++) {
      var heart = document.createElement('span');
      heart.className = 'floating-heart';
      heart.textContent = hearts[i];
      heart.style.left = cx + 'px';
      heart.style.top = cy + 'px';

      var angle = (Math.PI * 2 * i) / 8 + (Math.random() - 0.5) * 0.4;
      var dist = 30 + Math.random() * 50;
      heart.style.setProperty('--hx', Math.cos(angle) * dist + 'px');
      heart.style.setProperty('--hy', Math.sin(angle) * dist + 'px');
      heart.style.setProperty('--hr', (Math.random() - 0.5) * 60 + 'deg');

      document.body.appendChild(heart);
      setTimeout(function(h) { h.remove(); }, 1500, heart);
    }
  });
})();

// ===== 18. 复制自动追加版权声明 =====
(function() {
  document.addEventListener('copy', function(e) {
    var selection = window.getSelection().toString().trim();
    if (!selection || selection.length < 10) return;

    var attribution = '\n\n——来自 柒柒的博客 (https://simqiqi.github.io/blog/)';
    var clipData = e.clipboardData || window.clipboardData;
    if (clipData) {
      e.preventDefault();
      clipData.setData('text/plain', selection + attribution);
    }
  });
})();

// ===== 19. 文章分享按钮组 =====
(function() {
  var copyBtn = document.getElementById('shareCopy');
  var weiboBtn = document.getElementById('shareWeibo');
  var twitterBtn = document.getElementById('shareTwitter');
  var qrBtn = document.getElementById('shareQR');
  if (!copyBtn && !weiboBtn && !twitterBtn && !qrBtn) return;

  var pageUrl = window.location.href;
  var pageTitle = document.title;

  // 复制链接
  if (copyBtn) {
    copyBtn.addEventListener('click', function() {
      navigator.clipboard.writeText(pageUrl).then(function() {
        var tip = copyBtn.querySelector('.tooltip');
        if (tip) {
          tip.textContent = '已复制';
          setTimeout(function() { tip.textContent = '复制链接'; }, 1500);
        }
      });
    });
  }

  // 微博分享
  if (weiboBtn) {
    weiboBtn.addEventListener('click', function() {
      var url = 'https://service.weibo.com/share/share.php?url=' + encodeURIComponent(pageUrl) + '&title=' + encodeURIComponent(pageTitle);
      window.open(url, '_blank');
    });
  }

  // Twitter分享
  if (twitterBtn) {
    twitterBtn.addEventListener('click', function() {
      var url = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(pageUrl) + '&text=' + encodeURIComponent(pageTitle);
      window.open(url, '_blank');
    });
  }

  // 二维码
  if (qrBtn) {
    qrBtn.addEventListener('click', function() {
      var overlay = document.getElementById('qrOverlay');
      var img = document.getElementById('qrImage');
      if (!overlay || !img) return;

      var qrUrl = 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=' + encodeURIComponent(pageUrl);
      img.src = qrUrl;
      overlay.classList.add('active');

      overlay.addEventListener('click', function(e) {
        if (e.target === overlay || e.target.classList.contains('qr-close')) {
          overlay.classList.remove('active');
        }
      });
    });
  }
})();

// ===== 20. 站点运行时间计时器 =====
(function() {
  var el = document.getElementById('siteRuntime');
  if (!el) return;

  var startDate = new Date('2026-07-15');

  function update() {
    var now = new Date();
    var diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24));
    el.textContent = '本站已运行 ' + diff + ' 天';
  }

  update();
  // 每天更新一次即可
  setInterval(update, 3600000);
})();

// ===== 21. 导航栏实时时钟 =====
(function() {
  var el = document.getElementById('navClock');
  if (!el) return;

  function tick() {
    var now = new Date();
    var h = now.getHours().toString().padStart(2, '0');
    var m = now.getMinutes().toString().padStart(2, '0');
    el.textContent = h + ':' + m;
  }

  tick();
  setInterval(tick, 1000);
})();

// ===== 22. 导航栏一言签名 =====
(function() {
  var el = document.getElementById('navMotto');
  if (!el) return;

  var mottos = [
    '且将新火试新茶，诗酒趁年华',
    '心之所向，素履以往',
    '吹灭读书灯，一身都是月',
    '人生如逆旅，我亦是行人',
    '欲买桂花同载酒，终不似，少年游',
    '世界微尘里，吾宁爱与憎',
    '应是天仙狂醉，乱把白云揉碎',
    '醉后不知天在水，满船清梦压星河',
    '山中何事？松花酿酒，春水煎茶',
    '看取莲花净，应知不染心',
    '借我一个暮年，借我碎片',
    '万物皆有裂痕，那是光照进来的地方',
    '天空没有翅膀的痕迹，但鸟已飞过',
    '每一个不曾起舞的日子，都是对生命的辜负'
  ];

  var idx = Math.floor(Math.random() * mottos.length);
  el.textContent = mottos[idx];

  el.addEventListener('click', function() {
    var old = idx;
    while (idx === old) idx = Math.floor(Math.random() * mottos.length);
    el.style.opacity = '0';
    setTimeout(function() {
      el.textContent = mottos[idx];
      el.style.opacity = '0.55';
    }, 300);
  });
})();

// ===== 23. 导航栏搜索 =====
(function() {
  var toggle = document.getElementById('searchToggle');
  var dropdown = document.getElementById('searchDropdown');
  var input = document.getElementById('searchInput');
  var results = document.getElementById('searchResults');
  if (!toggle || !dropdown) return;

  var articles = [
    { title: '你好，世界', path: 'posts/hello-world.html', date: '2026-07-15', tag: '生活随笔' },
    { title: '话没说完，也没关系', path: 'posts/talk-unfinished.html', date: '2026-07-15', tag: '生活随笔' }
  ];

  function renderResults(list) {
    if (!results) return;
    if (list.length === 0) {
      results.innerHTML = '<div class="search-empty">没有找到相关文章</div>';
      return;
    }
    var html = '';
    list.forEach(function(a) {
      html += '<a class="search-result" href="' + a.path + '">';
      html += '<div class="result-title">' + a.title + '</div>';
      html += '<div class="result-meta">' + a.date + ' · ' + a.tag + '</div>';
      html += '</a>';
    });
    results.innerHTML = html;
  }

  toggle.addEventListener('click', function(e) {
    e.stopPropagation();
    dropdown.classList.toggle('active');
    if (dropdown.classList.contains('active')) {
      setTimeout(function() { input && input.focus(); }, 150);
      renderResults(articles);
    }
  });

  document.addEventListener('click', function(e) {
    if (!dropdown.contains(e.target) && e.target !== toggle) {
      dropdown.classList.remove('active');
    }
  });

  if (input) {
    input.addEventListener('input', function() {
      var q = input.value.trim().toLowerCase();
      if (!q) { renderResults(articles); return; }
      var filtered = articles.filter(function(a) {
        return a.title.toLowerCase().indexOf(q) !== -1 ||
               a.tag.toLowerCase().indexOf(q) !== -1;
      });
      renderResults(filtered);
    });
  }

  renderResults(articles);
})();

// ===== 24. 导航栏小红点 =====
(function() {
  var dot = document.getElementById('navNewDot');
  if (!dot) return;

  var latestDate = new Date('2026-07-15');
  var now = new Date();
  var diffDays = Math.floor((now - latestDate) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7) {
    dot.style.display = 'inline-block';
  }
})();

// ===== 25. 文章阅读量计数器 =====
(function() {
  var el = document.getElementById('articleViews');
  if (!el) return;

  // 用页面路径做key
  var path = window.location.pathname;
  var storageKey = 'blog_views_' + path.replace(/[^a-zA-Z0-9]/g, '_');
  var timeKey = storageKey + '_time';

  var stored = parseInt(localStorage.getItem(storageKey) || '0');
  var lastTime = parseInt(localStorage.getItem(timeKey) || '0');
  var now = Date.now();

  // 30分钟内不重复计数
  if (now - lastTime > 30 * 60 * 1000) {
    stored += 1;
    localStorage.setItem(storageKey, stored);
    localStorage.setItem(timeKey, now);
  }

  // 如果计数器为0说明是新页面，设为1
  if (stored === 0) {
    stored = 1;
    localStorage.setItem(storageKey, 1);
    localStorage.setItem(timeKey, now);
  }

  el.textContent = '阅读 ' + stored;
})();

// ===== 26. 首页打字机标语 =====
(function() {
  var el = document.getElementById('typewriterText');
  var cursor = document.getElementById('typewriterCursor');
  if (!el && !cursor) return;

  // 如果页面没有打字机元素则跳过（非首页）
  if (!el) return;

  var phrases = [
    '一个不知天高地厚的大学生',
    '喜欢在深夜里写点东西',
    '相信文字有治愈的力量',
    '记录那些没说出口的话',
    '想把平凡的日子过得浪漫',
    '正在努力成为更好的自己'
  ];

  var phraseIdx = 0;
  var charIdx = 0;
  var isDeleting = false;
  var elRef = el;

  function type() {
    var current = phrases[phraseIdx];

    if (!isDeleting) {
      // 打字
      elRef.textContent = current.substring(0, charIdx + 1);
      charIdx++;

      if (charIdx === current.length) {
        // 打完，停2秒后开始删除
        setTimeout(function() { isDeleting = true; type(); }, 2000);
        return;
      }
    } else {
      // 删除
      elRef.textContent = current.substring(0, charIdx - 1);
      charIdx--;

      if (charIdx === 0) {
        isDeleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        // 切换到下一句前短暂停顿
        setTimeout(type, 400);
        return;
      }
    }

    var speed = isDeleting ? 40 : 80;
    setTimeout(type, speed);
  }

  type();
})();

// ===== 27. 技能进度条滚动动画 =====
(function() {
  var fills = document.querySelectorAll('.skill-fill');
  if (!fills.length) return;

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var el = entry.target;
        var w = el.getAttribute('data-width');
        if (w) {
          setTimeout(function() {
            el.style.width = w + '%';
          }, 100);
        }
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.3 });

  fills.forEach(function(f) { observer.observe(f); });
})();

// ===== 28. 博客卡片 3D 倾斜 =====
(function() {
  var cards = document.querySelectorAll('.post-card');
  if (!cards.length) return;

  cards.forEach(function(card) {
    card.addEventListener('mousemove', function(e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = ((y - centerY) / centerY) * -6;
      var rotateY = ((x - centerX) / centerX) * 6;

      card.style.transform = 'perspective(800px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg) scale(1.02)';
      card.style.boxShadow = '0 12px 40px rgba(99, 102, 241, 0.2)';
    });

    card.addEventListener('mouseleave', function() {
      card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1)';
      card.style.boxShadow = '';
    });
  });
})();

// ===== 64. 头像漂浮粒子 =====
(function() {
  const container = document.getElementById('avatarParticles');
  if (!container) return;
  const count = 6;
  const particles = [];

  for (let i = 0; i < count; i++) {
    const p = document.createElement('div');
    p.className = 'avatar-particle';
    container.appendChild(p);
    const angle = (i / count) * Math.PI * 2;
    const speed = 0.3 + Math.random() * 0.5;
    const rx = 42 + Math.random() * 10;
    const ry = 42 + Math.random() * 10;
    const phase = Math.random() * Math.PI * 2;
    particles.push({ el: p, angle, speed, rx, ry, phase });
  }

  function animate() {
    const t = performance.now() / 1000;
    const cw = container.offsetWidth / 2;
    const ch = container.offsetHeight / 2;
    particles.forEach(p => {
      const a = p.angle + p.phase + t * p.speed;
      const x = cw + Math.cos(a) * p.rx - 2;
      const y = ch + Math.sin(a) * p.ry - 2;
      p.el.style.left = x + 'px';
      p.el.style.top = y + 'px';
      p.el.style.opacity = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + p.phase));
      p.el.style.transform = 'scale(' + (0.7 + 0.5 * Math.abs(Math.sin(t * 2 + p.phase))) + ')';
    });
    requestAnimationFrame(animate);
  }
  animate();
})();

// ===== 65. 头像点击切换表情 =====
(function() {
  const wrapper = document.getElementById('avatarWrapper');
  const faceEl = document.getElementById('avatarFace');
  if (!wrapper || !faceEl) return;

  const faces = [
    { emoji: '🐱', label: 'cat', size: '60px' },
    { emoji: '😎', label: 'cool', size: '55px' },
    { emoji: '👑', label: 'crown', size: '50px' },
    { emoji: '🥳', label: 'party', size: '55px' },
    { emoji: '🥸', label: 'disguise', size: '55px' },
    { emoji: '🤩', label: 'star', size: '55px' }
  ];
  let current = -1;

  function showFace(index) {
    faceEl.style.backgroundImage = 'none';
    faceEl.style.fontSize = faces[index].size;
    faceEl.style.display = 'flex';
    faceEl.style.alignItems = 'center';
    faceEl.style.justifyContent = 'center';
    faceEl.textContent = faces[index].emoji;
    faceEl.classList.add('show');
  }

  function hideFace() {
    faceEl.classList.remove('show');
    setTimeout(() => { faceEl.textContent = ''; }, 300);
  }

  wrapper.addEventListener('click', function(e) {
    // If already showing, hide first
    if (faceEl.classList.contains('show')) {
      hideFace();
      // Then show next after a short delay for smooth transition
      setTimeout(() => {
        current = (current + 1) % faces.length;
        showFace(current);
      }, 350);
      return;
    }
    current = (current + 1) % faces.length;
    showFace(current);
  });

  // Auto-hide after 3 seconds
  let hideTimer;
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(m => {
      if (m.target.classList.contains('show') && m.oldValue === '' && m.target.classList.value.includes('show')) {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(hideFace, 3000);
      }
    });
  });
  observer.observe(faceEl, { attributes: true, attributeFilter: ['class'], attributeOldValue: true });
})();

// ===== 66. 首页雨滴 + 溅射涟漪 =====
(function() {
  const rainCanvas = document.getElementById('rainCanvas');
  const hero = document.querySelector('.hero');
  const ripplesContainer = document.getElementById('rainRipples');
  if (!rainCanvas || !hero || !ripplesContainer) return;

  const ctx = rainCanvas.getContext('2d');
  const drops = [];
  const DROP_COUNT = 80;

  function resizeRain() {
    rainCanvas.width = hero.offsetWidth;
    rainCanvas.height = hero.offsetHeight;
  }
  resizeRain();
  window.addEventListener('resize', resizeRain);

  for (let i = 0; i < DROP_COUNT; i++) {
    drops.push({
      x: Math.random() * (rainCanvas.width || hero.offsetWidth),
      y: Math.random() * (rainCanvas.height || hero.offsetHeight),
      len: 6 + Math.random() * 16,
      speed: 2.5 + Math.random() * 5,
      opacity: 0.08 + Math.random() * 0.28
    });
  }

  function getCollisionZones() {
    const elms = [
      document.querySelector('.navbar'),
      document.querySelector('.hero-card')
    ];
    const heroRect = hero.getBoundingClientRect();
    const zones = [];
    elms.forEach(el => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      zones.push({
        y: r.top - heroRect.top,
        x: r.left - heroRect.left,
        w: r.width
      });
      // Also bottom edge of navbar
      if (el.classList.contains('navbar')) {
        zones.push({
          y: r.bottom - heroRect.top,
          x: r.left - heroRect.left,
          w: r.width
        });
      }
    });
    return zones;
  }

  function createRipple(x, y) {
    const ripple = document.createElement('div');
    ripple.className = 'rain-ripple';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripplesContainer.appendChild(ripple);
    ripple.addEventListener('animationend', function() { ripple.remove(); });
  }

  function animate() {
    if (rainCanvas.width === 0) resizeRain();
    ctx.clearRect(0, 0, rainCanvas.width, rainCanvas.height);
    const zones = getCollisionZones();

    drops.forEach(d => {
      ctx.beginPath();
      ctx.moveTo(d.x, d.y);
      ctx.lineTo(d.x, d.y + d.len);
      ctx.strokeStyle = 'rgba(147,197,253,' + d.opacity + ')';
      ctx.lineWidth = 1;
      ctx.stroke();

      d.y += d.speed;

      for (const z of zones) {
        if (d.x > z.x && d.x < z.x + z.w &&
            d.y + d.len >= z.y && d.y <= z.y + 3) {
          createRipple(d.x, z.y);
          d.y = -d.len;
          d.x = Math.random() * rainCanvas.width;
          break;
        }
      }

      if (d.y > rainCanvas.height) {
        d.y = -d.len;
        d.x = Math.random() * rainCanvas.width;
      }
    });

    requestAnimationFrame(animate);
  }
  animate();
})();
