/**
 * now.js — 页脚「此刻」状态条
 *
 * 城市按访问者当前的公网 IP 自动定位（主：ipwho.is，备：ipapi.co），
 * 不再写死任何城市；实时天气来自 Open-Meteo（免费、无需 key）。
 *
 * 常见城市直接用本地表转中文，其余交给 Open-Meteo 地理编码；
 * 天气与城市名并行请求，页脚先出占位文案，拿到数据再更新。
 * 定位失败时只显示状态文案，绝不显示错误的城市。
 * 定位结果在 sessionStorage 缓存 30 分钟，减少跨页面重复请求。
 * 想改状态文案，改下面的 STATUSES 即可。
 */
(function () {
  'use strict';

  var LOC_CACHE_KEY = 'now-location-v1';
  var LOC_CACHE_TTL = 30 * 60 * 1000;

  var STATUSES = [
    '正在收集星光',
    '正在写点什么',
    '正在和猫发呆',
    '正在等一阵风',
    '正在把日子过成诗'
  ];

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

  // 常见城市直接转中文，省掉一次地理编码请求；未命中时再走在线查询
  var CN_CITY = {
    'Beijing': '北京', 'Shanghai': '上海', 'Guangzhou': '广州', 'Shenzhen': '深圳',
    'Hangzhou': '杭州', 'Chengdu': '成都', 'Wuhan': '武汉', 'Nanjing': '南京',
    'Xi\'an': '西安', 'Xian': '西安', 'Chongqing': '重庆', 'Tianjin': '天津',
    'Suzhou': '苏州', 'Changsha': '长沙', 'Zhengzhou': '郑州', 'Qingdao': '青岛',
    'Xiamen': '厦门', 'Hefei': '合肥', 'Fuzhou': '福州', 'Jinan': '济南',
    'Ningbo': '宁波', 'Dongguan': '东莞', 'Foshan': '佛山', 'Wuxi': '无锡',
    'Shenyang': '沈阳', 'Dalian': '大连', 'Kunming': '昆明', 'Guiyang': '贵阳',
    'Nanchang': '南昌', 'Harbin': '哈尔滨', 'Changchun': '长春', 'Shijiazhuang': '石家庄',
    'Taiyuan': '太原', 'Lanzhou': '兰州', 'Nanning': '南宁', 'Haikou': '海口',
    'Wenzhou': '温州', 'Changzhou': '常州', 'Xuzhou': '徐州', 'Zhuhai': '珠海',
    'Zhongshan': '中山', 'Huizhou': '惠州', 'Quanzhou': '泉州', 'Yantai': '烟台',
    'Weifang': '潍坊', 'Baoding': '保定', 'Taizhou': '台州', 'Shaoxing': '绍兴',
    'Urumqi': '乌鲁木齐', 'Hohhot': '呼和浩特', 'Yinchuan': '银川',
    'Xining': '西宁', 'Lhasa': '拉萨', 'Hong Kong': '中国香港',
    'Macao': '中国澳门', 'Macau': '中国澳门', 'Taipei': '中国台北',
    'Tokyo': '东京', 'Osaka': '大阪', 'Seoul': '首尔', 'Singapore': '新加坡',
    'Bangkok': '曼谷', 'London': '伦敦', 'Paris': '巴黎', 'Berlin': '柏林',
    'Moscow': '莫斯科', 'Sydney': '悉尼', 'Toronto': '多伦多',
    'Vancouver': '温哥华', 'New York': '纽约', 'Los Angeles': '洛杉矶',
    'San Francisco': '旧金山'
  };

  /* ---------- 小工具 ---------- */
  function getJSON(url, ms) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = ctrl ? setTimeout(function () { ctrl.abort(); }, ms || 8000) : null;
    var opts = ctrl ? { signal: ctrl.signal } : {};

    return fetch(url, opts).then(function (r) {
      if (!r.ok) throw new Error('HTTP ' + r.status);
      return r.json();
    }).then(function (d) {
      if (timer) clearTimeout(timer);
      return d;
    }, function (e) {
      if (timer) clearTimeout(timer);
      throw e;
    });
  }

  function weatherText(code) {
    for (var i = 0; i < WEATHER_MAP.length; i++) {
      if (WEATHER_MAP[i][0].indexOf(code) !== -1) {
        return WEATHER_MAP[i][2] + ' ' + WEATHER_MAP[i][1];
      }
    }
    return '';
  }

  function readCache() {
    try {
      var raw = sessionStorage.getItem(LOC_CACHE_KEY);
      if (!raw) return null;
      var d = JSON.parse(raw);
      if (d && d.city && isFinite(d.lat) && isFinite(d.lon) &&
          Date.now() - d.ts < LOC_CACHE_TTL) {
        return { city: d.city, lat: d.lat, lon: d.lon };
      }
    } catch (e) {}
    return null;
  }

  function writeCache(loc) {
    try {
      sessionStorage.setItem(LOC_CACHE_KEY, JSON.stringify({
        city: loc.city, lat: loc.lat, lon: loc.lon, ts: Date.now()
      }));
    } catch (e) {}
  }

  /* ---------- 定位 ---------- */
  // 本地表未命中时，用 Open-Meteo 地理编码查中文城市名
  function lookupChinese(name, countryCode) {
    if (!name) return Promise.resolve('');
    var url = 'https://geocoding-api.open-meteo.com/v1/search?name=' +
      encodeURIComponent(name) + '&count=8&language=zh&format=json';

    return getJSON(url, 10000).then(function (d) {
      var list = (d && d.results) || [];
      if (!list.length) return '';
      var same = countryCode ? list.filter(function (x) {
        return x.country_code === countryCode;
      }) : [];
      var pool = same.length ? same : list;
      pool.sort(function (a, b) { return (b.population || 0) - (a.population || 0); });
      return pool[0].name || '';
    }).catch(function () { return ''; });
  }

  function chineseName(info) {
    var mapped = CN_CITY[info.city] || CN_CITY[info.region] || '';
    if (mapped) return Promise.resolve(mapped);

    return lookupChinese(info.city, info.country_code).then(function (zh) {
      if (zh) return zh;
      if (info.region && info.region !== info.city) {
        return lookupChinese(info.region, info.country_code);
      }
      return '';
    }).then(function (zh) {
      return zh || info.city || info.region || '';
    });
  }

  function fromIpwho() {
    return getJSON('https://ipwho.is/', 6000).then(function (d) {
      if (!d || d.success === false || !isFinite(d.latitude) || !isFinite(d.longitude)) return null;
      return {
        city: d.city || d.region || '',
        region: d.region || '',
        country_code: d.country_code || '',
        lat: d.latitude,
        lon: d.longitude
      };
    }).catch(function () { return null; });
  }

  function fromIpapi() {
    return getJSON('https://ipapi.co/json/', 8000).then(function (d) {
      if (!d || d.error || !isFinite(d.latitude) || !isFinite(d.longitude)) return null;
      return {
        city: d.city || d.region || '',
        region: d.region || '',
        country_code: d.country_code || '',
        lat: d.latitude,
        lon: d.longitude
      };
    }).catch(function () { return null; });
  }

  // 返回原始定位信息；命中缓存时 city 已是中文
  function locate() {
    var cached = readCache();
    if (cached) {
      return Promise.resolve({
        city: cached.city, region: '', country_code: '',
        lat: cached.lat, lon: cached.lon, cached: true
      });
    }

    return fromIpwho().then(function (info) {
      return info ? info : fromIpapi();
    }).then(function (info) {
      if (!info) return null;
      info.cached = false;
      return info;
    }).catch(function () { return null; });
  }

  function fetchWeather(loc) {
    var url = 'https://api.open-meteo.com/v1/forecast?latitude=' + loc.lat +
      '&longitude=' + loc.lon +
      '&current=temperature_2m,weather_code&timezone=auto';

    return getJSON(url, 10000).then(function (d) {
      var cur = d && d.current;
      if (!cur) return null;
      return {
        weather: weatherText(cur.weather_code),
        temp: cur.temperature_2m
      };
    }).catch(function () { return null; });
  }

  /* ---------- 渲染 ---------- */
  function render(el, city, w, status) {
    var parts = ['此刻'];
    if (city) parts.push(city);
    if (w && w.weather) {
      parts.push(w.weather + (w.temp != null ? ' ' + Math.round(w.temp) + '°' : ''));
    }
    parts.push(status);

    // 用 textContent 写入第三方数据，避免任何注入风险
    el.innerHTML = '<i class="fa-solid fa-location-dot"></i> ';
    el.appendChild(document.createTextNode(parts.join(' · ')));
    el.title = city ? '城市按当前网络 IP 自动定位' : '';
    el.removeAttribute('hidden');
    el.classList.add('is-on');
  }

  function init() {
    var els = document.querySelectorAll('[data-now]');
    if (!els.length) return;

    var status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
    var fallback = function () {
      els.forEach(function (el) { render(el, '', null, status); });
    };

    // 先出占位，避免定位/天气慢时页脚长时间空白
    fallback();

    locate().then(function (loc) {
      if (!loc) return;

      var mapped = loc.cached ? loc.city : (CN_CITY[loc.city] || CN_CITY[loc.region] || '');
      var quick = loc.cached ? loc.city : (mapped || loc.city || loc.region || '');
      els.forEach(function (el) { render(el, quick, null, status); });

      var namePromise = (loc.cached || mapped)
        ? Promise.resolve(quick)
        : chineseName(loc);

      return Promise.all([namePromise, fetchWeather(loc)]).then(function (res) {
        var city = res[0] || quick;
        if (city && !loc.cached) {
          writeCache({ city: city, lat: loc.lat, lon: loc.lon });
        }
        els.forEach(function (el) { render(el, city, res[1], status); });
      });
    }).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
