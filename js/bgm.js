/**
 * 柒柒的博客 — 背景音乐播放器
 * 接通现有 #musicPlayer UI（并会在缺失的页面自动注入同款 DOM）。
 * 特性：
 *   - 自动播放：进页面即尝试播放；被浏览器策略拦截时，首次点击/滚动/按键后自动开始
 *   - 本地记忆：开关状态与音量（localStorage）
 *   - 单/多曲目：BGM_TRACKS 数组，prev/next 切换
 *   - 背景音乐循环播放（loop）
 *
 * 用法：把音频放进仓库（如 audio/bgm.mp3）或填一个可直链的 URL 到 src。
 */
(function () {
  'use strict';

  // ===== 配置：在这里改音频源 / 增删曲目 =====
  // 本地文件：放到仓库 audio/ 目录，写相对路径，如 'audio/bgm.mp3'
  // 外链：填一个允许直链/热链的音频 URL（注意版权与防盗链）
  // 想加歌：往数组里再 push 一项即可；每次进入站点（新开标签页）会随机挑一首播放。
  const BGM_TRACKS = [
    { name: '爱情讯息', mood: '在电波里悄悄心动', src: 'https://simqiqi.github.io/blog/audio/aiqing-xunxi.mp3' },
    { name: '跳楼机', mood: '坐上心跳的过山车', src: 'https://simqiqi.github.io/blog/audio/tiaolou-ji.mp3' },
    { name: '那个女孩', mood: '藏在回忆里的侧脸', src: 'https://simqiqi.github.io/blog/audio/nage-nvhai.mp3' },
    { name: '好久不见', mood: '时光里的老朋友', src: 'https://simqiqi.github.io/blog/audio/haojiu-bujian.mp3' },
    { name: '若是月亮还没来', mood: '等夜色给的温柔', src: 'https://simqiqi.github.io/blog/audio/ruguo-yueliang.mp3' }
    // 想加歌：往数组里再 push 一项即可；每次进入站点（新开标签页）会随机挑一首播放。
  ];
  const BGM_DEFAULT_VOLUME = 0.15; // 0~0.5，和 slider 上限一致
  // ===============================

  const LS_ENABLED = 'bgm_enabled';
  const LS_VOLUME = 'bgm_volume';
  const LS_LAST = 'bgm_last_idx';   // 上次退出前播放的曲目（localStorage，跨会话保留）
  const SS_IDX = 'bgm_idx';         // 当前标签页曲目（sessionStorage，翻页/刷新续播同一首）
  const SS_TIME = 'bgm_time';       // 当前标签页续播进度

  function buildPlayer() {
    const wrap = document.createElement('div');
    wrap.className = 'music-player';
    wrap.id = 'musicPlayer';
    wrap.innerHTML =
      '<button class="music-toggle" id="musicToggle" aria-label="音乐播放器">' +
        '<svg class="bgm-disc" viewBox="0 0 24 24" aria-hidden="true"><circle class="bgm-disc-outer" cx="12" cy="12" r="11"></circle><circle class="bgm-disc-groove" cx="12" cy="12" r="8.3"></circle><circle class="bgm-disc-groove" cx="12" cy="12" r="6.3"></circle><circle class="bgm-disc-label" cx="12" cy="12" r="3.7"></circle><circle class="bgm-disc-hole" cx="12" cy="12" r="1.2"></circle></svg>' +
      '</button>' +
      '<div class="music-panel" id="musicPanel">' +
        '<div class="track-info">' +
          '<div class="track-name" id="trackName"></div>' +
          '<div class="track-mood" id="trackMood"></div>' +
        '</div>' +
        '<div class="music-controls">' +
          '<button class="ctrl-btn" id="musicPrev"><i class="fa-solid fa-backward"></i></button>' +
          '<button class="ctrl-btn main-btn" id="musicPlay"><i class="fa-solid fa-play"></i></button>' +
          '<button class="ctrl-btn" id="musicNext"><i class="fa-solid fa-forward"></i></button>' +
        '</div>' +
        '<input type="range" class="volume-slider" id="volumeSlider" min="0" max="0.5" step="0.01" value="' +
          BGM_DEFAULT_VOLUME + '">' +
      '</div>';
    document.body.appendChild(wrap);
    return wrap;
  }

  function init() {
    let player = document.getElementById('musicPlayer');
    if (!player) player = buildPlayer();

    const toggleBtn = document.getElementById('musicToggle');
    const panel = document.getElementById('musicPanel');
    const playBtn = document.getElementById('musicPlay');
    const prevBtn = document.getElementById('musicPrev');
    const nextBtn = document.getElementById('musicNext');
    const vol = document.getElementById('volumeSlider');
    const nameEl = document.getElementById('trackName');
    const moodEl = document.getElementById('trackMood');

    const audio = document.createElement('audio');
    audio.loop = true;
    audio.preload = 'auto';

    let idx = 0;
    const tracks = BGM_TRACKS.filter(Boolean);
    const single = tracks.length <= 1;

    function loadTrack(i, autoplay, resumeTime) {
      idx = (i + tracks.length) % tracks.length;
      try { sessionStorage.setItem(SS_IDX, String(idx)); } catch (e) {}
      try { localStorage.setItem(LS_LAST, String(idx)); } catch (e) {}
      const t = tracks[idx];
      audio.src = t.src;
      if (nameEl) nameEl.textContent = t.name || '背景音乐';
      if (moodEl) moodEl.textContent = t.mood || '';
      if (single) {
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
      }
      if (resumeTime && resumeTime > 0.5) {
        const seek = function () {
          try { audio.currentTime = resumeTime; } catch (e) {}
          audio.removeEventListener('loadedmetadata', seek);
        };
        audio.addEventListener('loadedmetadata', seek);
      }
      if (autoplay) play();
    }

    function setPlayingUI(playing) {
      if (toggleBtn) toggleBtn.classList.toggle('playing', playing);
      if (playBtn) {
        playBtn.innerHTML = playing
          ? '<i class="fa-solid fa-pause"></i>'
          : '<i class="fa-solid fa-play"></i>';
      }
    }

    function play() {
      const p = audio.play();
      if (p && p.catch) {
        p.catch(function () {
          // 出声自动播放被浏览器策略拦截：退而求其次用「静音自动播放」，
          // 保证打开网页即开始播放（UI 显示播放中），首次交互再取消静音出声
          try {
            audio.muted = true;
            const p2 = audio.play();
            if (p2 && p2.catch) p2.catch(function () {});
          } catch (e) {}
          armFirstInteraction();
        });
      }
      setPlayingUI(true);
    }

    function pause() {
      audio.pause();
      setPlayingUI(false);
    }

    function togglePlay() {
      if (audio.paused) {
        localStorage.setItem(LS_ENABLED, '1');
        play();
      } else {
        localStorage.setItem(LS_ENABLED, '0');
        pause();
      }
    }

    let armed = false;
    function armFirstInteraction() {
      if (armed) return;
      armed = true;
      const go = function () {
        if (localStorage.getItem(LS_ENABLED) === '0') return; // 用户关过，不自动开
        audio.muted = false; // 取消静音，真正出声
        play();
        document.removeEventListener('click', go);
        document.removeEventListener('touchstart', go);
        document.removeEventListener('keydown', go);
        document.removeEventListener('scroll', go);
      };
      document.addEventListener('click', go, { passive: true });
      document.addEventListener('touchstart', go, { passive: true });
      document.addEventListener('keydown', go, { passive: true });
      document.addEventListener('scroll', go, { passive: true });
    }

    // 事件绑定
    if (toggleBtn) toggleBtn.addEventListener('click', function () {
      if (panel) panel.classList.toggle('open');
    });
    if (playBtn) playBtn.addEventListener('click', togglePlay);
    if (prevBtn) prevBtn.addEventListener('click', function () { loadTrack(idx - 1, true); });
    if (nextBtn) nextBtn.addEventListener('click', function () { loadTrack(idx + 1, true); });
    if (vol) {
      vol.value = localStorage.getItem(LS_VOLUME) || BGM_DEFAULT_VOLUME;
      audio.volume = parseFloat(vol.value);
      vol.addEventListener('input', function () {
        audio.volume = parseFloat(vol.value);
        localStorage.setItem(LS_VOLUME, vol.value);
      });
    }
    audio.addEventListener('play', function () { setPlayingUI(true); });
    audio.addEventListener('pause', function () { setPlayingUI(false); });

    // 跨页续播：把进度记下来，离开页面前再补存一次最新位置
    let lastSave = 0;
    audio.addEventListener('timeupdate', function () {
      const now = Date.now();
      if (now - lastSave > 2000) {
        lastSave = now;
        try { sessionStorage.setItem(SS_TIME, String(audio.currentTime)); } catch (e) {}
      }
    });
    window.addEventListener('beforeunload', function () {
      try { sessionStorage.setItem(SS_TIME, String(audio.currentTime)); } catch (e) {}
    });

    // 初始加载：
    //  - 同标签页内翻页 / 刷新：sessionStorage 有记录 → 续播同一首并续播进度
    //  - 退出博客后重新进入（新标签页）：sessionStorage 为空 → 随机挑一首，
    //    且刻意避开上一次退出前播放的曲目（localStorage 记录），保证「重进换新歌」
    let startIdx, resumeTime = 0;
    try {
      const s = sessionStorage.getItem(SS_IDX);
      if (s !== null && tracks[+s]) {
        startIdx = +s;
        resumeTime = parseFloat(sessionStorage.getItem(SS_TIME) || '0') || 0;
      } else {
        const last = parseInt(localStorage.getItem(LS_LAST) || '-1', 10);
        let r;
        do { r = Math.floor(Math.random() * tracks.length); }
        while (tracks.length > 1 && r === last);
        startIdx = r;
      }
    } catch (e) {
      startIdx = Math.floor(Math.random() * tracks.length);
    }
    loadTrack(startIdx, false, resumeTime > 0.5 ? resumeTime : 0);

    // 自动播放：默认开启状态才尝试（会从断点处继续）
    const enabled = localStorage.getItem(LS_ENABLED);
    if (enabled !== '0') {
      play(); // 若被拦截，play() 内部会挂首次交互回退
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
