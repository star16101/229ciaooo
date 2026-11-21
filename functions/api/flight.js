// Live aircraft position by callsign (e.g. APJ32) for 旅行手帳 — tries several free ADS-B community APIs server-side (they lack CORS)
const J=(o,s=200)=>new Response(JSON.stringify(o),{status:s,headers:{"content-type":"application/json; charset=utf-8","cache-control":"max-age=15","access-control-allow-origin":"*"}});
const norm=a=>({lat:a.lat,lon:a.lon,alt:a.alt_baro??a.alt,gs:a.gs,track:a.track,reg:a.r,type:a.t});
export async function onRequest({request}){
  const u=new URL(request.url),cs=(u.searchParams.get("cs")||"").toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,8);
  if(!cs)return J({error:"missing cs"},400);
  const bb=(u.searchParams.get("bb")||"").split(",").map(Number);const log=[];
  const H={"user-agent":"Mozilla/5.0 (229ciaooo trip notebook)","accept":"application/json"};
  for(const src of[`https://opendata.adsb.fi/api/v2/callsign/${cs}`,`https://api.adsb.lol/v2/callsign/${cs}`,`https://api.adsb.one/v2/callsign/${cs}`,`https://api.airplanes.live/v2/callsign/${cs}`]){
    try{const r=await fetch(src,{headers:H});if(!r.ok){log.push(new URL(src).host+" "+r.status);continue}
      const d=await r.json();const ac=(d.ac||d.aircraft||[]).filter(a=>a.lat!=null).map(norm);return J({src:new URL(src).host,ac})}catch(e){log.push(new URL(src).host+" "+String(e).slice(0,60))}
  }
  if(bb.length===4&&bb.every(isFinite)){
    try{const r=await fetch(`https://opensky-network.org/api/states/all?lamin=${bb[0]}&lomin=${bb[1]}&lamax=${bb[2]}&lomax=${bb[3]}`,{headers:H});
      if(r.ok){const d=await r.json();const s=(d.states||[]).filter(x=>(x[1]||"").trim()===cs);
        return J({src:"opensky",ac:s.filter(x=>x[6]!=null).map(x=>({lat:x[6],lon:x[5],alt:x[8]?"ground":Math.round((x[13]??x[7]??0)/0.3048),gs:(x[9]||0)*1.94384,track:x[10]}))})}
      log.push("opensky "+r.status)}catch(e){log.push("opensky "+String(e).slice(0,60))}
  }
  return J({error:"unavailable",log},502);
}
