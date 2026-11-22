// 我的礦山：代抓證交所／櫃買即時行情（只允許報價 API）
export async function onRequest({ request, params }) {
  const path = [].concat(params.path || []).join('/');
  if (path !== 'stock/api/getStockInfo.jsp') return new Response('not allowed', { status: 403 });
  const q = new URL(request.url).search;
  const r = await fetch(`https://mis.twse.com.tw/${path}${q}`, {
    headers: { 'User-Agent': 'Mozilla/5.0', 'Referer': 'https://mis.twse.com.tw/stock/index.jsp', 'Accept': 'application/json' },
  });
  return new Response(r.body, { status: r.status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
