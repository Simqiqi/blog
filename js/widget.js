/* ============================================================
   全站增强组件脚本（widget.js）
   看板娘网页宠物：右下角 Q 版小人 + 对话气泡 + 关键词问答
   无外部依赖，自动渲染，移动端适配
   ============================================================ */
(function () {
  'use strict';

  /* 防止重复初始化 */
  if (document.getElementById('kanban-girl-root')) return;

  /* ---------- 对话库 ---------- */
  var DIALOGS = [
    '欢迎来到柒柒的小窝，今天过得怎么样？',
    '你好呀，我是住在这个博客角落的小管家。',
    '想看文章的话，点上方「博客」就能走进 3D 书架啦。',
    '页面右下角有个火箭按钮，往下翻久了，点它就能嗖的一下回到顶部。',
    '右上角那个太阳月亮按钮，可以一键切换深色浅色模式，刷新之后也会记住你的选择哦。',
    '认真读文章时，页面最顶端会有一根彩色的进度条，悄悄告诉你读到了哪里。',
    '写博客的人一定很用心，值得你多翻几篇看看。',
    '累了就歇一歇，喝口水再看也不迟。',
    '悄悄告诉你，留言墙可以扔瓶子，想说的话都可以写下来。',
    '我正在努力变得更可爱，多多包涵呀。',
    '今天的你也很棒，继续加油。',
    '记得常来，我每天都在这里等你。'
  ];

  /* 关键词 -> 回复 */
  var RULES = [
    { keys: ['你好', '嗨', '哈喽', 'hello', 'hi', '在吗', '嗨喽'], reply: '你好呀，见到你真开心。想逛逛博客，还是想找我聊聊天？' },
    { keys: ['你是谁', '名字', '叫什么', '小管家', '看板娘'], reply: '我是柒柒博客的小管家，一只住在页面角落的看板娘，负责陪你逛博客、随时解闷。' },
    { keys: ['文章', '博客', '书架', '书', '看什么'], reply: '点导航栏的「博客」就能进书架啦，左右滑动书架、点一下书本就能翻开阅读。' },
    { keys: ['主题', '暗夜', '深色', '浅色', '白天', '黑夜', '皮肤', '亮'], reply: '右上角那个太阳月亮按钮就是主题开关，一键切换深色浅色，而且会自动记住你的选择，下次打开还是你喜欢的风格。' },
    { keys: ['进度', '顶部', '回顶', '火箭', '滚动'], reply: '读文章的时候，页面最顶端的彩色进度条会显示阅读进度；右下角的火箭按钮，点一下就能瞬间回到顶部。' },
    { keys: ['留言', '瓶子', '留言墙', '评论'], reply: '「留言墙」可以扔漂流瓶，把你的想法写下来，博主会认真看的。' },
    { keys: ['音乐', '歌', '播放', '声音'], reply: '页面右下角有个迷你音乐播放器，点一下就能播放安静的背景音乐，音量也可以自己调。' },
    { keys: ['累', '困', '烦', '难过', '不开心', '加油'], reply: '抱抱你，累了就歇一歇。今天已经做得很好了，明天会更好的。' },
    { keys: ['谢谢', '感谢', '辛苦了', '爱你', '喜欢'], reply: '不客气呀，能陪着你逛博客，我也很开心。' },
    { keys: ['再见', '拜拜', '走了', '晚安', '睡了'], reply: '拜拜，路上小心，记得常回来看看我。晚安好梦。' }
  ];
  var FALLBACK = [
    '嗯嗯，我在听。你也可以问我博客、主题、留言墙相关的事情哦。',
    '这个话题我还有点小迷糊，不如聊聊博客和文章？',
    '嘿嘿，我听不太懂，不过没关系，陪你待着也很好。'
  ];

  var state = {
    index: -1,
    typing: false,
    timer: null
  };

  /* ---------- DOM 构建 ---------- */
  var root = document.createElement('div');
  root.id = 'kanban-girl-root';
  root.className = 'kanban-root';
  root.innerHTML =
    '<div class="kanban-bubble" id="kanbanBubble">' +
      '<div class="kanban-bubble-text" id="kanbanBubbleText"></div>' +
      '<div class="kanban-bubble-actions">' +
        '<button type="button" id="kanbanNext">换一句</button>' +
        '<button type="button" id="kanbanClose">收起</button>' +
      '</div>' +
      '<div class="kanban-chat-input">' +
        '<input type="text" id="kanbanChat" placeholder="和我说点什么..." maxlength="60">' +
        '<button type="button" class="kanban-send" id="kanbanSend">发送</button>' +
      '</div>' +
      '<div class="kanban-bubble-tail"></div>' +
    '</div>' +
    '<div class="kanban-girl" id="kanbanGirl" title="戳我聊天">' +
      '<div class="kanban-first-tip" id="kanbanTip">戳我聊天</div>' +
      '<svg viewBox="0 0 120 140" xmlns="http://www.w3.org/2000/svg">' +
        '<defs>' +
          '<linearGradient id="kanbanDress" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#8b5cf6"/>' +
            '<stop offset="100%" stop-color="#6d28d9"/>' +
          '</linearGradient>' +
          '<linearGradient id="kanbanHair" x1="0" y1="0" x2="0" y2="1">' +
            '<stop offset="0%" stop-color="#4f46e5"/>' +
            '<stop offset="100%" stop-color="#312e81"/>' +
          '</linearGradient>' +
        '</defs>' +
        '<g class="kanban-body-wrap">' +
          '<ellipse cx="60" cy="132" rx="44" ry="7" fill="rgba(0,0,0,0.22)"/>' +
          '<path d="M42 96 Q42 76 60 76 Q78 76 78 96 L74 122 Q60 130 46 122 Z" fill="url(#kanbanDress)"/>' +
          '<path d="M46 92 L50 118 L56 120 L56 94 Z" fill="rgba(255,255,255,0.14)"/>' +
          '<ellipse cx="38" cy="122" rx="17" ry="8" fill="url(#kanbanDress)"/>' +
          '<ellipse cx="82" cy="122" rx="17" ry="8" fill="url(#kanbanDress)"/>' +
          '<ellipse cx="40" cy="121" rx="8" ry="4" fill="#f6c1a0" opacity="0.9"/>' +
          '<ellipse cx="80" cy="121" rx="8" ry="4" fill="#f6c1a0" opacity="0.9"/>' +
          '<ellipse cx="36" cy="92" rx="9" ry="13" fill="#f6c1a0" transform="rotate(22 36 92)"/>' +
          '<ellipse cx="84" cy="92" rx="9" ry="13" fill="#f6c1a0" transform="rotate(-22 84 92)"/>' +
          '<circle cx="36" cy="84" r="4" fill="rgba(255,255,255,0.25)"/>' +
          '<circle cx="84" cy="84" r="4" fill="rgba(255,255,255,0.25)"/>' +
          '<circle cx="60" cy="48" r="30" fill="#f6c1a0"/>' +
          '<path d="M28 46 Q30 22 60 18 Q90 22 92 46 Q70 52 60 44 Q50 52 28 46 Z" fill="url(#kanbanHair)"/>' +
          '<path class="kanban-ahoge" d="M60 16 Q56 2 68 3 Q72 8 62 12 Z" fill="#4f46e5"/>' +
          '<g class="kanban-eyes">' +
            '<ellipse cx="50" cy="50" rx="4.6" ry="6.2" fill="#1e1b4b"/>' +
            '<ellipse cx="70" cy="50" rx="4.6" ry="6.2" fill="#1e1b4b"/>' +
            '<circle cx="51.8" cy="47.2" r="1.7" fill="#fff"/>' +
            '<circle cx="71.8" cy="47.2" r="1.7" fill="#fff"/>' +
          '</g>' +
          '<ellipse cx="42" cy="58" rx="5" ry="3" fill="#fda4af" opacity="0.75"/>' +
          '<ellipse cx="78" cy="58" rx="5" ry="3" fill="#fda4af" opacity="0.75"/>' +
          '<path class="kanban-mouth" d="M55 60 Q60 64 65 60" stroke="#be123c" stroke-width="1.6" fill="none" stroke-linecap="round"/>' +
          '<path class="kanban-mouth-open" d="M54 60 Q60 68 66 60 Z" fill="#be123c"/>' +
        '</g>' +
      '</svg>' +
    '</div>';

  document.body.appendChild(root);

  var bubble = document.getElementById('kanbanBubble');
  var textEl = document.getElementById('kanbanBubbleText');
  var girl = document.getElementById('kanbanGirl');
  var tip = document.getElementById('kanbanTip');
  var chatInput = document.getElementById('kanbanChat');
  var sendBtn = document.getElementById('kanbanSend');

  /* ---------- 打字机输出 ---------- */
  function typeText(str, done) {
    if (state.typing) return;
    state.typing = true;
    textEl.innerHTML = '';
    var i = 0;
    var cursor = document.createElement('span');
    cursor.className = 'cursor';
    textEl.appendChild(cursor);

    function tick() {
      if (i < str.length) {
        cursor.insertAdjacentText('beforebegin', str.charAt(i));
        i++;
        setTimeout(tick, 30);
      } else {
        cursor.remove();
        state.typing = false;
        if (done) done();
      }
    }
    tick();
  }

  function showBubble() {
    bubble.classList.add('show');
  }

  function hideBubble() {
    bubble.classList.remove('show');
  }

  function say(str) {
    if (state.timer) clearTimeout(state.timer);
    showBubble();
    if (state.typing) {
      /* 打断正在进行的打字，直接展示 */
      textEl.innerHTML = '';
      state.typing = false;
    }
    typeText(str);
    state.timer = setTimeout(hideBubble, 9000);
  }

  function nextDialog() {
    state.index = (state.index + 1) % DIALOGS.length;
    say(DIALOGS[state.index]);
  }

  /* ---------- 关键词问答 ---------- */
  function answer(input) {
    var text = (input || '').toLowerCase().replace(/\s+/g, '');
    for (var i = 0; i < RULES.length; i++) {
      for (var j = 0; j < RULES[i].keys.length; j++) {
        if (text.indexOf(RULES[i].keys[j]) !== -1) {
          return RULES[i].reply;
        }
      }
    }
    return FALLBACK[Math.floor(Math.random() * FALLBACK.length)];
  }

  /* ---------- 事件绑定 ---------- */
  girl.addEventListener('click', function () {
    if (tip) tip.style.display = 'none';
    if (bubble.classList.contains('show')) {
      nextDialog();
    } else {
      state.index = (state.index + 1) % DIALOGS.length;
      say(DIALOGS[state.index]);
    }
  });

  /* 双击：开心一下 */
  girl.addEventListener('dblclick', function () {
    girl.classList.add('happy');
    say('嘿嘿，被你发现我在偷偷开心啦。');
    setTimeout(function () { girl.classList.remove('happy'); }, 2600);
  });

  document.getElementById('kanbanNext').addEventListener('click', function (e) {
    e.stopPropagation();
    nextDialog();
  });

  document.getElementById('kanbanClose').addEventListener('click', function (e) {
    e.stopPropagation();
    hideBubble();
    if (state.timer) clearTimeout(state.timer);
  });

  function send() {
    var v = (chatInput.value || '').trim();
    if (!v) return;
    chatInput.value = '';
    say(answer(v));
  }

  sendBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    send();
  });

  chatInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      e.stopPropagation();
      send();
    }
  });

  /* 首次出现的欢迎语 */
  setTimeout(function () {
    if (tip) tip.style.display = 'none';
    state.index = 0;
    say(DIALOGS[0]);
  }, 1500);
})();
