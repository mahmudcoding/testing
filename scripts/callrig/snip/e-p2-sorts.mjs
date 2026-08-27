import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const mc = async (page, cx, cy) => { await page.mouse.move(cx,cy); await page.waitForTimeout(200);
  await page.mouse.down(); await page.waitForTimeout(100); await page.mouse.up(); await page.waitForTimeout(3000); };
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9500);
  out.truth = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/users/me/files?workspace_id=${WS}&scope=own&limit=100',{credentials:'include'});
     const j=await r.json(); const a=j.files||[];
     return {n:a.length,
       bySizeDesc:[...a].sort((x,y)=>y.size-x.size).map(f=>f.filename).slice(0,5),
       byNameAsc:[...a].sort((x,y)=>x.filename.localeCompare(y.filename)).map(f=>f.filename).slice(0,5),
       byDateDesc:[...a].sort((x,y)=>(y.created_at>x.created_at?1:-1)).map(f=>f.filename).slice(0,5)}; })()`);
  const listed = `(() => { ${VISFN}
     const m=document.querySelector('main');
     const t=(m.innerText||'').replace(/\\s+/g,' ');
     const start=t.indexOf('Favorites');
     const seg=t.slice(start>0?start:0);
     const names=(seg.match(/[\\w.\\u0400-\\u04FF-]+\\.(txt|png|zip|wav|mp4)/g)||[]);
     return [...new Set(names)].slice(0,5); })()`;
  for(const s of ['Size','Name','Date']){
    const t = await page.evaluate(`(() => { ${VISFN}
       const b=[...document.querySelector('main').querySelectorAll('button')].filter(vis)
         .find(x=>(x.innerText||'').trim()===${JSON.stringify(s)});
       if(!b) return null; const r=b.getBoundingClientRect();
       return {cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2),
               pressed:b.getAttribute('aria-pressed')}; })()`);
    if(!t){ out[s]='sort control not found'; continue; }
    await mc(page, t.cx, t.cy);
    out[s] = {pressedBefore:t.pressed, uiOrder: await page.evaluate(listed)};
  }
  return out;
};
