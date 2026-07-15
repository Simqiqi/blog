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

// ===== 环境背景音乐 =====
(function() {
  let started = false;
  let audioCtx = null;

  function startMusic() {
    if (started) return;
    started = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const now = audioCtx.currentTime;

    // 和弦：C大七 (C E G B) 低频铺垫
    const freqs = [130.81, 164.81, 196.00, 246.94]; // C3 E3 G3 B3
    const gains = [0.06, 0.045, 0.04, 0.035];

    freqs.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;
      osc.detune.value = (Math.random() - 0.5) * 8; // 轻微失谐

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(gains[i], now + 3);
      gain.gain.linearRampToValueAtTime(gains[i] * 0.7, now + 6);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(now);

      // 循环呼吸效果
      setInterval(() => {
        const t = audioCtx.currentTime;
        const breath = gains[i] * (0.7 + 0.3 * Math.sin(t * 0.3 + i));
        gain.gain.linearRampToValueAtTime(breath, t + 2);
      }, 4000);
    });

    // 高频泛音
    const airOsc = audioCtx.createOscillator();
    const airGain = audioCtx.createGain();
    airOsc.type = 'triangle';
    airOsc.frequency.value = 523.25; // C5
    airGain.gain.setValueAtTime(0, now);
    airGain.gain.linearRampToValueAtTime(0.015, now + 4);
    airOsc.connect(airGain);
    airGain.connect(audioCtx.destination);
    airOsc.start(now);
  }

  document.addEventListener('click', startMusic, { once: true });
})();
