// Live aircraft position by callsign (e.g. APJ32) for 旅行手帳 — proxies free ADS-B community APIs
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"max-age=10","access-control-allow-origin":"*"}});
export async function onRequest({request}){
  const cs=(new URL(request.url).searchParams.get("cs")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
  if(!cs)return J({error:"missing cs"},400);
  const log=[];
  for(const src of[`https://api.adsb.lol/v2/callsign/${cs}`,`https://api.airplanes.live/v2/callsign/${cs}`]){
    try{const r=await fetch(src,{headers:{"user-agent":"229ciaooo-trip/1.0","accept":"application/json"}});
      if(!r.ok){log.push(new URL(src).host+" "+r.status);continue}const d=await r.json();
      return J({src:new URL(src).host,ac:(d.ac||[]).filter(a=>a.lat!=null).map(a=>({lat:a.lat,lon:a.lon,alt:a.alt_baro,gs:a.gs,track:a.track,reg:a.r,type:a.t,seen:a.seen_pos}))})}catch(e){log.push(String(e).slice(0,80))}
  }
  return J({error:"unavailable",log},502);
}
