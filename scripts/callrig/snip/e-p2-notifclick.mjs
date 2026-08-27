import {VISFN, WS, BASE} from './e-p2-helpers.mjs';
const SNAP = `(() => { ${VISFN}
   const dlgs=[...document.querySelectorAll('[role=dialog],[role=alertdialog]')]
     .filter(e=>{const r=e.getBoundingClientRect(); return r.width>200&&r.height>100;})
     .map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,70));
   return {url:location.pathname+location.search, nDlg:dlgs.length, dlgs}; })()`;
export default async ({page}) => {
  const out={};
  await page.goto(BASE+'/w/'+WS+'/files', {waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  out.notifs = await page.evaluate(`(async () => {
     const r=await fetch('/api/v1/notifications?limit=20',{credentials:'include'});
     const j=await r.json(); const a=j.notifications||j.data||j.items||[];
     return {n:a.length, list:a.slice(0,4).map(x=>({t:x.title, cat:x.category, ev:x.event_type,
       res:String(x.resource_id||'').slice(-6), body:String(x.body||'').slice(0,40)}))}; })()`);
  const bell = page.locator('button[aria-label^="Notifications"]').first();
  const bb = await bell.boundingBox();
  await page.mouse.move(bb.x+bb.width/2, bb.y+bb.height/2); await page.waitForTimeout(250);
  await page.mouse.down(); await page.waitForTimeout(110); await page.mouse.up();
  await page.waitForTimeout(3500);
  const tgt = await page.evaluate(`(() => { ${VISFN}
     const p=[...document.querySelectorAll('[role=dialog],[role=menu],[class*=popover],[class*=Popover]')]
       .filter(e=>e.getBoundingClientRect().width>200).pop();
     if(!p) return null;
     const c=[...p.querySelectorAll('[role=option],[role=menuitem],li,button')].filter(vis)
       .filter(e=>/Invite seam|Meeting invitation|invit/i.test(e.innerText||''));
     if(!c.length) return {none:true, rows:[...p.querySelectorAll('[role=option],li')].filter(vis)
       .map(e=>(e.innerText||'').replace(/\\s+/g,' ').slice(0,40)).slice(0,4)};
     const r=c[0].getBoundingClientRect();
     return {tx:(c[0].innerText||'').replace(/\\s+/g,' ').slice(0,50), cx:Math.round(r.x+r.width/2), cy:Math.round(r.y+r.height/2)}; })()`);
  out.target = tgt;
  if(tgt && !tgt.none){
    const frames=[]; frames.push({t:'pre', ...(await page.evaluate(SNAP))});
    await page.mouse.move(tgt.cx,tgt.cy); await page.waitForTimeout(600);
    out.pointerOn = await page.evaluate(`(() => { const e=document.elementFromPoint(${tgt.cx},${tgt.cy});
       return {hit:!!e, txt:e?(e.innerText||e.textContent||'').replace(/\\s+/g,' ').slice(0,36):''}; })()`);
    await page.mouse.down(); await page.waitForTimeout(120); await page.mouse.up();
    for(let i=0;i<16;i++){ await page.waitForTimeout(300); frames.push({t:(i+1)*300, ...(await page.evaluate(SNAP))}); }
    const key=f=>JSON.stringify([f.url,f.nDlg,f.dlgs]);
    const kept=[]; let last=null;
    for(const f of frames){ const k=key(f); if(k!==last){kept.push(f); last=k;} }
    out.trajectory=kept;
  }
  return out;
};
