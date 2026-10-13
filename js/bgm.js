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

  // ===== 配置：在这里改音频源 =====
  // 本地文件：放到仓库 audio/ 目录，写相对路径，如 'audio/bgm.mp3'
  // 外链：填一个允许直链/热链的音频 URL（注意版权与防盗链）
  const BGM_TRACKS = [
    { name: '嘿嘿', mood: '背景音乐', src: 'https://simqiqi.github.io/blog/audio/bgm.mp3' }
  ];
  const BGM_DEFAULT_VOLUME = 0.15; // 0~0.5，和 slider 上限一致
  // ===============================

  const LS_ENABLED = 'bgm_enabled';
  const LS_VOLUME = 'bgm_volume';

  function buildPlayer() {
    const wrap = document.createElement('div');
    wrap.className = 'music-player';
    wrap.id = 'musicPlayer';
    wrap.innerHTML =
      '<button class="music-toggle" id="musicToggle" aria-label="音乐播放器">' +
        '<i class="fa-solid fa-music"></i>' +
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

    function loadTrack(i, autoplay) {
      idx = (i + tracks.length) % tracks.length;
      const t = tracks[idx];
      audio.src = t.src;
      if (nameEl) nameEl.textContent = t.name || '背景音乐';
      if (moodEl) moodEl.textContent = t.mood || '';
      if (single) {
        if (prevBtn) prevBtn.disabled = true;
        if (nextBtn) nextBtn.disabled = true;
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
          // 被自动播放策略拦截 —— 等首次用户交互再播
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

    // 初始加载（不自动播，交给下面的自动播放逻辑）
    loadTrack(0, false);

    // 自动播放：默认开启状态才尝试
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
