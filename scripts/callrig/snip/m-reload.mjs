import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.reload({waitUntil:'domcontentloaded'});
  await page.waitForTimeout(9000);
  await page.evaluate(DOM);
  const sb = await page.$('button[aria-label="Side Rooms"]');
  if (sb && (await sb.getAttribute('aria-pressed'))!=='true') { const bb=await sb.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2500); }
  return await page.evaluate(async ()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const root=document.querySelector('[data-testid="call-overlay-expanded"]')||document.body;
    let me=null; try{me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();}catch(e){}
    let rooms=null; try{rooms=await (await fetch('/api/v1/meeting/V4P254PE9AE0LTC/breakout-rooms',{credentials:'include'})).json();}catch(e){}
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    return {who:me&&me.email, url:location.pathname, vis:document.visibilityState,
      panel: p?(p.innerText||'').replace(/\s+/g,' ').trim():null,
      panelBtns: p?[...p.querySelectorAll('button')].filter(vis).map(b=>(b.getAttribute('aria-label')||b.textContent||'').replace(/\s+/g,' ').trim()):[],
      rooms: rooms && rooms.rooms && rooms.rooms.map(r=>({name:r.name, vis:r.visibility, entry:r.entry_mode, n:r.participant_count}))};
  });
};
