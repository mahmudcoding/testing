import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const SNAP = `(() => { ${VISFN}
   const nav=document.querySelector('nav')||document.body;
   const rows=[...nav.querySelectorAll('a,button,[role=treeitem],li')].filter(vis)
     .map(e=>(e.innerText||'').replace(/\\s+/g,' ').trim())
     .filter(t=>/qa-general|qa-private|qa-empty|QA Bob/i.test(t)).slice(0,6);
   return {rows, title:document.title, url:location.pathname}; })()`;
export default async ({page}) => {
  await page.goto(BASE+'/w/'+WS+'/calendar', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  const frames=[]; const t0=Date.now();
  for(let i=0;i<120;i++){
    let f=null;
    try { f = await page.evaluate(SNAP); } catch(e) { f = {err:String(e.message||e).slice(0,40)}; }
    frames.push({ms:Date.now()-t0, ...f});
    await page.waitForTimeout(300);
  }
  const key=f=>JSON.stringify([f.rows,f.title,f.err]);
  const kept=[]; let last=null;
  for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
  return {nFrames:frames.length, spanMs:frames[frames.length-1].ms, nChanges:kept.length, changes:kept.slice(0,14)};
};
