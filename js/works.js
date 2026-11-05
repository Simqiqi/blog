/* ============================================================
   作品页脚本 works.js
   - 读取 works.json 渲染卡片（全站同款数据驱动套路）
   - 分类筛选 / 关键词搜索 / 一键复制链接 / 鼠标柔光
   - ?edit=1 进入站长编辑模式：可视化录入作品，导出 works.json
   无外部依赖
   ============================================================ */
(function () {
  'use strict';

  var DRAFT_KEY = 'works-draft-v1';
  var DEFAULT_RGB = '0, 229, 255';
  var DEFAULT_COLOR = '#00e5ff';

  var STATUS = {
    online:   { label: '在线',    cls: 'status-online' },
    wip:      { label: '开发中',  cls: 'status-wip' },
    archived: { label: '已归档',  cls: 'status-archived' }
  };

  var isEdit = new URLSearchParams(location.search).get('edit') === '1';

  var grid      = document.getElementById('worksGrid');
  var emptyBox  = document.getElementById('worksEmpty');
  var filters   = document.getElementById('worksFilters');
  var search    = document.getElementById('worksSearch');
  var resultLine= document.getElementById('worksResultLine');
  var editBar   = document.getElementById('worksEditBar');
  var editor    = document.getElementById('worksEditor');
  if (!grid) return;

  var published = [];   // works.json 里的正式数据
  var items = [];       // 当前用于展示的数据（编辑模式下可能是草稿）
  var draft = null;     // localStorage 草稿（null = 未创建）
  var activeCategory = '全部';
  var keyword = '';

  /* ---------- 小工具 ---------- */
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  function safeUrl(u) {
    var s = String(u || '').trim();
    if (!s || s === '#') return '#';
    if (/^(https?:\/\/|mailto:)/i.test(s)) return s;
    if (/^[\w.-]+\.[a-z]{2,}/i.test(s)) return 'https://' + s; // 允许省略协议
    return '#';                                                  // 拦截 javascript: 等
  }

  function toRgb(hex) {
    var s = String(hex || '').trim();
    if (/^#[0-9a-f]{3}$/i.test(s)) {
      return [parseInt(s[1] + s[1], 16), parseInt(s[2] + s[2], 16), parseInt(s[3] + s[3], 16)].join(', ');
    }
    if (/^#[0-9a-f]{6}$/i.test(s)) {
      return [parseInt(s.slice(1, 3), 16), parseInt(s.slice(3, 5), 16), parseInt(s.slice(5, 7), 16)].join(', ');
    }
    return DEFAULT_RGB;
  }

  function safeColor(hex) {
    return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(String(hex || '').trim()) ? hex.trim() : DEFAULT_COLOR;
  }

  function safeIcon(icon) {
    var cleaned = String(icon || '').toLowerCase().replace(/[^a-z0-9 \-]/g, '').trim();
    return cleaned || 'fa-solid fa-cube';
  }

  function cleanDomain(url) {
    return String(url || '')
      .replace(/^https?:\/\//i, '')
      .replace(/\/$/, '');
  }

  // tags 允许是数组，也允许是逗号分隔的字符串
  function tagText(w) {
    var t = w.tags;
    return (Array.isArray(t) ? t : String(t == null ? '' : t).split(/[,，]/)).join(' ');
  }

  function readDraft() {
    try {
      var raw = localStorage.getItem(DRAFT_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) { return null; }
  }

  function saveDraft(data) {
    draft = data;
    try { localStorage.setItem(DRAFT_KEY, JSON.stringify(data)); } catch (e) {}
  }

  function notify(msg) {
    var el = document.getElementById('editorMsg');
    if (!el) return;
    el.textContent = msg;
    clearTimeout(notify._t);
    notify._t = setTimeout(function () { el.textContent = ''; }, 3200);
  }

  /* ---------- 卡片模板 ---------- */
  function cardHtml(w, i) {
    var color = safeColor(w.color);
    var rgb = toRgb(color);
    var url = safeUrl(w.url);
    var source = safeUrl(w.source);
    var status = STATUS[w.status] || STATUS.online;
    var tags = (Array.isArray(w.tags) ? w.tags : String(w.tags || '').split(','))
      .map(function (t) { return String(t).trim(); })
      .filter(Boolean).slice(0, 6);

    var searchBlob = [w.name, w.desc, w.url, w.category, tagText(w)]
      .join(' ').toLowerCase();

    return '<article class="work-card' + (w.featured ? ' is-featured' : '') + '"' +
      ' style="--work-color:' + esc(color) + ';--work-rgb:' + rgb + ';animation-delay:' + Math.min(i * 45, 360) + 'ms"' +
      ' data-category="' + esc(w.category || '其他') + '" data-search="' + esc(searchBlob) + '">' +
      '<div class="work-card-top">' +
        '<span class="work-index">NO.' + String(i + 1).padStart(2, '0') + (w.year ? ' · ' + esc(w.year) : '') + '</span>' +
        '<span class="work-status ' + status.cls + '"><i class="fa-solid fa-circle"></i>' + status.label + '</span>' +
      '</div>' +
      '<div class="work-icon"><i class="' + safeIcon(w.icon) + '"></i></div>' +
      '<h3 class="work-name">' + esc(w.name || '未命名作品') +
        (w.featured ? '<span class="work-badge-featured">★ 精选</span>' : '') + '</h3>' +
      '<p class="work-desc">' + esc(w.desc || '这个作品还没有写简介。') + '</p>' +
      (tags.length ? '<div class="work-tags">' + tags.map(function (t) {
        return '<span class="work-tag">' + esc(t) + '</span>';
      }).join('') + '</div>' : '') +
      '<div class="work-url-row">' +
        '<i class="fa-solid fa-link"></i>' +
        '<span class="work-url-text" title="' + esc(url) + '">' + esc(cleanDomain(url)) + '</span>' +
        '<button class="work-copy" type="button" data-url="' + esc(url) + '" title="复制链接" aria-label="复制链接">' +
          '<i class="fa-regular fa-copy"></i>' +
        '</button>' +
      '</div>' +
      '<div class="work-actions">' +
        '<a class="work-visit' + (url === '#' ? ' is-disabled' : '') + '" href="' + esc(url) + '"' +
          ' target="_blank" rel="noopener noreferrer">访问作品 <i class="fa-solid fa-arrow-up-right-from-square"></i></a>' +
        (source !== '#' ? '<a class="work-source" href="' + esc(source) + '" target="_blank" rel="noopener noreferrer" title="源码"><i class="fa-brands fa-github"></i></a>' : '') +
      '</div>' +
    '</article>';
  }

  function soonCardHtml() {
    return '<div class="work-card work-card--soon" style="animation-delay:360ms">' +
      '<div class="soon-icon"><i class="fa-regular fa-hourglass-half"></i></div>' +
      '<h3>下一个，还在路上</h3>' +
      '<p>想法总比时间多一点点，<br>慢慢来，反正也不着急。</p>' +
    '</div>';
  }

  /* ---------- 渲染 ---------- */
  function renderFilters() {
    if (!filters) return;
    var counts = {};
    items.forEach(function (w) {
      var c = w.category || '其他';
      counts[c] = (counts[c] || 0) + 1;
    });
    var cats = ['全部'].concat(Object.keys(counts));
    filters.innerHTML = cats.map(function (c) {
      var n = c === '全部' ? items.length : counts[c];
      return '<button type="button" class="works-chip' + (c === activeCategory ? ' active' : '') +
        '" data-cat="' + esc(c) + '">' + esc(c) +
        '<span class="chip-count">' + n + '</span></button>';
    }).join('');
  }

  function renderStats() {
    var total = items.length;
    var online = items.filter(function (w) { return (w.status || 'online') === 'online'; }).length;
    var years = items.map(function (w) { return parseInt(w.year, 10); }).filter(function (n) { return !isNaN(n); });
    var latest = years.length ? Math.max.apply(null, years) : '—';
    var set = function (id, val) { var el = document.getElementById(id); if (el) el.textContent = val; };
    set('worksCount', total);
    set('worksOnline', online);
    set('worksLatest', latest);
  }

  function render() {
    renderStats();

    var list = items.filter(function (w) {
      var catOk = activeCategory === '全部' || (w.category || '其他') === activeCategory;
      var kwOk = !keyword || [w.name, w.desc, w.url, w.category, tagText(w)]
        .join(' ').toLowerCase().indexOf(keyword) !== -1;
      return catOk && kwOk;
    });

    var showSoon = activeCategory === '全部' && !keyword;
    grid.innerHTML = list.map(cardHtml).join('') + (showSoon ? soonCardHtml() : '');

    // 入场动画
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(grid.querySelectorAll('.work-card'), function (el) {
        el.classList.add('in');
      });
    });

    if (emptyBox) emptyBox.hidden = list.length > 0;
    grid.hidden = list.length === 0;
    if (resultLine) {
      resultLine.textContent = (activeCategory !== '全部' || keyword)
        ? '筛选出 ' + list.length + ' 件 · 共 ' + items.length + ' 件'
        : '共 ' + items.length + ' 件作品';
    }

    renderFilters();
    renderEditorList();
  }

  /* ---------- 交互 ---------- */
  if (filters) {
    filters.addEventListener('click', function (e) {
      var chip = e.target.closest('.works-chip');
      if (!chip) return;
      activeCategory = chip.dataset.cat;
      render();
    });
  }

  if (search) {
    search.addEventListener('input', function () {
      keyword = search.value.trim().toLowerCase();
      render();
    });
  }

  // 鼠标跟随柔光
  grid.addEventListener('mousemove', function (e) {
    var card = e.target.closest('.work-card');
    if (!card || card.classList.contains('work-card--soon')) return;
    var r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });

  // 复制链接
  grid.addEventListener('click', function (e) {
    var btn = e.target.closest('.work-copy');
    if (!btn) return;
    e.preventDefault();
    var url = btn.dataset.url;
    if (!url || url === '#') return;

    var done = function () {
      btn.classList.add('copied');
      var icon = btn.querySelector('i');
      if (icon) icon.className = 'fa-solid fa-check';
      btn.title = '已复制';
      setTimeout(function () {
        btn.classList.remove('copied');
        if (icon) icon.className = 'fa-regular fa-copy';
        btn.title = '复制链接';
      }, 1800);
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url).then(done).catch(function () { legacyCopy(url, done); });
    } else {
      legacyCopy(url, done);
    }
  });

  function legacyCopy(text, cb) {
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); cb(); } catch (err) {}
    document.body.removeChild(ta);
  }

  /* ---------- 编辑模式 ---------- */
  function renderEditorList() {
    var box = document.getElementById('editorList');
    if (!box || !isEdit) return;
    var data = draft || [];
    box.innerHTML = '<h3>当前草稿（' + data.length + ' 条）</h3>' +
      (data.length ? data.map(function (w, i) {
        return '<div class="editor-item">' +
          '<span class="item-dot" style="background:' + esc(safeColor(w.color)) + '"></span>' +
          '<span class="item-name">' + esc(w.name) + '</span>' +
          '<span class="item-url">' + esc(cleanDomain(safeUrl(w.url))) + '</span>' +
          '<button type="button" data-del="' + i + '" title="删除"><i class="fa-solid fa-trash-can"></i></button>' +
        '</div>';
      }).join('') : '<p style="font-size:.78rem;color:var(--text-dim);line-height:1.8">草稿还是空的。点「载入线上数据」把现有作品拿进来编辑，或直接新增一条。</p>');
  }

  function exportData() {
    return (draft || []).map(function (w) {
      var out = {};
      Object.keys(w).forEach(function (k) { if (k !== 'demo') out[k] = w[k]; });
      return out;
    });
  }

  function setupEditor() {
    if (!isEdit) return;
    if (editBar) editBar.hidden = false;
    if (editor) editor.hidden = false;

    var listBox = document.getElementById('editorList');
    if (listBox) {
      listBox.addEventListener('click', function (e) {
        var btn = e.target.closest('[data-del]');
        if (!btn) return;
        var data = (draft || []).slice();
        data.splice(parseInt(btn.dataset.del, 10), 1);
        saveDraft(data);
        items = data;
        render();
        notify('已删除该条草稿');
      });
    }

    var form = document.getElementById('editorForm');
    if (form) {
      form.addEventListener('submit', function (e) {
        e.preventDefault();
        var val = function (id) { var el = document.getElementById(id); return el ? el.value.trim() : ''; };
        var name = val('edName');
        var rawUrl = val('edUrl');
        if (!name || !rawUrl) { notify('作品名称和网址是必填项'); return; }

        var url = safeUrl(rawUrl);
        if (url === '#') { notify('网址格式不太对，请填 https:// 开头的完整地址'); return; }

        var entry = {
          name: name,
          desc: val('edDesc') || '这个作品还没有写简介。',
          url: url,
          source: safeUrl(val('edSource')) === '#' ? '' : safeUrl(val('edSource')),
          icon: safeIcon(val('edIcon')),
          color: safeColor(val('edColor')),
          tags: val('edTags').split(/[,，]/).map(function (t) { return t.trim(); }).filter(Boolean),
          category: val('edCategory') || '其他',
          status: val('edStatus') || 'online',
          year: val('edYear') || String(new Date().getFullYear())
        };

        var data = (draft === null ? published.slice() : draft.slice());
        data.push(entry);
        saveDraft(data);
        items = data;
        render();
        form.reset();
        notify('已加入草稿，别忘了导出 works.json');
      });
    }

    var on = function (id, fn) { var el = document.getElementById(id); if (el) el.addEventListener('click', fn); };

    on('edLoad', function () {
      saveDraft(published.map(function (w) { return Object.assign({}, w); }));
      items = draft;
      render();
      notify('已把线上作品载入草稿');
    });

    on('edCopy', function () {
      var text = JSON.stringify(exportData(), null, 2);
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(function () { notify('已复制，覆盖 works.json 即可'); })
          .catch(function () { legacyCopy(text, function () { notify('已复制，覆盖 works.json 即可'); }); });
      } else {
        legacyCopy(text, function () { notify('已复制，覆盖 works.json 即可'); });
      }
    });

    on('edDownload', function () {
      var blob = new Blob([JSON.stringify(exportData(), null, 2)], { type: 'application/json;charset=utf-8' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'works.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      notify('已下载 works.json，替换仓库根目录的同名文件');
    });

    on('edClear', function () {
      saveDraft([]);
      items = [];
      render();
      notify('草稿已清空');
    });
  }

  /* ---------- 启动 ---------- */
  (async function init() {
    try {
      var resp = await fetch('works.json', { cache: 'no-store' });
      if (resp.ok) {
        var data = await resp.json();
        if (Array.isArray(data)) published = data;
      }
    } catch (e) {
      console.warn('works.json 加载失败（本地预览请起 http 服务）', e);
    }

    draft = readDraft();
    items = (isEdit && Array.isArray(draft)) ? draft : published;

    setupEditor();
    render();

    if (!published.length && !items.length && emptyBox) {
      var p = emptyBox.querySelector('p');
      if (p) p.innerHTML = '还没加载出作品数据。请确认根目录有 <code>works.json</code>，<br>并通过本地服务器（如 <code>python3 -m http.server</code>）打开页面。';
    }
  })();
})();
