/* 梦想页 · 灰色中国地图（高德足迹风）+ 沿边缘运动的光标
 * 数据：window.CHINA_MAP（DataV GeoAtlas 官方国标，含台湾/港澳/南海）
 */
(function () {
  'use strict';
  function init() {
    var mount = document.getElementById('chinaMap');
    if (!mount || !window.CHINA_MAP) return;
    var data = window.CHINA_MAP;
    var svgNS = 'http://www.w3.org/2000/svg';

    var svg = document.createElementNS(svgNS, 'svg');
    svg.setAttribute('class', 'map-svg');
    svg.setAttribute('viewBox', data.viewBox || '0 0 1000 1000');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

    // 点亮省份的渐变（青→紫）
    var defs = document.createElementNS(svgNS, 'defs');
    var grad = document.createElementNS(svgNS, 'linearGradient');
    grad.setAttribute('id', 'litGrad');
    grad.setAttribute('x1', '0'); grad.setAttribute('y1', '0');
    grad.setAttribute('x2', '1'); grad.setAttribute('y2', '1');
    var s1 = document.createElementNS(svgNS, 'stop');
    s1.setAttribute('offset', '0%'); s1.setAttribute('stop-color', '#22d3ee');
    var s2 = document.createElementNS(svgNS, 'stop');
    s2.setAttribute('offset', '100%'); s2.setAttribute('stop-color', '#a855f7');
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);
    svg.appendChild(defs);

    // 已点亮的足迹省份（DataV 官方全称）
    var LIT = {
      '宁夏回族自治区': '宁夏', '北京市': '北京', '陕西省': '陕西', '上海市': '上海',
      '浙江省': '浙江', '广东省': '广东', '香港特别行政区': '香港', '福建省': '福建',
      '湖南省': '湖南', '湖北省': '湖北', '甘肃省': '甘肃'
    };

    // 省份：未点亮为灰色，已点亮为霓虹发光
    data.provinces.forEach(function (pr) {
      if (!pr || !pr.d) return;
      var lit = LIT.hasOwnProperty(pr.name);
      var p = document.createElementNS(svgNS, 'path');
      p.setAttribute('class', 'province' + (lit ? ' lit' : ''));
      p.setAttribute('d', pr.d);
      // hover 显示省名（含别名）
      var title = document.createElementNS(svgNS, 'title');
      title.textContent = lit ? (pr.name + '（我的足迹 ✦ ' + LIT[pr.name] + '）') : pr.name;
      p.appendChild(title);
      svg.appendChild(p);
    });

    // 国界静止淡描边
    var outline = document.createElementNS(svgNS, 'path');
    outline.setAttribute('class', 'map-outline');
    outline.setAttribute('d', data.outline);
    svg.appendChild(outline);

    // 沿边缘运动的高亮光带
    var travel = document.createElementNS(svgNS, 'path');
    travel.setAttribute('class', 'map-travel');
    travel.setAttribute('d', data.outline);
    svg.appendChild(travel);

    // 光标光点 + 脉冲环
    var ring = document.createElementNS(svgNS, 'circle');
    ring.setAttribute('class', 'map-cursor-ring');
    ring.setAttribute('r', '9');
    svg.appendChild(ring);

    var dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('class', 'map-cursor');
    dot.setAttribute('r', '4.2');
    svg.appendChild(dot);

    mount.appendChild(svg);

    // ---- 光标动画 ----
    var L = 0;
    try { L = travel.getTotalLength(); } catch (e) { L = 0; }
    if (!L) return;
    var seg = Math.max(36, L * 0.012);      // 高亮段长度
    travel.style.strokeDasharray = seg + ' ' + L;
    var speed = L / 16000;                   // 约 16 秒绕一圈
    var pos = 0;                             // 当前头部位置（沿路径长度）
    var last = null;

    function frame(ts) {
      if (last == null) last = ts;
      var dt = ts - last; last = ts;
      pos += speed * dt;
      if (pos > L) pos -= L;
      // 高亮段头部在 pos，尾在 pos-seg
      travel.style.strokeDashoffset = (L - pos);
      try {
        var pt = travel.getPointAtLength(pos);
        dot.setAttribute('cx', pt.x);
        dot.setAttribute('cy', pt.y);
        ring.setAttribute('cx', pt.x);
        ring.setAttribute('cy', pt.y);
      } catch (e) {}
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    // 光标脉冲环（CSS 不便于对动态 cx 做 scale，这里用 JS 呼吸）
    var pulse = 0;
    setInterval(function () {
      pulse += 0.08;
      var o = 0.35 + 0.35 * Math.sin(pulse);
      ring.style.opacity = o.toFixed(2);
      var s = 1 + 0.4 * Math.sin(pulse);
      ring.setAttribute('r', (9 * s).toFixed(1));
    }, 40);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
