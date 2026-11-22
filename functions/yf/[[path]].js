// 我的礦山：代抓 Yahoo Finance 公開行情（只允許報價與搜尋）
const ALLOW = [/^v8\/finance\/chart\/[^/]+$/, /^v1\/finance\/search$/];
export async function onRequest({ request, params }) {
  const path = [].concat(params.path || []).join('/');
  if (!ALLOW.some(r => r.test(path))) return new Response('not allowed', { status: 403 });
  const q = new URL(request.url).search;
  const r = await fetch(`https://query1.finance.yahoo.com/${path}${q}`, {
    headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1', 'Accept': 'application/json' },
  });
  return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
