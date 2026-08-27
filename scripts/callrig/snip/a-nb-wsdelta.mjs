export default async ({page}) => await page.evaluate(()=>{
  const l=window.__wsLog||[]; const m=window.__wsMark||0;
  const j=l.slice(m).filter(x=>x.d && x.d[0]==='{' && !/"type":"(ping|pong)"/.test(x.d));
  const t0=j.length?j[0].t:0;
  const ty=[]; const seen={};
  for(const x of j){ let t='?'; try{ const o=JSON.parse(x.d); t=o.type|| (o.message?'meeting.message':'?'); }catch(e){}
    seen[x.dir+' '+t]=(seen[x.dir+' '+t]||0)+1; ty.push({s:Math.round((x.t-t0)/1000), dir:x.dir, t, d:x.d.slice(0,80)}); }
  return {from:m, n:j.length, counts:seen, frames:ty.slice(0,60)};
});
