/**
 * Vercel 无服务器函数 — 匿名留言后端
 * 存储：博客仓库 GitHub Issues（标签 comment:<page>）
 * 环境变量：
 *   GH_TOKEN  —— 具备 public_repo 权限的 GitHub Personal Access Token
 *   GH_REPO   —— 仓库名，默认 Simqiqi/blog
 *
 * 路由：
 *   GET  /api/comments?page=<页面标识>  → 列出该页留言（已关闭的隐藏）
 *   POST /api/comments                 → 新增留言 { page, nick, text, hp }
 * GET 不需要鉴权；POST 由本函数持有 GH_TOKEN 代发，访客无需登录。
 */

const REPO = process.env.GH_REPO || 'Simqiqi/blog';
const TOKEN = process.env.GH_TOKEN || '';
const LABEL = 'comment:';

function send(res, code, obj, origin) {
  res.writeHead(code, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  });
  res.end(JSON.stringify(obj));
}

function clean(s, max) {
  return String(s == null ? '' : s).slice(0, max).trim();
}

async function gh(path, opts) {
  return fetch('https://api.github.com' + path, {
    ...opts,
    headers: {
      Authorization: 'Bearer ' + TOKEN,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'blog-comments',
      'Content-Type': 'application/json',
      ...(opts && opts.headers || {})
    }
  });
}

// 最简每 IP 每分钟限流（serverless 实例间不共享，仅尽力而为）
const hits = new Map();
function rateLimited(ip) {
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 10;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (req.method === 'OPTIONS') return send(res, 204, {}, origin);

  const url = new URL(req.url, 'http://localhost');
  const page = clean(url.searchParams.get('page'), 120) || 'home';

  if (req.method === 'GET') {
    try {
      const r = await gh(
        `/repos/${REPO}/issues?labels=${encodeURIComponent(LABEL + page)}&state=all&per_page=100&sort=created&direction=asc`
      );
      const issues = await r.json();
      const list = (Array.isArray(issues) ? issues : [])
        .filter((i) => !i.pull_request)
        .map((i) => {
          let nick = '路人', text = '';
          try {
            const b = JSON.parse(i.body);
            nick = b.nick || '路人';
            text = b.text || '';
          } catch {
            text = i.body || '';
          }
          return { id: i.number, nick, text, created_at: i.created_at, state: i.state };
        });
      return send(res, 200, { comments: list }, origin);
    } catch (e) {
      return send(res, 500, { error: '读取失败' }, origin);
    }
  }

  if (req.method === 'POST') {
    if (!TOKEN) return send(res, 500, { error: '服务端未配置 GH_TOKEN' }, origin);
    let raw = '';
    for await (const c of req) raw += c;
    let data;
    try { data = JSON.parse(raw); } catch { return send(res, 400, { error: '格式错误' }, origin); }

    // 页面标识由前端放在请求体里（POST 不带查询参数），据此打标签
    const target = clean(data.page, 120) || 'home';

    const ip = req.headers['x-forwarded-for'] || 'unknown';
    if (rateLimited(ip)) return send(res, 429, { error: '太快了，稍等一下' }, origin);

    const nick = clean(data.nick, 24) || '路人';
    const text = clean(data.text, 800);
    const hp = data.hp || ''; // 蜜罐：机器人填了就静默丢弃
    if (hp) return send(res, 200, { ok: true, spoof: true }, origin);
    if (!text) return send(res, 400, { error: '内容不能为空' }, origin);

    try {
      const r = await gh(`/repos/${REPO}/issues`, {
        method: 'POST',
        body: JSON.stringify({
          title: `💬 ${target}`,
          body: JSON.stringify({ nick, text, ua: data.ua || '' }),
          labels: [LABEL + target]
        })
      });
      if (!r.ok) {
        const t = await r.text();
        return send(res, 500, { error: '提交失败', detail: t.slice(0, 200) }, origin);
      }
      const issue = await r.json();
      return send(res, 200, { ok: true, id: issue.number, nick, text, created_at: issue.created_at }, origin);
    } catch (e) {
      return send(res, 500, { error: '提交失败' }, origin);
    }
  }

  return send(res, 405, { error: '不支持的方法' }, origin);
}
