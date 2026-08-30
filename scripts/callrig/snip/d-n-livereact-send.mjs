export default async ({page}) => {
  const out={};
  const b = page.locator('[data-testid="call-controls-live-reaction"]').first();
  out.found = await b.count();
  if(!out.found) return out;
  const box=await b.boundingBox(); await page.mouse.click(box.x+box.width/2,box.y+box.height/2);
  await page.waitForTimeout(2000);
  const m = await page.evaluate(()=>{
    const vis = el=>{const r=el.getBoundingClientRect(); if(r.width<1||r.height<1) return false;
      let n=el,op=1; while(n&&n!==document.documentElement){op*=parseFloat(getComputedStyle(n).opacity||'1');n=n.parentElement;} return op>0.05;};
    const cands=[...document.querySelectorAll('[data-radix-popper-content-wrapper],[role=menu],[role=dialog]')].filter(vis).filter(x=>x.dataset.testid!=='call-overlay-expanded');
    const c=cands[cands.length-1]; if(!c) return null;
    const leaves=[...c.querySelectorAll('*')].filter(e=>e.children.length===0&&(e.innerText||'').trim()&&vis(e)).map(e=>{const r=e.getBoundingClientRect();return {t:e.innerText.trim(),x:Math.round(r.x+r.width/2),y:Math.round(r.y+r.height/2)};});
    return {n:leaves.length, leaves};});
  out.menu = m;
  if(m && m.n){ const idx = Math.min(+(process.env.QA_EMOJI_IDX||1), m.n-1); out.sent=m.leaves[idx].t; out.at=Date.now();
    await page.mouse.click(m.leaves[idx].x, m.leaves[idx].y); await page.waitForTimeout(2000); }
  return out;
};
