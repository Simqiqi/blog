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

// ===== 背景音乐：致爱丽丝 =====
(function() {
  let started = false;
  let audioCtx = null;

  function startMusic() {
    if (started) return;
    started = true;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    const bpm = 72;
    const eighth = 60 / bpm / 2;

    // 音符频率映射
    const N = {
      A2: 110, E3: 164.81, A3: 220,
      B3: 246.94, C4: 261.63, D4: 293.66,
      Ds4: 311.13, E4: 329.63, Gs4: 415.30,
      A4: 440, B4: 493.88, C5: 523.25,
      D5: 587.33, E5: 659.25, F5: 698.46,
      G5: 783.99,
    };

    function pianoNote(freq, startTime, duration, vol) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      // 钢琴包络
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(vol * 0.6, startTime + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    function padNote(freq, startTime, duration, vol) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, startTime);
      gain.gain.linearRampToValueAtTime(vol, startTime + 0.15);
      gain.gain.linearRampToValueAtTime(0, startTime + duration - 0.05);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration);
    }

    function playLoop() {
      const t = audioCtx.currentTime;
      const v = 0.22;

      // 旋律：[note, dur(eighth倍数), octaveMul]
      const melody = [
        ['E4', 1], ['Ds4', 1], ['E4', 1], ['Ds4', 1], ['E4', 1],
        ['B3', 1], ['D4', 1], ['C4', 1], ['A3', 2],
        [null, 1], ['C4', 1], ['E4', 1], ['A3', 1], ['B3', 2],
        [null, 1], ['E3', 1], ['Gs4', 1], ['B3', 1], ['C4', 2],
        [null, 1], ['E4', 1], ['Ds4', 1], ['E4', 1], ['Ds4', 1], ['E4', 1],
        ['B3', 1], ['D4', 1], ['C4', 1], ['A3', 2],
        [null, 1], ['C4', 1], ['E4', 1], ['A3', 1], ['B3', 2],
        [null, 1], ['E4', 1], ['C4', 1], ['B3', 1], ['A3', 2],
        [null, 2],
      ];

      let time = t + 0.1;
      melody.forEach(([note, dur]) => {
        if (note) {
          pianoNote(N[note], time, eighth * dur, v);
        }
        time += eighth * dur;
      });

      return time - t; // 返回循环长度
    }

    function playBass() {
      const t = audioCtx.currentTime + 0.1;
      // Am - E - Am - E 的低音进行
      const bass = [
        ['A2', 3], ['E3', 3], ['A2', 3], ['E3', 3],
        ['A2', 3], ['E3', 3], ['A2', 3], ['E3', 3],
        ['A2', 3], ['E3', 3], ['A2', 3], ['E3', 3],
        ['A2', 3], ['E3', 3], ['A2', 3], ['E3', 3],
      ];
      let time = t;
      bass.forEach(([note, beats]) => {
        padNote(N[note], time, eighth * beats * 3, 0.04);
        time += eighth * beats * 3;
      });
    }

    let loopDuration;
    function schedule() {
      loopDuration = playLoop();
      playBass();
      setTimeout(schedule, loopDuration * 950); // 比实际略短，无缝衔接
    }

    schedule();
  }

  document.addEventListener('click', startMusic, { once: true });
})();
