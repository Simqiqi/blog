/**
 * now.js — 页脚「此刻」状态条
 * 显示：此刻 · 城市 天气 温度 · 一句状态
 * 天气数据来自 Open-Meteo（免费、无需 key），失败时静默降级为纯文案。
 *
 * 自定义：改下面的 NOW_CONFIG 即可（城市、经纬度、状态文案轮播）。
 */
(function () {
  'use strict';

  var NOW_CONFIG = {
    city: '深圳',
    lat: 22.54,
    lon: 114.06,
    // 状态文案（随机挑一句展示）
    statuses: [
      '正在收集星光',
      '正在写点什么',
      '正在和猫发呆',
      '正在等一阵风',
      '正在把日子过成诗'
    ]
  };

  var WEATHER_MAP = [
    [[0], '晴', '☀️'],
    [[1, 2], '多云', '⛅'],
    [[3], '阴', '☁️'],
    [[45, 48], '雾', '🌫️'],
    [[51, 53, 55, 56, 57], '毛毛雨', '🌦️'],
    [[61, 63, 65, 66, 67, 80, 81, 82], '雨', '🌧️'],
    [[71, 73, 75, 77, 85, 86], '雪', '🌨️'],
    [[95, 96, 99], '雷阵雨', '⛈️']
  ];

  function weatherText(code) {
    for (var i = 0; i < WEATHER_MAP.length; i++) {
      if (WEATHER_MAP[i][0].indexOf(code) !== -1) {
        return WEATHER_MAP[i][2] + ' ' + WEATHER_MAP[i][1];
      }
    }
    return '';
  }

  function render(el, weather, temp) {
    var status = NOW_CONFIG.statuses[Math.floor(Math.random() * NOW_CONFIG.statuses.length)];
    var parts = ['此刻 · ' + NOW_CONFIG.city];
    if (weather) parts.push(weather + (temp != null ? ' ' + Math.round(temp) + '°' : ''));
    parts.push(status);
    el.innerHTML = '<i class="fa-solid fa-location-dot"></i> ' + parts.join(' · ');
    el.removeAttribute('hidden');
    el.classList.add('is-on');
  }

  function init() {
    var els = document.querySelectorAll('[data-now]');
    if (!els.length) return;

    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + NOW_CONFIG.lat +
      '&longitude=' + NOW_CONFIG.lon +
      '&current=temperature_2m,weather_code&timezone=auto';

    fetch(url)
      .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
      .then(function (d) {
        var cur = d && d.current;
        els.forEach(function (el) {
          render(el, cur ? weatherText(cur.weather_code) : '', cur ? cur.temperature_2m : null);
        });
      })
      .catch(function () {
        els.forEach(function (el) { render(el, '', null); });
      });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
