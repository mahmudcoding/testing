import { DOM } from './lib.mjs';
export default async ({page}) => {
  await page.evaluate(DOM);
  const t = await page.$('[data-testid="call-controls-people-toggle"]');
  const out = {toggle: !!t};
  if (t) { out.pressed = await t.getAttribute('aria-pressed');
    if (out.pressed !== 'true') { const bb=await t.boundingBox(); await page.mouse.click(bb.x+bb.width/2,bb.y+bb.height/2); await page.waitForTimeout(2200); } }
  out.res = await page.evaluate(async ()=>{
    const q=window.__qa; const vis=(e)=>q.vis(e)||q.boxVis(e);
    const T=(e)=>(e.innerText||'').replace(/\s+/g,' ').trim();
    const p=[...document.querySelectorAll('[data-testid="call-side-panel-slot"]')].filter(vis)[0];
    let me=null; try{me=await (await fetch('/api/v1/auth/me',{credentials:'include'})).json();}catch(e){}
    const acts=[...document.querySelectorAll('button[aria-label="Participant actions"]')].filter(vis);
    return {who: me&&me.email, panel: p?T(p):null, nRowMenus: acts.length,
      tiles: [...document.querySelectorAll('[data-testid*="tile"],[class*="tile"]')].filter(vis).length,
      names: [...new Set([...document.querySelectorAll('*')].filter(e=>!e.children.length&&vis(e))
        .map(e=>T(e)).filter(t=>/^QA (Owner|Alice|Bob|Carol|Dave|Admin|Guest)( \(you\))?$/.test(t)))]};
  });
  return out;
};
